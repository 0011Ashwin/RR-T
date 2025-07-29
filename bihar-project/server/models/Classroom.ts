import db from '../database/index.js';

export interface Classroom {
  id?: number;
  name: string;
  room_number: string;
  capacity: number;
  floor: number;
  building: string;
  type: 'lecture' | 'lab' | 'seminar';
  features?: string[];
  is_active?: boolean;
  department_id?: number;
  created_at?: string;
  updated_at?: string;
}

export class ClassroomModel {
  static async getAll() {
    return db('classrooms')
      .select('*')
      .then(classrooms => {
        return classrooms.map(classroom => ({
          ...classroom,
          features: classroom.features ? JSON.parse(classroom.features as string) : [],
        }));
      });
  }

  static async getById(id: number) {
    return db('classrooms')
      .where({ id })
      .first()
      .then(classroom => {
        if (!classroom) return null;
        return {
          ...classroom,
          features: classroom.features ? JSON.parse(classroom.features as string) : [],
        };
      });
  }

  static async getByDepartment(departmentId: number) {
    return db('classrooms')
      .where({ department_id: departmentId })
      .select('*')
      .then(classrooms => {
        return classrooms.map(classroom => ({
          ...classroom,
          features: classroom.features ? JSON.parse(classroom.features as string) : [],
        }));
      });
  }

  static async create(classroom: Classroom) {
    const classroomToInsert = {
      ...classroom,
      features: classroom.features ? JSON.stringify(classroom.features) : null,
    };
    
    const [id] = await db('classrooms').insert(classroomToInsert);
    return this.getById(id);
  }

  static async update(id: number, classroom: Partial<Classroom>) {
    const classroomToUpdate: any = { ...classroom };
    
    if (classroom.features) {
      classroomToUpdate.features = JSON.stringify(classroom.features);
    }
    
    await db('classrooms').where({ id }).update(classroomToUpdate);
    return this.getById(id);
  }

  static async delete(id: number) {
    return db('classrooms').where({ id }).delete();
  }

  static async getAvailable(date: string, startTime: string, endTime: string, dayOfWeek: number) {
    // Get all classrooms
    const allClassrooms = await this.getAll();
    
    // Get all bookings for the specified date and time
    const bookings = await db('classroom_bookings')
      .where({
        booking_date: date,
        day_of_week: dayOfWeek,
      })
      .whereRaw(
        '(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?)',
        [endTime, startTime, endTime, startTime, startTime, endTime]
      )
      .select('classroom_id');
    
    // Get IDs of booked classrooms
    const bookedClassroomIds = bookings.map(booking => booking.classroom_id);
    
    // Filter out booked classrooms
    return allClassrooms.filter(classroom => 
      !bookedClassroomIds.includes(classroom.id) && classroom.is_active
    );
  }
}