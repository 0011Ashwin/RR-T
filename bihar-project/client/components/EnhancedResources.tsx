import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Plus,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
  Globe,
  Wand2,
  Eye,
  BookOpen,
  Laptop,
  Microscope,
  Presentation
} from 'lucide-react';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { toast } from 'sonner';

interface Resource {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'seminar_hall' | 'equipment' | 'auditorium';
  capacity: number;
  department: string;
  location: string;
  building: string;
  floor: number;
  facilities: string[];
  equipment: string[];
  description?: string;
  isShared: boolean;
  isActive: boolean;
  bookings?: Booking[];
}

interface Booking {
  id: string;
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
  department: string;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  attendees: number;
}

interface NewResource {
  name: string;
  type: string;
  capacity: string;
  location: string;
  building: string;
  floor: string;
  facilities: string[];
  equipment: string[];
  description: string;
  isShared: boolean;
}

interface NewBooking {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: string;
}

// Sample data for enhanced resources
const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'res_001',
    name: 'Computer Lab 1',
    type: 'lab',
    capacity: 60,
    department: 'Computer Science',
    location: 'Room 201',
    building: 'A Block',
    floor: 2,
    facilities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi', 'Power Backup'],
    equipment: ['Desktop Computers (60)', 'Printer', 'Scanner', 'Network Switch'],
    description: 'Modern computer lab with latest hardware and software for programming and development courses.',
    isShared: false,
    isActive: true,
    bookings: [
      {
        id: 'book_001',
        resourceId: 'res_001',
        date: '2024-01-20',
        startTime: '09:00',
        endTime: '11:00',
        bookedBy: 'Dr. Priya Sharma',
        department: 'Computer Science',
        purpose: 'Data Structures Lab',
        status: 'confirmed',
        attendees: 45
      }
    ]
  },
  {
    id: 'res_002',
    name: 'Electronics Lab',
    type: 'lab',
    capacity: 30,
    department: 'Electronics',
    location: 'Room 105',
    building: 'B Block',
    floor: 1,
    facilities: ['Oscilloscopes', 'Function Generators', 'Power Supply', 'Multimeters'],
    equipment: ['Breadboards (30)', 'Component Kits', 'Soldering Stations', 'PCB Fabrication'],
    description: 'Fully equipped electronics lab for circuit design and testing.',
    isShared: true,
    isActive: true,
    bookings: []
  },
  {
    id: 'res_003',
    name: 'Main Auditorium',
    type: 'auditorium',
    capacity: 500,
    department: 'University',
    location: 'Ground Floor',
    building: 'Main Building',
    floor: 0,
    facilities: ['Stage', 'Audio System', 'Video Projection', 'Lighting', 'AC'],
    equipment: ['Microphones (10)', 'Speakers', 'Projectors (2)', 'Recording Equipment'],
    description: 'Large auditorium for conferences, seminars, and university events.',
    isShared: true,
    isActive: true,
    bookings: []
  },
  {
    id: 'res_004',
    name: 'Physics Lab',
    type: 'lab',
    capacity: 25,
    department: 'Physics',
    location: 'Room 301',
    building: 'Science Block',
    floor: 3,
    facilities: ['Optical Bench', 'Dark Room', 'Precision Instruments', 'Safety Equipment'],
    equipment: ['Lasers', 'Spectrometers', 'Interferometers', 'Measurement Tools'],
    description: 'Advanced physics laboratory for experiments and research.',
    isShared: false,
    isActive: true,
    bookings: []
  },
  {
    id: 'res_005',
    name: 'Lecture Hall 1',
    type: 'classroom',
    capacity: 120,
    department: 'General',
    location: 'Room 150',
    building: 'Academic Block',
    floor: 1,
    facilities: ['Projector', 'Audio System', 'Whiteboard', 'Document Camera', 'AC'],
    equipment: ['Laptop', 'Speakers', 'Presentation Remote'],
    description: 'Large lecture hall suitable for major courses and presentations.',
    isShared: true,
    isActive: true,
    bookings: []
  }
];

const RESOURCE_TYPES = [
  { value: 'classroom', label: 'Classroom', icon: BookOpen },
  { value: 'lab', label: 'Laboratory', icon: Microscope },
  { value: 'seminar_hall', label: 'Seminar Hall', icon: Presentation },
  { value: 'equipment', label: 'Equipment', icon: Laptop },
  { value: 'auditorium', label: 'Auditorium', icon: Globe }
];

const FACILITY_OPTIONS = [
  'Projector', 'Whiteboard', 'AC', 'Wi-Fi', 'Audio System', 'Video System',
  'Stage', 'Microphones', 'Speakers', 'Document Camera', 'Power Backup',
  'Safety Equipment', 'Dark Room', 'Ventilation', 'Emergency Exit'
];

