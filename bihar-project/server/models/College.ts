import db from '../database/index.js';

export interface College {
  id?: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  affiliation?: string;
  established_year?: number;
  about?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export class CollegeModel {
  static async getAll(): Promise<College[]> {
    return db('colleges')
      .where('is_active', true)
      .select('*')
      .orderBy('name');
  }

  static async getById(id: number): Promise<College | undefined> {
    return db('colleges')
      .where({ id, is_active: true })
      .first();
  }

  static async getByCode(code: string): Promise<College | undefined> {
    return db('colleges')
      .where({ code, is_active: true })
      .first();
  }

  static async getByName(name: string): Promise<College | undefined> {
    return db('colleges')
      .where('name', 'like', `%${name}%`)
      .where('is_active', true)
      .first();
  }

  static async getByCity(city: string): Promise<College[]> {
    return db('colleges')
      .where({ city, is_active: true })
      .select('*')
      .orderBy('name');
  }

  static async create(college: College): Promise<College | undefined> {
    const [id] = await db('colleges').insert(college);
    return this.getById(id);
  }

  static async update(id: number, college: Partial<College>): Promise<College | undefined> {
    await db('colleges').where({ id }).update({
      ...college,
      updated_at: db.fn.now()
    });
    return this.getById(id);
  }

  static async delete(id: number): Promise<number> {
    return db('colleges').where({ id }).update({ is_active: false });
  }

  static async hardDelete(id: number): Promise<number> {
    return db('colleges').where({ id }).delete();
  }
}
