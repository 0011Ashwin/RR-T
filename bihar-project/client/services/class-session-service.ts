import axios from 'axios';
import { ClassSession } from '../../shared/resource-types';

const API_URL = '/api/class-sessions';

export interface CreateClassSessionRequest {
  courseId: string;
  resourceId: string;
  timeSlotId: string;
  dayOfWeek: number;
  faculty: string;
  type: 'theory' | 'practical' | 'tutorial' | 'seminar';
}

export interface UpdateClassSessionRequest extends Partial<CreateClassSessionRequest> {
  id: string;
}

export interface ClassSessionResponse {
  success: boolean;
  data?: ClassSession;
  message?: string;
}

export interface ClassSessionListResponse {
  success: boolean;
  data?: ClassSession[];
  message?: string;
}

export const ClassSessionService = {
  /**
   * Get all class sessions
   */
  getAllSessions: async (): Promise<ClassSessionListResponse> => {
    try {
      const response = await axios.get<ClassSessionListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching class sessions:', error);
      return {
        success: false,
        message: 'Failed to fetch class sessions'
      };
    }
  },

  /**
   * Get class sessions by department
   */
  getSessionsByDepartment: async (department: string): Promise<ClassSessionListResponse> => {
    try {
      const response = await axios.get<ClassSessionListResponse>(`${API_URL}/department/${department}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for department ${department}:`, error);
      return {
        success: false,
        message: 'Failed to fetch department sessions'
      };
    }
  },

  /**
   * Get class sessions by resource
   */
  getSessionsByResource: async (resourceId: string): Promise<ClassSessionListResponse> => {
    try {
      const response = await axios.get<ClassSessionListResponse>(`${API_URL}/resource/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for resource ${resourceId}:`, error);
      return {
        success: false,
        message: 'Failed to fetch resource sessions'
      };
    }
  },

  /**
   * Create a new class session
   */
  createSession: async (session: CreateClassSessionRequest): Promise<ClassSessionResponse> => {
    try {
      const response = await axios.post<ClassSessionResponse>(API_URL, session);
      return response.data;
    } catch (error) {
      console.error('Error creating class session:', error);
      return {
        success: false,
        message: 'Failed to create class session'
      };
    }
  },

  /**
   * Update a class session
   */
  updateSession: async (session: UpdateClassSessionRequest): Promise<ClassSessionResponse> => {
    try {
      const response = await axios.put<ClassSessionResponse>(`${API_URL}/${session.id}`, session);
      return response.data;
    } catch (error) {
      console.error(`Error updating class session ${session.id}:`, error);
      return {
        success: false,
        message: 'Failed to update class session'
      };
    }
  },

  /**
   * Delete a class session
   */
  deleteSession: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.delete<{ success: boolean; message?: string }>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting class session ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete class session'
      };
    }
  },

  /**
   * Create multiple class sessions in bulk
   */
  createBulkSessions: async (sessions: CreateClassSessionRequest[]): Promise<ClassSessionListResponse> => {
    try {
      const response = await axios.post<ClassSessionListResponse>(`${API_URL}/bulk`, sessions);
      return response.data;
    } catch (error) {
      console.error('Error creating bulk class sessions:', error);
      return {
        success: false,
        message: 'Failed to create bulk class sessions'
      };
    }
  },

  /**
   * Delete all class sessions (for auto-generation)
   */
  deleteAllSessions: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.delete<{ success: boolean; message?: string }>(`${API_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error deleting all class sessions:', error);
      return {
        success: false,
        message: 'Failed to delete all class sessions'
      };
    }
  },

  /**
   * Check for scheduling conflicts
   */
  checkConflicts: async (session: CreateClassSessionRequest): Promise<{ success: boolean; conflicts?: string[]; message?: string }> => {
    try {
      const response = await axios.post<{ success: boolean; conflicts?: string[]; message?: string }>(`${API_URL}/check-conflicts`, session);
      return response.data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return {
        success: false,
        message: 'Failed to check conflicts'
      };
    }
  }
};
