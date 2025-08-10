import axios from 'axios';
import { Routine, RoutineResponse } from '../../shared/resource-types';

const API_URL = '/api/timetables';

export interface CreateTimetableRequest {
  name: string;
  department: string;
  semester: number;
  section?: string;
  academicYear: string;
  numberOfStudents?: number;
  sessions: Array<{
    courseId: string;
    resourceId: string;
    timeSlotId: string;
    dayOfWeek: number;
    faculty: string;
    type: 'theory' | 'practical' | 'tutorial' | 'seminar';
  }>;
}

export interface UpdateTimetableRequest extends Partial<CreateTimetableRequest> {
  id: string;
}

export interface TimetableListResponse {
  success: boolean;
  data?: Routine[];
  message?: string;
}

export const TimetableService = {
  /**
   * Get all timetables
   */
  getAllTimetables: async (): Promise<TimetableListResponse> => {
    try {
      const response = await axios.get<TimetableListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching timetables:', error);
      return {
        success: false,
        message: 'Failed to fetch timetables'
      };
    }
  },

  /**
   * Get timetables by department
   */
  getTimetablesByDepartment: async (department: string): Promise<TimetableListResponse> => {
    try {
      const response = await axios.get<TimetableListResponse>(`${API_URL}/department/name/${department}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetables for department ${department}:`, error);
      return {
        success: false,
        message: 'Failed to fetch department timetables'
      };
    }
  },

  /**
   * Get ALL timetable entries from ALL departments (for checking university resource occupancy)
   */
  getAllTimetableEntries: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    try {
      const response = await axios.get(`${API_URL}/entries/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all timetable entries:', error);
      return {
        success: false,
        message: 'Failed to fetch all timetable entries'
      };
    }
  },

  /**
   * Get a specific timetable by ID
   */
  getTimetableById: async (id: string): Promise<RoutineResponse> => {
    try {
      const response = await axios.get<RoutineResponse>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetable ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch timetable'
      };
    }
  },

  /**
   * Create a new timetable
   */
  createTimetable: async (timetable: CreateTimetableRequest): Promise<RoutineResponse> => {
    try {
      const response = await axios.post<RoutineResponse>(API_URL, timetable);
      return response.data;
    } catch (error) {
      console.error('Error creating timetable:', error);
      return {
        success: false,
        message: 'Failed to create timetable'
      };
    }
  },

  /**
   * Update a timetable
   */
  updateTimetable: async (timetable: UpdateTimetableRequest): Promise<RoutineResponse> => {
    try {
      const response = await axios.put<RoutineResponse>(`${API_URL}/${timetable.id}`, timetable);
      return response.data;
    } catch (error) {
      console.error(`Error updating timetable ${timetable.id}:`, error);
      return {
        success: false,
        message: 'Failed to update timetable'
      };
    }
  },

  /**
   * Delete a timetable
   */
  deleteTimetable: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      // The server returns 204 (No Content) on successful deletion
      if (response.status === 204 || response.status === 200) {
        return { success: true };
      } else {
        return { success: false, message: 'Failed to delete timetable' };
      }
    } catch (error) {
      console.error(`Error deleting timetable ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete timetable'
      };
    }
  },

  /**
   * Auto-generate timetable
   */
  generateTimetable: async (request: {
    department: string;
    semester: number;
    section?: string;
    academicYear: string;
    courses: Array<{
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
    }>;
    preferences?: {
      preferMorningSlots?: boolean;
      avoidTimeSlots?: string[];
      preferredRooms?: string[];
    };
  }): Promise<RoutineResponse> => {
    try {
      const response = await axios.post<RoutineResponse>(`${API_URL}/auto-generate`, request);
      return response.data;
    } catch (error) {
      console.error('Error generating timetable:', error);
      return {
        success: false,
        message: 'Failed to generate timetable'
      };
    }
  },

  /**
   * Check for conflicts in timetable
   */
  checkConflicts: async (timetableId: string): Promise<{ success: boolean; conflicts?: any[]; message?: string }> => {
    try {
      const response = await axios.get<{ success: boolean; conflicts?: any[]; message?: string }>(`${API_URL}/${timetableId}/conflicts`);
      return response.data;
    } catch (error) {
      console.error(`Error checking conflicts for timetable ${timetableId}:`, error);
      return {
        success: false,
        message: 'Failed to check conflicts'
      };
    }
  },

  /**
   * Set timetable as active
   */
  setActiveStatus: async (id: string, isActive: boolean): Promise<RoutineResponse> => {
    try {
      const response = await axios.patch<RoutineResponse>(`${API_URL}/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error(`Error setting timetable status ${id}:`, error);
      return {
        success: false,
        message: 'Failed to set timetable status'
      };
    }
  }
};
