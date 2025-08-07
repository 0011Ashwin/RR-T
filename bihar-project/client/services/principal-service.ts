import axios from 'axios';

const API_URL = '/api/principals';

export interface PrincipalLoginRequest {
  email: string;
}

export interface PrincipalResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    college: string;
    qualification: string;
    experience: string;
    employeeId: string;
    joinDate: string;
    phone?: string;
    about?: string;
    isActive: boolean;
  };
  message?: string;
}

export interface PrincipalListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    email: string;
    college: string;
    qualification: string;
    experience: string;
    employeeId: string;
    joinDate: string;
    phone?: string;
    about?: string;
    isActive: boolean;
  }>;
  message?: string;
}

export const PrincipalService = {
  /**
   * Login Principal by email
   */
  login: async (email: string): Promise<PrincipalResponse> => {
    try {
      const response = await axios.post<PrincipalResponse>(`${API_URL}/login`, { email });
      return response.data;
    } catch (error) {
      console.error('Error logging in Principal:', error);
      return {
        success: false,
        message: 'Failed to login. Please check your email and try again.'
      };
    }
  },

  /**
   * Get all Principals
   */
  getAllPrincipals: async (): Promise<PrincipalListResponse> => {
    try {
      const response = await axios.get<PrincipalListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching Principals:', error);
      return {
        success: false,
        message: 'Failed to fetch Principals'
      };
    }
  },

  /**
   * Get Principal by ID
   */
  getPrincipalById: async (id: string): Promise<PrincipalResponse> => {
    try {
      const response = await axios.get<PrincipalResponse>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Principal ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch Principal'
      };
    }
  },

  /**
   * Get Principals by college
   */
  getPrincipalsByCollege: async (college: string): Promise<PrincipalListResponse> => {
    try {
      const response = await axios.get<PrincipalListResponse>(`${API_URL}/college/${college}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Principals for college ${college}:`, error);
      return {
        success: false,
        message: 'Failed to fetch college Principals'
      };
    }
  }
};
