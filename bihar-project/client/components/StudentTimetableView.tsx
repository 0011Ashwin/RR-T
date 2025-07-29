import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Bell,
  Play,
  Pause,
} from "lucide-react";
import { ClassSchedule, TimeSlot } from "../../shared/api";

interface StudentTimetableViewProps {
  studentSemester?: number;
  studentSection?: string;
  studentDepartment?: string;
}

export default function StudentTimetableView({
  studentSemester = 5,
  studentSection = "A",
  studentDepartment = "Computer Science",
}: StudentTimetableViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime] = useState(new Date());

  // Sample timetable data for the student
  const weeklySchedule: { [key: number]: ClassSchedule[] } = {
    1: [
      // Monday
      {
        id: "1",
        subject: {
          id: "1",
          name: "Database Management",
          code: "CS501",
          instructor: "Dr. Priya Sharma",
          department: "Computer Science",
          credits: 4,
          type: "lecture",
        },
        timeSlot: {
          id: "1",
          startTime: "09:00",
          endTime: "10:30",
          duration: 90,
          label: "09:00-10:30",
        },
        dayOfWeek: 1,
        room: "Room 301",
        instructor: "Dr. Priya Sharma",
        type: "lecture",
        status: "scheduled",
      },
      {
        id: "2",
        subject: {
          id: "2",
          name: "Web Development",
          code: "CS502",
          instructor: "Prof. Amit Singh",
          department: "Computer Science",
          credits: 5,
          type: "practical",
        },
        timeSlot: {
          id: "2",
          startTime: "11:00",
          endTime: "12:30",
          duration: 90,
          label: "11:00-12:30",
        },
        dayOfWeek: 1,
        room: "Lab 204",
        instructor: "Prof. Amit Singh",
        type: "practical",
        status: "scheduled",
      },
      {
        id: "3",
        subject: {
          id: "3",
          name: "Data Structures",
          code: "CS503",
          instructor: "Dr. Neha Gupta",
          department: "Computer Science",
          credits: 4,
          type: "lecture",
        },
        timeSlot: {
          id: "3",
          startTime: "14:00",
          endTime: "15:30",
          duration: 90,
          label: "14:00-15:30",
        },
        dayOfWeek: 1,
        room: "Room 303",
        instructor: "Dr. Neha Gupta",
        type: "tutorial",
        status: "scheduled",
      },
      {
        id: "4",
        subject: {
          id: "4",
          name: "Computer Networks",
          code: "CS504",
          instructor: "Prof. Rajesh Kumar",
          department: "Computer Science",
          credits: 4,
          type: "lecture",
        },
        timeSlot: {
          id: "4",
          startTime: "16:00",
          endTime: "17:30",
          duration: 90,
          label: "16:00-17:30",
        },
        dayOfWeek: 1,
        room: "Room 304",
        instructor: "Prof. Rajesh Kumar",
        type: "lecture",
        status: "scheduled",
      },
    ],
    2: [
      // Tuesday
      {
        id: "5",
        subject: {
          id: "2",
          name: "Web Development",
          code: "CS502",
          instructor: "Prof. Amit Singh",
          department: "Computer Science",
          credits: 5,
          type: "practical",
        },
        timeSlot: {
          id: "1",
          startTime: "09:00",
          endTime: "10:30",
          duration: 90,
          label: "09:00-10:30",
        },
        dayOfWeek: 2,
        room: "Lab 204",
        instructor: "Prof. Amit Singh",
        type: "practical",
        status: "scheduled",
      },
      {
        id: "6",
        subject: {
          id: "3",
          name: "Data Structures",
          code: "CS503",
          instructor: "Dr. Neha Gupta",
          department: "Computer Science",
          credits: 4,
          type: "lecture",
        },
        timeSlot: {
          id: "2",
          startTime: "11:00",
          endTime: "12:30",
          duration: 90,
          label: "11:00-12:30",
        },
        dayOfWeek: 2,
        room: "Room 303",
        instructor: "Dr. Neha Gupta",
        type: "lecture",
        status: "scheduled",
      },
    ],
    // Add more days...
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getCurrentDaySchedule = () => {
    const dayOfWeek = selectedDate.getDay();
    return weeklySchedule[dayOfWeek] || [];
  };

  const getUpcomingClasses = () => {
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();

    const todayClasses = weeklySchedule[todayDayOfWeek] || [];

    return todayClasses
      .filter((classItem) => {
        const [startHour, startMinute] = classItem.timeSlot.startTime
          .split(":")
          .map(Number);
        const classStartMinutes = startHour * 60 + startMinute;
        return classStartMinutes > currentTimeMinutes;
      })
      .slice(0, 3);
  };

  const getCurrentClass = () => {
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();

    const todayClasses = weeklySchedule[todayDayOfWeek] || [];

    return todayClasses.find((classItem) => {
      const [startHour, startMinute] = classItem.timeSlot.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = classItem.timeSlot.endTime
        .split(":")
        .map(Number);
      const classStartMinutes = startHour * 60 + startMinute;
      const classEndMinutes = endHour * 60 + endMinute;

      return (
        currentTimeMinutes >= classStartMinutes &&
        currentTimeMinutes <= classEndMinutes
      );
    });
  };

  const getClassStatus = (classItem: ClassSchedule) => {
    const today = new Date();
    const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();
    const [startHour, startMinute] = classItem.timeSlot.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = classItem.timeSlot.endTime
      .split(":")
      .map(Number);
    const classStartMinutes = startHour * 60 + startMinute;
    const classEndMinutes = endHour * 60 + endMinute;

    if (currentTimeMinutes < classStartMinutes) {
      return "upcoming";
    } else if (
      currentTimeMinutes >= classStartMinutes &&
      currentTimeMinutes <= classEndMinutes
    ) {
      return "current";
    } else {
      return "completed";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 text-blue-800";
      case "practical":
        return "bg-green-100 text-green-800";
      case "tutorial":
        return "bg-purple-100 text-purple-800";
      case "seminar":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const currentClass = getCurrentClass();
  const upcomingClasses = getUpcomingClasses();
  const daySchedule = getCurrentDaySchedule();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Timetable</h2>
          <p className="text-slate-600">
            {studentDepartment} • Semester {studentSemester} • Section{" "}
            {studentSection}
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Timetable
        </Button>
      </div>

      {/* Current Class Alert */}
      {currentClass && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Currently in Class
                  </h3>
                  <p className="text-green-700 font-medium">
                    {currentClass.subject.name}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-green-600 mt-1">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {currentClass.timeSlot.label}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {currentClass.room}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {currentClass.instructor}
                    </div>
                  </div>
                </div>
              </div>
              <Badge className={getTypeColor(currentClass.type)}>
                {currentClass.type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Classes */}
      {!currentClass && upcomingClasses.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Bell className="h-5 w-5 mr-2" />
              Next Classes Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.map((classItem, index) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-semibold text-blue-600">
                      {classItem.timeSlot.startTime}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {classItem.subject.name}
                      </div>
                      <div className="text-sm text-slate-600 flex items-center space-x-2">
                        <span>{classItem.room}</span>
                        <span>•</span>
                        <span>{classItem.instructor}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getTypeColor(classItem.type)}>
                    {classItem.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
        </TabsList>

        {/* Daily View */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  {dayNames[selectedDate.getDay()]} Schedule
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium px-3">
                    {selectedDate.toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {daySchedule.length > 0 ? (
                <div className="space-y-4">
                  {daySchedule.map((classItem) => {
                    const status = getClassStatus(classItem);
                    return (
                      <div
                        key={classItem.id}
                        className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-semibold">
                              {classItem.timeSlot.label}
                            </div>
                            <Badge
                              variant={
                                status === "current" ? "default" : "secondary"
                              }
                              className={
                                status === "current" ? "bg-green-600" : ""
                              }
                            >
                              {status === "current" ? "Live Now" : status}
                            </Badge>
                          </div>
                          <Badge className={getTypeColor(classItem.type)}>
                            {classItem.type}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {classItem.subject.name}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {classItem.subject.code} •{" "}
                            {classItem.subject.credits} Credits
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-slate-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{classItem.instructor}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{classItem.room}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{classItem.timeSlot.duration} minutes</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No Classes Today
                  </h3>
                  <p className="text-slate-500">Enjoy your free day!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly View */}
        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-purple-600" />
                Weekly Timetable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700">
                        Time
                      </th>
                      {dayNames.slice(1, 6).map((day) => (
                        <th
                          key={day}
                          className="border border-slate-200 p-3 text-center font-semibold text-slate-700 min-w-[180px]"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "09:00-10:30",
                      "11:00-12:30",
                      "14:00-15:30",
                      "16:00-17:30",
                    ].map((timeSlot) => (
                      <tr key={timeSlot} className="hover:bg-slate-25">
                        <td className="border border-slate-200 p-3 font-medium text-slate-700 bg-slate-50">
                          {timeSlot}
                        </td>
                        {[1, 2, 3, 4, 5].map((dayOfWeek) => {
                          const dayClasses = weeklySchedule[dayOfWeek] || [];
                          const classForSlot = dayClasses.find(
                            (c) => c.timeSlot.label === timeSlot,
                          );

                          return (
                            <td
                              key={dayOfWeek}
                              className="border border-slate-200 p-2"
                            >
                              {classForSlot ? (
                                <div
                                  className={`p-3 rounded-lg ${getTypeColor(classForSlot.type)} border`}
                                >
                                  <div className="font-semibold text-sm mb-1">
                                    {classForSlot.subject.name}
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      {classForSlot.instructor}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {classForSlot.room}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-16 flex items-center justify-center text-slate-400">
                                  Free
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
