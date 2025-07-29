import { Router } from 'express';
import { ClassSession } from '../../shared/resource-types';

let classSessions: ClassSession[] = [];

export const classSessionRouter = Router();

// Get all class sessions
classSessionRouter.get('/', (req, res) => {
  res.json(classSessions);
});

// Create a new class session
classSessionRouter.post('/', (req, res) => {
  const newSession: ClassSession = req.body;
  classSessions.push(newSession);
  res.status(201).json(newSession);
});

// Delete a class session by ID
classSessionRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = classSessions.length;
  classSessions = classSessions.filter(session => session.id !== id);
  if (classSessions.length < initialLength) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Class session not found' });
  }
});

// Delete all class sessions
classSessionRouter.delete('/all', (req, res) => {
  classSessions.length = 0; // Clear the array
  res.status(204).send();
});

// Create multiple class sessions (bulk)
classSessionRouter.post('/bulk', (req, res) => {
  const newSessions: ClassSession[] = req.body;
  classSessions.push(...newSessions);
  res.status(201).json(newSessions);
});