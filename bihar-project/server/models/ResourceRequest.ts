import db from '../database/index.js';

export interface ResourceRequest {
  id?: number;
  requester_hod_id: number;
  requester_department_id: number;
  target_resource_id: number;
  target_department_id: number;
  requested_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  course_name?: string;
  expected_attendance: number;
  additional_requirements?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by_hod_id?: number;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_recurring?: boolean;
  recurring_pattern?: string; // JSON string for recurring patterns
  created_at?: string;
  updated_at?: string;
}

export interface ResourceRequestWithDetails extends ResourceRequest {
  requester_name?: string;
  requester_department_name?: string;
  target_resource_name?: string;
  target_department_name?: string;
  approved_by_name?: string;
}

export class ResourceRequestModel {
  static async getAll(): Promise<ResourceRequestWithDetails[]> {
    return db('resource_requests')
      .leftJoin('hods as requester_hod', 'resource_requests.requester_hod_id', 'requester_hod.id')
      .leftJoin('departments as requester_dept', 'resource_requests.requester_department_id', 'requester_dept.id')
      .leftJoin('resources', 'resource_requests.target_resource_id', 'resources.id')
      .leftJoin('departments as target_dept', 'resource_requests.target_department_id', 'target_dept.id')
      .leftJoin('hods as approver_hod', 'resource_requests.approved_by_hod_id', 'approver_hod.id')
      .select(
        'resource_requests.*',
        'requester_hod.name as requester_name',
        'requester_dept.name as requester_department_name',
        'resources.name as target_resource_name',
        'target_dept.name as target_department_name',
        'approver_hod.name as approved_by_name'
      )
      .orderBy('resource_requests.created_at', 'desc');
  }

  static async getById(id: number): Promise<ResourceRequestWithDetails | null> {
    const result = await db('resource_requests')
      .leftJoin('hods as requester_hod', 'resource_requests.requester_hod_id', 'requester_hod.id')
      .leftJoin('departments as requester_dept', 'resource_requests.requester_department_id', 'requester_dept.id')
      .leftJoin('resources', 'resource_requests.target_resource_id', 'resources.id')
      .leftJoin('departments as target_dept', 'resource_requests.target_department_id', 'target_dept.id')
      .leftJoin('hods as approver_hod', 'resource_requests.approved_by_hod_id', 'approver_hod.id')
      .where('resource_requests.id', id)
      .select(
        'resource_requests.*',
        'requester_hod.name as requester_name',
        'requester_dept.name as requester_department_name',
        'resources.name as target_resource_name',
        'target_dept.name as target_department_name',
        'approver_hod.name as approved_by_name'
      )
      .first();

    return result || null;
  }

  static async getByRequesterHOD(hodId: number): Promise<ResourceRequestWithDetails[]> {
    return db('resource_requests')
      .leftJoin('hods as requester_hod', 'resource_requests.requester_hod_id', 'requester_hod.id')
      .leftJoin('departments as requester_dept', 'resource_requests.requester_department_id', 'requester_dept.id')
      .leftJoin('resources', 'resource_requests.target_resource_id', 'resources.id')
      .leftJoin('departments as target_dept', 'resource_requests.target_department_id', 'target_dept.id')
      .leftJoin('hods as approver_hod', 'resource_requests.approved_by_hod_id', 'approver_hod.id')
      .where('resource_requests.requester_hod_id', hodId)
      .select(
        'resource_requests.*',
        'requester_hod.name as requester_name',
        'requester_dept.name as requester_department_name',
        'resources.name as target_resource_name',
        'target_dept.name as target_department_name',
        'approver_hod.name as approved_by_name'
      )
      .orderBy('resource_requests.created_at', 'desc');
  }

  static async getByTargetDepartment(departmentId: number): Promise<ResourceRequestWithDetails[]> {
    return db('resource_requests')
      .leftJoin('hods as requester_hod', 'resource_requests.requester_hod_id', 'requester_hod.id')
      .leftJoin('departments as requester_dept', 'resource_requests.requester_department_id', 'requester_dept.id')
      .leftJoin('resources', 'resource_requests.target_resource_id', 'resources.id')
      .leftJoin('departments as target_dept', 'resource_requests.target_department_id', 'target_dept.id')
      .leftJoin('hods as approver_hod', 'resource_requests.approved_by_hod_id', 'approver_hod.id')
      .where('resource_requests.target_department_id', departmentId)
      .select(
        'resource_requests.*',
        'requester_hod.name as requester_name',
        'requester_dept.name as requester_department_name',
        'resources.name as target_resource_name',
        'target_dept.name as target_department_name',
        'approver_hod.name as approved_by_name'
      )
      .orderBy('resource_requests.created_at', 'desc');
  }

