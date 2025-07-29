import { Router } from 'express';
import { DepartmentModel } from '../models/Department.js';
import { FacultyModel } from '../models/Faculty.js';
import { ClassroomModel } from '../models/Classroom.js';
import { SubjectModel } from '../models/Subject.js';
import { TimetableModel, TimetableEntryWithDetails } from '../models/Timetable.js';
import { ResourceModel } from '../models/Resource.js';
import { ClassroomBookingModel } from '../models/ClassroomBooking.js';

const router = Router();

// Middleware to check if user is admin or HOD
// This is a placeholder - in a real app, you would implement proper authentication
const isAdminOrHOD = (req, res, next) => {
  // For demo purposes, we'll assume the user is authenticated and has a role
  // In a real app, you would check the user's session/token
  const userRole = req.headers['user-role'] || 'admin'; // Default to admin for testing
  
  if (userRole === 'admin' || userRole === 'hod') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized. Only admin or HOD can access this resource' });
  }
};

// Apply middleware to all routes
router.use(isAdminOrHOD);

// Get department dashboard data (for HOD)
router.get('/department/:departmentId/dashboard', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    
    // Get department details
    const department = await DepartmentModel.getById(departmentId);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Get faculty count
    const faculty = await FacultyModel.getByDepartment(departmentId);
    
    // Get classrooms count
    const classrooms = await ClassroomModel.getByDepartment(departmentId);
    
    // Get subjects count
    const subjects = await SubjectModel.getByDepartment(departmentId);
    
    // Get resources count
    const resources = await ResourceModel.getByDepartment(departmentId);
    
    // Get upcoming bookings (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const bookings = await ClassroomBookingModel.getByDateRangeAndDepartment(
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0],
      departmentId
    );
    
    // Return dashboard data
    res.json({
      department,
      stats: {
        facultyCount: faculty.length,
        classroomsCount: classrooms.length,
        subjectsCount: subjects.length,
        resourcesCount: resources.length,
        upcomingBookingsCount: bookings.length
      },
      recentBookings: bookings.slice(0, 5) // Get only 5 most recent bookings
    });
  } catch (error) {
    console.error('Error fetching department dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch department dashboard data' });
  }
});

// Get timetable conflicts for a department
router.get('/department/:departmentId/timetable-conflicts', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    
    // Get all timetables for the department
    const timetables = await TimetableModel.getByDepartment(departmentId);
    
    // Check for conflicts in each timetable
    const conflicts = [];
    
    for (const timetable of timetables) {
      // Get timetable with entries
      const timetableWithEntries = await TimetableModel.getWithEntries(timetable.id);
      const entries = timetableWithEntries ? timetableWithEntries.entries : [];
      
      // Check for conflicts
      const facultyConflicts = [];
      const classroomConflicts = [];
      
      // Group entries by faculty and day
      const facultyEntries: { [key: string]: TimetableEntryWithDetails[] } = {};
      // Group entries by classroom and day
      const classroomEntries: { [key: string]: TimetableEntryWithDetails[] } = {};
      
      // Organize entries by faculty and classroom for conflict detection
      entries.forEach(entry => {
        // Faculty grouping
        const facultyKey = `${entry.faculty_id}-${entry.day_of_week}`;
        if (!facultyEntries[facultyKey]) {
          facultyEntries[facultyKey] = [];
        }
        facultyEntries[facultyKey].push(entry);
        
        // Classroom grouping
        const classroomKey = `${entry.classroom_id}-${entry.day_of_week}`;
        if (!classroomEntries[classroomKey]) {
          classroomEntries[classroomKey] = [];
        }
        classroomEntries[classroomKey].push(entry);
      });
      
      // Check for faculty conflicts
      Object.values(facultyEntries).forEach((dayEntries: TimetableEntryWithDetails[]) => {
        if (dayEntries.length > 1) {
          for (let i = 0; i < dayEntries.length; i++) {
            for (let j = i + 1; j < dayEntries.length; j++) {
              const entry1 = dayEntries[i];
              const entry2 = dayEntries[j];
              
              // Check time overlap
              const start1 = new Date(`1970-01-01T${entry1.start_time}:00`);
              const end1 = new Date(`1970-01-01T${entry1.end_time}:00`);
              const start2 = new Date(`1970-01-01T${entry2.start_time}:00`);
              const end2 = new Date(`1970-01-01T${entry2.end_time}:00`);
              
              if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
                facultyConflicts.push({ entry1, entry2 });
              }
            }
          }
        }
      });
      
      // Check for classroom conflicts
      Object.values(classroomEntries).forEach((dayEntries: TimetableEntryWithDetails[]) => {
        if (dayEntries.length > 1) {
          for (let i = 0; i < dayEntries.length; i++) {
            for (let j = i + 1; j < dayEntries.length; j++) {
              const entry1 = dayEntries[i];
              const entry2 = dayEntries[j];
              
              // Check time overlap
              const start1 = new Date(`1970-01-01T${entry1.start_time}:00`);
              const end1 = new Date(`1970-01-01T${entry1.end_time}:00`);
              const start2 = new Date(`1970-01-01T${entry2.start_time}:00`);
              const end2 = new Date(`1970-01-01T${entry2.end_time}:00`);
              
              if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
                classroomConflicts.push({ entry1, entry2 });
              }
            }
          }
        }
      });
      
      if (facultyConflicts.length > 0 || classroomConflicts.length > 0) {
        conflicts.push({
          timetableId: timetable.id,
          timetableName: timetable.name,
          facultyConflicts,
          classroomConflicts
        });
      }
    }
    
    res.json(conflicts);
  } catch (error) {
    console.error('Error checking timetable conflicts:', error);
    res.status(500).json({ error: 'Failed to check timetable conflicts' });
  }
});

