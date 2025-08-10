import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BookingRequest, Resource, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
import { BookingRequestService } from '@/services/booking-request-service';
import { ResourceService } from '@/services/resource-service';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building2, 
  Calendar, 
  Users, 
  MapPin, 
  Send, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PrincipalBookingRequests() {
  const { toast } = useToast();
  
  // Get Principal authentication data from localStorage
  const principalEmail = localStorage.getItem("principalEmail");
  const principalName = localStorage.getItem("principalName");
  const principalCollege = localStorage.getItem("principalCollege");

  const [activeTab, setActiveTab] = useState('received-pending');
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve');
  const [isLoading, setIsLoading] = useState(false);

  // Check if Principal is authenticated
  if (!principalEmail || !principalName) {
    window.location.href = '/login';
    return null;
  }

  const currentPrincipal = {
    id: principalEmail,
    name: principalName,
    email: principalEmail,
    college: principalCollege || 'Magadh Mahila College'
  };

  // Fetch booking requests and resources from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch shared resource requests (requests targeting University resources)
        const sharedResponse = await BookingRequestService.getSharedResourceRequests();
        
        // Fetch all resources so we can display resource names
        const resourcesResponse = await ResourceService.getAllResources();
        
        if (sharedResponse.success) {
          setBookingRequests(sharedResponse.data || []);
        } else {
          toast({
            title: 'Error fetching requests',
            description: sharedResponse.message,
            variant: 'destructive'
          });
        }
        
        if (resourcesResponse.success && resourcesResponse.data) {
          setResources(resourcesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Filter requests for shared resources (University resources)
  const receivedPendingRequests = bookingRequests.filter(req => 
    req.status === 'pending' &&
    (req.targetResourceId === '0' || req.targetDepartment === 'University')
  );

  const receivedProcessedRequests = bookingRequests.filter(req => 
    req.status !== 'pending' &&
    (req.targetResourceId === '0' || req.targetDepartment === 'University')
  );

  // Helper function to get resource name from ID
  const getResourceName = (resourceId: string): string => {
    const resource = resources.find(r => r.id?.toString() === resourceId);
    return resource ? resource.name : `Resource #${resourceId}`;
  };

  const handleResponse = async (action: 'approve' | 'reject') => {
    if (!selectedRequest || !currentPrincipal) return;
    
    setIsLoading(true);
    try {
      const response = await BookingRequestService.approveSharedResourceRequest(
        selectedRequest.id,
        action === 'approve' ? 'approved' : 'rejected',
        currentPrincipal.name,
        responseText.trim() || undefined
      );
      
      if (response.success) {
        // Update the local state with the updated request
        setBookingRequests(prev => prev.map(req => 
          req.id === selectedRequest.id ? response.data! : req
        ));
        
        setResponseDialogOpen(false);
        setResponseText('');
        setSelectedRequest(null);
        
        toast({
          title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `The shared resource request has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
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
      console.error(`Error ${action} request:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} the request. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openResponseDialog = (request: BookingRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setResponseAction(action);
    setResponseText('');
    setResponseDialogOpen(true);
  };

  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'withdrawn':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeSlotLabel = (timeSlotId: string) => {
    return DEFAULT_TIME_SLOTS.find(t => t.id === timeSlotId)?.label || 'Unknown Time';
  };

  // Filter out any internal booking system metadata from notes
  const filterInternalData = (notes: string | null | undefined): string => {
    if (!notes) return '';
    return notes.replace(/\[INTERNAL:.*?\]/g, '').trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shared Resource Requests</h1>
          <p className="text-slate-600 mt-1">Manage requests for university shared resources</p>
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

      {/* Request Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received-pending" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            Pending ({receivedPendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="received-processed" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Processed ({receivedProcessedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Received Pending Requests */}
        <TabsContent value="received-pending" className="space-y-4">
          {receivedPendingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No pending requests</h3>
                <p className="text-slate-600">
                  No departments are currently requesting shared university resources.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedPendingRequests.map(request => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {request.courseName}
                          </h3>
                          <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            {request.requesterDepartment}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {DAYS[request.dayOfWeek]}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {getTimeSlotLabel(request.timeSlotId)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {getResourceName(request.targetResourceId)}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {request.expectedAttendance} people
                          </div>
                        </div>

                        <div className="text-sm text-slate-600 mb-3">
                          <span className="font-medium">Requested by:</span> {request.requesterId}
                        </div>

                        {request.purpose && (
                          <div className="text-sm text-slate-600 mb-3">
                            <span className="font-medium">Purpose:</span> {request.purpose}
                          </div>
                        )}

                        <div className="text-xs text-slate-500">
                          Requested: {new Date(request.requestDate).toLocaleString()}
                        </div>

                        {request.notes && filterInternalData(request.notes) && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm font-medium text-slate-700 mb-1">Additional Notes:</div>
                            <div className="text-sm text-slate-600">{filterInternalData(request.notes)}</div>
                          </div>
                        )}
                      </div>

                      {request.status === 'pending' && (
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Received Processed Requests */}
        <TabsContent value="received-processed" className="space-y-4">
          {receivedProcessedRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No processed requests</h3>
                <p className="text-slate-600">
                  You haven't approved or rejected any shared resource requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedProcessedRequests.map(request => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {request.courseName}
                          </h3>
                          <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            {request.requesterDepartment}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {DAYS[request.dayOfWeek]}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {getTimeSlotLabel(request.timeSlotId)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {getResourceName(request.targetResourceId)}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {request.expectedAttendance} people
                          </div>
                        </div>

                        <div className="text-sm text-slate-600 mb-3">
                          <span className="font-medium">Requested by:</span> {request.requesterId}
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
                              Responded: {new Date(request.responseDate).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {request.notes && filterInternalData(request.notes) && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm font-medium text-slate-700 mb-1">Response Notes:</div>
                            <div className="text-sm text-slate-600">{filterInternalData(request.notes)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {request.status !== 'pending' && request.approvedBy && (
                      <div className="text-xs text-slate-500 border-t pt-2">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.approvedBy} on {new Date(request.responseDate || '').toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
                  {selectedRequest.requesterDepartment} • {DAYS[selectedRequest.dayOfWeek]} • {getTimeSlotLabel(selectedRequest.timeSlotId)}
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
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {responseAction === 'approve' 
                  ? 'Approving this request will make the shared resource unavailable during the requested time slot.'
                  : 'The requesting department will be notified of the rejection.'}
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
                disabled={isLoading}
                className="flex-1"
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
