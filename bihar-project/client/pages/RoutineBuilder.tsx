import { useState, useEffect } from 'react';
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
import { Routine, ClassSession, Course, Resource, DEFAULT_TIME_SLOTS } from '@shared/resource-types';
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
  course: Course;
  sessions: ClassSession[];
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

  // Sample data initialization
  useEffect(() => {
    if (!currentHOD) return;

    // Generate sample resources and courses based on department
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
      ] : [
        {
          id: 'biz_1',
          name: 'Business Lab',
          type: 'lab',
          capacity: 50,
          department: 'Business Management',
          location: 'Ground Floor, Business Building',
          facilities: ['Computers', 'Projector', 'Internet'],
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
          facilities: ['Projector', 'Smart Board', 'AC'],
          isShared: false,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

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
          semester: 1,
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
          semester: 1,
          section: 'A',
          faculty: 'Prof. Agarwal',
          weeklyHours: 3,
          expectedSize: 40,
          type: 'theory',
          isActive: true,
        },
      ];

    setResources(departmentResources);
    setCourses(departmentCourses);

    // Generate a sample routine
    generateSampleRoutine(departmentCourses, departmentResources);
  }, [currentHOD]);

  const generateSampleRoutine = (courses: Course[], resources: Resource[]) => {
    if (!currentHOD) return;

    const sessions: ClassSession[] = [];
    let sessionId = 1;

    // Auto-allocate courses to available slots
    courses.forEach(course => {
      let hoursScheduled = 0;
      
      for (let day = 1; day <= 5 && hoursScheduled < course.weeklyHours; day++) {
        for (let timeIndex = 0; timeIndex < DEFAULT_TIME_SLOTS.length && hoursScheduled < course.weeklyHours; timeIndex++) {
          const timeSlot = DEFAULT_TIME_SLOTS[timeIndex];
          
          // Find suitable resource
          const suitableResource = resources.find(resource => {
            const hasCapacity = resource.capacity >= course.expectedSize;
            const isRightType = (course.type === 'practical' && resource.type === 'lab') ||
                              (course.type === 'theory' && (resource.type === 'classroom' || resource.type === 'seminar_hall'));
            
            // Check if slot is available
            const isSlotFree = !sessions.some(s => 
              s.resourceId === resource.id && 
              s.timeSlotId === timeSlot.id && 
              s.dayOfWeek === day
            );
            
            return hasCapacity && isRightType && isSlotFree;
          });

          if (suitableResource) {
            sessions.push({
              id: `session_${sessionId++}`,
              courseId: course.id,
              resourceId: suitableResource.id,
              timeSlotId: timeSlot.id,
              dayOfWeek: day,
              faculty: course.faculty,
              type: course.type,
            });
            hoursScheduled++;
          }
        }
      }
    });

    const sampleRoutine: Routine = {
      id: 'routine_1',
      name: `${currentHOD.department} - Semester 1, Section A`,
      department: currentHOD.department,
      semester: 1,
      section: 'A',
      academicYear: '2024-25',
      sessions,
      generatedBy: currentHOD.id,
      generatedAt: new Date().toISOString(),
      isActive: true,
      version: 1,
    };

    setRoutines([sampleRoutine]);
    setSelectedRoutine(sampleRoutine);
    updateRoutineViews([sampleRoutine]);
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
            course,
            sessions,
          });
        }
      });
    });
    
    setRoutineViews(views);
  };

  const createNewRoutine = () => {
    if (!currentHOD) return;

    const filteredCourses = courses.filter(c => 
      c.semester === newRoutineForm.semester && 
      c.section === newRoutineForm.section
    );

    if (filteredCourses.length === 0) {
      alert('No courses found for the selected semester and section.');
      return;
    }

    const sessions: ClassSession[] = [];
    let sessionId = Date.now();

    // Auto-generate routine for the new configuration
    filteredCourses.forEach(course => {
      let hoursScheduled = 0;
      
      for (let day = 1; day <= 5 && hoursScheduled < course.weeklyHours; day++) {
        for (let timeIndex = 0; timeIndex < DEFAULT_TIME_SLOTS.length && hoursScheduled < course.weeklyHours; timeIndex++) {
          const timeSlot = DEFAULT_TIME_SLOTS[timeIndex];
          
          const suitableResource = resources.find(resource => {
            const hasCapacity = resource.capacity >= course.expectedSize;
            const isRightType = (course.type === 'practical' && resource.type === 'lab') ||
                              (course.type === 'theory' && (resource.type === 'classroom' || resource.type === 'seminar_hall'));
            
            const isSlotFree = !sessions.some(s => 
              s.resourceId === resource.id && 
              s.timeSlotId === timeSlot.id && 
              s.dayOfWeek === day
            );
            
            return hasCapacity && isRightType && isSlotFree;
          });

          if (suitableResource) {
            sessions.push({
              id: `session_${sessionId++}`,
              courseId: course.id,
              resourceId: suitableResource.id,
              timeSlotId: timeSlot.id,
              dayOfWeek: day,
              faculty: course.faculty,
              type: course.type,
            });
            hoursScheduled++;
          }
        }
      }
    });

    const newRoutine: Routine = {
      id: `routine_${Date.now()}`,
      name: newRoutineForm.name,
      department: currentHOD.department,
      semester: newRoutineForm.semester,
      section: newRoutineForm.section,
      academicYear: newRoutineForm.academicYear,
      sessions,
      generatedBy: currentHOD.id,
      generatedAt: new Date().toISOString(),
      isActive: true,
      version: 1,
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
  };

  const exportRoutine = (format: 'pdf' | 'excel') => {
    if (!selectedRoutine) return;
    
    // In a real implementation, this would trigger actual export
    alert(`Exporting ${selectedRoutine.name} as ${format.toUpperCase()}...`);
  };

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id === resourceId)?.name || 'Unknown Resource';
  };

  const getTimeSlotLabel = (timeSlotId: string) => {
    return DEFAULT_TIME_SLOTS.find(t => t.id === timeSlotId)?.label || 'Unknown Time';
  };

  const filteredViews = routineViews.filter(view => 
    view.semester === selectedSemester && view.section === selectedSection
  );

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
                  onClick={() => exportRoutine('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportRoutine('excel')}
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
