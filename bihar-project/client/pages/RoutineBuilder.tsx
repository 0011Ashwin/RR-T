import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { useToast } from '@/hooks/use-toast';
import { Routine, ClassSession, Course, Resource, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
import { exportRoutine } from '@/lib/export-utils';
import { TimetableService } from '@/services/timetable-service';
import { ResourceService } from '@/services/resource-service';
import axios from 'axios';
import { 
  Calendar,
  Download,
  FileText,
  Plus,
  Wand2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  User,
  BookOpen,
  Filter,
  Trash2,
  Edit3
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface RoutineView {
  semester: number;
  section: string;
  sessions: ClassSession[];
  course?: Course;
}

export default function RoutineBuilder() {
  const { currentHOD } = useHODAuth();
  const { toast } = useToast();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [routineViews, setRoutineViews] = useState<RoutineView[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addSessionDialogOpen, setAddSessionDialogOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{timeSlotId: string, dayOfWeek: number} | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when this changes
  const [bookingRequests, setBookingRequests] = useState<any[]>([]); // Pending booking requests
  const [allTimetableEntries, setAllTimetableEntries] = useState<any[]>([]); // Global timetable entries from all departments

  const [newRoutineForm, setNewRoutineForm] = useState({
    name: '',
    semester: 1,
    section: 'A',
    academicYear: '2024-25',
    numberOfStudents: 45,
  });

  const [editRoutineForm, setEditRoutineForm] = useState({
    name: '',
    semester: 1,
    section: 'A',
    academicYear: '2024-25',
    numberOfStudents: 45,
  });

  const [addSessionForm, setAddSessionForm] = useState({
    subjectName: '',
    subjectCode: '',
    resourceId: '',
    facultyId: '',
    type: 'theory' as 'theory' | 'practical' | 'tutorial' | 'seminar',
  });

  // Manual refresh function to force routine data update
  // Memoized current routine that always reflects the latest data from routines array
  const currentRoutine = useMemo(() => {
    if (!selectedRoutine) return null;
    const latestRoutine = routines.find(r => r.id === selectedRoutine.id) || selectedRoutine;
    console.log('currentRoutine updated:', {
      selectedRoutineId: selectedRoutine.id,
      selectedRoutineSessions: selectedRoutine.sessions.length,
      latestRoutineSessions: latestRoutine.sessions.length,
      routinesCount: routines.length
    });
    return latestRoutine;
  }, [selectedRoutine, routines]);

  const refreshRoutineData = async () => {
    if (!currentHOD) return;
    
    console.log('Manual refresh triggered - fetching latest routine data');
    try {
      const response = await TimetableService.getTimetablesByDepartment(currentHOD.department);
      console.log('Refresh response:', response);
      console.log('Refresh response data:', response.data);
      
      if (response.success && response.data) {
        const fetchedRoutines: Routine[] = response.data.map((rt: any) => ({
          id: rt.id.toString(),
          name: rt.name,
          department: currentHOD.department,
          semester: rt.semester,
          section: rt.section || 'A',
          academicYear: rt.academic_year || '2024-25',
          numberOfStudents: rt.number_of_students || 0,
          sessions: rt.entries ? rt.entries.map((entry: any) => {
            const matchingTimeSlot = DEFAULT_TIME_SLOTS.find(t => 
              t.startTime === entry.start_time && t.endTime === entry.end_time
            );
            console.log(`Mapping entry ${entry.id}: ${entry.start_time}-${entry.end_time} to timeSlot:`, matchingTimeSlot);
            
            const session = {
              id: entry.id.toString(),
              courseId: entry.subject_id.toString(),
              resourceId: entry.classroom_id.toString(),
              faculty: entry.faculty_name || entry.faculty_id.toString(),
              dayOfWeek: entry.day_of_week,
              timeSlotId: matchingTimeSlot?.id || '1',
              type: 'theory' as const,
            };
            console.log('Created session object:', session);
            return session;
          }) : [],
          generatedBy: currentHOD.name,
          generatedAt: rt.created_at || new Date().toISOString(),
          isActive: rt.is_active !== false,
          version: 1,
        }));
        
        console.log('Fetched routines with sessions:', fetchedRoutines);
        setRoutines(fetchedRoutines);
        
        // Update selectedRoutine to reflect the new data if one is currently selected
        if (selectedRoutine) {
          const updatedSelectedRoutine = fetchedRoutines.find(r => r.id === selectedRoutine.id);
          if (updatedSelectedRoutine) {
            console.log('Updating selectedRoutine with fresh data:', updatedSelectedRoutine);
            setSelectedRoutine(updatedSelectedRoutine);
          }
        }
        
        updateRoutineViews(fetchedRoutines);
        
        // Force re-render
        setRefreshKey(prev => prev + 1);
        
        toast({
          title: "Success",
          description: "Routine data refreshed successfully!",
        });
      }
    } catch (error) {
      console.error('Error refreshing routine data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh routine data. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!currentHOD) return;

    const fetchRoutines = async () => {
      try {
        console.log('Fetching routines for department:', currentHOD.department);
        const response = await TimetableService.getTimetablesByDepartment(currentHOD.department);
        console.log('Initial fetch response:', response);
        console.log('Initial fetch response data:', response.data);
        
        if (response.success && response.data) {
          const fetchedRoutines: Routine[] = response.data.map((rt: any) => ({
            id: rt.id.toString(),
            name: rt.name,
            department: currentHOD.department,
            semester: rt.semester,
            section: rt.section || 'A',
            academicYear: rt.academic_year || '2024-25',
            sessions: rt.entries ? rt.entries.map((entry: any) => ({
              id: entry.id.toString(),
              courseId: entry.subject_id.toString(),
              resourceId: entry.classroom_id.toString(),
              faculty: entry.faculty_name || entry.faculty_id.toString(),
              dayOfWeek: entry.day_of_week,
              timeSlotId: DEFAULT_TIME_SLOTS.find(t => 
                t.startTime === entry.start_time && t.endTime === entry.end_time
              )?.id || '1',
              type: 'theory',
            })) : [],
            generatedBy: currentHOD.name,
            generatedAt: rt.created_at || new Date().toISOString(),
            isActive: rt.is_active !== false,
            version: 1,
          }));
          
          console.log('Mapped routines:', fetchedRoutines);
          setRoutines(fetchedRoutines);
          updateRoutineViews(fetchedRoutines);
        }
      } catch (error) {
        console.error('Error fetching routines:', error);
        toast({
          title: "Error",
          description: "Failed to load routines from database.",
          variant: "destructive",
        });
      }
    };

    const fetchResources = async () => {
      try {
        const response = await ResourceService.getResourcesByDepartment(currentHOD.department);
        if (response.success && response.data) {
          setResources(response.data);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/subjects');
        const coursesData = response.data.map((subject: any) => ({
          id: subject.id.toString(),
          name: subject.name,
          code: subject.code,
          department: currentHOD.department,
          semester: subject.semester || 1,
          section: subject.section || 'A',
          faculty: subject.faculty_name || 'TBD',
          type: subject.type || 'theory',
          weeklyHours: subject.weekly_hours || 3,
          expectedSize: subject.expected_size || 30,
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchBookingRequests = async () => {
      try {
        // Fetch pending booking requests made by current HOD's department
        const response = await axios.get(`/api/booking-requests/requester/${currentHOD.department}`);
        if (response.data.success && response.data.data) {
          setBookingRequests(response.data.data.filter((req: any) => req.status === 'pending'));
          console.log('Fetched pending booking requests:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching booking requests:', error);
      }
    };

    const fetchAllTimetableEntries = async () => {
      try {
        // Fetch ALL timetable entries from ALL departments for cross-department conflict checking
        const response = await TimetableService.getAllTimetableEntries();
        if (response.success && response.data) {
          setAllTimetableEntries(response.data);
          console.log('🌍 LOADED ALL TIMETABLE ENTRIES FOR ROUTINE BUILDER:', response.data.length, response.data);
        }
      } catch (error) {
        console.error('Error fetching all timetable entries:', error);
      }
    };

    fetchRoutines();
    fetchResources();
    fetchCourses();
    fetchBookingRequests();
    fetchAllTimetableEntries();
  }, [currentHOD, toast]);

  // Listen for window focus to refresh data when user returns from other pages
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused - refreshing routine data');
      if (currentHOD) {
        refreshRoutineData();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && currentHOD) {
        console.log('Page became visible - refreshing routine data');
        refreshRoutineData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentHOD]);

  useEffect(() => {
    updateRoutineViews(routines);
  }, [routines, courses, resources]);

  // Load faculty and resources data
  useEffect(() => {
    const loadFacultyAndResources = async () => {
      if (!currentHOD) return;

      try {
        // Load faculty from the same department
        const facultyResponse = await axios.get(`/api/faculty/department/name/${currentHOD.department}`);
        console.log('Faculty response:', facultyResponse.data);
        if (facultyResponse.data.success) {
          setFaculty(facultyResponse.data.data);
          console.log('Faculty loaded:', facultyResponse.data.data);
        }

        // Load resources
        const resourcesResponse = await ResourceService.getAllResources();
        if (resourcesResponse.success && resourcesResponse.data) {
          setResources(resourcesResponse.data);
        }
      } catch (error) {
        console.error('Error loading faculty and resources:', error);
      }
    };

    loadFacultyAndResources();
  }, [currentHOD]);

  // Force refresh when component becomes visible (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && routines.length > 0) {
        console.log('Tab became visible - refreshing routine data');
        setTimeout(() => refreshRoutineData(), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also trigger refresh when component mounts with existing data
    if (routines.length > 0) {
      setTimeout(() => refreshRoutineData(), 300);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [routines.length, currentHOD]);

  const autoGenerateSessions = (coursesToSchedule: Course[], availableResources: Resource[]): ClassSession[] => {
    const sessions: ClassSession[] = [];
    let sessionId = 1;

    // Auto-allocate courses to available slots
    coursesToSchedule.forEach(course => {
      let hoursScheduled = 0;
      
      for (let day = 1; day <= 5 && hoursScheduled < course.weeklyHours; day++) { // Monday to Friday
        for (let timeIndex = 0; timeIndex < DEFAULT_TIME_SLOTS.length && hoursScheduled < course.weeklyHours; timeIndex++) {
          const timeSlot = DEFAULT_TIME_SLOTS[timeIndex];
          
          const suitableResource = availableResources.find(resource => {
            const hasCapacity = resource.capacity >= course.expectedSize;
            const isRightType = (course.type === 'practical' && resource.type === 'lab') ||
                              (course.type === 'theory' && (resource.type === 'classroom' || resource.type === 'seminar_hall'));
            
            const isSlotFree = !sessions.some(s => 
              s.resourceId === resource.id!.toString() && 
              s.timeSlotId === timeSlot.id && 
              s.dayOfWeek === day
            );
            
            return hasCapacity && isRightType && isSlotFree;
          });
           
          if (suitableResource) {
            sessions.push({
              id: `session_${sessionId++}`,
              courseId: course.id,
              resourceId: suitableResource.id!.toString(),
              faculty: course.faculty,
              dayOfWeek: day,
              timeSlotId: timeSlot.id,
              type: course.type,
            });
            hoursScheduled++;
          }
        }
      }
    });
    return sessions;
  };

  const updateRoutineViews = (routines: Routine[]) => {
    console.log('updateRoutineViews called with routines:', routines);
    const views: RoutineView[] = [];
    
    routines.forEach(routine => {
      console.log(`Processing routine ${routine.id} with ${routine.sessions.length} sessions:`, routine.sessions);
      
      // Group sessions by course
      const courseGroups = new Map<string, ClassSession[]>();
      
      routine.sessions.forEach(session => {
        if (!courseGroups.has(session.courseId)) {
          courseGroups.set(session.courseId, []);
        }
        courseGroups.get(session.courseId)!.push(session);
      });

      courseGroups.forEach((sessions, courseId) => {
        const course = courses.find(c => c.id === courseId);
        console.log(`Course group ${courseId}:`, { course: course?.name, sessionsCount: sessions.length });
        
        // Always add the view, even if course isn't found in the courses array
        // This ensures sessions are visible immediately after creation
        views.push({
          semester: routine.semester,
          section: routine.section || 'A',
          sessions,
          course, // This might be undefined for newly created courses
        });
      });
    });
    
    console.log('Generated routine views:', views);
    setRoutineViews(views);
  };

  const createNewRoutine = async () => {
    if (!newRoutineForm.name || !newRoutineForm.academicYear || !currentHOD) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log('Current HOD:', currentHOD);

    // Check if a routine with the same name, semester, section, and academic year already exists
    // This allows multiple routines for the same semester/section/year as long as they have different names (e.g., BBA, BCA)
    const existingRoutine = routines.find(r => 
      r.name === newRoutineForm.name &&
      r.semester === newRoutineForm.semester &&
      r.section === newRoutineForm.section &&
      r.academicYear === newRoutineForm.academicYear
    );

    if (existingRoutine) {
      toast({
        title: "Error",
        description: "A routine with this exact name, semester, section, and academic year already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Test API connection first
      console.log('Testing API connection...');
      const pingResponse = await axios.get('/api/ping');
      console.log('Ping response:', pingResponse.data);

      console.log('Creating routine with data:', {
        name: newRoutineForm.name,
        department: currentHOD.department,
        semester: newRoutineForm.semester,
        section: newRoutineForm.section,
        academicYear: newRoutineForm.academicYear,
      });

      // Filter courses and resources relevant to the new routine's department
      const relevantCourses = courses.filter(c => 
        c.department === currentHOD.department &&
        c.semester === newRoutineForm.semester &&
        c.section === newRoutineForm.section
      );
      const relevantResources = resources.filter(r => 
        r.department === currentHOD.department || r.isShared
      );

      console.log('All courses:', courses);
      console.log('All resources:', resources);
      console.log('Relevant courses found:', relevantCourses.length, relevantCourses);
      console.log('Relevant resources found:', relevantResources.length, relevantResources);

      // If no courses or resources, create empty routine but warn user
      if (relevantCourses.length === 0) {
        console.warn('No courses found for the department/semester/section');
        toast({
          title: "Warning",
          description: "No courses found for this department, semester, and section. Creating empty routine.",
        });
      }

      if (relevantResources.length === 0) {
        console.warn('No resources found for the department');
        toast({
          title: "Warning", 
          description: "No resources found for this department. Creating routine without room assignments.",
        });
      }

      // Auto-generate sessions for the new configuration
      let generatedSessions: ClassSession[] = [];
      
      if (relevantCourses.length > 0 && relevantResources.length > 0) {
        generatedSessions = autoGenerateSessions(relevantCourses, relevantResources);
        console.log('Generated sessions:', generatedSessions.length, generatedSessions);
      } else {
        console.log('Skipping session generation due to missing courses or resources');
      }

      // Create the timetable data for the API (without sessions initially)
      const timetableData = {
        name: newRoutineForm.name,
        department: currentHOD.department,
        semester: newRoutineForm.semester,
        section: newRoutineForm.section,
        academicYear: newRoutineForm.academicYear, // Keep camelCase for API interface
        numberOfStudents: newRoutineForm.numberOfStudents,
        sessions: [], // Always start with empty sessions to avoid conflicts
      };

      console.log('Sending timetable data to API:', timetableData);
      const response = await TimetableService.createTimetable(timetableData);
      console.log('API Response:', response);
      console.log('API Response Data:', JSON.stringify(response.data, null, 2)); // Debug: Check exact structure
      
      if (response.success && response.data) {
        // Convert the created timetable to routine format
        const newRoutine: Routine = {
          id: response.data.id.toString(),
          name: response.data.name,
          department: currentHOD.department,
          semester: response.data.semester,
          section: response.data.section || 'A',
          academicYear: response.data.academicYear || (response.data as any).academic_year || '2024-25', // Handle both camelCase and snake_case
          numberOfStudents: response.data.numberOfStudents || newRoutineForm.numberOfStudents,
          sessions: [], // Start with empty sessions
          generatedBy: currentHOD.name,
          generatedAt: new Date().toISOString(),
          isActive: true,
          version: 1,
        };

        // Save timetable entries if sessions were generated
        let successfulSessions: ClassSession[] = [];
        if (generatedSessions.length > 0) {
          console.log('Saving timetable entries...');
          try {
            await saveTimetableEntries(response.data.id.toString(), generatedSessions);
            successfulSessions = generatedSessions;
            console.log('Successfully saved all timetable entries');
          } catch (error) {
            console.warn('Some entries could not be saved due to conflicts, but routine was created');
            // Even if entries fail, we still show the routine as created
            // The sessions will be empty, but the routine exists
          }
        }

        // Update the routine with successful sessions (or empty array if conflicts occurred)
        newRoutine.sessions = successfulSessions;

        const updatedRoutines = [...routines, newRoutine];
        setRoutines(updatedRoutines);
        setSelectedRoutine(newRoutine);
        updateRoutineViews(updatedRoutines);

        setCreateDialogOpen(false);
        setNewRoutineForm({
          name: '',
          semester: 1,
          section: 'A',
          academicYear: '2024-25',
          numberOfStudents: 45,
        });

        const sessionMessage = successfulSessions.length > 0 
          ? ` with ${successfulSessions.length} sessions` 
          : (generatedSessions.length > 0 ? ' (sessions had conflicts - routine created without sessions)' : '');

        toast({
          title: "Success",
          description: `Routine created successfully${sessionMessage}!`,
        });

        // Refresh data from database to ensure consistency
        setTimeout(() => refreshRoutineData(), 500);
      } else {
        console.error('API returned error:', response);
        toast({
          title: "Error",
          description: response.message || "Failed to create routine.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating routine:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // More detailed error message
      let errorMessage = "Failed to create routine. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Please ensure the server is running.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check the server logs.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please ensure the server is running.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Function to initiate adding a session to a time slot
  const initiateAddSession = (timeSlotId: string, dayOfWeek: number) => {
    if (!selectedRoutine) return;
    
    setSelectedTimeSlot({ timeSlotId, dayOfWeek });
    setAddSessionForm({
      subjectName: '',
      subjectCode: '',
      resourceId: '',
      facultyId: '',
      type: 'theory',
    });
    setAddSessionDialogOpen(true);
  };

  // Function to save a new session
  const saveNewSession = async () => {
    if (!selectedRoutine || !selectedTimeSlot || !currentHOD) {
      toast({
        title: "Error",
        description: "Missing required information.",
        variant: "destructive",
      });
      return;
    }

    if (isCreatingSession) return; // Prevent multiple concurrent creations

    if (!addSessionForm.subjectName || !addSessionForm.resourceId || !addSessionForm.facultyId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSession(true);
    try {
      // Check if the selected resource belongs to another department
      const selectedResource = resources.find(r => r.id?.toString() === addSessionForm.resourceId);
      if (!selectedResource) {
        throw new Error("Selected resource not found");
      }

      // Check capacity warning
      const routineStudents = selectedRoutine.numberOfStudents || 0;
      if (selectedResource.capacity < routineStudents) {
        const confirmed = window.confirm(
          `Warning: The selected resource has capacity for ${selectedResource.capacity} students, but this routine has ${routineStudents} students. Do you want to proceed anyway?`
        );
        if (!confirmed) return;
      }

      // Check if resource belongs to different department
      if (selectedResource.department !== currentHOD.department) {
        // This should send a booking request instead of directly creating
        await createBookingRequest(selectedResource);
        return;
      }

      // Create the session directly if resource belongs to same department
      await createDirectSession();

    } catch (error: any) {
      console.error('Error saving session:', error);
      
      let errorMessage = "Failed to save session. Please try again.";
      
      // Check for detailed axios error response (for conflict messages)
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "Schedule conflict detected. Please choose a different time or resource.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Function to create a booking request for cross-department resource
  const createBookingRequest = async (resource: Resource) => {
    if (!selectedRoutine || !selectedTimeSlot || !currentHOD) return;

    const timeSlot = DEFAULT_TIME_SLOTS.find(t => t.id === selectedTimeSlot.timeSlotId);
    if (!timeSlot) throw new Error("Time slot not found");

    const bookingRequest = {
      id: Date.now().toString(),
      requesterId: currentHOD.id,
      requesterDepartment: currentHOD.department,
      targetResourceId: resource.id?.toString() || '',
      targetDepartment: resource.department,
      timeSlotId: selectedTimeSlot.timeSlotId,
      dayOfWeek: selectedTimeSlot.dayOfWeek,
      courseName: addSessionForm.subjectName,
      purpose: `${addSessionForm.type} session`,
      expectedAttendance: selectedRoutine.numberOfStudents || 0,
      requestDate: new Date().toISOString(),
      status: 'pending',
      // Additional fields needed for timetable entry creation
      timetableId: selectedRoutine.id,
      subjectName: addSessionForm.subjectName,
      subjectCode: addSessionForm.subjectCode || addSessionForm.subjectName.toLowerCase().replace(/\s+/g, ''),
      facultyId: addSessionForm.facultyId,
      sessionType: addSessionForm.type,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    };

    // Send booking request via API
    const response = await axios.post('/api/booking-requests', bookingRequest);
    
    if (response.data.success) {
      setAddSessionDialogOpen(false);
      
      // Refresh booking requests to show the new pending request
      try {
        const bookingResponse = await axios.get(`/api/booking-requests/requester/${currentHOD.department}`);
        if (bookingResponse.data.success && bookingResponse.data.data) {
          setBookingRequests(bookingResponse.data.data.filter((req: any) => req.status === 'pending'));
        }
      } catch (error) {
        console.error('Error refreshing booking requests:', error);
      }
      
      toast({
        title: "Booking Request Sent",
        description: `A booking request has been sent to ${resource.department} department for approval.`,
      });
    } else {
      throw new Error(response.data.message || "Failed to send booking request");
    }
  };

  // Function to create a session directly (same department resource)
  const createDirectSession = async () => {
    if (!selectedRoutine || !selectedTimeSlot || !currentHOD) return;

    const timeSlot = DEFAULT_TIME_SLOTS.find(t => t.id === selectedTimeSlot.timeSlotId);
    if (!timeSlot) throw new Error("Time slot not found");

    // First, try to find existing subject by code or create new one
    const subjectCode = addSessionForm.subjectCode || addSessionForm.subjectName.substring(0, 6).toUpperCase().replace(/\s+/g, '');
    
    let subjectId;
    try {
      // Try to find existing subject by code
      const existingSubjectResponse = await axios.get(`/api/subjects/code/${subjectCode}`);
      if (existingSubjectResponse.data) {
        subjectId = existingSubjectResponse.data.id;
      }
    } catch (error) {
      // Subject doesn't exist, create new one
      const subjectData = {
        name: addSessionForm.subjectName,
        code: subjectCode,
        credits: addSessionForm.type === 'practical' ? 2 : 3,
        type: addSessionForm.type === 'practical' ? 'practical' : 'lecture',
        department: currentHOD.department,
      };

      const subjectResponse = await axios.post('/api/subjects', subjectData);
      if (subjectResponse.data.success) {
        subjectId = subjectResponse.data.data.id;
        
        // Refresh courses after creating new subject
        try {
          const coursesResponse = await axios.get('/api/subjects');
          const coursesData = coursesResponse.data.map((subject: any) => ({
            id: subject.id.toString(),
            name: subject.name,
            code: subject.code,
            department: currentHOD.department,
            semester: subject.semester || 1,
            section: subject.section || 'A',
            faculty: subject.faculty_name || 'TBD',
            type: subject.type || 'theory',
            weeklyHours: subject.weekly_hours || 3,
            expectedSize: subject.expected_size || 30,
          }));
          setCourses(coursesData);
          console.log('Courses refreshed after creating new subject');
        } catch (error) {
          console.error('Error refreshing courses after creating subject:', error);
        }
      } else {
        throw new Error(subjectResponse.data.message || "Failed to create subject");
      }
    }

    // Create the timetable entry
    const entryData = {
      subject_id: subjectId,
      faculty_id: parseInt(addSessionForm.facultyId),
      classroom_id: parseInt(addSessionForm.resourceId),
      day_of_week: selectedTimeSlot.dayOfWeek,
      start_time: timeSlot.startTime,
      end_time: timeSlot.endTime,
    };

    console.log('Creating timetable entry with data:', entryData);
    console.log('Posting to URL:', `/api/timetables/${selectedRoutine.id}/entries`);

    try {
      const entryResponse = await axios.post(`/api/timetables/${selectedRoutine.id}/entries`, entryData);
      console.log('Entry creation response:', entryResponse.data);
      
      if (entryResponse.data.success) {
        setAddSessionDialogOpen(false);
        
        // Immediate refresh without delay
        await refreshRoutineData();
        
        toast({
          title: "Success",
          description: "Session added successfully!",
        });
      } else {
        throw new Error(entryResponse.data.message || "Failed to create session");
      }
    } catch (axiosError: any) {
      // Handle axios errors (409, 400, 500, etc.)
      if (axiosError.response?.data?.message) {
        // Use the detailed error message from the server
        throw new Error(axiosError.response.data.message);
      } else if (axiosError.response?.status === 409) {
        throw new Error("Schedule conflict detected. Please choose a different time or resource.");
      } else {
        throw new Error(axiosError.message || "Failed to create session");
      }
    }
  };

  // Function to check if a resource is available at the selected time slot
  const isResourceAvailable = (resourceId: string) => {
    if (!selectedTimeSlot || !selectedRoutine) return true;
    
    // Check local routines (from current department)
    const localConflict = routines.some(routine => 
      routine.sessions.some(session => 
        session.resourceId === resourceId &&
        session.timeSlotId === selectedTimeSlot.timeSlotId &&
        session.dayOfWeek === selectedTimeSlot.dayOfWeek &&
        routine.id !== selectedRoutine.id // Exclude current routine
      )
    );

    if (localConflict) {
      console.log('❌ Local conflict found for resource', resourceId, 'at', selectedTimeSlot);
      return false;
    }

    // Check global timetable entries (from all departments)
    const timeSlot = DEFAULT_TIME_SLOTS.find(ts => ts.id === selectedTimeSlot.timeSlotId);
    const globalConflict = allTimetableEntries.some(entry => {
      const entryStartTime = entry.startTime ? entry.startTime.substring(0, 5) : entry.start_time;
      const slotStartTime = timeSlot?.startTime;
      
      // Use resourceId first (if available from updated backend), fallback to classroom_id
      // Since IDs are synchronized, both should work the same
      const entryResourceId = entry.resourceId || entry.classroom_id;
      const resourceMatch = String(entryResourceId) === String(resourceId);
      const dayMatch = entry.dayOfWeek === selectedTimeSlot.dayOfWeek;
      const timeMatch = entryStartTime === slotStartTime;
      
      const isConflict = resourceMatch && dayMatch && timeMatch;
      
      if (isConflict) {
        console.log('❌ Global timetable conflict found:', {
          resourceId,
          selectedTimeSlot,
          conflictingEntry: {
            entryId: entry.id,
            entryResourceId,
            entryClassroomId: entry.classroom_id,
            entryDayOfWeek: entry.dayOfWeek,
            entryStartTime,
            departmentName: entry.department_name,
            subjectName: entry.subject_name
          }
        });
      }
      
      return isConflict;
    });

    return !globalConflict;
  };

  // Function to initiate routine editing
  const initiateEditRoutine = (routine: Routine) => {
    setRoutineToEdit(routine);
    setEditRoutineForm({
      name: routine.name,
      semester: routine.semester,
      section: routine.section || 'A',
      academicYear: routine.academicYear,
      numberOfStudents: routine.numberOfStudents || 45,
    });
    setEditDialogOpen(true);
  };

  // Function to save routine edits
  const saveRoutineEdits = async () => {
    if (!routineToEdit || !currentHOD) {
      toast({
        title: "Error",
        description: "Missing routine or HOD information.",
        variant: "destructive",
      });
      return;
    }

    if (!editRoutineForm.name || !editRoutineForm.academicYear) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update timetable via API
      const updateData = {
        id: routineToEdit.id,
        name: editRoutineForm.name,
        semester: editRoutineForm.semester,
        section: editRoutineForm.section,
        academicYear: editRoutineForm.academicYear,
        numberOfStudents: editRoutineForm.numberOfStudents,
      };

      const response = await TimetableService.updateTimetable(updateData);
      
      if (response.success) {
        // Update local state
        const updatedRoutines = routines.map(r => 
          r.id === routineToEdit.id 
            ? {
                ...r,
                name: editRoutineForm.name,
                semester: editRoutineForm.semester,
                section: editRoutineForm.section,
                academicYear: editRoutineForm.academicYear,
                numberOfStudents: editRoutineForm.numberOfStudents,
              }
            : r
        );
        
        setRoutines(updatedRoutines);
        updateRoutineViews(updatedRoutines);
        setEditDialogOpen(false);
        setRoutineToEdit(null);

        toast({
          title: "Success",
          description: "Routine updated successfully!",
        });

        // Refresh data from database to ensure consistency
        setTimeout(() => refreshRoutineData(), 500);
      } else {
        throw new Error(response.message || "Failed to update routine");
      }
    } catch (error: any) {
      console.error('Error updating routine:', error);
      
      let errorMessage = "Failed to update routine. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Function to initiate routine deletion
  const initiateDeleteRoutine = (routine: Routine) => {
    setRoutineToDelete(routine);
    setDeleteStep(1);
    setDeleteConfirmationText('');
    setDeleteDialogOpen(true);
  };

  // Function to delete a routine
  const deleteRoutine = async () => {
    if (!routineToDelete || !currentHOD) return;

    try {
      console.log('Deleting routine:', routineToDelete.id);
      
      // Call the API to delete the timetable using the service
      const response = await TimetableService.deleteTimetable(routineToDelete.id);
      
      if (response.success) {
        // Remove the routine from state
        const updatedRoutines = routines.filter(r => r.id !== routineToDelete.id);
        setRoutines(updatedRoutines);
        updateRoutineViews(updatedRoutines);
        
        // If the deleted routine was selected, clear selection
        if (selectedRoutine?.id === routineToDelete.id) {
          setSelectedRoutine(null);
        }

        // Close dialog and reset state
        setDeleteDialogOpen(false);
        setRoutineToDelete(null);
        setDeleteStep(1);
        setDeleteConfirmationText('');

        toast({
          title: "Success",
          description: `Routine "${routineToDelete.name}" has been permanently deleted.`,
        });

        // Refresh data to ensure consistency
        setTimeout(() => refreshRoutineData(), 500);
      } else {
        throw new Error(response.message || 'Failed to delete routine');
      }
    } catch (error: any) {
      console.error('Error deleting routine:', error);
      
      let errorMessage = "Failed to delete routine. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = "Routine not found. It may have already been deleted.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check the server logs.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Helper function to save timetable entries
  const saveTimetableEntries = async (timetableId: string, sessions: ClassSession[]) => {
    try {
      console.log(`Saving ${sessions.length} timetable entries for timetable ${timetableId}`);
      let successfulEntries = 0;
      let conflictEntries = 0;
      
      for (const session of sessions) {
        const timeSlot = DEFAULT_TIME_SLOTS.find(t => t.id === session.timeSlotId);
        if (timeSlot) {
          const entryData = {
            subject_id: parseInt(session.courseId),
            faculty_id: parseInt(session.faculty) || 1, // Default faculty if parsing fails
            classroom_id: parseInt(session.resourceId),
            day_of_week: session.dayOfWeek,
            start_time: timeSlot.startTime,
            end_time: timeSlot.endTime,
          };

          console.log('Attempting to save entry:', entryData);
          
          try {
            const entryResponse = await axios.post(`/api/timetables/${timetableId}/entries`, entryData);
            console.log('Entry saved successfully:', entryResponse.data);
            successfulEntries++;
          } catch (entryError: any) {
            console.error('Error saving individual entry:', entryError.response?.data || entryError.message);
            
            if (entryError.response?.data?.message?.includes('conflicts')) {
              console.warn('Entry conflict detected:', entryData);
              conflictEntries++;
              // Continue with other entries instead of failing completely
            } else if (entryError.response?.status === 409) {
              console.warn('409 Conflict - Entry already exists or conflicts:', entryData);
              conflictEntries++;
            } else {
              console.error('Non-conflict error, continuing anyway:', entryError);
              conflictEntries++;
            }
          }
        } else {
          console.warn('Time slot not found for session:', session);
        }
      }
      
      console.log(`Finished saving timetable entries: ${successfulEntries} successful, ${conflictEntries} conflicts`);
      
      // Don't throw error if some entries were saved successfully
      if (successfulEntries === 0 && conflictEntries > 0) {
        console.warn('All entries had conflicts, but continuing...');
      }
      
    } catch (error) {
      console.error('Error saving timetable entries:', error);
      // Don't throw the error to prevent routine creation from failing
      console.warn('Continuing despite save errors...');
    }
  };

  // Function to auto-generate sessions for an existing routine
  const autoGenerateForRoutine = async (routine: Routine) => {
    if (!currentHOD) return;

    try {
      // Get courses for this semester and section
      const relevantCourses = courses.filter(c => 
        c.department === currentHOD.department &&
        c.semester === routine.semester &&
        c.section === routine.section
      );
      
      // Get available resources
      const availableResources = resources.filter(r => 
        r.department === currentHOD.department || r.isShared
      );

      // Generate new sessions
      const newSessions = autoGenerateSessions(relevantCourses, availableResources);
      
      // Save the new sessions to database
      if (newSessions.length > 0) {
        await saveTimetableEntries(routine.id, newSessions);
        
        // Update the routine in state
        const updatedRoutines = routines.map(r => 
          r.id === routine.id 
            ? { ...r, sessions: [...r.sessions, ...newSessions] }
            : r
        );
        setRoutines(updatedRoutines);
        updateRoutineViews(updatedRoutines);
        
        toast({
          title: "Success",
          description: `Added ${newSessions.length} new sessions to the routine!`,
        });
      } else {
        toast({
          title: "Info",
          description: "No additional sessions could be generated. All courses may already be scheduled.",
        });
      }
    } catch (error) {
      console.error('Error auto-generating sessions:', error);
      toast({
        title: "Error",
        description: "Failed to generate additional sessions.",
        variant: "destructive",
      });
    }
  };

  const handleExportRoutine = (format: 'pdf' | 'excel') => {
    if (!selectedRoutine) return;
    
    // Prepare the export data
    const exportData = {
      routine: selectedRoutine,
      sessions: selectedRoutine.sessions,
      courses: courses,
      resources: resources
    };
    
    // Use the imported exportRoutine functions
    if (format === 'pdf') {
      exportRoutine.toPDF(exportData);
    } else if (format === 'excel') {
      exportRoutine.toCSV(exportData);
    }
  };

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id!.toString() === resourceId)?.name || 'Unknown Resource';
  };

  const getTimeSlotLabel = (timeSlotId: string) => {
    return DEFAULT_TIME_SLOTS.find(t => t.id === timeSlotId)?.label || 'Unknown Time';
  };

  const filteredViews = useMemo(() => {
    return routines.filter(routine =>
      routine.semester === selectedSemester && routine.section === selectedSection
    ).flatMap(routine => {
      const courseGroups = new Map<string, ClassSession[]>();
      routine.sessions.forEach(session => {
        if (!courseGroups.has(session.courseId)) {
          courseGroups.set(session.courseId, []);
        }
        courseGroups.get(session.courseId)!.push(session);
      });

      const views: RoutineView[] = [];
      courseGroups.forEach((sessions, courseId) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          views.push({
            semester: routine.semester,
            section: routine.section || 'A',
            sessions,
            course,
          });
        }
      });
      return views;
    });
  }, [routines, selectedSemester, selectedSection, courses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Routine Builder</h1>
          <p className="text-slate-600 mt-1">
            Create and manage class schedules for {currentHOD?.department}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={refreshRoutineData}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Routine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Routine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="routineName">Routine Name *</Label>
                  <Input
                    id="routineName"
                    value={newRoutineForm.name}
                    onChange={(e) => setNewRoutineForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., BCA, BBA, Geography, Mathematics"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={newRoutineForm.semester.toString()}
                      onValueChange={(value) => setNewRoutineForm(prev => ({ ...prev, semester: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(sem => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Select
                      value={newRoutineForm.section}
                      onValueChange={(value) => setNewRoutineForm(prev => ({ ...prev, section: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['A', 'B', 'C'].map(section => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={newRoutineForm.academicYear}
                    onChange={(e) => setNewRoutineForm(prev => ({ ...prev, academicYear: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="numberOfStudents">Number of Students</Label>
                  <Input
                    id="numberOfStudents"
                    type="number"
                    value={newRoutineForm.numberOfStudents}
                    onChange={(e) => setNewRoutineForm(prev => ({ ...prev, numberOfStudents: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g., 45"
                    min="1"
                    max="200"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={createNewRoutine}
                    disabled={!newRoutineForm.name}
                    className="flex-1"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Routine
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Routine Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setDeleteDialogOpen(false);
              setRoutineToDelete(null);
              setDeleteStep(1);
              setDeleteConfirmationText('');
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {deleteStep === 1 ? 'Delete Routine?' : 'Final Confirmation'}
                </DialogTitle>
              </DialogHeader>
              
              {deleteStep === 1 && routineToDelete && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-medium text-red-800">
                          You are about to permanently delete:
                        </p>
                        <div className="text-sm text-red-700">
                          <div className="font-semibold">{routineToDelete.name}</div>
                          <div>Semester {routineToDelete.semester}, Section {routineToDelete.section}</div>
                          <div>{routineToDelete.sessions.length} scheduled classes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-800">
                      <strong>Warning:</strong> This action cannot be undone. All scheduled classes and routine data will be permanently lost.
                    </AlertDescription>
                  </Alert>
                  
                  <p className="text-sm text-slate-600">
                    Are you sure you want to continue? Click "Yes, Delete" to proceed to final confirmation.
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="destructive"
                      onClick={() => setDeleteStep(2)}
                      className="flex-1"
                    >
                      Yes, Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {deleteStep === 2 && routineToDelete && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-medium text-red-900">
                          Final Confirmation Required
                        </p>
                        <p className="text-sm text-red-800">
                          To confirm deletion, please type the routine name exactly as shown:
                        </p>
                        <div className="font-mono text-sm bg-white p-2 rounded border border-red-200">
                          {routineToDelete.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                      Type routine name to confirm:
                    </Label>
                    <Input
                      id="deleteConfirmation"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      placeholder="Enter routine name"
                      className="mt-1"
                    />
                  </div>
                  
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-800">
                      <strong>Last Warning:</strong> This will permanently delete the routine and all its data. This action is irreversible.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="destructive"
                      onClick={deleteRoutine}
                      disabled={deleteConfirmationText !== routineToDelete.name}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Permanently Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Routine Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setEditDialogOpen(false);
              setRoutineToEdit(null);
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-blue-600">
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit Routine
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editRoutineName">Routine Name *</Label>
                  <Input
                    id="editRoutineName"
                    value={editRoutineForm.name}
                    onChange={(e) => setEditRoutineForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., BCA, BBA, Geography, Mathematics"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editSemester">Semester</Label>
                    <Select
                      value={editRoutineForm.semester.toString()}
                      onValueChange={(value) => setEditRoutineForm(prev => ({ ...prev, semester: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(sem => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="editSection">Section</Label>
                    <Select
                      value={editRoutineForm.section}
                      onValueChange={(value) => setEditRoutineForm(prev => ({ ...prev, section: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['A', 'B', 'C'].map(section => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editAcademicYear">Academic Year</Label>
                  <Input
                    id="editAcademicYear"
                    value={editRoutineForm.academicYear}
                    onChange={(e) => setEditRoutineForm(prev => ({ ...prev, academicYear: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="editNumberOfStudents">Number of Students</Label>
                  <Input
                    id="editNumberOfStudents"
                    type="number"
                    value={editRoutineForm.numberOfStudents}
                    onChange={(e) => setEditRoutineForm(prev => ({ ...prev, numberOfStudents: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g., 45"
                    min="1"
                    max="200"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={saveRoutineEdits}
                    disabled={!editRoutineForm.name || !editRoutineForm.academicYear}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Session Dialog */}
          <Dialog open={addSessionDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setAddSessionDialogOpen(false);
              setSelectedTimeSlot(null);
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-green-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Session
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedTimeSlot && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Time:</strong> {DAYS[selectedTimeSlot.dayOfWeek]} - {DEFAULT_TIME_SLOTS.find(t => t.id === selectedTimeSlot.timeSlotId)?.label}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Routine:</strong> {selectedRoutine?.name} (Students: {selectedRoutine?.numberOfStudents || 0})
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subjectName">Subject Name *</Label>
                    <Input
                      id="subjectName"
                      value={addSessionForm.subjectName}
                      onChange={(e) => setAddSessionForm(prev => ({ ...prev, subjectName: e.target.value }))}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subjectCode">Subject Code</Label>
                    <Input
                      id="subjectCode"
                      value={addSessionForm.subjectCode}
                      onChange={(e) => setAddSessionForm(prev => ({ ...prev, subjectCode: e.target.value }))}
                      placeholder="e.g., MATH101"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select
                    value={addSessionForm.type}
                    onValueChange={(value: 'theory' | 'practical' | 'tutorial' | 'seminar') => 
                      setAddSessionForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theory">Theory</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="facultySelect">Faculty *</Label>
                  <Select
                    value={addSessionForm.facultyId}
                    onValueChange={(value) => setAddSessionForm(prev => ({ ...prev, facultyId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty member" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map(f => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.name} - {f.designation || 'Faculty'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="resourceSelect">Resource (Classroom/Lab) *</Label>
                  <Select
                    value={addSessionForm.resourceId}
                    onValueChange={(value) => setAddSessionForm(prev => ({ ...prev, resourceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select classroom or lab" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources
                        .filter(r => r.type === 'classroom' || r.type === 'lab')
                        .map(resource => {
                          const isOwnDepartment = resource.department === currentHOD?.department;
                          const capacityWarning = resource.capacity < (selectedRoutine?.numberOfStudents || 0);
                          const isAvailable = isResourceAvailable(resource.id!.toString());
                          
                          return (
                            <SelectItem 
                              key={resource.id} 
                              value={resource.id!.toString()}
                              disabled={!isAvailable}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={!isAvailable ? 'text-slate-400' : ''}>
                                  {resource.name} ({resource.capacity} capacity)
                                  {!isAvailable && ' - Occupied'}
                                  {!isOwnDepartment && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {resource.department}
                                    </Badge>
                                  )}
                                </span>
                                {capacityWarning && isAvailable && (
                                  <AlertTriangle className="h-3 w-3 text-orange-500 ml-2" />
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  
                  {addSessionForm.resourceId && (() => {
                    const selectedResource = resources.find(r => r.id?.toString() === addSessionForm.resourceId);
                    if (!selectedResource) return null;
                    
                    const isOwnDepartment = selectedResource.department === currentHOD?.department;
                    const capacityWarning = selectedResource.capacity < (selectedRoutine?.numberOfStudents || 0);
                    
                    return (
                      <div className="mt-2 space-y-2">
                        {!isOwnDepartment && (
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <AlertDescription className="text-orange-800">
                              This resource belongs to <strong>{selectedResource.department}</strong> department. 
                              A booking request will be sent for approval.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {capacityWarning && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <AlertDescription className="text-red-800">
                              <strong>Capacity Warning:</strong> This resource has capacity for {selectedResource.capacity} students, 
                              but your routine has {selectedRoutine?.numberOfStudents || 0} students.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={saveNewSession}
                    disabled={!addSessionForm.subjectName || !addSessionForm.resourceId || !addSessionForm.facultyId || isCreatingSession}
                    className="flex-1"
                  >
                    {isCreatingSession ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Add Session
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAddSessionDialogOpen(false)}
                    disabled={isCreatingSession}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Routine Selection and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Active Routines
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Select
                value={selectedSemester.toString()}
                onValueChange={(value) => setSelectedSemester(parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C'].map(section => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routines.map(routine => (
              <div
                key={routine.id}
                className={`p-4 border rounded-lg transition-all ${
                  selectedRoutine?.id === routine.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedRoutine(routine)}
                  >
                    <h3 className="font-semibold">{routine.name}</h3>
                    <p className="text-sm text-slate-600">
                      Semester {routine.semester}, Section {routine.section}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={routine.isActive ? 'default' : 'secondary'}>
                      {routine.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateEditRoutine(routine);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                      title="Edit Routine"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateDeleteRoutine(routine);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      title="Delete Routine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedRoutine(routine)}
                >
                  <div className="text-sm text-slate-500">
                    {routine.sessions.length} classes scheduled
                  </div>
                  <div className="text-xs text-slate-400">
                    Students: {routine.numberOfStudents || 'Not specified'} • Generated: {new Date(routine.generatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Routine Display */}
      {currentRoutine && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentRoutine.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportRoutine('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportRoutine('excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weekly" className="space-y-4">
              <TabsList>
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                <TabsTrigger value="course">Course View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="space-y-4">
                <div className="overflow-x-auto">
                  <table key={`${currentRoutine.id}-${currentRoutine.sessions.length}-${refreshKey}`} className="w-full border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 p-3 text-left">Time</th>
                        {DAYS.slice(1, 6).map(day => (
                          <th key={day} className="border border-slate-200 p-3 text-center">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DEFAULT_TIME_SLOTS.map(timeSlot => (
                        <tr key={timeSlot.id}>
                          <td className="border border-slate-200 p-3 font-medium bg-slate-50">
                            {timeSlot.label}
                          </td>
                          {[1, 2, 3, 4, 5].map(day => {
                            const session = currentRoutine.sessions.find(s =>
                              s.timeSlotId === timeSlot.id && s.dayOfWeek === day
                            );
                            const course = session ? courses.find(c => c.id === session.courseId) : null;
                            
                            // Check for pending booking requests for this time slot
                            const pendingRequest = bookingRequests.find(req =>
                              req.timeSlotId === timeSlot.id && req.dayOfWeek === day
                            );
                            
                            return (
                              <td key={day} className="border border-slate-200 p-3">
                                {session && course ? (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{course.name}</div>
                                    <div className="text-xs text-slate-600">{course.code}</div>
                                    <div className="text-xs text-slate-600">{session.faculty}</div>
                                    <div className="text-xs text-slate-500">
                                      {getResourceName(session.resourceId)}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {session.type}
                                    </Badge>
                                  </div>
                                ) : pendingRequest ? (
                                  <div className="space-y-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                                    <div className="font-medium text-sm text-yellow-800">{pendingRequest.courseName}</div>
                                    <div className="text-xs text-yellow-600">{pendingRequest.purpose}</div>
                                    <div className="text-xs text-yellow-600">Request to: {pendingRequest.targetDepartment}</div>
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                      Pending Approval
                                    </Badge>
                                  </div>
                                ) : (
                                  <div 
                                    className="text-center text-slate-400 text-sm cursor-pointer hover:bg-slate-50 hover:text-slate-600 p-2 rounded transition-colors"
                                    onClick={() => initiateAddSession(timeSlot.id, day)}
                                    title="Click to add a session"
                                  >
                                    <Plus className="h-4 w-4 mx-auto mb-1" />
                                    Add Session
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="course" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredViews.map((view, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{view.course.name}</CardTitle>
                            <p className="text-sm text-slate-600">
                              {view.course.code} • {view.course.faculty}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{view.course.type}</Badge>
                            <div className="text-sm text-slate-600 mt-1">
                              {view.course.weeklyHours}h/week
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {view.sessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <div className="flex items-center space-x-3">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <div>
                                  <div className="font-medium text-sm">
                                    {DAYS[session.dayOfWeek]} • {getTimeSlotLabel(session.timeSlotId)}
                                  </div>
                                  <div className="text-xs text-slate-600">
                                    {getResourceName(session.resourceId)}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {session.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Sessions Scheduled:</span>
                            <span className="font-medium">
                              {view.sessions.length} / {view.course.weeklyHours}
                            </span>
                          </div>
                          {view.sessions.length < view.course.weeklyHours && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {view.course.weeklyHours - view.sessions.length} sessions still need to be scheduled
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
