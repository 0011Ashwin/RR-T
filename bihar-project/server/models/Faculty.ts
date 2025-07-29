import db from '../database/index.js';

export interface Faculty {
  id?: number;
  name: string;
  email: string;
  designation?: string;
  department_id?: number;
  created_at?: string;
  updated_at?: string;
}

export class FacultyModel {
  static async getAll() {
    return db('faculty').select('*');
  }

  static async getById(id: number) {
    return db('faculty').where({ id }).first();
  }

  static async getByEmail(email: string) {
    return db('faculty').where({ email }).first();
  }

  static async getByDepartment(departmentId: number) {
    return db('faculty').where({ department_id: departmentId }).select('*');
  }

  static async create(faculty: Faculty) {
    const [id] = await db('faculty').insert(faculty);
    return this.getById(id);
  }

  static async update(id: number, faculty: Partial<Faculty>) {
    await db('faculty').where({ id }).update(faculty);
    return this.getById(id);
  }

  static async delete(id: number) {
    return db('faculty').where({ id }).delete();
  }

  static async getWithSubjects(id: number) {
    const faculty = await this.getById(id);
    if (!faculty) return null;

    const subjects = await db('faculty_subjects')
      .join('subjects', 'faculty_subjects.subject_id', '=', 'subjects.id')
      .where('faculty_subjects.faculty_id', id)
      .select('subjects.*');

    return {
      ...faculty,
      subjects,
    };
  }
}