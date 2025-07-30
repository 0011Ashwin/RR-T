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
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Calendar, 
  MapPin, 
  Users,
  Building2,
  Filter,
  Search,
  Eye,
  MessageSquare,
  History,
  TrendingUp,
  FileText,
  Bell,
  Star,
  Zap
} from 'lucide-react';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { toast } from 'sonner';

interface ResourceRequest {
  id: string;
  requesterName: string;
  requesterDepartment: string;
  requesterEmail: string;
  targetResourceName: string;
  targetDepartment: string;
  targetResourceId: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  courseName?: string;
  expectedAttendance: number;
  additionalRequirements?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  hodName: string;
  email: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  department: string;
  departmentId: string;
  location: string;
  building: string;
  facilities: string[];
  isShared: boolean;
  availability: 'available' | 'busy' | 'maintenance';
}

// Sample data for departments
const SAMPLE_DEPARTMENTS: Department[] = [
  { id: 'dept_001', name: 'Computer Science Engineering', code: 'CSE', hodName: 'Dr. Amitabh Singh', email: 'amitabh.singh@bec.ac.in' },
  { id: 'dept_002', name: 'Electronics and Communication', code: 'ECE', hodName: 'Dr. Sunita Kumari', email: 'sunita.kumari@bec.ac.in' },
  { id: 'dept_003', name: 'Mechanical Engineering', code: 'ME', hodName: 'Dr. Rajesh Prasad', email: 'rajesh.prasad@bec.ac.in' },
  { id: 'dept_004', name: 'Civil Engineering', code: 'CE', hodName: 'Dr. Anita Sharma', email: 'anita.sharma@bec.ac.in' },
  { id: 'dept_005', name: 'Physics', code: 'PHY', hodName: 'Dr. Manoj Kumar', email: 'manoj.kumar@msc.ac.in' },
  { id: 'dept_006', name: 'Chemistry', code: 'CHEM', hodName: 'Dr. Kavita Singh', email: 'kavita.singh@msc.ac.in' },
  { id: 'dept_007', name: 'Mathematics', code: 'MATH', hodName: 'Dr. Pradeep Thakur', email: 'pradeep.thakur@msc.ac.in' },
  { id: 'dept_008', name: 'Geography', code: 'GEO', hodName: 'Dr. Sushma Devi', email: 'sushma.devi@msc.ac.in' }
];

// Sample data for shared resources
const SAMPLE_SHARED_RESOURCES: Resource[] = [
  {
    id: 'res_shared_001',
    name: 'Main Auditorium',
    type: 'auditorium',
    capacity: 500,
    department: 'University',
    departmentId: 'dept_000',
    location: 'Ground Floor, Main Building',
    building: 'Main Building',
    facilities: ['Stage', 'Audio System', 'Video Projection', 'Lighting', 'AC'],
    isShared: true,
    availability: 'available'
  },
  {
    id: 'res_dept_001',
    name: 'Computer Lab 1',
    type: 'lab',
    capacity: 60,
    department: 'Computer Science',
    departmentId: 'dept_001',
    location: 'Room 201, A Block',
    building: 'A Block',
    facilities: ['Computers', 'Projector', 'Whiteboard', 'AC'],
    isShared: true,
    availability: 'available'
  },
  {
    id: 'res_dept_002',
    name: 'Electronics Lab',
    type: 'lab',
    capacity: 30,
    department: 'Electronics',
    departmentId: 'dept_002',
    location: 'Room 105, B Block',
    building: 'B Block',
    facilities: ['Oscilloscopes', 'Function Generators', 'Multimeters', 'Breadboards'],
    isShared: true,
    availability: 'available'
  },
  {
    id: 'res_dept_003',
    name: 'Manufacturing Lab',
    type: 'lab',
    capacity: 20,
    department: 'Mechanical',
    departmentId: 'dept_003',
    location: 'Room C-101, C Block',
    building: 'C Block',
    facilities: ['Lathe Machines', 'Milling Machines', 'Safety Equipment'],
    isShared: true,
    availability: 'available'
  },
  {
    id: 'res_dept_005',
    name: 'Physics Lab 1',
    type: 'lab',
    capacity: 35,
    department: 'Physics',
    departmentId: 'dept_005',
    location: 'Room S-201, Science Block',
    building: 'Science Block',
    facilities: ['Optical Bench', 'Laser Setup', 'Spectrometers'],
    isShared: true,
    availability: 'available'
  },
  {
    id: 'res_dept_006',
    name: 'Chemistry Lab 1',
    type: 'lab',
    capacity: 30,
    department: 'Chemistry',
    departmentId: 'dept_006',
    location: 'Room S-101, Science Block',
    building: 'Science Block',
    facilities: ['Fume Hoods', 'Analytical Balance', 'pH Meters'],
    isShared: true,
    availability: 'available'
  }
];

