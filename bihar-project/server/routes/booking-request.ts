import { Router } from 'express';
import { BookingRequestModel } from '../models/BookingRequest.js';
import { ResourceModel } from '../models/Resource.js';

const router = Router();

// Get all booking requests
router.get('/', async (req, res) => {
  try {
    const bookingRequests = await BookingRequestModel.getAll();
    res.json({
      success: true,
      data: bookingRequests,
      total: bookingRequests.length
    });
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch booking requests' 
    });
  }
});

// Get booking request by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const bookingRequest = await BookingRequestModel.getById(id);
    
    if (!bookingRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking request not found' 
      });
    }
    
    res.json({
      success: true,
      data: bookingRequest
    });
  } catch (error) {
    console.error('Error fetching booking request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch booking request' 
    });
  }
});

// Get booking requests by requester department
router.get('/requester/:department', async (req, res) => {
  try {
    const department = req.params.department;
    const bookingRequests = await BookingRequestModel.getByRequesterDepartment(department);
    res.json({
      success: true,
      data: bookingRequests,
      total: bookingRequests.length
    });
  } catch (error) {
    console.error('Error fetching department booking requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department booking requests' 
    });
  }
});

// Get booking requests by target department
router.get('/target/:department', async (req, res) => {
  try {
    const department = req.params.department;
    const bookingRequests = await BookingRequestModel.getByTargetDepartment(department);
    res.json({
      success: true,
      data: bookingRequests,
      total: bookingRequests.length
    });
  } catch (error) {
    console.error('Error fetching target department booking requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch target department booking requests' 
    });
  }
});

// Get booking requests that need VC approval
router.get('/vc-approval-needed', async (req, res) => {
  try {
    const bookingRequests = await BookingRequestModel.getAll();
    // Filter requests that are approved but not yet VC approved
    const vcApprovalNeeded = bookingRequests.filter(req => 
      req.status === 'approved' && (req.vcApproved === undefined || req.vcApproved === false));
    
    res.json({
      success: true,
      data: vcApprovalNeeded,
      total: vcApprovalNeeded.length
    });
  } catch (error) {
    console.error('Error fetching VC approval needed requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch requests needing VC approval' 
    });
  }
});

