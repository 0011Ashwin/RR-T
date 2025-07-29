import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { Resource } from '../../shared/resource-types';
import { 
  Building2,
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
  Filter,
  MapPin,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const RESOURCE_TYPES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'seminar_hall', label: 'Seminar Hall' },
  { value: 'conference_room', label: 'Conference Room' },
];

const COMMON_FACILITIES = [
  'Projector', 'Smart Board', 'Whiteboard', 'AC', 'Audio System', 
  'Video Conferencing', 'Internet', 'Computers', 'Lab Equipment',
  'Stage', 'Microphone', 'Tables', 'Chairs', 'Storage'
];

export default function ResourceManagement() {
  const { currentHOD, allHODs } = useHODAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: '' as Resource['type'] | '',
    capacity: '',
    department: '',
    location: '',
    facilities: [] as string[],
    isShared: false,
    customFacility: '',
  });

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setResources(data);
        setFilteredResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setErrors(['Failed to load resources. Please try again later.']);
      }
    };
    fetchResources();
  }, []);

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(resource => resource.type === filterType);
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(resource => resource.department === filterDepartment);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, filterType, filterDepartment]);

  const openEditDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setResourceForm({
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity.toString(),
        department: resource.department,
        location: resource.location || '',
        facilities: resource.facilities || [],
        isShared: resource.isShared,
        customFacility: '',
      });
    } else {
      setEditingResource(null);
      setResourceForm({
        name: '',
        type: '',
        capacity: '',
        department: currentHOD?.department || '',
        location: '',
        facilities: [],
        isShared: false,
        customFacility: '',
      });
    }
    setErrors([]);
    setEditDialogOpen(true);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!resourceForm.name.trim()) {
      errors.push('Resource name is required');
    }

    if (!resourceForm.type) {
      errors.push('Resource type is required');
    }

    if (!resourceForm.capacity || parseInt(resourceForm.capacity) <= 0) {
      errors.push('Valid capacity is required');
    }

    if (!resourceForm.department.trim()) {
      errors.push('Department is required');
    }

    // Check for duplicate names within the same department
    const existingResource = resources.find(r => 
      r.name.toLowerCase() === resourceForm.name.toLowerCase() &&
      r.department === resourceForm.department &&
      r.id !== editingResource?.id
    );

    if (existingResource) {
      errors.push('A resource with this name already exists in the department');
    }

    return errors;
  };

  const saveResource = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'> = {
      name: resourceForm.name.trim(),
      type: resourceForm.type as Resource['type'],
      capacity: parseInt(resourceForm.capacity),
      department: resourceForm.department.trim(),
      location: resourceForm.location.trim() || undefined,
      facilities: resourceForm.facilities.length > 0 ? resourceForm.facilities : undefined,
      isShared: resourceForm.isShared,
      isActive: true,
    };

    if (editingResource) {
      // Update existing resource
      const updatedResource: Resource = {
        ...resourceData,
        id: editingResource.id,
        createdAt: editingResource.createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      try {
        const response = await fetch(`/api/resources/${editingResource.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedResource),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedResourceFromServer = await response.json();
        setResources(prev => prev.map(r => r.id === updatedResourceFromServer.id ? updatedResourceFromServer : r));
        setErrors([]);
      } catch (error) {
        console.error('Error updating resource:', error);
        setErrors(['Failed to update resource. Please try again.']);
        return;
      }
    } else {
      // Create new resource via API
      try {
        const response = await fetch('/api/resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resourceData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newResource = await response.json();
        setResources(prev => [...prev, newResource]);
        setErrors([]); // Clear errors on success
      } catch (error) {
        console.error('Error creating resource:', error);
        setErrors(['Failed to create resource. Please try again.']);
        return; // Prevent dialog from closing on error
      }
    }

    setEditDialogOpen(false);
  };

  const deleteResource = async (resource: Resource) => {
    if (resource.department !== currentHOD?.department && !resource.isShared) {
      alert('You can only delete resources from your own department.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      try {
        const response = await fetch(`/api/resources/${resource.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setResources(prev => prev.filter(r => r.id !== resource.id));
        setErrors([]);
      } catch (error) {
        console.error('Error deleting resource:', error);
        setErrors(['Failed to delete resource. Please try again.']);
      }
    }
  };

  const toggleResourceStatus = async (resource: Resource) => {
    const updatedResource = {
      ...resource,
      isActive: !resource.isActive,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedResource),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedResourceFromServer = await response.json();
      setResources(prev => prev.map(r => r.id === updatedResourceFromServer.id ? updatedResourceFromServer : r));
      setErrors([]);
    } catch (error) {
      console.error('Error toggling resource status:', error);
      setErrors(['Failed to update resource status. Please try again.']);
    }
  };

  const addFacility = () => {
    if (resourceForm.customFacility && !resourceForm.facilities.includes(resourceForm.customFacility)) {
      setResourceForm(prev => ({
        ...prev,
        facilities: [...prev.facilities, prev.customFacility],
        customFacility: '',
      }));
    }
  };

  const removeFacility = (facility: string) => {
    setResourceForm(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility),
    }));
  };

  const toggleFacility = (facility: string) => {
    if (resourceForm.facilities.includes(facility)) {
      removeFacility(facility);
    } else {
      setResourceForm(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility],
      }));
    }
  };

  const getResourceTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'classroom':
        return <Building2 className="h-4 w-4" />;
      case 'lab':
        return <Settings className="h-4 w-4" />;
      case 'seminar_hall':
        return <Users className="h-4 w-4" />;
      case 'conference_room':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const canEditResource = (resource: Resource) => {
    return resource.department === currentHOD?.department || resource.isShared;
  };

  const uniqueDepartments = [...new Set(resources.map(r => r.department))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
          <p className="text-slate-600 mt-1">Manage physical resources and facilities</p>
        </div>
        <Button onClick={() => openEditDialog()} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Resources</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Resource Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {RESOURCE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterDepartment('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getResourceTypeIcon(resource.type)}
                  <div>
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <p className="text-sm text-slate-600">{resource.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {resource.isShared && (
                    <Badge variant="secondary" className="text-xs">
                      Shared
                    </Badge>
                  )}
                  <Badge variant={resource.isActive ? 'default' : 'destructive'} className="text-xs">
                    {resource.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-slate-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Capacity: {resource.capacity}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="capitalize">{resource.type.replace('_', ' ')}</span>
                </div>
              </div>

              {resource.location && (
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {resource.location}
                </div>
              )}

              {resource.facilities && resource.facilities.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-700 mb-2">Facilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {resource.facilities.slice(0, 4).map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {resource.facilities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{resource.facilities.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  {canEditResource(resource) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleResourceStatus(resource)}
                        className={resource.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {resource.isActive ? (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
                
                {canEditResource(resource) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteResource(resource)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No resources found</h3>
            <p className="text-slate-600 mb-4">
              No resources match your current search and filter criteria.
            </p>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Resource
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Resource Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resourceName">Resource Name *</Label>
                <Input
                  id="resourceName"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Lab A"
                />
              </div>
              
              <div>
                <Label htmlFor="resourceType">Type *</Label>
                <Select
                  value={resourceForm.type}
                  onValueChange={(value: Resource['type']) => setResourceForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={resourceForm.capacity}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Number of seats"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={resourceForm.department}
                  onValueChange={(value) => setResourceForm(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="University">University (Shared)</SelectItem>
                    {allHODs.map(hod => (
                      <SelectItem key={hod.department} value={hod.department}>
                        {hod.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={resourceForm.location}
                onChange={(e) => setResourceForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Ground Floor, Computer Science Building"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isShared"
                checked={resourceForm.isShared}
                onCheckedChange={(checked) => setResourceForm(prev => ({ ...prev, isShared: checked }))}
              />
              <Label htmlFor="isShared">
                Shared Resource (Available for booking by other departments)
              </Label>
            </div>

            <div>
              <Label>Facilities</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {COMMON_FACILITIES.map(facility => (
                    <Badge
                      key={facility}
                      variant={resourceForm.facilities.includes(facility) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFacility(facility)}
                    >
                      {facility}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={resourceForm.customFacility}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, customFacility: e.target.value }))}
                    placeholder="Add custom facility"
                    onKeyPress={(e) => e.key === 'Enter' && addFacility()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFacility}
                    disabled={!resourceForm.customFacility}
                  >
                    Add
                  </Button>
                </div>

                {resourceForm.facilities.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Selected Facilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {resourceForm.facilities.map(facility => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {facility}
                          <button
                            type="button"
                            onClick={() => removeFacility(facility)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={saveResource} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingResource ? 'Update Resource' : 'Create Resource'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
