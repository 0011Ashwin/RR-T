import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookingRequest, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';

import { BookingRequestService } from '@/services/booking-request-service';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  User,
  School,
  BookOpen
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function VCResourceApprovals() {
  const { toast } = useToast();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve');
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<{[key: string]: string}>({});

  // Check if user is VC
  useEffect(() => {
    const adminType = localStorage.getItem('adminType');
    if (adminType !== 'vc') {
      // Redirect if not VC
      window.location.href = '/';
    }
  }, []);

  // Fetch all booking requests that need VC approval
  useEffect(() => {
    const fetchBookingRequests = async () => {
      setIsLoading(true);
      try {
        const response = await BookingRequestService.getVCApprovalNeededRequests();
        
        if (response.success) {
          setBookingRequests(response.data || []);
        } else {
          toast({
            title: 'Error fetching requests',
            description: response.message,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching booking requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load booking requests. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Mock function to get department names
    const fetchDepartments = async () => {
      // In a real implementation, this would fetch from an API
      setDepartments({
        'dept1': 'Computer Science',
        'dept2': 'Electrical Engineering',
        'dept3': 'Mechanical Engineering',
        'dept4': 'Civil Engineering',
        'dept5': 'Physics',
        'dept6': 'Chemistry',
        'dept7': 'Mathematics'
      });
    };
    
    fetchBookingRequests();
    fetchDepartments();
  }, [toast]);

  const handleResponse = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    setIsLoading(true);
    try {
      const response = await BookingRequestService.updateVCApprovalStatus(
        selectedRequest.id,
        action === 'approve' ? true : false,
        responseText || undefined
      );

      if (response.success) {
        setBookingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        toast({
          title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'} by VC`, 
          description: `The booking request has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || `Failed to ${action} the request.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} the request. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseText('');
    }
  };

  const openResponseDialog = (request: BookingRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setResponseAction(action);
    setResponseText('');
    setResponseDialogOpen(true);
  };

  const getStatusColor = (request: BookingRequest) => {
    if (request.vcApproved) {
      return 'bg-green-100 text-green-800';
    } else if (request.status === 'approved') {
      return 'bg-yellow-100 text-yellow-800'; // Approved by HOD, pending VC approval
    } else if (request.status === 'rejected') {
      return 'bg-red-100 text-red-800';
    } else if (request.status === 'withdrawn') {
      return 'bg-gray-100 text-gray-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (request: BookingRequest) => {
    if (request.vcApproved) {
      return <CheckCircle className="h-4 w-4 mr-1" />;
    } else if (request.status === 'approved') {
      return <Clock className="h-4 w-4 mr-1" />;
    } else if (request.status === 'rejected') {
      return <XCircle className="h-4 w-4 mr-1" />;
    } else if (request.status === 'withdrawn') {
      return <AlertCircle className="h-4 w-4 mr-1" />;
    } else {
      return null;
    }
  };

  const getTimeSlotLabel = (timeSlotId: string) => {
    return DEFAULT_TIME_SLOTS.find(t => t.id === timeSlotId)?.label || 'Unknown Time';
  };

  const getDepartmentName = (deptId: string) => {
    return departments[deptId] || deptId;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Approval Requests</h1>
          <p className="text-slate-600 mt-1">Review and approve cross-department resource requests</p>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="w-full p-4 bg-blue-50 rounded-md">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="text-blue-600">Loading...</div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <School className="h-5 w-5 mr-2" />
            Pending VC Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingRequests.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No pending approvals</h3>
              <p className="text-slate-600">
                There are no resource booking requests that need your approval at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookingRequests.map(request => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {request.courseName}
                          </h3>
                          <Badge className={`text-xs ${getStatusColor(request)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request)}
                              <span className="capitalize">
                                 {request.status === 'approved' && !request.vcApproved
                                   ? 'Pending VC Approval'
                                   : request.status}
                               </span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {getDepartmentName(request.requesterDepartment)}
                          </div>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            {getDepartmentName(request.targetDepartment)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {DAYS[request.dayOfWeek]}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {getTimeSlotLabel(request.timeSlotId)}
                          </div>
                        </div>

                        {request.purpose && (
                          <div className="text-sm text-slate-600 mb-3">
                            <span className="font-medium">Purpose:</span> {request.purpose}
                          </div>
                        )}

                        <div className="text-xs text-slate-500">
                          Requested: {new Date(request.requestDate).toLocaleString()}
                          {request.responseDate && (
                            <span className="ml-4">
                              HOD Approved: {new Date(request.responseDate).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {request.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm font-medium text-slate-700 mb-1">HOD Approval Notes:</div>
                            <div className="text-sm text-slate-600">{request.notes}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => openResponseDialog(request, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isLoading}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openResponseDialog(request, 'reject')}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          disabled={isLoading}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {responseAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-900 mb-2">
                  {selectedRequest.courseName}
                </div>
                <div className="text-sm text-slate-600">
                  {getDepartmentName(selectedRequest.requesterDepartment)} → {getDepartmentName(selectedRequest.targetDepartment)} • {DAYS[selectedRequest.dayOfWeek]} • {getTimeSlotLabel(selectedRequest.timeSlotId)}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="responseNotes">
                {responseAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Optional)'}
              </Label>
              <Textarea
                id="responseNotes"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={
                  responseAction === 'approve' 
                    ? 'Add any notes or conditions for the approval...'
                    : 'Explain why the request is being rejected...'
                }
                rows={3}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {responseAction === 'approve' 
                  ? 'This will grant final approval for the cross-department resource usage.'
                  : 'This will reject the resource request despite HOD approval.'}
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                onClick={() => handleResponse(responseAction)}
                className={`flex-1 ${responseAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : responseAction === 'approve' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Request
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Request
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setResponseDialogOpen(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}