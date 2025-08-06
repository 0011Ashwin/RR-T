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
import { Send, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Calendar, MapPin, Users } from 'lucide-react';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { toast } from 'sonner';

interface ResourceRequest {
  id: number;
  requester_name: string;
  requester_department_name: string;
  target_resource_name: string;
  target_department_name: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  course_name?: string;
  expected_attendance: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  rejection_reason?: string;
  notes?: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
  capacity: number;
  department_id: number;
  location: string;
}

export default function ResourceRequestManagement() {
  const { currentHOD } = useHODAuth();
  const [myRequests, setMyRequests] = useState<ResourceRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ResourceRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);

  // New request form state
  const [newRequest, setNewRequest] = useState({
    target_resource_id: '',
    target_department_id: '',
    requested_date: '',
    start_time: '',
    end_time: '',
    purpose: '',
    course_name: '',
    expected_attendance: '',
    priority: 'medium' as const,
    additional_requirements: ''
  });

  useEffect(() => {
    if (currentHOD) {
      fetchMyRequests();
      fetchPendingApprovals();
      fetchDepartments();
      fetchAllResources();
    }
  }, [currentHOD]);

  useEffect(() => {
    if (selectedDepartment) {
      const filtered = resources.filter(r => r.department_id.toString() === selectedDepartment);
      setFilteredResources(filtered);
    } else {
      setFilteredResources([]);
    }
  }, [selectedDepartment, resources]);

  const fetchMyRequests = async () => {
    try {
      const response = await fetch(`/api/resource-requests/requester/${currentHOD?.id}`);
      if (response.ok) {
        const data = await response.json();
        setMyRequests(data);
      }
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      // Get the HOD's department ID - we need to implement this
      const hodResponse = await fetch(`/api/hod-auth/profile/${currentHOD?.id}`);
      if (hodResponse.ok) {
        const hodData = await hodResponse.json();
        const response = await fetch(`/api/resource-requests/pending/department/${hodData.department_id}`);
        if (response.ok) {
          const data = await response.json();
          setPendingApprovals(data);
        }
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAllResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const createRequest = async () => {
    if (!currentHOD) return;

    try {
      setLoading(true);
      
      const hodResponse = await fetch(`/api/hod-auth/profile/${currentHOD.id}`);
      if (!hodResponse.ok) {
        throw new Error('Failed to get HOD profile');
      }
      const hodData = await hodResponse.json();

      const requestData = {
        requester_hod_id: currentHOD.id,
        requester_department_id: hodData.department_id,
        target_resource_id: parseInt(newRequest.target_resource_id),
        target_department_id: parseInt(newRequest.target_department_id),
        requested_date: newRequest.requested_date,
        start_time: newRequest.start_time,
        end_time: newRequest.end_time,
        purpose: newRequest.purpose,
        course_name: newRequest.course_name || undefined,
        expected_attendance: parseInt(newRequest.expected_attendance),
        priority: newRequest.priority,
        additional_requirements: newRequest.additional_requirements || undefined
      };

      const response = await fetch('/api/resource-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success('Resource request created successfully!');
        setNewRequestOpen(false);
        setNewRequest({
          target_resource_id: '',
          target_department_id: '',
          requested_date: '',
          start_time: '',
          end_time: '',
          purpose: '',
          course_name: '',
          expected_attendance: '',
          priority: 'medium',
          additional_requirements: ''
        });
        setSelectedDepartment('');
        fetchMyRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: number, action: 'approve' | 'reject', notes?: string) => {
    if (!currentHOD) return;

    try {
      setLoading(true);
      
      const hodResponse = await fetch(`/api/hod-auth/profile/${currentHOD.id}`);
      if (!hodResponse.ok) {
        throw new Error('Failed to get HOD profile');
      }
      const hodData = await hodResponse.json();

      const endpoint = action === 'approve' 
        ? `/api/resource-requests/${requestId}/approve`
        : `/api/resource-requests/${requestId}/reject`;

      const body = action === 'approve'
        ? { approver_hod_id: currentHOD.id, notes }
        : { approver_hod_id: currentHOD.id, rejection_reason: notes };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(`Request ${action}d successfully!`);
        fetchPendingApprovals();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
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
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (!currentHOD) {
    return <div>Please log in to access resource requests.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Resource Requests</h2>
          <p className="text-slate-600">Manage inter-department resource requests</p>
        </div>
        <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resource">Resource</Label>
                  <Select 
                    value={newRequest.target_resource_id} 
                    onValueChange={(value) => {
                      setNewRequest(prev => ({ ...prev, target_resource_id: value }));
                      const resource = filteredResources.find(r => r.id.toString() === value);
                      if (resource) {
                        setNewRequest(prev => ({ ...prev, target_department_id: resource.department_id.toString() }));
                      }
                    }}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id.toString()}>
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
                    value={newRequest.requested_date}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, requested_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    type="time"
                    value={newRequest.start_time}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    type="time"
                    value={newRequest.end_time}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course">Course Name</Label>
                  <Input
                    placeholder="Enter course name"
                    value={newRequest.course_name}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, course_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="attendance">Expected Attendance</Label>
                  <Input
                    type="number"
                    placeholder="Number of students"
                    value={newRequest.expected_attendance}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, expected_attendance: e.target.value }))}
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
                  value={newRequest.additional_requirements}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, additional_requirements: e.target.value }))}
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

      <Tabs defaultValue="my-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-requests">My Requests ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="pending-approvals">Pending Approvals ({pendingApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Resource Requests</CardTitle>
              <CardDescription>
                Track your requests to other departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No requests found. Create your first resource request!
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-slate-900">{request.target_resource_name}</h4>
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-slate-600">{request.target_department_name}</p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <div>{new Date(request.requested_date).toLocaleDateString()}</div>
                            <div>{request.start_time} - {request.end_time}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{request.course_name || 'No course specified'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{request.expected_attendance} attendees</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-slate-700">{request.purpose}</p>
                        </div>

                        {request.status === 'rejected' && request.rejection_reason && (
                          <Alert className="mt-3 border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                              <strong>Rejection Reason:</strong> {request.rejection_reason}
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
                              <h4 className="font-semibold text-slate-900">{request.target_resource_name}</h4>
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-slate-600">Requested by: {request.requester_name} ({request.requester_department_name})</p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <div>{new Date(request.requested_date).toLocaleDateString()}</div>
                            <div>{request.start_time} - {request.end_time}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{request.course_name || 'No course specified'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{request.expected_attendance} attendees</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-slate-700">{request.purpose}</p>
                        </div>

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
      </Tabs>
    </div>
  );
}
