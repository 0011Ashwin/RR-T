import { Router } from 'express';
import { ResourceModel } from '../models/Resource.js';

const router = Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await ResourceModel.getAll();
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resource = await ResourceModel.getById(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Get resources by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const resources = await ResourceModel.getByDepartment(departmentId);
    res.json(resources);
  } catch (error) {
    console.error('Error fetching department resources:', error);
    res.status(500).json({ error: 'Failed to fetch department resources' });
  }
});

// Get resources by type
router.get('/type/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const resources = await ResourceModel.getByType(type);
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources by type:', error);
    res.status(500).json({ error: 'Failed to fetch resources by type' });
  }
});

// Create a new resource
router.post('/', async (req, res) => {
  try {
    const resource = req.body;
    const newResource = await ResourceModel.create(resource);
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update a resource
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resource = req.body;
    const updatedResource = await ResourceModel.update(id, resource);
    
    if (!updatedResource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete a resource
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ResourceModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export const resourceRouter = router;