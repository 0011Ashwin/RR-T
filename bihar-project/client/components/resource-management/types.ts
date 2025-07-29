export interface Resource {
  id: string;
  name: string;
  type: 'classroom' | 'seminar_hall' | 'lab' | 'conference_room' | 'auditorium' | 'sports_facility';
  capacity: number;
  owningDepartment: string;
  location?: string;
  building?: string;
  floor?: number;
  equipment: string[];
  facilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  day: number; // 0-6 (Sunday-Saturday)
  resourceId: string;
  department: string;
  course?: string;
  className?: string;
  instructor?: string;
  students?: number;
  status: 'occupied' | 'available' | 'maintenance' | 'requested' | 'pending' | 'approved' | 'rejected';
  requestedBy?: string;
  requestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface BookingRequest {
  id: string;
  resourceId: string;
  resourceName: string;
  requestedBy: string;
  requestedByDepartment: string;
  startTime: string;
  endTime: string;
  date: string;
  day: number;
  purpose: string;
  expectedAttendees: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  recurring?: boolean;
  recurrencePattern?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  color: string;
}

export const RESOURCE_TYPES = [
  { value: 'classroom', label: 'Classroom', icon: 'School' },
  { value: 'seminar_hall', label: 'Seminar Hall', icon: 'Presentation' },
  { value: 'lab', label: 'Laboratory', icon: 'FlaskConical' },
  { value: 'conference_room', label: 'Conference Room', icon: 'Users' },
  { value: 'auditorium', label: 'Auditorium', icon: 'Building2' },
  { value: 'sports_facility', label: 'Sports Facility', icon: 'Activity' },
] as const;

export const TIME_SLOTS = [
  { start: '08:00', end: '09:00', label: '08:00 - 09:00' },
  { start: '09:00', end: '10:00', label: '09:00 - 10:00' },
  { start: '10:00', end: '11:00', label: '10:00 - 11:00' },
  { start: '11:00', end: '12:00', label: '11:00 - 12:00' },
  { start: '12:00', end: '13:00', label: '12:00 - 13:00' },
  { start: '13:00', end: '14:00', label: '13:00 - 14:00' },
  { start: '14:00', end: '15:00', label: '14:00 - 15:00' },
  { start: '15:00', end: '16:00', label: '15:00 - 16:00' },
  { start: '16:00', end: '17:00', label: '16:00 - 17:00' },
  { start: '17:00', end: '18:00', label: '17:00 - 18:00' },
] as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
] as const;

export const STATUS_COLORS = {
  occupied: 'bg-red-500 text-white',
  available: 'bg-green-500 text-white',
  maintenance: 'bg-gray-500 text-white',
  requested: 'bg-yellow-500 text-white',
  pending: 'bg-orange-500 text-white',
  approved: 'bg-blue-500 text-white',
  rejected: 'bg-red-600 text-white',
} as const;

export const DEPARTMENT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6366F1', // indigo
] as const;
