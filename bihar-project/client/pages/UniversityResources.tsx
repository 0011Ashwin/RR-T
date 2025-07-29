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
import { useHODAuth } from '@/hooks/use-hod-auth';
import { Resource, WeeklyTimeSlot, BookingRequest, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
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
  Plus
} from 'lucide-react';

const SAMPLE_SHARED_RESOURCES: Resource[] = [
  {
    id: 'shared_1',
    name: 'Main Auditorium',
    type: 'seminar_hall',
    capacity: 500,
    department: 'University',
    location: 'Ground Floor, Main Building',
    facilities: ['Projector', 'Audio System', 'AC', 'Stage'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'shared_2',
    name: 'Conference Hall A',
    type: 'conference_room',
    capacity: 50,
    department: 'University',
    location: 'First Floor, Admin Building',
    facilities: ['Video Conferencing', 'Smart Board', 'AC'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'shared_3',
    name: 'Computer Lab - Central',
    type: 'lab',
    capacity: 60,
    department: 'University',
    location: 'Second Floor, IT Building',
    facilities: ['60 Computers', 'Projector', 'Internet', 'AC'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'shared_4',
    name: 'Seminar Hall B',
    type: 'seminar_hall',
    capacity: 100,
    department: 'University',
    location: 'Third Floor, Academic Block',
    facilities: ['Projector', 'Audio System', 'AC'],
    isShared: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function UniversityResources() {
  const { currentHOD } = useHODAuth();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<WeeklyTimeSlot[]>([]);

  const [bookingForm, setBookingForm] = useState({
    timeSlotId: '',
    courseName: '',
    purpose: '',
    expectedAttendance: '',
  });

  useEffect(() => {
    // Generate sample weekly slots with some occupied slots
    const generateWeeklySlots = () => {
      const slots: WeeklyTimeSlot[] = [];
      
      SAMPLE_SHARED_RESOURCES.forEach(resource => {
        DEFAULT_TIME_SLOTS.forEach(timeSlot => {
          [1, 2, 3, 4, 5].forEach(day => { // Monday to Friday
            const isOccupied = Math.random() < 0.3; // 30% occupied
            slots.push({
              id: `slot_${resource.id}_${timeSlot.id}_${day}`,
              resourceId: resource.id,
              timeSlotId: timeSlot.id,
              dayOfWeek: day,
              isOccupied,
              occupiedBy: isOccupied ? {
                courseId: `course_${Math.floor(Math.random() * 100)}`,
                courseName: ['Physics Lab', 'Chemistry Practical', 'Department Meeting', 'Guest Lecture', 'Workshop'][Math.floor(Math.random() * 5)],
                department: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'][Math.floor(Math.random() * 5)],
                faculty: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown'][Math.floor(Math.random() * 4)],
                classSize: Math.floor(Math.random() * 50) + 20,
              } : undefined,
              bookingDate: new Date().toISOString(),
            });
          });
        });
      });
      
      setWeeklySlots(slots);
    };

    generateWeeklySlots();
  }, []);

  const filteredResources = SAMPLE_SHARED_RESOURCES.filter(resource => 
    filterType === 'all' || resource.type === filterType
  );

  const getSlotForResource = (resourceId: string, timeSlotId: string, day: number) => {
    return weeklySlots.find(slot => 
      slot.resourceId === resourceId && 
      slot.timeSlotId === timeSlotId && 
      slot.dayOfWeek === day
    );
  };

  const handleBookingRequest = () => {
    if (!selectedResource || !currentHOD) return;

    const newRequest: BookingRequest = {
      id: `request_${Date.now()}`,
      requesterId: currentHOD.id,
      requesterDepartment: currentHOD.department,
      targetResourceId: selectedResource.id,
      targetDepartment: selectedResource.department,
      timeSlotId: bookingForm.timeSlotId,
      dayOfWeek: selectedDay,
      courseName: bookingForm.courseName,
      purpose: bookingForm.purpose,
      expectedAttendance: parseInt(bookingForm.expectedAttendance),
      requestDate: new Date().toISOString(),
      status: 'pending',
    };

    setBookingRequests(prev => [...prev, newRequest]);
    setBookingDialogOpen(false);
    setBookingForm({
      timeSlotId: '',
      courseName: '',
      purpose: '',
      expectedAttendance: '',
    });
  };

  const getStatusColor = (status: WeeklyTimeSlot['isOccupied']) => {
    return status ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200';
  };

  const getResourceTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'seminar_hall':
        return <Building2 className="h-4 w-4" />;
      case 'conference_room':
        return <Users className="h-4 w-4" />;
      case 'lab':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">University Resources</h1>
          <p className="text-slate-600 mt-1">Shared facilities available for booking</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="seminar_hall">Seminar Halls</SelectItem>
              <SelectItem value="conference_room">Conference Rooms</SelectItem>
              <SelectItem value="lab">Laboratories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {filteredResources.map((resource) => (
          <Card 
            key={resource.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedResource?.id === resource.id ? 'ring-2 ring-indigo-500 border-indigo-200' : ''
            }`}
            onClick={() => setSelectedResource(resource)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getResourceTypeIcon(resource.type)}
                  <CardTitle className="text-lg">{resource.name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {resource.type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <Users className="h-4 w-4 mr-2" />
                Capacity: {resource.capacity}
              </div>
              
              {resource.location && (
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {resource.location}
                </div>
              )}

              {resource.facilities && resource.facilities.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-700 mb-1">Facilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {resource.facilities.slice(0, 3).map((facility, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {resource.facilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.facilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Resource Details */}
      {selectedResource && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {selectedResource.name} - Weekly Schedule
              </CardTitle>
              <div className="flex items-center space-x-3">
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
                
                <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Send className="h-4 w-4 mr-2" />
                      Request Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Resource Booking</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Resource</Label>
                        <Input value={selectedResource.name} disabled />
                      </div>
                      
                      <div>
                        <Label>Day</Label>
                        <Input value={DAYS[selectedDay]} disabled />
                      </div>
                      
                      <div>
                        <Label htmlFor="timeSlot">Time Slot *</Label>
                        <Select value={bookingForm.timeSlotId} onValueChange={(value) => 
                          setBookingForm(prev => ({ ...prev, timeSlotId: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_TIME_SLOTS.map(slot => {
                              const weeklySlot = getSlotForResource(selectedResource.id, slot.id, selectedDay);
                              const isOccupied = weeklySlot?.isOccupied;
                              
                              return (
                                <SelectItem 
                                  key={slot.id} 
                                  value={slot.id}
                                  disabled={isOccupied}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{slot.label}</span>
                                    {isOccupied && (
                                      <Badge variant="destructive" className="ml-2 text-xs">
                                        Occupied
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="courseName">Course/Event Name *</Label>
                        <Input
                          id="courseName"
                          value={bookingForm.courseName}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, courseName: e.target.value }))}
                          placeholder="Enter course or event name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="expectedAttendance">Expected Attendance *</Label>
                        <Input
                          id="expectedAttendance"
                          type="number"
                          value={bookingForm.expectedAttendance}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, expectedAttendance: e.target.value }))}
                          placeholder="Number of attendees"
                          max={selectedResource.capacity}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="purpose">Purpose (Optional)</Label>
                        <Textarea
                          id="purpose"
                          value={bookingForm.purpose}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
                          placeholder="Additional details about the booking"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button 
                          onClick={handleBookingRequest}
                          disabled={!bookingForm.timeSlotId || !bookingForm.courseName || !bookingForm.expectedAttendance}
                          className="flex-1"
                        >
                          Send Request
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setBookingDialogOpen(false)}
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-3">
                {DEFAULT_TIME_SLOTS.map(timeSlot => {
                  const slot = getSlotForResource(selectedResource.id, timeSlot.id, selectedDay);
                  
                  return (
                    <div
                      key={timeSlot.id}
                      className={`p-3 rounded-lg border text-center ${getStatusColor(slot?.isOccupied || false)}`}
                    >
                      <div className="font-medium text-sm">{timeSlot.label}</div>
                      {slot?.isOccupied && slot.occupiedBy ? (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-medium">{slot.occupiedBy.courseName}</div>
                          <div className="text-xs">{slot.occupiedBy.department}</div>
                          <div className="text-xs">{slot.occupiedBy.faculty}</div>
                          <div className="text-xs">{slot.occupiedBy.classSize} students</div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs">Available</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Requests Status */}
      {bookingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Your Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingRequests.map(request => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{request.courseName}</div>
                      <div className="text-sm text-slate-600">
                        {SAMPLE_SHARED_RESOURCES.find(r => r.id === request.targetResourceId)?.name} • 
                        {DAYS[request.dayOfWeek]} • 
                        {DEFAULT_TIME_SLOTS.find(t => t.id === request.timeSlotId)?.label}
                      </div>
                      {request.purpose && (
                        <div className="text-sm text-slate-500 mt-1">{request.purpose}</div>
                      )}
                    </div>
                    <Badge 
                      variant={request.status === 'pending' ? 'secondary' : 
                               request.status === 'approved' ? 'default' : 'destructive'}
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
