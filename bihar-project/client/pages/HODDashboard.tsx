import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useHODAuth } from "@/hooks/use-hod-auth";
import Resources from "./Resources";
import RoutineBuilder from "./RoutineBuilder";
import ResourceManagement from "./ResourceManagement";
import BookingRequests from "./BookingRequests";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  LogOut,
  GraduationCap,
  BarChart3,
  Users,
  Settings,
  Bell,
  Plus,
  Edit,
  Eye,
  Trash2,
  FileText,
  UserCheck,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Building2,
  School,
  CalendarDays,
  MapPin,
  User,
  Phone,
  Mail,
  Globe,
  Calendar,
  Wand2,
  Database,
  Send,
} from "lucide-react";
import TimetableManagement from "../components/TimetableManagement";
import ClassAllotmentModule from "../components/ClassAllotmentModule";
import ResourceOverview from "../components/ResourceOverview";
import ResourceRequestManagement from "../components/ResourceRequestManagement";

export default function HODDashboard() {
  const navigate = useNavigate();
  const { currentHOD, logout, isAuthenticated } = useHODAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(2);
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!currentHOD) {
    return null; // Will redirect to login
  }

  const hodProfile = {
    name: currentHOD.name,
    designation: currentHOD.designation,
    department: currentHOD.department,
    email: currentHOD.email,
    phone: "+91 98765 43210",
    employeeId: currentHOD.employeeId,
    joinDate: currentHOD.joinDate,
    experience: currentHOD.experience,
    avatar: currentHOD.avatar || "/api/placeholder/150/150",
  };

  const departmentStats = {
    totalStudents: 480,
    totalFaculty: 25,
    totalSubjects: 45,
    activeSemesters: 6,
    timetablesCreated: 12,
    pendingApprovals: 3,
  };

  const facultyMembers = [
    {
      id: "1",
      name: "Dr. Priya Sharma",
      designation: "Associate Professor",
      subjects: ["Database Management", "Data Mining"],
      email: "priya.sharma@university.ac.in",
      phone: "+91 98765 43211",
      status: "active",
    },
    {
      id: "2",
      name: "Prof. Amit Singh",
      designation: "Assistant Professor",
      subjects: ["Web Development", "Software Engineering"],
      email: "amit.singh@university.ac.in",
      phone: "+91 98765 43212",
      status: "active",
    },
    {
      id: "3",
      name: "Dr. Neha Gupta",
      designation: "Associate Professor",
      subjects: ["Data Structures", "Algorithms"],
      email: "neha.gupta@university.ac.in",
      phone: "+91 98765 43213",
      status: "active",
    },
    {
      id: "4",
      name: "Prof. Rajesh Kumar",
      designation: "Assistant Professor",
      subjects: ["Computer Networks", "Operating Systems"],
      email: "rajesh.kumar@university.ac.in",
      phone: "+91 98765 43214",
      status: "active",
    },
    {
      id: "5",
      name: "Dr. Sunita Rani",
      designation: "Professor",
      subjects: ["Software Engineering", "Project Management"],
      email: "sunita.rani@university.ac.in",
      phone: "+91 98765 43215",
      status: "active",
    },
  ];

  const recentTimetables = [
    {
      id: "1",
      name: "BCA Semester 5 - Section A",
      department: "Computer Science",
      semester: 5,
      section: "A",
      createdAt: "2025-01-20",
      status: "active",
      students: 60,
    },
    {
      id: "2",
      name: "BCA Semester 3 - Section B",
      department: "Computer Science",
      semester: 3,
      section: "B",
      createdAt: "2025-01-18",
      status: "active",
      students: 58,
    },
    {
      id: "3",
      name: "BCA Semester 1 - Section A",
      department: "Computer Science",
      semester: 1,
      section: "A",
      createdAt: "2025-01-15",
      status: "draft",
      students: 65,
    },
  ];

  const pendingApprovals = [
    {
      id: "1",
      type: "Leave Request",
      faculty: "Dr. Priya Sharma",
      description: "Medical leave for 3 days",
      submitDate: "2025-01-22",
      priority: "medium",
    },
    {
      id: "2",
      type: "Subject Change",
      faculty: "Prof. Amit Singh",
      description: "Request to change classroom for Web Development",
      submitDate: "2025-01-21",
      priority: "high",
    },
    {
      id: "3",
      type: "Exam Schedule",
      faculty: "Dr. Neha Gupta",
      description: "Request to reschedule mid-term exam",
      submitDate: "2025-01-20",
      priority: "high",
    },
  ];

  const quickActions = [
    {
      title: "Resources",
      icon: Building2,
      action: () => setActiveTab("resources"),
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Manage & book resources",
    },
    {
      title: "Routine Builder",
      icon: Calendar,
      action: () => setActiveTab("routine-builder"),
      color: "bg-green-500 hover:bg-green-600",
      description: "Create class schedules",
    },
    {
      title: "Resource Management",
      icon: Database,
      action: () => setActiveTab("resource-management"),
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Add/edit resources",
    },
    {
      title: "Booking Requests",
      icon: Send,
      action: () => setActiveTab("booking-requests"),
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Manage requests",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/hod-login");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  HOD Portal
                </h1>
                <p className="text-sm text-slate-600">Department Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>

              <Button variant="ghost" size="sm" className="relative h-8 px-3">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="sm" className="h-8 px-3">
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-8 px-4"
              >
                <LogOut className="h-3 w-3 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 shadow-lg overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={hodProfile.avatar}
                      alt={hodProfile.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl font-bold">
                      {hodProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-1">
                    {hodProfile.name}
                  </h2>
                  <p className="text-slate-600 mb-1 font-medium">
                    {hodProfile.designation} • {hodProfile.department}
                  </p>
                  <p className="text-slate-500 text-sm">
                    Employee ID: {hodProfile.employeeId} •{" "}
                    {hodProfile.experience} Experience
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center text-emerald-600 text-sm font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      Department Head
                    </div>
                    <div className="text-slate-400 text-sm">
                      Joined:{" "}
                      {new Date(hodProfile.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    {departmentStats.totalStudents}
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-2">
                    Total Students
                  </div>
                  <div className="flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">
                      +15 this semester
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-indigo-100">
                    <div className="text-xs text-slate-500">
                      Faculty Members
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {departmentStats.totalFaculty}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-25 to-blue-50 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-blue-700 mb-1">
                    {departmentStats.totalStudents}
                  </p>
                  <p className="text-blue-600 text-xs">Across all semesters</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 rounded-xl shadow-sm">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-25 to-emerald-50 border border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium mb-1">
                    Faculty Members
                  </p>
                  <p className="text-3xl font-bold text-emerald-700 mb-1">
                    {departmentStats.totalFaculty}
                  </p>
                  <p className="text-emerald-600 text-xs">
                    Active teaching staff
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-3 rounded-xl shadow-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-25 to-purple-50 border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium mb-1">
                    Timetables
                  </p>
                  <p className="text-3xl font-bold text-purple-700 mb-1">
                    {departmentStats.timetablesCreated}
                  </p>
                  <p className="text-purple-600 text-xs">Created this year</p>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-3 rounded-xl shadow-sm">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-25 to-orange-50 border border-orange-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium mb-1">
                    Pending Approvals
                  </p>
                  <p className="text-3xl font-bold text-orange-700 mb-1">
                    {departmentStats.pendingApprovals}
                  </p>
                  <p className="text-orange-600 text-xs">Require attention</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-3 rounded-xl shadow-sm">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-6 h-auto flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="routine-builder"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Routine
            </TabsTrigger>
            <TabsTrigger
              value="resource-management"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Database className="h-4 w-4 mr-2" />
              Manage
            </TabsTrigger>
            <TabsTrigger
              value="booking-requests"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="resource-requests"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Inter-Dept
            </TabsTrigger>
            <TabsTrigger
              value="faculty"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Faculty
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Timetables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-indigo-600" />
                      Recent Timetables
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("timetables")}
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentTimetables.map((timetable) => (
                    <div
                      key={timetable.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {timetable.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            Semester {timetable.semester} • {timetable.students}{" "}
                            students
                          </div>
                        </div>
                        <Badge
                          variant={
                            timetable.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {timetable.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">
                        Created:{" "}
                        {new Date(timetable.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" />
                      Pending Approvals
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("approvals")}
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className={`p-4 border rounded-lg ${getPriorityColor(approval.priority)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">{approval.type}</div>
                          <div className="text-sm">{approval.faculty}</div>
                        </div>
                        <Badge
                          variant={
                            approval.priority === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {approval.priority}
                        </Badge>
                      </div>
                      <div className="text-sm mb-2">{approval.description}</div>
                      <div className="text-xs">
                        Submitted:{" "}
                        {new Date(approval.submitDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Resources />
          </TabsContent>

          {/* Routine Builder Tab */}
          <TabsContent value="routine-builder" className="space-y-6">
            <RoutineBuilder />
          </TabsContent>

          {/* Resource Management Tab */}
          <TabsContent value="resource-management" className="space-y-6">
            <ResourceManagement />
          </TabsContent>

          {/* Booking Requests Tab */}
          <TabsContent value="booking-requests" className="space-y-6">
            <BookingRequests />
          </TabsContent>

          {/* Resource Requests Tab */}
          <TabsContent value="resource-requests" className="space-y-6">
            <ResourceRequestManagement />
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Faculty Members
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Faculty
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facultyMembers.map((faculty) => (
                    <Card
                      key={faculty.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                                {faculty.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {faculty.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {faculty.designation}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            {faculty.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {faculty.email}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {faculty.phone}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium text-slate-700 mb-2">
                            Subjects:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {faculty.subjects.map((subject, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage
                        src={hodProfile.avatar}
                        alt={hodProfile.name}
                      />
                      <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-600">
                        {hodProfile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-slate-900">
                      {hodProfile.name}
                    </h3>
                    <p className="text-slate-600">{hodProfile.designation}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{hodProfile.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{hodProfile.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{hodProfile.department}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        Joined:{" "}
                        {new Date(hodProfile.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        Experience: {hodProfile.experience}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <School className="h-5 w-5 mr-2 text-green-600" />
                    Department Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      {hodProfile.department}
                    </h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>Employee ID: {hodProfile.employeeId}</div>
                      <div>Position: {hodProfile.designation}</div>
                      <div>Experience: {hodProfile.experience}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-700">
                        Total Students
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {departmentStats.totalStudents}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-700">
                        Faculty Members
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {departmentStats.totalFaculty}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-700">
                        Subjects Offered
                      </span>
                      <span className="text-xl font-bold text-purple-600">
                        {departmentStats.totalSubjects}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
