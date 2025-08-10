/**
 * Comprehensive types for Multi-HOD Resource Management System
 */

// HOD Authentication Types
export interface HODUser {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  joinDate: string;
  experience: string;
  avatar?: string;
  isActive: boolean;
}

// Resource Types
export interface Resource {
  id?: number;
  name: string;
  type: 'classroom' | 'seminar_hall' | 'lab' | 'conference_room';
  capacity: number;
  department: string; // owning department
  location?: string;
  facilities?: string[];
  isShared: boolean; // whether it's a shared university resource
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Time Slot Types
export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // in minutes
  label: string; // e.g., "09:00-10:30"
}

export interface WeeklyTimeSlot {
  id: string;
  resourceId: string;
  timeSlotId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  isOccupied: boolean;
  occupiedBy?: {
    courseId: string;
    courseName: string;
    department: string;
    faculty: string;
    classSize: number;
  };
  bookedBy?: string; // HOD user ID
  bookingDate: string;
}

// Booking Request Types
export interface BookingRequest {
  id: string;
  requesterId: string; // HOD making the request
  requesterDepartment: string;
  targetResourceId: string;
  targetDepartment: string; // department that owns the resource
  timeSlotId: string;
  dayOfWeek: number;
  courseName: string;
  purpose?: string;
  expectedAttendance: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvedBy?: string;
  responseDate?: string;
  notes?: string;
  vcApproved?: boolean; // Whether the VC has approved the request
  vcResponseDate?: string; // When the VC responded
}

// Class/Course Types
export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  section?: string;
  faculty: string;
  weeklyHours: number;
  expectedSize: number;
  type: 'theory' | 'practical' | 'tutorial' | 'seminar';
  isActive: boolean;
}

// Routine Types
export interface ClassSession {
  id: string;
  courseId: string;
  resourceId: string;
  timeSlotId: string;
  dayOfWeek: number;
  faculty: string;
  type: 'theory' | 'practical' | 'tutorial' | 'seminar';
}

export interface Routine {
  id: string;
  name: string;
  department: string;
  semester: number;
  section?: string;
  academicYear: string;
  numberOfStudents?: number;
  sessions: ClassSession[];
  generatedBy: string; // HOD user ID
  generatedAt: string;
  isActive: boolean;
  version: number;
}

// Filter Types
export interface ResourceFilter {
  type?: Resource['type'][];
  department?: string[];
  capacity?: {
    min: number;
    max: number;
  };
  isShared?: boolean;
  availability?: {
    dayOfWeek: number;
    timeSlotId: string;
  };
}

// API Response Types
export interface ResourceListResponse {
  success: boolean;
  data?: Resource[];
  total?: number;
  message?: string;
}

export interface BookingRequestResponse {
  success: boolean;
  data?: BookingRequest;
  message?: string;
}

export interface BookingRequestListResponse {
  success: boolean;
  data?: BookingRequest[];
  total?: number;
  message?: string;
}

export interface RoutineResponse {
  success: boolean;
  data?: Routine;
  message?: string;
}

export interface AutoGenerateRoutineRequest {
  department: string;
  semester: number;
  section?: string;
  academicYear: string;
  courses: Course[];
  preferences?: {
    preferMorningSlots?: boolean;
    avoidTimeSlots?: string[];
    preferredRooms?: string[];
  };
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflicts: {
    type: 'time' | 'room' | 'faculty';
    description: string;
    affectedSessions: string[];
  }[];
}

// Notification Types
export interface Notification {
  id: string;
  recipientId: string;
  type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'routine_generated' | 'conflict_detected';
  title: string;
  message: string;
  data?: any; // additional data related to the notification
  isRead: boolean;
  createdAt: string;
}

// Export Options
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  data: 'routine' | 'resources' | 'bookings';
  filters?: any;
  customFields?: string[];
}

// Dashboard Statistics
export interface ResourceStatistics {
  totalResources: number;
  ownedResources: number;
  sharedResources: number;
  utilizationRate: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  conflictsThisWeek: number;
}

// Default time slots for the system
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '1', startTime: '08:00', endTime: '09:00', duration: 60, label: '08:00-09:00' },
  { id: '2', startTime: '09:00', endTime: '10:00', duration: 60, label: '09:00-10:00' },
  { id: '3', startTime: '10:00', endTime: '11:00', duration: 60, label: '10:00-11:00' },
  { id: '4', startTime: '11:00', endTime: '12:00', duration: 60, label: '11:00-12:00' },
  { id: '5', startTime: '12:00', endTime: '13:00', duration: 60, label: '12:00-13:00' },
  { id: '6', startTime: '13:00', endTime: '14:00', duration: 60, label: '13:00-14:00' },
  { id: '7', startTime: '14:00', endTime: '15:00', duration: 60, label: '14:00-15:00' },
  { id: '8', startTime: '15:00', endTime: '16:00', duration: 60, label: '15:00-16:00' },
  { id: '9', startTime: '16:00', endTime: '17:00', duration: 60, label: '16:00-17:00' },
];

// Sample HOD users for the system
export const SAMPLE_HODS: HODUser[] = [
  {
    id: 'hod_geography',
    name: 'Dr. Rajesh Kumar Singh',
    email: 'hod.geography@college.edu',
    department: 'Geography',
    designation: 'Head of Department',
    employeeId: 'HOD001',
    joinDate: '2018-07-15',
    experience: '15 years',
    isActive: true,
  },
  {
    id: 'hod_business',
    name: 'Dr. Priya Sharma',
    email: 'hod.business@college.edu',
    department: 'Business Management',
    designation: 'Head of Department',
    employeeId: 'HOD002',
    joinDate: '2019-03-20',
    experience: '12 years',
    isActive: true,
  },
];
