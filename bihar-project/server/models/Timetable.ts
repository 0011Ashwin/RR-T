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
    const timetables = await db('timetables').select('*');
    return timetables.map(timetable => ({
      ...timetable,
      academicYear: timetable.academic_year,
      numberOfStudents: timetable.number_of_students,
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
    // Check for conflicts
    const conflicts = await this.checkEntryConflicts(entry);
    if (conflicts.length > 0) {
      throw new Error('There are conflicts with existing entries');
    }

    const [id] = await db('timetable_entries').insert(entry);
    return db('timetable_entries').where({ id }).first();
  }

  static async updateEntry(id: number, entry: Partial<TimetableEntry>) {
    // If time or day is being updated, check for conflicts
    if (entry.day_of_week || entry.start_time || entry.end_time) {
      const currentEntry = await db('timetable_entries').where({ id }).first();
      const entryToCheck = { ...currentEntry, ...entry };
      const conflicts = await this.checkEntryConflicts(entryToCheck as TimetableEntry, id);
      if (conflicts.length > 0) {
        throw new Error('There are conflicts with existing entries');
      }
    }

    await db('timetable_entries').where({ id }).update(entry);
    return db('timetable_entries').where({ id }).first();
  }

  static async deleteEntry(id: number) {
    return db('timetable_entries').where({ id }).delete();
  }

  static async checkEntryConflicts(entry: TimetableEntry, excludeEntryId?: number) {
    // Check for faculty conflicts
    const facultyConflicts = await db('timetable_entries')
      .where({
        faculty_id: entry.faculty_id,
        day_of_week: entry.day_of_week,
      })
      .whereRaw(
        '(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?)',
        [entry.end_time, entry.start_time, entry.end_time, entry.start_time, entry.start_time, entry.end_time]
      )
      .whereNot('id', excludeEntryId || 0)
      .select('*');

    // Check for classroom conflicts
    const classroomConflicts = await db('timetable_entries')
      .where({
        classroom_id: entry.classroom_id,
        day_of_week: entry.day_of_week,
      })
      .whereRaw(
        '(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?)',
        [entry.end_time, entry.start_time, entry.end_time, entry.start_time, entry.start_time, entry.end_time]
      )
      .whereNot('id', excludeEntryId || 0)
      .select('*');

    return [...facultyConflicts, ...classroomConflicts];
  }
}