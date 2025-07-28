import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  Download,
  Plus,
  School,
  FlaskConical,
  Presentation,
  Computer,
  BookOpen,
} from "lucide-react";

interface ResourceBooking {
  id: string;
  resourceId: string;
  resourceName: string;
  startTime: string;
  endTime: string;
  department: string;
  course: string;
  instructor: string;
  dayOfWeek: number;
  students: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Resource {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'seminar' | 'auditorium';
  capacity: number;
  building: string;
  floor: number;
  features: string[];
}

export default function ResourceOverview() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00 - 10:30',
    '10:45 - 12:15',
    '13:00 - 14:30',
    '14:45 - 16:15',
    '16:30 - 18:00',
  ];

  const resources: Resource[] = [
    { id: '1', name: 'Main Lecture Hall', type: 'classroom', capacity: 100, building: 'Main Block', floor: 1, features: ['Projector', 'AC', 'Microphone'] },
    { id: '2', name: 'Computer Lab 1', type: 'lab', capacity: 60, building: 'CS Block', floor: 2, features: ['Computers', 'AC', 'Projector'] },
    { id: '3', name: 'Physics Lab', type: 'lab', capacity: 45, building: 'Science Block', floor: 3, features: ['Lab Equipment', 'Safety Features'] },
    { id: '4', name: 'Seminar Hall A', type: 'seminar', capacity: 80, building: 'Main Block', floor: 2, features: ['Round Table', 'Projector', 'AC'] },
    { id: '5', name: 'Lecture Room 1', type: 'classroom', capacity: 60, building: 'Academic Block', floor: 2, features: ['Whiteboard', 'AC'] },
    { id: '6', name: 'Chemistry Lab', type: 'lab', capacity: 45, building: 'Science Block', floor: 3, features: ['Fume Hoods', 'Safety Equipment'] },
    { id: '7', name: 'Smart Classroom', type: 'classroom', capacity: 45, building: 'Modern Block', floor: 1, features: ['Smart Board', 'AC', 'Recording'] },
    { id: '8', name: 'Main Auditorium', type: 'auditorium', capacity: 200, building: 'Main Block', floor: 0, features: ['Stage', 'Sound System', 'AC'] },
  ];

  const bookings: ResourceBooking[] = [
    {
      id: '1',
      resourceId: '1',
      resourceName: 'Main Lecture Hall',
      startTime: '09:00',
      endTime: '10:30',
      department: 'Computer Science',
      course: 'MCA Semester 1',
      instructor: 'Dr. Priya Sharma',
      dayOfWeek: 1,
      students: 85,
      status: 'confirmed',
    },
    {
      id: '2',
      resourceId: '2',
      resourceName: 'Computer Lab 1',
      startTime: '10:45',
      endTime: '12:15',
      department: 'Computer Science',
      course: 'BCA Semester 3',
      instructor: 'Prof. Amit Singh',
      dayOfWeek: 1,
      students: 55,
      status: 'confirmed',
    },
    {
      id: '3',
      resourceId: '4',
      resourceName: 'Seminar Hall A',
      startTime: '14:00',
      endTime: '16:00',
      department: 'Mathematics',
      course: 'B.Sc Mathematics Sem 2',
      instructor: 'Dr. Neha Gupta',
      dayOfWeek: 3,
      students: 70,
      status: 'confirmed',
    },
    {
      id: '4',
      resourceId: '3',
      resourceName: 'Physics Lab',
      startTime: '13:00',
      endTime: '14:30',
      department: 'Physics',
      course: 'B.Sc Physics Sem 4',
      instructor: 'Prof. Rajesh Kumar',
      dayOfWeek: 2,
      students: 40,
      status: 'confirmed',
    },
    {
      id: '5',
      resourceId: '5',
      resourceName: 'Lecture Room 1',
      startTime: '16:30',
      endTime: '18:00',
      department: 'Geography',
      course: 'BBA Semester 3',
      instructor: 'Dr. Smith Johnson',
      dayOfWeek: 4,
      students: 58,
      status: 'pending',
    },
    {
      id: '6',
      resourceId: '6',
      resourceName: 'Chemistry Lab',
      startTime: '10:45',
      endTime: '12:15',
      department: 'Chemistry',
      course: 'B.Sc Chemistry Sem 3',
      instructor: 'Dr. Sunita Rani',
      dayOfWeek: 5,
      students: 42,
      status: 'confirmed',
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'classroom':
        return <School className="h-4 w-4" />;
      case 'lab':
        return <FlaskConical className="h-4 w-4" />;
      case 'seminar':
        return <Presentation className="h-4 w-4" />;
      case 'auditorium':
        return <Building2 className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'classroom':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lab':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'seminar':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'auditorium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    const hash = department.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const filteredResources = resources.filter(resource => {
    if (selectedResourceType !== "all" && resource.type !== selectedResourceType) return false;
    return true;
  });

  const getBookingForSlot = (resourceId: string, dayOfWeek: number, timeSlotIndex: number) => {
    const timeSlot = timeSlots[timeSlotIndex];
    const [startTime] = timeSlot.split(' - ');
    
    return bookings.find(booking => 
      booking.resourceId === resourceId &&
      booking.dayOfWeek === dayOfWeek &&
      booking.startTime === startTime &&
      (selectedDepartment === "all" || booking.department === selectedDepartment)
    );
  };

  const exportSchedule = () => {
    // Create CSV content
    const csvHeader = ['Resource', 'Day', 'Time', 'Department', 'Course', 'Instructor', 'Students', 'Status'];
    const csvRows = bookings.map(booking => [
      booking.resourceName,
      dayNames[booking.dayOfWeek - 1],
      `${booking.startTime} - ${booking.endTime}`,
      booking.department,
      booking.course,
      booking.instructor,
      booking.students,
      booking.status
    ]);
    
    const csvContent = [csvHeader, ...csvRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resource_schedule.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Resource Overview</h2>
          <p className="text-slate-600">Monitor and plan usage of institutional resources</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportSchedule}>
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button onClick={() => setIsReservationDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Reserve Resource
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-indigo-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Resource Type</label>
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="classroom">Classrooms</SelectItem>
                  <SelectItem value="lab">Laboratories</SelectItem>
                  <SelectItem value="seminar">Seminar Halls</SelectItem>
                  <SelectItem value="auditorium">Auditoriums</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Week</label>
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Current Week</SelectItem>
                  <SelectItem value="1">Next Week</SelectItem>
                  <SelectItem value="2">Week After Next</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Weekly Resource Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[200px]">
                    Resource
                  </th>
                  {dayNames.map((day) => (
                    <th key={day} className="border border-slate-200 p-3 text-center font-semibold text-slate-700 min-w-[160px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-slate-25">
                    <td className="border border-slate-200 p-3 font-medium text-slate-700 bg-slate-50">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          {getResourceIcon(resource.type)}
                          <span className="ml-2 font-semibold">{resource.name}</span>
                        </div>
                        <div className="text-sm text-slate-600">{resource.building} • Floor {resource.floor}</div>
                        <div className="text-xs text-slate-500">Capacity: {resource.capacity}</div>
                        <Badge variant="outline" className={`text-xs ${getResourceTypeColor(resource.type)}`}>
                          {resource.type}
                        </Badge>
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map((dayOfWeek) => (
                      <td key={dayOfWeek} className="border border-slate-200 p-2 align-top">
                        <div className="space-y-1">
                          {timeSlots.map((timeSlot, timeSlotIndex) => {
                            const booking = getBookingForSlot(resource.id, dayOfWeek, timeSlotIndex);
                            return (
                              <div key={timeSlotIndex} className="relative">
                                {booking ? (
                                  <div className={`p-2 rounded text-white text-xs ${getDepartmentColor(booking.department)} hover:opacity-80 transition-opacity cursor-pointer`}>
                                    <div className="font-semibold mb-1">{timeSlot}</div>
                                    <div className="space-y-1">
                                      <div>{booking.department}</div>
                                      <div className="font-medium">{booking.course}</div>
                                      <div>{booking.instructor}</div>
                                      <div className="flex items-center justify-between">
                                        <span>{booking.students} students</span>
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}></div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2 text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                                    {timeSlot}
                                    <div className="text-slate-300 mt-1">Available</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Resources</p>
                <p className="text-3xl font-bold text-slate-900">{filteredResources.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Active Bookings</p>
                <p className="text-3xl font-bold text-slate-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-900">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Utilization Rate</p>
                <p className="text-3xl font-bold text-slate-900">
                  {Math.round((bookings.filter(b => b.status === 'confirmed').length / (filteredResources.length * timeSlots.length * dayNames.length)) * 100)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Reservation Dialog */}
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reserve Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Resource Reservation</h3>
              <p>This feature will allow HODs to request and reserve resources in advance.</p>
              <p className="text-sm mt-2">Integration with the Class Allotment Module coming soon.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
