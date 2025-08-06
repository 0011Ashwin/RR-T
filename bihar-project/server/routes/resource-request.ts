import { Router } from 'express';
import { ResourceRequestModel } from '../models/ResourceRequest.js';
import { HODModel } from '../models/HOD.js';
import { ResourceModel } from '../models/Resource.js';
import { DepartmentModel } from '../models/Department.js';

const router = Router();

// Create a new resource request
router.post('/create', async (req, res) => {
  try {
    const requestData = req.body;

    // Validate required fields
    const requiredFields = [
      'requester_hod_id',
      'requester_department_id',
      'target_resource_id',
      'target_department_id',
      'requested_date',
      'start_time',
      'end_time',
      'purpose',
      'expected_attendance'
    ];

    for (const field of requiredFields) {
      if (!requestData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Check if requester HOD exists
    const requesterHOD = await HODModel.getById(requestData.requester_hod_id);
    if (!requesterHOD) {
      return res.status(404).json({ error: 'Requester HOD not found' });
    }

    // Check if target resource exists
    const targetResource = await ResourceModel.getById(requestData.target_resource_id);
    if (!targetResource) {
      return res.status(404).json({ error: 'Target resource not found' });
    }

    // Check for conflicts
    const conflicts = await ResourceRequestModel.checkConflicts(
      requestData.target_resource_id,
      requestData.requested_date,
      requestData.start_time,
      requestData.end_time
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Time slot conflict detected',
        conflicts: conflicts
      });
    }

    // Create the request
    const newRequest = await ResourceRequestModel.create(requestData);

    if (newRequest) {
      res.status(201).json({
        success: true,
        message: 'Resource request created successfully',
        request: newRequest
      });
    } else {
      res.status(500).json({ error: 'Failed to create resource request' });
    }

  } catch (error) {
    console.error('Error creating resource request:', error);
    res.status(500).json({ error: 'Failed to create resource request' });
  }
});

// Get all requests by requester HOD
router.get('/requester/:hodId', async (req, res) => {
  try {
    const hodId = parseInt(req.params.hodId);
    const requests = await ResourceRequestModel.getByRequesterHOD(hodId);
    
    res.json(requests);

  } catch (error) {
    console.error('Error fetching requests by requester:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get all pending requests for a department (for approval)
router.get('/pending/department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const requests = await ResourceRequestModel.getPendingForDepartment(departmentId);
    
    res.json(requests);

  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Get all requests for a target department
router.get('/target-department/:departmentId', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const requests = await ResourceRequestModel.getByTargetDepartment(departmentId);
    
    res.json(requests);

  } catch (error) {
    console.error('Error fetching requests for department:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get request by ID
router.get('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = await ResourceRequestModel.getById(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);

  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Approve a resource request
router.put('/:id/approve', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { approver_hod_id, notes } = req.body;

    if (!approver_hod_id) {
      return res.status(400).json({ error: 'Approver HOD ID is required' });
    }

    // Check if approver HOD exists
    const approverHOD = await HODModel.getById(approver_hod_id);
    if (!approverHOD) {
      return res.status(404).json({ error: 'Approver HOD not found' });
    }

    // Check if request exists and is pending
    const request = await ResourceRequestModel.getById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not in pending status' });
    }

    // Verify that the approver belongs to the target department
    if (approverHOD.department_id !== request.target_department_id) {
      return res.status(403).json({ error: 'You can only approve requests for your own department' });
    }

    // Check for conflicts again (in case something changed)
    const conflicts = await ResourceRequestModel.checkConflicts(
      request.target_resource_id,
      request.requested_date,
      request.start_time,
      request.end_time
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Time slot conflict detected',
        conflicts: conflicts
      });
    }

    // Approve the request
    const approvedRequest = await ResourceRequestModel.approve(requestId, approver_hod_id, notes);

    if (approvedRequest) {
      res.json({
        success: true,
        message: 'Request approved successfully',
        request: approvedRequest
      });
    } else {
      res.status(500).json({ error: 'Failed to approve request' });
    }

  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Reject a resource request
router.put('/:id/reject', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { approver_hod_id, rejection_reason } = req.body;

    if (!approver_hod_id || !rejection_reason) {
      return res.status(400).json({ error: 'Approver HOD ID and rejection reason are required' });
    }

    // Check if approver HOD exists
    const approverHOD = await HODModel.getById(approver_hod_id);
    if (!approverHOD) {
      return res.status(404).json({ error: 'Approver HOD not found' });
    }

    // Check if request exists and is pending
    const request = await ResourceRequestModel.getById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not in pending status' });
    }

    // Verify that the approver belongs to the target department
    if (approverHOD.department_id !== request.target_department_id) {
      return res.status(403).json({ error: 'You can only reject requests for your own department' });
    }

    // Reject the request
    const rejectedRequest = await ResourceRequestModel.reject(requestId, approver_hod_id, rejection_reason);

    if (rejectedRequest) {
      res.json({
        success: true,
        message: 'Request rejected successfully',
        request: rejectedRequest
      });
    } else {
      res.status(500).json({ error: 'Failed to reject request' });
    }

  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Cancel a resource request (by requester)
router.put('/:id/cancel', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { requester_hod_id } = req.body;

    if (!requester_hod_id) {
      return res.status(400).json({ error: 'Requester HOD ID is required' });
    }

    // Check if request exists
    const request = await ResourceRequestModel.getById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify that the requester is the owner of the request
    if (request.requester_hod_id !== requester_hod_id) {
      return res.status(403).json({ error: 'You can only cancel your own requests' });
    }

    // Cancel the request
    const cancelledRequest = await ResourceRequestModel.cancel(requestId);

    if (cancelledRequest) {
      res.json({
        success: true,
        message: 'Request cancelled successfully',
        request: cancelledRequest
      });
    } else {
      res.status(500).json({ error: 'Failed to cancel request' });
    }

  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// Update a resource request (only if pending)
router.put('/:id/update', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const updateData = req.body;

    // Check if request exists
    const request = await ResourceRequestModel.getById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be updated' });
    }

    // If time or resource is being changed, check for conflicts
    if (updateData.requested_date || updateData.start_time || updateData.end_time || updateData.target_resource_id) {
      const resourceId = updateData.target_resource_id || request.target_resource_id;
      const date = updateData.requested_date || request.requested_date;
      const startTime = updateData.start_time || request.start_time;
      const endTime = updateData.end_time || request.end_time;

      const conflicts = await ResourceRequestModel.checkConflicts(resourceId, date, startTime, endTime);
      
      // Filter out the current request from conflicts
      const relevantConflicts = conflicts.filter(conflict => conflict.id !== requestId);
      
      if (relevantConflicts.length > 0) {
        return res.status(409).json({
          error: 'Time slot conflict detected',
          conflicts: relevantConflicts
        });
      }
    }

    // Update the request
    const updatedRequest = await ResourceRequestModel.update(requestId, updateData);

    if (updatedRequest) {
      res.json({
        success: true,
        message: 'Request updated successfully',
        request: updatedRequest
      });
    } else {
      res.status(500).json({ error: 'Failed to update request' });
    }

  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Get requests by status
router.get('/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const requests = await ResourceRequestModel.getByStatus(status);
    res.json(requests);

  } catch (error) {
    console.error('Error fetching requests by status:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Delete a resource request
router.delete('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    
    const deletedCount = await ResourceRequestModel.delete(requestId);
    
    if (deletedCount > 0) {
      res.json({
        success: true,
        message: 'Request deleted successfully'
      });
    } else {
      res.status(404).json({ error: 'Request not found' });
    }

  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

export const resourceRequestRouter = router;
