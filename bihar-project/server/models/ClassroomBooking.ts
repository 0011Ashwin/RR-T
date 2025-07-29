import db from '../database/index.js';

export interface ClassroomBooking {
  id?: number;
  classroom_id: number;
  start_time: string;
  end_time: string;
  department_id?: number;
  course?: string;
  instructor?: string;
  day_of_week: number; // 1-7 for Monday-Sunday
  booking_date: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomBookingWithDetails extends ClassroomBooking {
  classroom_name?: string;
  classroom_room_number?: string;
  department_name?: string;
}

export class ClassroomBookingModel {
  static async getAll() {
    return db('classroom_bookings').select('*');
  }

  static async getById(id: number) {
    return db('classroom_bookings').where({ id }).first();
  }

  static async getByClassroom(classroomId: number) {
    return db('classroom_bookings').where({ classroom_id: classroomId }).select('*');
  }

  static async getByDepartment(departmentId: number) {
    return db('classroom_bookings').where({ department_id: departmentId }).select('*');
  }

  static async getByDate(date: string) {
    return db('classroom_bookings').where({ booking_date: date }).select('*');
  }

  static async getByDateRange(startDate: string, endDate: string) {
    return db('classroom_bookings')
      .whereBetween('booking_date', [startDate, endDate])
      .select('*');
  }

  static async create(booking: ClassroomBooking) {
    // Check for conflicts
    const conflicts = await this.checkBookingConflicts(booking);
    if (conflicts.length > 0) {
      throw new Error('There are conflicts with existing bookings');
    }

    const [id] = await db('classroom_bookings').insert(booking);
    return this.getById(id);
  }

  static async update(id: number, booking: Partial<ClassroomBooking>) {
    // If time, day, or date is being updated, check for conflicts
    if (booking.day_of_week || booking.start_time || booking.end_time || booking.booking_date || booking.classroom_id) {
      const currentBooking = await db('classroom_bookings').where({ id }).first();
      const bookingToCheck = { ...currentBooking, ...booking };
      const conflicts = await this.checkBookingConflicts(bookingToCheck as ClassroomBooking, id);
      if (conflicts.length > 0) {
        throw new Error('There are conflicts with existing bookings');
      }
    }

    await db('classroom_bookings').where({ id }).update(booking);
    return this.getById(id);
  }

  static async delete(id: number) {
    return db('classroom_bookings').where({ id }).delete();
  }

  static async checkBookingConflicts(booking: ClassroomBooking, excludeBookingId?: number) {
    return db('classroom_bookings')
      .where({
        classroom_id: booking.classroom_id,
        booking_date: booking.booking_date,
        day_of_week: booking.day_of_week,
      })
      .whereRaw(
        '(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?)',
        [booking.end_time, booking.start_time, booking.end_time, booking.start_time, booking.start_time, booking.end_time]
      )
      .whereNot('id', excludeBookingId || 0)
      .select('*');
  }

  static async getWithDetails() {
    return db('classroom_bookings')
      .join('classrooms', 'classroom_bookings.classroom_id', '=', 'classrooms.id')
      .leftJoin('departments', 'classroom_bookings.department_id', '=', 'departments.id')
      .select(
        'classroom_bookings.*',
        'classrooms.name as classroom_name',
        'classrooms.room_number as classroom_room_number',
        'departments.name as department_name'
      );
  }

  static async getDetailsByDate(date: string) {
    return db('classroom_bookings')
      .join('classrooms', 'classroom_bookings.classroom_id', '=', 'classrooms.id')
      .leftJoin('departments', 'classroom_bookings.department_id', '=', 'departments.id')
      .where('classroom_bookings.booking_date', date)
      .select(
        'classroom_bookings.*',
        'classrooms.name as classroom_name',
        'classrooms.room_number as classroom_room_number',
        'departments.name as department_name'
      );
  }

  static async getDetailsByDateAndDepartment(date: string, departmentId: number) {
    return db('classroom_bookings')
      .join('classrooms', 'classroom_bookings.classroom_id', '=', 'classrooms.id')
      .leftJoin('departments', 'classroom_bookings.department_id', '=', 'departments.id')
      .where({
        'classroom_bookings.booking_date': date,
        'classroom_bookings.department_id': departmentId,
      })
      .select(
        'classroom_bookings.*',
        'classrooms.name as classroom_name',
        'classrooms.room_number as classroom_room_number',
        'departments.name as department_name'
      );
  }

  static async getByDateRangeAndDepartment(startDate: string, endDate: string, departmentId: number) {
    return db('classroom_bookings')
      .join('classrooms', 'classroom_bookings.classroom_id', '=', 'classrooms.id')
      .leftJoin('departments', 'classroom_bookings.department_id', '=', 'departments.id')
      .whereBetween('classroom_bookings.booking_date', [startDate, endDate])
      .where('classroom_bookings.department_id', departmentId)
      .select(
        'classroom_bookings.*',
        'classrooms.name as classroom_name',
        'classrooms.room_number as classroom_room_number',
        'departments.name as department_name'
      );
  }
}