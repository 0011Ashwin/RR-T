import db from '../database/index.js';

export async function addDemoFaculty() {
  try {
    console.log('Starting demo faculty addition...');

    // Get all departments
    const departments = await db('departments').select('*');
    console.log(`Found ${departments.length} departments:`);
    departments.forEach(dept => console.log(`- ${dept.name} (ID: ${dept.id})`));

    // Check current faculty count per department
    for (const dept of departments) {
      const facultyCount = await db('faculty')
        .where('department_id', dept.id)
        .count('* as count')
        .first();
      console.log(`${dept.name}: ${facultyCount?.count || 0} faculty members`);
    }

    // Demo faculty data with proper Indian names and designations
    const demoFaculty = [
      // Computer Science Department (dept_id: 1)
      { name: 'Dr. Arun Kumar Mishra', email: 'arun.mishra@biharuniv.edu', department_id: 1, designation: 'Professor' },
      { name: 'Dr. Kavita Singh', email: 'kavita.singh@biharuniv.edu', department_id: 1, designation: 'Associate Professor' },
      { name: 'Dr. Rahul Gupta', email: 'rahul.gupta@biharuniv.edu', department_id: 1, designation: 'Assistant Professor' },
      { name: 'Prof. Sanjay Kumar', email: 'sanjay.kumar@biharuniv.edu', department_id: 1, designation: 'Associate Professor' },
      { name: 'Dr. Meera Sharma', email: 'meera.sharma@biharuniv.edu', department_id: 1, designation: 'Assistant Professor' },

      // Mathematics Department (dept_id: 2) 
      { name: 'Dr. Ashok Kumar Jha', email: 'ashok.jha@biharuniv.edu', department_id: 2, designation: 'Professor' },
      { name: 'Dr. Sunita Devi', email: 'sunita.devi@biharuniv.edu', department_id: 2, designation: 'Associate Professor' },
      { name: 'Dr. Vinod Kumar Singh', email: 'vinod.singh@biharuniv.edu', department_id: 2, designation: 'Assistant Professor' },
      { name: 'Prof. Rekha Kumari', email: 'rekha.kumari@biharuniv.edu', department_id: 2, designation: 'Associate Professor' },
      { name: 'Dr. Deepak Kumar', email: 'deepak.kumar@biharuniv.edu', department_id: 2, designation: 'Assistant Professor' },

      // Physics Department (dept_id: 3)
      { name: 'Dr. Ramesh Chandra', email: 'ramesh.chandra@biharuniv.edu', department_id: 3, designation: 'Professor' },
      { name: 'Dr. Anita Kumari', email: 'anita.kumari@biharuniv.edu', department_id: 3, designation: 'Associate Professor' },
      { name: 'Dr. Sunil Kumar Yadav', email: 'sunil.yadav@biharuniv.edu', department_id: 3, designation: 'Assistant Professor' },
      { name: 'Prof. Geeta Singh', email: 'geeta.singh@biharuniv.edu', department_id: 3, designation: 'Associate Professor' },
      { name: 'Dr. Manoj Kumar Thakur', email: 'manoj.thakur@biharuniv.edu', department_id: 3, designation: 'Assistant Professor' },

      // Chemistry Department (dept_id: 4)
      { name: 'Dr. Brijesh Kumar', email: 'brijesh.kumar@biharuniv.edu', department_id: 4, designation: 'Professor' },
      { name: 'Dr. Pooja Sharma', email: 'pooja.sharma@biharuniv.edu', department_id: 4, designation: 'Associate Professor' },
      { name: 'Dr. Ajay Kumar Singh', email: 'ajay.singh@biharuniv.edu', department_id: 4, designation: 'Assistant Professor' },
      { name: 'Prof. Nisha Gupta', email: 'nisha.gupta@biharuniv.edu', department_id: 4, designation: 'Associate Professor' },
      { name: 'Dr. Rajesh Kumar Pandey', email: 'rajesh.pandey@biharuniv.edu', department_id: 4, designation: 'Assistant Professor' },

      // English Department (dept_id: 5)
      { name: 'Dr. Shailendra Kumar', email: 'shailendra.kumar@biharuniv.edu', department_id: 5, designation: 'Professor' },
      { name: 'Dr. Ritu Singh', email: 'ritu.singh@biharuniv.edu', department_id: 5, designation: 'Associate Professor' },
      { name: 'Dr. Abhishek Kumar', email: 'abhishek.kumar@biharuniv.edu', department_id: 5, designation: 'Assistant Professor' },
      { name: 'Prof. Mamta Kumari', email: 'mamta.kumari@biharuniv.edu', department_id: 5, designation: 'Associate Professor' },
      { name: 'Dr. Pankaj Kumar Jha', email: 'pankaj.jha@biharuniv.edu', department_id: 5, designation: 'Assistant Professor' },

      // Geography Department (dept_id: 6)
      { name: 'Dr. Santosh Kumar', email: 'santosh.kumar@biharuniv.edu', department_id: 6, designation: 'Professor' },
      { name: 'Dr. Vandana Singh', email: 'vandana.singh@biharuniv.edu', department_id: 6, designation: 'Associate Professor' },
      { name: 'Dr. Ravi Shankar', email: 'ravi.shankar@biharuniv.edu', department_id: 6, designation: 'Assistant Professor' },
      { name: 'Prof. Kiran Devi', email: 'kiran.devi@biharuniv.edu', department_id: 6, designation: 'Associate Professor' },
      { name: 'Dr. Nitish Kumar', email: 'nitish.kumar@biharuniv.edu', department_id: 6, designation: 'Assistant Professor' },
    ];

    console.log(`\n📝 Adding ${demoFaculty.length} new faculty members...`);

    // Insert faculty members in batches to avoid conflicts
    let added = 0;
    let skipped = 0;

    for (const faculty of demoFaculty) {
      try {
        // Check if faculty with this email already exists
        const existing = await db('faculty').where('email', faculty.email).first();
        
        if (existing) {
          console.log(`⚠️  Skipping ${faculty.name} - email already exists`);
          skipped++;
          continue;
        }

        await db('faculty').insert(faculty);
        console.log(`✅ Added: ${faculty.name} (${faculty.designation}) - ${departments.find(d => d.id === faculty.department_id)?.name}`);
        added++;
      } catch (error) {
        console.error(`❌ Failed to add ${faculty.name}:`, error.message);
        skipped++;
      }
    }

    // Show final count per department
    console.log('\n📊 Final Faculty Count per Department:');
    for (const dept of departments) {
      const facultyCount = await db('faculty')
        .where('department_id', dept.id)
        .count('* as count')
        .first();
      
      const facultyList = await db('faculty')
        .where('department_id', dept.id)
        .select('name', 'designation');
      
      console.log(`\n🏫 ${dept.name}: ${facultyCount?.count || 0} faculty members`);
      facultyList.forEach(f => console.log(`   • ${f.name} (${f.designation})`));
    }

    console.log(`\n✅ Demo faculty addition completed!`);
    console.log(`📈 Summary: ${added} added, ${skipped} skipped`);
    console.log(`🎯 Each department now has multiple faculty members for testing`);

  } catch (error) {
    console.error('❌ Error adding demo faculty:', error);
    throw error;
  }
}

// Auto-run if called directly
addDemoFaculty().then(() => {
  console.log('Demo faculty addition script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Demo faculty addition failed:', error);
  process.exit(1);
});
