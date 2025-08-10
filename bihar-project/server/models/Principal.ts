import db from '../database/index.js';

export interface Principal {
  id?: number;
  name: string;
  email: string;
  college_id: number;
  phone?: string;
  qualification?: string;
  experience?: string;
  employee_id?: string;
  join_date?: string;
  about?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrincipalWithCollege extends Principal {
  college_name?: string;
  college_code?: string;
  college_city?: string;
}

export class PrincipalModel {
  static async getAll(): Promise<PrincipalWithCollege[]> {
    return db('principals')
      .join('colleges', 'principals.college_id', 'colleges.id')
      .where('principals.is_active', true)
      .select(
        'principals.*',
        'colleges.name as college_name',
        'colleges.code as college_code',
        'colleges.city as college_city'
      );
  }

  static async getById(id: number): Promise<PrincipalWithCollege | undefined> {
    return db('principals')
      .join('colleges', 'principals.college_id', 'colleges.id')
      .where('principals.id', id)
      .where('principals.is_active', true)
      .select(
        'principals.*',
        'colleges.name as college_name',
        'colleges.code as college_code',
        'colleges.city as college_city'
      )
      .first();
  }

  static async getByEmail(email: string): Promise<PrincipalWithCollege | undefined> {
    return db('principals')
      .join('colleges', 'principals.college_id', 'colleges.id')
      .where('principals.email', email)
      .where('principals.is_active', true)
      .select(
        'principals.*',
        'colleges.name as college_name',
        'colleges.code as college_code',
        'colleges.city as college_city'
      )
      .first();
  }

  static async getByCollege(collegeId: number): Promise<PrincipalWithCollege[]> {
    return db('principals')
      .join('colleges', 'principals.college_id', 'colleges.id')
      .where('principals.college_id', collegeId)
      .where('principals.is_active', true)
      .select(
        'principals.*',
        'colleges.name as college_name',
        'colleges.code as college_code',
        'colleges.city as college_city'
      );
  }

  static async getByCollegeName(collegeName: string): Promise<PrincipalWithCollege[]> {
    return db('principals')
      .join('colleges', 'principals.college_id', 'colleges.id')
      .where('colleges.name', 'like', `%${collegeName}%`)
      .where('principals.is_active', true)
      .select(
        'principals.*',
        'colleges.name as college_name',
        'colleges.code as college_code',
        'colleges.city as college_city'
      );
  }

  static async create(principal: Principal): Promise<PrincipalWithCollege | undefined> {
    const [id] = await db('principals').insert(principal);
    return this.getById(id);
  }

  static async update(id: number, principal: Partial<Principal>): Promise<PrincipalWithCollege | undefined> {
    await db('principals').where({ id }).update({
      ...principal,
      updated_at: db.fn.now()
    });
    return this.getById(id);
  }

  static async delete(id: number): Promise<number> {
    return db('principals').where({ id }).update({ is_active: false });
  }

  static async hardDelete(id: number): Promise<number> {
    return db('principals').where({ id }).delete();
  }
}