// Create a new booking request
router.post('/', async (req, res) => {
  try {
    const bookingRequest = req.body;
    
    // Validate the request
    if (!bookingRequest.requesterId || !bookingRequest.requesterDepartment || 
        !bookingRequest.targetResourceId || !bookingRequest.targetDepartment || 
        !bookingRequest.timeSlotId || bookingRequest.dayOfWeek === undefined || 
        !bookingRequest.courseName || !bookingRequest.expectedAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields in booking request' 
      });
    }
    
    // Check if the resource exists
    const resource = await ResourceModel.getById(bookingRequest.targetResourceId);
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Target resource not found' 
      });
    }
    
    // Check if this is a same-department request by an HOD
    const isSameDepartment = bookingRequest.requesterDepartment === bookingRequest.targetDepartment;
    const isHODRequest = bookingRequest.requesterDesignation && 
                        (bookingRequest.requesterDesignation.includes('HOD') || 
                         bookingRequest.requesterDesignation.includes('Head'));
    
    // Auto-approve if HOD is requesting resource from their own department
    const shouldAutoApprove = isSameDepartment && isHODRequest;
    
    // Set default values and filter only valid database fields
    const validBookingRequestFields = {
      requesterId: bookingRequest.requesterId,
      requesterDepartment: bookingRequest.requesterDepartment,
      targetResourceId: bookingRequest.targetResourceId,
      targetDepartment: bookingRequest.targetDepartment,
      timeSlotId: bookingRequest.timeSlotId,
      dayOfWeek: bookingRequest.dayOfWeek,
      courseName: bookingRequest.courseName,
      purpose: bookingRequest.purpose || 'Academic session', // Default value for purpose
      expectedAttendance: bookingRequest.expectedAttendance,
      requestDate: new Date().toISOString(),
      status: shouldAutoApprove ? 'approved' as const : 'pending' as const,
      ...(shouldAutoApprove && {
        approvedBy: `Auto-approved (${bookingRequest.requesterId} - Same Department HOD)`,
        responseDate: new Date().toISOString(),
        notes: 'Automatically approved - HOD requesting department resource'
      })
    };

    console.log('Creating booking request with data:', validBookingRequestFields);
    console.log('Extra fields stored separately:', {
      timetableId: bookingRequest.timetableId,
      subjectName: bookingRequest.subjectName,
      subjectCode: bookingRequest.subjectCode,
      facultyId: bookingRequest.facultyId,
      sessionType: bookingRequest.sessionType,
      startTime: bookingRequest.startTime,
      endTime: bookingRequest.endTime,
    });
    
    // Store extra fields in notes as JSON for later use during approval
    const extraData = {
      timetableId: bookingRequest.timetableId,
      subjectName: bookingRequest.subjectName,
      subjectCode: bookingRequest.subjectCode,
      facultyId: bookingRequest.facultyId,
      sessionType: bookingRequest.sessionType,
      startTime: bookingRequest.startTime,
      endTime: bookingRequest.endTime,
    };
    
    // Store extra data in notes field but mark it as internal
    const internalNotes = `[INTERNAL_DATA]${JSON.stringify(extraData)}[/INTERNAL_DATA]`;
    
    // Add to existing notes or create new notes
    if (validBookingRequestFields.notes) {
      validBookingRequestFields.notes += ` ${internalNotes}`;
    } else {
      validBookingRequestFields.notes = internalNotes;
    }
    
    const createdRequest = await BookingRequestModel.create(validBookingRequestFields);
    
    const message = shouldAutoApprove 
      ? 'Booking request auto-approved (HOD requesting department resource)'
      : 'Booking request created successfully';
    
    res.status(201).json({
      success: true,
      data: createdRequest,
      message
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create booking request', 
      error: error.message 
    });
  }
});

