import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { useToast } from '@/hooks/use-toast';
import { Resource, WeeklyTimeSlot, ClassSession, Course, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
import { ResourceService } from '@/services/resource-service';
import { ClassSessionService } from '@/services/class-session-service';
import { 
  Building2, 
  Calendar, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wand2
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DepartmentResources() {
  const { currentHOD } = useHODAuth();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [resources, setResources] = useState<Resource[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<WeeklyTimeSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{
    resourceId: string;
    timeSlotId: string;
    dayOfWeek: number;
  } | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const [allocationForm, setAllocationForm] = useState({
    courseId: '',
    faculty: '',
    type: 'theory' as 'theory' | 'practical' | 'tutorial' | 'seminar',
  });

  // Load department resources and class sessions from database
  useEffect(() => {
    const loadData = async () => {
      if (!currentHOD) return;
      
      setLoading(true);
      try {
        // Load department resources
        const resourcesResponse = await ResourceService.getResourcesByDepartment(currentHOD.department);
        if (resourcesResponse.success && resourcesResponse.data) {
          setResources(resourcesResponse.data);
          generateWeeklySlots(resourcesResponse.data);
        }

        // Load class sessions
        const sessionsResponse = await ClassSessionService.getSessionsByDepartment(currentHOD.department);
        if (sessionsResponse.success && sessionsResponse.data) {
          setClassSessions(sessionsResponse.data);
        }

        // Load courses (mock data for now - you can create a course service)
        setCourses([
          {
            id: '1',
            name: 'Data Structures',
            code: 'CS301',
            department: currentHOD.department,
            semester: 3,
            faculty: 'Dr. John Doe',
            weeklyHours: 4,
            expectedSize: 45,
            type: 'theory',
            isActive: true,
          },
          {
            id: '2',
            name: 'Database Management',
            code: 'CS302',
            department: currentHOD.department,
            semester: 3,
            faculty: 'Dr. Jane Smith',
            weeklyHours: 3,
            expectedSize: 40,
            type: 'theory',
            isActive: true,
          },
          // Add more courses as needed
        ]);
      } catch (error) {
        console.error('Error loading department resources:', error);
        toast({
          title: "Error",
          description: "Failed to load department resources. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentHOD, toast]);

  // Generate weekly time slots for resources
  const generateWeeklySlots = (resourceList: Resource[]) => {
    const slots: WeeklyTimeSlot[] = [];
    
    resourceList.forEach(resource => {
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

  // Update slots when class sessions change
  useEffect(() => {
    if (classSessions.length > 0) {
      setWeeklySlots(prev => prev.map(slot => {
        const session = classSessions.find(s =>
          s.resourceId === slot.resourceId &&
          s.timeSlotId === slot.timeSlotId &&
          s.dayOfWeek === slot.dayOfWeek
        );

        if (session) {
          const course = courses.find(c => c.id === session.courseId);
          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              courseId: session.courseId,
              courseName: course?.name || 'Unknown Course',
              department: currentHOD?.department || '',
              faculty: session.faculty,
              classSize: course?.expectedSize || 0,
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
  }, [classSessions, courses, currentHOD]);

  const getSlotForResource = (resourceId: string, timeSlotId: string, day: number) => {
    return weeklySlots.find(slot =>
      slot.resourceId === resourceId &&
      slot.timeSlotId === timeSlotId &&
      slot.dayOfWeek === day
    );
  };

  const getSessionForSlot = (resourceId: string, timeSlotId: string, dayOfWeek: number) => {
    return classSessions.find(session =>
      session.resourceId === resourceId &&
      session.timeSlotId === timeSlotId &&
      session.dayOfWeek === dayOfWeek
    );
  };

  const checkConflicts = (resourceId: string, timeSlotId: string, dayOfWeek: number, faculty: string) => {
    const conflicts: string[] = [];

    // Check faculty conflict
    const facultyConflict = classSessions.find(session =>
      session.faculty === faculty &&
      session.timeSlotId === timeSlotId &&
      session.dayOfWeek === dayOfWeek &&
      session.resourceId !== resourceId
    );

    if (facultyConflict) {
      conflicts.push(`${faculty} is already scheduled at this time`);
    }

    return conflicts;
  };

  const handleSlotAllocation = async () => {
    if (!selectedSlot || !currentHOD) return;

    const conflictList = checkConflicts(
      selectedSlot.resourceId,
      selectedSlot.timeSlotId,
      selectedSlot.dayOfWeek,
      allocationForm.faculty
    );

    if (conflictList.length > 0) {
      setConflicts(conflictList);
      return;
    }

    try {
      const newSession = {
        courseId: allocationForm.courseId,
        resourceId: selectedSlot.resourceId,
        timeSlotId: selectedSlot.timeSlotId,
        dayOfWeek: selectedSlot.dayOfWeek,
        faculty: allocationForm.faculty,
        type: allocationForm.type,
      };

      const response = await ClassSessionService.createSession(newSession);
      
      if (response.success && response.data) {
        setClassSessions(prev => [...prev, response.data!]);
        setAllocationDialogOpen(false);
        setSelectedSlot(null);
        setAllocationForm({
          courseId: '',
          faculty: '',
          type: 'theory',
        });
        setConflicts([]);
        
        toast({
          title: "Success",
          description: "Class session allocated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to allocate class session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error allocating class session:', error);
      toast({
        title: "Error",
        description: "Failed to allocate class session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSession = async (session: ClassSession) => {
    try {
      const response = await ClassSessionService.deleteSession(session.id);
      
      if (response.success) {
        setClassSessions(prev => prev.filter(s => s.id !== session.id));
        
        toast({
          title: "Success",
          description: "Class session removed successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to remove class session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing class session:', error);
      toast({
        title: "Error",
        description: "Failed to remove class session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAutoGenerate = async () => {
    try {
      // Clear existing sessions
      const clearResponse = await ClassSessionService.deleteAllSessions();
      if (!clearResponse.success) {
        throw new Error('Failed to clear existing sessions');
      }

      setClassSessions([]);
      setWeeklySlots(prev => prev.map(slot => ({
        ...slot,
        isOccupied: false,
        occupiedBy: undefined,
      })));

      // Auto-generate new sessions
      const newSessions: any[] = [];
      
      courses.forEach(course => {
        for (let i = 0; i < course.weeklyHours; i++) {
          // Find suitable resource and time slot
          const suitableResource = resources.find(resource => {
            return resource.capacity >= course.expectedSize;
          });

          if (suitableResource) {
            // Find available time slot
            const availableSlot = weeklySlots.find(slot =>
              slot.resourceId === suitableResource.id!.toString() &&
              !slot.isOccupied &&
              !newSessions.some(session =>
                session.resourceId === slot.resourceId &&
                session.timeSlotId === slot.timeSlotId &&
                session.dayOfWeek === slot.dayOfWeek
              )
            );

            if (availableSlot) {
              newSessions.push({
                courseId: course.id,
                resourceId: availableSlot.resourceId,
                timeSlotId: availableSlot.timeSlotId,
                dayOfWeek: availableSlot.dayOfWeek,
                faculty: course.faculty,
                type: course.type,
              });
            }
          }
        }
      });

      // Save sessions to database
      const bulkResponse = await ClassSessionService.createBulkSessions(newSessions);
      if (bulkResponse.success && bulkResponse.data) {
        setClassSessions(bulkResponse.data);
        
        toast({
          title: "Success",
          description: `Auto-generated ${bulkResponse.data.length} class sessions successfully!`,
        });
      }
    } catch (error) {
      console.error('Error auto-generating routine:', error);
      toast({
        title: "Error",
        description: "Failed to auto-generate routine. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openAllocationDialog = (resourceId: string, timeSlotId: string, dayOfWeek: number) => {
    setSelectedSlot({ resourceId, timeSlotId, dayOfWeek });
    setAllocationDialogOpen(true);
    setConflicts([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading department resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {currentHOD?.department} Resources
          </h1>
          <p className="text-slate-600">
            Manage classroom allocations and schedules for your department
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleAutoGenerate} className="bg-purple-600 hover:bg-purple-700">
            <Wand2 className="h-4 w-4 mr-2" />
            Auto Generate Routine
          </Button>
        </div>
      </div>

      {/* Day Selector */}
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

      {/* Resources Grid */}
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
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {resource.type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_TIME_SLOTS.map((timeSlot) => {
                  const slot = getSlotForResource(resource.id!.toString(), timeSlot.id, selectedDay);
                  const session = getSessionForSlot(resource.id!.toString(), timeSlot.id, selectedDay);
                  
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
                        if (slot?.isOccupied && session) {
                          // Show session details or remove option
                        } else {
                          openAllocationDialog(resource.id!.toString(), timeSlot.id, selectedDay);
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
                          {session && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="mt-1 h-6 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSession(session);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
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

      {/* Allocation Dialog */}
      <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Class Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="courseId">Course</Label>
              <Select value={allocationForm.courseId} onValueChange={(value) => setAllocationForm(prev => ({ ...prev, courseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
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
            
            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Input
                id="faculty"
                value={allocationForm.faculty}
                onChange={(e) => setAllocationForm(prev => ({ ...prev, faculty: e.target.value }))}
                placeholder="Enter faculty name"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Session Type</Label>
              <Select value={allocationForm.type} onValueChange={(value: any) => setAllocationForm(prev => ({ ...prev, type: value }))}>
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
            
            <div className="flex space-x-3">
              <Button onClick={handleSlotAllocation} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Allocate
              </Button>
              <Button variant="outline" onClick={() => setAllocationDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
