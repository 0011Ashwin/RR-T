import { Router } from 'express';
import { TimetableModel } from '../models/Timetable.js';
import db from '../database/index.js';

const router = Router();

// Get all timetables
router.get('/', async (req, res) => {
  try {
    const timetables = await TimetableModel.getAll();
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
});

// Get timetable by ID with entries
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const timetable = await TimetableModel.getWithEntries(id);
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// Get timetables by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const timetables = await TimetableModel.getByDepartment(departmentId);
    res.json({
      success: true,
      data: timetables
    });
  } catch (error) {
    console.error('Error fetching department timetables:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department timetables' 
    });
  }
});

// Get timetables by department name
router.get('/department/name/:department', async (req, res) => {
  try {
    const department = req.params.department;
    console.log('Fetching timetables for department:', department);
    
    // Get timetables with their entries
    const timetables = await db('timetables')
      .join('departments', 'timetables.department_id', 'departments.id')
      .where('departments.name', department)
      .select('timetables.*', 'departments.name as department_name');
    
    console.log('Found timetables:', timetables.length);
    
    // For each timetable, get its entries with related data
    const timetablesWithEntries = await Promise.all(
      timetables.map(async (timetable) => {
        const entries = await db('timetable_entries')
          .join('subjects', 'timetable_entries.subject_id', '=', 'subjects.id')
          .join('faculty', 'timetable_entries.faculty_id', '=', 'faculty.id')
          .join('classrooms', 'timetable_entries.classroom_id', '=', 'classrooms.id')
          .where('timetable_entries.timetable_id', timetable.id)
          .select(
            'timetable_entries.*',
            'subjects.name as subject_name',
            'subjects.code as subject_code',
            'faculty.name as faculty_name',
            'classrooms.name as classroom_name',
            'classrooms.room_number as classroom_room_number'
          );
        
        return {
          ...timetable,
          academicYear: timetable.academic_year,
          numberOfStudents: timetable.number_of_students,
          entries,
        };
      })
    );
    
    console.log('Timetables with entries:', timetablesWithEntries);
    
    res.json({
      success: true,
      data: timetablesWithEntries
    });
  } catch (error) {
    console.error('Error fetching department timetables:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department timetables' 
    });
  }
});

// Create a new timetable
router.post('/', async (req, res) => {
  try {
    const { name, department, semester, section, academicYear, numberOfStudents, sessions } = req.body;
    
    // First, find the department_id from department name
    const departmentRecord = await db('departments').where({ name: department }).first();
    let departmentId = departmentRecord?.id;
    
    // If department doesn't exist, create it
    if (!departmentId) {
      const [newDeptId] = await db('departments').insert({
        name: department,
        code: department.toUpperCase().replace(/\s+/g, ''),
      });
      departmentId = newDeptId;
    }
    
    // Create the timetable with proper database schema
    const timetableData = {
      name,
      semester,
      department_id: departmentId,
      section,
      academic_year: academicYear,
      number_of_students: numberOfStudents || 0,
      is_active: true,
    };
    
    const newTimetable = await TimetableModel.create(timetableData);
    
    // TODO: If sessions are provided, create timetable_entries
    // For now, return the basic timetable
    
    res.status(201).json({
      success: true,
      data: {
        id: newTimetable.id,
        name: newTimetable.name,
        semester: newTimetable.semester,
        department: department,
        section: newTimetable.section,
        academicYear: newTimetable.academic_year,
        numberOfStudents: newTimetable.number_of_students,
        isActive: newTimetable.is_active,
        sessions: [],
      }
    });
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create timetable' 
    });
  }
});

// Update a timetable
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, semester, section, academicYear, numberOfStudents, ...rest } = req.body;
    
    // Map frontend camelCase to database snake_case
    const timetableData: any = { ...rest };
    if (name !== undefined) timetableData.name = name;
    if (semester !== undefined) timetableData.semester = semester;
    if (section !== undefined) timetableData.section = section;
    if (academicYear !== undefined) timetableData.academic_year = academicYear;
    if (numberOfStudents !== undefined) timetableData.number_of_students = numberOfStudents;
    
    const updatedTimetable = await TimetableModel.update(id, timetableData);
    
    if (!updatedTimetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json({
      success: true,
      data: updatedTimetable
    });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update timetable',
      message: error.message 
    });
  }
});

// Delete a timetable
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await TimetableModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

// Add a timetable entry
router.post('/:id/entries', async (req, res) => {
  try {
    const timetableId = parseInt(req.params.id);
    const entry = { ...req.body, timetable_id: timetableId };
    
    const newEntry = await TimetableModel.addEntry(entry);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding timetable entry:', error);
    res.status(500).json({ error: 'Failed to add timetable entry', message: error.message });
  }
});

// Update a timetable entry
router.put('/entries/:entryId', async (req, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const entry = req.body;
    
    const updatedEntry = await TimetableModel.updateEntry(entryId, entry);
    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ error: 'Failed to update timetable entry', message: error.message });
  }
});

// Delete a timetable entry
router.delete('/entries/:entryId', async (req, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    await TimetableModel.deleteEntry(entryId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ error: 'Failed to delete timetable entry' });
  }
});

export const timetableRouter = router;