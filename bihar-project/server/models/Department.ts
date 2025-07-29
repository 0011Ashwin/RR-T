import db from '../database/index.js';

export interface Department {
  id?: number;
  name: string;
  code: string;
  hod_name?: string;
  hod_email?: string;
  created_at?: string;
  updated_at?: string;
}

export class DepartmentModel {
  static async getAll() {
    return db('departments').select('*');
  }

  static async getById(id: number) {
    return db('departments').where({ id }).first();
  }

  static async getByCode(code: string) {
    return db('departments').where({ code }).first();
  }

  static async create(department: Department) {
    const [id] = await db('departments').insert(department);
    return this.getById(id);
  }

  static async update(id: number, department: Partial<Department>) {
    await db('departments').where({ id }).update(department);
    return this.getById(id);
  }

  static async delete(id: number) {
    return db('departments').where({ id }).delete();
  }
}