// Update booking request status (approve/reject)
router.put('/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, notes, approvedBy } = req.body;
    
    if (!status || !['approved', 'rejected', 'withdrawn'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value. Must be "approved", "rejected", or "withdrawn".' 
      });
    }
    
    // Get the current booking request
    const currentRequest = await BookingRequestModel.getById(id);
    if (!currentRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking request not found' 
      });
    }
    
    // Only allow status changes from pending
    if (currentRequest.status !== 'pending' && status !== 'withdrawn') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot change status from ${currentRequest.status} to ${status}` 
      });
    }
    
    // Update the booking request
    const updatedRequest = await BookingRequestModel.updateStatus(id, {
      status,
      notes: notes || undefined,
      approvedBy: status === 'approved' ? approvedBy : undefined,
      responseDate: new Date().toISOString()
    });

    // If approved, create the actual timetable entry
    if (status === 'approved') {
      console.log('Booking request approved - creating timetable entry');
      try {
        // Import required models
        const { TimetableModel } = await import('../models/Timetable.js');
        const db = await import('../database/index.js');
        const dbConnection = db.default;
        
        console.log('Current request data for timetable creation:', currentRequest);
        
        // Extract extra data from notes field
        let extraData: any = {};
        if (currentRequest.notes && currentRequest.notes.includes('[INTERNAL_DATA]')) {
          try {
            const matches = currentRequest.notes.match(/\[INTERNAL_DATA\](.*?)\[\/INTERNAL_DATA\]/);
            if (matches && matches[1]) {
              extraData = JSON.parse(matches[1]);
              console.log('Extracted extra data:', extraData);
            }
          } catch (e) {
            console.warn('Could not parse extra data from notes:', e);
          }
        }
        
        // First, create the subject if it doesn't exist
        let subjectId;
        const subjectName = extraData.subjectName || currentRequest.courseName;
        const subjectCode = extraData.subjectCode || currentRequest.courseName.toLowerCase().replace(/\s+/g, '');
        
        if (subjectName) {
          try {
            // Check if subject already exists
            const existingSubject = await dbConnection('subjects')
              .where('code', subjectCode)
              .first();
            
            if (existingSubject) {
              subjectId = existingSubject.id;
              console.log('Using existing subject:', existingSubject);
            } else {
              // Create new subject
              const [newSubjectId] = await dbConnection('subjects').insert({
                name: subjectName,
                code: subjectCode,
                type: extraData.sessionType || 'theory',
                department: currentRequest.requesterDepartment,
              }).returning('id');
              subjectId = newSubjectId.id || newSubjectId;
              console.log('Created new subject with ID:', subjectId);
            }
          } catch (subjectError) {
            console.error('Error creating subject:', subjectError);
            subjectId = 1; // Fallback to default subject
          }
        } else {
          subjectId = 1; // Fallback to default subject
        }
        
        // Convert timeSlotId to start/end times
        const timeSlot = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'][parseInt(currentRequest.timeSlotId) - 1];
        const [startTime, endTime] = timeSlot ? timeSlot.split('-') : ['09:00', '10:00'];
        
        // Create timetable entry data
        const entryData = {
          timetable_id: parseInt(extraData.timetableId || '1'),
          subject_id: subjectId,
          faculty_id: parseInt(extraData.facultyId || '1'),
          classroom_id: parseInt(currentRequest.targetResourceId),
          day_of_week: currentRequest.dayOfWeek,
          start_time: extraData.startTime || startTime,
          end_time: extraData.endTime || endTime,
        };

        console.log('Creating timetable entry for approved booking request:', entryData);
        const newEntry = await TimetableModel.addEntry(entryData);
        console.log('Timetable entry created successfully:', newEntry);
      } catch (entryError) {
        console.error('Error creating timetable entry for approved booking request:', entryError);
        console.error('Error details:', entryError.message);
        console.error('Stack trace:', entryError.stack);
        // Don't fail the approval if timetable entry creation fails
        // The request is still approved, but manual intervention may be needed
      }
    }

    res.json({
      success: true,
      data: updatedRequest,
      message: `Booking request ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating booking request status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking request status', 
      error: error.message 
    });
  }
});

// Update VC approval status for a booking request
router.put('/:id/vc-approval', async (req, res) => {
  try {
    const id = req.params.id;
    const { vcApproved, notes } = req.body;
    
    if (vcApproved === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'vcApproved field is required' 
      });
    }
    
    // Get the current booking request
    const currentRequest = await BookingRequestModel.getById(id);
    if (!currentRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking request not found' 
      });
    }
    
    // Only allow VC approval for approved requests
    if (currentRequest.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update VC approval for requests with status ${currentRequest.status}. Request must be approved first.` 
      });
    }
    
    // Update the booking request with VC approval
    const updatedRequest = await BookingRequestModel.updateStatus(id, {
      status: currentRequest.status, // Keep the current status
      vcApproved,
      notes: notes ? `${currentRequest.notes ? currentRequest.notes + ' | ' : ''}VC: ${notes}` : undefined
    });
    
    res.json({
      success: true,
      data: updatedRequest,
      message: vcApproved ? 'Request approved by VC successfully' : 'Request rejected by VC successfully'
    });
  } catch (error) {
    console.error('Error updating VC approval status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update VC approval status', 
      error: error.message 
    });
  }
});

// Delete a booking request
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if the booking request exists
    const bookingRequest = await BookingRequestModel.getById(id);
    if (!bookingRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking request not found' 
      });
    }
    
    // Only allow deletion of pending requests
    if (bookingRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete a booking request with status: ${bookingRequest.status}` 
      });
    }
    
    await BookingRequestModel.delete(id);
    res.status(200).json({
      success: true,
      message: 'Booking request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete booking request' 
    });
  }
});

export const bookingRequestRouter = router;