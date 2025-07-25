import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  School,
  Copy,
  Download,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import {
  TimetableData,
  Subject,
  TimeSlot,
  TimetableEntry,
  Faculty,
} from "@shared/api";

interface TimetableManagementProps {}

export default function TimetableManagement({}: TimetableManagementProps) {
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedTimetable, setSelectedTimetable] =
    useState<TimetableData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data
  const timeSlots: TimeSlot[] = [
    {
      id: "1",
      startTime: "09:00",
      endTime: "10:30",
      duration: 90,
      label: "09:00-10:30",
    },
    {
      id: "2",
      startTime: "11:00",
      endTime: "12:30",
      duration: 90,
      label: "11:00-12:30",
    },
    {
      id: "3",
      startTime: "14:00",
      endTime: "15:30",
      duration: 90,
      label: "14:00-15:30",
    },
    {
      id: "4",
      startTime: "16:00",
      endTime: "17:30",
      duration: 90,
      label: "16:00-17:30",
    },
  ];

  const subjects: Subject[] = [
    {
      id: "1",
      name: "Database Management",
      code: "CS501",
      instructor: "Dr. Priya Sharma",
      department: "Computer Science",
      credits: 4,
      type: "lecture",
    },
    {
      id: "2",
      name: "Web Development",
      code: "CS502",
      instructor: "Prof. Amit Singh",
      department: "Computer Science",
      credits: 5,
      type: "practical",
    },
    {
      id: "3",
      name: "Data Structures",
      code: "CS503",
      instructor: "Dr. Neha Gupta",
      department: "Computer Science",
      credits: 4,
      type: "lecture",
    },
    {
      id: "4",
      name: "Computer Networks",
      code: "CS504",
      instructor: "Prof. Rajesh Kumar",
      department: "Computer Science",
      credits: 4,
      type: "lecture",
    },
    {
      id: "5",
      name: "Software Engineering",
      code: "CS505",
      instructor: "Dr. Sunita Rani",
      department: "Computer Science",
      credits: 4,
      type: "lecture",
    },
  ];

  const facultyMembers: Faculty[] = [
    {
      id: "1",
      name: "Dr. Priya Sharma",
      email: "priya.sharma@university.ac.in",
      department: "Computer Science",
      designation: "Associate Professor",
      subjects: [subjects[0]],
    },
    {
      id: "2",
      name: "Prof. Amit Singh",
      email: "amit.singh@university.ac.in",
      department: "Computer Science",
      designation: "Assistant Professor",
      subjects: [subjects[1]],
    },
    {
      id: "3",
      name: "Dr. Neha Gupta",
      email: "neha.gupta@university.ac.in",
      department: "Computer Science",
      designation: "Associate Professor",
      subjects: [subjects[2]],
    },
    {
      id: "4",
      name: "Prof. Rajesh Kumar",
      email: "rajesh.kumar@university.ac.in",
      department: "Computer Science",
      designation: "Assistant Professor",
      subjects: [subjects[3]],
    },
    {
      id: "5",
      name: "Dr. Sunita Rani",
      email: "sunita.rani@university.ac.in",
      department: "Computer Science",
      designation: "Professor",
      subjects: [subjects[4]],
    },
  ];

  const existingTimetables: TimetableData[] = [
    {
      id: "1",
      name: "BCA Semester 5 - Section A",
      semester: 5,
      department: "Computer Science",
      section: "A",
      academicYear: "2024-25",
      entries: [
        {
          id: "1",
          subjectId: "1",
          timeSlotId: "1",
          dayOfWeek: 1, // Monday
          room: "Room 301",
          instructor: "Dr. Priya Sharma",
          type: "lecture",
          semester: 5,
          department: "Computer Science",
          section: "A",
        },
        {
          id: "2",
          subjectId: "2",
          timeSlotId: "2",
          dayOfWeek: 1, // Monday
          room: "Lab 204",
          instructor: "Prof. Amit Singh",
          type: "practical",
          semester: 5,
          department: "Computer Science",
          section: "A",
        },
        // Add more entries for a complete weekly schedule
      ],
      createdBy: "Dr. Rajesh Kumar Singh",
      createdAt: "2025-01-20T10:00:00Z",
      updatedAt: "2025-01-22T15:30:00Z",
    },
    {
      id: "2",
      name: "BCA Semester 3 - Section B",
      semester: 3,
      department: "Computer Science",
      section: "B",
      academicYear: "2024-25",
      entries: [],
      createdBy: "Dr. Rajesh Kumar Singh",
      createdAt: "2025-01-18T09:00:00Z",
      updatedAt: "2025-01-20T11:00:00Z",
    },
  ];

  const [timetables, setTimetables] =
    useState<TimetableData[]>(existingTimetables);
  const [currentTimetable, setCurrentTimetable] = useState<
    Partial<TimetableData>
  >({
    name: "",
    semester: 1,
    department: "Computer Science",
    section: "",
    academicYear: "2024-25",
    entries: [],
  });

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getTimetableGrid = (timetableData: TimetableData) => {
    const grid: { [key: string]: TimetableEntry } = {};

    timetableData.entries.forEach((entry) => {
      const key = `${entry.dayOfWeek}-${entry.timeSlotId}`;
      grid[key] = entry;
    });

    return grid;
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);
  const getTimeSlotById = (id: string) => timeSlots.find((t) => t.id === id);

  const handleCreateTimetable = () => {
    const newTimetable: TimetableData = {
      id: Date.now().toString(),
      name: currentTimetable.name || "",
      semester: currentTimetable.semester || 1,
      department: currentTimetable.department || "",
      section: currentTimetable.section || "",
      academicYear: currentTimetable.academicYear || "",
      entries: currentTimetable.entries || [],
      createdBy: "Dr. Rajesh Kumar Singh",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimetables([...timetables, newTimetable]);
    setCurrentTimetable({
      name: "",
      semester: 1,
      department: "Computer Science",
      section: "",
      academicYear: "2024-25",
      entries: [],
    });
    setIsCreateDialogOpen(false);
  };

  const handleAddEntry = (dayOfWeek: number, timeSlotId: string) => {
    if (!selectedTimetable) return;

    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      subjectId: subjects[0].id,
      timeSlotId,
      dayOfWeek,
      room: "Room 101",
      instructor: subjects[0].instructor,
      type: "lecture",
      semester: selectedTimetable.semester,
      department: selectedTimetable.department,
      section: selectedTimetable.section,
    };

    const updatedTimetable = {
      ...selectedTimetable,
      entries: [...selectedTimetable.entries, newEntry],
      updatedAt: new Date().toISOString(),
    };

    setSelectedTimetable(updatedTimetable);
    setTimetables(
      timetables.map((t) =>
        t.id === selectedTimetable.id ? updatedTimetable : t,
      ),
    );
  };

  const handleRemoveEntry = (entryId: string) => {
    if (!selectedTimetable) return;

    const updatedTimetable = {
      ...selectedTimetable,
      entries: selectedTimetable.entries.filter((e) => e.id !== entryId),
      updatedAt: new Date().toISOString(),
    };

    setSelectedTimetable(updatedTimetable);
    setTimetables(
      timetables.map((t) =>
        t.id === selectedTimetable.id ? updatedTimetable : t,
      ),
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "practical":
        return "bg-green-100 text-green-800 border-green-200";
      case "tutorial":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "seminar":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredTimetables = timetables.filter(
    (timetable) =>
      timetable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timetable.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timetable.section?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Timetable Management
          </h2>
          <p className="text-slate-600">
            Create and manage class schedules for different semesters
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Timetable
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Timetables</TabsTrigger>
          <TabsTrigger value="editor">Timetable Editor</TabsTrigger>
        </TabsList>

        {/* Existing Timetables Tab */}
        <TabsContent value="existing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                  All Timetables
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search timetables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTimetables.map((timetable) => (
                  <Card
                    key={timetable.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900 mb-1">
                            {timetable.name}
                          </h3>
                          <div className="text-sm text-slate-600 space-y-1">
                            <div className="flex items-center">
                              <School className="h-3 w-3 mr-1" />
                              {timetable.department}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Semester {timetable.semester}
                              {timetable.section &&
                                ` - Section ${timetable.section}`}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {timetable.academicYear}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-slate-500">
                          Created:{" "}
                          {new Date(timetable.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          Updated:{" "}
                          {new Date(timetable.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          Classes: {timetable.entries.length}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTimetable(timetable);
                            setActiveTab("editor");
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTimetable(timetable);
                            setActiveTab("editor");
                            setIsEditMode(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timetable Editor Tab */}
        <TabsContent value="editor" className="space-y-6">
          {selectedTimetable ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                      {selectedTimetable.name}
                    </CardTitle>
                    <p className="text-slate-600 mt-1">
                      {selectedTimetable.department} • Semester{" "}
                      {selectedTimetable.semester}
                      {selectedTimetable.section &&
                        ` • Section ${selectedTimetable.section}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    {isEditMode && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700">
                          Time
                        </th>
                        {dayNames.slice(1, 6).map((day, index) => (
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
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot.id} className="hover:bg-slate-25">
                          <td className="border border-slate-200 p-3 font-medium text-slate-700 bg-slate-50">
                            <div className="text-sm">{timeSlot.label}</div>
                            <div className="text-xs text-slate-500">
                              {timeSlot.duration} mins
                            </div>
                          </td>
                          {[1, 2, 3, 4, 5].map((dayOfWeek) => {
                            const grid = getTimetableGrid(selectedTimetable);
                            const key = `${dayOfWeek}-${timeSlot.id}`;
                            const entry = grid[key];
                            const subject = entry
                              ? getSubjectById(entry.subjectId)
                              : null;

                            return (
                              <td
                                key={key}
                                className="border border-slate-200 p-2 relative min-h-[100px]"
                              >
                                {entry && subject ? (
                                  <div
                                    className={`p-3 rounded-lg border ${getTypeColor(entry.type)} relative group transition-all hover:shadow-md`}
                                  >
                                    <div className="font-semibold text-sm mb-1">
                                      {subject.name}
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        {entry.instructor}
                                      </div>
                                      <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {entry.room}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {entry.type}
                                      </Badge>
                                    </div>
                                    {isEditMode && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                        onClick={() =>
                                          handleRemoveEntry(entry.id)
                                        }
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  isEditMode && (
                                    <Button
                                      variant="ghost"
                                      className="w-full h-full min-h-[80px] border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                                      onClick={() =>
                                        handleAddEntry(dayOfWeek, timeSlot.id)
                                      }
                                    >
                                      <Plus className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  )
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
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No Timetable Selected
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Select a timetable from the existing timetables to view or
                    edit
                  </p>
                  <Button
                    onClick={() => setActiveTab("existing")}
                    variant="outline"
                  >
                    View Existing Timetables
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Timetable Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Timetable Name</Label>
              <Input
                id="name"
                placeholder="e.g., BCA Semester 5 - Section A"
                value={currentTimetable.name}
                onChange={(e) =>
                  setCurrentTimetable({
                    ...currentTimetable,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={currentTimetable.semester?.toString()}
                  onValueChange={(value) =>
                    setCurrentTimetable({
                      ...currentTimetable,
                      semester: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  placeholder="e.g., A, B"
                  value={currentTimetable.section}
                  onChange={(e) =>
                    setCurrentTimetable({
                      ...currentTimetable,
                      section: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={currentTimetable.department}
                onValueChange={(value) =>
                  setCurrentTimetable({
                    ...currentTimetable,
                    department: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">
                    Computer Science
                  </SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select
                value={currentTimetable.academicYear}
                onValueChange={(value) =>
                  setCurrentTimetable({
                    ...currentTimetable,
                    academicYear: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                  <SelectItem value="2026-27">2026-27</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTimetable}
                disabled={!currentTimetable.name || !currentTimetable.semester}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create Timetable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
