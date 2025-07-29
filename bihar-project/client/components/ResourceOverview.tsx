import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  University,
  School, 
  Settings,
  Building2,
  Calendar,
  MapPin
} from 'lucide-react';
import UniversityResources from './resource-management/UniversityResources';
import DepartmentResources from './resource-management/DepartmentResources';
import ResourceManagement from './resource-management/ResourceManagement';

export default function ResourceOverview() {
  const [activeTab, setActiveTab] = useState('university');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center mb-3">
          <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Resource Management Module
          </h1>
        </div>
        <p className="text-slate-600 text-lg">
          Comprehensive resource planning, allocation, and booking system
        </p>
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-slate-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Time-slot based scheduling</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Real-time availability</span>
          </div>
          <div className="flex items-center">
            <University className="h-4 w-4 mr-2" />
            <span>Cross-department access</span>
          </div>
        </div>
      </div>

      {/* Three Interconnected Pages */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-slate-200">
          <TabsTrigger
            value="university"
            className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex items-center space-x-2"
          >
            <University className="h-4 w-4" />
            <span>University Resources</span>
          </TabsTrigger>
          <TabsTrigger
            value="department"
            className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex items-center space-x-2"
          >
            <School className="h-4 w-4" />
            <span>Department Resources</span>
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Resource Management</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Descriptions */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          {activeTab === 'university' && (
            <div className="flex items-start space-x-3">
              <University className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">University Resources - Shared Access View</h3>
                <p className="text-sm text-slate-600 mt-1">
                  View all college-wide shared resources (seminar halls, conference rooms, auditoriums), 
                  see real-time availability, request bookings for resources owned by other departments, 
                  and track your booking request status.
                </p>
              </div>
            </div>
          )}
          {activeTab === 'department' && (
            <div className="flex items-start space-x-3">
              <School className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">Department Resources - Own Allocation View</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Manage resources owned by your department with drag-and-drop scheduling, 
                  allocate time slots to classes and faculty, view usage analytics, 
                  and optimize resource utilization.
                </p>
              </div>
            </div>
          )}
          {activeTab === 'management' && (
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">Resource Management - Add/Edit Resources</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Add new resources, edit existing ones, manage equipment and facilities, 
                  set ownership and access permissions, and export resource data for reporting.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* University Resources Tab - Shared Access View */}
        <TabsContent value="university" className="mt-6">
          <UniversityResources />
        </TabsContent>

        {/* Department Resources Tab - Own Allocation View */}
        <TabsContent value="department" className="mt-6">
          <DepartmentResources />
        </TabsContent>

        {/* Resource Management Tab - Add/Edit Resources */}
        <TabsContent value="management" className="mt-6">
          <ResourceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
