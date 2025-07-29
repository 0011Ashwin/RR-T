import { Router } from 'express';
import { ClassroomBookingModel } from '../models/ClassroomBooking.js';
import { ClassroomModel } from '../models/Classroom.js';

const router = Router();

// Get all classroom bookings with details
router.get('/', async (req, res) => {
  try {
    const bookings = await ClassroomBookingModel.getWithDetails();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching classroom bookings:', error);
    res.status(500).json({ error: 'Failed to fetch classroom bookings' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await ClassroomBookingModel.getById(id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Get bookings by date
router.get('/date/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const bookings = await ClassroomBookingModel.getDetailsByDate(date);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings by date:', error);
    res.status(500).json({ error: 'Failed to fetch bookings by date' });
  }
});

// Get bookings by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const bookings = await ClassroomBookingModel.getByDepartment(departmentId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching department bookings:', error);
    res.status(500).json({ error: 'Failed to fetch department bookings' });
  }
});

// Get bookings by date and department
router.get('/date/:date/department/:departmentId', async (req, res) => {
  try {
    const date = req.params.date;
    const departmentId = parseInt(req.params.departmentId);
    const bookings = await ClassroomBookingModel.getDetailsByDateAndDepartment(date, departmentId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings by date and department:', error);
    res.status(500).json({ error: 'Failed to fetch bookings by date and department' });
  }
});

// Get available classrooms for a specific time slot
router.get('/available-classrooms', async (req, res) => {
  try {
    const { date, startTime, endTime, dayOfWeek } = req.query;
    
    if (!date || !startTime || !endTime || !dayOfWeek) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const availableClassrooms = await ClassroomModel.getAvailable(
      date as string,
      startTime as string,
      endTime as string,
      parseInt(dayOfWeek as string)
    );
    
    res.json(availableClassrooms);
  } catch (error) {
    console.error('Error fetching available classrooms:', error);
    res.status(500).json({ error: 'Failed to fetch available classrooms' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const booking = req.body;
    const newBooking = await ClassroomBookingModel.create(booking);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', message: error.message });
  }
});

// Update a booking
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = req.body;
    const updatedBooking = await ClassroomBookingModel.update(id, booking);
    
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking', message: error.message });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ClassroomBookingModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Check for booking conflicts
router.post('/check-conflicts', async (req, res) => {
  try {
    const booking = req.body;
    const conflicts = await ClassroomBookingModel.checkBookingConflicts(booking);
    res.json({ hasConflicts: conflicts.length > 0, conflicts });
  } catch (error) {
    console.error('Error checking booking conflicts:', error);
    res.status(500).json({ error: 'Failed to check booking conflicts' });
  }
});

export const classroomBookingRouter = router;