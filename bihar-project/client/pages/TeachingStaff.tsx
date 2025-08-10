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
  BookOpen,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FacultyService, Faculty } from "@/services/faculty-service";
import { useToast } from "@/hooks/use-toast";

export default function TeachingStaff() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teachingStaffData, setTeachingStaffData] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      setIsLoading(true);
      try {
        const response = await FacultyService.getAllFaculty();
        if (response.success && response.data) {
          setTeachingStaffData(response.data);
        } else {
          toast({
            title: 'Error fetching faculty',
            description: response.message || 'Failed to load faculty data',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        toast({
          title: 'Error',
          description: 'Failed to load faculty data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultyData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-slate-600">Loading faculty data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <GraduationCap className="h-8 w-8 text-college mr-3" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Teaching Staff Directory
                </h1>
                <p className="text-sm text-slate-600">
                  Faculty Members - BN College
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {teachingStaffData.length} Faculty Members
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {teachingStaffData.filter(staff => staff.designation === "Professor").length}
              </div>
              <p className="text-sm text-slate-600">Professors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {teachingStaffData.filter(staff => staff.designation === "Associate Professor").length}
              </div>
              <p className="text-sm text-slate-600">Associate Professors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {teachingStaffData.filter(staff => staff.designation === "Assistant Professor").length}
              </div>
              <p className="text-sm text-slate-600">Assistant Professors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {teachingStaffData.filter(staff => staff.designation === "Lecturer").length}
              </div>
              <p className="text-sm text-slate-600">Lecturers</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachingStaffData.map((staff) => (
            <Card key={staff.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {staff.name}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="mt-1 bg-blue-100 text-blue-800"
                    >
                      {staff.designation}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {staff.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-slate-600">
                  <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="font-medium">{staff.department_name || 'Not specified'}</span>
                </div>
                
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Subjects:</span> {staff.subjects?.join(', ') || 'Not assigned'}
                </div>
                
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Experience:</span> {staff.experience || 'Not specified'}
                </div>
                
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="h-4 w-4 mr-2 text-green-500" />
                  <span>{staff.experience} experience</span>
                </div>
                
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center text-sm text-slate-600 mb-1">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-xs">{staff.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-xs">{staff.phone || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Joined: {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : 'Not available'}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}