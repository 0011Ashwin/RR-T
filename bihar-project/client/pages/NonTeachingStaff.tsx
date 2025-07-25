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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NonTeachingStaff() {
  const navigate = useNavigate();

  const nonTeachingStaffData = [
    {
      id: "NT001",
      name: "Mr. Suresh Kumar",
      designation: "Administrative Officer",
      department: "Administration",
      role: "Office Management",
      qualification: "B.A",
      experience: "10 years",
      email: "suresh.kumar@bncollege.edu",
      phone: "+91-9876543220",
      joiningDate: "2013-04-10",
      status: "Active",
    },
    {
      id: "NT002",
      name: "Mrs. Meera Devi",
      designation: "Librarian",
      department: "Library",
      role: "Library Management",
      qualification: "M.Lib",
      experience: "8 years",
      email: "meera.devi@bncollege.edu",
      phone: "+91-9876543221",
      joiningDate: "2015-07-20",
      status: "Active",
    },
    {
      id: "NT003",
      name: "Mr. Raman Singh",
      designation: "Lab Technician",
      department: "Science Lab",
      role: "Laboratory Maintenance",
      qualification: "Diploma in Electronics",
      experience: "12 years",
      email: "raman.singh@bncollege.edu",
      phone: "+91-9876543222",
      joiningDate: "2011-09-15",
      status: "Active",
    },
    {
      id: "NT004",
      name: "Mr. Dinesh Yadav",
      designation: "Accountant",
      department: "Accounts",
      role: "Financial Management",
      qualification: "B.Com",
      experience: "6 years",
      email: "dinesh.yadav@bncollege.edu",
      phone: "+91-9876543223",
      joiningDate: "2017-01-05",
      status: "Active",
    },
    {
      id: "NT005",
      name: "Mr. Santosh Kumar",
      designation: "Security Guard",
      department: "Security",
      role: "Campus Security",
      qualification: "10th Pass",
      experience: "5 years",
      email: "santosh.kumar@bncollege.edu",
      phone: "+91-9876543224",
      joiningDate: "2018-03-12",
      status: "Active",
    },
    {
      id: "NT006",
      name: "Mrs. Kavita Sharma",
      designation: "Office Assistant",
      department: "Administration",
      role: "Administrative Support",
      qualification: "12th Pass",
      experience: "4 years",
      email: "kavita.sharma@bncollege.edu",
      phone: "+91-9876543225",
      joiningDate: "2019-08-01",
      status: "Active",
    },
  ];

  const getRoleIcon = (role: string) => {
    if (role.includes("Management") || role.includes("Administrative")) return <FileText className="h-4 w-4 mr-2 text-blue-500" />;
    if (role.includes("Library")) return <FileText className="h-4 w-4 mr-2 text-purple-500" />;
    if (role.includes("Laboratory") || role.includes("Maintenance")) return <Wrench className="h-4 w-4 mr-2 text-orange-500" />;
    if (role.includes("Security")) return <Shield className="h-4 w-4 mr-2 text-red-500" />;
    return <Users className="h-4 w-4 mr-2 text-gray-500" />;
  };

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
                  Non-Teaching Staff Directory
                </h1>
                <p className="text-sm text-slate-600">
                  Support Staff - BN College
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {nonTeachingStaffData.length} Support Staff
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
                {nonTeachingStaffData.filter(staff => staff.department === "Administration").length}
              </div>
              <p className="text-sm text-slate-600">Administrative</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {nonTeachingStaffData.filter(staff => staff.department === "Library").length}
              </div>
              <p className="text-sm text-slate-600">Library Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {nonTeachingStaffData.filter(staff => staff.department === "Science Lab").length}
              </div>
              <p className="text-sm text-slate-600">Technical Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {nonTeachingStaffData.filter(staff => staff.department === "Security").length}
              </div>
              <p className="text-sm text-slate-600">Security Staff</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nonTeachingStaffData.map((staff) => (
            <Card key={staff.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {staff.name}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="mt-1 bg-green-100 text-green-800"
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
                  {getRoleIcon(staff.role)}
                  <span className="font-medium">{staff.department}</span>
                </div>
                
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Role:</span> {staff.role}
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