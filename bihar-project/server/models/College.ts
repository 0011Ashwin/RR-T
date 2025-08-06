import db from '../database/index.js';

export interface College {
  id?: number;
  name: string;
  code: string;
  address?: string;
  principal_name?: string;
  principal_email?: string;
  phone?: string;
  university_id?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export class CollegeModel {
  static async getAll(): Promise<College[]> {
    return db('colleges').select('*');
  }

  static async getById(id: number): Promise<College | null> {
    const result = await db('colleges').where({ id }).first();
    return result || null;
  }

  static async getByCode(code: string): Promise<College | null> {
    const result = await db('colleges').where({ code }).first();
    return result || null;
  }

  static async create(college: Omit<College, 'id' | 'created_at' | 'updated_at'>): Promise<College | null> {
    const [id] = await db('colleges').insert(college);
    return this.getById(id);
  }

  static async update(id: number, college: Partial<College>): Promise<College | null> {
    await db('colleges').where({ id }).update(college);
    return this.getById(id);
  }

  static async delete(id: number): Promise<number> {
    return db('colleges').where({ id }).delete();
  }

  static async getActive(): Promise<College[]> {
    return db('colleges').where({ is_active: true }).select('*');
  }
}
