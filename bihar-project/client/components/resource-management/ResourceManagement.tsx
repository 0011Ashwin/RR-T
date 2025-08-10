import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Resource } from '../../../shared/resource-types';
import { ResourceService } from '@/services/resource-service';

const RESOURCE_TYPES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'seminar_hall', label: 'Seminar Hall' },
  { value: 'conference_room', label: 'Conference Room' },
];

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics', 
  'Physics',
  'Chemistry',
  'English',
  'Geography',
  'Administration'
];

export default function ResourceManagement() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    type: 'classroom' as 'classroom' | 'lab' | 'seminar_hall' | 'conference_room',
    capacity: '',
    department: '',
    location: '',
    facilities: [] as string[],
    isShared: false,
  });

  // Load all resources from database
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const response = await ResourceService.getAllResources();
      if (response.success && response.data) {
        setResources(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load resources.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || resource.department === selectedDepartment;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesDepartment && matchesType;
  });

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity.toString(),
        department: resource.department,
        location: resource.location,
        facilities: resource.facilities || [],
        isShared: resource.isShared || false,
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        type: 'classroom',
        capacity: '',
        department: '',
        location: '',
        facilities: [],
        isShared: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSaveResource = async () => {
    if (!formData.name || !formData.department || !formData.capacity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const resourceData = {
        name: formData.name,
        type: formData.type,
        capacity: parseInt(formData.capacity),
        department: formData.department,
        location: formData.location,
        facilities: formData.facilities,
        isShared: formData.isShared,
        isActive: true,
      };

      let response;
      if (editingResource) {
        const updateData = { id: editingResource.id, ...resourceData };
        response = await ResourceService.updateResource(updateData);
      } else {
        response = await ResourceService.createResource(resourceData);
      }

      if (response.success) {
        await loadResources(); // Reload resources
        setDialogOpen(false);
        toast({
          title: "Success",
          description: `Resource ${editingResource ? 'updated' : 'created'} successfully!`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${editingResource ? 'update' : 'create'} resource.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingResource ? 'update' : 'create'} resource. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    if (!confirm(`Are you sure you want to delete ${resource.name}?`)) {
      return;
    }

    try {
      const response = await ResourceService.deleteResource(parseInt(resource.id!.toString()));
      
      if (response.success) {
        await loadResources(); // Reload resources
        toast({
          title: "Success",
          description: "Resource deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete resource.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (resource: Resource) => {
    try {
      const response = await ResourceService.toggleResourceStatus(parseInt(resource.id!.toString()), !resource.isActive);
      
      if (response.success) {
        await loadResources(); // Reload resources
        toast({
          title: "Success",
          description: `Resource ${resource.isActive ? 'deactivated' : 'activated'} successfully!`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update resource status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling resource status:', error);
      toast({
        title: "Error",
        description: "Failed to update resource status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
          <p className="text-slate-600">
            Manage university resources, facilities, and their allocations
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter resource name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
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
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Maximum capacity"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Textarea
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Building, floor, room number..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={formData.isShared}
                  onChange={(e) => setFormData(prev => ({ ...prev, isShared: e.target.checked }))}
                />
                <Label htmlFor="isShared">Shared University Resource</Label>
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={handleSaveResource} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingResource ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map(dept => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
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

      {/* Resources Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <p className="text-sm text-slate-600 capitalize">
                      {resource.type.replace('_', ' ')} • {resource.department}
                    </p>
                  </div>
                </div>
                <Badge variant={resource.isActive ? "default" : "secondary"}>
                  {resource.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="h-4 w-4 mr-2" />
                  Capacity: {resource.capacity}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {resource.location}
                </div>
                {resource.facilities && resource.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {resource.facilities.slice(0, 3).map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {resource.facilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{resource.facilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(resource)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(resource)}
                  >
                    {resource.isActive ? (
                      <XCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    {resource.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteResource(resource)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No resources found</h3>
          <p className="text-slate-600">
            {searchTerm || selectedDepartment !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first resource.'}
          </p>
        </div>
      )}
    </div>
  );
}