// Get resource utilization report
router.get('/department/:departmentId/resource-utilization', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    
    // Get all resources for the department
    const resources = await ResourceModel.getByDepartment(departmentId);
    
    // Get all classrooms for the department
    const classrooms = await ClassroomModel.getByDepartment(departmentId);
    
    // Get bookings for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();
    
    // Get bookings for the last 30 days using the same method used elsewhere in the file
    const bookings = await ClassroomBookingModel.getByDateRangeAndDepartment(
      thirtyDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0],
      departmentId
    );
    
    // Calculate utilization for each classroom
    const utilizationData = classrooms.map(classroom => {
      const classroomBookings = bookings.filter(booking => booking.classroom_id === classroom.id);
      
      return {
        classroom: classroom.name,
        totalBookings: classroomBookings.length,
        totalHours: classroomBookings.reduce((total, booking) => {
          const startTime = new Date(`${booking.date}T${booking.start_time}`);
          const endTime = new Date(`${booking.date}T${booking.end_time}`);
          const startTimeDate = new Date(`1970-01-01T${booking.start_time}:00`); 
        const endTimeDate = new Date(`1970-01-01T${booking.end_time}:00`);
        const hours = (endTimeDate.getTime() - startTimeDate.getTime()) / (1000 * 60 * 60);
          return total + hours;
        }, 0)
      };
    });
    
    res.json({
      resources,
      utilizationData
    });
  } catch (error) {
    console.error('Error generating resource utilization report:', error);
    res.status(500).json({ error: 'Failed to generate resource utilization report' });
  }
});

// Get faculty workload report
router.get('/department/:departmentId/faculty-workload', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    
    // Get all faculty for the department
    const faculty = await FacultyModel.getByDepartment(departmentId);
    
    // Get all timetables for the department
    const timetables = await TimetableModel.getByDepartment(departmentId);
    
    // Calculate workload for each faculty member
    const workloadData = [];
    
    for (const member of faculty) {
      let totalHours = 0;
      let totalClasses = 0;
      let subjects = [];
      
      for (const timetable of timetables) {
        // Get timetable with entries
      const timetableWithEntries = await TimetableModel.getWithEntries(timetable.id);
      const entries = timetableWithEntries ? timetableWithEntries.entries : [];
        
        // Filter entries for this faculty member
        const facultyEntries = entries.filter(entry => entry.faculty_id === member.id);
        
        totalClasses += facultyEntries.length;
        
        // Calculate hours
        for (const entry of facultyEntries) {
          // Add subject if not already in the list
          if (!subjects.some(s => s.id === entry.subject_id)) {
            const subject = await SubjectModel.getById(entry.subject_id);
            if (subject) {
              subjects.push(subject);
            }
          }
          
          // Calculate hours for this entry (assuming 1 hour per entry for simplicity)
          totalHours += 1;
        }
      }
      
      workloadData.push({
        faculty: member,
        totalHours,
        totalClasses,
        subjectsCount: subjects.length,
        subjects
      });
    }
    
    res.json(workloadData);
  } catch (error) {
    console.error('Error generating faculty workload report:', error);
    res.status(500).json({ error: 'Failed to generate faculty workload report' });
  }
});

// Approve or reject a classroom booking
router.put('/classroom-bookings/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, remarks } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved, rejected, or pending' });
    }
    
    // Get the booking
    const booking = await ClassroomBookingModel.getById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update the booking status
    const updatedBooking = await ClassroomBookingModel.update(id, {
      ...booking,
      status,
      remarks: remarks || booking.remarks
    });
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get all pending bookings for approval
router.get('/department/:departmentId/pending-bookings', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    
    // Get all bookings with status 'pending' for this department
    const bookings = await ClassroomBookingModel.getByDepartment(departmentId);
    const pendingBookings = bookings.filter(booking => booking.status === 'pending');
    
    res.json(pendingBookings);
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ error: 'Failed to fetch pending bookings' });
  }
});

export const adminRouter = router;