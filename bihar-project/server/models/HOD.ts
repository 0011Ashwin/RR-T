import db from '../database/index.js';

export interface HOD {
  id?: number;
  name: string;
  email: string;
  password?: string; // For authentication
  designation: string;
  employee_id: string;
  phone?: string;
  department_id: number;
  college_id?: number; // For multi-college support
  join_date: string;
  experience?: string;
  avatar?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HODWithDepartment extends HOD {
  department_name?: string;
  department_code?: string;
  college_name?: string;
}

export class HODModel {
  static async getAll(): Promise<HODWithDepartment[]> {
    return db('hods')
      .leftJoin('departments', 'hods.department_id', 'departments.id')
      .leftJoin('colleges', 'hods.college_id', 'colleges.id')
      .select(
        'hods.*',
        'departments.name as department_name',
        'departments.code as department_code',
        'colleges.name as college_name'
      );
  }

  static async getById(id: number): Promise<HODWithDepartment | null> {
    const result = await db('hods')
      .leftJoin('departments', 'hods.department_id', 'departments.id')
      .leftJoin('colleges', 'hods.college_id', 'colleges.id')
      .where('hods.id', id)
      .select(
        'hods.*',
        'departments.name as department_name',
        'departments.code as department_code',
        'colleges.name as college_name'
      )
      .first();
    
    return result || null;
  }

  static async getByEmail(email: string): Promise<HODWithDepartment | null> {
    const result = await db('hods')
      .leftJoin('departments', 'hods.department_id', 'departments.id')
      .leftJoin('colleges', 'hods.college_id', 'colleges.id')
      .where('hods.email', email)
      .select(
        'hods.*',
        'departments.name as department_name',
        'departments.code as department_code',
        'colleges.name as college_name'
      )
      .first();
    
    return result || null;
  }

  static async getByDepartment(departmentId: number): Promise<HODWithDepartment[]> {
    return db('hods')
      .leftJoin('departments', 'hods.department_id', 'departments.id')
      .leftJoin('colleges', 'hods.college_id', 'colleges.id')
      .where('hods.department_id', departmentId)
      .select(
        'hods.*',
        'departments.name as department_name',
        'departments.code as department_code',
        'colleges.name as college_name'
      );
  }

  static async getByCollege(collegeId: number): Promise<HODWithDepartment[]> {
    return db('hods')
      .leftJoin('departments', 'hods.department_id', 'departments.id')
      .leftJoin('colleges', 'hods.college_id', 'colleges.id')
      .where('hods.college_id', collegeId)
      .select(
        'hods.*',
        'departments.name as department_name',
        'departments.code as department_code',
        'colleges.name as college_name'
      );
  }

  static async create(hod: Omit<HOD, 'id' | 'created_at' | 'updated_at'>): Promise<HODWithDepartment | null> {
    const [id] = await db('hods').insert(hod);
    return this.getById(id);
  }

  static async update(id: number, hod: Partial<HOD>): Promise<HODWithDepartment | null> {
    await db('hods').where({ id }).update(hod);
    return this.getById(id);
  }

  static async delete(id: number): Promise<number> {
    return db('hods').where({ id }).delete();
  }

  static async authenticate(email: string, password: string): Promise<HODWithDepartment | null> {
    // In a real application, you would hash the password and compare
    // For now, we'll use simple comparison
    const hod = await this.getByEmail(email);
    
    if (hod && hod.password === password && hod.is_active) {
      // Remove password from response
      const { password: _, ...hodWithoutPassword } = hod;
      return hodWithoutPassword as HODWithDepartment;
    }
    
    return null;
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const result = await db('hods')
      .where({ id })
      .update({ password: newPassword });
    
    return result > 0;
  }

  static async getActiveHODs(): Promise<HODWithDepartment[]> {
    return db('hods')
      .leftJoin('departments', 'hods.department_id', 'departments.id')
      .leftJoin('colleges', 'hods.college_id', 'colleges.id')
      .where('hods.is_active', true)
      .select(
        'hods.*',
        'departments.name as department_name',
        'departments.code as department_code',
        'colleges.name as college_name'
      );
  }
}
