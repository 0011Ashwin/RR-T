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
  Wand2,
  University,
  School
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PrincipalResources() {
  const { toast } = useToast();
  
  // Get Principal authentication data from localStorage
  const principalEmail = localStorage.getItem("principalEmail");
  const principalName = localStorage.getItem("principalName");
  const principalCollege = localStorage.getItem("principalCollege");
  
  // Principal context - has admin access to all resources
  const currentPrincipal = {
    id: 'principal_1',
    name: principalName || 'Dr. Priya Sharma',
    email: principalEmail,
    college: principalCollege || 'Magadh Mahila College',
    role: 'Principal'
  };

  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [sharedResources, setSharedResources] = useState<Resource[]>([]); // Resources with null department_id
  const [collegeResources, setCollegeResources] = useState<Resource[]>([]); // All other departmental resources
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [weeklySlots, setWeeklySlots] = useState<WeeklyTimeSlot[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  const [allTimetableEntries, setAllTimetableEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnavailableSlots, setShowUnavailableSlots] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    resourceId: string;
    timeSlotId: string;
    dayOfWeek: number;
  } | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    purpose: '',
    expectedAttendees: '',
    additionalRequirements: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchResources(),
        fetchBookingRequests(),
        fetchClassSessions(),
        fetchTimetableEntries(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await ResourceService.getAllResources();
      if (response.success && response.data) {
        setAllResources(response.data);
        
        console.log('Principal fetching resources:', response.data.map(r => ({ 
          id: r.id, 
          name: r.name, 
          department: r.department, 
          isShared: r.isShared 
        })));
        
        // Categorize resources for Principal:
        // 1. Shared Resources - Resources with null department OR isShared=true (Principal has full control)
        const shared = response.data.filter(r => 
          r.department === null || 
          r.department === undefined || 
          r.department === 'University' ||
          r.isShared === true
        );
        
        // 2. College Resources - All department-specific resources (view-only for Principal)
        const departmental = response.data.filter(r => 
          r.department !== null && 
          r.department !== undefined && 
          r.department !== 'University' &&
          r.isShared !== true
        );
        
        setSharedResources(shared);
        setCollegeResources(departmental);
        
        console.log('Shared resources (Principal control):', shared.map(r => ({ id: r.id, name: r.name, department: r.department })));
        console.log('College resources (view-only):', departmental.map(r => ({ id: r.id, name: r.name, department: r.department })));
        
        // Generate weekly slots for all resources
        generateWeeklySlots(response.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources.",
        variant: "destructive",
      });
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await BookingRequestService.getAllRequests();
      if (response.success && response.data) {
        setBookingRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    }
  };

  const fetchClassSessions = async () => {
    try {
      const response = await ClassSessionService.getAllSessions();
      if (response.success && response.data) {
        setClassSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching class sessions:', error);
    }
  };

  const fetchTimetableEntries = async () => {
    try {
      const response = await TimetableService.getAllTimetableEntries();
      if (response.success && response.data) {
        setTimetableEntries(response.data);
        setAllTimetableEntries(response.data);
      }
    } catch (error) {
      console.error('Error fetching timetable entries:', error);
    }
  };

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
              department: 'Department',
              faculty: session.faculty,
              classSize: 0,
            }
          };
        }

        // Check for timetable entry
        const timeSlot = DEFAULT_TIME_SLOTS.find(ts => ts.id === slot.timeSlotId);
        const timetableEntry = allTimetableEntries.find(entry => {
          const entryStartTime = entry.startTime ? entry.startTime.substring(0, 5) : entry.start_time;
          const slotStartTime = timeSlot?.startTime;
          const entryResourceId = entry.resourceId || entry.classroom_id;
          
          return String(entryResourceId) === String(slot.resourceId) &&
                 entry.dayOfWeek === slot.dayOfWeek &&
                 entryStartTime === slotStartTime;
        });

        if (timetableEntry) {
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: timetableEntry.subjectId || timetableEntry.subject_id || '',
              courseName: timetableEntry.subjectName || timetableEntry.subject_name || 'Scheduled Class',
              department: timetableEntry.department_name || 'Department',
              faculty: timetableEntry.facultyName || timetableEntry.faculty_name || 'Faculty',
              classSize: 0,
            }
          };
        }

        // Check for approved booking request
        const booking = bookingRequests.find(b => {
          return String(b.targetResourceId) === String(slot.resourceId) &&
                 b.timeSlotId === slot.timeSlotId &&
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
  }, [classSessions, timetableEntries, allTimetableEntries, bookingRequests, weeklySlots.length]);

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
    if (!selectedSlot || !selectedResource || !currentPrincipal) return;

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

    if (existingSession || existingBooking) {
      setConflicts(['This time slot is already occupied or has a pending request']);
      return;
    }

    try {
      const newBookingRequest = {
        requesterId: currentPrincipal.name,
        requesterDepartment: 'Administration', // Principal department
        requesterDesignation: 'Principal', // Auto-approval for shared resources
        targetResourceId: selectedSlot.resourceId,
        targetDepartment: selectedResource.isShared ? 'University' : selectedResource.department,
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
          description: selectedResource.isShared 
            ? "Shared resource booking approved automatically!"
            : "Booking request submitted successfully!",
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

  const ResourceCategory = ({ resources, title, isShared = false }: { 
    resources: Resource[], 
    title: string,
    isShared?: boolean 
  }) => {
    const { availableCount, totalCount } = getAvailableSlotCount(resources);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isShared ? <University className="h-5 w-5 text-blue-600" /> : <School className="h-5 w-5 text-green-600" />}
            <h3 className="text-lg font-semibold">{title}</h3>
            <Badge variant={isShared ? "default" : "secondary"}>
              {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
            </Badge>
          </div>
          <div className="text-sm text-slate-600">
            {availableCount} available / {totalCount} total slots on {DAYS[selectedDay]}
          </div>
        </div>
        
        {resources.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No {isShared ? 'shared' : 'college'} resources found</p>
          </div>
        ) : (
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
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="outline" className="capitalize">
                        {resource.type.replace('_', ' ')}
                      </Badge>
                      {isShared && (
                        <Badge variant="default" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Principal Control
                        </Badge>
                      )}
                      {!isShared && (
                        <Badge variant="secondary" className="text-xs">
                          Department: {resource.department}
                        </Badge>
                      )}
                    </div>
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
                              : isShared 
                                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
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
                            <div className={`text-xs mt-1 ${isShared ? 'text-blue-600' : 'text-green-600'}`}>
                              Available
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (!currentPrincipal) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in as a Principal to view resources.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resource Management</h2>
          <p className="text-gray-600">Principal access to university and college resources</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">
              <input
                type="checkbox"
                checked={showUnavailableSlots}
                onChange={(e) => setShowUnavailableSlots(e.target.checked)}
                className="mr-1"
              />
              Show occupied slots
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm text-gray-600">Day:</span>
            <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Resources Tabs */}
      <Tabs defaultValue="shared" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shared" className="flex items-center space-x-2">
            <University className="h-4 w-4" />
            <span>Shared Resources</span>
          </TabsTrigger>
          <TabsTrigger value="college" className="flex items-center space-x-2">
            <School className="h-4 w-4" />
            <span>College Resources</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shared">
          <ResourceCategory 
            resources={sharedResources} 
            title="University Shared Resources"
            isShared={true}
          />
        </TabsContent>
        
        <TabsContent value="college">
          <ResourceCategory 
            resources={collegeResources} 
            title="Department Resources"
            isShared={false}
          />
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedResource?.isShared ? 'Book Shared Resource' : 'Request Resource Booking'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedResource && selectedSlot && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-medium">{selectedResource.name}</div>
                <div className="text-sm text-slate-600">
                  {DAYS[selectedSlot.dayOfWeek]} • {DEFAULT_TIME_SLOTS.find(ts => ts.id === selectedSlot.timeSlotId)?.label}
                </div>
                {selectedResource.isShared && (
                  <div className="text-xs text-blue-600 mt-1">
                    ✓ Principal has direct booking authority
                  </div>
                )}
              </div>
            )}
            
            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {conflicts.join(', ')}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="purpose">Event/Course Name</Label>
              <Input
                id="purpose"
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Enter event or course name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Expected Attendees</Label>
              <Input
                id="attendees"
                type="number"
                value={bookingForm.expectedAttendees}
                onChange={(e) => setBookingForm(prev => ({ ...prev, expectedAttendees: e.target.value }))}
                placeholder="Number of attendees"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                value={bookingForm.additionalRequirements}
                onChange={(e) => setBookingForm(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                placeholder="Any special requirements or notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookingRequest}>
                {selectedResource?.isShared ? 'Book Resource' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
