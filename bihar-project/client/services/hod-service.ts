import axios from 'axios';

const API_URL = '/api/hods';

export interface HODLoginRequest {
  email: string;
}

export interface HODResponse {
  success: boolean;
  data?: {
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
  };
  message?: string;
}

export interface HODListResponse {
  success: boolean;
  data?: Array<{
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
  }>;
  message?: string;
}

export const HODService = {
  /**
   * Login HOD by email
   */
  login: async (email: string): Promise<HODResponse> => {
    try {
      const response = await axios.post<HODResponse>(`${API_URL}/login`, { email });
      return response.data;
    } catch (error) {
      console.error('Error logging in HOD:', error);
      return {
        success: false,
        message: 'Failed to login. Please check your email and try again.'
      };
    }
  },

  /**
   * Get all HODs
   */
  getAllHODs: async (): Promise<HODListResponse> => {
    try {
      const response = await axios.get<HODListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching HODs:', error);
      return {
        success: false,
        message: 'Failed to fetch HODs'
      };
    }
  },

  /**
   * Get HOD by ID
   */
  getHODById: async (id: string): Promise<HODResponse> => {
    try {
      const response = await axios.get<HODResponse>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching HOD ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch HOD'
      };
    }
  },

  /**
   * Get HODs by department
   */
  getHODsByDepartment: async (department: string): Promise<HODListResponse> => {
    try {
      const response = await axios.get<HODListResponse>(`${API_URL}/department/${department}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching HODs for department ${department}:`, error);
      return {
        success: false,
        message: 'Failed to fetch department HODs'
      };
    }
  }
};
