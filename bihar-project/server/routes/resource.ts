import { Router } from 'express';
import { ResourceModel } from '../models/Resource.js';

const router = Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await ResourceModel.getAll();
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch resources' 
    });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resource = await ResourceModel.getById(id);
    
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }
    
    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch resource' 
    });
  }
});

// Get resources by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const resources = await ResourceModel.getByDepartment(departmentId);
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching department resources:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department resources' 
    });
  }
});

// Get resources by department name
router.get('/department/name/:department', async (req, res) => {
  try {
    const department = req.params.department;
    const resources = await ResourceModel.getByDepartmentName(department);
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching department resources:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department resources' 
    });
  }
});

// Get shared university resources
router.get('/shared', async (req, res) => {
  try {
    const resources = await ResourceModel.getSharedResources();
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching shared resources:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch shared resources' 
    });
  }
});

// Get resources by type
router.get('/type/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const resources = await ResourceModel.getByType(type);
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources by type:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch resources by type' 
    });
  }
});

// Create a new resource
router.post('/', async (req, res) => {
  try {
    const resource = req.body;
    const newResource = await ResourceModel.create(resource);
    res.status(201).json({
      success: true,
      data: newResource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create resource' 
    });
  }
});

// Update a resource
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resource = req.body;
    const updatedResource = await ResourceModel.update(id, resource);
    
    if (!updatedResource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }
    
    res.json({
      success: true,
      data: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update resource' 
    });
  }
});

// Toggle resource status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isActive } = req.body;
    const updatedResource = await ResourceModel.update(id, { is_active: isActive });
    
    if (!updatedResource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }
    
    res.json({
      success: true,
      data: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update resource status' 
    });
  }
});

// Delete a resource
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ResourceModel.delete(id);
    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete resource' 
    });
  }
});

export const resourceRouter = router;