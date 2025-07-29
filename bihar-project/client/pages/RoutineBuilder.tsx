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
import axios from 'axios';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { Routine, ClassSession, Course, Resource, DEFAULT_TIME_SLOTS } from '@shared/resource-types';
import { exportRoutine } from '@/lib/export-utils';
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
        const response = await axios.get('/api/timetables');
        const fetchedRoutines: Routine[] = response.data.map((rt: any) => ({
          id: rt.id,
          name: rt.name,
          department: currentHOD?.department || 'Unknown',
          semester: rt.semester,
          section: rt.section,
          academicYear: rt.academic_year,
          sessions: rt.entries.map((entry: any) => ({
            id: entry.id,
            courseId: entry.subject_id.toString(),
            resourceId: entry.classroom_id.toString(),
            faculty: entry.faculty_id.toString(),
            dayOfWeek: entry.day_of_week,
            timeSlotId: DEFAULT_TIME_SLOTS.find(t => t.start === entry.start_time && t.end === entry.end_time)?.id || '',
            type: 'theory', // Assuming default type, adjust if type is available in backend
          })),
          isActive: rt.is_active,
          generatedAt: rt.created_at,
          createdAt: rt.created_at,
          updatedAt: rt.updated_at,
        }));
        setRoutines(fetchedRoutines);
        updateRoutineViews(fetchedRoutines);
      } catch (error) {
        console.error('Error fetching routines:', error);
      }
    };

    fetchRoutines();



    const fetchResources = async () => {
      try {
        const response = await axios.get('/api/resources');
        setResources(response.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/subjects'); // Assuming /api/subjects is the endpoint for courses
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchResources();
    fetchCourses();

    // The sample routine generation will need to be updated to use fetched data
    // For now, we'll keep it commented out or modify it to run after data is fetched.
    // generateRoutine();
  }, [currentHOD]);

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
              s.resource.id === resource.id && 
              s.timeSlot === `${timeSlot.start} - ${timeSlot.end}` && 
              s.day === DAYS[day - 1]
            );
            
            return hasCapacity && isRightType && isSlotFree;
          });
           
          if (suitableResource) {
            sessions.push({
              id: `session_${sessionId++}`,
              courseId: course.id,
              resourceId: suitableResource.id!,
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
    if (!newRoutineForm.name || !newRoutineForm.academicYear) {
      alert('Please fill in all required fields.');
      return;
    }

    // Check if a routine with the same semester, section, and academic year already exists
    const existingRoutine = routines.find(r => 
      r.semester === newRoutineForm.semester &&
      r.section === newRoutineForm.section &&
      r.academicYear === newRoutineForm.academicYear
    );

    if (existingRoutine) {
      alert('A routine for this semester, section, and academic year already exists.');
      return;
    }

    // Filter courses and resources relevant to the new routine's department
    const relevantCourses = courses.filter(c => 
      c.department === currentHOD?.department &&
      c.semester === newRoutineForm.semester &&
      c.section === newRoutineForm.section
    );
    const relevantResources = resources.filter(r => 
      r.department === currentHOD?.department || r.isShared
    );

    // Auto-generate routine for the new configuration
    const generatedSessions = autoGenerateSessions(relevantCourses, relevantResources);

    const newTimetableData = {
      name: newRoutineForm.name,
      semester: newRoutineForm.semester,
      department_id: currentHOD?.department_id || 0, // Assuming department_id is available in currentHOD
      section: newRoutineForm.section,
      academic_year: newRoutineForm.academicYear,
      is_active: true,
      entries: generatedSessions.map(session => ({
        subject_id: parseInt(session.courseId),
        faculty_id: parseInt(session.faculty),
        classroom_id: parseInt(session.resourceId),
        day_of_week: session.dayOfWeek,
        start_time: DEFAULT_TIME_SLOTS.find(t => t.id === session.timeSlotId)?.start || '',
        end_time: DEFAULT_TIME_SLOTS.find(t => t.id === session.timeSlotId)?.end || '',
      })),
    };

    try {
      const response = await axios.post('/api/timetables', newTimetableData);

      const createdTimetable = response.data;
      // Convert the created timetable back to the Routine format for frontend state
      const newRoutine: Routine = {
        id: createdTimetable.id,
        name: createdTimetable.name,
        department: currentHOD?.department || 'Unknown',
        semester: createdTimetable.semester,
        section: createdTimetable.section,
        academicYear: createdTimetable.academic_year,
        sessions: createdTimetable.entries.map((entry: any) => {
          const course = relevantCourses.find(c => c.id === entry.subject_id.toString());
          const resource = relevantResources.find(r => r.id === entry.classroom_id.toString());
          const faculty = { id: entry.faculty_id.toString(), name: 'Unknown Faculty' }; // You might need to fetch faculty details

          return {
            id: entry.id,
            course: course || { id: '', name: 'Unknown Course', code: '', department: '', semester: 0, section: '', faculty: '', weeklyHours: 0, expectedSize: 0, type: 'theory', isActive: true },
            resource: resource || { id: '', name: 'Unknown Resource', type: 'classroom', capacity: 0, department: '', location: '', facilities: [], isShared: false, isActive: true, createdAt: '', updatedAt: '' },
            faculty: faculty,
            day: DAYS[entry.day_of_week - 1],
            timeSlot: `${entry.start_time} - ${entry.end_time}`,
          };
        }),
        isActive: createdTimetable.is_active,
        generatedAt: createdTimetable.created_at,
        createdAt: createdTimetable.created_at,
        updatedAt: createdTimetable.updated_at,
      };

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
    } catch (error) {
      console.error('Error creating routine:', error);
      alert('Failed to create routine. Please try again.');
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
    return resources.find(r => r.id === resourceId)?.name || 'Unknown Resource';
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
                    placeholder="e.g., Geography Semester 2 - Section B"
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
