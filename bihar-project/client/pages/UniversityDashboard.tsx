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
  UserCheck,
  GraduationCap,
  FileText,
  Building2,
  LogOut,
  School,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function UniversityDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Vice Chancellor";
  const adminType = localStorage.getItem("adminType");

  // Access control - only VC can access university level
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin" || adminType !== "vc") {
      // Redirect non-VC users away from university dashboard
      navigate("/principal");
    }
  }, [navigate, adminType]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const staffData = {
    teaching: {
      count: 245,
      fields: [
        "Employee ID",
        "Name",
        "Email Address",
        "Date of Joining",
        "Date of Birth",
        "Contact Number",
        "Qualification",
        "Department",
        "Department ID",
      ],
    },
    nonTeaching: {
      count: 89,
      fields: [
        "Employee ID",
        "Name",
        "Email Address",
        "Date of Joining",
        "Contact Number",
        "Department",
      ],
    },
  };

  const collegeData = {
    constituent: [
      {
        name: "BN College",
        type: "Main Campus",
        programs: 12,
        totalStudents: 180,
        totalStaff: 63,
        teachingStaff: 45,
        nonTeachingStaff: 18,
        programs_list: ["BCA", "BBA", "B.Com"],
        attendance: 87,
        principal: "Dr. Raj Kumar",
      },
    ],
    affiliated: [
      {
        name: "College A",
        type: "Affiliated",
        programs: 8,
        totalStudents: 650,
        totalStaff: 85,
        teachingStaff: 60,
        nonTeachingStaff: 25,
        attendance: 89,
        principal: "Dr. Priya Sharma",
      },
      {
        name: "College B",
        type: "Affiliated",
        programs: 6,
        totalStudents: 420,
        totalStaff: 55,
        teachingStaff: 40,
        nonTeachingStaff: 15,
        attendance: 87,
        principal: "Prof. Amit Singh",
      },
      {
        name: "College C",
        type: "Affiliated",
        programs: 10,
        totalStudents: 580,
        totalStaff: 78,
        teachingStaff: 55,
        nonTeachingStaff: 23,
        attendance: 88,
        principal: "Dr. Sneha Gupta",
      },
      {
        name: "College D",
        type: "Affiliated",
        programs: 7,
        totalStudents: 620,
        totalStaff: 82,
        teachingStaff: 58,
        nonTeachingStaff: 24,
        attendance: 88,
        principal: "Prof. Vikash Yadav",
      },
    ],
  };

  const universityAttendanceData = {
    today: "2024-01-15",
    totalStudents: 2450,
    overall: {
      present: 2156,
      absent: 198,
      late: 96,
      percentage: 88,
    },
    collegeWise: [
      {
        name: "BN College",
        total: 180,
        present: 156,
        absent: 18,
        late: 6,
        percentage: 87,
      },
      {
        name: "College A",
        total: 650,
        present: 578,
        absent: 52,
        late: 20,
        percentage: 89,
      },
      {
        name: "College B",
        total: 420,
        present: 367,
        absent: 38,
        late: 15,
        percentage: 87,
      },
      {
        name: "College C",
        total: 580,
        present: 510,
        absent: 45,
        late: 25,
        percentage: 88,
      },
      {
        name: "College D",
        total: 620,
        present: 545,
        absent: 45,
        late: 30,
        percentage: 88,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-university mr-3" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  University Management System
                </h1>
                <p className="text-sm text-slate-600">
                  Hierarchical Structure Overview
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {userName} (VC)
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
        {/* University Header */}
        <div className="text-center mb-12">
          <Button className="bg-university text-university-foreground hover:bg-university/90 text-lg px-8 py-3 rounded-lg font-semibold">
            UNIVERSITY
          </Button>
        </div>

        {/* First Row - Core Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Staff Section */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-slate-700">
                  <Users className="h-5 w-5 mr-2" />
                  STAFF
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Teaching Staff */}
                <div className="p-4 bg-yellow-50 border-b">
                  <h3 className="font-semibold text-yellow-800 mb-3">
                    Teaching Staff
                  </h3>
                  <div className="text-sm space-y-1 text-yellow-700">
                    <p className="font-medium">Employee Fields:</p>
                    {staffData.teaching.fields.map((field, index) => (
                      <p key={index} className="text-xs">
                        • {field}
                      </p>
                    ))}
                  </div>
                  <Badge variant="secondary" className="mt-3">
                    {staffData.teaching.count} Members
                  </Badge>
                </div>

                {/* Non-Teaching Staff */}
                <div className="p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-3">
                    Non-Teaching Staff
                  </h3>
                  <div className="text-sm space-y-1 text-green-700">
                    <p className="font-medium">Employee Fields:</p>
                    {staffData.nonTeaching.fields.map((field, index) => (
                      <p key={index} className="text-xs">
                        • {field}
                      </p>
                    ))}
                  </div>
                  <Badge variant="secondary" className="mt-3">
                    {staffData.nonTeaching.count} Members
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admission Section */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-slate-700">
                  <UserCheck className="h-5 w-5 mr-2" />
                  ADMISSION
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm">Admission Management</p>
                  <p className="text-xs">Coming Soon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Examination Section */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-slate-700">
                  <FileText className="h-5 w-5 mr-2" />
                  EXAMINATION
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm">Examination Management</p>
                  <p className="text-xs">Coming Soon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PG Program Section */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-white bg-purple-600 -m-6 mb-0 p-6 rounded-t-lg">
                  <BookOpen className="h-5 w-5 mr-2" />
                  PG PROGRAM
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-purple-50">
                <div className="bg-purple-100 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    BN College
                  </h3>
                  <p className="text-sm text-purple-700">
                    Postgraduate Programs
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-3 bg-purple-200 text-purple-800"
                  >
                    5 Programs Available
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row - College Details */}
        <div className="mb-8">
          {/* College Section - Extended */}
          <div className="w-full">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-slate-700">
                  <Building2 className="h-5 w-5 mr-2" />
                  COLLEGE DETAILS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* Constituent Colleges */}
                <div className="mb-6">
                  <h3 className="font-semibold text-blue-800 mb-3">
                    Constituent Colleges
                  </h3>
                  {collegeData.constituent.map((college, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() =>
                        navigate(
                          `/college/${college.name.toLowerCase().replace(" ", "-")}`,
                        )
                      }
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-blue-900 flex items-center">
                            {college.name}
                            <span className="ml-2 text-xs text-blue-600">
                              → View Details
                            </span>
                          </h4>
                          <p className="text-sm text-blue-700">
                            {college.type}
                          </p>
                          <p className="text-sm text-blue-600">
                            Principal: {college.principal}
                          </p>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          {college.attendance}% Attendance
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-800">
                            {college.totalStudents}
                          </div>
                          <div className="text-xs text-blue-600">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-800">
                            {college.totalStaff}
                          </div>
                          <div className="text-xs text-blue-600">
                            Total Staff
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-800">
                            {college.teachingStaff}
                          </div>
                          <div className="text-xs text-blue-600">Teaching</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-800">
                            {college.nonTeachingStaff}
                          </div>
                          <div className="text-xs text-blue-600">
                            Non-Teaching
                          </div>
                        </div>
                      </div>
                      {college.programs_list && (
                        <div className="mt-3">
                          <div className="text-xs text-blue-600 mb-1">
                            Programs:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {college.programs_list.map((program, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Affiliated Colleges */}
                <div>
                  <h3 className="font-semibold text-blue-800 mb-3">
                    Affiliated Colleges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collegeData.affiliated.map((college, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() =>
                          navigate(
                            `/college/${college.name.toLowerCase().replace(" ", "-")}`,
                          )
                        }
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900 flex items-center">
                              {college.name}
                              <span className="ml-2 text-xs text-slate-500">
                                → View Details
                              </span>
                            </h4>
                            <p className="text-sm text-slate-600">
                              Principal: {college.principal}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {college.attendance}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center bg-white rounded p-2">
                            <div className="font-semibold text-slate-700">
                              {college.totalStudents}
                            </div>
                            <div className="text-xs text-slate-500">
                              Students
                            </div>
                          </div>
                          <div className="text-center bg-white rounded p-2">
                            <div className="font-semibold text-slate-700">
                              {college.totalStaff}
                            </div>
                            <div className="text-xs text-slate-500">Staff</div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <Badge variant="outline" className="text-xs">
                            {college.programs} Programs
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Attendance Overview */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-slate-700">
                <Calendar className="h-5 w-5 mr-2" />
                University-wide Daily Attendance
              </CardTitle>
              <CardDescription>
                Live attendance overview for{" "}
                {new Date(universityAttendanceData.today).toLocaleDateString(
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
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {universityAttendanceData.totalStudents}
                  </div>
                  <p className="text-sm text-blue-600">Total Students</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {universityAttendanceData.overall.present}
                  </div>
                  <p className="text-sm text-green-600">Present Today</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {universityAttendanceData.overall.absent}
                  </div>
                  <p className="text-sm text-red-600">Absent Today</p>
                </div>
                <div className="bg-university/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-university">
                    {universityAttendanceData.overall.percentage}%
                  </div>
                  <p className="text-sm text-university">Attendance Rate</p>
                </div>
              </div>

              {/* College-wise Breakdown */}
              <div>
                <h4 className="font-semibold text-sm mb-4 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  College-wise Attendance Breakdown
                </h4>
                <div className="space-y-3">
                  {universityAttendanceData.collegeWise.map(
                    (college, index) => {
                      const getPerformanceColor = (percentage: number) => {
                        if (percentage >= 90)
                          return "text-green-600 bg-green-50";
                        if (percentage >= 85) return "text-blue-600 bg-blue-50";
                        if (percentage >= 80)
                          return "text-yellow-600 bg-yellow-50";
                        return "text-red-600 bg-red-50";
                      };

                      return (
                        <div key={index} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-slate-900">
                              {college.name}
                            </h5>
                            <Badge
                              className={getPerformanceColor(
                                college.percentage,
                              )}
                            >
                              {college.percentage}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-slate-600">
                                {college.total}
                              </div>
                              <div className="text-xs text-slate-500">
                                Total
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-green-600 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {college.present}
                              </div>
                              <div className="text-xs text-slate-500">
                                Present
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-red-600 flex items-center justify-center">
                                <XCircle className="h-3 w-3 mr-1" />
                                {college.absent}
                              </div>
                              <div className="text-xs text-slate-500">
                                Absent
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-yellow-600 flex items-center justify-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {college.late}
                              </div>
                              <div className="text-xs text-slate-500">Late</div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-university">
                {staffData.teaching.count + staffData.nonTeaching.count}
              </div>
              <p className="text-sm text-slate-600">Total Staff Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-university">
                {collegeData.constituent.length + collegeData.affiliated.length}
              </div>
              <p className="text-sm text-slate-600">Total Colleges</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-university">2,450</div>
              <p className="text-sm text-slate-600">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-university">41</div>
              <p className="text-sm text-slate-600">Total Programs</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
