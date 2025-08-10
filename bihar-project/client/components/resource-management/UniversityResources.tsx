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
  University,
  Calendar,
  Clock,
  Users,
  MapPin,
  Send,
  Eye,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Plus
} from 'lucide-react';
import TimeSlotCalendar from './TimeSlotCalendar';
import ResourceFilters, { type FilterState } from './ResourceFilters';
import { exportScheduleToPDF, exportBookingRequests } from './exportUtils';
import type { Resource, TimeSlot, BookingRequest, Department } from './types';

// Mock data - In real implementation, this would come from API
const mockDepartments: Department[] = [
  { id: 'cs', name: 'Computer Science', code: 'CS', head: 'Dr. Rajesh Kumar Singh', color: '#3B82F6' },
  { id: 'math', name: 'Mathematics', code: 'MATH', head: 'Dr. Priya Sharma', color: '#10B981' },
  { id: 'physics', name: 'Physics', code: 'PHY', head: 'Dr. Amit Singh', color: '#8B5CF6' },
  { id: 'chemistry', name: 'Chemistry', code: 'CHEM', head: 'Dr. Neha Gupta', color: '#F59E0B' },
  { id: 'english', name: 'English', code: 'ENG', head: 'Dr. Sunita Rani', color: '#EF4444' },
];

