import axios from 'axios';

const API_URL = '/api/faculty';

export interface Faculty {
  id: number;
  name: string;
  email: string;
  designation: string;
  department_id: number;
  department_name?: string;
  employee_id?: string;
  phone?: string;
  subjects?: string[];
  experience?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FacultyResponse {
  success: boolean;
  data?: Faculty;
  message?: string;
}

export interface FacultyListResponse {
  success: boolean;
  data?: Faculty[];
  message?: string;
}

export interface CreateFacultyRequest {
  name: string;
  email: string;
  designation: string;
  department_id: number;
  employee_id?: string;
  phone?: string;
}

export interface UpdateFacultyRequest extends Partial<CreateFacultyRequest> {
  id: number;
}

export const FacultyService = {
  /**
   * Get all faculty
   */
  getAllFaculty: async (): Promise<FacultyListResponse> => {
    try {
      const response = await axios.get<FacultyListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      return {
        success: false,
        message: 'Failed to fetch faculty'
      };
    }
  },

  /**
   * Get faculty by ID
   */
  getFacultyById: async (id: number): Promise<FacultyResponse> => {
    try {
      const response = await axios.get<FacultyResponse>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching faculty ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch faculty'
      };
    }
  },

  /**
   * Get faculty by department
   */
  getFacultyByDepartment: async (departmentId: number): Promise<FacultyListResponse> => {
    try {
      const response = await axios.get<FacultyListResponse>(`${API_URL}/department/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching faculty for department ${departmentId}:`, error);
      return {
        success: false,
        message: 'Failed to fetch department faculty'
      };
    }
  },

  /**
   * Get faculty by department name
   */
  getFacultyByDepartmentName: async (departmentName: string): Promise<FacultyListResponse> => {
    try {
      const response = await axios.get<FacultyListResponse>(`${API_URL}/department/name/${departmentName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching faculty for department ${departmentName}:`, error);
      return {
        success: false,
        message: 'Failed to fetch department faculty'
      };
    }
  },

  /**
   * Create a new faculty
   */
  createFaculty: async (faculty: CreateFacultyRequest): Promise<FacultyResponse> => {
    try {
      const response = await axios.post<FacultyResponse>(API_URL, faculty);
      return response.data;
    } catch (error) {
      console.error('Error creating faculty:', error);
      return {
        success: false,
        message: 'Failed to create faculty'
      };
    }
  },

  /**
   * Update a faculty
   */
  updateFaculty: async (faculty: UpdateFacultyRequest): Promise<FacultyResponse> => {
    try {
      const response = await axios.put<FacultyResponse>(`${API_URL}/${faculty.id}`, faculty);
      return response.data;
    } catch (error) {
      console.error(`Error updating faculty ${faculty.id}:`, error);
      return {
        success: false,
        message: 'Failed to update faculty'
      };
    }
  },

  /**
   * Delete a faculty
   */
  deleteFaculty: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.delete<{ success: boolean; message?: string }>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting faculty ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete faculty'
      };
    }
  }
};
