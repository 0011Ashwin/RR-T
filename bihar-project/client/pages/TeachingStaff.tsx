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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TeachingStaff() {
  const navigate = useNavigate();

  const teachingStaffData = [
    {
      id: "T001",
      name: "Dr. Rajesh Kumar",
      designation: "Professor",
      department: "Computer Science",
      subject: "Data Structures & Algorithms",
      qualification: "Ph.D in Computer Science",
      experience: "15 years",
      email: "rajesh.kumar@bncollege.edu",
      phone: "+91-9876543210",
      joiningDate: "2008-07-15",
      status: "Active",
    },
    {
      id: "T002",
      name: "Prof. Sunita Sharma",
      designation: "Associate Professor",
      department: "Business Administration",
      subject: "Marketing Management",
      qualification: "MBA, Ph.D",
      experience: "12 years",
      email: "sunita.sharma@bncollege.edu",
      phone: "+91-9876543211",
      joiningDate: "2011-03-22",
      status: "Active",
    },
    {
      id: "T003",
      name: "Dr. Amit Patel",
      designation: "Assistant Professor",
      department: "Science",
      subject: "Physics & Mathematics",
      qualification: "M.Sc, Ph.D in Physics",
      experience: "8 years",
      email: "amit.patel@bncollege.edu",
      phone: "+91-9876543212",
      joiningDate: "2015-08-10",
      status: "Active",
    },
    {
      id: "T004",
      name: "Mrs. Priya Singh",
      designation: "Assistant Professor",
      department: "Arts",
      subject: "English Literature",
      qualification: "M.A in English",
      experience: "6 years",
      email: "priya.singh@bncollege.edu",
      phone: "+91-9876543213",
      joiningDate: "2017-06-01",
      status: "Active",
    },
    {
      id: "T005",
      name: "Mr. Vikash Yadav",
      designation: "Lecturer",
      department: "Commerce",
      subject: "Accounting & Finance",
      qualification: "M.Com, CA",
      experience: "5 years",
      email: "vikash.yadav@bncollege.edu",
      phone: "+91-9876543214",
      joiningDate: "2018-09-15",
      status: "Active",
    },
  ];

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
                  <span className="font-medium">{staff.department}</span>
                </div>
                
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Subject:</span> {staff.subject}
                </div>
                
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Qualification:</span> {staff.qualification}
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
                    <span className="text-xs">{staff.phone}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Joined: {new Date(staff.joiningDate).toLocaleDateString()}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    {staff.status}
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