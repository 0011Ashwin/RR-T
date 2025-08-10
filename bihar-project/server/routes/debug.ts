import { Router } from 'express';
import db from '../database/index.js';

const router = Router();

// Debug endpoint to query timetable entries directly
router.get('/debug-timetable-entries', async (req, res) => {
  try {
    console.log('🔍 Debug: Querying timetable entries...');
    
    // Get all timetable entries with full details
    const entries = await db('timetable_entries')
      .join('subjects', 'timetable_entries.subject_id', '=', 'subjects.id')
      .join('faculty', 'timetable_entries.faculty_id', '=', 'faculty.id')
      .join('classrooms', 'timetable_entries.classroom_id', '=', 'classrooms.id')
      .join('timetables', 'timetable_entries.timetable_id', '=', 'timetables.id')
      .join('departments', 'timetables.department_id', '=', 'departments.id')
      .select(
        'timetable_entries.*',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'faculty.name as faculty_name',
        'classrooms.name as classroom_name',
        'classrooms.room_number as classroom_room_number',
        'timetables.name as timetable_name',
        'timetables.is_active as timetable_active',
        'departments.name as department_name'
      )
      .orderBy('timetable_entries.day_of_week')
      .orderBy('timetable_entries.start_time');

    console.log('📊 Found timetable entries:', entries.length);
    
    // Filter for Monday 9:00 entries specifically
    const mondayNineEntries = entries.filter(entry => 
      entry.day_of_week === 1 && 
      entry.start_time && 
      entry.start_time.startsWith('09:')
    );
    
    console.log('🕘 Monday 9:00 entries:', mondayNineEntries.length);
    
    // Get active timetables only
    const activeEntries = entries.filter(entry => entry.timetable_active === 1);
    console.log('🟢 Active timetable entries:', activeEntries.length);
    
    res.json({
      success: true,
      data: {
        allEntries: entries,
        mondayNineEntries,
        activeEntries,
        summary: {
          totalEntries: entries.length,
          activeEntries: activeEntries.length,
          mondayNineEntries: mondayNineEntries.length
        }
      }
    });
    
  } catch (error) {
    console.error('Error in debug query:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to query timetable entries',
      error: error.message 
    });
  }
});

export default router;
