import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import PrincipalResources from "./PrincipalResources";
import RoutineBuilder from "./RoutineBuilder";
import ResourceManagement from "./ResourceManagement";
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
import EnhancedResourceRequestManagement from "../components/EnhancedResourceRequestManagement";
import PrincipalBookingRequests from "./PrincipalBookingRequests";
import PrincipalTimetableView from "./PrincipalTimetableView";

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize all state first
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(5);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrincipal, setCurrentPrincipal] = useState<any>(null);

  // Check authentication immediately and set initial state
  const principalEmail = localStorage.getItem("principalEmail");
  const principalName = localStorage.getItem("principalName");
  const principalCollege = localStorage.getItem("principalCollege");
  const userRole = localStorage.getItem("userRole");
  const adminType = localStorage.getItem("adminType");
  
  // If authentication fails, redirect and don't render anything
  if (!principalEmail || userRole !== 'admin' || adminType !== 'principal') {
    navigate('/');
    return null;
  }

  // Initialize principal data on first render
  useEffect(() => {
    // Use localStorage data instead of API call
    const principalData = {
      id: localStorage.getItem("currentPrincipalId") || '1',
      name: principalName || 'Dr. Priya Sharma',
      email: principalEmail,
      college: principalCollege || 'Magadh Mahila College',
      qualification: 'Ph.D. in English Literature',
      experience: '20+ years in Women\'s Education',
      employeeId: 'MMC001',
      joinDate: '2018-07-15',
      phone: '+91-9876543210',
      about: 'Dedicated educator and advocate for women\'s empowerment',
      isActive: true
    };
    
    setCurrentPrincipal(principalData);
  }, []); // Empty dependency array - only run once

  const principalProfile = {
    name: currentPrincipal?.name || principalName || 'Dr. Priya Sharma',
    designation: "Principal",
    college: currentPrincipal?.college || principalCollege || 'Magadh Mahila College',
    email: currentPrincipal?.email || principalEmail,
    phone: currentPrincipal?.phone || "+91 98765 43210",
    employeeId: currentPrincipal?.employeeId || 'MMC001',
    joinDate: currentPrincipal?.joinDate || '2018-07-15',
    experience: currentPrincipal?.experience || '20+ years in Women\'s Education',
    qualification: currentPrincipal?.qualification || 'Ph.D. in English Literature',
    about: currentPrincipal?.about || 'Dedicated educator and advocate for women\'s empowerment',
    avatar: "/api/placeholder/150/150",
  };

  const collegeStats = {
    totalStudents: 1200,
    totalFaculty: 45,
    totalDepartments: 8,
    activeCourses: 15,
    pendingRequests: 0, // This will be handled by the PrincipalBookingRequests component
    approvalsPending: 5,
  };

  const quickActions = [
    {
      title: "Resources",
      icon: Building2,
      action: () => setActiveTab("resources"),
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Manage college resources",
    },
    {
      title: "View All Timetables",
      icon: CalendarDays,
      action: () => setActiveTab("view-timetables"),
      color: "bg-purple-500 hover:bg-purple-600",
      description: "View all department timetables",
    },
    {
      title: "Resource Management",
      icon: Database,
      action: () => setActiveTab("resource-management"),
      color: "bg-indigo-500 hover:bg-indigo-600",
      description: "Add/edit resources",
    },
    {
      title: "Shared Resource Requests",
      icon: Send,
      action: () => setActiveTab("shared-requests"),
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Approve shared resources",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("principalEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
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
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <School className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Principal Portal
                </h1>
                <p className="text-sm text-slate-600">College Management</p>
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
                className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {principalProfile.name}
          </h1>
          <p className="text-slate-600">
            {principalProfile.college} • {currentTime.toLocaleDateString()}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-25 to-blue-50 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-blue-700 mb-1">
                    {collegeStats.totalStudents}
                  </p>
                  <p className="text-blue-600 text-xs">Across all courses</p>
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
                    {collegeStats.totalFaculty}
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
                    Departments
                  </p>
                  <p className="text-3xl font-bold text-purple-700 mb-1">
                    {collegeStats.totalDepartments}
                  </p>
                  <p className="text-purple-600 text-xs">Active departments</p>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-3 rounded-xl shadow-sm">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-25 to-orange-50 border border-orange-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium mb-1">
                    Pending Requests
                  </p>
                  <p className="text-3xl font-bold text-orange-700 mb-1">
                    {collegeStats.pendingRequests}
                  </p>
                  <p className="text-orange-600 text-xs">Shared resources</p>
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
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
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
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="view-timetables"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              All Timetables
            </TabsTrigger>
            <TabsTrigger
              value="resource-management"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Database className="h-4 w-4 mr-2" />
              Manage
            </TabsTrigger>
            <TabsTrigger
              value="shared-requests"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-purple-600" />
                      Recent Activities
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">
                          Shared Resource Request
                        </div>
                        <div className="text-sm text-slate-600">
                          Computer Science requested University Library
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">
                        Pending
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">2 hours ago</div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">
                          Faculty Meeting Scheduled
                        </div>
                        <div className="text-sm text-slate-600">
                          Monthly faculty meeting in main auditorium
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        Approved
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">1 day ago</div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">
                          New Course Proposal
                        </div>
                        <div className="text-sm text-slate-600">
                          Data Science course proposal from CS Department
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">
                        Review
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">3 days ago</div>
                  </div>
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
                      onClick={() => setActiveTab("shared-requests")}
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">
                          University Library Request
                        </div>
                        <div className="text-sm text-slate-600">
                          CS Department - Research Presentation
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        High Priority
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      Expected: 50 attendees • Today 2:00 PM
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">
                          Main Auditorium Request
                        </div>
                        <div className="text-sm text-slate-600">
                          Mathematics Department - Seminar
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        Medium Priority
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      Expected: 200 attendees • Tomorrow 10:00 AM
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timetable Overview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-purple-600" />
                    University Timetables
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("view-timetables")}
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">All Department Schedules</h3>
                  <p className="text-slate-600 mb-4">
                    View and monitor all department timetables and class schedules across the university
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                    <div>
                      <div className="font-semibold text-slate-900">Computer Science</div>
                      <div>2 Active Timetables</div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Mathematics</div>
                      <div>2 Active Timetables</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("view-timetables")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    View All Department Timetables
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <PrincipalResources />
          </TabsContent>

          {/* View All Timetables Tab */}
          <TabsContent value="view-timetables">
            <PrincipalTimetableView />
          </TabsContent>

          {/* Resource Management Tab */}
          <TabsContent value="resource-management">
            <ResourceManagement />
          </TabsContent>

          {/* Shared Resource Requests Tab */}
          <TabsContent value="shared-requests" className="space-y-6">
            <PrincipalBookingRequests />
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
                        src={principalProfile.avatar}
                        alt={principalProfile.name}
                      />
                      <AvatarFallback className="text-xl font-bold bg-purple-100 text-purple-600">
                        {principalProfile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-slate-900">
                      {principalProfile.name}
                    </h3>
                    <p className="text-slate-600">{principalProfile.designation}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{principalProfile.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{principalProfile.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <School className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{principalProfile.college}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        Joined:{" "}
                        {new Date(principalProfile.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        Experience: {principalProfile.experience}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <School className="h-5 w-5 mr-2 text-green-600" />
                    College Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      {principalProfile.college}
                    </h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>Employee ID: {principalProfile.employeeId}</div>
                      <div>Position: {principalProfile.designation}</div>
                      <div>Qualification: {principalProfile.qualification}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-700">
                        Total Students
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {collegeStats.totalStudents}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-700">
                        Faculty Members
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {collegeStats.totalFaculty}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-700">
                        Departments
                      </span>
                      <span className="text-xl font-bold text-purple-600">
                        {collegeStats.totalDepartments}
                      </span>
                    </div>
                  </div>

                  {principalProfile.about && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h5 className="font-medium text-slate-900 mb-2">About</h5>
                      <p className="text-sm text-slate-600">{principalProfile.about}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
