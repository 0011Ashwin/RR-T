import db from '../database/index.js';

export async function populateDemoData() {
  try {
    console.log('Starting demo data population...');

    // Check if data already exists
    const existingDepartments = await db('departments').select('*');
    if (existingDepartments.length > 0) {
      console.log('Demo data already exists, skipping population.');
      return;
    }

    // 1. Insert Departments
    console.log('Inserting departments...');
    const departments = [
      { name: 'Computer Science', code: 'CS', hod_name: 'Dr. Rajesh Kumar Singh', hod_email: 'rajesh.singh@biharuniv.edu' },
      { name: 'Mathematics', code: 'MATH', hod_name: 'Dr. Priya Sharma', hod_email: 'priya.sharma@biharuniv.edu' },
      { name: 'Physics', code: 'PHY', hod_name: 'Dr. Amit Singh', hod_email: 'amit.singh@biharuniv.edu' },
      { name: 'Chemistry', code: 'CHEM', hod_name: 'Dr. Neha Gupta', hod_email: 'neha.gupta@biharuniv.edu' },
      { name: 'English', code: 'ENG', hod_name: 'Dr. Sunita Rani', hod_email: 'sunita.rani@biharuniv.edu' },
      { name: 'Geography', code: 'GEO', hod_name: 'Dr. Vikram Singh', hod_email: 'vikram.singh@biharuniv.edu' },
    ];

    for (const dept of departments) {
      await db('departments').insert(dept);
    }

    // 2. Insert Faculty
    console.log('Inserting faculty...');
    const faculty = [
      { name: 'Dr. Rajesh Kumar Singh', email: 'rajesh.singh@biharuniv.edu', department_id: 1 },
      { name: 'Dr. Anita Sharma', email: 'anita.sharma@biharuniv.edu', department_id: 1 },
      { name: 'Dr. Manoj Kumar', email: 'manoj.kumar@biharuniv.edu', department_id: 1 },
      { name: 'Dr. Priya Sharma', email: 'priya.sharma@biharuniv.edu', department_id: 2 },
      { name: 'Dr. Suresh Gupta', email: 'suresh.gupta@biharuniv.edu', department_id: 2 },
      { name: 'Dr. Amit Singh', email: 'amit.singh@biharuniv.edu', department_id: 3 },
      { name: 'Dr. Ravi Kumar', email: 'ravi.kumar@biharuniv.edu', department_id: 3 },
      { name: 'Dr. Neha Gupta', email: 'neha.gupta@biharuniv.edu', department_id: 4 },
      { name: 'Dr. Sunita Rani', email: 'sunita.rani@biharuniv.edu', department_id: 5 },
      { name: 'Dr. Vikram Singh', email: 'vikram.singh@biharuniv.edu', department_id: 6 },
    ];

    for (const fac of faculty) {
      await db('faculty').insert(fac);
    }

    // 3. Insert Subjects
    console.log('Inserting subjects...');
    const subjects = [
      // Computer Science
      { name: 'Data Structures', code: 'CS301', department_id: 1, semester: 3, credits: 4 },
      { name: 'Database Management Systems', code: 'CS302', department_id: 1, semester: 3, credits: 4 },
      { name: 'Computer Networks', code: 'CS303', department_id: 1, semester: 3, credits: 3 },
      { name: 'Operating Systems', code: 'CS401', department_id: 1, semester: 4, credits: 4 },
      { name: 'Software Engineering', code: 'CS402', department_id: 1, semester: 4, credits: 3 },
      
      // Mathematics
      { name: 'Calculus I', code: 'MATH101', department_id: 2, semester: 1, credits: 4 },
      { name: 'Linear Algebra', code: 'MATH201', department_id: 2, semester: 2, credits: 3 },
      { name: 'Statistics', code: 'MATH301', department_id: 2, semester: 3, credits: 3 },
      
      // Physics
      { name: 'Classical Mechanics', code: 'PHY101', department_id: 3, semester: 1, credits: 4 },
      { name: 'Electromagnetism', code: 'PHY201', department_id: 3, semester: 2, credits: 4 },
      
      // Chemistry
      { name: 'Organic Chemistry', code: 'CHEM101', department_id: 4, semester: 1, credits: 4 },
      { name: 'Inorganic Chemistry', code: 'CHEM201', department_id: 4, semester: 2, credits: 3 },
    ];

    for (const subject of subjects) {
      await db('subjects').insert(subject);
    }

    // 4. Insert Classrooms
    console.log('Inserting classrooms...');
    const classrooms = [
      // CS Block
      { name: 'CS Lab 1', room_number: 'CS-101', capacity: 60, floor: 1, building: 'CS Block', department_id: 1 },
      { name: 'CS Lab 2', room_number: 'CS-102', capacity: 60, floor: 1, building: 'CS Block', department_id: 1 },
      { name: 'CS Lecture Hall', room_number: 'CS-201', capacity: 120, floor: 2, building: 'CS Block', department_id: 1 },
      
      // Math Block
      { name: 'Math Room 1', room_number: 'M-101', capacity: 50, floor: 1, building: 'Math Block', department_id: 2 },
      { name: 'Math Room 2', room_number: 'M-102', capacity: 50, floor: 1, building: 'Math Block', department_id: 2 },
      
      // Physics Block
      { name: 'Physics Lab', room_number: 'P-101', capacity: 40, floor: 1, building: 'Physics Block', department_id: 3 },
      { name: 'Physics Lecture Hall', room_number: 'P-201', capacity: 80, floor: 2, building: 'Physics Block', department_id: 3 },
      
      // Shared Facilities
      { name: 'Main Auditorium', room_number: 'AUD-001', capacity: 500, floor: 1, building: 'Main Building', department_id: null },
      { name: 'Conference Hall', room_number: 'CONF-001', capacity: 100, floor: 2, building: 'Admin Building', department_id: null },
      { name: 'Seminar Hall 1', room_number: 'SEM-001', capacity: 80, floor: 1, building: 'Academic Block', department_id: null },
    ];

    for (const classroom of classrooms) {
      await db('classrooms').insert(classroom);
    }

    // 5. Insert Resources (using new schema)
    console.log('Inserting resources...');
    const resources = [
      // Department Resources
      { name: 'CS Lab 1', type: 'lab', capacity: 60, department_id: 1, location: 'CS Block, Room 101', facilities: JSON.stringify(['Computers', 'Projector', 'AC', 'Internet']), equipment: JSON.stringify(['60 Desktops', 'Network Switch', 'Whiteboard']), isActive: true, isShared: false },
      { name: 'CS Lab 2', type: 'lab', capacity: 60, department_id: 1, location: 'CS Block, Room 102', facilities: JSON.stringify(['Computers', 'Projector', 'AC', 'Internet']), equipment: JSON.stringify(['60 Desktops', 'Network Switch', 'Whiteboard']), isActive: true, isShared: false },
      { name: 'CS Lecture Hall', type: 'classroom', capacity: 120, department_id: 1, location: 'CS Block, Room 201', facilities: JSON.stringify(['Projector', 'AC', 'Audio System']), equipment: JSON.stringify(['Smart Board', 'Microphone', 'Podium']), isActive: true, isShared: false },
      
      { name: 'Math Classroom 1', type: 'classroom', capacity: 50, department_id: 2, location: 'Math Block, Room 101', facilities: JSON.stringify(['Projector', 'AC']), equipment: JSON.stringify(['Whiteboard', 'Calculator']), isActive: true, isShared: false },
      { name: 'Math Classroom 2', type: 'classroom', capacity: 50, department_id: 2, location: 'Math Block, Room 102', facilities: JSON.stringify(['Projector', 'AC']), equipment: JSON.stringify(['Whiteboard', 'Calculator']), isActive: true, isShared: false },
      
      { name: 'Physics Lab', type: 'lab', capacity: 40, department_id: 3, location: 'Physics Block, Room 101', facilities: JSON.stringify(['Equipment', 'Safety Gear', 'AC']), equipment: JSON.stringify(['Lab Equipment', 'Measuring Instruments']), isActive: true, isShared: false },
      
      // Shared University Resources
      { name: 'Main Auditorium', type: 'seminar_hall', capacity: 500, department_id: null, location: 'Main Building, Ground Floor', facilities: JSON.stringify(['Stage', 'Audio System', 'Lighting', 'AC']), equipment: JSON.stringify(['Microphones', 'Projectors', 'Sound System']), isActive: true, isShared: true },
      { name: 'Conference Hall', type: 'conference_room', capacity: 100, department_id: null, location: 'Admin Building, 2nd Floor', facilities: JSON.stringify(['Video Conferencing', 'AC', 'Projector']), equipment: JSON.stringify(['Conference Table', 'Chairs', 'Whiteboard']), isActive: true, isShared: true },
      { name: 'Seminar Hall 1', type: 'seminar_hall', capacity: 80, department_id: null, location: 'Academic Block, 1st Floor', facilities: JSON.stringify(['Projector', 'AC', 'Audio System']), equipment: JSON.stringify(['Podium', 'Microphone', 'Screen']), isActive: true, isShared: true },
    ];

    for (const resource of resources) {
      await db('resources').insert(resource);
    }

    // 6. Insert Sample Timetables
    console.log('Inserting sample timetables...');
    const timetables = [
      { name: 'CS Semester 3 - Section A', semester: 3, department_id: 1, section: 'A', academic_year: '2024-25', is_active: true },
      { name: 'CS Semester 4 - Section A', semester: 4, department_id: 1, section: 'A', academic_year: '2024-25', is_active: true },
      { name: 'Math Semester 1 - Section A', semester: 1, department_id: 2, section: 'A', academic_year: '2024-25', is_active: true },
    ];

    for (const timetable of timetables) {
      await db('timetables').insert(timetable);
    }

    // 7. Insert Sample Timetable Entries
    console.log('Inserting sample timetable entries...');
    const entries = [
      // CS Semester 3 - Section A (Timetable ID: 1)
      { timetable_id: 1, subject_id: 1, faculty_id: 1, classroom_id: 1, day_of_week: 1, start_time: '09:00', end_time: '10:00' }, // Data Structures
      { timetable_id: 1, subject_id: 2, faculty_id: 2, classroom_id: 2, day_of_week: 1, start_time: '10:00', end_time: '11:00' }, // DBMS
      { timetable_id: 1, subject_id: 3, faculty_id: 3, classroom_id: 3, day_of_week: 1, start_time: '11:00', end_time: '12:00' }, // Networks
      
      { timetable_id: 1, subject_id: 1, faculty_id: 1, classroom_id: 1, day_of_week: 2, start_time: '09:00', end_time: '10:00' }, // Data Structures
      { timetable_id: 1, subject_id: 2, faculty_id: 2, classroom_id: 2, day_of_week: 2, start_time: '10:00', end_time: '11:00' }, // DBMS
      
      // Math Semester 1 - Section A (Timetable ID: 3)
      { timetable_id: 3, subject_id: 6, faculty_id: 4, classroom_id: 4, day_of_week: 1, start_time: '09:00', end_time: '10:00' }, // Calculus
      { timetable_id: 3, subject_id: 6, faculty_id: 4, classroom_id: 4, day_of_week: 2, start_time: '09:00', end_time: '10:00' }, // Calculus
    ];

    for (const entry of entries) {
      await db('timetable_entries').insert(entry);
    }

    // 8. Insert Sample Booking Requests
    console.log('Inserting sample booking requests...');
    const bookingRequests = [
      {
        id: 'req_demo_1',
        requesterId: 'Dr. Rajesh Kumar Singh',
        requesterDepartment: 'Computer Science',
        targetResourceId: '8', // Main Auditorium
        targetDepartment: 'University',
        timeSlotId: 'morning_1',
        dayOfWeek: 3, // Wednesday
        courseName: 'Department Seminar',
        purpose: 'Annual CS Department Seminar on AI and ML',
        expectedAttendance: 200,
        requestDate: new Date().toISOString(),
        status: 'pending',
      },
      {
        id: 'req_demo_2', 
        requesterId: 'Dr. Priya Sharma',
        requesterDepartment: 'Mathematics',
        targetResourceId: '9', // Conference Hall
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

    console.log('✅ Demo data population completed successfully!');
    console.log(`
📊 Demo Data Summary:
• ${departments.length} Departments
• ${faculty.length} Faculty Members  
• ${subjects.length} Subjects/Courses
• ${classrooms.length} Classrooms
• ${resources.length} Resources
• ${timetables.length} Timetables
• ${entries.length} Timetable Entries
• ${bookingRequests.length} Booking Requests

🎯 You can now test:
• HOD Login (use any department name like "Computer Science")
• Resource Management & Booking
• Class Scheduling & Timetable Generation
• Department-specific and Shared Resources
• Booking Request Workflows
    `);

  } catch (error) {
    console.error('Error populating demo data:', error);
    throw error;
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateDemoData().then(() => {
    console.log('Demo data population script completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Demo data population failed:', error);
    process.exit(1);
  });
}
