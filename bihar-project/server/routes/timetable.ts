import { Router } from 'express';
import { TimetableModel } from '../models/Timetable.js';

const router = Router();

// Get all timetables
router.get('/', async (req, res) => {
  try {
    const timetables = await TimetableModel.getAll();
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
});

// Get timetable by ID with entries
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const timetable = await TimetableModel.getWithEntries(id);
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// Get timetables by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const timetables = await TimetableModel.getByDepartment(departmentId);
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching department timetables:', error);
    res.status(500).json({ error: 'Failed to fetch department timetables' });
  }
});

// Create a new timetable
router.post('/', async (req, res) => {
  try {
    const timetable = req.body;
    const newTimetable = await TimetableModel.create(timetable);
    res.status(201).json(newTimetable);
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ error: 'Failed to create timetable' });
  }
});

// Update a timetable
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const timetable = req.body;
    const updatedTimetable = await TimetableModel.update(id, timetable);
    
    if (!updatedTimetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json(updatedTimetable);
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ error: 'Failed to update timetable' });
  }
});

// Delete a timetable
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await TimetableModel.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

// Add a timetable entry
router.post('/:id/entries', async (req, res) => {
  try {
    const timetableId = parseInt(req.params.id);
    const entry = { ...req.body, timetable_id: timetableId };
    
    const newEntry = await TimetableModel.addEntry(entry);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding timetable entry:', error);
    res.status(500).json({ error: 'Failed to add timetable entry', message: error.message });
  }
});

// Update a timetable entry
router.put('/entries/:entryId', async (req, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const entry = req.body;
    
    const updatedEntry = await TimetableModel.updateEntry(entryId, entry);
    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ error: 'Failed to update timetable entry', message: error.message });
  }
});

// Delete a timetable entry
router.delete('/entries/:entryId', async (req, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    await TimetableModel.deleteEntry(entryId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ error: 'Failed to delete timetable entry' });
  }
});

export const timetableRouter = router;