import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Calendar,
  LogOut,
  GraduationCap,
  Clock,
  FileText,
  BarChart3,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CollegeDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Principal";
  const adminType = localStorage.getItem("adminType");
  const userRole = localStorage.getItem("userRole");
  const [isProgramExpanded, setIsProgramExpanded] = useState<{ [key: string]: boolean }>({});
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [programs, setPrograms] = useState([
    {
      id: "bca",
      name: "BCA",
      fullName: "Bachelor of Computer Applications",
      resources: {
        classNumber: "Room 301-305",
        seatingCapacity: "60 students per class",
      },
      programDetails: {
        course: "BCA",
        credits: "120 Credits",
        duration: "3 Years",
      },
      courseInfo: "Course curriculum focuses on programming, database management, web development, and software engineering",
      timeTable: "Mon-Fri: 9:00 AM - 4:00 PM, Sat: 9:00 AM - 1:00 PM",
    },
    {
      id: "bba",
      name: "BBA",
      fullName: "Bachelor of Business Administration",
      resources: {
        classNumber: "Room 201-203",
        seatingCapacity: "80 students per class",
      },
      programDetails: {
        course: "BBA",
        credits: "120 Credits",
        duration: "3 Years",
      },
      courseInfo: "Comprehensive business education covering management, marketing, finance, and entrepreneurship",
      timeTable: "Mon-Fri: 10:00 AM - 5:00 PM, Sat: 10:00 AM - 2:00 PM",
    },
    {
      id: "ba",
      name: "BA",
      fullName: "Bachelor of Arts",
      resources: {
        classNumber: "Room 101-105",
        seatingCapacity: "100 students per class",
      },
      programDetails: {
        course: "BA (English, Hindi, Political Science)",
        credits: "120 Credits",
        duration: "3 Years",
      },
      courseInfo: "Liberal arts education with subjects like literature, history, political science, and languages",
      timeTable: "Mon-Fri: 8:00 AM - 3:00 PM, Sat: 8:00 AM - 12:00 PM",
    },
    {
      id: "bsc",
      name: "B.Sc",
      fullName: "Bachelor of Science",
      resources: {
        classNumber: "Room 401-405, Labs 1-3",
        seatingCapacity: "50 students per class",
      },
      programDetails: {
        course: "B.Sc (Physics, Chemistry, Mathematics)",
        credits: "120 Credits",
        duration: "3 Years",
      },
      courseInfo: "Science education with practical laboratory work in physics, chemistry, and mathematics",
      timeTable: "Mon-Fri: 9:00 AM - 4:00 PM, Sat: 9:00 AM - 1:00 PM",
    },
    {
      id: "bcom",
      name: "B.Com",
      fullName: "Bachelor of Commerce",
      resources: {
        classNumber: "Room 501-503",
        seatingCapacity: "90 students per class",
      },
      programDetails: {
        course: "B.Com (Accounting, Finance, Taxation)",
        credits: "120 Credits",
        duration: "3 Years",
      },
      courseInfo: "Commerce education focusing on accounting, business law, economics, and financial management",
      timeTable: "Mon-Fri: 10:00 AM - 5:00 PM, Sat: 10:00 AM - 2:00 PM",
    },
  ]);

  const [newProgram, setNewProgram] = useState({
    name: "",
    fullName: "",
    classNumber: "",
    seatingCapacity: "",
    credits: "",
    duration: "",
    courseInfo: "",
    timeTable: "",
  });

  // Determine if user is VC (can access university) or Principal (college only)
  const isVC = adminType === "vc" && userRole === "vc";
  const displayTitle = isVC ? `${userName} (VC)` : `${userName} (Principal)`;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const staffData = {
    teaching: {
      title: "Teaching",
      subtitle: "Faculty Members",
      count: 45,
      color: "bg-yellow-100 text-yellow-800",
    },
    nonTeaching: {
      title: "Non-Teaching",
      subtitle: "Support Staff",
      count: 18,
      color: "bg-green-100 text-green-800",
    },
  };

  const toggleProgramExpansion = (programId: string) => {
    setIsProgramExpanded(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const handleAddProgram = () => {
    if (newProgram.name && newProgram.fullName) {
      const programId = newProgram.name.toLowerCase().replace(/\s+/g, '-');
      const program = {
        id: programId,
        name: newProgram.name,
        fullName: newProgram.fullName,
        resources: {
          classNumber: newProgram.classNumber || "TBD",
          seatingCapacity: newProgram.seatingCapacity || "TBD",
        },
        programDetails: {
          course: newProgram.name,
          credits: newProgram.credits || "120 Credits",
          duration: newProgram.duration || "3 Years",
        },
        courseInfo: newProgram.courseInfo || "Course details to be updated",
        timeTable: newProgram.timeTable || "Schedule to be determined",
      };

      setPrograms([...programs, program]);
      setNewProgram({
        name: "",
        fullName: "",
        classNumber: "",
        seatingCapacity: "",
        credits: "",
        duration: "",
        courseInfo: "",
        timeTable: "",
      });
      setShowAddProgramForm(false);
    }
  };

  const attendanceData = {
    weekly: {
      title: "Weekly",
      subtitle: "Weekly attendance tracking and reports",
      percentage: "85%",
    },
    monthly: {
      title: "Monthly",
      subtitle: "Monthly attendance summary and analysis",
      percentage: "82%",
    },
    daily: {
      today: "2024-01-15",
      totalStudents: 180,
      present: 156,
      absent: 18,
      late: 6,
      records: [
        {
          studentId: "BCA001",
          name: "Rahul Sharma",
          status: "present",
          time: "9:00 AM",
        },
        {
          studentId: "BCA002",
          name: "Priya Patel",
          status: "present",
          time: "9:05 AM",
        },
        {
          studentId: "BCA003",
          name: "Amit Kumar",
          status: "late",
          time: "9:15 AM",
        },
        {
          studentId: "BCA004",
          name: "Sneha Singh",
          status: "absent",
          time: "-",
        },
        {
          studentId: "BCA005",
          name: "Vikash Yadav",
          status: "present",
          time: "8:55 AM",
        },
        {
          studentId: "BCA006",
          name: "Pooja Gupta",
          status: "present",
          time: "9:02 AM",
        },
      ],
    },
  };

  const handleStaffNavigation = (staffType: string) => {
    navigate(`/staff/${staffType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-college mr-3" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  BN College System Structure
                </h1>
                <p className="text-sm text-slate-600">
                  Comprehensive Academic Management Framework
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {displayTitle}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* College Header */}
        <div className="text-center mb-12">
          <Button className="bg-college text-college-foreground hover:bg-college/90 text-lg px-8 py-3 rounded-lg font-semibold">
            BN COLLEGE
          </Button>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Staff Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-slate-100 border-b">
              <CardTitle className="flex items-center text-slate-700">
                <Users className="h-5 w-5 mr-2" />
                STAFF
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 divide-y">
                <div 
                  className={`p-6 ${staffData.teaching.color} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => handleStaffNavigation('teaching')}
                >
                  <h3 className="font-bold text-lg">
                    {staffData.teaching.title}
                  </h3>
                  <p className="text-sm opacity-75">
                    {staffData.teaching.subtitle}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {staffData.teaching.count} Members
                  </Badge>
                </div>
                <div 
                  className={`p-6 ${staffData.nonTeaching.color} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => handleStaffNavigation('non-teaching')}
                >
                  <h3 className="font-bold text-lg">
                    {staffData.nonTeaching.title}
                  </h3>
                  <p className="text-sm opacity-75">
                    {staffData.nonTeaching.subtitle}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {staffData.nonTeaching.count} Members
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programs Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-slate-100 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-slate-700">
                  <BookOpen className="h-5 w-5 mr-2" />
                  PROGRAMS
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddProgramForm(!showAddProgramForm)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Add Program Form */}
              {showAddProgramForm && (
                <div className="bg-gray-50 p-4 border-b">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Add New Program</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Program Name (e.g., MBA)"
                      value={newProgram.name}
                      onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Full Name (e.g., Master of Business Administration)"
                      value={newProgram.fullName}
                      onChange={(e) => setNewProgram({...newProgram, fullName: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Class Number (e.g., Room 601-603)"
                      value={newProgram.classNumber}
                      onChange={(e) => setNewProgram({...newProgram, classNumber: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Seating Capacity (e.g., 40 students per class)"
                      value={newProgram.seatingCapacity}
                      onChange={(e) => setNewProgram({...newProgram, seatingCapacity: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Credits (e.g., 120 Credits)"
                      value={newProgram.credits}
                      onChange={(e) => setNewProgram({...newProgram, credits: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g., 2 Years)"
                      value={newProgram.duration}
                      onChange={(e) => setNewProgram({...newProgram, duration: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                    <textarea
                      placeholder="Course Information"
                      value={newProgram.courseInfo}
                      onChange={(e) => setNewProgram({...newProgram, courseInfo: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded h-16 resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Time Table (e.g., Mon-Fri: 11:00 AM - 6:00 PM)"
                      value={newProgram.timeTable}
                      onChange={(e) => setNewProgram({...newProgram, timeTable: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={handleAddProgram}
                        disabled={!newProgram.name || !newProgram.fullName}
                        className="flex-1 h-7 text-xs"
                      >
                        Add Program
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddProgramForm(false)}
                        className="flex-1 h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto">
                {programs.map((program, index) => (
                  <div key={program.id} className={`${index % 2 === 0 ? 'bg-purple-100' : 'bg-indigo-100'} p-4 ${index !== programs.length - 1 ? 'border-b border-white' : ''}`}>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleProgramExpansion(program.id)}
                    >
                      <div>
                        <h3 className="font-bold text-lg text-purple-800">
                          {program.name}
                        </h3>
                        <p className="text-xs text-purple-600">
                          {program.fullName}
                        </p>
                      </div>
                      {isProgramExpanded[program.id] ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                      )}
                    </div>

                    {isProgramExpanded[program.id] && (
                      <div className="mt-4 space-y-3">
                        {/* Resources Section */}
                        <div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                            <span className="font-semibold text-xs text-purple-800">
                              Resources
                            </span>
                          </div>
                          <div className="text-xs text-purple-700 ml-5 space-y-1">
                            <p>📍 {program.resources.classNumber}</p>
                            <p>👥 {program.resources.seatingCapacity}</p>
                          </div>
                        </div>

                        {/* Program Details Section */}
                        <div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                            <span className="font-semibold text-xs text-purple-800">
                              Program Details
                            </span>
                          </div>
                          <div className="text-xs text-purple-700 ml-5 space-y-1">
                            <p>📚 {program.programDetails.course}</p>
                            <p>🎓 {program.programDetails.credits}</p>
                            <p>⏰ {program.programDetails.duration}</p>
                          </div>
                        </div>

                        {/* Information Section */}
                        <div>
                          <div className="flex items-center mb-1">
                            <FileText className="w-3 h-3 text-purple-600 mr-2" />
                            <span className="font-semibold text-xs text-purple-800">
                              Course Information
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 ml-5">
                            {program.courseInfo}
                          </p>
                        </div>

                        {/* Time Table Section */}
                        <div>
                          <div className="flex items-center mb-1">
                            <Clock className="w-3 h-3 text-purple-600 mr-2" />
                            <span className="font-semibold text-xs text-purple-800">
                              Time Table
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 ml-5">
                            {program.timeTable}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-slate-100 border-b">
              <CardTitle className="flex items-center text-slate-700">
                <Calendar className="h-5 w-5 mr-2" />
                ATTENDANCE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-blue-100 p-6">
                <h3 className="font-bold text-lg text-blue-800 mb-4">
                  {programs[0].name}
                </h3>

                {/* Weekly Attendance */}
                <div className="mb-4 bg-red-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CalendarDays className="w-4 h-4 text-red-600 mr-2" />
                    <span className="font-bold text-red-800">
                      {attendanceData.weekly.title}
                    </span>
                  </div>
                  <p className="text-xs text-red-700 mb-2">
                    {attendanceData.weekly.subtitle}
                  </p>
                  <Badge variant="destructive" className="bg-red-600">
                    {attendanceData.weekly.percentage}
                  </Badge>
                </div>

                {/* Monthly Attendance */}
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-bold text-green-800">
                      {attendanceData.monthly.title}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mb-2">
                    {attendanceData.monthly.subtitle}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-green-600 text-white"
                  >
                    {attendanceData.monthly.percentage}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Attendance Management */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-slate-700">
                <UserCheck className="h-5 w-5 mr-2" />
                Daily Attendance Management
              </CardTitle>
              <CardDescription>
                Today's attendance overview -{" "}
                {new Date(attendanceData.daily.today).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Daily Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendanceData.daily.totalStudents}
                  </div>
                  <p className="text-sm text-blue-600">Total Students</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceData.daily.present}
                  </div>
                  <p className="text-sm text-green-600">Present</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {attendanceData.daily.absent}
                  </div>
                  <p className="text-sm text-red-600">Absent</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {attendanceData.daily.late}
                  </div>
                  <p className="text-sm text-yellow-600">Late</p>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">
                  Recent Attendance Records
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {attendanceData.daily.records.map((record, index) => {
                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case "present":
                          return (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          );
                        case "absent":
                          return <XCircle className="h-4 w-4 text-red-500" />;
                        case "late":
                          return (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          );
                        default:
                          return <XCircle className="h-4 w-4 text-gray-400" />;
                      }
                    };

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "present":
                          return "bg-green-50 border-green-200";
                        case "absent":
                          return "bg-red-50 border-red-200";
                        case "late":
                          return "bg-yellow-50 border-yellow-200";
                        default:
                          return "bg-gray-50 border-gray-200";
                      }
                    };

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getStatusColor(record.status)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">
                                {record.name}
                              </div>
                              <div className="text-xs text-slate-600">
                                ID: {record.studentId}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-600">
                              {record.time}
                            </span>
                            {getStatusIcon(record.status)}
                            <span className="text-xs capitalize font-medium">
                              {record.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-college">
                {staffData.teaching.count + staffData.nonTeaching.count}
              </div>
              <p className="text-sm text-slate-600">Total Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-college">{programs.length}</div>
              <p className="text-sm text-slate-600">Active Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-college">1,240</div>
              <p className="text-sm text-slate-600">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-college">83%</div>
              <p className="text-sm text-slate-600">Avg. Attendance</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
