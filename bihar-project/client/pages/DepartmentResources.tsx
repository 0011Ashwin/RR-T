import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Resource, WeeklyTimeSlot, ClassSession, Course, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
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
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [resources, setResources] = useState<Resource[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<WeeklyTimeSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
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

  // Generate sample department resources based on current HOD
  useEffect(() => {
    const fetchClassSessions = async () => {
      try {
        const response = await axios.get<ClassSession[]>('/api/class-sessions');
        setClassSessions(response.data);
      } catch (error) {
        console.error('Error fetching class sessions:', error);
      }
    };

    fetchClassSessions();
    if (!currentHOD) return;

    const departmentResources: Resource[] = 
      currentHOD.department === 'Geography' ? [
        {
          id: 'geo_1',
          name: 'Geography Lab',
          type: 'lab',
          capacity: 40,
          department: 'Geography',
          location: 'Ground Floor, Geography Building',
          facilities: ['Maps', 'Globes', 'Survey Equipment', 'Projector'],
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
          location: 'First Floor, Geography Building',
          facilities: ['Projector', 'Smart Board', 'AC'],
          isShared: false,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'geo_3',
          name: 'Seminar Room - Geography',
          type: 'seminar_hall',
          capacity: 30,
          department: 'Geography',
          location: 'Second Floor, Geography Building',
          facilities: ['Projector', 'Whiteboard'],
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

    setResources(departmentResources);

    // Generate sample courses
    const departmentCourses: Course[] = 
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
          faculty: 'Prof. Sharma',
          weeklyHours: 3,
          expectedSize: 35,
          type: 'theory',
          isActive: true,
        },
        {
          id: 'geo_course_3',
          name: 'Cartography Lab',
          code: 'GEO103',
          department: 'Geography',
          semester: 2,
          section: 'A',
          faculty: 'Dr. Verma',
          weeklyHours: 2,
          expectedSize: 20,
          type: 'practical',
          isActive: true,
        },
      ] : [
        {
          id: 'biz_course_1',
          name: 'Business Management',
          code: 'BIZ101',
          department: 'Business Management',
          semester: 1,
          section: 'A',
          faculty: 'Dr. Priya Sharma',
          weeklyHours: 4,
          expectedSize: 45,
          type: 'theory',
          isActive: true,
        },
        {
          id: 'biz_course_2',
          name: 'Marketing Management',
          code: 'BIZ201',
          department: 'Business Management',
          semester: 2,
          section: 'A',
          faculty: 'Prof. Agarwal',
          weeklyHours: 3,
          expectedSize: 40,
          type: 'theory',
          isActive: true,
        },
        {
          id: 'biz_course_3',
          name: 'Business Analytics Lab',
          code: 'BIZ301',
          department: 'Business Management',
          semester: 3,
          section: 'A',
          faculty: 'Dr. Gupta',
          weeklyHours: 2,
          expectedSize: 25,
          type: 'practical',
          isActive: true,
        },
      ];

    setCourses(departmentCourses);

    // Generate weekly slots
    const generateWeeklySlots = () => {
      const slots: WeeklyTimeSlot[] = [];
      
      departmentResources.forEach(resource => {
        DEFAULT_TIME_SLOTS.forEach(timeSlot => {
          [1, 2, 3, 4, 5].forEach(day => { // Monday to Friday
            slots.push({
              id: `slot_${resource.id}_${timeSlot.id}_${day}`,
              resourceId: resource.id,
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

    generateWeeklySlots();
  }, [currentHOD]);

  useEffect(() => {
    // This effect runs whenever classSessions or weeklySlots change
    // and updates the occupied status of weekly slots based on current class sessions.
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
            courseName: course?.name || '',
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
  }, [classSessions, courses, currentHOD]);

  const getSlotForResource = (resourceId: string, timeSlotId: string, day: number) => {
    return weeklySlots.find(slot => 
      slot.resourceId === resourceId && 
      slot.timeSlotId === timeSlotId && 
      slot.dayOfWeek === day
    );
  };

  const getSessionForSlot = (resourceId: string, timeSlotId: string, day: number) => {
    return classSessions.find(session =>
      session.resourceId === resourceId &&
      session.timeSlotId === timeSlotId &&
      session.dayOfWeek === day
    );
  };

  const checkConflicts = (newSession: Omit<ClassSession, 'id'>) => {
    const conflicts: string[] = [];
    
    // Check if faculty is already assigned to another class at the same time
    const facultyConflict = classSessions.find(session =>
      session.faculty === newSession.faculty &&
      session.timeSlotId === newSession.timeSlotId &&
      session.dayOfWeek === newSession.dayOfWeek
    );
    
    if (facultyConflict) {
      const course = courses.find(c => c.id === facultyConflict.courseId);
      conflicts.push(`Faculty ${newSession.faculty} is already scheduled for ${course?.name} at this time`);
    }
    
    // Check if resource is already occupied
    const resourceConflict = classSessions.find(session =>
      session.resourceId === newSession.resourceId &&
      session.timeSlotId === newSession.timeSlotId &&
      session.dayOfWeek === newSession.dayOfWeek
    );
    
    if (resourceConflict) {
      const course = courses.find(c => c.id === resourceConflict.courseId);
      conflicts.push(`Resource is already occupied by ${course?.name}`);
    }
    
    return conflicts;
  };

  const handleAllocateSlot = () => {
    if (!selectedSlot || !allocationForm.courseId) return;

    const newSession: Omit<ClassSession, 'id'> = {
      courseId: allocationForm.courseId,
      resourceId: selectedSlot.resourceId,
      timeSlotId: selectedSlot.timeSlotId,
      dayOfWeek: selectedSlot.dayOfWeek,
      faculty: allocationForm.faculty,
      type: allocationForm.type,
    };

    const sessionConflicts = checkConflicts(newSession);
    
    if (sessionConflicts.length > 0) {
      setConflicts(sessionConflicts);
      return;
    }

    const sessionWithId: ClassSession = {
      ...newSession,
      id: `session_${Date.now()}`,
    };

    setClassSessions(prev => [...prev, sessionWithId]);
    
    // Update weekly slot to mark as occupied
    setWeeklySlots(prev => prev.map(slot => {
      if (slot.resourceId === selectedSlot.resourceId &&
          slot.timeSlotId === selectedSlot.timeSlotId &&
          slot.dayOfWeek === selectedSlot.dayOfWeek) {
        const course = courses.find(c => c.id === allocationForm.courseId);
        return {
          ...slot,
          isOccupied: true,
          occupiedBy: {
            courseId: allocationForm.courseId,
            courseName: course?.name || '',
            department: currentHOD?.department || '',
            faculty: allocationForm.faculty,
            classSize: course?.expectedSize || 0,
          }
        };
      }
      return slot;
    }));

    setAllocationDialogOpen(false);
    setSelectedSlot(null);
    setAllocationForm({
      courseId: '',
      faculty: '',
      type: 'theory',
    });
    try {
      await axios.post('/api/class-sessions', sessionWithId);
      setAllocationDialogOpen(false);
      setSelectedSlot(null);
      setAllocationForm({
        courseId: '',
        faculty: '',
        type: 'theory',
      });
      setConflicts([]);
      // Optionally, refetch class sessions or update local state to reflect the change
      // For now, we're just updating local state, assuming the API call succeeds.
    } catch (error) {
      console.error('Error allocating slot:', error);
      setConflicts(['Failed to allocate slot. Please try again.']);
    }
  };

  const handleRemoveAllocation = async (session: ClassSession) => {
    try {
      await axios.delete(`/api/class-sessions/${session.id}`);
      setClassSessions(prev => prev.filter(s => s.id !== session.id));

      // Update weekly slot to mark as vacant
      setWeeklySlots(prev => prev.map(slot => {
        if (slot.resourceId === session.resourceId &&
            slot.timeSlotId === session.timeSlotId &&
            slot.dayOfWeek === session.dayOfWeek) {
          return {
            ...slot,
            isOccupied: false,
            occupiedBy: undefined,
          };
        }
        return slot;
      }));
    } catch (error) {
      console.error('Error removing allocation:', error);
      // Optionally, show an error message to the user
    }
  };
    
    // Update weekly slot to mark as vacant
    setWeeklySlots(prev => prev.map(slot => {
      if (slot.resourceId === session.resourceId &&
          slot.timeSlotId === session.timeSlotId &&
          slot.dayOfWeek === session.dayOfWeek) {
        return {
          ...slot,
          isOccupied: false,
          occupiedBy: undefined,
        };
      }
      return slot;
    }));
  };

  const autoGenerateRoutine = async () => {
    // Clear existing sessions
    try {
      await axios.delete('/api/class-sessions/all'); // API endpoint to clear all sessions
      setClassSessions([]);
      setWeeklySlots(prev => prev.map(slot => ({
        ...slot,
        isOccupied: false,
        occupiedBy: undefined,
      })));
    } catch (error) {
      console.error('Error clearing existing sessions:', error);
      // Handle error, maybe show a message to the user
      return;
    }

    const newSessions: ClassSession[] = [];
    const usedSlots = new Set<string>();

    courses.forEach(course => {
      const sessionsNeeded = course.weeklyHours;
      let sessionsScheduled = 0;

      // Try to schedule sessions for this course
      for (let day = 1; day <= 5 && sessionsScheduled < sessionsNeeded; day++) {
        for (let timeSlotIndex = 0; timeSlotIndex < DEFAULT_TIME_SLOTS.length && sessionsScheduled < sessionsNeeded; timeSlotIndex++) {
          const timeSlot = DEFAULT_TIME_SLOTS[timeSlotIndex];
          
          // Find suitable resource
          const suitableResource = resources.find(resource => {
            const slotKey = `${resource.id}_${timeSlot.id}_${day}`;
            const isResourceFree = !usedSlots.has(slotKey);
            const hasCapacity = resource.capacity >= course.expectedSize;
            const isRightType = (course.type === 'practical' && resource.type === 'lab') ||
                              (course.type === 'theory' && (resource.type === 'classroom' || resource.type === 'seminar_hall'));
            
            return isResourceFree && hasCapacity && isRightType;
          });

          if (suitableResource) {
            const session: ClassSession = {
              id: `auto_session_${Date.now()}_${sessionsScheduled}`,
              courseId: course.id,
              resourceId: suitableResource.id,
              timeSlotId: timeSlot.id,
              dayOfWeek: day,
              faculty: course.faculty,
              type: course.type,
            };

            newSessions.push(session);
            usedSlots.add(`${suitableResource.id}_${timeSlot.id}_${day}`);
            sessionsScheduled++;
          }
        }
      }
    });

    try {
      await axios.post('/api/class-sessions/bulk', newSessions); // API endpoint to save multiple sessions
      setClassSessions(newSessions);

      // Update weekly slots
      setWeeklySlots(prev => prev.map(slot => {
        const session = newSessions.find(s =>
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
              courseName: course?.name || '',
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
    } catch (error) {
      console.error('Error auto-generating routine:', error);
      // Handle error, maybe show a message to the user
    }
  };

  const openAllocationDialog = (resourceId: string, timeSlotId: string, dayOfWeek: number) => {
    setSelectedSlot({ resourceId, timeSlotId, dayOfWeek });
    setAllocationDialogOpen(true);
    setConflicts([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {currentHOD?.department} Resources
          </h1>
          <p className="text-slate-600 mt-1">Manage your department's classrooms and labs</p>
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

      {/* Resources Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {DAYS[selectedDay]} Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resources.map(resource => (
              <div key={resource.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold">{resource.name}</h3>
                      <p className="text-sm text-slate-600">
                        Capacity: {resource.capacity} • {resource.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {resource.location}
                  </Badge>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {DEFAULT_TIME_SLOTS.map(timeSlot => {
                    const slot = getSlotForResource(resource.id, timeSlot.id, selectedDay);
                    const session = getSessionForSlot(resource.id, timeSlot.id, selectedDay);
                    const course = session ? courses.find(c => c.id === session.courseId) : null;

                    return (
                      <div
                        key={timeSlot.id}
                        className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
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
                            <div className="text-xs">{course.faculty}</div>
                            <div className="text-xs">
                              {course.type} • {course.expectedSize} students
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs">
                            <Plus className="h-3 w-3 mx-auto mb-1" />
                            Available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Dialog */}
      <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Time Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSlot && (
              <>
                <div>
                  <Label>Resource</Label>
                  <Input 
                    value={resources.find(r => r.id === selectedSlot.resourceId)?.name || ''} 
                    disabled 
                  />
                </div>
                
                <div>
                  <Label>Time Slot</Label>
                  <Input 
                    value={`${DAYS[selectedSlot.dayOfWeek]} • ${DEFAULT_TIME_SLOTS.find(t => t.id === selectedSlot.timeSlotId)?.label}`} 
                    disabled 
                  />
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="course">Course *</Label>
              <Select value={allocationForm.courseId} onValueChange={(value) => 
                setAllocationForm(prev => ({ ...prev, courseId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.code}) - {course.faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="faculty">Faculty *</Label>
              <Select value={allocationForm.faculty} onValueChange={(value) => 
                setAllocationForm(prev => ({ ...prev, faculty: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(courses.map(c => c.faculty))).map(facultyName => (
                    <SelectItem key={facultyName} value={facultyName}>
                      {facultyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Class Type *</Label>
              <Select value={allocationForm.type} onValueChange={(value: any) => 
                setAllocationForm(prev => ({ ...prev, type: value }))
              }>
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
                  <div className="space-y-1">
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
