import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { BookingRequest, DEFAULT_TIME_SLOTS } from '../../shared/resource-types';
import { UpdateBookingRequestStatusRequest } from '../../shared/api';
import { BookingRequestService } from '@/services/booking-request-service';
import { useToast } from '@/hooks/use-toast';
import { 
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Calendar,
  Building2,
  User,
  Filter,
  Search
} from 'lucide-react';

// Helper function to filter out internal data from notes
const filterInternalData = (notes: string): string => {
  if (!notes) return '';
  // Remove anything between [INTERNAL_DATA] and [/INTERNAL_DATA] tags
  return notes.replace(/\[INTERNAL_DATA\].*?\[\/INTERNAL_DATA\]/g, '').trim();
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BookingRequests() {
  const { currentHOD, allHODs } = useHODAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('received');
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch booking requests from API
  useEffect(() => {
    if (!currentHOD) return;
    
    const fetchBookingRequests = async () => {
      setIsLoading(true);
      try {
        // Fetch requests where current department is the target
        const receivedResponse = await BookingRequestService.getRequestsByTargetDepartment(currentHOD.department);
        
        // Fetch requests sent by current department
        const sentResponse = await BookingRequestService.getRequestsByRequesterDepartment(currentHOD.department);
        
        if (receivedResponse.success && sentResponse.success) {
          const allRequests = [
            ...(receivedResponse.data || []),
            ...(sentResponse.data || [])
          ];
          
          // Remove duplicates (in case a request appears in both lists)
          const uniqueRequests = Array.from(new Map(allRequests.map(req => [req.id, req])).values());
          setBookingRequests(uniqueRequests);
        } else {
          toast({
            title: 'Error fetching requests',
            description: receivedResponse.message || sentResponse.message,
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
    
    fetchBookingRequests();
  }, [currentHOD, toast]);

  const receivedRequests = bookingRequests.filter(req => 
    req.targetDepartment === currentHOD?.department && req.requesterId !== currentHOD?.id
  );

  const sentRequests = bookingRequests.filter(req => 
    req.requesterId === currentHOD?.id
  );

  const handleResponse = async (action: 'approve' | 'reject') => {
    if (!selectedRequest || !currentHOD) return;
    
    setIsLoading(true);
    try {
      const statusUpdate: UpdateBookingRequestStatusRequest = {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: currentHOD.id,
        notes: responseText.trim() || undefined
      };
      
      const response = await BookingRequestService.updateRequestStatus(selectedRequest.id, statusUpdate);
      
      if (response.success) {
        // Update the local state with the updated request
        setBookingRequests(prev => prev.map(req => 
          req.id === selectedRequest.id ? response.data! : req
        ));
        
        toast({
          title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
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

  const getRequesterName = (requesterId: string) => {
    const hod = allHODs.find(h => h.id === requesterId);
    return hod ? hod.name : 'Unknown HOD';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Requests</h1>
          <p className="text-slate-600 mt-1">Manage cross-department resource booking requests</p>
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
          <TabsTrigger value="received" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Received Requests ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <Send className="h-4 w-4 mr-2" />
            Sent Requests ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Received Requests */}
        <TabsContent value="received" className="space-y-4">
          {receivedRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No received requests</h3>
                <p className="text-slate-600">
                  No other departments have requested to use your resources yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map(request => (
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
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
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
                            <Building2 className="h-4 w-4 mr-2" />
                            {request.expectedAttendance} people
                          </div>
                        </div>

                        <div className="text-sm text-slate-600 mb-3">
                          <span className="font-medium">Requested by:</span> {getRequesterName(request.requesterId)}
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
                            <div className="text-sm font-medium text-slate-700 mb-1">Response Notes:</div>
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

        {/* Sent Requests */}
        <TabsContent value="sent" className="space-y-4">
          {sentRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Send className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No sent requests</h3>
                <p className="text-slate-600">
                  You haven't sent any resource booking requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sentRequests.map(request => (
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
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            {request.targetDepartment}
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
                            <User className="h-4 w-4 mr-2" />
                            {request.expectedAttendance} people
                          </div>
                        </div>

                        {request.purpose && (
                          <div className="text-sm text-slate-600 mb-3">
                            <span className="font-medium">Purpose:</span> {request.purpose}
                          </div>
                        )}

                        <div className="text-xs text-slate-500">
                          Sent: {new Date(request.requestDate).toLocaleString()}
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

                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-4 text-red-600 hover:text-red-700"
                          disabled={isLoading}
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              const statusUpdate = {
                                status: 'withdrawn' as const,
                                notes: 'Request withdrawn by requester'
                              };
                              
                              const response = await BookingRequestService.updateRequestStatus(request.id, statusUpdate);
                              
                              if (response.success) {
                                // Update the local state with the updated request
                                setBookingRequests(prev => prev.map(req => 
                                  req.id === request.id ? response.data! : req
                                ));
                                
                                toast({
                                  title: 'Request Withdrawn',
                                  description: 'The booking request has been withdrawn successfully.',
                                  variant: 'default'
                                });
                              } else {
                                toast({
                                  title: 'Error',
                                  description: response.message || 'Failed to withdraw the request.',
                                  variant: 'destructive'
                                });
                              }
                            } catch (error) {
                              console.error('Error withdrawing request:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to withdraw the request. Please try again.',
                                variant: 'destructive'
                              });
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Withdraw
                        </Button>
                      )}
                    </div>
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {responseAction === 'approve' 
                  ? 'Approving this request will make the resource unavailable for your department during the requested time slot.'
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
