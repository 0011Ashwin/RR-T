import axios from 'axios';
import { Resource, ResourceListResponse } from '../../shared/resource-types';

const API_URL = '/api/resources';

export interface CreateResourceRequest {
  name: string;
  type: 'classroom' | 'seminar_hall' | 'lab' | 'conference_room';
  capacity: number;
  department: string;
  location?: string;
  facilities?: string[];
  isShared: boolean;
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {
  id: number;
}

export const ResourceService = {
  /**
   * Get all resources
   */
  getAllResources: async (): Promise<ResourceListResponse> => {
    try {
      const response = await axios.get<ResourceListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      return {
        success: false,
        message: 'Failed to fetch resources'
      };
    }
  },

  /**
   * Get resources by department
   */
  getResourcesByDepartment: async (department: string): Promise<ResourceListResponse> => {
    try {
      const response = await axios.get<ResourceListResponse>(`${API_URL}/department/name/${department}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resources for department ${department}:`, error);
      return {
        success: false,
        message: 'Failed to fetch department resources'
      };
    }
  },

  /**
   * Get shared university resources
   */
  getSharedResources: async (): Promise<ResourceListResponse> => {
    try {
      const response = await axios.get<ResourceListResponse>(`${API_URL}/shared`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shared resources:', error);
      return {
        success: false,
        message: 'Failed to fetch shared resources'
      };
    }
  },

  /**
   * Create a new resource
   */
  createResource: async (resource: CreateResourceRequest): Promise<{ success: boolean; data?: Resource; message?: string }> => {
    try {
      const response = await axios.post<{ success: boolean; data?: Resource; message?: string }>(API_URL, resource);
      return response.data;
    } catch (error) {
      console.error('Error creating resource:', error);
      return {
        success: false,
        message: 'Failed to create resource'
      };
    }
  },

  /**
   * Update a resource
   */
  updateResource: async (resource: UpdateResourceRequest): Promise<{ success: boolean; data?: Resource; message?: string }> => {
    try {
      const response = await axios.put<{ success: boolean; data?: Resource; message?: string }>(`${API_URL}/${resource.id}`, resource);
      return response.data;
    } catch (error) {
      console.error(`Error updating resource ${resource.id}:`, error);
      return {
        success: false,
        message: 'Failed to update resource'
      };
    }
  },

  /**
   * Delete a resource
   */
  deleteResource: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.delete<{ success: boolean; message?: string }>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting resource ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete resource'
      };
    }
  },

  /**
   * Toggle resource active status
   */
  toggleResourceStatus: async (id: number, isActive: boolean): Promise<{ success: boolean; data?: Resource; message?: string }> => {
    try {
      const response = await axios.patch<{ success: boolean; data?: Resource; message?: string }>(`${API_URL}/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error(`Error toggling resource status ${id}:`, error);
      return {
        success: false,
        message: 'Failed to toggle resource status'
      };
    }
  }
};
