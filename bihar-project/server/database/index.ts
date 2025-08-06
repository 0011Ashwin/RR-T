import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration - point to data directory
const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: path.join(__dirname, '..', '..', 'data', 'bihar_university.sqlite'),
  },
  useNullAsDefault: true,
});

// Initialize database
export async function initializeDatabase() {
  // Create tables if they don't exist
  const tablesExist = await Promise.all([
    db.schema.hasTable('colleges'),
    db.schema.hasTable('departments'),
    db.schema.hasTable('hods'),
    db.schema.hasTable('classrooms'),
    db.schema.hasTable('faculty'),
    db.schema.hasTable('subjects'),
    db.schema.hasTable('timetables'),
    db.schema.hasTable('timetable_entries'),
    db.schema.hasTable('resources'),
    db.schema.hasTable('classroom_bookings'),
    db.schema.hasTable('booking_requests'),
    db.schema.hasTable('resource_requests'),
  ]);

  if (!tablesExist[0]) {
    await db.schema.createTable('colleges', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('code').notNullable().unique();
      table.string('address');
      table.string('principal_name');
      table.string('principal_email');
      table.string('phone');
      table.integer('university_id').unsigned();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[1]) {
    await db.schema.createTable('departments', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('code').notNullable().unique();
      table.string('hod_name');
      table.string('hod_email');
      table.integer('college_id').unsigned();
      table.foreign('college_id').references('colleges.id');
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[2]) {
    await db.schema.createTable('hods', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('designation').notNullable();
      table.string('employee_id').notNullable().unique();
      table.string('phone');
      table.integer('department_id').unsigned().notNullable();
      table.foreign('department_id').references('departments.id');
      table.integer('college_id').unsigned();
      table.foreign('college_id').references('colleges.id');
      table.string('join_date').notNullable();
      table.string('experience');
      table.string('avatar');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[3]) {
    await db.schema.createTable('classrooms', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('room_number').notNullable();
      table.integer('capacity').notNullable();
      table.integer('floor').notNullable();
      table.string('building').notNullable();
      table.string('type').notNullable(); // 'lecture', 'lab', 'seminar'
      table.json('features'); // JSON array of features
      table.boolean('is_active').defaultTo(true);
      table.integer('department_id').unsigned();
      table.foreign('department_id').references('departments.id');
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[4]) {
    await db.schema.createTable('faculty', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('designation');
      table.integer('department_id').unsigned();
      table.foreign('department_id').references('departments.id');
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[5]) {
    await db.schema.createTable('subjects', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('code').notNullable().unique();
      table.integer('credits').notNullable();
      table.string('type').notNullable(); // 'lecture', 'practical'
      table.integer('department_id').unsigned();
      table.foreign('department_id').references('departments.id');
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[6]) {
    await db.schema.createTable('timetables', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.integer('semester').notNullable();
      table.integer('department_id').unsigned();
      table.foreign('department_id').references('departments.id');
      table.string('section');
      table.string('academic_year').notNullable();
      table.integer('number_of_students').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Check if number_of_students column exists, if not add it
  const hasNumberOfStudentsColumn = await db.schema.hasColumn('timetables', 'number_of_students');
  if (!hasNumberOfStudentsColumn) {
    await db.schema.table('timetables', (table) => {
      table.integer('number_of_students').defaultTo(0);
    });
  }

  if (!tablesExist[7]) {
    await db.schema.createTable('timetable_entries', (table) => {
      table.increments('id').primary();
      table.integer('timetable_id').unsigned().notNullable();
      table.foreign('timetable_id').references('timetables.id').onDelete('CASCADE');
      table.integer('subject_id').unsigned().notNullable();
      table.foreign('subject_id').references('subjects.id');
      table.integer('faculty_id').unsigned().notNullable();
      table.foreign('faculty_id').references('faculty.id');
      table.integer('classroom_id').unsigned().notNullable();
      table.foreign('classroom_id').references('classrooms.id');
      table.integer('day_of_week').notNullable(); // 1-7 for Monday-Sunday
      table.string('start_time').notNullable();
      table.string('end_time').notNullable();
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[8]) {
    await db.schema.createTable('resources', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('type').notNullable(); // 'classroom', 'lab', 'equipment'
      table.integer('capacity').nullable();
      table.integer('department_id').unsigned();
      table.foreign('department_id').references('departments.id');
      table.string('building');
      table.integer('floor');
      table.string('location');
      table.json('equipment'); // JSON array of equipment
      table.json('facilities'); // JSON array of facilities
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[9]) {
    await db.schema.createTable('classroom_bookings', (table) => {
      table.increments('id').primary();
      table.integer('classroom_id').unsigned().notNullable();
      table.foreign('classroom_id').references('classrooms.id');
      table.string('start_time').notNullable();
      table.string('end_time').notNullable();
      table.integer('department_id').unsigned();
      table.foreign('department_id').references('departments.id');
      table.string('course');
      table.string('instructor');
      table.integer('day_of_week').notNullable(); // 1-7 for Monday-Sunday
      table.date('booking_date').notNullable();
      table.string('status').defaultTo('confirmed'); // 'pending', 'confirmed', 'cancelled'
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[10]) {
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
      table.timestamps(true, true);
    });
  }

  if (!tablesExist[11]) {
    await db.schema.createTable('resource_requests', (table) => {
      table.increments('id').primary();
      table.integer('requester_hod_id').unsigned().notNullable();
      table.foreign('requester_hod_id').references('hods.id');
      table.integer('requester_department_id').unsigned().notNullable();
      table.foreign('requester_department_id').references('departments.id');
      table.integer('target_resource_id').unsigned().notNullable();
      table.foreign('target_resource_id').references('resources.id');
      table.integer('target_department_id').unsigned().notNullable();
      table.foreign('target_department_id').references('departments.id');
      table.string('requested_date').notNullable();
      table.string('start_time').notNullable();
      table.string('end_time').notNullable();
      table.string('purpose').notNullable();
      table.string('course_name');
      table.integer('expected_attendance').notNullable();
      table.text('additional_requirements');
      table.string('status').defaultTo('pending'); // 'pending', 'approved', 'rejected', 'cancelled'
      table.integer('approved_by_hod_id').unsigned();
      table.foreign('approved_by_hod_id').references('hods.id');
      table.string('approved_at');
      table.text('rejection_reason');
      table.text('notes');
      table.string('priority').defaultTo('medium'); // 'low', 'medium', 'high', 'urgent'
      table.boolean('is_recurring').defaultTo(false);
      table.text('recurring_pattern'); // JSON string for recurring patterns
      table.timestamps(true, true);
    });
  }

  console.log('Database initialized successfully');
}

export default db;