// Sample resource requests
const SAMPLE_REQUESTS: ResourceRequest[] = [
  {
    id: 'req_001',
    requesterName: 'Dr. Amitabh Singh',
    requesterDepartment: 'Computer Science',
    requesterEmail: 'amitabh.singh@bec.ac.in',
    targetResourceName: 'Main Auditorium',
    targetDepartment: 'University',
    targetResourceId: 'res_shared_001',
    requestedDate: '2024-01-25',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Department seminar on Artificial Intelligence and Machine Learning trends',
    courseName: 'AI/ML Seminar',
    expectedAttendance: 150,
    additionalRequirements: 'Microphone and recording setup needed',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-20T10:00:00Z',
    isRecurring: false
  },
  {
    id: 'req_002',
    requesterName: 'Dr. Sunita Kumari',
    requesterDepartment: 'Electronics',
    requesterEmail: 'sunita.kumari@bec.ac.in',
    targetResourceName: 'Computer Lab 1',
    targetDepartment: 'Computer Science',
    targetResourceId: 'res_dept_001',
    requestedDate: '2024-01-22',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Embedded systems programming workshop for ECE students',
    courseName: 'Embedded Systems',
    expectedAttendance: 45,
    additionalRequirements: 'Need Arduino kits and programming software',
    status: 'approved',
    priority: 'medium',
    createdAt: '2024-01-18T14:30:00Z',
    approvedAt: '2024-01-19T09:15:00Z',
    approvedBy: 'Dr. Amitabh Singh',
    notes: 'Approved with condition that ECE department provides their own Arduino kits'
  }
];

