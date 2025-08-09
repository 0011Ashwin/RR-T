import db from '../database/index.js';

export interface Timetable {
  id?: number;
  name: string;
  semester: number;
  department_id: number;
  section?: string;
  academic_year: string;
  number_of_students?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimetableEntry {
  id?: number;
  timetable_id: number;
  subject_id: number;
  faculty_id: number;
  classroom_id: number;
  day_of_week: number; // 1-7 for Monday-Sunday
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimetableEntryWithDetails extends TimetableEntry {
  subject_name?: string;
  subject_code?: string;
  faculty_name?: string;
  classroom_name?: string;
  classroom_room_number?: string;
}

export class TimetableModel {
  static async getAll() {
    const timetables = await db('timetables')
      .join('departments', 'timetables.department_id', 'departments.id')
      .select('timetables.*', 'departments.name as department_name')
      .orderBy('timetables.created_at', 'desc');
    
    return timetables.map(timetable => ({
      ...timetable,
      academicYear: timetable.academic_year,
      numberOfStudents: timetable.number_of_students,
      department: timetable.department_name
    }));
  }

  static async getById(id: number) {
    const timetable = await db('timetables').where({ id }).first();
    if (!timetable) return null;
    
    return {
      ...timetable,
      academicYear: timetable.academic_year,
      numberOfStudents: timetable.number_of_students,
    };
  }

  static async getByDepartment(departmentId: number) {
    const timetables = await db('timetables').where({ department_id: departmentId }).select('*');
    return timetables.map(timetable => ({
      ...timetable,
      academicYear: timetable.academic_year,
      numberOfStudents: timetable.number_of_students,
    }));
  }

  static async getByDepartmentName(departmentName: string) {
    const timetables = await db('timetables')
      .join('departments', 'timetables.department_id', 'departments.id')
      .where('departments.name', departmentName)
      .select('timetables.*', 'departments.name as department_name');
    
    return timetables.map(timetable => ({
      ...timetable,
      academicYear: timetable.academic_year,
      numberOfStudents: timetable.number_of_students,
    }));
  }

  static async create(timetable: Timetable) {
    const [id] = await db('timetables').insert(timetable);
    return this.getById(id);
  }

  static async update(id: number, timetable: Partial<Timetable>) {
    await db('timetables').where({ id }).update(timetable);
    return this.getById(id);
  }

  static async delete(id: number) {
    // Delete all entries first
    await db('timetable_entries').where({ timetable_id: id }).delete();
    // Then delete the timetable
    return db('timetables').where({ id }).delete();
  }

  static async getWithEntries(id: number) {
    const timetable = await this.getById(id);
    if (!timetable) return null;

    const entries = await db('timetable_entries')
      .join('subjects', 'timetable_entries.subject_id', '=', 'subjects.id')
      .join('faculty', 'timetable_entries.faculty_id', '=', 'faculty.id')
      .join('classrooms', 'timetable_entries.classroom_id', '=', 'classrooms.id')
      .where('timetable_entries.timetable_id', id)
      .select(
        'timetable_entries.*',
        'timetable_entries.classroom_id as resourceId', // Add resourceId mapping since IDs are synchronized
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'faculty.name as faculty_name',
        'classrooms.name as classroom_name',
        'classrooms.room_number as classroom_room_number'
      );

    return {
      ...timetable,
      academicYear: timetable.academic_year,
      numberOfStudents: timetable.number_of_students,
      entries,
    };
  }

  static async addEntry(entry: TimetableEntry) {
    try {
      console.log('Adding timetable entry:', entry);
      
      // Validate required fields
      if (!entry.timetable_id || !entry.subject_id || !entry.faculty_id || !entry.classroom_id) {
        throw new Error('Missing required fields for timetable entry');
      }

      // Check for conflicts
      const conflictResult = await this.checkEntryConflicts(entry);
      if (conflictResult.hasConflicts) {
        console.log('Entry conflicts found:', conflictResult);
        
        // Create detailed conflict messages
        let conflictMessages = [];
        
        if (conflictResult.facultyConflicts.length > 0) {
          conflictResult.facultyConflicts.forEach(conflict => {
            conflictMessages.push(
              `Faculty is already teaching another session on ${conflict.day_of_week} from ${conflict.start_time} to ${conflict.end_time}`
            );
          });
        }
        
        if (conflictResult.classroomConflicts.length > 0) {
          conflictResult.classroomConflicts.forEach(conflict => {
            conflictMessages.push(
              `Classroom is already occupied on ${conflict.day_of_week} from ${conflict.start_time} to ${conflict.end_time}`
            );
          });
        }
        
        const conflictMessage = `Cannot create session due to conflicts:\n• ${conflictMessages.join('\n• ')}`;
        throw new Error(conflictMessage);
      }

      console.log('No conflicts found, inserting entry...');
      const [id] = await db('timetable_entries').insert(entry);
      console.log('Entry inserted with ID:', id);
      
      const newEntry = await db('timetable_entries').where({ id }).first();
      console.log('Retrieved new entry:', newEntry);
      
      return newEntry;
    } catch (error) {
      console.error('Error in addEntry:', error);
      throw error;
    }
  }

  static async updateEntry(id: number, entry: Partial<TimetableEntry>) {
    // If time or day is being updated, check for conflicts
    if (entry.day_of_week || entry.start_time || entry.end_time) {
      const currentEntry = await db('timetable_entries').where({ id }).first();
      const entryToCheck = { ...currentEntry, ...entry };
      const conflictResult = await this.checkEntryConflicts(entryToCheck as TimetableEntry, id);
      if (conflictResult.hasConflicts) {
        // Create detailed conflict messages
        let conflictMessages = [];
        
        if (conflictResult.facultyConflicts.length > 0) {
          conflictResult.facultyConflicts.forEach(conflict => {
            conflictMessages.push(
              `Faculty is already teaching another session on ${conflict.day_of_week} from ${conflict.start_time} to ${conflict.end_time}`
            );
          });
        }
        
        if (conflictResult.classroomConflicts.length > 0) {
          conflictResult.classroomConflicts.forEach(conflict => {
            conflictMessages.push(
              `Classroom is already occupied on ${conflict.day_of_week} from ${conflict.start_time} to ${conflict.end_time}`
            );
          });
        }
        
        const conflictMessage = `Cannot update session due to conflicts:\n• ${conflictMessages.join('\n• ')}`;
        throw new Error(conflictMessage);
      }
    }

    await db('timetable_entries').where({ id }).update(entry);
    return db('timetable_entries').where({ id }).first();
  }

  static async deleteEntry(id: number) {
    return db('timetable_entries').where({ id }).delete();
  }

  static async checkEntryConflicts(entry: TimetableEntry, excludeEntryId?: number) {
    console.log('Checking conflicts for entry:', entry);
    
    // Simple and reliable time overlap check: NOT (end1 <= start2 OR start1 >= end2)
    // This means: overlap exists if NOT (no overlap)
    const timeOverlapCondition = `NOT (end_time <= '${entry.start_time}' OR start_time >= '${entry.end_time}')`;
    
    // Check for faculty conflicts with detailed information
    const facultyConflicts = await db('timetable_entries')
      .join('faculty', 'timetable_entries.faculty_id', '=', 'faculty.id')
      .join('subjects', 'timetable_entries.subject_id', '=', 'subjects.id')
      .join('classrooms', 'timetable_entries.classroom_id', '=', 'classrooms.id')
      .where({
        'timetable_entries.faculty_id': entry.faculty_id,
        'timetable_entries.day_of_week': entry.day_of_week,
      })
      .whereRaw(timeOverlapCondition)
      .whereNot('timetable_entries.id', excludeEntryId || 0)
      .select(
        'timetable_entries.*',
        'faculty.name as faculty_name',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classrooms.name as classroom_name'
      );

    // Check for classroom conflicts with detailed information
    const classroomConflicts = await db('timetable_entries')
      .join('faculty', 'timetable_entries.faculty_id', '=', 'faculty.id')
      .join('subjects', 'timetable_entries.subject_id', '=', 'subjects.id')
      .join('classrooms', 'timetable_entries.classroom_id', '=', 'classrooms.id')
      .where({
        'timetable_entries.classroom_id': entry.classroom_id,
        'timetable_entries.day_of_week': entry.day_of_week,
      })
      .whereRaw(timeOverlapCondition)
      .whereNot('timetable_entries.id', excludeEntryId || 0)
      .select(
        'timetable_entries.*',
        'faculty.name as faculty_name',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classrooms.name as classroom_name'
      );

    console.log('Faculty conflicts found:', facultyConflicts.length);
    console.log('Classroom conflicts found:', classroomConflicts.length);
    
    // Return conflicts with detailed information
    return {
      hasConflicts: facultyConflicts.length > 0 || classroomConflicts.length > 0,
      facultyConflicts,
      classroomConflicts,
      totalConflicts: facultyConflicts.length + classroomConflicts.length
    };
  }
}