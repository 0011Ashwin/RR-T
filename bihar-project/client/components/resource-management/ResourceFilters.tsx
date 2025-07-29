import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter, Search, X } from 'lucide-react';
import { RESOURCE_TYPES } from './types';
import type { Department } from './types';

export interface FilterState {
  resourceType: string;
  department: string;
  status: string;
  search: string;
  capacity: string;
  building: string;
  week: number;
}

interface ResourceFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  departments: Department[];
  buildings?: string[];
  showAdvancedFilters?: boolean;
  className?: string;
}

export default function ResourceFilters({
  filters,
  onFiltersChange,
  departments,
  buildings = [],
  showAdvancedFilters = false,
  className = ''
}: ResourceFiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    onFiltersChange({ [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      resourceType: 'all',
      department: 'all',
      status: 'all',
      search: '',
      capacity: '',
      building: 'all',
      week: 0
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'week' && value === 0) return false;
    if (typeof value === 'string' && (value === 'all' || value === '')) return false;
    return true;
  }).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-indigo-600" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Search Resources
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Resource Type */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Resource Type
              </label>
              <Select 
                value={filters.resourceType} 
                onValueChange={(value) => handleFilterChange('resourceType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {RESOURCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Department
              </label>
              <Select 
                value={filters.department} 
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Week Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Time Period
              </label>
              <Select 
                value={filters.week.toString()} 
                onValueChange={(value) => handleFilterChange('week', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">Last Week</SelectItem>
                  <SelectItem value="0">Current Week</SelectItem>
                  <SelectItem value="1">Next Week</SelectItem>
                  <SelectItem value="2">Week After Next</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Advanced Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Availability Status
                  </label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="pending">Pending Requests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Minimum Capacity
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={filters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                  />
                </div>

                {/* Building */}
                {buildings.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Building
                    </label>
                    <Select 
                      value={filters.building} 
                      onValueChange={(value) => handleFilterChange('building', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Buildings</SelectItem>
                        {buildings.map((building) => (
                          <SelectItem key={building} value={building}>
                            {building}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={filters.status === 'available' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('status', filters.status === 'available' ? 'all' : 'available')}
              className="text-xs"
            >
              Available Now
            </Button>
            <Button
              variant={filters.resourceType === 'classroom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('resourceType', filters.resourceType === 'classroom' ? 'all' : 'classroom')}
              className="text-xs"
            >
              Classrooms
            </Button>
            <Button
              variant={filters.resourceType === 'lab' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('resourceType', filters.resourceType === 'lab' ? 'all' : 'lab')}
              className="text-xs"
            >
              Labs
            </Button>
            <Button
              variant={filters.capacity !== '' && parseInt(filters.capacity) >= 100 ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('capacity', filters.capacity !== '' && parseInt(filters.capacity) >= 100 ? '' : '100')}
              className="text-xs"
            >
              Large (100+)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
