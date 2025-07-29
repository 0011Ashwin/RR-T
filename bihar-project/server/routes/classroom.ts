import { Router } from 'express';
import { ClassroomModel } from '../models/Classroom.js';

const router = Router();

// Get all classrooms
router.get('/', async (req, res) => {
  try {
    const classrooms = await ClassroomModel.getAll();
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
});

// Get classroom by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const classroom = await ClassroomModel.getById(id);
    
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    res.json(classroom);
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ error: 'Failed to fetch classroom' });
  }
});

// Get classrooms by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const classrooms = await ClassroomModel.getByDepartment(departmentId);
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching department classrooms:', error);
    res.status(500).json({ error: 'Failed to fetch department classrooms' });
  }
});

// Create a new classroom
router.post('/', async (req, res) => {
  try {
    const classroom = req.body;
    const newClassroom = await ClassroomModel.create(classroom);
    res.status(201).json(newClassroom);
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

// Update a classroom
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const classroom = req.body;
    const updatedClassroom = await ClassroomModel.update(id, classroom);
    
    if (!updatedClassroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    res.json(updatedClassroom);
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ error: 'Failed to update classroom' });
  }
});

// Delete a classroom
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ClassroomModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
});

export const classroomRouter = router;