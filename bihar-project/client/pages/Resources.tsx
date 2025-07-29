import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { Resource, WeeklyTimeSlot, BookingRequest, ClassSession, Course, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  Send, 
  Filter,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
  Globe,
  Wand2
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Sample data for university resources
const SAMPLE_SHARED_RESOURCES: Resource[] = [
  {
    id: 'shared_1',
    name: 'Main Auditorium',
    type: 'seminar_hall',
    capacity: 500,
    department: 'University',
    location: 'Ground Floor, Main Building',
    facilities: ['Projector', 'Audio System', 'AC', 'Stage'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'shared_2',
    name: 'Conference Hall A',
    type: 'conference_room',
    capacity: 50,
    department: 'University',
    location: 'First Floor, Admin Building',
    facilities: ['Video Conferencing', 'Smart Board', 'AC'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'shared_3',
    name: 'Computer Lab - Central',
    type: 'lab',
    capacity: 60,
    department: 'University',
    location: 'Second Floor, IT Building',
    facilities: ['60 Computers', 'Projector', 'Internet', 'AC'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'shared_4',
    name: 'Seminar Hall B',
    type: 'seminar_hall',
    capacity: 100,
    department: 'University',
    location: 'Third Floor, Academic Block',
    facilities: ['Projector', 'Audio System', 'AC'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export default function Resources() {
  const { currentHOD } = useHODAuth();
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [departmentResources, setDepartmentResources] = useState<Resource[]>([]);
  const [universityResources, setUniversityResources] = useState<Resource[]>([]);
  const [departmentSlots, setDepartmentSlots] = useState<WeeklyTimeSlot[]>([]);
  const [universitySlots, setUniversitySlots] = useState<WeeklyTimeSlot[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Booking request state
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [bookingForm, setBookingForm] = useState({
    resourceId: '',
    purpose: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: '',
    notes: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    resourceId: string;
    timeSlotId: string;
    dayOfWeek: number;
  } | null>(null);
  
  const [allocationForm, setAllocationForm] = useState({
    courseId: '',
    faculty: '',
    type: 'theory' as 'theory' | 'practical' | 'tutorial' | 'seminar',
  });
  
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Load resources and bookings
  useEffect(() => {
    if (!currentHOD) return;
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Set university resources
        setUniversityResources(SAMPLE_SHARED_RESOURCES);
        
        // Generate department resources based on HOD department
        const deptResources: Resource[] = 
          currentHOD.department === 'Geography' ? [
            {
              id: 'geo_1',
              name: 'Geography Lab',
              type: 'lab',
              capacity: 40,
              department: 'Geography',
              location: 'First Floor, Science Building',
              facilities: ['Maps', 'GIS Workstations', 'Projector'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
            {
              id: 'geo_2',
              name: 'Lecture Hall - Geography',
              type: 'classroom',
              capacity: 80,
              department: 'Geography',
              location: 'Second Floor, Science Building',
              facilities: ['Projector', 'Smart Board', 'AC'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
            {
              id: 'geo_3',
              name: 'Field Equipment Room',
              type: 'lab',
              capacity: 20,
              department: 'Geography',
              location: 'Ground Floor, Science Building',
              facilities: ['Survey Equipment', 'Storage Cabinets'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          ] : currentHOD.department === 'Computer Science' ? [
            {
              id: 'cs_1',
              name: 'Computer Lab A',
              type: 'lab',
              capacity: 60,
              department: 'Computer Science',
              location: 'First Floor, Tech Building',
              facilities: ['Computers', 'Projector', 'Internet', 'Development Software'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
            {
              id: 'cs_2',
              name: 'Computer Lab B',
              type: 'lab',
              capacity: 40,
              department: 'Computer Science',
              location: 'First Floor, Tech Building',
              facilities: ['Computers', 'Projector', 'Internet', 'Networking Equipment'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
            {
              id: 'cs_3',
              name: 'Lecture Hall - CS',
              type: 'classroom',
              capacity: 100,
              department: 'Computer Science',
              location: 'Second Floor, Tech Building',
              facilities: ['Projector', 'Smart Board', 'AC', 'Audio System'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          ] : [
            {
              id: 'biz_1',
              name: 'Business Lab',
              type: 'lab',
              capacity: 50,
              department: 'Business Management',
              location: 'Ground Floor, Business Building',
              facilities: ['Computers', 'Projector', 'Internet', 'Presentation Tools'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
            {
              id: 'biz_2',
              name: 'Lecture Hall - Business',
              type: 'classroom',
              capacity: 100,
              department: 'Business Management',
              location: 'First Floor, Business Building',
              facilities: ['Projector', 'Smart Board', 'AC', 'Audio System'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
            {
              id: 'biz_3',
              name: 'Conference Room - Business',
              type: 'conference_room',
              capacity: 25,
              department: 'Business Management',
              location: 'Second Floor, Business Building',
              facilities: ['Video Conferencing', 'Projector', 'Whiteboard'],
              isShared: false,
              isActive: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          ];

        setDepartmentResources(deptResources);

        // Generate sample courses
        const deptCourses: Course[] = 
          currentHOD.department === 'Geography' ? [
            {
              id: 'geo_course_1',
              name: 'Physical Geography',
              code: 'GEO101',
              department: 'Geography',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Kumar Singh',
              weeklyHours: 4,
              expectedSize: 35,
              type: 'theory',
              isActive: true,
            },
            {
              id: 'geo_course_2',
              name: 'Human Geography',
              code: 'GEO102',
              department: 'Geography',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Priya Sharma',
              weeklyHours: 4,
              expectedSize: 40,
              type: 'theory',
              isActive: true,
            },
            {
              id: 'geo_course_3',
              name: 'GIS Practical',
              code: 'GEO103',
              department: 'Geography',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Amit Singh',
              weeklyHours: 2,
              expectedSize: 30,
              type: 'practical',
              isActive: true,
            },
          ] : currentHOD.department === 'Computer Science' ? [
            {
              id: 'cs_course_1',
              name: 'Introduction to Programming',
              code: 'CS101',
              department: 'Computer Science',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Rajesh Kumar',
              weeklyHours: 4,
              expectedSize: 60,
              type: 'theory',
              isActive: true,
            },
            {
              id: 'cs_course_2',
              name: 'Data Structures',
              code: 'CS102',
              department: 'Computer Science',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Neha Gupta',
              weeklyHours: 4,
              expectedSize: 55,
              type: 'theory',
              isActive: true,
            },
            {
              id: 'cs_course_3',
              name: 'Programming Lab',
              code: 'CS103',
              department: 'Computer Science',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Amit Singh',
              weeklyHours: 2,
              expectedSize: 60,
              type: 'practical',
              isActive: true,
            },
          ] : [
            {
              id: 'biz_course_1',
              name: 'Principles of Management',
              code: 'BM101',
              department: 'Business Management',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Sunita Rani',
              weeklyHours: 4,
              expectedSize: 45,
              type: 'theory',
              isActive: true,
            },
            {
              id: 'biz_course_2',
              name: 'Business Economics',
              code: 'BM102',
              department: 'Business Management',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Rajiv Sharma',
              weeklyHours: 4,
              expectedSize: 50,
              type: 'theory',
              isActive: true,
            },
            {
              id: 'biz_course_3',
              name: 'Business Communication',
              code: 'BM103',
              department: 'Business Management',
              semester: 1,
              section: 'A',
              faculty: 'Dr. Priya Verma',
              weeklyHours: 2,
              expectedSize: 45,
              type: 'practical',
              isActive: true,
            },
          ];

        setCourses(deptCourses);

        // Generate weekly slots
        generateWeeklySlots(deptResources, SAMPLE_SHARED_RESOURCES);

        // Generate sample class sessions
        generateSampleSessions(deptResources, deptCourses);

        // Generate sample booking requests
        generateSampleBookingRequests();

        setLoading(false);
      } catch (err) {
        setError('Failed to load resources. Please try again.');
        setLoading(false);
      }
    }, 1000);
  }, [currentHOD]);

  // Generate weekly time slots for resources
  const generateWeeklySlots = (deptResources: Resource[], uniResources: Resource[]) => {
    // Department resources slots
    const deptSlots: WeeklyTimeSlot[] = [];
    deptResources.forEach(resource => {
      DEFAULT_TIME_SLOTS.forEach(timeSlot => {
        [1, 2, 3, 4, 5].forEach(day => { // Monday to Friday
          deptSlots.push({
            id: `${resource.id}_${timeSlot.id}_${day}`,
            resourceId: resource.id,
            timeSlotId: timeSlot.id,
            dayOfWeek: day,
            isAvailable: true,
          });
        });
      });
    });
    setDepartmentSlots(deptSlots);

    // University resources slots
    const uniSlots: WeeklyTimeSlot[] = [];
    uniResources.forEach(resource => {
      DEFAULT_TIME_SLOTS.forEach(timeSlot => {
        [1, 2, 3, 4, 5].forEach(day => { // Monday to Friday
          uniSlots.push({
            id: `${resource.id}_${timeSlot.id}_${day}`,
            resourceId: resource.id,
            timeSlotId: timeSlot.id,
            dayOfWeek: day,
            isAvailable: true,
          });
        });
      });
    });
    setUniversitySlots(uniSlots);
  };

  // Generate sample class sessions
  const generateSampleSessions = (resources: Resource[], courses: Course[]) => {
    if (resources.length === 0 || courses.length === 0) return;

    const sessions: ClassSession[] = [];
    const classrooms = resources.filter(r => r.type === 'classroom' || r.type === 'lab');
    
    if (classrooms.length === 0) return;

    // Assign each course to some time slots
    courses.forEach((course, index) => {
      const classroom = classrooms[index % classrooms.length];
      
      // Theory classes - 2 sessions per week
      if (course.type === 'theory') {
        // Monday morning
        sessions.push({
          id: `session_${course.id}_1`,
          courseId: course.id,
          resourceId: classroom.id,
          dayOfWeek: 1, // Monday
          timeSlotId: DEFAULT_TIME_SLOTS[1].id, // 10:00 - 11:00
          faculty: course.faculty,
          type: 'theory',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Wednesday afternoon
        sessions.push({
          id: `session_${course.id}_2`,
          courseId: course.id,
          resourceId: classroom.id,
          dayOfWeek: 3, // Wednesday
          timeSlotId: DEFAULT_TIME_SLOTS[3].id, // 12:00 - 13:00
          faculty: course.faculty,
          type: 'theory',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      // Practical classes - 1 session per week
      if (course.type === 'practical') {
        const labRoom = resources.find(r => r.type === 'lab') || classroom;
        
        // Friday afternoon
        sessions.push({
          id: `session_${course.id}_1`,
          courseId: course.id,
          resourceId: labRoom.id,
          dayOfWeek: 5, // Friday
          timeSlotId: DEFAULT_TIME_SLOTS[4].id, // 13:00 - 14:00
          faculty: course.faculty,
          type: 'practical',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    setClassSessions(sessions);
  };

  // Generate sample booking requests
  const generateSampleBookingRequests = () => {
    const requests: BookingRequest[] = [
      {
        id: 'req_1',
        resourceId: SAMPLE_SHARED_RESOURCES[0].id, // Main Auditorium
        requestedBy: currentHOD?.id || 'unknown',
        department: currentHOD?.department || 'Unknown',
        purpose: 'Department Annual Day Celebration',
        date: '2024-06-15',
        startTime: '14:00',
        endTime: '18:00',
        attendees: 300,
        status: 'pending',
        notes: 'Need full audio-visual setup and stage arrangements',
        createdAt: '2024-05-20T10:30:00Z',
        updatedAt: '2024-05-20T10:30:00Z',
      },
      {
        id: 'req_2',
        resourceId: SAMPLE_SHARED_RESOURCES[1].id, // Conference Hall
        requestedBy: currentHOD?.id || 'unknown',
        department: currentHOD?.department || 'Unknown',
        purpose: 'Faculty Meeting',
        date: '2024-06-10',
        startTime: '10:00',
        endTime: '12:00',
        attendees: 25,
        status: 'approved',
        notes: 'Need projector and video conferencing setup',
        createdAt: '2024-05-15T09:15:00Z',
        updatedAt: '2024-05-16T14:20:00Z',
        approvedBy: 'admin',
        approvedAt: '2024-05-16T14:20:00Z',
      },
      {
        id: 'req_3',
        resourceId: SAMPLE_SHARED_RESOURCES[2].id, // Computer Lab
        requestedBy: currentHOD?.id || 'unknown',
        department: currentHOD?.department || 'Unknown',
        purpose: 'Special Workshop on Data Analysis',
        date: '2024-06-20',
        startTime: '09:00',
        endTime: '13:00',
        attendees: 40,
        status: 'rejected',
        notes: 'Need computers with statistical software installed',
        createdAt: '2024-05-18T11:45:00Z',
        updatedAt: '2024-05-19T10:10:00Z',
        rejectedBy: 'admin',
        rejectedAt: '2024-05-19T10:10:00Z',
        rejectionReason: 'Lab already booked for university-wide examination',
      },
    ];
    
    setBookingRequests(requests);
  };

  // Handle booking form submission
  const handleBookingSubmit = () => {
    // Validation
    if (!bookingForm.resourceId || !bookingForm.purpose || !bookingForm.date || 
        !bookingForm.startTime || !bookingForm.endTime) {
      setError('Please fill all required fields');
      return;
    }
    
    // Create new booking request
    const newRequest: BookingRequest = {
      id: `req_${Date.now()}`,
      resourceId: bookingForm.resourceId,
      requestedBy: currentHOD?.id || 'unknown',
      department: currentHOD?.department || 'Unknown',
      purpose: bookingForm.purpose,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      attendees: parseInt(bookingForm.attendees) || 0,
      status: 'pending',
      notes: bookingForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to state
    setBookingRequests([...bookingRequests, newRequest]);
    
    // Reset form and close dialog
    setBookingForm({
      resourceId: '',
      purpose: '',
      date: '',
      startTime: '',
      endTime: '',
      attendees: '',
      notes: '',
    });
    setBookingDialogOpen(false);
  };

  // Open allocation dialog
  const openAllocationDialog = (resourceId: string, timeSlotId: string, dayOfWeek: number) => {
    setSelectedSlot({ resourceId, timeSlotId, dayOfWeek });
    setAllocationForm({
      courseId: '',
      faculty: '',
      type: 'theory',
    });
    setConflicts([]);
    setAllocationDialogOpen(true);
  };

  // Handle allocation form submission
  const handleAllocateSlot = () => {
    if (!selectedSlot || !allocationForm.courseId || !allocationForm.faculty) {
      setError('Please fill all required fields');
      return;
    }
    
    // Check for conflicts
    const conflictChecks: string[] = [];
    
    // Check if resource is already allocated at this time
    const resourceConflict = classSessions.find(
      s => s.resourceId === selectedSlot.resourceId && 
           s.dayOfWeek === selectedSlot.dayOfWeek && 
           s.timeSlotId === selectedSlot.timeSlotId
    );
    
    if (resourceConflict) {
      const course = courses.find(c => c.id === resourceConflict.courseId);
      conflictChecks.push(`Resource already allocated to ${course?.name || 'another course'} at this time`);
    }
    
    // Check if faculty is already teaching at this time
    const facultyConflict = classSessions.find(
      s => s.faculty === allocationForm.faculty && 
           s.dayOfWeek === selectedSlot.dayOfWeek && 
           s.timeSlotId === selectedSlot.timeSlotId
    );
    
    if (facultyConflict) {
      const course = courses.find(c => c.id === facultyConflict.courseId);
      conflictChecks.push(`Faculty already teaching ${course?.name || 'another course'} at this time`);
    }
    
    // If conflicts found, show them
    if (conflictChecks.length > 0) {
      setConflicts(conflictChecks);
      return;
    }
    
    // Create new session
    const newSession: ClassSession = {
      id: `session_${Date.now()}`,
      courseId: allocationForm.courseId,
      resourceId: selectedSlot.resourceId,
      dayOfWeek: selectedSlot.dayOfWeek,
      timeSlotId: selectedSlot.timeSlotId,
      faculty: allocationForm.faculty,
      type: allocationForm.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to state
    setClassSessions([...classSessions, newSession]);
    
    // Close dialog
    setAllocationDialogOpen(false);
  };

  // Handle removing an allocation
  const handleRemoveAllocation = (session: ClassSession) => {
    setClassSessions(classSessions.filter(s => s.id !== session.id));
  };

  // Get resource availability for a specific day and time slot
  const getResourceAvailability = (resourceId: string, timeSlotId: string, day: number) => {
    const session = classSessions.find(
      s => s.resourceId === resourceId && s.timeSlotId === timeSlotId && s.dayOfWeek === day
    );
    
    if (session) {
      const course = courses.find(c => c.id === session.courseId);
      return {
        isOccupied: true,
        occupiedBy: {
          courseId: session.courseId,
          courseName: course?.name || 'Unknown Course',
          faculty: session.faculty,
          type: session.type,
          classSize: course?.expectedSize || 0,
        }
      };
    }

    return {
      isOccupied: false,
      occupiedBy: undefined,
    };
  };

  // Auto-generate routine
  const autoGenerateRoutine = async () => {
    try {
      setLoading(true);
      
      // Clear existing sessions
      setClassSessions([]);
      
      // Wait for 1 second to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate new sessions
      const newSessions: ClassSession[] = [];
      const classrooms = departmentResources.filter(r => r.type === 'classroom' || r.type === 'lab');
      
      if (classrooms.length === 0 || courses.length === 0) {
        setError('Not enough resources or courses to generate routine');
        setLoading(false);
        return;
      }
      
      // Assign each course to time slots
      courses.forEach((course, index) => {
        const classroom = classrooms[index % classrooms.length];
        const sessionsNeeded = course.type === 'theory' ? 3 : 1; // Theory: 3 sessions, Practical: 1 session
        
        // Find available slots
        const availableSlots: {day: number, timeSlot: typeof DEFAULT_TIME_SLOTS[0]}[] = [];
        
        // Check all days and time slots
        [1, 2, 3, 4, 5].forEach(day => { // Monday to Friday
          DEFAULT_TIME_SLOTS.forEach(timeSlot => {
            // Check if slot is available
            const isSlotAvailable = !newSessions.some(
              s => (s.resourceId === classroom.id && s.dayOfWeek === day && s.timeSlotId === timeSlot.id) || 
                   (s.faculty === course.faculty && s.dayOfWeek === day && s.timeSlotId === timeSlot.id)
            );
            
            if (isSlotAvailable) {
              availableSlots.push({ day, timeSlot });
            }
          });
        });
        
        // Shuffle available slots to randomize allocation
        const shuffledSlots = [...availableSlots].sort(() => 0.5 - Math.random());
        
        // Allocate sessions
        for (let i = 0; i < Math.min(sessionsNeeded, shuffledSlots.length); i++) {
          const slot = shuffledSlots[i];
          
          newSessions.push({
            id: `session_${course.id}_${i}`,
            courseId: course.id,
            resourceId: classroom.id,
            dayOfWeek: slot.day,
            timeSlotId: slot.timeSlot.id,
            faculty: course.faculty,
            type: course.type,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
      
      setClassSessions(newSessions);
      setLoading(false);
    } catch (error) {
      console.error('Error auto-generating routine:', error);
      setError('Failed to generate routine. Please try again.');
      setLoading(false);
    }
  };

  // Transform weekly slots with session data
  const getTransformedSlots = (slots: WeeklyTimeSlot[], day: number) => {
    return slots.filter(slot => slot.dayOfWeek === day).map(slot => {
      const availability = getResourceAvailability(slot.resourceId, slot.timeSlotId, day);
      return {
        ...slot,
        isOccupied: availability.isOccupied,
        occupiedBy: availability.occupiedBy,
      };
    });
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
            <p className="text-slate-600 mt-1">Manage department and university resources</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={autoGenerateRoutine}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-Generate Routine
            </Button>
            <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.slice(1, 6).map((day, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resources Tabs */}
        <Tabs defaultValue="department" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="department"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Department Resources
            </TabsTrigger>
            <TabsTrigger
              value="university"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Globe className="h-4 w-4 mr-2" />
              University Resources
            </TabsTrigger>
          </TabsList>

          {/* Department Resources Tab */}
          <TabsContent value="department" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  {currentHOD?.department} Resources - {DAYS[selectedDay]} Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {departmentResources.map(resource => {
                    const timeSlots = DEFAULT_TIME_SLOTS;
                    const resourceSlots = getTransformedSlots(
                      departmentSlots.filter(s => s.resourceId === resource.id),
                      selectedDay
                    );

                    return (
                      <Card key={resource.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2 capitalize">
                                {resource.type.replace('_', ' ')}
                              </Badge>
                              <CardTitle className="text-lg">{resource.name}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                                <Users className="h-3 w-3 mr-1" />
                                {resource.capacity}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-1 p-2">
                            {timeSlots.map(timeSlot => {
                              const slot = resourceSlots.find(s => s.timeSlotId === timeSlot.id);
                              const course = slot?.occupiedBy ? courses.find(c => c.id === slot.occupiedBy?.courseId) : null;
                              const session = classSessions.find(
                                s => s.resourceId === resource.id && s.timeSlotId === timeSlot.id && s.dayOfWeek === selectedDay
                              );

                              return (
                                <div
                                  key={`${resource.id}_${timeSlot.id}`}
                                  className={`p-2 rounded-md border cursor-pointer transition-colors ${
                                    slot?.isOccupied 
                                      ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' 
                                      : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  }`}
                                  onClick={() => {
                                    if (slot?.isOccupied && session) {
                                      // Show option to remove
                                      if (confirm('Remove this class allocation?')) {
                                        handleRemoveAllocation(session);
                                      }
                                    } else {
                                      openAllocationDialog(resource.id, timeSlot.id, selectedDay);
                                    }
                                  }}
                                >
                                  <div className="font-medium text-xs">{timeSlot.label}</div>
                                  {slot?.isOccupied && course ? (
                                    <div className="mt-2 space-y-1">
                                      <div className="text-xs font-medium">{course.name}</div>
                                      <div className="text-xs">{slot.occupiedBy?.faculty}</div>
                                      <div className="text-xs">
                                        {slot.occupiedBy?.type} • {slot.occupiedBy?.classSize} students
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-xs">
                                      <Plus className="h-3 w-3 mx-auto mb-1" />
                                      Allocate
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* University Resources Tab */}
          <TabsContent value="university" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  University Resources - {DAYS[selectedDay]} Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {universityResources.map(resource => {
                    const timeSlots = DEFAULT_TIME_SLOTS;
                    
                    return (
                      <Card key={resource.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2 capitalize">
                                {resource.type.replace('_', ' ')}
                              </Badge>
                              <CardTitle className="text-lg">{resource.name}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                                <Users className="h-3 w-3 mr-1" />
                                {resource.capacity}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => {
                                setBookingForm({
                                  ...bookingForm,
                                  resourceId: resource.id,
                                });
                                setBookingDialogOpen(true);
                              }}>
                                <Send className="h-3 w-3 mr-1" />
                                Request
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-1 p-2">
                            {timeSlots.map(timeSlot => {
                              // Check if there's a booking for this resource on the selected day
                              const hasBooking = bookingRequests.some(
                                req => req.resourceId === resource.id && 
                                      req.status === 'approved' && 
                                      req.date === `2024-06-${selectedDay + 10}` && // Just for demo
                                      req.startTime <= timeSlot.start && 
                                      req.endTime >= timeSlot.end
                              );
                              
                              const booking = hasBooking 
                                ? bookingRequests.find(
                                    req => req.resourceId === resource.id && 
                                          req.status === 'approved' && 
                                          req.date === `2024-06-${selectedDay + 10}` && 
                                          req.startTime <= timeSlot.start && 
                                          req.endTime >= timeSlot.end
                                  )
                                : null;

                              return (
                                <div
                                  key={`${resource.id}_${timeSlot.id}`}
                                  className={`p-2 rounded-md border ${
                                    hasBooking 
                                      ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                      : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-pointer'
                                  }`}
                                  onClick={() => {
                                    if (!hasBooking) {
                                      setBookingForm({
                                        ...bookingForm,
                                        resourceId: resource.id,
                                        date: `2024-06-${selectedDay + 10}`,
                                        startTime: timeSlot.start,
                                        endTime: timeSlot.end,
                                      });
                                      setBookingDialogOpen(true);
                                    }
                                  }}
                                >
                                  <div className="font-medium text-xs">{timeSlot.label}</div>
                                  {hasBooking && booking ? (
                                    <div className="mt-2 space-y-1">
                                      <div className="text-xs font-medium">{booking.purpose}</div>
                                      <div className="text-xs">{booking.department}</div>
                                      <div className="text-xs">
                                        <Users className="h-3 w-3 inline mr-1" />
                                        {booking.attendees}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-xs">
                                      <Plus className="h-3 w-3 mx-auto mb-1" />
                                      Book
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Booking Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  My Booking Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No booking requests found
                    </div>
                  ) : (
                    bookingRequests.map(request => {
                      const resource = universityResources.find(r => r.id === request.resourceId);
                      
                      return (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{request.purpose}</h3>
                                <p className="text-sm text-slate-600">{resource?.name}</p>
                                <div className="flex items-center mt-2 text-sm text-slate-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {request.date}
                                  <Clock className="h-4 w-4 ml-3 mr-1" />
                                  {request.startTime} - {request.endTime}
                                  <Users className="h-4 w-4 ml-3 mr-1" />
                                  {request.attendees} attendees
                                </div>
                              </div>
                              <Badge className={
                                request.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }>
                                {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                {request.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </div>
                            
                            {request.status === 'rejected' && request.rejectionReason && (
                              <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                                <strong>Reason:</strong> {request.rejectionReason}
                              </div>
                            )}
                            
                            {request.notes && (
                              <div className="mt-3 text-sm text-slate-600">
                                <strong>Notes:</strong> {request.notes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      )}

      {/* Resource Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book University Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resource">Resource</Label>
              <Select 
                value={bookingForm.resourceId} 
                onValueChange={(value) => setBookingForm({...bookingForm, resourceId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {universityResources.map(resource => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name} ({resource.capacity} capacity)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input 
                id="purpose" 
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})}
                placeholder="e.g., Department Meeting, Workshop, etc."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={bookingForm.startTime}
                  onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={bookingForm.endTime}
                  onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Expected Attendees</Label>
              <Input 
                id="attendees" 
                type="number" 
                value={bookingForm.attendees}
                onChange={(e) => setBookingForm({...bookingForm, attendees: e.target.value})}
                placeholder="Number of attendees"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Any special requirements or additional information"
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleBookingSubmit}
                disabled={!bookingForm.resourceId || !bookingForm.purpose || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setBookingDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Class Allocation Dialog */}
      <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Class Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select 
                value={allocationForm.courseId} 
                onValueChange={(value) => setAllocationForm({...allocationForm, courseId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Input 
                id="faculty" 
                value={allocationForm.faculty}
                onChange={(e) => setAllocationForm({...allocationForm, faculty: e.target.value})}
                placeholder="Faculty name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Class Type</Label>
              <Select 
                value={allocationForm.type} 
                onValueChange={(value: 'theory' | 'practical' | 'tutorial' | 'seminar') => 
                  setAllocationForm({...allocationForm, type: value})}
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

            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1 mt-2">
                    {conflicts.map((conflict, index) => (
                      <div key={index}>{conflict}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleAllocateSlot}
                disabled={!allocationForm.courseId || !allocationForm.faculty}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Allocate
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAllocationDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}