export default function EnhancedResourceRequestManagement() {
  const { currentHOD } = useHODAuth();
  const [myRequests, setMyRequests] = useState<ResourceRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ResourceRequest[]>([]);
  const [allRequests, setAllRequests] = useState<ResourceRequest[]>(SAMPLE_REQUESTS);
  const [departments] = useState<Department[]>(SAMPLE_DEPARTMENTS);
  const [sharedResources] = useState<Resource[]>(SAMPLE_SHARED_RESOURCES);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [activeTab, setActiveTab] = useState('my-requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // New request form state
  const [newRequest, setNewRequest] = useState({
    targetResourceId: '',
    targetDepartment: '',
    requestedDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    courseName: '',
    expectedAttendance: '',
    priority: 'medium' as const,
    additionalRequirements: '',
    isRecurring: false,
    recurringPattern: ''
  });

  useEffect(() => {
    if (currentHOD) {
      updateRequestLists();
    }
  }, [currentHOD, allRequests]);

  useEffect(() => {
    if (selectedDepartment) {
      const filtered = sharedResources.filter(r => 
        r.departmentId === selectedDepartment || r.isShared
      );
      setFilteredResources(filtered);
    } else {
      setFilteredResources(sharedResources.filter(r => r.isShared));
    }
  }, [selectedDepartment, sharedResources]);

  const updateRequestLists = () => {
    if (!currentHOD) return;

    // Filter requests made by current HOD
    const myRequestsList = allRequests.filter(req => 
      req.requesterEmail === currentHOD.email
    );
    setMyRequests(myRequestsList);

    // Filter requests targeting current HOD's department
    const pendingApprovalsList = allRequests.filter(req => 
      req.targetDepartment === currentHOD.department && 
      req.status === 'pending' &&
      req.requesterEmail !== currentHOD.email
    );
    setPendingApprovals(pendingApprovalsList);
  };

  const createRequest = async () => {
    if (!currentHOD) return;

    try {
      setLoading(true);
      
      if (!newRequest.targetResourceId || !newRequest.requestedDate || 
          !newRequest.startTime || !newRequest.endTime || !newRequest.purpose) {
        toast.error('Please fill in all required fields');
        return;
      }

      const selectedResource = sharedResources.find(r => r.id === newRequest.targetResourceId);
      if (!selectedResource) {
        toast.error('Selected resource not found');
        return;
      }

      const request: ResourceRequest = {
        id: `req_${Date.now()}`,
        requesterName: currentHOD.name,
        requesterDepartment: currentHOD.department,
        requesterEmail: currentHOD.email,
        targetResourceName: selectedResource.name,
        targetDepartment: selectedResource.department,
        targetResourceId: selectedResource.id,
        requestedDate: newRequest.requestedDate,
        startTime: newRequest.startTime,
        endTime: newRequest.endTime,
        purpose: newRequest.purpose,
        courseName: newRequest.courseName || undefined,
        expectedAttendance: parseInt(newRequest.expectedAttendance) || 1,
        additionalRequirements: newRequest.additionalRequirements || undefined,
        status: 'pending',
        priority: newRequest.priority,
        createdAt: new Date().toISOString(),
        isRecurring: newRequest.isRecurring,
        recurringPattern: newRequest.recurringPattern || undefined
      };

      setAllRequests(prev => [...prev, request]);
      
      setNewRequest({
        targetResourceId: '',
        targetDepartment: '',
        requestedDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        courseName: '',
        expectedAttendance: '',
        priority: 'medium',
        additionalRequirements: '',
        isRecurring: false,
        recurringPattern: ''
      });
      setSelectedDepartment('');
      setNewRequestOpen(false);
      
      toast.success('Resource request created successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    if (!currentHOD) return;

    try {
      setLoading(true);
      
      setAllRequests(prev => prev.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: action === 'approve' ? 'approved' : 'rejected',
            approvedBy: currentHOD.name,
            approvedAt: new Date().toISOString(),
            notes: action === 'approve' ? notes : undefined,
            rejectionReason: action === 'reject' ? notes : undefined
          };
        }
        return request;
      }));

      toast.success(`Request ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = (requestId: string) => {
    setAllRequests(prev => prev.map(request => {
      if (request.id === requestId && request.requesterEmail === currentHOD?.email) {
        return { ...request, status: 'cancelled' };
      }
      return request;
    }));
    toast.success('Request cancelled successfully!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getFilteredRequests = (requests: ResourceRequest[]) => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.targetResourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    return filtered;
  };

  const getRequestStats = () => {
    const total = myRequests.length;
    const pending = myRequests.filter(r => r.status === 'pending').length;
    const approved = myRequests.filter(r => r.status === 'approved').length;
    const rejected = myRequests.filter(r => r.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  if (!currentHOD) {
    return <div>Please log in to access resource requests.</div>;
  }

  const stats = getRequestStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inter-Department Resource Requests</h2>
          <p className="text-slate-600">Request and manage resources across departments</p>
        </div>
        <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Resource Request</DialogTitle>
              <DialogDescription>
                Request resources from other departments for your academic activities.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Target Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resource">Resource</Label>
                  <Select 
                    value={newRequest.targetResourceId} 
                    onValueChange={(value) => {
                      setNewRequest(prev => ({ ...prev, targetResourceId: value }));
                      const resource = filteredResources.find(r => r.id === value);
                      if (resource) {
                        setNewRequest(prev => ({ ...prev, targetDepartment: resource.department }));
                      }
                    }}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.type}, Capacity: {resource.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    value={newRequest.requestedDate}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, requestedDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    type="time"
                    value={newRequest.startTime}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    type="time"
                    value={newRequest.endTime}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course">Course Name</Label>
                  <Input
                    placeholder="Enter course name"
                    value={newRequest.courseName}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, courseName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="attendance">Expected Attendance</Label>
                  <Input
                    type="number"
                    placeholder="Number of students"
                    value={newRequest.expectedAttendance}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, expectedAttendance: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  placeholder="Describe the purpose of this request"
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newRequest.priority} onValueChange={(value: any) => setNewRequest(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Additional Requirements</Label>
                <Textarea
                  placeholder="Any special requirements or equipment needed"
                  value={newRequest.additionalRequirements}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewRequestOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createRequest} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Successfully approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Queue</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">Requests to approve</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-requests">My Requests ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="pending-approvals">Pending Approvals ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="resources">Available Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Resource Requests</CardTitle>
              <CardDescription>
                Track your requests to other departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getFilteredRequests(myRequests).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'No requests found matching your filters.' 
                    : 'No requests found. Create your first resource request!'}
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredRequests(myRequests).map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-slate-900">{request.targetResourceName}</h4>
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-slate-600">{request.targetDepartment}</p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <div>{new Date(request.requestedDate).toLocaleDateString()}</div>
                            <div>{request.startTime} - {request.endTime}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{request.courseName || 'No course specified'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{request.expectedAttendance} attendees</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-slate-700">{request.purpose}</p>
                        </div>

                        {request.additionalRequirements && (
                          <div className="mb-3">
                            <Label className="text-xs font-semibold">Additional Requirements:</Label>
                            <p className="text-sm text-slate-600">{request.additionalRequirements}</p>
                          </div>
                        )}

                        {request.status === 'rejected' && request.rejectionReason && (
                          <Alert className="mt-3 border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                              <strong>Rejection Reason:</strong> {request.rejectionReason}
                            </AlertDescription>
                          </Alert>
                        )}

                        {request.status === 'approved' && request.notes && (
                          <Alert className="mt-3 border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">
                              <strong>Approval Notes:</strong> {request.notes}
                            </AlertDescription>
                          </Alert>
                        )}

                        {request.status === 'pending' && (
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelRequest(request.id)}
                            >
                              Cancel Request
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve/reject requests for your department's resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No pending approvals found.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-slate-900">{request.targetResourceName}</h4>
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-slate-600">Requested by: {request.requesterName} ({request.requesterDepartment})</p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <div>{new Date(request.requestedDate).toLocaleDateString()}</div>
                            <div>{request.startTime} - {request.endTime}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{request.courseName || 'No course specified'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{request.expectedAttendance} attendees</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Label className="text-xs font-semibold">Purpose:</Label>
                          <p className="text-sm text-slate-700">{request.purpose}</p>
                        </div>

                        {request.additionalRequirements && (
                          <div className="mb-4">
                            <Label className="text-xs font-semibold">Additional Requirements:</Label>
                            <p className="text-sm text-slate-600">{request.additionalRequirements}</p>
                          </div>
                        )}

                        <Separator className="my-4" />

                        <div className="flex justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Request</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this request.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Enter rejection reason..."
                                  id={`reject-reason-${request.id}`}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                      const textarea = document.getElementById(`reject-reason-${request.id}`) as HTMLTextAreaElement;
                                      handleApproval(request.id, 'reject', textarea?.value);
                                    }}
                                  >
                                    Reject Request
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve Request</DialogTitle>
                                <DialogDescription>
                                  Add any notes or conditions for this approval.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Enter approval notes (optional)..."
                                  id={`approve-notes-${request.id}`}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      const textarea = document.getElementById(`approve-notes-${request.id}`) as HTMLTextAreaElement;
                                      handleApproval(request.id, 'approve', textarea?.value);
                                    }}
                                  >
                                    Approve Request
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Shared Resources</CardTitle>
              <CardDescription>
                Browse resources available for inter-department requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedResources.filter(r => r.isShared).map(resource => (
                  <Card key={resource.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <Badge 
                          variant={resource.availability === 'available' ? 'default' : 'destructive'}
                        >
                          {resource.availability}
                        </Badge>
                      </div>
                      <CardDescription>{resource.department} Department</CardDescription>
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

                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => {
                          setNewRequest(prev => ({ 
                            ...prev, 
                            targetResourceId: resource.id,
                            targetDepartment: resource.department 
                          }));
                          setSelectedDepartment(resource.departmentId);
                          setNewRequestOpen(true);
                        }}
                        disabled={resource.availability !== 'available'}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Request This Resource
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
