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
  Users,
  CheckCircle2,
  XCircle,
  SortAsc,
  SortDesc,
  Building2,
} from "lucide-react";
import {
  TimetableData,
  Subject,
  TimeSlot,
  TimetableEntry,
  Faculty,
} from "@shared/api";

interface Classroom {
  id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  expectedSize: number;
  isOccupied: boolean;
  floor: number;
  building: string;
  type: 'lecture' | 'lab' | 'seminar';
  features: string[];
}

interface TimetableManagementProps {}

export default function TimetableManagement({}: TimetableManagementProps) {
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedTimetable, setSelectedTimetable] =
    useState<TimetableData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomSearchQuery, setClassroomSearchQuery] = useState("");
  const [classroomSortBy, setClassroomSortBy] = useState<'capacity' | 'suitability'>('suitability');
  const [expectedClassSize, setExpectedClassSize] = useState<number>(45);

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

  const classrooms: Classroom[] = [
    { id: '1', name: 'Main Lecture Hall', roomNumber: 'LH-101', capacity: 100, expectedSize: 95, isOccupied: false, floor: 1, building: 'Main Block', type: 'lecture', features: ['Projector', 'AC', 'Microphone'] },
    { id: '2', name: 'Computer Lab 1', roomNumber: 'CL-201', capacity: 60, expectedSize: 55, isOccupied: true, floor: 2, building: 'CS Block', type: 'lab', features: ['Computers', 'AC', 'Projector'] },
    { id: '3', name: 'Physics Lab', roomNumber: 'PL-301', capacity: 45, expectedSize: 40, isOccupied: false, floor: 3, building: 'Science Block', type: 'lab', features: ['Lab Equipment', 'Safety Features'] },
    { id: '4', name: 'Seminar Room A', roomNumber: 'SR-102', capacity: 45, expectedSize: 42, isOccupied: false, floor: 1, building: 'Main Block', type: 'seminar', features: ['Round Table', 'Projector', 'AC'] },
    { id: '5', name: 'Lecture Room 1', roomNumber: 'LR-201', capacity: 60, expectedSize: 58, isOccupied: true, floor: 2, building: 'Academic Block', type: 'lecture', features: ['Whiteboard', 'AC'] },
    { id: '6', name: 'Chemistry Lab', roomNumber: 'CH-302', capacity: 45, expectedSize: 38, isOccupied: false, floor: 3, building: 'Science Block', type: 'lab', features: ['Fume Hoods', 'Safety Equipment'] },
    { id: '7', name: 'Large Auditorium', roomNumber: 'AUD-001', capacity: 200, expectedSize: 180, isOccupied: false, floor: 0, building: 'Main Block', type: 'lecture', features: ['Stage', 'Sound System', 'AC'] },
    { id: '8', name: 'Computer Lab 2', roomNumber: 'CL-202', capacity: 60, expectedSize: 52, isOccupied: false, floor: 2, building: 'CS Block', type: 'lab', features: ['Computers', 'AC', 'Projector'] },
    { id: '9', name: 'Lecture Room 2', roomNumber: 'LR-103', capacity: 45, expectedSize: 43, isOccupied: true, floor: 1, building: 'Academic Block', type: 'lecture', features: ['Whiteboard', 'Projector'] },
    { id: '10', name: 'Mathematics Lab', roomNumber: 'ML-203', capacity: 45, expectedSize: 35, isOccupied: false, floor: 2, building: 'Academic Block', type: 'lab', features: ['Computers', 'Mathematical Software'] },
    { id: '11', name: 'Conference Room', roomNumber: 'CR-401', capacity: 25, expectedSize: 20, isOccupied: false, floor: 4, building: 'Admin Block', type: 'seminar', features: ['Conference Table', 'Video Conferencing'] },
    { id: '12', name: 'Lecture Room 3', roomNumber: 'LR-204', capacity: 60, expectedSize: 55, isOccupied: false, floor: 2, building: 'Academic Block', type: 'lecture', features: ['Whiteboard', 'AC'] },
    { id: '13', name: 'Biology Lab', roomNumber: 'BL-303', capacity: 45, expectedSize: 40, isOccupied: true, floor: 3, building: 'Science Block', type: 'lab', features: ['Microscopes', 'Lab Equipment'] },
    { id: '14', name: 'Smart Classroom', roomNumber: 'SC-104', capacity: 45, expectedSize: 44, isOccupied: false, floor: 1, building: 'Modern Block', type: 'lecture', features: ['Smart Board', 'AC', 'Recording Equipment'] },
    { id: '15', name: 'Language Lab', roomNumber: 'LL-205', capacity: 45, expectedSize: 40, isOccupied: false, floor: 2, building: 'Humanities Block', type: 'lab', features: ['Audio Equipment', 'Headphones'] },
    { id: '16', name: 'Tutorial Room 1', roomNumber: 'TR-105', capacity: 30, expectedSize: 25, isOccupied: false, floor: 1, building: 'Academic Block', type: 'seminar', features: ['Movable Desks', 'Whiteboard'] },
    { id: '17', name: 'Lecture Room 4', roomNumber: 'LR-305', capacity: 60, expectedSize: 50, isOccupied: true, floor: 3, building: 'Academic Block', type: 'lecture', features: ['Projector', 'AC'] },
    { id: '18', name: 'Engineering Lab', roomNumber: 'EL-206', capacity: 45, expectedSize: 42, isOccupied: false, floor: 2, building: 'Engineering Block', type: 'lab', features: ['CAD Systems', 'Technical Equipment'] },
    { id: '19', name: 'Lecture Room 5', roomNumber: 'LR-106', capacity: 45, expectedSize: 40, isOccupied: false, floor: 1, building: 'Academic Block', type: 'lecture', features: ['Whiteboard', 'Natural Lighting'] },
    { id: '20', name: 'Research Seminar Room', roomNumber: 'RSR-402', capacity: 20, expectedSize: 15, isOccupied: false, floor: 4, building: 'Research Block', type: 'seminar', features: ['Research Equipment', 'Presentation Setup'] }
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

  const getSuitabilityScore = (classroom: Classroom) => {
    const capacityBuffer = classroom.capacity - expectedClassSize;
    if (capacityBuffer < 0) return 0; // Can't fit
    if (capacityBuffer <= 5) return 100; // Perfect fit
    if (capacityBuffer <= 15) return 90; // Good fit
    if (capacityBuffer <= 30) return 70; // Acceptable
    return 50; // Too large
  };

  const getFilteredAndSortedClassrooms = () => {
    let filtered = classrooms.filter(classroom =>
      classroom.name.toLowerCase().includes(classroomSearchQuery.toLowerCase()) ||
      classroom.roomNumber.toLowerCase().includes(classroomSearchQuery.toLowerCase()) ||
      classroom.building.toLowerCase().includes(classroomSearchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (classroomSortBy === 'capacity') {
        return a.capacity - b.capacity;
      } else {
        return getSuitabilityScore(b) - getSuitabilityScore(a);
      }
    }).slice(0, 20);
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
    setSelectedClassroom(null);
    setExpectedClassSize(45);
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Timetable</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div>
                  <Label htmlFor="expectedSize">Expected Class Size</Label>
                  <Input
                    id="expectedSize"
                    type="number"
                    placeholder="45"
                    value={expectedClassSize}
                    onChange={(e) => setExpectedClassSize(parseInt(e.target.value) || 45)}
                    className="w-32"
                  />
                  <p className="text-sm text-slate-500 mt-1">This will help find suitable classrooms</p>
                </div>
              </div>

              {/* Classroom Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Select Primary Classroom</h3>
                  {selectedClassroom && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {selectedClassroom.roomNumber} Selected
                    </Badge>
                  )}
                </div>

                {/* Search and Sort Controls */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search classrooms..."
                      value={classroomSearchQuery}
                      onChange={(e) => setClassroomSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={classroomSortBy} onValueChange={(value: 'capacity' | 'suitability') => setClassroomSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suitability">
                        <div className="flex items-center">
                          <SortDesc className="h-4 w-4 mr-2" />
                          Sort by Suitability
                        </div>
                      </SelectItem>
                      <SelectItem value="capacity">
                        <div className="flex items-center">
                          <SortAsc className="h-4 w-4 mr-2" />
                          Sort by Capacity
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Classrooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto scrollbar-thin">
                  {getFilteredAndSortedClassrooms().map((classroom) => {
                    const suitabilityScore = getSuitabilityScore(classroom);
                    const isSelected = selectedClassroom?.id === classroom.id;
                    const canFitClass = classroom.capacity >= expectedClassSize;

                    return (
                      <Card
                        key={classroom.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                        } ${!canFitClass ? 'opacity-60' : ''}`}
                        onClick={() => canFitClass && setSelectedClassroom(classroom)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm text-slate-900 mb-1">
                                {classroom.name}
                              </h4>
                              <div className="flex items-center text-xs text-slate-600 mb-1">
                                <Building2 className="h-3 w-3 mr-1" />
                                {classroom.roomNumber}
                              </div>
                              <div className="text-xs text-slate-500">
                                {classroom.building} • Floor {classroom.floor}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              {classroom.isOccupied ? (
                                <Badge variant="destructive" className="text-xs mb-1">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Occupied
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs mb-1">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Vacant
                                </Badge>
                              )}
                              {suitabilityScore > 0 && (
                                <div className="text-xs text-slate-500">
                                  {suitabilityScore}% match
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Capacity:</span>
                              <span className="font-medium text-slate-900">{classroom.capacity}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Expected:</span>
                              <span className={`font-medium ${
                                expectedClassSize <= classroom.capacity ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {expectedClassSize} students
                              </span>
                            </div>

                            {/* Capacity vs Expected Visual Indicator */}
                            <div className="mt-2">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    expectedClassSize <= classroom.capacity
                                      ? expectedClassSize / classroom.capacity > 0.9
                                        ? 'bg-yellow-400'
                                        : 'bg-green-400'
                                      : 'bg-red-400'
                                  }`}
                                  style={{
                                    width: `${Math.min((expectedClassSize / classroom.capacity) * 100, 100)}%`
                                  }}
                                />
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {Math.round((expectedClassSize / classroom.capacity) * 100)}% utilization
                              </div>
                            </div>

                            <Badge variant="outline" className="text-xs capitalize">
                              {classroom.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedClassroom && (
                  <Card className="bg-indigo-50 border-indigo-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-indigo-900 mb-1">
                            Selected: {selectedClassroom.name}
                          </h4>
                          <div className="text-sm text-indigo-700">
                            {selectedClassroom.roomNumber} • Capacity: {selectedClassroom.capacity} •
                            Features: {selectedClassroom.features.join(', ')}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClassroom(null)}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          Change
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