const EQUIPMENT_OPTIONS = [
  'Desktop Computers', 'Laptops', 'Printers', 'Scanners', 'Tablets',
  'Oscilloscopes', 'Multimeters', 'Function Generators', 'Microscopes',
  'Projectors', 'Cameras', 'Recording Equipment', 'Laboratory Kits',
  'Software Licenses', 'Network Equipment', 'Storage Devices'
];

export default function EnhancedResources() {
  const { currentHOD } = useHODAuth();
  const [resources, setResources] = useState<Resource[]>(SAMPLE_RESOURCES);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(SAMPLE_RESOURCES);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [newResource, setNewResource] = useState<NewResource>({
    name: '',
    type: '',
    capacity: '',
    location: '',
    building: '',
    floor: '',
    facilities: [],
    equipment: [],
    description: '',
    isShared: false
  });

  const [newBooking, setNewBooking] = useState<NewBooking>({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: ''
  });

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(resource => resource.type === filterType);
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(resource => resource.department === filterDepartment);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, filterType, filterDepartment]);

  const handleAddResource = () => {
    if (!newResource.name || !newResource.type || !newResource.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const resource: Resource = {
      id: `res_${Date.now()}`,
      name: newResource.name,
      type: newResource.type as any,
      capacity: parseInt(newResource.capacity),
      department: currentHOD?.department || 'Unknown',
      location: newResource.location,
      building: newResource.building,
      floor: parseInt(newResource.floor) || 1,
      facilities: newResource.facilities,
      equipment: newResource.equipment,
      description: newResource.description,
      isShared: newResource.isShared,
      isActive: true,
      bookings: []
    };

    setResources(prev => [...prev, resource]);
    setNewResource({
      name: '',
      type: '',
      capacity: '',
      location: '',
      building: '',
      floor: '',
      facilities: [],
      equipment: [],
      description: '',
      isShared: false
    });
    setIsAddResourceOpen(false);
    toast.success('Resource added successfully!');
  };

  const handleBookResource = () => {
    if (!newBooking.date || !newBooking.startTime || !newBooking.endTime || !newBooking.purpose) {
      toast.error('Please fill in all required fields');
      return;
    }

    const booking: Booking = {
      id: `book_${Date.now()}`,
      resourceId: newBooking.resourceId,
      date: newBooking.date,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      bookedBy: currentHOD?.name || 'Unknown',
      department: currentHOD?.department || 'Unknown',
      purpose: newBooking.purpose,
      status: 'confirmed',
      attendees: parseInt(newBooking.attendees) || 1
    };

    setResources(prev => prev.map(resource => {
      if (resource.id === newBooking.resourceId) {
        return {
          ...resource,
          bookings: [...(resource.bookings || []), booking]
        };
      }
      return resource;
    }));

    setNewBooking({
      resourceId: '',
      date: '',
      startTime: '',
      endTime: '',
      purpose: '',
      attendees: ''
    });
    setIsBookingOpen(false);
    toast.success('Resource booked successfully!');
  };

  const handleDeleteResource = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
    toast.success('Resource deleted successfully!');
  };

  const toggleResourceStatus = (resourceId: string) => {
    setResources(prev => prev.map(resource => {
      if (resource.id === resourceId) {
        return { ...resource, isActive: !resource.isActive };
      }
      return resource;
    }));
    toast.success('Resource status updated!');
  };

  const getResourceIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find(rt => rt.value === type);
    const Icon = resourceType?.icon || Building2;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getTodayBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings: (Booking & { resourceName: string })[] = [];
    
    resources.forEach(resource => {
      resource.bookings?.forEach(booking => {
        if (booking.date === today) {
          todayBookings.push({
            ...booking,
            resourceName: resource.name
          });
        }
      });
    });
    
    return todayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const departments = [...new Set(resources.map(r => r.department))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Resource Management</h2>
          <p className="text-slate-600">Manage department resources and bookings</p>
        </div>
        <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>
                Create a new resource for your department
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Resource Name</Label>
                  <Input
                    placeholder="e.g., Computer Lab 1"
                    value={newResource.name}
                    onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newResource.type} onValueChange={(value) => setNewResource(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    placeholder="Number of seats/people"
                    value={newResource.capacity}
                    onChange={(e) => setNewResource(prev => ({ ...prev, capacity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    placeholder="Floor number"
                    value={newResource.floor}
                    onChange={(e) => setNewResource(prev => ({ ...prev, floor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Building</Label>
                  <Input
                    placeholder="e.g., A Block"
                    value={newResource.building}
                    onChange={(e) => setNewResource(prev => ({ ...prev, building: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Room 201"
                    value={newResource.location}
                    onChange={(e) => setNewResource(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the resource and its features"
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label>Facilities</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {FACILITY_OPTIONS.map(facility => (
                    <label key={facility} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newResource.facilities.includes(facility)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewResource(prev => ({
                              ...prev,
                              facilities: [...prev.facilities, facility]
                            }));
                          } else {
                            setNewResource(prev => ({
                              ...prev,
                              facilities: prev.facilities.filter(f => f !== facility)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newResource.isShared}
                  onChange={(e) => setNewResource(prev => ({ ...prev, isShared: e.target.checked }))}
                />
                <Label>Allow other departments to book this resource</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddResourceOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddResource}>
                  Add Resource
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-xs text-muted-foreground">
                  {resources.filter(r => r.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTodayBookings().length}</div>
                <p className="text-xs text-muted-foreground">
                  Active bookings today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared Resources</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.filter(r => r.isShared).length}</div>
                <p className="text-xs text-muted-foreground">
                  Available to other departments
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Current bookings for today</CardDescription>
            </CardHeader>
            <CardContent>
              {getTodayBookings().length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No bookings scheduled for today
                </div>
              ) : (
                <div className="space-y-4">
                  {getTodayBookings().map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{booking.resourceName}</div>
                        <div className="text-sm text-slate-600">{booking.purpose}</div>
                        <div className="text-xs text-slate-500">
                          {booking.startTime} - {booking.endTime} • {booking.attendees} attendees
                        </div>
                      </div>
                      <Badge variant="outline">{booking.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {RESOURCE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <Card key={resource.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                    </div>
                    {getStatusBadge(resource.isActive)}
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{resource.capacity} capacity</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{resource.location}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Facilities:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resource.facilities.slice(0, 3).map(facility => (
                        <Badge key={facility} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {resource.facilities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.facilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{resource.name}</DialogTitle>
                          <DialogDescription>Resource details and information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Type</Label>
                              <div className="text-sm">{RESOURCE_TYPES.find(t => t.value === resource.type)?.label}</div>
                            </div>
                            <div>
                              <Label>Capacity</Label>
                              <div className="text-sm">{resource.capacity} people</div>
                            </div>
                            <div>
                              <Label>Location</Label>
                              <div className="text-sm">{resource.building}, {resource.location}</div>
                            </div>
                            <div>
                              <Label>Department</Label>
                              <div className="text-sm">{resource.department}</div>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <div className="text-sm text-slate-600 mt-1">{resource.description}</div>
                          </div>

                          <div>
                            <Label>Facilities</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {resource.facilities.map(facility => (
                                <Badge key={facility} variant="outline">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label>Equipment</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {resource.equipment.map(equipment => (
                                <Badge key={equipment} variant="secondary">
                                  {equipment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setNewBooking(prev => ({ ...prev, resourceId: resource.id }))}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Book
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book Resource</DialogTitle>
                          <DialogDescription>
                            Book {resource.name} for your department use
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={newBooking.date}
                                onChange={(e) => setNewBooking(prev => ({ ...prev, date: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Expected Attendees</Label>
                              <Input
                                type="number"
                                max={resource.capacity}
                                placeholder="Number of people"
                                value={newBooking.attendees}
                                onChange={(e) => setNewBooking(prev => ({ ...prev, attendees: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Time</Label>
                              <Input
                                type="time"
                                value={newBooking.startTime}
                                onChange={(e) => setNewBooking(prev => ({ ...prev, startTime: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>End Time</Label>
                              <Input
                                type="time"
                                value={newBooking.endTime}
                                onChange={(e) => setNewBooking(prev => ({ ...prev, endTime: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Purpose</Label>
                            <Textarea
                              placeholder="Describe the purpose of booking"
                              value={newBooking.purpose}
                              onChange={(e) => setNewBooking(prev => ({ ...prev, purpose: e.target.value }))}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleBookResource}>
                              Book Resource
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleResourceStatus(resource.id)}
                    >
                      {resource.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                View and manage all resource bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.flatMap(resource => 
                  (resource.bookings || []).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{resource.name}</div>
                        <div className="text-sm text-slate-600">{booking.purpose}</div>
                        <div className="text-xs text-slate-500">
                          {booking.date} • {booking.startTime} - {booking.endTime} • {booking.attendees} attendees
                        </div>
                        <div className="text-xs text-slate-500">
                          Booked by: {booking.bookedBy} ({booking.department})
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{booking.status}</Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                {resources.every(r => !r.bookings || r.bookings.length === 0) && (
                  <div className="text-center py-8 text-slate-500">
                    No bookings found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Most and least used resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.map(resource => {
                    const bookingCount = resource.bookings?.length || 0;
                    const utilizationPercentage = Math.min((bookingCount / 10) * 100, 100);
                    
                    return (
                      <div key={resource.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{resource.name}</span>
                          <span>{bookingCount} bookings</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${utilizationPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Statistics</CardTitle>
                <CardDescription>Department resource breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RESOURCE_TYPES.map(type => {
                    const count = resources.filter(r => r.type === type.value).length;
                    const percentage = (count / resources.length) * 100;
                    
                    return (
                      <div key={type.value} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{type.label}</span>
                          <span>{count} resources</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
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
    </div>
  );
}
