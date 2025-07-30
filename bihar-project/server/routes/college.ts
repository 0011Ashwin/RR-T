import { Router } from 'express';
import { CollegeModel } from '../models/College.js';

const router = Router();

// Get all colleges
router.get('/', async (req, res) => {
  try {
    const colleges = await CollegeModel.getAll();
    res.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// Get college by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const college = await CollegeModel.getById(id);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json(college);
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ error: 'Failed to fetch college' });
  }
});

// Get college by code
router.get('/code/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const college = await CollegeModel.getByCode(code);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json(college);
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ error: 'Failed to fetch college' });
  }
});

// Create new college
router.post('/', async (req, res) => {
  try {
    const collegeData = req.body;
    
    if (!collegeData.name || !collegeData.code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }
    
    // Check if code already exists
    const existingCollege = await CollegeModel.getByCode(collegeData.code);
    if (existingCollege) {
      return res.status(409).json({ error: 'College code already exists' });
    }
    
    const college = await CollegeModel.create(collegeData);
    res.status(201).json(college);
  } catch (error) {
    console.error('Error creating college:', error);
    res.status(500).json({ error: 'Failed to create college' });
  }
});

// Update college
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const college = await CollegeModel.update(id, updateData);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json(college);
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ error: 'Failed to update college' });
  }
});

// Delete college
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const deletedCount = await CollegeModel.delete(id);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ error: 'Failed to delete college' });
  }
});

// Get active colleges
router.get('/status/active', async (req, res) => {
  try {
    const colleges = await CollegeModel.getActive();
    res.json(colleges);
  } catch (error) {
    console.error('Error fetching active colleges:', error);
    res.status(500).json({ error: 'Failed to fetch active colleges' });
  }
});

export const collegeRouter = router;
