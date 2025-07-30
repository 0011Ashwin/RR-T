import db from '../database/index.js';

async function addDemoHOD() {
  try {
    console.log('Adding demo HOD...');
    
    // Check if demo HOD already exists
    const existingHOD = await db('faculty').where('email', 'hod@example.com').first();
    
    if (existingHOD) {
      console.log('Demo HOD already exists:', existingHOD);
      return;
    }
    
    // Get Computer Science department ID (should be 1 from demo data)
    const csDept = await db('departments').where('name', 'Computer Science').first();
    if (!csDept) {
      console.log('Computer Science department not found. Running full demo data population...');
      const { populateDemoData } = await import('./populate-demo-data.js');
      await populateDemoData();
      return;
    }
    
    // Insert demo HOD
    const [hodId] = await db('faculty').insert({
      name: 'Prof. Demo HOD',
      email: 'hod@example.com',
      department_id: csDept.id,
      designation: 'Head of Department'
    });
    
    console.log('✅ Demo HOD added successfully with ID:', hodId);
    
    // Verify HOD can be found by HOD-specific query
    const hodRecord = await db('faculty')
      .join('departments', 'faculty.department_id', 'departments.id')
      .where('faculty.email', 'hod@example.com')
      .where(function() {
        this.where('faculty.designation', 'like', '%HOD%')
            .orWhere('faculty.designation', 'like', '%Head%');
      })
      .select('faculty.*', 'departments.name as department_name')
      .first();
      
    if (hodRecord) {
      console.log('✅ HOD verification successful:', {
        name: hodRecord.name,
        email: hodRecord.email,
        department: hodRecord.department_name,
        designation: hodRecord.designation
      });
    } else {
      console.log('❌ HOD verification failed - record not found with HOD designation');
    }
    
  } catch (error) {
    console.error('Error adding demo HOD:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

addDemoHOD();
