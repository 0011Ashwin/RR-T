import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Calendar from "@/components/Calendar";
import LumaChatbot from "@/components/LumaChatbot";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  LogOut,
  GraduationCap,
  BarChart3,
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Settings,
  TrendingUp,
  Award,
  Target,
  Star,
  ChevronRight,
  Download,
  ExternalLink,
  BookmarkPlus,
  MessageSquare,
  Users,
  Calendar as CalendarDays,
  ChartBar,
  Trophy,
  Zap,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  BookIcon,
  ClockIcon,
  MapPin,
  Phone,
  Mail,
  Home,
  Briefcase,
  Lightbulb,
  TrendingDown,
  UserCheck,
  Calendar as CalendarCheck,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Rahul Kumar";
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  // Enhanced data structures with more comprehensive information
  const studentProfile = {
    name: userName,
    id: "BCA2024001",
    email: "rahul.kumar@student.ac.in",
    phone: "+91 98765 43210",
    address: "Patna, Bihar",
    joinDate: "2022-08-15",
    avatar: "/api/placeholder/150/150",
    rank: 12,
    totalStudents: 180,
    bloodGroup: "B+",
    dateOfBirth: "2003-05-15",
    guardianName: "Mr. Suresh Kumar",
    guardianPhone: "+91 98765 43211",
  };

  const attendanceData = {
    overall: 87,
    weekly: 92,
    monthly: 85,
    trend: "+3%",
    threshold: 75,
    streak: 12,
    daily: [
      {
        date: "2025-07-23",
        status: "present",
        subjects: ["Database Management", "Web Development", "Data Structures"],
        checkIn: "08:45 AM",
        checkOut: "04:30 PM",
      },
      {
        date: "2025-07-22",
        status: "present",
        subjects: [
          "Data Structures",
          "Computer Networks",
          "Software Engineering",
        ],
        checkIn: "08:50 AM",
        checkOut: "04:25 PM",
      },
      {
        date: "2025-07-21",
        status: "late",
        subjects: ["Database Management", "Web Development"],
        checkIn: "09:15 AM",
        checkOut: "04:30 PM",
      },
      {
        date: "2025-07-20",
        status: "present",
        subjects: ["Web Development", "Data Structures", "Computer Networks"],
        checkIn: "08:40 AM",
        checkOut: "04:35 PM",
      },
      {
        date: "2025-07-19",
        status: "absent",
        subjects: ["Software Engineering"],
        reason: "Medical Leave",
      },
      {
        date: "2025-07-18",
        status: "present",
        subjects: ["Computer Networks", "Database Management"],
        checkIn: "08:55 AM",
        checkOut: "04:20 PM",
      },
      {
        date: "2025-07-17",
        status: "present",
        subjects: ["Data Structures", "Computer Networks", "Web Development"],
        checkIn: "08:35 AM",
        checkOut: "04:40 PM",
      },
    ],
    subjects: [
      {
        name: "Database Management",
        attendance: 92,
        sessions: 25,
        present: 23,
      },
      { name: "Web Development", attendance: 88, sessions: 24, present: 21 },
      { name: "Data Structures", attendance: 84, sessions: 26, present: 22 },
      { name: "Computer Networks", attendance: 90, sessions: 25, present: 22 },
      {
        name: "Software Engineering",
        attendance: 82,
        sessions: 22,
        present: 18,
      },
    ],
  };

  const academicData = {
    currentSemester: {
      number: 5,
      startDate: "2025-07-01",
      endDate: "2025-11-30",
      totalSubjects: 5,
      creditsEnrolled: 24,
    },
    grades: {
      currentGPA: 8.7,
      cumulativeGPA: 8.4,
      trend: "+0.3",
      semesterWise: [
        { semester: 1, gpa: 7.8, credits: 22, status: "completed" },
        { semester: 2, gpa: 8.1, credits: 24, status: "completed" },
        { semester: 3, gpa: 8.3, credits: 23, status: "completed" },
        { semester: 4, gpa: 8.6, credits: 25, status: "completed" },
        { semester: 5, gpa: 8.7, credits: 24, status: "current" },
      ],
    },
    subjects: [
      {
        name: "Database Management",
        code: "CS501",
        credits: 4,
        instructor: "Dr. Priya Sharma",
        currentGrade: "A",
        assignments: { completed: 8, total: 10 },
        nextExam: "2025-08-15",
        progress: 85,
        classRoom: "Room 301",
        timing: "09:00 AM - 10:30 AM",
      },
      {
        name: "Web Development",
        code: "CS502",
        credits: 5,
        instructor: "Prof. Amit Singh",
        currentGrade: "A-",
        assignments: { completed: 7, total: 9 },
        nextExam: "2025-08-18",
        progress: 82,
        classRoom: "Lab 204",
        timing: "11:00 AM - 01:00 PM",
      },
      {
        name: "Data Structures",
        code: "CS503",
        credits: 4,
        instructor: "Dr. Neha Gupta",
        currentGrade: "B+",
        assignments: { completed: 6, total: 8 },
        nextExam: "2025-08-20",
        progress: 78,
        classRoom: "Room 303",
        timing: "02:00 PM - 03:30 PM",
      },
      {
        name: "Computer Networks",
        code: "CS504",
        credits: 4,
        instructor: "Prof. Rajesh Kumar",
        currentGrade: "A",
        assignments: { completed: 9, total: 10 },
        nextExam: "2025-08-22",
        progress: 90,
        classRoom: "Room 304",
        timing: "04:00 PM - 05:30 PM",
      },
      {
        name: "Software Engineering",
        code: "CS505",
        credits: 4,
        instructor: "Dr. Sunita Rani",
        currentGrade: "A-",
        assignments: { completed: 5, total: 7 },
        nextExam: "2025-08-25",
        progress: 87,
        classRoom: "Room 305",
        timing: "10:00 AM - 11:30 AM",
      },
    ],
  };

  const todaySchedule = [
    {
      time: "09:00 AM",
      subject: "Database Management",
      room: "Room 301",
      type: "Lecture",
      instructor: "Dr. Priya Sharma",
      duration: "90 mins",
      status: "upcoming",
    },
    {
      time: "11:00 AM",
      subject: "Web Development",
      room: "Lab 204",
      type: "Practical",
      instructor: "Prof. Amit Singh",
      duration: "120 mins",
      status: "current",
    },
    {
      time: "02:00 PM",
      subject: "Data Structures",
      room: "Room 303",
      type: "Tutorial",
      instructor: "Dr. Neha Gupta",
      duration: "60 mins",
      status: "upcoming",
    },
    {
      time: "04:00 PM",
      subject: "Computer Networks",
      room: "Room 304",
      type: "Lecture",
      instructor: "Prof. Rajesh Kumar",
      duration: "90 mins",
      status: "upcoming",
    },
  ];

  const upcomingEvents = [
    {
      title: "Mid-Term Examinations",
      date: "2025-08-15",
      type: "exam",
      priority: "high",
      description: "Database Management Systems",
      location: "Exam Hall A",
      time: "10:00 AM",
    },
    {
      title: "Project Submission",
      date: "2025-08-10",
      type: "assignment",
      priority: "high",
      description: "Web Development Portfolio",
      location: "Online Portal",
      time: "11:59 PM",
    },
    {
      title: "Guest Lecture: AI in Healthcare",
      date: "2025-08-05",
      type: "event",
      priority: "medium",
      description: "Industry Expert Session",
      location: "Auditorium",
      time: "02:00 PM",
    },
    {
      title: "Career Counseling Session",
      date: "2025-08-08",
      type: "counseling",
      priority: "medium",
      description: "Placement Preparation",
      location: "Career Center",
      time: "03:00 PM",
    },
  ];

  const achievements = [
    {
      title: "Perfect Attendance",
      description: "100% attendance last month",
      icon: Trophy,
      color: "text-yellow-500",
      date: "July 2025",
    },
    {
      title: "Top Performer",
      description: "Ranked in top 10% of class",
      icon: Star,
      color: "text-blue-500",
      date: "Semester 4",
    },
    {
      title: "Assignment Master",
      description: "All assignments submitted on time",
      icon: Target,
      color: "text-green-500",
      date: "Current Semester",
    },
    {
      title: "Active Participant",
      description: "Most active in class discussions",
      icon: MessageSquare,
      color: "text-purple-500",
      date: "July 2025",
    },
  ];

  const quickActions = [
    {
      title: "Download Timetable",
      icon: Download,
      action: () => {},
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Submit Assignment",
      icon: FileText,
      action: () => {},
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Book Library Slot",
      icon: BookmarkPlus,
      action: () => {},
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Join Study Group",
      icon: Users,
      action: () => {},
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "View Grades",
      icon: BarChart3,
      action: () => {},
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Pay Fees",
      icon: CreditCard,
      action: () => {},
      color: "bg-red-500 hover:bg-red-600",
    },
  ];

  const recentActivities = [
    {
      action: "Submitted assignment",
      subject: "Web Development",
      time: "2 hours ago",
      icon: FileText,
      status: "success",
    },
    {
      action: "Attended lecture",
      subject: "Database Management",
      time: "4 hours ago",
      icon: BookOpen,
      status: "info",
    },
    {
      action: "Downloaded notes",
      subject: "Data Structures",
      time: "1 day ago",
      icon: Download,
      status: "info",
    },
    {
      action: "Joined study group",
      subject: "Computer Networks",
      time: "2 days ago",
      icon: Users,
      status: "success",
    },
    {
      action: "Exam scheduled",
      subject: "Software Engineering",
      time: "3 days ago",
      icon: AlertCircle,
      status: "warning",
    },
  ];

  const programDetails = {
    course: "Bachelor of Computer Applications (BCA)",
    semester: "Semester 5",
    batch: "2022-2025",
    credits: "Total: 120 Credits",
    completed: 98,
    total: 120,
    cgpa: "8.4",
    expectedGraduation: "May 2025",
    department: "Computer Science & Applications",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50";
      case "absent":
        return "text-red-600 bg-red-50";
      case "late":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 bg-green-50";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-50";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Portal
                </h1>
                <p className="text-sm text-slate-600">Academic Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Student Profile Header */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage
                    src={studentProfile.avatar}
                    alt={studentProfile.name}
                  />
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                    {studentProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{studentProfile.name}</h2>
                  <p className="text-blue-100 mb-1">
                    {studentProfile.id} • {programDetails.course}
                  </p>
                  <p className="text-blue-100">
                    {programDetails.semester} • {programDetails.batch}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {academicData.grades.cumulativeGPA}
                  </div>
                  <div className="text-sm text-blue-100">CGPA</div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">{academicData.grades.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Attendance
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {attendanceData.overall}%
                  </p>
                  <p className="text-green-600 text-xs">
                    +{attendanceData.trend} this week
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Current GPA
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {academicData.grades.currentGPA}
                  </p>
                  <p className="text-blue-600 text-xs">Semester 5</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Class Rank
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {studentProfile.rank}
                  </p>
                  <p className="text-purple-600 text-xs">
                    out of {studentProfile.totalStudents}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Credits</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {programDetails.completed}/{programDetails.total}
                  </p>
                  <p className="text-orange-600 text-xs">
                    {Math.round(
                      (programDetails.completed / programDetails.total) * 100,
                    )}
                    % Complete
                  </p>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="academics"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Academics
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todaySchedule.map((class_item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        class_item.status === "current"
                          ? "border-green-500 bg-green-50"
                          : class_item.status === "completed"
                            ? "border-gray-400 bg-gray-50"
                            : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="font-semibold text-lg">
                            {class_item.time}
                          </div>
                          <Badge
                            variant={
                              class_item.status === "current"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {class_item.status === "current"
                              ? "Live"
                              : class_item.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          {class_item.duration}
                        </div>
                      </div>
                      <div className="font-semibold text-slate-900">
                        {class_item.subject}
                      </div>
                      <div className="text-sm text-slate-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {class_item.room} • {class_item.instructor}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-4 hover:shadow-md transition-all"
                      onClick={action.action}
                    >
                      <div className={`p-2 rounded-md ${action.color} mr-3`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{action.title}</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities & Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-green-100 text-green-600"
                            : activity.status === "warning"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {activity.action}
                        </div>
                        <div className="text-sm text-slate-600">
                          {activity.subject}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-red-600" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getPriorityColor(event.priority)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-slate-900">
                          {event.title}
                        </div>
                        <Badge
                          variant={
                            event.priority === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {event.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        {event.description}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 space-x-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center mb-3">
                        <div
                          className={`p-2 rounded-full bg-white ${achievement.color}`}
                        >
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="font-semibold text-slate-900">
                            {achievement.title}
                          </div>
                          <div className="text-xs text-slate-600">
                            {achievement.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-700">
                        {achievement.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academics Tab */}
          <TabsContent value="academics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* GPA Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    GPA Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {academicData.grades.semesterWise.map((sem, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${sem.status === "current" ? "bg-blue-50 border border-blue-200" : "bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Semester {sem.semester}
                          </span>
                          <Badge
                            variant={
                              sem.status === "current" ? "default" : "secondary"
                            }
                          >
                            {sem.status === "current" ? "Current" : "Completed"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            {sem.gpa}
                          </span>
                          <span className="text-sm text-slate-600">
                            {sem.credits} Credits
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Subjects */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Current Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {academicData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg text-slate-900">
                            {subject.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {subject.code} • {subject.credits} Credits
                          </div>
                          <div className="text-sm text-slate-600">
                            Instructor: {subject.instructor}
                          </div>
                        </div>
                        <Badge
                          className={`${getGradeColor(subject.currentGrade)}`}
                        >
                          {subject.currentGrade}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-sm">
                          <span className="text-slate-600">Assignments: </span>
                          <span className="font-medium">
                            {subject.assignments.completed}/
                            {subject.assignments.total}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-600">Next Exam: </span>
                          <span className="font-medium">
                            {new Date(subject.nextExam).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Attendance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Attendance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {attendanceData.overall}%
                    </div>
                    <p className="text-slate-600">Overall Attendance</p>
                    <div className="flex items-center justify-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">
                        {attendanceData.trend} this week
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Weekly Attendance</span>
                        <span className="font-semibold">
                          {attendanceData.weekly}%
                        </span>
                      </div>
                      <Progress value={attendanceData.weekly} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monthly Attendance</span>
                        <span className="font-semibold">
                          {attendanceData.monthly}%
                        </span>
                      </div>
                      <Progress
                        value={attendanceData.monthly}
                        className="h-3"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-medium">
                        Current Streak
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {attendanceData.streak}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Consecutive days present
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Subject-wise Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {attendanceData.subjects.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                          {subject.name}
                        </span>
                        <Badge
                          variant={
                            subject.attendance >= 85 ? "default" : "destructive"
                          }
                        >
                          {subject.attendance}%
                        </Badge>
                      </div>
                      <Progress value={subject.attendance} className="h-2" />
                      <div className="text-xs text-slate-500">
                        {subject.present}/{subject.sessions} sessions attended
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Daily Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-purple-600" />
                    Recent Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {attendanceData.daily.map((day, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getStatusColor(day.status).replace("text-", "border-").replace("-600", "-200")}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <Badge className={getStatusColor(day.status)}>
                            {day.status === "present" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {day.status === "absent" && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {day.status === "late" && (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {day.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600">
                          {day.subjects.length > 0 ? (
                            <span>Subjects: {day.subjects.join(", ")}</span>
                          ) : (
                            <span>No classes scheduled</span>
                          )}
                        </div>
                        {day.checkIn && (
                          <div className="text-xs text-slate-500 mt-1">
                            {day.checkIn} - {day.checkOut}
                          </div>
                        )}
                        {day.reason && (
                          <div className="text-xs text-slate-500 mt-1">
                            Reason: {day.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Timetable */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                    Weekly Timetable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Time</th>
                          <th className="text-left p-2">Monday</th>
                          <th className="text-left p-2">Tuesday</th>
                          <th className="text-left p-2">Wednesday</th>
                          <th className="text-left p-2">Thursday</th>
                          <th className="text-left p-2">Friday</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        <tr className="border-b">
                          <td className="p-2 font-medium">09:00-10:30</td>
                          <td className="p-2">
                            <div className="bg-blue-100 p-2 rounded text-xs">
                              Database Management
                              <br />
                              <span className="text-slate-600">Room 301</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-green-100 p-2 rounded text-xs">
                              Web Development
                              <br />
                              <span className="text-slate-600">Lab 204</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-purple-100 p-2 rounded text-xs">
                              Data Structures
                              <br />
                              <span className="text-slate-600">Room 303</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-orange-100 p-2 rounded text-xs">
                              Computer Networks
                              <br />
                              <span className="text-slate-600">Room 304</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-red-100 p-2 rounded text-xs">
                              Software Engineering
                              <br />
                              <span className="text-slate-600">Room 305</span>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">11:00-12:30</td>
                          <td className="p-2">
                            <div className="bg-green-100 p-2 rounded text-xs">
                              Web Development
                              <br />
                              <span className="text-slate-600">Lab 204</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-purple-100 p-2 rounded text-xs">
                              Data Structures
                              <br />
                              <span className="text-slate-600">Room 303</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-orange-100 p-2 rounded text-xs">
                              Computer Networks
                              <br />
                              <span className="text-slate-600">Room 304</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-red-100 p-2 rounded text-xs">
                              Software Engineering
                              <br />
                              <span className="text-slate-600">Room 305</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-blue-100 p-2 rounded text-xs">
                              Database Management
                              <br />
                              <span className="text-slate-600">Room 301</span>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">14:00-15:30</td>
                          <td className="p-2">
                            <div className="bg-purple-100 p-2 rounded text-xs">
                              Data Structures
                              <br />
                              <span className="text-slate-600">Room 303</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-orange-100 p-2 rounded text-xs">
                              Computer Networks
                              <br />
                              <span className="text-slate-600">Room 304</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-red-100 p-2 rounded text-xs">
                              Software Engineering
                              <br />
                              <span className="text-slate-600">Room 305</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-blue-100 p-2 rounded text-xs">
                              Database Management
                              <br />
                              <span className="text-slate-600">Room 301</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-green-100 p-2 rounded text-xs">
                              Web Development
                              <br />
                              <span className="text-slate-600">Lab 204</span>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">16:00-17:30</td>
                          <td className="p-2">
                            <div className="bg-orange-100 p-2 rounded text-xs">
                              Computer Networks
                              <br />
                              <span className="text-slate-600">Room 304</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-red-100 p-2 rounded text-xs">
                              Software Engineering
                              <br />
                              <span className="text-slate-600">Room 305</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-blue-100 p-2 rounded text-xs">
                              Database Management
                              <br />
                              <span className="text-slate-600">Room 301</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-green-100 p-2 rounded text-xs">
                              Web Development
                              <br />
                              <span className="text-slate-600">Lab 204</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="bg-purple-100 p-2 rounded text-xs">
                              Data Structures
                              <br />
                              <span className="text-slate-600">Room 303</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Component */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Academic Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
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
                        src={studentProfile.avatar}
                        alt={studentProfile.name}
                      />
                      <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-600">
                        {studentProfile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-slate-900">
                      {studentProfile.name}
                    </h3>
                    <p className="text-slate-600">{studentProfile.id}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{studentProfile.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{studentProfile.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Home className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{studentProfile.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        DOB:{" "}
                        {new Date(
                          studentProfile.dateOfBirth,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        Blood Group: {studentProfile.bloodGroup}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      {programDetails.course}
                    </h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>Department: {programDetails.department}</div>
                      <div>Batch: {programDetails.batch}</div>
                      <div>
                        Current Semester: {academicData.currentSemester.number}
                      </div>
                      <div>
                        Expected Graduation: {programDetails.expectedGraduation}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-700">
                        Cumulative GPA
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {academicData.grades.cumulativeGPA}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-700">
                        Class Rank
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {studentProfile.rank}/{studentProfile.totalStudents}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-700">
                        Credits Completed
                      </span>
                      <span className="text-xl font-bold text-purple-600">
                        {programDetails.completed}/{programDetails.total}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guardian Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-orange-600" />
                    Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-3">
                      {studentProfile.guardianName}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">
                          {studentProfile.guardianPhone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Home className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">
                          {studentProfile.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Documents
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
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
