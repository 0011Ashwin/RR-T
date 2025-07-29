import axios from 'axios';
// Add type declarations by running: npm install --save-dev @types/axios
import {
  BookingRequest,
  BookingRequestListResponse,
  BookingRequestResponse,
  CreateBookingRequestRequest,
  UpdateBookingRequestStatusRequest
} from '../../shared/api';

const API_URL = '/api/booking-requests';

export const BookingRequestService = {
  /**
   * Get all booking requests
   */
  getAllRequests: async (): Promise<BookingRequestListResponse> => {
    try {
      const response = await axios.get<BookingRequestListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      return {
        success: false,
        message: 'Failed to fetch booking requests'
      };
    }
  },

  /**
   * Get a booking request by ID
   */
  getRequestById: async (id: string): Promise<BookingRequestResponse> => {
    try {
      const response = await axios.get<BookingRequestResponse>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking request ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch booking request'
      };
    }
  },

  /**
   * Get booking requests by requester department
   */
  getRequestsByRequesterDepartment: async (department: string): Promise<BookingRequestListResponse> => {
    try {
      const response = await axios.get<BookingRequestListResponse>(`${API_URL}/requester/${department}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking requests for department ${department}:`, error);
      return {
        success: false,
        message: 'Failed to fetch department booking requests'
      };
    }
  },

  /**
   * Get booking requests by target department
   */
  getRequestsByTargetDepartment: async (department: string): Promise<BookingRequestListResponse> => {
    try {
      const response = await axios.get<BookingRequestListResponse>(`${API_URL}/target/${department}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking requests for target department ${department}:`, error);
      return {
        success: false,
        message: 'Failed to fetch target department booking requests'
      };
    }
  },

  /**
   * Create a new booking request
   */
  createRequest: async (request: CreateBookingRequestRequest): Promise<BookingRequestResponse> => {
    try {
      const response = await axios.post<BookingRequestResponse>(API_URL, request);
      return response.data;
    } catch (error) {
      console.error('Error creating booking request:', error);
      return {
        success: false,
        message: 'Failed to create booking request'
      };
    }
  },

  /**
   * Update a booking request status (approve/reject/withdraw)
   */
  updateRequestStatus: async (id: string, statusUpdate: UpdateBookingRequestStatusRequest): Promise<BookingRequestResponse> => {
    try {
      const response = await axios.put<BookingRequestResponse>(`${API_URL}/${id}/status`, statusUpdate);
      return response.data;
    } catch (error) {
      console.error(`Error updating booking request ${id} status:`, error);
      return {
        success: false,
        message: 'Failed to update booking request status'
      };
    }
  },

  /**
   * Delete a booking request
   */
  deleteRequest: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting booking request ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete booking request'
      };
    }
  },

  /**
   * Get booking requests that need VC approval
   */
  getVCApprovalNeededRequests: async (): Promise<BookingRequestListResponse> => {
    try {
      const response = await axios.get<BookingRequestListResponse>(`${API_URL}/vc-approval-needed`);
      return response.data;
    } catch (error) {
      console.error('Error fetching VC approval needed requests:', error);
      return {
        success: false,
        message: 'Failed to fetch requests needing VC approval'
      };
    }
  },

  /**
   * Update VC approval status for a booking request
   */
  updateVCApprovalStatus: async (id: string, vcApproved: boolean, notes?: string): Promise<BookingRequestResponse> => {
    try {
      const response = await axios.put<BookingRequestResponse>(`${API_URL}/${id}/vc-approval`, { vcApproved, notes });
      return response.data;
    } catch (error) {
      console.error(`Error updating VC approval status for request ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update VC approval status'
      };
    }
  }
};