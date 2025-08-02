/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Timetable-related types and interfaces
 */
export interface Subject {
  id: string;
  name: string;
  code: string;
  instructor: string;
  department: string;
  credits: number;
  room?: string;
  type: "lecture" | "practical" | "tutorial" | "seminar";
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // in minutes
  label: string; // e.g., "09:00-10:30"
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  timeSlotId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  room: string;
  instructor: string;
  type: "lecture" | "practical" | "tutorial" | "seminar";
  semester: number;
  department: string;
  section?: string;
}

export interface ClassSchedule {
  id: string;
  subject: Subject;
  timeSlot: TimeSlot;
  dayOfWeek: number;
  room: string;
  instructor: string;
  type: "lecture" | "practical" | "tutorial" | "seminar";
  status?: "scheduled" | "ongoing" | "completed" | "cancelled";
}

export interface TimetableData {
  id: string;
  name: string;
  semester: number;
  department: string;
  section?: string;
  academicYear: string;
  numberOfStudents?: number;
  entries: TimetableEntry[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimetableRequest {
  name: string;
  semester: number;
  department: string;
  section?: string;
  academicYear: string;
  numberOfStudents?: number;
  entries: Omit<TimetableEntry, "id">[];
}

export interface UpdateTimetableRequest
  extends Partial<CreateTimetableRequest> {
  id: string;
}

export interface TimetableResponse {
  success: boolean;
  data?: TimetableData;
  message?: string;
}

export interface TimetablesListResponse {
  success: boolean;
  data?: TimetableData[];
  message?: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  subjects: Subject[];
}

/**
 * Booking Request related types and interfaces
 */
export interface BookingRequest {
  id: string;
  requesterId: string;
  requesterDepartment: string;
  requesterDesignation?: string; // Added to identify HODs
  targetResourceId: string;
  targetDepartment: string;
  timeSlotId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  courseName: string;
  purpose?: string;
  expectedAttendance: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvedBy?: string;
  responseDate?: string;
  notes?: string;
}

export interface CreateBookingRequestRequest {
  requesterId: string;
  requesterDepartment: string;
  requesterDesignation?: string; // Added to identify HODs
  targetResourceId: string;
  targetDepartment: string;
  timeSlotId: string;
  dayOfWeek: number;
  courseName: string;
  purpose?: string;
  expectedAttendance: number;
}

export interface UpdateBookingRequestStatusRequest {
  status: 'approved' | 'rejected' | 'withdrawn';
  notes?: string;
  approvedBy?: string;
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
