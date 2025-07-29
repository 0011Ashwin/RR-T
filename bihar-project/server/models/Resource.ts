import db from '../database/index.js';

export interface Resource {
  id?: number;
  name: string;
  type: string; // 'classroom', 'lab', 'equipment'
  capacity?: number;
  department_id?: number;
  building?: string;
  floor?: number;
  location?: string;
  equipment?: string[];
  facilities?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export class ResourceModel {
  static async getAll() {
    return db('resources')
      .select('*')
      .then(resources => {
        return resources.map(resource => ({
          ...resource,
          equipment: resource.equipment ? JSON.parse(resource.equipment as string) : [],
          facilities: resource.facilities ? JSON.parse(resource.facilities as string) : [],
        }));
      });
  }

  static async getById(id: number) {
    return db('resources')
      .where({ id })
      .first()
      .then(resource => {
        if (!resource) return null;
        return {
          ...resource,
          equipment: resource.equipment ? JSON.parse(resource.equipment as string) : [],
          facilities: resource.facilities ? JSON.parse(resource.facilities as string) : [],
        };
      });
  }

  static async getByDepartment(departmentId: number) {
    return db('resources')
      .where({ department_id: departmentId })
      .select('*')
      .then(resources => {
        return resources.map(resource => ({
          ...resource,
          equipment: resource.equipment ? JSON.parse(resource.equipment as string) : [],
          facilities: resource.facilities ? JSON.parse(resource.facilities as string) : [],
        }));
      });
  }

  static async create(resource: Resource) {
    const resourceToInsert = {
      ...resource,
      equipment: resource.equipment ? JSON.stringify(resource.equipment) : null,
      facilities: resource.facilities ? JSON.stringify(resource.facilities) : null,
    };
    
    const [id] = await db('resources').insert(resourceToInsert);
    return this.getById(id);
  }

  static async update(id: number, resource: Partial<Resource>) {
    const resourceToUpdate: any = { ...resource };
    
    if (resource.equipment) {
      resourceToUpdate.equipment = JSON.stringify(resource.equipment);
    }
    
    if (resource.facilities) {
      resourceToUpdate.facilities = JSON.stringify(resource.facilities);
    }
    
    await db('resources').where({ id }).update(resourceToUpdate);
    return this.getById(id);
  }

  static async delete(id: number) {
    return db('resources').where({ id }).delete();
  }

  static async getByType(type: string) {
    return db('resources')
      .where({ type })
      .select('*')
      .then(resources => {
        return resources.map(resource => ({
          ...resource,
          equipment: resource.equipment ? JSON.parse(resource.equipment as string) : [],
          facilities: resource.facilities ? JSON.parse(resource.facilities as string) : [],
        }));
      });
  }
}