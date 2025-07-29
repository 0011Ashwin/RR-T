import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  School,
  Calendar,
  Clock,
  Users,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Move,
  Copy,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  BookOpen
} from 'lucide-react';
import TimeSlotCalendar from './TimeSlotCalendar';
import ResourceFilters, { type FilterState } from './ResourceFilters';
import { exportScheduleToPDF, exportUtilizationReport } from './exportUtils';
import type { Resource, TimeSlot, Department } from './types';

// Mock data for Computer Science Department
const currentDepartment = 'Computer Science';
const currentDepartmentId = 'cs';

const mockDepartmentResources: Resource[] = [
  {
    id: 'dr-1',
    name: 'CS Lab 1',
    type: 'lab',
    capacity: 60,
    owningDepartment: 'Computer Science',
    building: 'CS Block',
    floor: 2,
    location: '2nd Floor, CS Block',
    equipment: ['Desktop Computers (60)', 'Projector', 'Whiteboard', 'Software Lab'],
    facilities: ['AC', 'High-Speed Internet', 'Power Backup'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'dr-2',
    name: 'CS Lab 2',
    type: 'lab',
    capacity: 50,
    owningDepartment: 'Computer Science',
    building: 'CS Block',
    floor: 2,
    location: '2nd Floor, CS Block',
    equipment: ['Desktop Computers (50)', 'Projector', 'Smart Board'],
    facilities: ['AC', 'High-Speed Internet'],
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'dr-3',
    name: 'CS Classroom A',
    type: 'classroom',
    capacity: 80,
    owningDepartment: 'Computer Science',
    building: 'CS Block',
    floor: 1,
    location: '1st Floor, CS Block',
    equipment: ['Smart Board', 'Projector', 'Sound System'],
    facilities: ['AC', 'Recording Equipment'],
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'dr-4',
    name: 'CS Classroom B',
    type: 'classroom',
    capacity: 60,
    owningDepartment: 'Computer Science',
    building: 'CS Block',
    floor: 1,
    location: '1st Floor, CS Block',
    equipment: ['Whiteboard', 'Projector'],
    facilities: ['AC', 'Wi-Fi'],
    isActive: true,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'dr-5',
    name: 'CS Research Lab',
    type: 'lab',
    capacity: 30,
    owningDepartment: 'Computer Science',
    building: 'CS Block',
    floor: 3,
    location: '3rd Floor, CS Block',
    equipment: ['High-End Workstations', '3D Printers', 'Servers', 'VR Equipment'],
    facilities: ['AC', 'High-Speed Internet', 'Power Backup', 'Security System'],
    isActive: true,
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  }
];

const mockDepartmentTimeSlots: TimeSlot[] = [
  {
    id: 'dts-1',
    startTime: '09:00',
    endTime: '10:00',
    day: 1,
    resourceId: 'dr-1',
    department: 'Computer Science',
    course: 'Data Structures & Algorithms',
    className: 'BCA Sem 3 - Section A',
    instructor: 'Dr. Priya Sharma',
    students: 55,
    status: 'occupied'
  },
  {
    id: 'dts-2',
    startTime: '10:00',
    endTime: '11:00',
    day: 1,
    resourceId: 'dr-1',
    department: 'Computer Science',
    course: 'Database Management System',
    className: 'MCA Sem 1 - Section B',
    instructor: 'Prof. Amit Singh',
    students: 50,
    status: 'occupied'
  },
  {
    id: 'dts-3',
    startTime: '14:00',
    endTime: '15:00',
    day: 1,
    resourceId: 'dr-3',
    department: 'Computer Science',
    course: 'Software Engineering',
    className: 'BCA Sem 5 - Section A',
    instructor: 'Dr. Rajesh Kumar Singh',
    students: 65,
    status: 'occupied'
  },
  {
    id: 'dts-4',
    startTime: '11:00',
    endTime: '12:00',
    day: 2,
    resourceId: 'dr-2',
    department: 'Computer Science',
    course: 'Web Development Lab',
    className: 'BCA Sem 4 - Section B',
    instructor: 'Prof. Neha Gupta',
    students: 45,
    status: 'occupied'
  },
  {
    id: 'dts-5',
    startTime: '15:00',
    endTime: '16:00',
    day: 3,
    resourceId: 'dr-5',
    department: 'Computer Science',
    course: 'AI Research Session',
    className: 'MCA Research Group',
    instructor: 'Dr. Sunita Rani',
    students: 25,
    status: 'occupied'
  }
];

const mockFaculty = [
  { id: 'f1', name: 'Dr. Priya Sharma', subjects: ['Data Structures', 'Algorithms'] },
  { id: 'f2', name: 'Prof. Amit Singh', subjects: ['Database Management', 'Web Development'] },
  { id: 'f3', name: 'Dr. Rajesh Kumar Singh', subjects: ['Software Engineering', 'Project Management'] },
  { id: 'f4', name: 'Prof. Neha Gupta', subjects: ['Computer Networks', 'Operating Systems'] },
  { id: 'f5', name: 'Dr. Sunita Rani', subjects: ['Artificial Intelligence', 'Machine Learning'] }
];

const mockCourses = [
  'BCA Sem 1 - Section A', 'BCA Sem 1 - Section B',
  'BCA Sem 2 - Section A', 'BCA Sem 2 - Section B', 
  'BCA Sem 3 - Section A', 'BCA Sem 3 - Section B',
  'BCA Sem 4 - Section A', 'BCA Sem 4 - Section B',
  'BCA Sem 5 - Section A', 'BCA Sem 5 - Section B',
  'BCA Sem 6 - Section A', 'BCA Sem 6 - Section B',
  'MCA Sem 1 - Section A', 'MCA Sem 1 - Section B',
  'MCA Sem 2 - Section A', 'MCA Sem 2 - Section B',
  'MCA Research Group'
];

export default function DepartmentResources() {
  const [filters, setFilters] = useState<FilterState>({
    resourceType: 'all',
    department: currentDepartmentId,
    status: 'all',
    search: '',
    capacity: '',
    building: 'all',
    week: 0
  });

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    course: '',
    className: '',
    instructor: '',
    students: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [draggedSlot, setDraggedSlot] = useState<TimeSlot | null>(null);

  const filteredResources = useMemo(() => {
    return mockDepartmentResources.filter(resource => {
      if (filters.search && !resource.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.resourceType !== 'all' && resource.type !== filters.resourceType) {
        return false;
      }
      if (filters.capacity && resource.capacity < parseInt(filters.capacity)) {
        return false;
      }
      if (filters.building !== 'all' && resource.building !== filters.building) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const handleSlotClick = (resourceId: string, day: number, timeSlot: string) => {
    const existingSlot = mockDepartmentTimeSlots.find(
      slot => slot.resourceId === resourceId && slot.day === day && slot.startTime === timeSlot
    );

    if (existingSlot) {
      setSelectedSlot(existingSlot);
      setSlotForm({
        course: existingSlot.course || '',
        className: existingSlot.className || '',
        instructor: existingSlot.instructor || '',
        students: existingSlot.students?.toString() || '',
        startTime: existingSlot.startTime,
        endTime: existingSlot.endTime,
        notes: existingSlot.notes || ''
      });
      setIsEditDialogOpen(true);
    } else {
      // Create new slot
      setSelectedSlot({
        id: '',
        startTime: timeSlot,
        endTime: '',
        day,
        resourceId,
        department: currentDepartment,
        status: 'occupied'
      } as TimeSlot);
      setSlotForm({
        course: '',
        className: '',
        instructor: '',
        students: '',
        startTime: timeSlot,
        endTime: '',
        notes: ''
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSlotSave = () => {
    if (!selectedSlot) return;

    const updatedSlot: TimeSlot = {
      ...selectedSlot,
      course: slotForm.course,
      className: slotForm.className,
      instructor: slotForm.instructor,
      students: parseInt(slotForm.students) || undefined,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      notes: slotForm.notes,
      status: 'occupied'
    };

    // In real implementation, this would update via API
    console.log('Saving slot:', updatedSlot);
    
    setIsEditDialogOpen(false);
    setSelectedSlot(null);
  };

  const handleSlotDelete = () => {
    if (!selectedSlot) return;

    // In real implementation, this would delete via API
    console.log('Deleting slot:', selectedSlot.id);
    
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedSlot(null);
  };

  const handleDragStart = (slot: TimeSlot) => {
    setDraggedSlot(slot);
  };

  const handleDrop = (resourceId: string, day: number, timeSlot: string) => {
    if (!draggedSlot) return;

    // Check if target slot is available
    const targetSlotExists = mockDepartmentTimeSlots.find(
      slot => slot.resourceId === resourceId && slot.day === day && slot.startTime === timeSlot
    );

    if (!targetSlotExists) {
      const movedSlot: TimeSlot = {
        ...draggedSlot,
        resourceId,
        day,
        startTime: timeSlot
      };

      // In real implementation, this would update via API
      console.log('Moving slot:', movedSlot);
    }

    setDraggedSlot(null);
  };

  const getUtilizationStats = () => {
    const totalSlots = filteredResources.length * 7 * 10; // 7 days, 10 time slots
    const occupiedSlots = mockDepartmentTimeSlots.filter(slot => 
      filteredResources.some(r => r.id === slot.resourceId)
    ).length;
    
    return {
      total: totalSlots,
      occupied: occupiedSlots,
      available: totalSlots - occupiedSlots,
      utilization: totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0
    };
  };

  const utilizationStats = getUtilizationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <School className="h-6 w-6 mr-3 text-indigo-600" />
            Department Resources
          </h2>
          <p className="text-slate-600">Manage and allocate your department's resources</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportScheduleToPDF(filteredResources, mockDepartmentTimeSlots, filters.week)}>
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button variant="outline" onClick={() => exportUtilizationReport(filteredResources, mockDepartmentTimeSlots)}>
            <Download className="h-4 w-4 mr-2" />
            Utilization Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Resources</p>
                <p className="text-2xl font-bold text-slate-900">{filteredResources.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Occupied Slots</p>
                <p className="text-2xl font-bold text-slate-900">{utilizationStats.occupied}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Available Slots</p>
                <p className="text-2xl font-bold text-slate-900">{utilizationStats.available}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Utilization</p>
                <p className="text-2xl font-bold text-slate-900">{utilizationStats.utilization.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ResourceFilters
        filters={filters}
        onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
        departments={[{ id: currentDepartmentId, name: currentDepartment, code: 'CS', head: 'Dr. Rajesh Kumar Singh', color: '#3B82F6' }]}
        buildings={[...new Set(mockDepartmentResources.map(r => r.building).filter(Boolean))]}
        showAdvancedFilters={true}
      />

      {/* Main Content */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Management
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Resource Details
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Usage Analysis
          </TabsTrigger>
        </TabsList>

        {/* Schedule Management */}
        <TabsContent value="schedule">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Drag & Drop Instructions</h3>
              <p className="text-sm text-blue-700">
                • Click on any time slot to edit or create a class allocation
                • Drag existing slots to move them to different times or resources
                • Empty slots are available for new allocations
              </p>
            </div>
            
            <TimeSlotCalendar
              resources={filteredResources}
              timeSlots={mockDepartmentTimeSlots}
              onSlotClick={handleSlotClick}
              showWeekNavigation={true}
              viewMode="week"
              highlightAvailable={true}
              showDetails={true}
            />
          </div>
        </TabsContent>

        {/* Resource Details */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const resourceSlots = mockDepartmentTimeSlots.filter(slot => slot.resourceId === resource.id);
              const utilization = (resourceSlots.length / 70) * 100; // 7 days * 10 slots

              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{resource.name}</span>
                      <Badge variant="outline" className="capitalize">
                        {resource.type.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="h-4 w-4 mr-2" />
                        Capacity: {resource.capacity}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {resource.building} {resource.floor && `• Floor ${resource.floor}`}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Weekly Utilization: {utilization.toFixed(1)}%
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Current Usage</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {resourceSlots.slice(0, 3).map((slot) => (
                          <div key={slot.id} className="text-xs bg-slate-50 p-2 rounded">
                            <div className="font-medium">{slot.className}</div>
                            <div className="text-slate-600">{slot.startTime} - {slot.endTime}</div>
                          </div>
                        ))}
                        {resourceSlots.length > 3 && (
                          <div className="text-xs text-slate-500 text-center">
                            +{resourceSlots.length - 3} more sessions
                          </div>
                        )}
                      </div>
                    </div>

                    {resource.equipment.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Equipment</h4>
                        <div className="flex flex-wrap gap-1">
                          {resource.equipment.slice(0, 2).map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                          {resource.equipment.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.equipment.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Usage Analysis */}
        <TabsContent value="analysis">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Usage Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">Resource Type Distribution</h4>
                    <div className="space-y-2">
                      {['lab', 'classroom'].map(type => {
                        const count = filteredResources.filter(r => r.type === type).length;
                        const percentage = (count / filteredResources.length) * 100;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">Most Utilized Resources</h4>
                    <div className="space-y-2">
                      {filteredResources.map(resource => {
                        const slots = mockDepartmentTimeSlots.filter(slot => slot.resourceId === resource.id);
                        const utilization = (slots.length / 70) * 100;
                        return (
                          <div key={resource.id} className="flex items-center justify-between">
                            <span className="text-sm">{resource.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600">{utilization.toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faculty Workload Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockFaculty.map(faculty => {
                    const facultySlots = mockDepartmentTimeSlots.filter(slot => 
                      slot.instructor === faculty.name
                    );
                    
                    return (
                      <div key={faculty.id} className="p-4 border rounded-lg">
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 mr-2 text-indigo-600" />
                          <span className="font-medium">{faculty.name}</span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          Classes: {facultySlots.length}
                        </div>
                        <div className="space-y-1">
                          {faculty.subjects.map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Slot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedSlot?.id ? 'Edit Class Schedule' : 'Create Class Schedule'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course">Subject/Course</Label>
              <Input
                id="course"
                placeholder="e.g., Data Structures & Algorithms"
                value={slotForm.course}
                onChange={(e) => setSlotForm(prev => ({ ...prev, course: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="className">Class/Section</Label>
              <Select value={slotForm.className} onValueChange={(value) => setSlotForm(prev => ({ ...prev, className: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class/section" />
                </SelectTrigger>
                <SelectContent>
                  {mockCourses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Select value={slotForm.instructor} onValueChange={(value) => setSlotForm(prev => ({ ...prev, instructor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {mockFaculty.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.name}>{faculty.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Select value={slotForm.startTime} onValueChange={(value) => setSlotForm(prev => ({ ...prev, startTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Select value={slotForm.endTime} onValueChange={(value) => setSlotForm(prev => ({ ...prev, endTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent>
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="students">Number of Students</Label>
              <Input
                id="students"
                type="number"
                placeholder="Expected students"
                value={slotForm.students}
                onChange={(e) => setSlotForm(prev => ({ ...prev, students: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={slotForm.notes}
                onChange={(e) => setSlotForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-between">
              <div className="space-x-2">
                {selectedSlot?.id && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSlotSave}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSlotDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
