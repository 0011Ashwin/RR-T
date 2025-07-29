import { Router } from 'express';
import { DEFAULT_TIME_SLOTS } from '../../shared/resource-types.js';

const router = Router();

// Get all time slots
router.get('/', async (req, res) => {
  try {
    // For now, we'll return the default time slots from the shared types
    // In a real implementation, you might fetch these from a database
    const departmentSlots = DEFAULT_TIME_SLOTS;
    const universitySlots = DEFAULT_TIME_SLOTS;
    
    res.json({
      departmentSlots,
      universitySlots
    });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

export const timeslotRouter = router;