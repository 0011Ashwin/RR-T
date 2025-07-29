import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Clock,
  FileText,
  BarChart3,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Building,
} from "lucide-react";

export default function CollegeDetails() {
  const { collegeName } = useParams();
  const navigate = useNavigate();

  // College data - in a real app, this would be fetched based on collegeName
  const getCollegeData = (name: string) => {
    const colleges = {
      "bn-college": {
        name: "BN College",
        type: "Constituent College",
        established: "1995",
        address: "University Campus, Main Road, City - 123456",
        phone: "+91 98765 43210",
        email: "principal@bncollege.edu",
        principal: {
          name: "Dr. Raj Kumar",
          qualification: "Ph.D. in Computer Science",
          experience: "15 years",
          phone: "+91 98765 43211",
        },
        stats: {
          totalStudents: 180,
          totalStaff: 63,
          teachingStaff: 45,
          nonTeachingStaff: 18,
          attendance: 87,
          programs: 3,
        },
        programs: [
          {
            name: "BCA",
            fullName: "Bachelor of Computer Applications",
            duration: "3 Years",
            totalSeats: 60,
            currentStudents: 75,
            subjects: [
              "Programming",
              "Database Management",
              "Web Development",
              "Data Structures",
              "Computer Networks",
            ],
            attendance: 85,
          },
          {
            name: "BBA",
            fullName: "Bachelor of Business Administration",
            duration: "3 Years",
            totalSeats: 50,
            currentStudents: 55,
            subjects: [
              "Management",
              "Finance",
              "Marketing",
              "HR",
              "Operations",
            ],
            attendance: 88,
          },
          {
            name: "B.Com",
            fullName: "Bachelor of Commerce",
            duration: "3 Years",
            totalSeats: 40,
            currentStudents: 50,
            subjects: [
              "Accounting",
              "Economics",
              "Business Law",
              "Taxation",
              "Banking",
            ],
            attendance: 89,
          },
        ],
        facilities: [
          "Computer Lab (60 systems)",
          "Library (5000+ books)",
          "Sports Ground",
          "Cafeteria",
          "Auditorium (200 capacity)",
          "Wi-Fi Campus",
        ],
        dailyAttendance: {
          today: "2024-01-15",
          present: 156,
          absent: 18,
          late: 6,
          percentage: 87,
        },
        staff: {
          teaching: [
            {
              name: "Dr. Priya Sharma",
              subject: "Computer Science",
              qualification: "Ph.D.",
              experience: "12 years",
            },
            {
              name: "Prof. Amit Singh",
              subject: "Management",
              qualification: "MBA",
              experience: "10 years",
            },
            {
              name: "Dr. Sneha Gupta",
              subject: "Commerce",
              qualification: "Ph.D.",
              experience: "8 years",
            },
            {
              name: "Prof. Vikash Yadav",
              subject: "Mathematics",
              qualification: "M.Sc.",
              experience: "6 years",
            },
            {
              name: "Ms. Pooja Patel",
              subject: "English",
              qualification: "M.A.",
              experience: "5 years",
            },
          ],
          nonTeaching: [
            {
              name: "Mr. Rahul Kumar",
              role: "Administrative Officer",
              experience: "8 years",
            },
            {
              name: "Ms. Deepika Singh",
              role: "Librarian",
              experience: "6 years",
            },
            {
              name: "Mr. Suresh Yadav",
              role: "Lab Technician",
              experience: "4 years",
            },
          ],
        },
      },
      "college-a": {
        name: "College A",
        type: "Affiliated College",
        established: "1988",
        address: "Sector 15, Industrial Area, City - 123457",
        phone: "+91 98765 43220",
        email: "principal@collegea.edu",
        principal: {
          name: "Dr. Priya Sharma",
          qualification: "Ph.D. in Management",
          experience: "18 years",
          phone: "+91 98765 43221",
        },
        stats: {
          totalStudents: 650,
          totalStaff: 85,
          teachingStaff: 60,
          nonTeachingStaff: 25,
          attendance: 89,
          programs: 8,
        },
        programs: [
          {
            name: "B.Tech",
            fullName: "Bachelor of Technology",
            duration: "4 Years",
            totalSeats: 120,
            currentStudents: 150,
            attendance: 91,
            subjects: [
              "Engineering Mechanics",
              "Computer Science",
              "Electronics",
              "Mathematics",
              "Physics"
            ],
          },
          {
            name: "MBA",
            fullName: "Master of Business Administration",
            duration: "2 Years",
            totalSeats: 60,
            currentStudents: 80,
            attendance: 89,
            subjects: [
              "Finance",
              "Marketing",
              "Human Resources",
              "Operations Management",
              "Business Strategy"
            ],
          },
          {
            name: "MCA",
            fullName: "Master of Computer Applications",
            duration: "3 Years",
            totalSeats: 40,
            currentStudents: 45,
            attendance: 87,
            subjects: [
              "Advanced Programming",
              "Database Systems",
              "Software Engineering",
              "Web Technologies",
              "Data Science"
            ],
          },
        ],
        facilities: [
          "Engineering Labs",
          "Research Center",
          "Hostels",
          "Sports Complex",
          "Medical Center",
        ],
        dailyAttendance: {
          today: "2024-01-15",
          present: 578,
          absent: 52,
          late: 20,
          percentage: 89,
        },
        staff: {
          teaching: [
            {
              name: "Dr. Anand Verma",
              subject: "Engineering",
              qualification: "Ph.D.",
              experience: "15 years",
            },
            {
              name: "Prof. Sanjay Gupta",
              subject: "Management",
              qualification: "MBA",
              experience: "12 years",
            },
            {
              name: "Dr. Meena Kumari",
              subject: "Computer Science",
              qualification: "Ph.D.",
              experience: "10 years",
            },
          ],
          nonTeaching: [
            {
              name: "Mr. Vijay Singh",
              role: "Administrative Officer",
              experience: "9 years",
            },
            {
              name: "Ms. Ritu Sharma",
              role: "Librarian",
              experience: "7 years",
            },
          ],
        },
      },
      // Add more colleges as needed
    };

    return colleges[name as keyof typeof colleges] || colleges["bn-college"];
  };

  const college = getCollegeData(collegeName || "bn-college");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/university")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to University
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {college.name} - Detailed Information
                </h1>
                <p className="text-sm text-slate-600">
                  {college.type} | Established {college.established}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* College Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* College Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Contact Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                      <span>{college.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-500" />
                      <span>{college.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-slate-500" />
                      <span>{college.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Principal Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {college.principal.name}
                    </p>
                    <p>
                      <strong>Qualification:</strong>{" "}
                      {college.principal.qualification}
                    </p>
                    <p>
                      <strong>Experience:</strong>{" "}
                      {college.principal.experience}
                    </p>
                    <p>
                      <strong>Contact:</strong> {college.principal.phone}
                    </p>
                  </div>
                </div>
              </div>

              {college.facilities && (
                <div>
                  <h4 className="font-semibold mb-2">Facilities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {college.facilities.map((facility, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="justify-center"
                      >
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {college.stats.attendance}%
                </div>
                <p className="text-sm text-slate-600">Overall Attendance</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Students</span>
                  <span className="font-semibold">
                    {college.stats.totalStudents}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Staff</span>
                  <span className="font-semibold">
                    {college.stats.totalStaff}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Teaching Staff</span>
                  <span className="font-semibold">
                    {college.stats.teachingStaff}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Non-Teaching Staff</span>
                  <span className="font-semibold">
                    {college.stats.nonTeachingStaff}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Programs</span>
                  <span className="font-semibold">
                    {college.stats.programs}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Programs Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Academic Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {college.programs.map((program, index) => (
                <div
                  key={index}
                  className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                >
                  <h4 className="font-bold text-purple-900 mb-2">
                    {program.name}
                  </h4>
                  <p className="text-sm text-purple-700 mb-3">
                    {program.fullName}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Seats:</span>
                      <span className="font-medium">{program.totalSeats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Students:</span>
                      <span className="font-medium">
                        {program.currentStudents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendance:</span>
                      <Badge variant="secondary">{program.attendance}%</Badge>
                    </div>
                  </div>

                  {program.subjects && (
                    <div className="mt-3">
                      <p className="text-xs text-purple-600 mb-1">
                        Key Subjects:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {program.subjects.slice(0, 3).map((subject, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {subject}
                          </Badge>
                        ))}
                        {program.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{program.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Attendance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Attendance -{" "}
              {new Date(college.dailyAttendance.today).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {college.stats.totalStudents}
                </div>
                <p className="text-sm text-blue-600">Total Students</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {college.dailyAttendance.present}
                </div>
                <p className="text-sm text-green-600">Present</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {college.dailyAttendance.absent}
                </div>
                <p className="text-sm text-red-600">Absent</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {college.dailyAttendance.late}
                </div>
                <p className="text-sm text-yellow-600">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Details */}
        {college.staff && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teaching Staff */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Teaching Staff ({college.stats.teachingStaff})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {college.staff.teaching.map((staff, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 rounded-lg p-3 border border-yellow-200"
                    >
                      <h5 className="font-semibold text-yellow-900">
                        {staff.name}
                      </h5>
                      <p className="text-sm text-yellow-700">
                        Subject: {staff.subject}
                      </p>
                      <p className="text-sm text-yellow-600">
                        {staff.qualification} | {staff.experience}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Non-Teaching Staff */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Non-Teaching Staff ({college.stats.nonTeachingStaff})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {college.staff.nonTeaching.map((staff, index) => (
                    <div
                      key={index}
                      className="bg-green-50 rounded-lg p-3 border border-green-200"
                    >
                      <h5 className="font-semibold text-green-900">
                        {staff.name}
                      </h5>
                      <p className="text-sm text-green-700">
                        Role: {staff.role}
                      </p>
                      <p className="text-sm text-green-600">
                        Experience: {staff.experience}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
