import { CollegeModel } from '../models/College.js';
import { DepartmentModel } from '../models/Department.js';
import { HODModel } from '../models/HOD.js';
import { ResourceModel } from '../models/Resource.js';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create sample colleges
    const college1 = await CollegeModel.create({
      name: 'Bihar Engineering College',
      code: 'BEC',
      address: 'Patna, Bihar',
      principal_name: 'Dr. Rajesh Kumar',
      principal_email: 'principal@bec.ac.in',
      phone: '+91-612-2345678',
      is_active: true
    });

    const college2 = await CollegeModel.create({
      name: 'Magadh Science College',
      code: 'MSC',
      address: 'Gaya, Bihar',
      principal_name: 'Dr. Priya Sharma',
      principal_email: 'principal@msc.ac.in',
      phone: '+91-631-2345678',
      is_active: true
    });

    console.log('Colleges created successfully');

    // Create sample departments
    const departments = [
      {
        name: 'Computer Science Engineering',
        code: 'CSE',
        college_id: college1?.id
      },
      {
        name: 'Electronics and Communication',
        code: 'ECE',
        college_id: college1?.id
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        college_id: college1?.id
      },
      {
        name: 'Civil Engineering',
        code: 'CE',
        college_id: college1?.id
      },
      {
        name: 'Physics',
        code: 'PHY',
        college_id: college2?.id
      },
      {
        name: 'Chemistry',
        code: 'CHEM',
        college_id: college2?.id
      },
      {
        name: 'Mathematics',
        code: 'MATH',
        college_id: college2?.id
      },
      {
        name: 'Geography',
        code: 'GEO',
        college_id: college2?.id
      }
    ];

    const createdDepartments = [];
    for (const dept of departments) {
      const department = await DepartmentModel.create(dept);
      createdDepartments.push(department);
    }

    console.log('Departments created successfully');

    // Create sample HODs
    const hods = [
      {
        name: 'Dr. Amitabh Singh',
        email: 'amitabh.singh@bec.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'BEC-CSE-001',
        phone: '+91-9876543210',
        department_id: createdDepartments[0]?.id,
        college_id: college1?.id,
        join_date: '2020-01-15',
        experience: '15 years',
        is_active: true
      },
      {
        name: 'Dr. Sunita Kumari',
        email: 'sunita.kumari@bec.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'BEC-ECE-001',
        phone: '+91-9876543211',
        department_id: createdDepartments[1]?.id,
        college_id: college1?.id,
        join_date: '2019-08-20',
        experience: '12 years',
        is_active: true
      },
      {
        name: 'Dr. Rajesh Prasad',
        email: 'rajesh.prasad@bec.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'BEC-ME-001',
        phone: '+91-9876543212',
        department_id: createdDepartments[2]?.id,
        college_id: college1?.id,
        join_date: '2018-03-10',
        experience: '18 years',
        is_active: true
      },
      {
        name: 'Dr. Anita Sharma',
        email: 'anita.sharma@bec.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'BEC-CE-001',
        phone: '+91-9876543213',
        department_id: createdDepartments[3]?.id,
        college_id: college1?.id,
        join_date: '2021-07-01',
        experience: '10 years',
        is_active: true
      },
      {
        name: 'Dr. Manoj Kumar',
        email: 'manoj.kumar@msc.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'MSC-PHY-001',
        phone: '+91-9876543214',
        department_id: createdDepartments[4]?.id,
        college_id: college2?.id,
        join_date: '2017-09-15',
        experience: '20 years',
        is_active: true
      },
      {
        name: 'Dr. Kavita Singh',
        email: 'kavita.singh@msc.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'MSC-CHEM-001',
        phone: '+91-9876543215',
        department_id: createdDepartments[5]?.id,
        college_id: college2?.id,
        join_date: '2019-01-20',
        experience: '14 years',
        is_active: true
      },
      {
        name: 'Dr. Pradeep Thakur',
        email: 'pradeep.thakur@msc.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'MSC-MATH-001',
        phone: '+91-9876543216',
        department_id: createdDepartments[6]?.id,
        college_id: college2?.id,
        join_date: '2020-06-10',
        experience: '16 years',
        is_active: true
      },
      {
        name: 'Dr. Sushma Devi',
        email: 'sushma.devi@msc.ac.in',
        password: 'hod123',
        designation: 'Head of Department',
        employee_id: 'MSC-GEO-001',
        phone: '+91-9876543217',
        department_id: createdDepartments[7]?.id,
        college_id: college2?.id,
        join_date: '2018-11-05',
        experience: '13 years',
        is_active: true
      }
    ];

    const createdHODs = [];
    for (const hod of hods) {
      if (hod.department_id) {
        const hodRecord = await HODModel.create(hod);
        createdHODs.push(hodRecord);
      }
    }

    console.log('HODs created successfully');

    // Create sample resources for each department
    const resources = [
      // CSE Department Resources
      {
        name: 'Computer Lab 1',
        type: 'lab',
        capacity: 60,
        department_id: createdDepartments[0]?.id,
        building: 'A Block',
        floor: 2,
        location: 'Room A-201',
        equipment: JSON.stringify(['Computers', 'Projector', 'Whiteboard', 'AC']),
        facilities: JSON.stringify(['Internet', 'Power Backup', 'CCTV']),
        is_active: true
      },
      {
        name: 'Computer Lab 2',
        type: 'lab',
        capacity: 40,
        department_id: createdDepartments[0]?.id,
        building: 'A Block',
        floor: 2,
        location: 'Room A-202',
        equipment: JSON.stringify(['Computers', 'Projector', 'Whiteboard']),
        facilities: JSON.stringify(['Internet', 'Power Backup']),
        is_active: true
      },
      // ECE Department Resources
      {
        name: 'Electronics Lab',
        type: 'lab',
        capacity: 30,
        department_id: createdDepartments[1]?.id,
        building: 'B Block',
        floor: 1,
        location: 'Room B-101',
        equipment: JSON.stringify(['Oscilloscopes', 'Function Generators', 'Multimeters', 'Breadboards']),
        facilities: JSON.stringify(['Power Supply', 'Storage Cabinets']),
        is_active: true
      },
      {
        name: 'Communication Lab',
        type: 'lab',
        capacity: 25,
        department_id: createdDepartments[1]?.id,
        building: 'B Block',
        floor: 1,
        location: 'Room B-102',
        equipment: JSON.stringify(['Communication Kits', 'Antennas', 'Spectrum Analyzers']),
        facilities: JSON.stringify(['Shielded Environment', 'Calibrated Equipment']),
        is_active: true
      },
      // ME Department Resources
      {
        name: 'Manufacturing Lab',
        type: 'lab',
        capacity: 20,
        department_id: createdDepartments[2]?.id,
        building: 'C Block',
        floor: 1,
        location: 'Room C-101',
        equipment: JSON.stringify(['Lathe Machines', 'Milling Machines', 'Drilling Machines']),
        facilities: JSON.stringify(['Safety Equipment', 'Ventilation', 'Tool Storage']),
        is_active: true
      },
      // Physics Department Resources
      {
        name: 'Physics Lab 1',
        type: 'lab',
        capacity: 35,
        department_id: createdDepartments[4]?.id,
        building: 'Science Block',
        floor: 2,
        location: 'Room S-201',
        equipment: JSON.stringify(['Optical Bench', 'Laser Setup', 'Spectrometers']),
        facilities: JSON.stringify(['Dark Room', 'Precision Instruments']),
        is_active: true
      },
      // Chemistry Department Resources
      {
        name: 'Chemistry Lab 1',
        type: 'lab',
        capacity: 30,
        department_id: createdDepartments[5]?.id,
        building: 'Science Block',
        floor: 1,
        location: 'Room S-101',
        equipment: JSON.stringify(['Fume Hoods', 'Analytical Balance', 'pH Meters', 'Burettes']),
        facilities: JSON.stringify(['Chemical Storage', 'Emergency Shower', 'Fire Extinguisher']),
        is_active: true
      }
    ];

    for (const resource of resources) {
      if (resource.department_id) {
        await ResourceModel.create(resource);
      }
    }

    console.log('Resources created successfully');
    console.log('Database seeding completed successfully!');

    return {
      colleges: [college1, college2],
      departments: createdDepartments,
      hods: createdHODs
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
