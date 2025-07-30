import { Router } from 'express';
import { HODModel } from '../models/HOD.js';

const router = Router();

// HOD Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate HOD
    const hod = await HODModel.authenticate(email, password);
    
    if (!hod) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    // In a real app, you would generate a JWT token here
    // For now, we'll just return the HOD data
    res.json({
      success: true,
      message: 'Login successful',
      hod: hod
    });

  } catch (error) {
    console.error('HOD login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get HOD profile
router.get('/profile/:id', async (req, res) => {
  try {
    const hodId = parseInt(req.params.id);
    const hod = await HODModel.getById(hodId);
    
    if (!hod) {
      return res.status(404).json({ error: 'HOD not found' });
    }

    // Remove password from response
    const { password, ...hodData } = hod;
    res.json(hodData);

  } catch (error) {
    console.error('Error fetching HOD profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get all HODs (for admin/university level)
router.get('/all', async (req, res) => {
  try {
    const hods = await HODModel.getAll();
    
    // Remove passwords from response
    const hodsWithoutPassword = hods.map(({ password, ...hod }) => hod);
    
    res.json(hodsWithoutPassword);

  } catch (error) {
    console.error('Error fetching HODs:', error);
    res.status(500).json({ error: 'Failed to fetch HODs' });
  }
});

// Get HODs by college
router.get('/college/:collegeId', async (req, res) => {
  try {
    const collegeId = parseInt(req.params.collegeId);
    const hods = await HODModel.getByCollege(collegeId);
    
    // Remove passwords from response
    const hodsWithoutPassword = hods.map(({ password, ...hod }) => hod);
    
    res.json(hodsWithoutPassword);

  } catch (error) {
    console.error('Error fetching HODs by college:', error);
    res.status(500).json({ error: 'Failed to fetch HODs' });
  }
});

// Get HODs by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const hods = await HODModel.getByDepartment(departmentId);
    
    // Remove passwords from response
    const hodsWithoutPassword = hods.map(({ password, ...hod }) => hod);
    
    res.json(hodsWithoutPassword);

  } catch (error) {
    console.error('Error fetching HODs by department:', error);
    res.status(500).json({ error: 'Failed to fetch HODs' });
  }
});

// Update HOD password
router.put('/update-password/:id', async (req, res) => {
  try {
    const hodId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    // First verify current password
    const hod = await HODModel.getById(hodId);
    if (!hod || hod.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const success = await HODModel.updatePassword(hodId, newPassword);
    
    if (success) {
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update password' });
    }

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Create new HOD (for admin use)
router.post('/create', async (req, res) => {
  try {
    const hodData = req.body;

    if (!hodData.name || !hodData.email || !hodData.password || !hodData.department_id) {
      return res.status(400).json({ error: 'Name, email, password, and department are required' });
    }

    // Check if email already exists
    const existingHOD = await HODModel.getByEmail(hodData.email);
    if (existingHOD) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const newHOD = await HODModel.create(hodData);
    
    if (newHOD) {
      // Remove password from response
      const { password, ...hodWithoutPassword } = newHOD;
      res.status(201).json({
        success: true,
        message: 'HOD created successfully',
        hod: hodWithoutPassword
      });
    } else {
      res.status(500).json({ error: 'Failed to create HOD' });
    }

  } catch (error) {
    console.error('Error creating HOD:', error);
    res.status(500).json({ error: 'Failed to create HOD' });
  }
});

// Update HOD profile
router.put('/update/:id', async (req, res) => {
  try {
    const hodId = parseInt(req.params.id);
    const updateData = req.body;

    // Remove password from update data (use separate endpoint for password updates)
    delete updateData.password;

    const updatedHOD = await HODModel.update(hodId, updateData);
    
    if (updatedHOD) {
      // Remove password from response
      const { password, ...hodWithoutPassword } = updatedHOD;
      res.json({
        success: true,
        message: 'Profile updated successfully',
        hod: hodWithoutPassword
      });
    } else {
      res.status(404).json({ error: 'HOD not found' });
    }

  } catch (error) {
    console.error('Error updating HOD profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export const hodAuthRouter = router;
