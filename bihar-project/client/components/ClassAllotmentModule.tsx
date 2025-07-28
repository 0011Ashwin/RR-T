import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  School,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface ClassroomBooking {
  id: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  department: string;
  course: string;
  instructor: string;
  dayOfWeek: number;
  date: string;
}

interface Classroom {
  id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  floor: number;
  building: string;
  type: 'lecture' | 'lab' | 'seminar';
  features: string[];
}

interface ClassAllotmentRequest {
  course: string;
  instructor: string;
  department: string;
  expectedStudents: number;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  date: string;
  selectedRoom?: Classroom;
}

export default function ClassAllotmentModule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(1);
  const [allotmentRequest, setAllotmentRequest] = useState<ClassAllotmentRequest>({
    course: "",
    instructor: "",
    department: "Computer Science",
    expectedStudents: 45,
    startTime: "09:00",
    endTime: "10:30",
    dayOfWeek: 1,
    date: new Date().toISOString().split('T')[0],
  });

  const timeSlots: TimeSlot[] = [
    { id: "1", startTime: "09:00", endTime: "10:30", label: "09:00 - 10:30" },
    { id: "2", startTime: "10:45", endTime: "12:15", label: "10:45 - 12:15" },
    { id: "3", startTime: "13:00", endTime: "14:30", label: "13:00 - 14:30" },
    { id: "4", startTime: "14:45", endTime: "16:15", label: "14:45 - 16:15" },
    { id: "5", startTime: "16:30", endTime: "18:00", label: "16:30 - 18:00" },
  ];

  const classrooms: Classroom[] = [
    { id: '1', name: 'Main Lecture Hall', roomNumber: 'LH-101', capacity: 100, floor: 1, building: 'Main Block', type: 'lecture', features: ['Projector', 'AC', 'Microphone'] },
    { id: '2', name: 'Computer Lab 1', roomNumber: 'CL-201', capacity: 60, floor: 2, building: 'CS Block', type: 'lab', features: ['Computers', 'AC', 'Projector'] },
    { id: '3', name: 'Physics Lab', roomNumber: 'PL-301', capacity: 45, floor: 3, building: 'Science Block', type: 'lab', features: ['Lab Equipment', 'Safety Features'] },
    { id: '4', name: 'Seminar Room A', roomNumber: 'SR-102', capacity: 45, floor: 1, building: 'Main Block', type: 'seminar', features: ['Round Table', 'Projector', 'AC'] },
    { id: '5', name: 'Lecture Room 1', roomNumber: 'LR-201', capacity: 60, floor: 2, building: 'Academic Block', type: 'lecture', features: ['Whiteboard', 'AC'] },
    { id: '6', name: 'Chemistry Lab', roomNumber: 'CH-302', capacity: 45, floor: 3, building: 'Science Block', type: 'lab', features: ['Fume Hoods', 'Safety Equipment'] },
    { id: '7', name: 'Smart Classroom', roomNumber: 'SC-104', capacity: 45, floor: 1, building: 'Modern Block', type: 'lecture', features: ['Smart Board', 'AC', 'Recording Equipment'] },
    { id: '8', name: 'Computer Lab 2', roomNumber: 'CL-202', capacity: 60, floor: 2, building: 'CS Block', type: 'lab', features: ['Computers', 'AC', 'Projector'] },
  ];

  const existingBookings: ClassroomBooking[] = [
    {
      id: '1',
      roomId: '1',
      roomName: 'Main Lecture Hall',
      startTime: '10:00',
      endTime: '12:00',
      department: 'Geography Department',
      course: 'BBA Semester 3',
      instructor: 'Dr. Smith Johnson',
      dayOfWeek: 1,
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '2',
      roomId: '2',
      roomName: 'Computer Lab 1',
      startTime: '14:00',
      endTime: '16:00',
      department: 'Computer Science',
      course: 'MCA Semester 1',
      instructor: 'Prof. Kumar Singh',
      dayOfWeek: 1,
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '3',
      roomId: '5',
      roomName: 'Lecture Room 1',
      startTime: '09:00',
      endTime: '10:30',
      department: 'Mathematics',
      course: 'B.Sc Mathematics Sem 2',
      instructor: 'Dr. Priya Sharma',
      dayOfWeek: 1,
      date: new Date().toISOString().split('T')[0],
    },
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const startTime1 = new Date(`2000-01-01T${start1}:00`);
    const endTime1 = new Date(`2000-01-01T${end1}:00`);
    const startTime2 = new Date(`2000-01-01T${start2}:00`);
    const endTime2 = new Date(`2000-01-01T${end2}:00`);
    
    return startTime1 < endTime2 && startTime2 < endTime1;
  };

  const getRoomConflicts = (roomId: string, startTime: string, endTime: string, dayOfWeek: number, date: string) => {
    return existingBookings.filter(booking => 
      booking.roomId === roomId &&
      booking.dayOfWeek === dayOfWeek &&
      booking.date === date &&
      isTimeOverlapping(startTime, endTime, booking.startTime, booking.endTime)
    );
  };

  const getFilteredClassrooms = () => {
    return classrooms.filter(room => 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setAllotmentRequest({
      ...allotmentRequest,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    });
  };

  const handleRoomSelect = (room: Classroom) => {
    setAllotmentRequest({
      ...allotmentRequest,
      selectedRoom: room,
    });
  };

  const handleSubmitAllotment = () => {
    if (!allotmentRequest.selectedRoom) return;
    
    const conflicts = getRoomConflicts(
      allotmentRequest.selectedRoom.id,
      allotmentRequest.startTime,
      allotmentRequest.endTime,
      allotmentRequest.dayOfWeek,
      allotmentRequest.date
    );

    if (conflicts.length > 0) {
      alert("Room is not available during the selected time slot!");
      return;
    }

    // Here you would typically send the request to your backend
    console.log("Class allotment request:", allotmentRequest);
    alert("Class allotment request submitted successfully!");
    setIsDialogOpen(false);
    
    // Reset form
    setAllotmentRequest({
      course: "",
      instructor: "",
      department: "Computer Science",
      expectedStudents: 45,
      startTime: "09:00",
      endTime: "10:30",
      dayOfWeek: 1,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
            Class Allotment Module
          </CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Request Room Allotment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-600 mb-4">
          Manage classroom allotments with time-based conflict detection and availability checking.
        </div>
        
        {/* Recent Allotments */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Recent Allotments</h4>
          {existingBookings.map((booking) => (
            <div key={booking.id} className="p-4 border rounded-lg bg-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{booking.course}</div>
                  <div className="text-sm text-slate-600">
                    {booking.roomName} ({booking.roomId === '1' ? 'LH-101' : 
                     booking.roomId === '2' ? 'CL-201' : 
                     booking.roomId === '5' ? 'LR-201' : 'Unknown'})
                  </div>
                  <div className="text-sm text-slate-500">
                    Instructor: {booking.instructor}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {dayNames[booking.dayOfWeek]}
                  </Badge>
                  <div className="text-sm font-medium text-slate-700">
                    {booking.startTime} - {booking.endTime}
                  </div>
                  <div className="text-xs text-slate-500">{booking.department}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Class Allotment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Request Class Allotment</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Class Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course/Subject</Label>
                    <Input
                      id="course"
                      placeholder="e.g., Database Management Systems"
                      value={allotmentRequest.course}
                      onChange={(e) => setAllotmentRequest({...allotmentRequest, course: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      placeholder="e.g., Dr. Priya Sharma"
                      value={allotmentRequest.instructor}
                      onChange={(e) => setAllotmentRequest({...allotmentRequest, instructor: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={allotmentRequest.department} onValueChange={(value) => setAllotmentRequest({...allotmentRequest, department: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expectedStudents">Expected Students</Label>
                    <Input
                      id="expectedStudents"
                      type="number"
                      value={allotmentRequest.expectedStudents}
                      onChange={(e) => setAllotmentRequest({...allotmentRequest, expectedStudents: parseInt(e.target.value) || 45})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={allotmentRequest.date}
                      onChange={(e) => setAllotmentRequest({...allotmentRequest, date: e.target.value, dayOfWeek: new Date(e.target.value).getDay()})}
                    />
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Time Selection</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={allotmentRequest.startTime}
                      onChange={(e) => setAllotmentRequest({...allotmentRequest, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={allotmentRequest.endTime}
                      onChange={(e) => setAllotmentRequest({...allotmentRequest, endTime: e.target.value})}
                    />
                  </div>
                </div>
                
                {/* Quick Time Slot Selection */}
                <div>
                  <Label>Quick Time Slots</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={
                          allotmentRequest.startTime === slot.startTime && allotmentRequest.endTime === slot.endTime
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleTimeSlotSelect(slot)}
                        className="justify-start"
                      >
                        <Clock className="h-3 w-3 mr-2" />
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Select Classroom</h3>
                  {allotmentRequest.selectedRoom && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {allotmentRequest.selectedRoom.roomNumber} Selected
                    </Badge>
                  )}
                </div>

                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search classrooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto scrollbar-thin">
                  {getFilteredClassrooms().map((room) => {
                    const conflicts = getRoomConflicts(
                      room.id,
                      allotmentRequest.startTime,
                      allotmentRequest.endTime,
                      allotmentRequest.dayOfWeek,
                      allotmentRequest.date
                    );
                    const isSelected = allotmentRequest.selectedRoom?.id === room.id;
                    const canFitClass = room.capacity >= allotmentRequest.expectedStudents;
                    const hasConflict = conflicts.length > 0;
                    
                    return (
                      <Card 
                        key={room.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                        } ${hasConflict ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={() => !hasConflict && canFitClass && handleRoomSelect(room)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm text-slate-900 mb-1">
                                {room.name}
                              </h4>
                              <div className="flex items-center text-xs text-slate-600 mb-1">
                                <Building2 className="h-3 w-3 mr-1" />
                                {room.roomNumber}
                              </div>
                              <div className="text-xs text-slate-500">
                                {room.building} • Floor {room.floor}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              {hasConflict ? (
                                <Badge variant="destructive" className="text-xs mb-1">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Occupied
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs mb-1">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Available
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Capacity:</span>
                              <span className="font-medium text-slate-900">{room.capacity}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Expected:</span>
                              <span className={`font-medium ${
                                allotmentRequest.expectedStudents <= room.capacity ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {allotmentRequest.expectedStudents} students
                              </span>
                            </div>
                            
                            {hasConflict && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  <div className="font-medium">Occupied Time: {conflicts[0].startTime} - {conflicts[0].endTime}</div>
                                  <div>Department: {conflicts[0].department}</div>
                                  <div>Class/Course: {conflicts[0].course}</div>
                                </AlertDescription>
                              </Alert>
                            )}

                            <Badge variant="outline" className="text-xs capitalize">
                              {room.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {allotmentRequest.selectedRoom && (
                  <Card className="bg-indigo-50 border-indigo-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-indigo-900 mb-1">
                            Selected: {allotmentRequest.selectedRoom.name}
                          </h4>
                          <div className="text-sm text-indigo-700">
                            {allotmentRequest.selectedRoom.roomNumber} • Capacity: {allotmentRequest.selectedRoom.capacity} • 
                            Features: {allotmentRequest.selectedRoom.features.join(', ')}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setAllotmentRequest({...allotmentRequest, selectedRoom: undefined})}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          Change
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAllotment}
                  disabled={!allotmentRequest.course || !allotmentRequest.instructor || !allotmentRequest.selectedRoom}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit Allotment Request
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
