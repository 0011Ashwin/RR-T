import db from '../database/index.js';

export interface Subject {
  id?: number;
  name: string;
  code: string;
  credits: number;
  type: 'lecture' | 'practical';
  department_id?: number;
  created_at?: string;
  updated_at?: string;
}

export class SubjectModel {
  static async getAll() {
    return db('subjects').select('*');
  }

  static async getById(id: number) {
    return db('subjects').where({ id }).first();
  }

  static async getByCode(code: string) {
    return db('subjects').where({ code }).first();
  }

  static async getByDepartment(departmentId: number) {
    return db('subjects').where({ department_id: departmentId }).select('*');
  }

  static async create(subject: Subject) {
    const [id] = await db('subjects').insert(subject);
    return this.getById(id);
  }

  static async update(id: number, subject: Partial<Subject>) {
    await db('subjects').where({ id }).update(subject);
    return this.getById(id);
  }

  static async delete(id: number) {
    return db('subjects').where({ id }).delete();
  }

  static async getWithFaculty(id: number) {
    const subject = await this.getById(id);
    if (!subject) return null;

    // Add a query to get faculty assigned to this subject
    const faculty = await db('faculty_subjects')
      .join('faculty', 'faculty_subjects.faculty_id', '=', 'faculty.id')
      .where('faculty_subjects.subject_id', id)
      .select('faculty.*');

    return {
      ...subject,
      faculty,
    };
  }
}