  static async getPendingForDepartment(departmentId: number): Promise<ResourceRequestWithDetails[]> {
    return db('resource_requests')
      .leftJoin('hods as requester_hod', 'resource_requests.requester_hod_id', 'requester_hod.id')
      .leftJoin('departments as requester_dept', 'resource_requests.requester_department_id', 'requester_dept.id')
      .leftJoin('resources', 'resource_requests.target_resource_id', 'resources.id')
      .leftJoin('departments as target_dept', 'resource_requests.target_department_id', 'target_dept.id')
      .where('resource_requests.target_department_id', departmentId)
      .where('resource_requests.status', 'pending')
      .select(
        'resource_requests.*',
        'requester_hod.name as requester_name',
        'requester_dept.name as requester_department_name',
        'resources.name as target_resource_name',
        'target_dept.name as target_department_name'
      )
      .orderBy('resource_requests.created_at', 'desc');
  }

  static async create(request: Omit<ResourceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ResourceRequestWithDetails | null> {
    const [id] = await db('resource_requests').insert({
      ...request,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return this.getById(id);
  }

  static async update(id: number, request: Partial<ResourceRequest>): Promise<ResourceRequestWithDetails | null> {
    await db('resource_requests').where({ id }).update({
      ...request,
      updated_at: new Date().toISOString()
    });
    return this.getById(id);
  }

  static async approve(id: number, approverHodId: number, notes?: string): Promise<ResourceRequestWithDetails | null> {
    await db('resource_requests').where({ id }).update({
      status: 'approved',
      approved_by_hod_id: approverHodId,
      approved_at: new Date().toISOString(),
      notes: notes,
      updated_at: new Date().toISOString()
    });
    return this.getById(id);
  }

  static async reject(id: number, approverHodId: number, rejectionReason: string): Promise<ResourceRequestWithDetails | null> {
    await db('resource_requests').where({ id }).update({
      status: 'rejected',
      approved_by_hod_id: approverHodId,
      approved_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString()
    });
    return this.getById(id);
  }

  static async cancel(id: number): Promise<ResourceRequestWithDetails | null> {
    await db('resource_requests').where({ id }).update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    });
    return this.getById(id);
  }

  static async delete(id: number): Promise<number> {
    return db('resource_requests').where({ id }).delete();
  }

  static async getByStatus(status: string): Promise<ResourceRequestWithDetails[]> {
    return db('resource_requests')
      .leftJoin('hods as requester_hod', 'resource_requests.requester_hod_id', 'requester_hod.id')
      .leftJoin('departments as requester_dept', 'resource_requests.requester_department_id', 'requester_dept.id')
      .leftJoin('resources', 'resource_requests.target_resource_id', 'resources.id')
      .leftJoin('departments as target_dept', 'resource_requests.target_department_id', 'target_dept.id')
      .leftJoin('hods as approver_hod', 'resource_requests.approved_by_hod_id', 'approver_hod.id')
      .where('resource_requests.status', status)
      .select(
        'resource_requests.*',
        'requester_hod.name as requester_name',
        'requester_dept.name as requester_department_name',
        'resources.name as target_resource_name',
        'target_dept.name as target_department_name',
        'approver_hod.name as approved_by_name'
      )
      .orderBy('resource_requests.created_at', 'desc');
  }

  static async checkConflicts(resourceId: number, date: string, startTime: string, endTime: string): Promise<ResourceRequestWithDetails[]> {
    return db('resource_requests')
      .leftJoin('hods as requester_hod', 'resource_requests.requester_hod_id', 'requester_hod.id')
      .leftJoin('departments as requester_dept', 'resource_requests.requester_department_id', 'requester_dept.id')
      .leftJoin('resources', 'resource_requests.target_resource_id', 'resources.id')
      .leftJoin('departments as target_dept', 'resource_requests.target_department_id', 'target_dept.id')
      .where('resource_requests.target_resource_id', resourceId)
      .where('resource_requests.requested_date', date)
      .where('resource_requests.status', 'approved')
      .where(function() {
        this.where(function() {
          this.where('resource_requests.start_time', '<=', startTime)
              .where('resource_requests.end_time', '>', startTime);
        }).orWhere(function() {
          this.where('resource_requests.start_time', '<', endTime)
              .where('resource_requests.end_time', '>=', endTime);
        }).orWhere(function() {
          this.where('resource_requests.start_time', '>=', startTime)
              .where('resource_requests.end_time', '<=', endTime);
        });
      })
      .select(
        'resource_requests.*',
        'requester_hod.name as requester_name',
        'requester_dept.name as requester_department_name',
        'resources.name as target_resource_name',
        'target_dept.name as target_department_name'
      );
  }
}
