import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TimetableService } from '@/services/timetable-service';
import { Routine } from '../../shared/resource-types';
import {
  Calendar,
  Eye,
  Search,
  Filter,
  School,
  Users,
  BookOpen,
  Clock,
  MapPin,
  User,
  Building2,
  FileText,
  GraduationCap,
  Download,
  RefreshCw
} from 'lucide-react';

interface TimetableEntry {
  id: string;
  subjectId: string;
  timeSlotId: string;
  dayOfWeek: number;
  room: string;
  instructor: string;
  type: "lecture" | "practical" | "tutorial" | "seminar";
  semester: number;
  department: string;
  section?: string;
  subject_name?: string;
  subject_code?: string;
  faculty_name?: string;
  classroom_name?: string;
  start_time?: string;
  end_time?: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  label: string;
}

export default function PrincipalTimetableView() {
  const { toast } = useToast();
  
  // Get Principal authentication data from localStorage
  const principalEmail = localStorage.getItem("principalEmail");
  const principalName = localStorage.getItem("principalName");
  const principalCollege = localStorage.getItem("principalCollege");

  const [activeTab, setActiveTab] = useState('overview');
  const [timetables, setTimetables] = useState<Routine[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<Routine | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Check if Principal is authenticated
  if (!principalEmail || !principalName) {
    window.location.href = '/login';
    return null;
  }

  // State for dynamic time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate comprehensive time slots by merging standard slots with database entries
  const generateTimeSlots = (entries: any[]) => {
    // Standard university time slots from 9 AM to 5 PM
    const standardSlots = new Map();
    const standardTimeSlots = [
      { id: "1", startTime: "09:00", endTime: "10:00", duration: 60, label: "09:00-10:00" },
      { id: "2", startTime: "10:00", endTime: "11:00", duration: 60, label: "10:00-11:00" },
      { id: "3", startTime: "11:00", endTime: "12:00", duration: 60, label: "11:00-12:00" },
      { id: "4", startTime: "12:00", endTime: "13:00", duration: 60, label: "12:00-13:00" },
      { id: "5", startTime: "13:00", endTime: "14:00", duration: 60, label: "13:00-14:00" },
      { id: "6", startTime: "14:00", endTime: "15:00", duration: 60, label: "14:00-15:00" },
      { id: "7", startTime: "15:00", endTime: "16:00", duration: 60, label: "15:00-16:00" },
      { id: "8", startTime: "16:00", endTime: "17:00", duration: 60, label: "16:00-17:00" },
    ];
    
    // Add standard slots to map
    standardTimeSlots.forEach(slot => {
      const key = `${slot.startTime}-${slot.endTime}`;
      standardSlots.set(key, slot);
    });
    
    // Add any additional time slots from database entries
    entries.forEach((entry: any) => {
      if (entry.start_time && entry.end_time) {
        const key = `${entry.start_time}-${entry.end_time}`;
        if (!standardSlots.has(key)) {
          const startTime = entry.start_time;
          const endTime = entry.end_time;
          
          // Calculate duration in minutes
          const [startHour, startMin] = startTime.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);
          const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
          
          standardSlots.set(key, {
            id: (standardSlots.size + 1).toString(),
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            label: `${startTime}-${endTime}`,
          });
        }
      }
    });

    // Convert to array and sort by start time
    return Array.from(standardSlots.values()).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
  };

  // Initialize comprehensive time slots for university schedule
  useEffect(() => {
    // Standard university time slots from 9 AM to 5 PM
    const standardTimeSlots = [
      { id: "1", startTime: "09:00", endTime: "10:00", duration: 60, label: "09:00-10:00" },
      { id: "2", startTime: "10:00", endTime: "11:00", duration: 60, label: "10:00-11:00" },
      { id: "3", startTime: "11:00", endTime: "12:00", duration: 60, label: "11:00-12:00" },
      { id: "4", startTime: "12:00", endTime: "13:00", duration: 60, label: "12:00-13:00" },
      { id: "5", startTime: "13:00", endTime: "14:00", duration: 60, label: "13:00-14:00" },
      { id: "6", startTime: "14:00", endTime: "15:00", duration: 60, label: "14:00-15:00" },
      { id: "7", startTime: "15:00", endTime: "16:00", duration: 60, label: "15:00-16:00" },
      { id: "8", startTime: "16:00", endTime: "17:00", duration: 60, label: "16:00-17:00" },
    ];
    setTimeSlots(standardTimeSlots);
  }, []);

  const dayNames = [
    "Sunday",
    "Monday", 
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  // Fetch all timetables from the API
  useEffect(() => {
    fetchAllTimetables();
  }, []);

  const fetchAllTimetables = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching all timetables...');
      const response = await TimetableService.getAllTimetables();
      
      console.log('Timetables response:', response);
      
      if (response.success && response.data) {
        setTimetables(response.data);
        console.log('Loaded timetables:', response.data);
        
        // Collect all entries from all timetables to generate comprehensive time slots
        const allEntries: any[] = [];
        response.data.forEach((timetable: any) => {
          if (timetable.entries && Array.isArray(timetable.entries)) {
            allEntries.push(...timetable.entries);
          }
        });
        
        // Always update time slots (includes standard slots + any additional from database)
        const newTimeSlots = generateTimeSlots(allEntries);
        setTimeSlots(newTimeSlots);
        setTimetableEntries(allEntries);
        
        toast({
          title: 'Success',
          description: `Loaded ${response.data.length} timetables`,
          variant: 'default'
        });
      } else {
        console.error('Failed to fetch timetables:', response);
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch timetables',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load timetables. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimetableDetails = async (timetableId: string | number) => {
    setIsLoadingDetails(true);
    try {
      console.log('Fetching timetable details for ID:', timetableId);
      const response = await TimetableService.getTimetableById(String(timetableId));
      
      console.log('Timetable details response:', response);
      
      if (response.success && response.data) {
        setSelectedTimetable(response.data);
        
        // Set the entries from the response
        if ((response.data as any).entries) {
          const entries = (response.data as any).entries;
          setTimetableEntries(entries);
          console.log('Loaded timetable entries:', entries);
          
          // Always update time slots (includes standard slots + any additional from this timetable)
          const newTimeSlots = generateTimeSlots(entries);
          setTimeSlots(newTimeSlots);
        } else {
          setTimetableEntries([]);
          console.log('No timetable entries found');
          
          // Even with no entries, ensure we have standard time slots
          const newTimeSlots = generateTimeSlots([]);
          setTimeSlots(newTimeSlots);
        }
        
        setActiveTab('view-details');
        toast({
          title: 'Success',
          description: `Loaded timetable details for ${response.data.name}`,
          variant: 'default'
        });
      } else {
        console.error('Failed to fetch timetable details:', response);
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch timetable details',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching timetable details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load timetable details. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filter timetables based on search and filters
  const filteredTimetables = timetables.filter(timetable => {
    const matchesSearch = timetable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         timetable.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         timetable.section?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || timetable.department === departmentFilter;
    const matchesSemester = semesterFilter === 'all' || timetable.semester.toString() === semesterFilter;
    
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  // Get unique departments and semesters for filters
  const departments = [...new Set(timetables.map(t => t.department))];
  const semesters = [...new Set(timetables.map(t => t.semester.toString()))];

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

  const getTimetableGrid = (timetableData: any) => {
    const grid: { [key: string]: any } = {};

    // Use the entries from the timetable data or fallback to timetableEntries state
    const entries = (timetableData as any).entries || timetableEntries || [];
    
    entries.forEach((entry: any) => {
      // Find the matching time slot based on start_time and end_time
      const matchingSlot = timeSlots.find(slot => 
        slot.startTime === entry.start_time && slot.endTime === entry.end_time
      );
      
      // If no exact match found, create a slot based on the entry's time
      const timeSlotId = matchingSlot?.id || 
        timeSlots.find(slot => slot.startTime === entry.start_time)?.id || 
        '1';
      
      const key = `${entry.day_of_week}-${timeSlotId}`;
      grid[key] = {
        ...entry,
        timeSlotId,
        instructor: entry.faculty_name,
        room: entry.classroom_name,
        subject_name: entry.subject_name,
        subject_code: entry.subject_code
      };
    });

    return grid;
  };

  // Helper function to map time to time slot ID - now works with dynamic slots
  const getTimeSlotByTime = (time: string) => {
    return timeSlots.find(slot => slot.startTime === time);
  };

  const getTimeSlotById = (id: string) => timeSlots.find((t) => t.id === id);

  // Calculate overview statistics
  const overviewStats = {
    totalTimetables: timetables.length,
    totalDepartments: departments.length,
    activeTimetables: timetables.filter(t => t.isActive !== false).length,
    totalClasses: timetableEntries.length,
    totalStudents: timetables.reduce((sum, t) => sum + (t.numberOfStudents || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All University Timetables</h1>
          <p className="text-slate-600 mt-1">View all department schedules and class timetables</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchAllTimetables}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="w-full p-4 bg-blue-50 rounded-md">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="text-blue-600">Loading timetables...</div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <GraduationCap className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="all-timetables" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            All Timetables
          </TabsTrigger>
          <TabsTrigger value="view-details" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-slate-900">{overviewStats.totalTimetables}</div>
                    <div className="text-sm text-slate-600">Total Timetables</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-slate-900">{overviewStats.totalDepartments}</div>
                    <div className="text-sm text-slate-600">Departments</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-slate-900">{overviewStats.totalClasses}</div>
                    <div className="text-sm text-slate-600">Scheduled Classes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-slate-900">{overviewStats.totalStudents}</div>
                    <div className="text-sm text-slate-600">Total Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-slate-900">{overviewStats.activeTimetables}</div>
                    <div className="text-sm text-slate-600">Active Timetables</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                Department Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map(dept => {
                  const deptTimetables = timetables.filter(t => t.department === dept);
                  const deptClasses = 0; // Will be calculated from actual entries when available
                  const deptStudents = deptTimetables.reduce((sum, t) => sum + (t.numberOfStudents || 0), 0);
                  
                  return (
                    <Card key={dept} className="border-l-4 border-l-indigo-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2">{dept}</h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div>Timetables: {deptTimetables.length}</div>
                          <div>Classes: {deptClasses}</div>
                          <div>Students: {deptStudents}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Timetables Tab */}
        <TabsContent value="all-timetables" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                  All Timetables ({filteredTimetables.length})
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
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map(sem => (
                        <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTimetables.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No timetables found</h3>
                  <p className="text-slate-600">
                    {searchQuery || departmentFilter !== 'all' || semesterFilter !== 'all' 
                      ? 'Try adjusting your search filters.'
                      : 'No timetables have been created yet.'}
                  </p>
                </div>
              ) : (
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
                                {timetable.section && ` - Section ${timetable.section}`}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {timetable.academicYear}
                              </div>
                              {timetable.numberOfStudents && (
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {timetable.numberOfStudents} students
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              timetable.isActive !== false
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {timetable.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="text-xs text-slate-500">
                            Created: {(timetable as any).created_at ? new Date((timetable as any).created_at).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Updated: {(timetable as any).updated_at ? new Date((timetable as any).updated_at).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Students: {timetable.numberOfStudents || 0}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              fetchTimetableDetails(timetable.id);
                              setActiveTab("view-details");
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Details Tab */}
        <TabsContent value="view-details" className="space-y-6">
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
                      {selectedTimetable.department} • Semester {selectedTimetable.semester}
                      {selectedTimetable.section && ` • Section ${selectedTimetable.section}`}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Read-only view • Academic Year: {selectedTimetable.academicYear}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
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

                            return (
                              <td
                                key={key}
                                className="border border-slate-200 p-2 relative min-h-[100px]"
                              >
                                {entry ? (
                                  <div
                                    className={`p-3 rounded-lg border ${getTypeColor(entry.type)} relative transition-all hover:shadow-md`}
                                  >
                                    <div className="font-semibold text-sm mb-1">
                                      {entry.subject_name || `Subject ${entry.subjectId}`}
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        {entry.faculty_name || entry.instructor}
                                      </div>
                                      <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {entry.classroom_name || entry.room}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {entry.type}
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full min-h-[80px] flex items-center justify-center text-slate-400">
                                    <span className="text-xs">Free</span>
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
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No Timetable Selected
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Select a timetable from the list to view its details
                  </p>
                  <Button
                    onClick={() => setActiveTab("all-timetables")}
                    variant="outline"
                  >
                    View All Timetables
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
