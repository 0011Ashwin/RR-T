import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  Filter,
  Building2,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Archive,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import ResourceFilters, { type FilterState } from './ResourceFilters';
import { exportResourceList } from './exportUtils';
import { RESOURCE_TYPES } from './types';
import type { Resource, Department } from './types';

const mockDepartments: Department[] = [
  { id: 'cs', name: 'Computer Science', code: 'CS', head: 'Dr. Rajesh Kumar Singh', color: '#3B82F6' },
  { id: 'math', name: 'Mathematics', code: 'MATH', head: 'Dr. Priya Sharma', color: '#10B981' },
  { id: 'physics', name: 'Physics', code: 'PHY', head: 'Dr. Amit Singh', color: '#8B5CF6' },
  { id: 'chemistry', name: 'Chemistry', code: 'CHEM', head: 'Dr. Neha Gupta', color: '#F59E0B' },
  { id: 'english', name: 'English', code: 'ENG', head: 'Dr. Sunita Rani', color: '#EF4444' },
  { id: 'admin', name: 'Administration', code: 'ADMIN', head: 'Dr. Admin Head', color: '#6366F1' },
];

const mockResources: Resource[] = [
  {
    id: 'r-1',
    name: 'CS Lab 1',
    type: 'lab',
    capacity: 60,
    owningDepartment: 'Computer Science',
    building: 'CS Block',
    floor: 2,
    location: '2nd Floor, CS Block, Room 201',
    equipment: ['Desktop Computers (60)', 'Projector', 'Whiteboard', 'Software Lab', 'Network Switch'],
    facilities: ['AC', 'High-Speed Internet', 'Power Backup', 'CCTV Surveillance'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'r-2',
    name: 'Main Auditorium',
    type: 'auditorium',
    capacity: 500,
    owningDepartment: 'Administration',
    building: 'Main Block',
    floor: 1,
    location: 'Ground Floor, Main Building',
    equipment: ['Sound System', 'Projector', 'Microphone', 'Stage Lighting', 'LED Screen'],
    facilities: ['AC', 'Recording Equipment', 'Live Streaming', 'Green Room', 'Parking'],
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'r-3',
    name: 'Seminar Hall A',
    type: 'seminar_hall',
    capacity: 100,
    owningDepartment: 'Administration',
    building: 'Academic Block A',
    floor: 1,
    location: '1st Floor, Academic Block A',
    equipment: ['Smart Board', 'Projector', 'Sound System', 'Video Conferencing'],
    facilities: ['AC', 'Recording', 'Live Streaming', 'Wi-Fi'],
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'r-4',
    name: 'Physics Lab',
    type: 'lab',
    capacity: 45,
    owningDepartment: 'Physics',
    building: 'Science Block',
    floor: 3,
    location: '3rd Floor, Science Block',
    equipment: ['Lab Equipment', 'Microscopes', 'Safety Equipment', 'Digital Scale'],
    facilities: ['Fume Hoods', 'Safety Features', 'Emergency Shower', 'Fire Safety'],
    isActive: true,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'r-5',
    name: 'Old Conference Room',
    type: 'conference_room',
    capacity: 30,
    owningDepartment: 'Administration',
    building: 'Old Building',
    floor: 2,
    location: '2nd Floor, Old Building',
    equipment: ['Old Projector', 'Conference Table'],
    facilities: ['Basic AC'],
    isActive: false,
    createdAt: '2023-01-12T00:00:00Z',
    updatedAt: '2023-06-22T00:00:00Z'
  }
];

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [filters, setFilters] = useState<FilterState>({
    resourceType: 'all',
    department: 'all',
    status: 'all',
    search: '',
    capacity: '',
    building: 'all',
    week: 0
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: 'classroom' as Resource['type'],
    capacity: '',
    owningDepartment: '',
    building: '',
    floor: '',
    location: '',
    equipment: [] as string[],
    facilities: [] as string[],
    isActive: true
  });

  // Define as a string to allow comparison with any department name
  const currentUserDepartment: string = 'Computer Science'; // This would come from user context

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      if (filters.search && !resource.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.resourceType !== 'all' && resource.type !== filters.resourceType) {
        return false;
      }
      if (filters.department !== 'all' && resource.owningDepartment !== mockDepartments.find(d => d.id === filters.department)?.name) {
        return false;
      }
      if (filters.status !== 'all') {
        if (filters.status === 'active' && !resource.isActive) return false;
        if (filters.status === 'inactive' && resource.isActive) return false;
      }
      if (filters.capacity && resource.capacity < parseInt(filters.capacity)) {
        return false;
      }
      if (filters.building !== 'all' && resource.building !== filters.building) {
        return false;
      }
      return true;
    });
  }, [resources, filters]);

  const handleCreateResource = () => {
    const newResource: Resource = {
      id: `r-${Date.now()}`,
      name: resourceForm.name,
      type: resourceForm.type,
      capacity: parseInt(resourceForm.capacity),
      owningDepartment: resourceForm.owningDepartment,
      building: resourceForm.building,
      floor: resourceForm.floor ? parseInt(resourceForm.floor) : undefined,
      location: resourceForm.location,
      equipment: resourceForm.equipment,
      facilities: resourceForm.facilities,
      isActive: resourceForm.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setResources(prev => [...prev, newResource]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditResource = () => {
    if (!selectedResource) return;

    const updatedResource: Resource = {
      ...selectedResource,
      name: resourceForm.name,
      type: resourceForm.type,
      capacity: parseInt(resourceForm.capacity),
      owningDepartment: resourceForm.owningDepartment,
      building: resourceForm.building,
      floor: resourceForm.floor ? parseInt(resourceForm.floor) : undefined,
      location: resourceForm.location,
      equipment: resourceForm.equipment,
      facilities: resourceForm.facilities,
      isActive: resourceForm.isActive,
      updatedAt: new Date().toISOString()
    };

    setResources(prev => prev.map(r => r.id === selectedResource.id ? updatedResource : r));
    setIsEditDialogOpen(false);
    setSelectedResource(null);
    resetForm();
  };

  const handleDeleteResource = () => {
    if (!selectedResource) return;

    setResources(prev => prev.filter(r => r.id !== selectedResource.id));
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedResource(null);
    resetForm();
  };

  const handleToggleStatus = (resource: Resource) => {
    setResources(prev => prev.map(r => 
      r.id === resource.id 
        ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString() }
        : r
    ));
  };

  const handleDuplicateResource = (resource: Resource) => {
    const duplicatedResource: Resource = {
      ...resource,
      id: `r-${Date.now()}`,
      name: `${resource.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setResources(prev => [...prev, duplicatedResource]);
  };

  const openEditDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setResourceForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity.toString(),
      owningDepartment: resource.owningDepartment,
      building: resource.building || '',
      floor: resource.floor?.toString() || '',
      location: resource.location || '',
      equipment: [...resource.equipment],
      facilities: [...resource.facilities],
      isActive: resource.isActive
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setResourceForm({
      name: '',
      type: 'classroom',
      capacity: '',
      owningDepartment: '',
      building: '',
      floor: '',
      location: '',
      equipment: [],
      facilities: [],
      isActive: true
    });
  };

  const addEquipmentItem = (item: string) => {
    if (item && !resourceForm.equipment.includes(item)) {
      setResourceForm(prev => ({
        ...prev,
        equipment: [...prev.equipment, item]
      }));
    }
  };

  const removeEquipmentItem = (index: number) => {
    setResourceForm(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const addFacilityItem = (item: string) => {
    if (item && !resourceForm.facilities.includes(item)) {
      setResourceForm(prev => ({
        ...prev,
        facilities: [...prev.facilities, item]
      }));
    }
  };

  const removeFacilityItem = (index: number) => {
    setResourceForm(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const getResourceIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find(rt => rt.value === type);
    return resourceType?.icon || 'Building2';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const canEditResource = (resource: Resource) => {
    // Check if the resource is owned by the current user's department or if the user is an admin
    return resource.owningDepartment === currentUserDepartment || currentUserDepartment === 'Administration';
  };

  const resourceStats = {
    total: resources.length,
    active: resources.filter(r => r.isActive).length,
    inactive: resources.filter(r => !r.isActive).length,
    myDepartment: resources.filter(r => r.owningDepartment === currentUserDepartment).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Settings className="h-6 w-6 mr-3 text-indigo-600" />
            Resource Management
          </h2>
          <p className="text-slate-600">Add, edit, and manage institutional resources</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportResourceList(filteredResources)}>
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Resources</p>
                <p className="text-2xl font-bold text-slate-900">{resourceStats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Resources</p>
                <p className="text-2xl font-bold text-slate-900">{resourceStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inactive Resources</p>
                <p className="text-2xl font-bold text-slate-900">{resourceStats.inactive}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">My Department</p>
                <p className="text-2xl font-bold text-slate-900">{resourceStats.myDepartment}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ResourceFilters
        filters={filters}
        onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
        departments={mockDepartments}
        buildings={[...new Set(resources.map(r => r.building).filter(Boolean))]}
        showAdvancedFilters={true}
      />

      {/* Main Content */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Card View
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                          {resource.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {resource.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1 text-slate-400" />
                          {resource.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{resource.owningDepartment}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                          <span className="text-sm">{resource.building}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(resource.isActive)}>
                          {resource.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{resource.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Basic Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div>Type: {resource.type.replace('_', ' ')}</div>
                                      <div>Capacity: {resource.capacity}</div>
                                      <div>Department: {resource.owningDepartment}</div>
                                      <div>Location: {resource.location}</div>
                                      <div>Status: {resource.isActive ? 'Active' : 'Inactive'}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Facilities</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {resource.facilities.map((facility, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {facility}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-700 mb-2">Equipment</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {resource.equipment.map((item, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-xs text-slate-500">
                                  Created: {new Date(resource.createdAt).toLocaleDateString()} • 
                                  Updated: {new Date(resource.updatedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {canEditResource(resource) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(resource)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDuplicateResource(resource)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleToggleStatus(resource)}
                              >
                                {resource.isActive ? <Archive className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card View */}
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <Badge className={getStatusColor(resource.isActive)}>
                      {resource.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="w-fit capitalize">
                    {resource.type.replace('_', ' ')}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity: {resource.capacity}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {resource.building} {resource.floor && `• Floor ${resource.floor}`}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      {resource.owningDepartment}
                    </div>
                  </div>

                  {resource.equipment.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Equipment</h4>
                      <div className="flex flex-wrap gap-1">
                        {resource.equipment.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {resource.equipment.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{resource.equipment.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{resource.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-slate-700 mb-2">Basic Information</h4>
                              <div className="space-y-1 text-sm">
                                <div>Type: {resource.type.replace('_', ' ')}</div>
                                <div>Capacity: {resource.capacity}</div>
                                <div>Department: {resource.owningDepartment}</div>
                                <div>Location: {resource.location}</div>
                                <div>Status: {resource.isActive ? 'Active' : 'Inactive'}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-700 mb-2">Facilities</h4>
                              <div className="flex flex-wrap gap-1">
                                {resource.facilities.map((facility, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {facility}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Equipment</h4>
                            <div className="flex flex-wrap gap-1">
                              {resource.equipment.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {canEditResource(resource) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Resource Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedResource(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Add New Resource' : 'Edit Resource'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Resource Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., CS Lab 1"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Resource Type *</Label>
                <Select 
                  value={resourceForm.type} 
                  onValueChange={(value: Resource['type']) => setResourceForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 60"
                  value={resourceForm.capacity}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="department">Owning Department *</Label>
                <Select 
                  value={resourceForm.owningDepartment} 
                  onValueChange={(value) => setResourceForm(prev => ({ ...prev, owningDepartment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="building">Building</Label>
                <Input
                  id="building"
                  placeholder="e.g., CS Block"
                  value={resourceForm.building}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, building: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="e.g., 2"
                  value={resourceForm.floor}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, floor: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Full Location</Label>
              <Textarea
                id="location"
                placeholder="e.g., 2nd Floor, CS Block, Room 201"
                value={resourceForm.location}
                onChange={(e) => setResourceForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Equipment */}
            <div>
              <Label>Equipment</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add equipment item"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addEquipmentItem(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addEquipmentItem(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resourceForm.equipment.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipmentItem(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <Label>Facilities</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add facility"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFacilityItem(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addFacilityItem(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resourceForm.facilities.map((item, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFacilityItem(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={resourceForm.isActive}
                onCheckedChange={(checked) => setResourceForm(prev => ({ ...prev, isActive: checked as boolean }))}
              />
              <Label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Resource is active and available for booking
              </Label>
            </div>

            <div className="flex justify-between">
              <div>
                {isEditDialogOpen && selectedResource && canEditResource(selectedResource) && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Resource
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedResource(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={isCreateDialogOpen ? handleCreateResource : handleEditResource}
                  disabled={!resourceForm.name || !resourceForm.capacity || !resourceForm.owningDepartment}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isCreateDialogOpen ? 'Create Resource' : 'Update Resource'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedResource?.name}"? This action cannot be undone.
              All schedules and bookings related to this resource will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResource} className="bg-red-600 hover:bg-red-700">
              Delete Resource
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
