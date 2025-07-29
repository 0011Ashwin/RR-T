import { Router } from 'express';
import { FacultyModel } from '../models/Faculty.js';

const router = Router();

// Get all faculty members
router.get('/', async (req, res) => {
  try {
    const faculty = await FacultyModel.getAll();
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// Get faculty member by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const faculty = await FacultyModel.getById(id);
    
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty member:', error);
    res.status(500).json({ error: 'Failed to fetch faculty member' });
  }
});

// Get faculty member by email
router.get('/email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const faculty = await FacultyModel.getByEmail(email);
    
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty member by email:', error);
    res.status(500).json({ error: 'Failed to fetch faculty member by email' });
  }
});

// Get faculty members by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const faculty = await FacultyModel.getByDepartment(departmentId);
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching department faculty:', error);
    res.status(500).json({ error: 'Failed to fetch department faculty' });
  }
});

// Get faculty member with subjects
router.get('/:id/subjects', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const faculty = await FacultyModel.getWithSubjects(id);
    
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty member with subjects:', error);
    res.status(500).json({ error: 'Failed to fetch faculty member with subjects' });
  }
});

// Create a new faculty member
router.post('/', async (req, res) => {
  try {
    const faculty = req.body;
    const newFaculty = await FacultyModel.create(faculty);
    res.status(201).json(newFaculty);
  } catch (error) {
    console.error('Error creating faculty member:', error);
    res.status(500).json({ error: 'Failed to create faculty member' });
  }
});

// Update a faculty member
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const faculty = req.body;
    const updatedFaculty = await FacultyModel.update(id, faculty);
    
    if (!updatedFaculty) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    res.json(updatedFaculty);
  } catch (error) {
    console.error('Error updating faculty member:', error);
    res.status(500).json({ error: 'Failed to update faculty member' });
  }
});

// Delete a faculty member
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await FacultyModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting faculty member:', error);
    res.status(500).json({ error: 'Failed to delete faculty member' });
  }
});

export const facultyRouter = router;