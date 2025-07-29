import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer } from '../index';
import { BookingRequestModel } from '../models/BookingRequest';
import { ResourceModel } from '../models/Resource';
import { Server } from 'http';

let server: Server;
let app: any;

describe('Booking Request API', () => {
  beforeAll(async () => {
    app = await createServer();
    server = app.listen(0); // Listen on a random free port
  });

  afterAll(() => {
    server.close();
  });

  it('should create a new booking request', async () => {
    const newBookingRequest = {
      requesterId: 'hod1',
      requesterDepartment: 'CSE',
      targetResourceId: 'resource1',
      targetDepartment: 'ECE',
      timeSlotId: '1',
      dayOfWeek: 1,
      courseName: 'Test Course',
      expectedAttendance: 50,
    };

    const resource = {
      id: 'resource1',
      name: 'Test Resource',
      type: 'classroom',
      capacity: 100,
      department_id: 1,
      building: 'A',
      floor: 1,
      location: 'A-101',
      equipment: [],
      facilities: [],
      is_active: true,
    };

    vi.spyOn(ResourceModel, 'getById').mockResolvedValue(resource);
    vi.spyOn(BookingRequestModel, 'create').mockResolvedValue({
      ...newBookingRequest,
      id: 'req_123',
      status: 'pending',
      requestDate: new Date().toISOString(),
    });

    const port = (server.address() as any).port;
    const response = await fetch(`http://localhost:${port}/api/booking-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBookingRequest),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
    expect(body.data.status).toBe('pending');
  });

  it('should not create a booking request if the resource does not exist', async () => {
    const newBookingRequest = {
      requesterId: 'hod1',
      requesterDepartment: 'CSE',
      targetResourceId: 'nonexistent_resource',
      targetDepartment: 'ECE',
      timeSlotId: '1',
      dayOfWeek: 1,
      courseName: 'Test Course',
      expectedAttendance: 50,
    };

    vi.spyOn(ResourceModel, 'getById').mockResolvedValue(null);

    const port = (server.address() as any).port;
    const response = await fetch(`http://localhost:${port}/api/booking-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBookingRequest),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('Target resource not found');
  });

  it('should approve a booking request', async () => {
    const bookingRequestId = 'req_123';
    const updatePayload = {
      status: 'approved',
      approvedBy: 'hod_ece',
      notes: 'Approved',
    };

    const existingRequest = {
      id: bookingRequestId,
      requesterId: 'hod1',
      requesterDepartment: 'CSE',
      targetResourceId: 'resource1',
      targetDepartment: 'ECE',
      timeSlotId: '1',
      dayOfWeek: 1,
      courseName: 'Test Course',
      expectedAttendance: 50,
      status: 'pending',
      requestDate: new Date().toISOString(),
    };

    vi.spyOn(BookingRequestModel, 'getById').mockResolvedValue(existingRequest);
    vi.spyOn(BookingRequestModel, 'updateStatus').mockResolvedValue({
      ...existingRequest,
      ...updatePayload,
      status: 'approved',
      responseDate: new Date().toISOString(),
    });

    const port = (server.address() as any).port;
    const response = await fetch(`http://localhost:${port}/api/booking-requests/${bookingRequestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('approved');
  });

  it('should reject a booking request', async () => {
    const bookingRequestId = 'req_123';
    const updatePayload = {
      status: 'rejected',
      notes: 'Rejected',
    };

    const existingRequest = {
      id: bookingRequestId,
      requesterId: 'hod1',
      requesterDepartment: 'CSE',
      targetResourceId: 'resource1',
      targetDepartment: 'ECE',
      timeSlotId: '1',
      dayOfWeek: 1,
      courseName: 'Test Course',
      expectedAttendance: 50,
      status: 'pending',
      requestDate: new Date().toISOString(),
    };

    vi.spyOn(BookingRequestModel, 'getById').mockResolvedValue(existingRequest);
    vi.spyOn(BookingRequestModel, 'updateStatus').mockResolvedValue({
      ...existingRequest,
      ...updatePayload,
      status: 'rejected',
      responseDate: new Date().toISOString(),
    });

    const port = (server.address() as any).port;
    const response = await fetch(`http://localhost:${port}/api/booking-requests/${bookingRequestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('rejected');
  });

  it('should not allow updating status from a non-pending state', async () => {
    const bookingRequestId = 'req_123';
    const updatePayload = {
      status: 'approved',
      approvedBy: 'hod_ece',
      notes: 'Approved',
    };

    const existingRequest = {
      id: bookingRequestId,
      requesterId: 'hod1',
      requesterDepartment: 'CSE',
      targetResourceId: 'resource1',
      targetDepartment: 'ECE',
      timeSlotId: '1',
      dayOfWeek: 1,
      courseName: 'Test Course',
      expectedAttendance: 50,
      status: 'approved',
      requestDate: new Date().toISOString(),
    };

    vi.spyOn(BookingRequestModel, 'getById').mockResolvedValue(existingRequest);

    const port = (server.address() as any).port;
    const response = await fetch(`http://localhost:${port}/api/booking-requests/${bookingRequestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('Cannot change status from approved to approved');
  });
});
