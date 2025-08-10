import { Router } from 'express';
import { SubjectModel } from '../models/Subject.js';

const router = Router();

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await SubjectModel.getAll();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const subject = await SubjectModel.getById(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// Get subject by code
router.get('/code/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const subject = await SubjectModel.getByCode(code);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject by code:', error);
    res.status(500).json({ error: 'Failed to fetch subject by code' });
  }
});

// Get subjects by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const subjects = await SubjectModel.getByDepartment(departmentId);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching department subjects:', error);
    res.status(500).json({ error: 'Failed to fetch department subjects' });
  }
});

// Get subject with faculty
router.get('/:id/faculty', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const subject = await SubjectModel.getWithFaculty(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject with faculty:', error);
    res.status(500).json({ error: 'Failed to fetch subject with faculty' });
  }
});

// Create a new subject
router.post('/', async (req, res) => {
  try {
    const { department, ...subjectData } = req.body;
    
    // If department is provided as a name, find the department_id
    let departmentId = subjectData.department_id;
    if (department && !departmentId) {
      const db = require('../database/index.js').default;
      const departmentRecord = await db('departments').where({ name: department }).first();
      if (departmentRecord) {
        departmentId = departmentRecord.id;
      } else {
        return res.status(400).json({ 
          success: false,
          message: 'Department not found' 
        });
      }
    }
    
    const subject = {
      ...subjectData,
      department_id: departmentId
    };
    
    const newSubject = await SubjectModel.create(subject);
    res.status(201).json({
      success: true,
      data: newSubject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create subject' 
    });
  }
});

// Update a subject
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const subject = req.body;
    const updatedSubject = await SubjectModel.update(id, subject);
    
    if (!updatedSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete a subject
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await SubjectModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export const subjectRouter = router;