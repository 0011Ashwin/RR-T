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
      .join('departments', 'resources.department_id', 'departments.id')
      .select('resources.*', 'departments.name as department_name')
      .then(resources => {
        return resources.map(resource => ({
          ...resource,
          id: resource.id,
          name: resource.name,
          type: resource.type,
          department: resource.department_name,
          capacity: resource.capacity,
          description: resource.description,
          location: resource.location,
          isShared: resource.is_shared,
          isActive: resource.is_active,
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

  static async getByDepartmentName(departmentName: string) {
    return db('resources')
      .join('departments', 'resources.department_id', 'departments.id')
      .where('departments.name', departmentName)
      .select('resources.*', 'departments.name as department_name')
      .then(resources => {
        return resources.map(resource => ({
          ...resource,
          department: resource.department_name,
          isShared: resource.is_shared,
          isActive: resource.is_active,
          equipment: resource.equipment ? JSON.parse(resource.equipment as string) : [],
          facilities: resource.facilities ? JSON.parse(resource.facilities as string) : [],
        }));
      });
  }

  static async create(resource: Resource) {
    // Remove any manually provided ID to ensure database auto-increment is used
    const { id, ...resourceData } = resource;
    
    const resourceToInsert = {
      ...resourceData,
      equipment: resource.equipment ? JSON.stringify(resource.equipment) : null,
      facilities: resource.facilities ? JSON.stringify(resource.facilities) : null,
    };
    
    const [newId] = await db('resources').insert(resourceToInsert);
    return this.getById(newId);
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

  static async getSharedResources() {
    return db('resources')
      .join('departments', 'resources.department_id', 'departments.id')
      .where('resources.is_shared', true)
      .select('resources.*', 'departments.name as department_name')
      .then(resources => {
        return resources.map(resource => ({
          ...resource,
          department: resource.department_name,
          isShared: resource.is_shared,
          isActive: resource.is_active,
          equipment: resource.equipment ? JSON.parse(resource.equipment as string) : [],
          facilities: resource.facilities ? JSON.parse(resource.facilities as string) : [],
        }));
      });
  }
}