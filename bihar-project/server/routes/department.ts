import { Router } from 'express';
import { DepartmentModel } from '../models/Department.js';

const router = Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await DepartmentModel.getAll();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const department = await DepartmentModel.getById(id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// Get department by code
router.get('/code/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const department = await DepartmentModel.getByCode(code);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Error fetching department by code:', error);
    res.status(500).json({ error: 'Failed to fetch department by code' });
  }
});

// Create a new department
router.post('/', async (req, res) => {
  try {
    const department = req.body;
    const newDepartment = await DepartmentModel.create(department);
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update a department
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const department = req.body;
    const updatedDepartment = await DepartmentModel.update(id, department);
    
    if (!updatedDepartment) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(updatedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Delete a department
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await DepartmentModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export const departmentRouter = router;