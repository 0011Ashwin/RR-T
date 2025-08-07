import { Router } from 'express';
import { PrincipalModel } from '../models/Principal.js';
import { CollegeModel } from '../models/College.js';

const router = Router();

// Get all Principals
router.get('/', async (req, res) => {
  try {
    const principals = await PrincipalModel.getAll();
    
    // Transform to match client expected format
    const transformedPrincipals = principals.map(principal => ({
      id: principal.id?.toString() || '',
      name: principal.name,
      email: principal.email,
      college: principal.college_name || '',
      qualification: principal.qualification || 'Ph.D.',
      experience: principal.experience || '10+ years',
      employeeId: principal.employee_id || `PRI${principal.id}`,
      joinDate: principal.join_date || principal.created_at || new Date().toISOString(),
      phone: principal.phone || '',
      about: principal.about || '',
      isActive: principal.is_active ?? true
    }));

    res.json({
      success: true,
      data: transformedPrincipals
    });
  } catch (error) {
    console.error('Error fetching Principals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch Principals' 
    });
  }
});

// Principal login by email
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const principal = await PrincipalModel.getByEmail(email);
    
    if (!principal) {
      return res.status(404).json({
        success: false,
        message: 'Principal not found with this email'
      });
    }

    // Transform to match client expected format
    const transformedPrincipal = {
      id: principal.id?.toString() || '',
      name: principal.name,
      email: principal.email,
      college: principal.college_name || '',
      qualification: principal.qualification || 'Ph.D.',
      experience: principal.experience || '10+ years',
      employeeId: principal.employee_id || `PRI${principal.id}`,
      joinDate: principal.join_date || principal.created_at || new Date().toISOString(),
      phone: principal.phone || '',
      about: principal.about || '',
      isActive: principal.is_active ?? true
    };

    res.json({
      success: true,
      data: transformedPrincipal
    });
  } catch (error) {
    console.error('Error during Principal login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to login. Please try again.' 
    });
  }
});

// Get Principal by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const principal = await PrincipalModel.getById(id);
    
    if (!principal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Principal not found' 
      });
    }

    // Transform to match client expected format
    const transformedPrincipal = {
      id: principal.id?.toString() || '',
      name: principal.name,
      email: principal.email,
      college: principal.college_name || '',
      qualification: principal.qualification || 'Ph.D.',
      experience: principal.experience || '10+ years',
      employeeId: principal.employee_id || `PRI${principal.id}`,
      joinDate: principal.join_date || principal.created_at || new Date().toISOString(),
      phone: principal.phone || '',
      about: principal.about || '',
      isActive: principal.is_active ?? true
    };
    
    res.json({
      success: true,
      data: transformedPrincipal
    });
  } catch (error) {
    console.error('Error fetching Principal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch Principal' 
    });
  }
});

// Get Principals by college
router.get('/college/:college', async (req, res) => {
  try {
    const college = req.params.college;
    const principals = await PrincipalModel.getByCollegeName(college);
    
    // Transform to match client expected format
    const transformedPrincipals = principals.map(principal => ({
      id: principal.id?.toString() || '',
      name: principal.name,
      email: principal.email,
      college: principal.college_name || '',
      qualification: principal.qualification || 'Ph.D.',
      experience: principal.experience || '10+ years',
      employeeId: principal.employee_id || `PRI${principal.id}`,
      joinDate: principal.join_date || principal.created_at || new Date().toISOString(),
      phone: principal.phone || '',
      about: principal.about || '',
      isActive: principal.is_active ?? true
    }));

    res.json({
      success: true,
      data: transformedPrincipals
    });
  } catch (error) {
    console.error('Error fetching college Principals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch college Principals' 
    });
  }
});

export const principalRouter = router;
