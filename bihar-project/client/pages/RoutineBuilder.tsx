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
  Filter
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [newRoutineForm, setNewRoutineForm] = useState({
    name: '',
    semester: 1,
    section: 'A',
    academicYear: '2024-25',
  });

  useEffect(() => {
    if (!currentHOD) return;

    const fetchRoutines = async () => {
      try {
        const response = await TimetableService.getTimetablesByDepartment(currentHOD.department);
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

    fetchRoutines();
    fetchResources();
    fetchCourses();
  }, [currentHOD, toast]);

  useEffect(() => {
    updateRoutineViews(routines);
  }, [routines, courses, resources]);

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
    const views: RoutineView[] = [];
    
    routines.forEach(routine => {
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
        if (course) {
          views.push({
            semester: routine.semester,
            section: routine.section || 'A',
            sessions,
          });
        }
      });
    });
    
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
        academicYear: newRoutineForm.academicYear,
        sessions: [], // Always start with empty sessions to avoid conflicts
      };

      console.log('Sending timetable data to API:', timetableData);
      const response = await TimetableService.createTimetable(timetableData);
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // Convert the created timetable to routine format
        const newRoutine: Routine = {
          id: response.data.id.toString(),
          name: response.data.name,
          department: currentHOD.department,
          semester: response.data.semester,
          section: response.data.section || 'A',
          academicYear: response.data.academicYear || '2024-25',
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
          } catch (error) {
            console.warn('Some entries could not be saved due to conflicts, but routine was created');
            // Even if some entries fail, we can still show the routine
          }
        }

        // Update the routine with successful sessions
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
        });

        toast({
          title: "Success",
          description: `Routine created successfully${successfulSessions.length > 0 ? ` with ${successfulSessions.length} sessions` : ''}!`,
        });
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

  // Helper function to save timetable entries
  const saveTimetableEntries = async (timetableId: string, sessions: ClassSession[]) => {
    try {
      console.log(`Saving ${sessions.length} timetable entries for timetable ${timetableId}`);
      
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

          console.log('Saving entry:', entryData);
          
          try {
            await axios.post(`/api/timetables/${timetableId}/entries`, entryData);
            console.log('Entry saved successfully');
          } catch (entryError: any) {
            console.error('Error saving individual entry:', entryError.response?.data || entryError.message);
            // Continue with other entries instead of failing completely
            if (entryError.response?.data?.message?.includes('conflicts')) {
              console.warn('Skipping entry due to conflict:', entryData);
            } else {
              throw entryError; // Re-throw if it's not a conflict error
            }
          }
        }
      }
      console.log('Finished saving timetable entries');
    } catch (error) {
      console.error('Error saving timetable entries:', error);
      throw error;
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
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRoutine?.id === routine.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedRoutine(routine)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{routine.name}</h3>
                    <p className="text-sm text-slate-600">
                      Semester {routine.semester}, Section {routine.section}
                    </p>
                  </div>
                  <Badge variant={routine.isActive ? 'default' : 'secondary'}>
                    {routine.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="text-sm text-slate-500">
                  {routine.sessions.length} classes scheduled
                </div>
                <div className="text-xs text-slate-400">
                  Generated: {new Date(routine.generatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Routine Display */}
      {selectedRoutine && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedRoutine.name}</CardTitle>
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
                  <table className="w-full border-collapse border border-slate-200">
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
                            const session = selectedRoutine.sessions.find(s =>
                              s.timeSlotId === timeSlot.id && s.dayOfWeek === day
                            );
                            const course = session ? courses.find(c => c.id === session.courseId) : null;
                            
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
                                ) : (
                                  <div className="text-center text-slate-400 text-sm">Free</div>
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
