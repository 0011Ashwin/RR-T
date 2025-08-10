import { Router } from 'express';
import { FacultyModel } from '../models/Faculty.js';
import { DepartmentModel } from '../models/Department.js';

const router = Router();

// Get all HODs (faculty with designation containing 'HOD' or 'Head')
router.get('/', async (req, res) => {
  try {
    const hods = await FacultyModel.getHODs();
    
    // Transform to match client expected format
    const transformedHODs = hods.map(hod => ({
      id: hod.id.toString(),
      name: hod.name,
      email: hod.email,
      department: hod.department_name,
      designation: hod.designation,
      employeeId: hod.employee_id || `EMP${hod.id}`,
      joinDate: hod.created_at || new Date().toISOString(),
      experience: hod.experience || '5+ years',
      isActive: true
    }));

    res.json({
      success: true,
      data: transformedHODs
    });
  } catch (error) {
    console.error('Error fetching HODs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch HODs' 
    });
  }
});

// HOD login by email
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const hod = await FacultyModel.getHODByEmail(email);
    
    if (!hod) {
      return res.status(404).json({
        success: false,
        message: 'HOD not found with this email'
      });
    }

    // Transform to match client expected format
    const transformedHOD = {
      id: hod.id.toString(),
      name: hod.name,
      email: hod.email,
      department: hod.department_name,
      designation: hod.designation,
      employeeId: hod.employee_id || `EMP${hod.id}`,
      joinDate: hod.created_at || new Date().toISOString(),
      experience: hod.experience || '5+ years',
      isActive: true
    };

    res.json({
      success: true,
      data: transformedHOD
    });
  } catch (error) {
    console.error('Error during HOD login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to login. Please try again.' 
    });
  }
});

// Get HOD by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const hod = await FacultyModel.getHODById(id);
    
    if (!hod) {
      return res.status(404).json({ 
        success: false, 
        message: 'HOD not found' 
      });
    }

    // Transform to match client expected format
    const transformedHOD = {
      id: hod.id.toString(),
      name: hod.name,
      email: hod.email,
      department: hod.department_name,
      designation: hod.designation,
      employeeId: hod.employee_id || `EMP${hod.id}`,
      joinDate: hod.created_at || new Date().toISOString(),
      experience: hod.experience || '5+ years',
      isActive: true
    };
    
    res.json({
      success: true,
      data: transformedHOD
    });
  } catch (error) {
    console.error('Error fetching HOD:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch HOD' 
    });
  }
});

// Get HODs by department
router.get('/department/:department', async (req, res) => {
  try {
    const department = req.params.department;
    const hods = await FacultyModel.getHODsByDepartment(department);
    
    // Transform to match client expected format
    const transformedHODs = hods.map(hod => ({
      id: hod.id.toString(),
      name: hod.name,
      email: hod.email,
      department: hod.department_name,
      designation: hod.designation,
      employeeId: hod.employee_id || `EMP${hod.id}`,
      joinDate: hod.created_at || new Date().toISOString(),
      experience: hod.experience || '5+ years',
      isActive: true
    }));

    res.json({
      success: true,
      data: transformedHODs
    });
  } catch (error) {
    console.error('Error fetching department HODs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department HODs' 
    });
  }
});

export const hodRouter = router;