const mockUniversityResources: Resource[] = [
  {
    id: 'ur-1',
    name: 'Main Auditorium',
    type: 'auditorium',
    capacity: 500,
    owningDepartment: 'Administration',
    building: 'Main Block',
    floor: 1,
    location: 'Ground Floor, Main Building',
    equipment: ['Sound System', 'Projector', 'Microphone', 'Stage Lighting'],
    facilities: ['AC', 'Recording Equipment', 'Live Streaming'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'ur-2',
    name: 'Central Library Conference Hall',
    type: 'conference_room',
    capacity: 150,
    owningDepartment: 'Library',
    building: 'Library Block',
    floor: 2,
    location: '2nd Floor, Library Building',
    equipment: ['Round Table Setup', 'Projector', 'Video Conferencing'],
    facilities: ['AC', 'High-Speed Internet', 'Catering Service'],
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'ur-3',
    name: 'Seminar Hall A',
    type: 'seminar_hall',
    capacity: 100,
    owningDepartment: 'Administration',
    building: 'Academic Block A',
    floor: 1,
    location: '1st Floor, Academic Block A',
    equipment: ['Smart Board', 'Projector', 'Sound System'],
    facilities: ['AC', 'Recording', 'Live Streaming'],
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'ur-4',
    name: 'Seminar Hall B',
    type: 'seminar_hall',
    capacity: 80,
    owningDepartment: 'Administration',
    building: 'Academic Block B',
    floor: 2,
    location: '2nd Floor, Academic Block B',
    equipment: ['Projector', 'Whiteboard', 'Sound System'],
    facilities: ['AC', 'Wi-Fi'],
    isActive: true,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'ur-5',
    name: 'Multi-Purpose Lab',
    type: 'lab',
    capacity: 60,
    owningDepartment: 'Engineering',
    building: 'Engineering Block',
    floor: 3,
    location: '3rd Floor, Engineering Block',
    equipment: ['Computers', 'Lab Equipment', 'Projector'],
    facilities: ['AC', 'High-Speed Internet', 'Power Backup'],
    isActive: true,
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  }
];

const mockTimeSlots: TimeSlot[] = [
  {
    id: 'ts-1',
    startTime: '09:00',
    endTime: '11:00',
    day: 1,
    resourceId: 'ur-1',
    department: 'Mathematics',
    course: 'Annual Conference 2024',
    instructor: 'Dr. Priya Sharma',
    students: 200,
    status: 'occupied',
    notes: 'Annual department conference'
  },
  {
    id: 'ts-2',
    startTime: '14:00',
    endTime: '16:00',
    day: 3,
    resourceId: 'ur-2',
    department: 'Computer Science',
    course: 'Industry Connect Meeting',
    instructor: 'Dr. Rajesh Kumar Singh',
    students: 50,
    status: 'approved',
    approvedBy: 'Library Admin',
    approvedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'ts-3',
    startTime: '10:00',
    endTime: '12:00',
    day: 5,
    resourceId: 'ur-3',
    department: 'Physics',
    course: 'Research Presentation',
    instructor: 'Dr. Amit Singh',
    students: 75,
    status: 'pending',
    requestedBy: 'Dr. Amit Singh',
    requestedAt: '2024-01-22T09:00:00Z'
  }
];

const mockBookingRequests: BookingRequest[] = [
  {
    id: 'br-1',
    resourceId: 'ur-1',
    resourceName: 'Main Auditorium',
    requestedBy: 'Dr. Rajesh Kumar Singh',
    requestedByDepartment: 'Computer Science',
    startTime: '09:00',
    endTime: '17:00',
    date: '2024-02-15',
    day: 4,
    purpose: 'Annual Tech Symposium - Industry experts and student presentations',
    expectedAttendees: 400,
    status: 'pending',
    requestedAt: '2024-01-25T10:30:00Z',
    recurring: false
  },
  {
    id: 'br-2',
    resourceId: 'ur-2',
    resourceName: 'Central Library Conference Hall',
    requestedBy: 'Dr. Neha Gupta',
    requestedByDepartment: 'Chemistry',
    startTime: '13:00',
    endTime: '17:00',
    date: '2024-02-20',
    day: 2,
    purpose: 'Faculty Development Program - Research Methodology Workshop',
    expectedAttendees: 120,
    status: 'approved',
    requestedAt: '2024-01-20T14:15:00Z',
    reviewedBy: 'Library Admin',
    reviewedAt: '2024-01-22T09:00:00Z',
    reviewNotes: 'Approved. Please coordinate with library staff for setup.',
    recurring: false
  },
  {
    id: 'br-3',
    resourceId: 'ur-3',
    resourceName: 'Seminar Hall A',
    requestedBy: 'Dr. Sunita Rani',
    requestedByDepartment: 'English',
    startTime: '14:00',
    endTime: '16:00',
    date: '2024-02-10',
    day: 6,
    purpose: 'Literary Society Meeting - Guest Speaker Session',
    expectedAttendees: 80,
    status: 'rejected',
    requestedAt: '2024-01-18T11:00:00Z',
    reviewedBy: 'Admin',
    reviewedAt: '2024-01-19T16:30:00Z',
    reviewNotes: 'Conflict with maintenance schedule. Please request alternative time.',
    recurring: false
  }
];

export default function UniversityResources() {
  const [filters, setFilters] = useState<FilterState>({
    resourceType: 'all',
    department: 'all',
    status: 'all',
    search: '',
    capacity: '',
    building: 'all',
    week: 0
  });

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{resourceId: string, day: number, time: string} | null>(null);
  const [bookingForm, setBookingForm] = useState({
    purpose: '',
    expectedAttendees: '',
    startTime: '',
    endTime: '',
    notes: '',
    recurring: false
  });
  const [showRequestDetails, setShowRequestDetails] = useState<BookingRequest | null>(null);

  const currentDepartment = 'Computer Science'; // This would come from user context

  const filteredResources = useMemo(() => {
    return mockUniversityResources.filter(resource => {
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
    const resource = mockUniversityResources.find(r => r.id === resourceId);
    if (!resource) return;

    const existingSlot = mockTimeSlots.find(
      slot => slot.resourceId === resourceId && slot.day === day && slot.startTime === timeSlot
    );

    if (!existingSlot && resource.owningDepartment !== currentDepartment) {
      setSelectedTimeSlot({ resourceId, day, time: timeSlot });
      setBookingForm(prev => ({ ...prev, startTime: timeSlot }));
      setIsBookingDialogOpen(true);
    }
  };

  const handleBookingSubmit = () => {
    if (!selectedTimeSlot) return;

    const newRequest: BookingRequest = {
      id: `br-${Date.now()}`,
      resourceId: selectedTimeSlot.resourceId,
      resourceName: mockUniversityResources.find(r => r.id === selectedTimeSlot.resourceId)?.name || '',
      requestedBy: 'Dr. Rajesh Kumar Singh', // Current user
      requestedByDepartment: currentDepartment,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      date: new Date().toISOString().split('T')[0],
      day: selectedTimeSlot.day,
      purpose: bookingForm.purpose,
      expectedAttendees: parseInt(bookingForm.expectedAttendees),
      status: 'pending',
      requestedAt: new Date().toISOString(),
      recurring: bookingForm.recurring
    };

    // In real implementation, this would be sent to API
    console.log('New booking request:', newRequest);
    
    setIsBookingDialogOpen(false);
    setSelectedTimeSlot(null);
    setBookingForm({
      purpose: '',
      expectedAttendees: '',
      startTime: '',
      endTime: '',
      notes: '',
      recurring: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <University className="h-6 w-6 mr-3 text-indigo-600" />
            College Resources
          </h2>
          <p className="text-slate-600">View shared college-wide resources and request bookings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportScheduleToPDF(filteredResources, mockTimeSlots, filters.week)}>
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button variant="outline" onClick={() => exportBookingRequests(mockBookingRequests)}>
            <Download className="h-4 w-4 mr-2" />
            Export Requests
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ResourceFilters
        filters={filters}
        onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
        departments={mockDepartments}
        buildings={[...new Set(mockUniversityResources.map(r => r.building).filter(Boolean))]}
        showAdvancedFilters={true}
      />

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule View
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Resource List
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center">
            <Send className="h-4 w-4 mr-2" />
            My Requests
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <TimeSlotCalendar
            resources={filteredResources}
            timeSlots={mockTimeSlots}
            onSlotClick={handleSlotClick}
            showWeekNavigation={true}
            viewMode="week"
            highlightAvailable={true}
            showDetails={true}
          />
        </TabsContent>

        {/* Resource List View */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
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
                      <Building2 className="h-4 w-4 mr-2" />
                      Owned by: {resource.owningDepartment}
                    </div>
                  </div>

                  {resource.equipment.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Equipment</h4>
                      <div className="flex flex-wrap gap-1">
                        {resource.equipment.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {resource.equipment.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{resource.equipment.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{resource.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-slate-700 mb-2">Basic Information</h4>
                              <div className="space-y-1 text-sm">
                                <div>Type: {resource.type.replace('_', ' ')}</div>
                                <div>Capacity: {resource.capacity}</div>
                                <div>Department: {resource.owningDepartment}</div>
                                <div>Location: {resource.location}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-700 mb-2">Facilities</h4>
                              <div className="flex flex-wrap gap-1">
                                {resource.facilities.map((facility, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {facility}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Equipment</h4>
                            <div className="flex flex-wrap gap-1">
                              {resource.equipment.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedResource(resource);
                        setIsBookingDialogOpen(true);
                      }}
                      disabled={resource.owningDepartment === currentDepartment}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {resource.owningDepartment === currentDepartment ? 'Own Resource' : 'Request Booking'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Requests View */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <p className="text-sm text-slate-600">Track status of your resource booking requests</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBookingRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{request.resourceName}</h4>
                        <p className="text-sm text-slate-600">{request.purpose}</p>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} flex items-center`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium">Date:</span> {request.date}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {request.startTime} - {request.endTime}
                      </div>
                      <div>
                        <span className="font-medium">Attendees:</span> {request.expectedAttendees}
                      </div>
                      <div>
                        <span className="font-medium">Requested:</span> {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {request.reviewNotes && (
                      <div className="mt-3 p-3 bg-slate-50 rounded">
                        <h5 className="text-sm font-medium text-slate-700">Review Notes:</h5>
                        <p className="text-sm text-slate-600 mt-1">{request.reviewNotes}</p>
                        {request.reviewedBy && (
                          <p className="text-xs text-slate-500 mt-2">
                            Reviewed by {request.reviewedBy} on {new Date(request.reviewedAt!).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowRequestDetails(request)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Request Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Resource Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="purpose">Purpose of Request</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the event or purpose..."
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Select value={bookingForm.startTime} onValueChange={(value) => setBookingForm(prev => ({ ...prev, startTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
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
                <Select value={bookingForm.endTime} onValueChange={(value) => setBookingForm(prev => ({ ...prev, endTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
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
              <Label htmlFor="attendees">Expected Attendees</Label>
              <Input
                id="attendees"
                type="number"
                placeholder="Number of attendees"
                value={bookingForm.expectedAttendees}
                onChange={(e) => setBookingForm(prev => ({ ...prev, expectedAttendees: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookingSubmit}>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      {showRequestDetails && (
        <AlertDialog open={!!showRequestDetails} onOpenChange={() => setShowRequestDetails(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Booking Request Details</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <div>
                    <strong>Resource:</strong> {showRequestDetails.resourceName}
                  </div>
                  <div>
                    <strong>Purpose:</strong> {showRequestDetails.purpose}
                  </div>
                  <div>
                    <strong>Date & Time:</strong> {showRequestDetails.date} • {showRequestDetails.startTime} - {showRequestDetails.endTime}
                  </div>
                  <div>
                    <strong>Expected Attendees:</strong> {showRequestDetails.expectedAttendees}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <Badge className={`ml-2 ${getStatusColor(showRequestDetails.status)}`}>
                      {showRequestDetails.status}
                    </Badge>
                  </div>
                  {showRequestDetails.reviewNotes && (
                    <div>
                      <strong>Review Notes:</strong>
                      <p className="mt-1 text-sm">{showRequestDetails.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
