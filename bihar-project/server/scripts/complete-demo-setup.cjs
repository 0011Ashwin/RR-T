const knex = require('knex');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('📁 Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database configuration - point to data directory  
const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: path.join(dataDir, 'bihar_university.sqlite'),
  },
  useNullAsDefault: true,
});

async function createDatabaseSchema() {
  console.log('🗃️ Creating database schema...');
  
  // Create departments table
  if (!(await db.schema.hasTable('departments'))) {
    await db.schema.createTable('departments', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('code').notNullable().unique();
      table.string('hod_name');
      table.string('hod_email');
      table.timestamps(true, true);
    });
  }

  // Create classrooms table
  if (!(await db.schema.hasTable('classrooms'))) {
    await db.schema.createTable('classrooms', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('room_number').notNullable();
      table.integer('capacity').notNullable();
      table.integer('floor').notNullable();
      table.string('building').notNullable();
      table.string('type').notNullable();
      table.integer('department_id').references('id').inTable('departments');
      table.timestamps(true, true);
    });
  }

  // Create faculty table
  if (!(await db.schema.hasTable('faculty'))) {
    await db.schema.createTable('faculty', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.integer('department_id').notNullable().references('id').inTable('departments');
      table.string('designation');
      table.timestamps(true, true);
    });
  }

  // Create subjects table
  if (!(await db.schema.hasTable('subjects'))) {
    await db.schema.createTable('subjects', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('code').notNullable().unique();
      table.integer('department_id').notNullable().references('id').inTable('departments');
      table.string('type').notNullable(); // lecture, practical, tutorial
      table.integer('credits').notNullable();
      table.timestamps(true, true);
    });
  }

  // Create timetables table
  if (!(await db.schema.hasTable('timetables'))) {
    await db.schema.createTable('timetables', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.integer('semester').notNullable();
      table.integer('department_id').notNullable().references('id').inTable('departments');
      table.string('section').notNullable();
      table.string('academic_year').notNullable();
      table.integer('number_of_students').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Create timetable_entries table
  if (!(await db.schema.hasTable('timetable_entries'))) {
    await db.schema.createTable('timetable_entries', (table) => {
      table.increments('id').primary();
      table.integer('timetable_id').notNullable().references('id').inTable('timetables').onDelete('CASCADE');
      table.integer('subject_id').notNullable().references('id').inTable('subjects');
      table.integer('faculty_id').notNullable().references('id').inTable('faculty');
      table.integer('classroom_id').notNullable().references('id').inTable('classrooms');
      table.integer('day_of_week').notNullable(); // 0-6 (Sunday-Saturday)
      table.time('start_time').notNullable();
      table.time('end_time').notNullable();
      table.timestamps(true, true);
    });
  }

  // Create resources table
  if (!(await db.schema.hasTable('resources'))) {
    await db.schema.createTable('resources', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('type').notNullable(); // lab, classroom, seminar_hall, etc.
      table.integer('capacity').notNullable();
      table.integer('department_id').references('id').inTable('departments');
      table.string('building');
      table.integer('floor');
      table.string('location');
      table.text('equipment'); // JSON string
      table.text('facilities'); // JSON string
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Create classroom_bookings table
  if (!(await db.schema.hasTable('classroom_bookings'))) {
    await db.schema.createTable('classroom_bookings', (table) => {
      table.increments('id').primary();
      table.integer('classroom_id').notNullable().references('id').inTable('classrooms');
      table.integer('faculty_id').notNullable().references('id').inTable('faculty');
      table.string('purpose').notNullable();
      table.date('booking_date').notNullable();
      table.time('start_time').notNullable();
      table.time('end_time').notNullable();
      table.string('status').defaultTo('pending'); // pending, approved, rejected
      table.timestamps(true, true);
    });
  }

  // Create booking_requests table
  if (!(await db.schema.hasTable('booking_requests'))) {
    await db.schema.createTable('booking_requests', (table) => {
      table.string('id').primary();
      table.string('requesterId').notNullable();
      table.string('requesterDepartment').notNullable();
      table.string('targetResourceId').notNullable();
      table.string('targetDepartment').notNullable();
      table.string('timeSlotId').notNullable();
      table.integer('dayOfWeek').notNullable();
      table.string('courseName').notNullable();
      table.string('purpose').notNullable();
      table.integer('expectedAttendance').notNullable();
      table.string('requestDate').notNullable();
      table.string('status').defaultTo('pending');
      table.string('approvedBy');
      table.string('responseDate');
      table.text('notes');
      table.timestamps(true, true);
    });
  }

  // Create colleges table
  if (!(await db.schema.hasTable('colleges'))) {
    await db.schema.createTable('colleges', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('code').notNullable().unique();
      table.string('address').notNullable();
      table.string('city').notNullable();
      table.string('state').defaultTo('Bihar');
      table.string('pincode').notNullable();
      table.string('phone');
      table.string('email');
      table.string('website');
      table.string('affiliation');
      table.integer('established_year');
      table.text('about');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Create principals table
  if (!(await db.schema.hasTable('principals'))) {
    await db.schema.createTable('principals', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.integer('college_id').notNullable().references('id').inTable('colleges');
      table.string('phone');
      table.string('qualification');
      table.string('experience');
      table.string('employee_id');
      table.date('join_date');
      table.text('about');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  console.log('✅ Database schema created successfully');
}

async function populateCompleteDemoData() {
  try {
    console.log('🚀 Starting comprehensive demo data population...');

    // First create the database schema
    await createDatabaseSchema();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing demo data...');
    await db('timetable_entries').del();
    await db('timetables').del();
    await db('booking_requests').del();
    await db('classroom_bookings').del();
    await db('subjects').del();
    await db('faculty').del();
    await db('principals').del();
    await db('colleges').del();
    await db('resources').del();
    await db('classrooms').del();
    await db('departments').del();

    // Reset auto-increment sequences to ensure consistent IDs
    console.log('🔄 Resetting ID sequences...');
    await db.raw('DELETE FROM sqlite_sequence WHERE name IN (?, ?, ?, ?, ?, ?, ?, ?)', ['classrooms', 'resources', 'departments', 'faculty', 'subjects', 'timetables', 'colleges', 'principals']);

    // 1. Insert Departments
    console.log('🏢 Inserting departments...');
    const departments = [
      { 
        id: 1,
        name: 'Computer Science', 
        code: 'CS', 
        hod_name: 'Dr. Rajesh Kumar Singh', 
        hod_email: 'rajesh.singh@biharuniv.edu' 
      },
      { 
        id: 2,
        name: 'Mathematics', 
        code: 'MATH', 
        hod_name: 'Dr. Priya Sharma', 
        hod_email: 'priya.sharma@biharuniv.edu' 
      },
    ];

    for (const dept of departments) {
      await db('departments').insert(dept);
    }

    // 2. Insert Faculty (including HODs)
    console.log('👨‍🏫 Inserting faculty...');
    const faculty = [
      // Computer Science Department Faculty
      { 
        id: 1,
        name: 'Dr. Rajesh Kumar Singh', 
        email: 'rajesh.singh@biharuniv.edu', 
        department_id: 1, 
        designation: 'HOD Computer Science' 
      },
      { 
        id: 2,
        name: 'Dr. Anita Sharma', 
        email: 'anita.sharma@biharuniv.edu', 
        department_id: 1, 
        designation: 'Professor' 
      },
      { 
        id: 3,
        name: 'Dr. Manoj Kumar', 
        email: 'manoj.kumar@biharuniv.edu', 
        department_id: 1, 
        designation: 'Associate Professor' 
      },
      { 
        id: 4,
        name: 'Dr. Kavita Singh', 
        email: 'kavita.singh@biharuniv.edu', 
        department_id: 1, 
        designation: 'Assistant Professor' 
      },
      { 
        id: 5,
        name: 'Prof. Sanjay Kumar', 
        email: 'sanjay.kumar@biharuniv.edu', 
        department_id: 1, 
        designation: 'Associate Professor' 
      },

      // Mathematics Department Faculty
      { 
        id: 6,
        name: 'Dr. Priya Sharma', 
        email: 'priya.sharma@biharuniv.edu', 
        department_id: 2, 
        designation: 'HOD Mathematics' 
      },
      { 
        id: 7,
        name: 'Dr. Suresh Gupta', 
        email: 'suresh.gupta@biharuniv.edu', 
        department_id: 2, 
        designation: 'Professor' 
      },
      { 
        id: 8,
        name: 'Dr. Ashok Kumar Jha', 
        email: 'ashok.jha@biharuniv.edu', 
        department_id: 2, 
        designation: 'Associate Professor' 
      },
      { 
        id: 9,
        name: 'Dr. Sunita Devi', 
        email: 'sunita.devi@biharuniv.edu', 
        department_id: 2, 
        designation: 'Assistant Professor' 
      },
      { 
        id: 10,
        name: 'Dr. Vinod Kumar Singh', 
        email: 'vinod.singh@biharuniv.edu', 
        department_id: 2, 
        designation: 'Assistant Professor' 
      },
    ];

    for (const fac of faculty) {
      await db('faculty').insert(fac);
    }

    // 2.5. Insert Colleges
    console.log('🏛️ Inserting colleges...');
    const colleges = [
      {
        id: 1,
        name: 'Magadh Mahila College',
        code: 'MMC',
        address: 'Patna-Gaya Road, Patna',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001',
        phone: '+91-0612-2345678',
        email: 'info@magadhmahila.ac.in',
        website: 'www.magadhmahila.ac.in',
        affiliation: 'Magadh University',
        established_year: 1962,
        about: 'Premier women\'s college in Bihar dedicated to empowering women through quality education in arts, science, and commerce.'
      }
    ];

    for (const college of colleges) {
      await db('colleges').insert(college);
    }

    // 2.6. Insert Principals
    console.log('👩‍💼 Inserting principals...');
    const principals = [
      {
        id: 1,
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@magadhmahila.ac.in',
        college_id: 1,
        phone: '+91-9876543210',
        qualification: 'Ph.D. in English Literature, Patna University',
        experience: '20+ years in Women\'s Education',
        employee_id: 'MMC001',
        join_date: '2018-07-15',
        about: 'Dedicated educator and advocate for women\'s empowerment with expertise in literature and gender studies.'
      }
    ];

    for (const principal of principals) {
      await db('principals').insert(principal);
    }

    // 3. Insert Classrooms (Legacy table - for backward compatibility)
    console.log('🏫 Inserting classrooms...');
    const classrooms = [
      // Computer Science Classrooms
      { 
        id: 1,
        name: 'CS Lab 1', 
        room_number: 'CS-101', 
        capacity: 60, 
        floor: 1, 
        building: 'CS Block', 
        type: 'lab',
        department_id: 1 
      },
      { 
        id: 2,
        name: 'CS Lab 2', 
        room_number: 'CS-102', 
        capacity: 60, 
        floor: 1, 
        building: 'CS Block', 
        type: 'lab',
        department_id: 1 
      },
      { 
        id: 3,
        name: 'CS Lecture Hall', 
        room_number: 'CS-201', 
        capacity: 120, 
        floor: 2, 
        building: 'CS Block', 
        type: 'lecture',
        department_id: 1 
      },
      { 
        id: 4,
        name: 'CS Smart Classroom', 
        room_number: 'CS-202', 
        capacity: 80, 
        floor: 2, 
        building: 'CS Block', 
        type: 'lecture',
        department_id: 1 
      },

      // Mathematics Classrooms
      { 
        id: 5,
        name: 'Math Classroom 1', 
        room_number: 'M-101', 
        capacity: 50, 
        floor: 1, 
        building: 'Math Block', 
        type: 'lecture',
        department_id: 2 
      },
      { 
        id: 6,
        name: 'Math Classroom 2', 
        room_number: 'M-102', 
        capacity: 50, 
        floor: 1, 
        building: 'Math Block', 
        type: 'lecture',
        department_id: 2 
      },
      { 
        id: 7,
        name: 'Math Tutorial Room', 
        room_number: 'M-103', 
        capacity: 30, 
        floor: 1, 
        building: 'Math Block', 
        type: 'tutorial',
        department_id: 2 
      },
      { 
        id: 8,
        name: 'Math Computer Lab', 
        room_number: 'M-201', 
        capacity: 40, 
        floor: 2, 
        building: 'Math Block', 
        type: 'lab',
        department_id: 2 
      },

      // Shared University Resources
      { 
        id: 9,
        name: 'Main Auditorium', 
        room_number: 'AUD-001', 
        capacity: 500, 
        floor: 1, 
        building: 'Main Building', 
        type: 'auditorium',
        department_id: null 
      },
      { 
        id: 10,
        name: 'Conference Hall', 
        room_number: 'CONF-001', 
        capacity: 100, 
        floor: 2, 
        building: 'Admin Building', 
        type: 'conference',
        department_id: null 
      },
    ];

    for (const classroom of classrooms) {
      await db('classrooms').insert(classroom);
    }

    // 4. Insert Resources (Modern resource management)
    console.log('🏗️ Inserting resources...');
    const resources = [
      // Computer Science Resources
      { 
        id: 1,
        name: 'CS Lab 1', 
        type: 'lab', 
        capacity: 60, 
        department_id: 1,
        building: 'CS Block',
        floor: 1,
        location: 'CS Block, Room 101',
        equipment: JSON.stringify(['60 Desktops', 'Network Switch', 'Whiteboard', 'Projector']),
        facilities: JSON.stringify(['Computers', 'AC', 'Internet', 'Power Outlets']),
        is_active: true 
      },
      { 
        id: 2,
        name: 'CS Lab 2', 
        type: 'lab', 
        capacity: 60, 
        department_id: 1,
        building: 'CS Block',
        floor: 1,
        location: 'CS Block, Room 102',
        equipment: JSON.stringify(['60 Desktops', 'Network Switch', 'Whiteboard', 'Projector']),
        facilities: JSON.stringify(['Computers', 'AC', 'Internet', 'Power Outlets']),
        is_active: true 
      },
      { 
        id: 3,
        name: 'CS Lecture Hall', 
        type: 'classroom', 
        capacity: 120, 
        department_id: 1,
        building: 'CS Block',
        floor: 2,
        location: 'CS Block, Room 201',
        equipment: JSON.stringify(['Smart Board', 'Microphone', 'Podium', 'Audio System']),
        facilities: JSON.stringify(['Projector', 'AC', 'Audio System', 'Seating']),
        is_active: true 
      },
      { 
        id: 4,
        name: 'CS Smart Classroom', 
        type: 'classroom', 
        capacity: 80, 
        department_id: 1,
        building: 'CS Block',
        floor: 2,
        location: 'CS Block, Room 202',
        equipment: JSON.stringify(['Interactive Board', 'Document Camera', 'Speakers']),
        facilities: JSON.stringify(['Smart Board', 'AC', 'Internet', 'Modern Seating']),
        is_active: true 
      },

      // Mathematics Resources
      { 
        id: 5,
        name: 'Math Classroom 1', 
        type: 'classroom', 
        capacity: 50, 
        department_id: 2,
        building: 'Math Block',
        floor: 1,
        location: 'Math Block, Room 101',
        equipment: JSON.stringify(['Whiteboard', 'Calculator', 'Compass Set', 'Projector']),
        facilities: JSON.stringify(['Traditional Blackboard', 'AC', 'Good Lighting']),
        is_active: true 
      },
      { 
        id: 6,
        name: 'Math Classroom 2', 
        type: 'classroom', 
        capacity: 50, 
        department_id: 2,
        building: 'Math Block',
        floor: 1,
        location: 'Math Block, Room 102',
        equipment: JSON.stringify(['Whiteboard', 'Calculator', 'Compass Set', 'Projector']),
        facilities: JSON.stringify(['Traditional Blackboard', 'AC', 'Good Lighting']),
        is_active: true 
      },
      { 
        id: 7,
        name: 'Math Tutorial Room', 
        type: 'classroom', 
        capacity: 30, 
        department_id: 2,
        building: 'Math Block',
        floor: 1,
        location: 'Math Block, Room 103',
        equipment: JSON.stringify(['Whiteboard', 'Chairs', 'Tables']),
        facilities: JSON.stringify(['Small Group Setting', 'AC', 'Natural Light']),
        is_active: true 
      },
      { 
        id: 8,
        name: 'Math Computer Lab', 
        type: 'lab', 
        capacity: 40, 
        department_id: 2,
        building: 'Math Block',
        floor: 2,
        location: 'Math Block, Room 201',
        equipment: JSON.stringify(['40 Computers', 'MATLAB Software', 'Statistical Software']),
        facilities: JSON.stringify(['Computers', 'AC', 'Internet', 'Specialized Software']),
        is_active: true 
      },

      // Shared University Resources
      { 
        id: 9,
        name: 'Main Auditorium', 
        type: 'seminar_hall', 
        capacity: 500, 
        department_id: null,
        building: 'Main Building',
        floor: 1,
        location: 'Main Building, Ground Floor',
        equipment: JSON.stringify(['Stage', 'Microphones', 'Projectors', 'Sound System', 'Lighting']),
        facilities: JSON.stringify(['Stage', 'Audio System', 'Lighting', 'AC', 'Seating for 500']),
        is_active: true 
      },
      { 
        id: 10,
        name: 'Conference Hall', 
        type: 'conference_room', 
        capacity: 100, 
        department_id: null,
        building: 'Admin Building',
        floor: 2,
        location: 'Admin Building, 2nd Floor',
        equipment: JSON.stringify(['Conference Table', 'Chairs', 'Whiteboard', 'Video Conferencing']),
        facilities: JSON.stringify(['Video Conferencing', 'AC', 'Projector', 'High-Speed Internet']),
        is_active: true 
      },
    ];

    for (const resource of resources) {
      await db('resources').insert(resource);
    }

    // 5. Insert Subjects
    console.log('📚 Inserting subjects...');
    const subjects = [
      // Computer Science Subjects
      { 
        id: 1,
        name: 'Data Structures', 
        code: 'CS301', 
        department_id: 1, 
        type: 'lecture', 
        credits: 4 
      },
      { 
        id: 2,
        name: 'Data Structures Lab', 
        code: 'CS301L', 
        department_id: 1, 
        type: 'practical', 
        credits: 2 
      },
      { 
        id: 3,
        name: 'Database Management Systems', 
        code: 'CS302', 
        department_id: 1, 
        type: 'lecture', 
        credits: 4 
      },
      { 
        id: 4,
        name: 'DBMS Lab', 
        code: 'CS302L', 
        department_id: 1, 
        type: 'practical', 
        credits: 2 
      },
      { 
        id: 5,
        name: 'Computer Networks', 
        code: 'CS303', 
        department_id: 1, 
        type: 'lecture', 
        credits: 3 
      },
      { 
        id: 6,
        name: 'Operating Systems', 
        code: 'CS401', 
        department_id: 1, 
        type: 'lecture', 
        credits: 4 
      },
      { 
        id: 7,
        name: 'Software Engineering', 
        code: 'CS402', 
        department_id: 1, 
        type: 'lecture', 
        credits: 3 
      },

      // Mathematics Subjects
      { 
        id: 8,
        name: 'Calculus I', 
        code: 'MATH101', 
        department_id: 2, 
        type: 'lecture', 
        credits: 4 
      },
      { 
        id: 9,
        name: 'Linear Algebra', 
        code: 'MATH201', 
        department_id: 2, 
        type: 'lecture', 
        credits: 3 
      },
      { 
        id: 10,
        name: 'Statistics', 
        code: 'MATH301', 
        department_id: 2, 
        type: 'lecture', 
        credits: 3 
      },
      { 
        id: 11,
        name: 'Discrete Mathematics', 
        code: 'MATH202', 
        department_id: 2, 
        type: 'lecture', 
        credits: 3 
      },
      { 
        id: 12,
        name: 'Mathematical Modeling', 
        code: 'MATH302', 
        department_id: 2, 
        type: 'practical', 
        credits: 2 
      },
    ];

    for (const subject of subjects) {
      await db('subjects').insert(subject);
    }

    // 6. Insert Sample Timetables
    console.log('📅 Inserting sample timetables...');
    const timetables = [
      { 
        id: 1,
        name: 'CS Semester 3 - Section A', 
        semester: 3, 
        department_id: 1, 
        section: 'A', 
        academic_year: '2024-25', 
        number_of_students: 45,
        is_active: true 
      },
      { 
        id: 2,
        name: 'CS Semester 4 - Section A', 
        semester: 4, 
        department_id: 1, 
        section: 'A', 
        academic_year: '2024-25', 
        number_of_students: 42,
        is_active: true 
      },
      { 
        id: 3,
        name: 'Math Semester 1 - Section A', 
        semester: 1, 
        department_id: 2, 
        section: 'A', 
        academic_year: '2024-25', 
        number_of_students: 35,
        is_active: true 
      },
      { 
        id: 4,
        name: 'Math Semester 2 - Section A', 
        semester: 2, 
        department_id: 2, 
        section: 'A', 
        academic_year: '2024-25', 
        number_of_students: 38,
        is_active: true 
      },
    ];

    for (const timetable of timetables) {
      await db('timetables').insert(timetable);
    }

    // 7. Insert Sample Timetable Entries (minimal conflicts for testing)
    console.log('🗓️ Inserting sample timetable entries...');
    const entries = [
      // CS Semester 3 - Section A (Timetable ID: 1) - Only one entry to minimize conflicts
      { 
        timetable_id: 1, 
        subject_id: 1, 
        faculty_id: 2, 
        classroom_id: 3, 
        day_of_week: 1, 
        start_time: '09:00', 
        end_time: '10:00' 
      },

      // Math Semester 1 - Section A (Timetable ID: 3) - Only one entry to minimize conflicts  
      { 
        timetable_id: 3, 
        subject_id: 8, 
        faculty_id: 7, 
        classroom_id: 5, 
        day_of_week: 2, 
        start_time: '11:00', 
        end_time: '12:00' 
      },
    ];

    for (const entry of entries) {
      await db('timetable_entries').insert(entry);
    }

    // 8. Insert Sample Booking Requests
    console.log('📋 Inserting sample booking requests...');
    const bookingRequests = [
      {
        id: 'req_demo_1',
        requesterId: 'Dr. Rajesh Kumar Singh',
        requesterDepartment: 'Computer Science',
        targetResourceId: '9', // Main Auditorium
        targetDepartment: 'University',
        timeSlotId: 'morning_1',
        dayOfWeek: 3, // Wednesday
        courseName: 'CS Department Seminar',
        purpose: 'Annual CS Department Seminar on Artificial Intelligence',
        expectedAttendance: 200,
        requestDate: new Date().toISOString(),
        status: 'pending',
      },
      {
        id: 'req_demo_2', 
        requesterId: 'Dr. Priya Sharma',
        requesterDepartment: 'Mathematics',
        targetResourceId: '10', // Conference Hall
        targetDepartment: 'University',
        timeSlotId: 'afternoon_1',
        dayOfWeek: 5, // Friday
        courseName: 'Faculty Meeting',
        purpose: 'Mathematics Department Faculty Meeting',
        expectedAttendance: 15,
        requestDate: new Date().toISOString(),
        status: 'approved',
        approvedBy: 'Dr. Admin',
        responseDate: new Date().toISOString(),
        notes: 'Approved for regular faculty meeting',
      },
    ];

    for (const request of bookingRequests) {
      await db('booking_requests').insert(request);
    }

    // Close database connection
    await db.destroy();

    // Validate classroom-resource ID synchronization
    console.log('🔍 Validating classroom-resource ID synchronization...');
    
    // Reconnect to validate
    const validateDb = knex({
      client: 'better-sqlite3',
      connection: {
        filename: path.join(__dirname, '..', '..', 'data', 'bihar_university.sqlite'),
      },
      useNullAsDefault: true,
    });
    
    await validateClassroomResourceSync(validateDb);
    await validateDb.destroy();

    console.log('✅ Comprehensive demo data population completed successfully!');
    console.log(`
📊 Demo Data Summary:
• ${departments.length} Departments (CS & Math)
• ${faculty.length} Faculty Members (5 CS + 5 Math including HODs)
• ${colleges.length} College (Magadh Mahila College)
• ${principals.length} Principal (Dr. Priya Sharma at Magadh Mahila College)
• ${subjects.length} Subjects/Courses (7 CS + 5 Math)
• ${classrooms.length} Classrooms (4 CS + 4 Math + 2 Shared)
• ${resources.length} Resources (4 CS + 4 Math + 2 Shared) - IDs SYNCHRONIZED ✅
• ${timetables.length} Timetables (2 CS + 2 Math)
• ${entries.length} Timetable Entries (reduced conflicts for testing)
• ${bookingRequests.length} Booking Requests

🎯 Ready for Testing:
• HOD Login: Computer Science or Mathematics
• Principal Login: Magadh Mahila College
• Resource Management & Booking
• Class Scheduling & Timetable Generation
• Cross-Department Resource Requests
• Faculty Dropdown Testing
• Session Adding/Editing

🔧 Login Credentials for Testing:
• CS HOD: Dr. Rajesh Kumar Singh (rajesh.singh@biharuniv.edu)
• Math HOD: Dr. Priya Sharma (priya.sharma@biharuniv.edu)
• Principal: Dr. Priya Sharma (priya.sharma@magadhmahila.ac.in)
    `);

  } catch (error) {
    console.error('❌ Error populating demo data:', error);
    throw error;
  }
}

// Function to validate that classroom and resource IDs are synchronized
async function validateClassroomResourceSync(database) {
  const classrooms = await database('classrooms').select('id', 'name').orderBy('id');
  const resources = await database('resources').select('id', 'name').orderBy('id');
  
  console.log('📋 Classroom-Resource ID Mapping:');
  let allMatch = true;
  
  for (let i = 0; i < Math.max(classrooms.length, resources.length); i++) {
    const classroom = classrooms[i];
    const resource = resources[i];
    
    if (!classroom && resource) {
      console.log(`❌ Missing classroom for resource ID ${resource.id}: ${resource.name}`);
      allMatch = false;
    } else if (classroom && !resource) {
      console.log(`❌ Missing resource for classroom ID ${classroom.id}: ${classroom.name}`);
      allMatch = false;
    } else if (classroom && resource) {
      if (classroom.id === resource.id) {
        console.log(`✅ ID ${classroom.id}: ${classroom.name} ↔ ${resource.name}`);
      } else {
        console.log(`❌ ID mismatch - Classroom ${classroom.id}: ${classroom.name} vs Resource ${resource.id}: ${resource.name}`);
        allMatch = false;
      }
    }
  }
  
  if (allMatch) {
    console.log('✅ All classroom and resource IDs are properly synchronized!');
  } else {
    console.log('❌ Found ID synchronization issues that need to be fixed!');
    throw new Error('Classroom-Resource ID synchronization failed');
  }
}

// Run the function
populateCompleteDemoData().then(() => {
  console.log('Demo data population script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Demo data population failed:', error);
  process.exit(1);
});
