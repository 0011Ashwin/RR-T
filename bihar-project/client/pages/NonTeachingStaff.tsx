import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowLeft,
  Phone,
  Mail,
  GraduationCap,
  Wrench,
  Shield,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FacultyService, Faculty } from "@/services/faculty-service";
import { useToast } from "@/hooks/use-toast";

export default function NonTeachingStaff() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nonTeachingStaffData, setNonTeachingStaffData] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNonTeachingStaff = async () => {
      setIsLoading(true);
      try {
        const response = await FacultyService.getAllFaculty();
        if (response.success && response.data) {
          // Filter for non-teaching staff (administrative roles)
          const nonTeachingRoles = ['Administrative Officer', 'Librarian', 'Lab Assistant', 'Office Assistant', 'Security Officer', 'Maintenance Staff', 'Accountant', 'Clerk'];
          const filteredStaff = response.data.filter(staff => 
            nonTeachingRoles.some(role => 
              staff.designation?.toLowerCase().includes(role.toLowerCase())
            )
          );
          setNonTeachingStaffData(filteredStaff);
        } else {
          toast({
            title: 'Error fetching staff',
            description: response.message || 'Failed to load staff data',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast({
          title: 'Error',
          description: 'Failed to load staff data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNonTeachingStaff();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-slate-600">Loading staff data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get appropriate icon for each role
  const getRoleIcon = (designation: string) => {
    if (designation?.includes("Administrative") || designation?.includes("Officer")) return <FileText className="h-4 w-4 mr-2 text-blue-500" />;
    if (designation?.includes("Librarian")) return <FileText className="h-4 w-4 mr-2 text-purple-500" />;
    if (designation?.includes("Lab") || designation?.includes("Maintenance")) return <Wrench className="h-4 w-4 mr-2 text-orange-500" />;
    if (designation?.includes("Security")) return <Shield className="h-4 w-4 mr-2 text-red-500" />;
    return <Users className="h-4 w-4 mr-2 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Non-Teaching Staff
                </h1>
                <p className="text-sm text-slate-600">
                  Administrative and Support Staff Management
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nonTeachingStaffData.length} Staff Members
              </div>
              <p className="text-xs text-slate-600">
                Active non-teaching staff
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administrative
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nonTeachingStaffData.filter(staff => staff.designation?.includes("Administrative") || staff.designation?.includes("Officer")).length}
              </div>
              <p className="text-xs text-slate-600">Office staff</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Staff</CardTitle>
              <Wrench className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nonTeachingStaffData.filter(staff => staff.designation?.includes("Lab") || staff.designation?.includes("Assistant")).length}
              </div>
              <p className="text-xs text-slate-600">Technical support</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nonTeachingStaffData.filter(staff => staff.designation?.includes("Security")).length}
              </div>
              <p className="text-xs text-slate-600">Security personnel</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nonTeachingStaffData.map((staff) => (
            <Card key={staff.id} className="border border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{staff.name}</h3>
                      <p className="text-sm text-slate-600">{staff.designation || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 mt-2">
                  {getRoleIcon(staff.designation || '')}
                  <span className="font-medium">{staff.department_name || 'Not specified'}</span>
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Email:</span> {staff.email}
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span> {staff.experience || 'Not specified'}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {staff.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-xs">{staff.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Joined: {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : 'Not available'}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    Active
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {nonTeachingStaffData.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Non-Teaching Staff Found</h3>
            <p className="text-slate-600">There are no non-teaching staff members in the system yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
