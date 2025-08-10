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
import { useToast } from '@/hooks/use-toast';
import { Resource, WeeklyTimeSlot, BookingRequest, ClassSession, Course, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
import { ResourceService } from '@/services/resource-service';
import { BookingRequestService } from '@/services/booking-request-service';
import { ClassSessionService } from '@/services/class-session-service';
import { TimetableService } from '@/services/timetable-service';
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

// Function to map legacy time slot IDs to current format
const mapTimeSlotId = (timeSlotId: string): string => {
  const mappings: { [key: string]: string } = {
    'morning_1': '1',    // 08:00-09:30
    'morning_2': '2',    // 09:30-11:00  
    'afternoon_1': '4',  // 12:45-14:15
    'afternoon_2': '5',  // 14:15-15:45
    'evening_1': '6',    // 15:45-17:15
  };
  
  return mappings[timeSlotId] || timeSlotId;
};

export default function Resources() {
  const { currentHOD } = useHODAuth();
  const { toast } = useToast();
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [departmentResources, setDepartmentResources] = useState<Resource[]>([]);
  const [universityResources, setUniversityResources] = useState<Resource[]>([]);
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [weeklySlots, setWeeklySlots] = useState<WeeklyTimeSlot[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  const [allTimetableEntries, setAllTimetableEntries] = useState<any[]>([]); // For university resources
  const [loading, setLoading] = useState(true);
  const [showUnavailableSlots, setShowUnavailableSlots] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    resourceId: string;
    timeSlotId: string;
    dayOfWeek: number;
  } | null>(null);
  
  const [bookingForm, setBookingForm] = useState({
    purpose: '',
    expectedAttendees: '',
    additionalRequirements: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [conflicts, setConflicts] = useState<string[]>([]);

  // Helper function to categorize resources by type
  const categorizeResources = (resources: Resource[]) => {
    const classrooms = resources.filter(r => r.type === 'classroom');
    const nonClassrooms = resources.filter(r => r.type !== 'classroom');
    return { classrooms, nonClassrooms };
  };

  // Helper function to get appropriate timetable entries for a resource
  const getTimetableEntriesForResource = (resourceId: string) => {
    // Find the resource to determine if it's department or university resource
    const resource = allResources.find(r => r.id?.toString() === resourceId);
    if (!resource) return allTimetableEntries; // Default to all entries if resource not found
    
    // If it's a department resource (belongs to current HOD's department), use department entries
    // If it's a university resource (different department), use all entries
    if (resource.department === currentHOD?.department) {
      return timetableEntries; // Department-specific entries
    } else {
      return allTimetableEntries; // All university entries
    }
  };

  // Manual refresh function to force slot occupancy update
  const refreshSlotOccupancy = () => {
    console.log('Manual refresh triggered - forcing slot occupancy update');
    console.log('Current data - classSessions:', classSessions.length, 'timetableEntries:', timetableEntries.length, 'bookingRequests:', bookingRequests.length);
    if (weeklySlots.length > 0) {
      setWeeklySlots(prev => prev.map(slot => {
        // Check for class session
        const session = classSessions.find(s =>
          s.resourceId === slot.resourceId &&
          s.timeSlotId === slot.timeSlotId &&
          s.dayOfWeek === slot.dayOfWeek
        );

        if (session) {
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: session.courseId,
              courseName: `Course ${session.courseId}`,
              department: currentHOD?.department || '',
              faculty: session.faculty,
              classSize: 0,
            }
          };
        }

        // Check for timetable entry (this is the key fix!)
        const timeSlot = DEFAULT_TIME_SLOTS.find(ts => ts.id === slot.timeSlotId);
        const relevantTimetableEntries = getTimetableEntriesForResource(slot.resourceId);
        const timetableEntry = relevantTimetableEntries.find(entry => {
          const entryStartTime = entry.startTime ? entry.startTime.substring(0, 5) : entry.start_time; // Handle both formats
          const slotStartTime = timeSlot?.startTime;
          
          // Use resourceId first (if available from updated backend), fallback to classroom_id
          // Since IDs are synchronized, both should work the same
          const entryResourceId = entry.resourceId || entry.classroom_id;
          const resourceMatch = String(entryResourceId) === String(slot.resourceId);
          const dayMatch = entry.dayOfWeek === slot.dayOfWeek;
          const timeMatch = entryStartTime === slotStartTime;
          
          // Enhanced debug logging for ALL CS Lecture Hall Monday slots
          if (slot.resourceId === '3' && slot.dayOfWeek === 1) {
            console.log('� TIMETABLE MATCHING DEBUG for CS Lecture Hall (resourceId=3), Monday (dayOfWeek=1):', {
              slotInfo: { 
                resourceId: slot.resourceId, 
                timeSlotId: slot.timeSlotId, 
                dayOfWeek: slot.dayOfWeek,
                timeSlotStartTime: slotStartTime 
              },
              entryInfo: {
                entryId: entry.id,
                entryResourceId: entryResourceId,
                entryClassroomId: entry.classroom_id,
                entryDayOfWeek: entry.dayOfWeek,
                entryStartTime: entryStartTime,
                entrySubjectName: entry.subject_name
              },
              matching: {
                resourceMatch: `${entryResourceId} === ${slot.resourceId} ? ${resourceMatch}`,
                dayMatch: `${entry.dayOfWeek} === ${slot.dayOfWeek} ? ${dayMatch}`,
                timeMatch: `${entryStartTime} === ${slotStartTime} ? ${timeMatch}`,
                overallMatch: resourceMatch && dayMatch && timeMatch
              }
            });
          }
          
          return resourceMatch && dayMatch && timeMatch;
        });

        if (timetableEntry) {
          console.log('Found timetable entry for slot:', slot.resourceId, slot.timeSlotId, slot.dayOfWeek, timetableEntry);
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: timetableEntry.subjectId || timetableEntry.subject_id || '',
              courseName: timetableEntry.subjectName || timetableEntry.subject_name || 'Scheduled Class',
              department: currentHOD?.department || '',
              faculty: timetableEntry.facultyName || timetableEntry.faculty_name || 'Faculty',
              classSize: 0,
            }
          };
        }

        // Check for approved booking request
        const booking = bookingRequests.find(b => {
          const mappedTimeSlotId = mapTimeSlotId(b.timeSlotId);
          return String(b.targetResourceId) === String(slot.resourceId) &&
                 String(mappedTimeSlotId) === String(slot.timeSlotId) &&
                 b.dayOfWeek === slot.dayOfWeek &&
                 b.status === 'approved';
        });

        if (booking) {
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: '',
              courseName: booking.purpose || booking.courseName,
              department: booking.requesterDepartment,
              faculty: 'External Booking',
              classSize: booking.expectedAttendance || 0,
            }
          };
        }

        return {
          ...slot,
          isOccupied: false,
          occupiedBy: undefined,
        };
      }));
    }
  };

  // Load resources and data from database
  useEffect(() => {
    const loadData = async () => {
      if (!currentHOD) return;
      
      setLoading(true);
      try {
        // Load all resources first
        const allResourcesResponse = await ResourceService.getAllResources();
        let allResourcesData: Resource[] = [];
        
        if (allResourcesResponse.success && allResourcesResponse.data) {
          allResourcesData = allResourcesResponse.data;
          setAllResources(allResourcesData);
          
          console.log('Current HOD department:', currentHOD.department);
          console.log('All resources data:', allResourcesData.map(r => ({ id: r.id, name: r.name, department: r.department })));
          
          // Categorize resources based on department
          const deptResources = allResourcesData.filter(r => 
            r.department === currentHOD.department
          );
          const uniResources = allResourcesData.filter(r => 
            r.department !== currentHOD.department
          );
          
          console.log('Department resources:', deptResources.map(r => ({ id: r.id, name: r.name, department: r.department })));
          console.log('University resources:', uniResources.map(r => ({ id: r.id, name: r.name, department: r.department })));
          
          setDepartmentResources(deptResources);
          setUniversityResources(uniResources);
        } else {
          // Fallback to the old method if getAllResources doesn't work
          console.warn('getAllResources failed, falling back to separate calls');
          
          // Load department resources
          const deptResponse = await ResourceService.getResourcesByDepartment(currentHOD.department);
          if (deptResponse.success && deptResponse.data) {
            setDepartmentResources(deptResponse.data);
            allResourcesData.push(...deptResponse.data);
          }

          // Load shared university resources
          const sharedResponse = await ResourceService.getSharedResources();
          if (sharedResponse.success && sharedResponse.data) {
            setUniversityResources(sharedResponse.data);
            allResourcesData.push(...sharedResponse.data);
          }
          
          setAllResources(allResourcesData);
        }

        // Load booking requests
        const bookingsResponse = await BookingRequestService.getRequestsByTargetDepartment(currentHOD.department);
        if (bookingsResponse.success && bookingsResponse.data) {
          setBookingRequests(bookingsResponse.data);
        }

        // Load class sessions
        const sessionsResponse = await ClassSessionService.getSessionsByDepartment(currentHOD.department);
        if (sessionsResponse.success && sessionsResponse.data) {
          setClassSessions(sessionsResponse.data);
        }

        // Load timetable entries to check real occupancy
        // 1. Load entries for current department (for department resources)
        const timetablesResponse = await TimetableService.getTimetablesByDepartment(currentHOD.department);
        if (timetablesResponse.success && timetablesResponse.data) {
          // Collect all entries from all active timetables
          const allEntries: any[] = [];
          for (const timetable of timetablesResponse.data) {
            const timetableAny = timetable as any; // Use any to access API response properties
            console.log('Processing timetable:', timetableAny.name, 'isActive:', timetableAny.is_active, 'entries:', timetableAny.entries?.length);
            if (timetableAny.is_active && timetableAny.entries) {
              console.log('Adding entries from active timetable:', timetableAny.entries);
              allEntries.push(...timetableAny.entries);
            }
          }
          setTimetableEntries(allEntries);
          console.log('🎯 LOADED DEPARTMENT TIMETABLE ENTRIES:', allEntries.length, allEntries);
        }

        // 2. Load ALL timetable entries from ALL departments (for university resources)
        const allEntriesResponse = await TimetableService.getAllTimetableEntries();
        if (allEntriesResponse.success && allEntriesResponse.data) {
          setAllTimetableEntries(allEntriesResponse.data);
          console.log('🌍 LOADED ALL UNIVERSITY TIMETABLE ENTRIES:', allEntriesResponse.data.length, allEntriesResponse.data);
          
          // Debug: specifically check for CS Lecture Hall entries
          const csLectureHallEntries = allEntriesResponse.data.filter((entry: any) => 
            (entry.resourceId === 3 || entry.classroom_id === 3) && entry.dayOfWeek === 1
          );
          console.log('🏛️ CS LECTURE HALL MONDAY ENTRIES FROM ALL DEPARTMENTS:', csLectureHallEntries);
        }

        // Generate weekly slots for all resources
        generateWeeklySlots(allResourcesData);

        // Force slot occupancy update after a brief delay to ensure slots are generated
        setTimeout(() => {
          console.log('Forcing slot occupancy update...');
          if (weeklySlots.length > 0) {
            console.log('Updating slot occupancy with booking requests:', bookingRequests.length);
          }
        }, 200);

      } catch (error) {
        console.error('Error loading resources:', error);
        toast({
          title: "Error",
          description: "Failed to load resources. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentHOD, toast]);

  // Force refresh when component becomes visible (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && weeklySlots.length > 0) {
        console.log('Tab became visible - refreshing slot occupancy');
        setTimeout(() => refreshSlotOccupancy(), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also trigger refresh when component mounts with existing data
    if (weeklySlots.length > 0) {
      setTimeout(() => refreshSlotOccupancy(), 300);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [weeklySlots.length, classSessions.length, timetableEntries.length, allTimetableEntries.length, bookingRequests.length]);

  // Generate weekly time slots for resources
  const generateWeeklySlots = (allResources: Resource[]) => {
    const slots: WeeklyTimeSlot[] = [];
    
    allResources.forEach(resource => {
      DEFAULT_TIME_SLOTS.forEach(timeSlot => {
        [1, 2, 3, 4, 5].forEach(day => { // Monday to Friday
          slots.push({
            id: `${resource.id}_${timeSlot.id}_${day}`,
            resourceId: resource.id!.toString(),
            timeSlotId: timeSlot.id,
            dayOfWeek: day,
            isOccupied: false,
            bookingDate: new Date().toISOString(),
          });
        });
      });
    });
    
    setWeeklySlots(slots);
  };

  // Update slots when class sessions, timetable entries, or booking requests change
  useEffect(() => {
    console.log('Slot occupancy useEffect triggered - slots:', weeklySlots.length, 'sessions:', classSessions.length, 'timetableEntries:', timetableEntries.length, 'allTimetableEntries:', allTimetableEntries.length, 'bookings:', bookingRequests.length);
    if (weeklySlots.length > 0) {
      console.log('Updating slot occupancy...');
      setWeeklySlots(prev => prev.map(slot => {
        // Check for class session
        const session = classSessions.find(s =>
          s.resourceId === slot.resourceId &&
          s.timeSlotId === slot.timeSlotId &&
          s.dayOfWeek === slot.dayOfWeek
        );

        if (session) {
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: session.courseId,
              courseName: `Course ${session.courseId}`,
              department: currentHOD?.department || '',
              faculty: session.faculty,
              classSize: 0,
            }
          };
        }

        // Check for timetable entry (this is the important part!)
        const timeSlot = DEFAULT_TIME_SLOTS.find(ts => ts.id === slot.timeSlotId);
        const relevantTimetableEntries = getTimetableEntriesForResource(slot.resourceId);
        const timetableEntry = relevantTimetableEntries.find(entry => {
          const entryStartTime = entry.startTime ? entry.startTime.substring(0, 5) : entry.start_time; // Handle both formats
          const slotStartTime = timeSlot?.startTime;
          
          // Use resourceId first (if available from updated backend), fallback to classroom_id
          // Since IDs are synchronized, both should work the same
          const entryResourceId = entry.resourceId || entry.classroom_id;
          const resourceMatch = String(entryResourceId) === String(slot.resourceId);
          const dayMatch = entry.dayOfWeek === slot.dayOfWeek;
          const timeMatch = entryStartTime === slotStartTime;
          
          // Enhanced debug logging - log ALL entries for CS Lecture Hall Monday 9-10 slot
          if (slot.resourceId === '3' && slot.timeSlotId === '2' && slot.dayOfWeek === 1) {
            console.log('🔍 DETAILED DEBUG for CS Lecture Hall (resourceId=3), Monday (day=1), 9-10 slot (timeSlotId=2):', {
              entryData: entry,
              slotData: { resourceId: slot.resourceId, timeSlotId: slot.timeSlotId, dayOfWeek: slot.dayOfWeek },
              dataSource: relevantTimetableEntries === timetableEntries ? 'DEPARTMENT_ENTRIES' : 'ALL_UNIVERSITY_ENTRIES',
              matching: {
                entryResourceId: entryResourceId,
                entryClassroomId: entry.classroom_id,
                slotResourceId: slot.resourceId,
                resourceMatch,
                entryDay: entry.dayOfWeek,
                slotDay: slot.dayOfWeek,
                dayMatch,
                entryTime: entryStartTime,
                slotTime: slotStartTime,
                timeMatch,
                overallMatch: resourceMatch && dayMatch && timeMatch
              }
            });
          }
          
          return resourceMatch && dayMatch && timeMatch;
        });

        if (timetableEntry) {
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: timetableEntry.subjectId || timetableEntry.subject_id || '',
              courseName: timetableEntry.subjectName || timetableEntry.subject_name || 'Scheduled Class',
              department: timetableEntry.department_name || currentHOD?.department || '',
              faculty: timetableEntry.facultyName || timetableEntry.faculty_name || 'Faculty',
              classSize: 0,
            }
          };
        }

        // Check for approved booking request
        const booking = bookingRequests.find(b => {
          const mappedTimeSlotId = mapTimeSlotId(b.timeSlotId);
          return String(b.targetResourceId) === String(slot.resourceId) &&
                 String(mappedTimeSlotId) === String(slot.timeSlotId) &&
                 b.dayOfWeek === slot.dayOfWeek &&
                 b.status === 'approved';
        });

        if (booking) {
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: '',
              courseName: booking.purpose || booking.courseName,
              department: booking.requesterDepartment,
              faculty: 'External Booking',
              classSize: booking.expectedAttendance || 0,
            }
          };
        }

        return {
          ...slot,
          isOccupied: false,
          occupiedBy: undefined,
        };
      }));
    }
  }, [classSessions, timetableEntries, allTimetableEntries, bookingRequests, currentHOD, weeklySlots.length]);

  const getSlotForResource = (resourceId: string, timeSlotId: string, day: number) => {
    return weeklySlots.find(slot =>
      slot.resourceId === resourceId &&
      slot.timeSlotId === timeSlotId &&
      slot.dayOfWeek === day
    );
  };

  const getAvailableSlotCount = (resources: Resource[]) => {
    let availableCount = 0;
    let totalCount = 0;
    
    resources.forEach(resource => {
      DEFAULT_TIME_SLOTS.forEach(timeSlot => {
        const slot = getSlotForResource(resource.id!.toString(), timeSlot.id, selectedDay);
        totalCount++;
        if (!slot?.isOccupied) {
          availableCount++;
        }
      });
    });
    
    return { availableCount, totalCount };
  };

  const openBookingDialog = (resource: Resource, resourceId: string, timeSlotId: string, dayOfWeek: number) => {
    setSelectedResource(resource);
    setSelectedSlot({ resourceId, timeSlotId, dayOfWeek });
    setBookingDialogOpen(true);
    setConflicts([]);
  };

  const handleBookingRequest = async () => {
    if (!selectedSlot || !selectedResource || !currentHOD) return;

    // Check for conflicts
    const existingSession = classSessions.find(s =>
      s.resourceId === selectedSlot.resourceId &&
      s.timeSlotId === selectedSlot.timeSlotId &&
      s.dayOfWeek === selectedSlot.dayOfWeek
    );

    const existingBooking = bookingRequests.find(b =>
      b.targetResourceId === selectedSlot.resourceId &&
      b.timeSlotId === selectedSlot.timeSlotId &&
      b.dayOfWeek === selectedSlot.dayOfWeek &&
      (b.status === 'approved' || b.status === 'pending')
    );

    // Check for timetable entry conflict
    const timeSlot = DEFAULT_TIME_SLOTS.find(ts => ts.id === selectedSlot.timeSlotId);
    const relevantEntriesForConflict = getTimetableEntriesForResource(selectedSlot.resourceId);
    const existingTimetableEntry = relevantEntriesForConflict.find(entry => {
      const entryStartTime = entry.startTime ? entry.startTime.substring(0, 5) : entry.start_time;
      const slotStartTime = timeSlot?.startTime;
      const entryResourceId = entry.resourceId || entry.classroom_id;
      return String(entryResourceId) === String(selectedSlot.resourceId) &&
             entry.dayOfWeek === selectedSlot.dayOfWeek &&
             entryStartTime === slotStartTime;
    });

    if (existingSession || existingBooking || existingTimetableEntry) {
      setConflicts(['This time slot is already occupied or has a pending request']);
      return;
    }

    try {
      const newBookingRequest = {
        requesterId: currentHOD.name,
        requesterDepartment: currentHOD.department,
        requesterDesignation: currentHOD.designation, // Added for auto-approval logic
        targetResourceId: selectedSlot.resourceId,
        targetDepartment: selectedResource.department,
        timeSlotId: selectedSlot.timeSlotId,
        dayOfWeek: selectedSlot.dayOfWeek,
        courseName: bookingForm.purpose,
        purpose: bookingForm.additionalRequirements,
        expectedAttendance: parseInt(bookingForm.expectedAttendees) || 0,
      };

      const response = await BookingRequestService.createRequest(newBookingRequest);
      
      if (response.success && response.data) {
        setBookingRequests(prev => [...prev, response.data!]);
        setBookingDialogOpen(false);
        setSelectedSlot(null);
        setSelectedResource(null);
        setBookingForm({
          purpose: '',
          expectedAttendees: '',
          additionalRequirements: '',
          contactEmail: '',
          contactPhone: '',
        });
        setConflicts([]);
        
        toast({
          title: "Success",
          description: "Booking request submitted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit booking request.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const ResourceGrid = ({ resources }: { resources: Resource[] }) => {
    return (
      <div className="grid gap-6">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <p className="text-sm text-slate-600">
                      Capacity: {resource.capacity} • {resource.location}
                    </p>
                    {resource.facilities && resource.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resource.facilities.map((facility, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {resource.type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_TIME_SLOTS
                  .filter((timeSlot) => {
                    if (showUnavailableSlots) return true;
                    const slot = getSlotForResource(resource.id!.toString(), timeSlot.id, selectedDay);
                    return !slot?.isOccupied;
                  })
                  .map((timeSlot) => {
                  const slot = getSlotForResource(resource.id!.toString(), timeSlot.id, selectedDay);
                  
                  return (
                    <div
                      key={timeSlot.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${slot?.isOccupied 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : 'bg-green-50 border-green-200 hover:bg-green-100'
                        }
                      `}
                      onClick={() => {
                        if (!slot?.isOccupied) {
                          openBookingDialog(resource, resource.id!.toString(), timeSlot.id, selectedDay);
                        }
                      }}
                    >
                      <div className="text-xs font-medium text-slate-700">
                        {timeSlot.label}
                      </div>
                      {slot?.isOccupied && slot.occupiedBy ? (
                        <div className="mt-1">
                          <div className="text-xs font-medium text-slate-900">
                            {slot.occupiedBy.courseName}
                          </div>
                          <div className="text-xs text-slate-600">
                            {slot.occupiedBy.faculty}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-green-600 mt-1">Available</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const ResourceCategory = ({ resources, title, isShared = false }: { 
    resources: Resource[], 
    title: string, 
    isShared?: boolean 
  }) => {
    const { classrooms, nonClassrooms } = categorizeResources(resources);
    
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          {isShared && <Globe className="h-5 w-5 mr-2 text-blue-500" />}
          {title}
        </h2>
        
        {/* Classrooms Section */}
        {classrooms.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900">
                Classrooms ({classrooms.length})
              </h3>
            </div>
            <ResourceGrid resources={classrooms} />
          </div>
        )}
        
        {/* Non-Classrooms Section */}
        {nonClassrooms.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-slate-900">
                Labs & Special Facilities ({nonClassrooms.length})
              </h3>
            </div>
            <ResourceGrid resources={nonClassrooms} />
          </div>
        )}
        
        {resources.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No resources available in this category
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Overview</h1>
          <p className="text-slate-600">
            View and book university resources for your department
          </p>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={() => setShowUnavailableSlots(!showUnavailableSlots)}
            variant={showUnavailableSlots ? "default" : "outline"}
            className={showUnavailableSlots ? "bg-orange-600 hover:bg-orange-700" : "border-orange-300 text-orange-700 hover:bg-orange-50"}
          >
            {showUnavailableSlots ? "Hide" : "Show"} Occupied Slots
          </Button>
          <Button 
            onClick={refreshSlotOccupancy}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Refresh Slots
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {DAYS.slice(1, 6).map((day, index) => {
            const dayNumber = index + 1;
            return (
              <Button
                key={dayNumber}
                variant={selectedDay === dayNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDay(dayNumber)}
              >
                {day}
              </Button>
            );
          })}
        </div>
        <div className="text-sm text-slate-600">
          {(() => {
            const deptSlots = getAvailableSlotCount(departmentResources);
            const uniSlots = getAvailableSlotCount(universityResources);
            const totalAvailable = deptSlots.availableCount + uniSlots.availableCount;
            const totalSlots = deptSlots.totalCount + uniSlots.totalCount;
            return showUnavailableSlots 
              ? `${totalSlots} total slots (${totalAvailable} available, ${totalSlots - totalAvailable} occupied)`
              : `${totalAvailable} available slots`;
          })()}
        </div>
      </div>

      {/* Resources Tabs */}
      <Tabs defaultValue="department" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="department">Department Resources</TabsTrigger>
          <TabsTrigger value="university">College Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="department">
          <ResourceCategory 
            resources={departmentResources} 
            title={`${currentHOD?.department} Resources`}
          />
        </TabsContent>
        
        <TabsContent value="university">
          <ResourceCategory 
            resources={universityResources} 
            title="Other College Resources"
            isShared={true}
          />
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Resource Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedResource && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-medium">{selectedResource.name}</div>
                <div className="text-sm text-slate-600">
                  {selectedSlot && (
                    <>
                      {DAYS[selectedSlot.dayOfWeek]} • {
                        DEFAULT_TIME_SLOTS.find(t => t.id === selectedSlot.timeSlotId)?.label
                      }
                    </>
                  )}
                </div>
              </div>
            )}

            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {conflicts.map((conflict, index) => (
                      <li key={index}>{conflict}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Describe the purpose of this booking..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="attendees">Expected Attendees</Label>
              <Input
                id="attendees"
                type="number"
                value={bookingForm.expectedAttendees}
                onChange={(e) => setBookingForm(prev => ({ ...prev, expectedAttendees: e.target.value }))}
                placeholder="Number of expected attendees"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                value={bookingForm.additionalRequirements}
                onChange={(e) => setBookingForm(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                placeholder="Any special equipment or setup requirements..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={bookingForm.contactEmail}
                onChange={(e) => setBookingForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="your.email@university.edu"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                value={bookingForm.contactPhone}
                onChange={(e) => setBookingForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="Phone number"
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleBookingRequest} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
