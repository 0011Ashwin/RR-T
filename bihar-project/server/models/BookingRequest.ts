import db from '../database/index.js';
import { BookingRequest } from '../../shared/resource-types';

export class BookingRequestModel {
  static async getAll() {
    return db('booking_requests').select('*');
  }

  static async getById(id: string) {
    return db('booking_requests').where({ id }).first();
  }

  static async getByRequesterDepartment(department: string) {
    return db('booking_requests').where({ requesterDepartment: department }).select('*');
  }

  static async getByTargetDepartment(department: string) {
    return db('booking_requests').where({ targetDepartment: department }).select('*');
  }

  static async getByStatus(status: BookingRequest['status']) {
    return db('booking_requests').where({ status }).select('*');
  }

  static async create(bookingRequest: Omit<BookingRequest, 'id'>) {
    // Generate a unique ID
    const id = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const newRequest = {
      id,
      ...bookingRequest,
      requestDate: bookingRequest.requestDate || new Date().toISOString(),
      status: bookingRequest.status || 'pending'
    };
    
    await db('booking_requests').insert(newRequest);
    return this.getById(id);
  }

  static async updateStatus(id: string, updates: {
    status: BookingRequest['status'];
    notes?: string;
    approvedBy?: string;
    responseDate?: string;
    vcApproved?: boolean;
    vcResponseDate?: string;
  }) {
    // If vcApproved is being set, add the current timestamp as vcResponseDate
    if (updates.vcApproved !== undefined && !updates.vcResponseDate) {
      updates.vcResponseDate = new Date().toISOString();
    }
    
    await db('booking_requests').where({ id }).update(updates);
    return this.getById(id);
  }

  static async delete(id: string) {
    return db('booking_requests').where({ id }).delete();
  }

  static async checkForConflicts(resourceId: string, timeSlotId: string, dayOfWeek: number, date?: string) {
    const query = db('booking_requests')
      .where({
        targetResourceId: resourceId,
        timeSlotId: timeSlotId,
        dayOfWeek: dayOfWeek,
        status: 'approved'
      });
    
    if (date) {
      query.where('requestDate', '<=', date);
    }
    
    return query.select('*');
  }

  // Initialize the database table if it doesn't exist
  static async initTable() {
    const exists = await db.schema.hasTable('booking_requests');
    
    if (!exists) {
      await db.schema.createTable('booking_requests', (table) => {
        table.string('id').primary();
        table.string('requesterId').notNullable();
        table.string('requesterDepartment').notNullable();
        table.string('targetResourceId').notNullable();
        table.string('targetDepartment').notNullable();
        table.string('timeSlotId').notNullable();
        table.integer('dayOfWeek').notNullable();
        table.string('courseName').notNullable();
        table.string('purpose');
        table.integer('expectedAttendance').notNullable();
        table.string('requestDate').notNullable();
        table.string('status').defaultTo('pending');
        table.string('approvedBy');
        table.string('responseDate');
        table.string('notes');
        table.boolean('vcApproved').defaultTo(false);
        table.string('vcResponseDate');
        table.timestamps(true, true);
      });
      
      console.log('Created booking_requests table');
    }
  }
}