import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin
} from 'lucide-react';
import { TIME_SLOTS, DAYS_OF_WEEK, STATUS_COLORS } from './types';
import type { Resource, TimeSlot } from './types';

interface TimeSlotCalendarProps {
  resources: Resource[];
  timeSlots: TimeSlot[];
  onSlotClick?: (resourceId: string, day: number, timeSlot: string) => void;
  showWeekNavigation?: boolean;
  viewMode?: 'week' | 'resource';
  selectedResourceId?: string;
  highlightAvailable?: boolean;
  showDetails?: boolean;
}

export default function TimeSlotCalendar({
  resources,
  timeSlots,
  onSlotClick,
  showWeekNavigation = true,
  viewMode = 'week',
  selectedResourceId,
  highlightAvailable = false,
  showDetails = true
}: TimeSlotCalendarProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const getWeekDates = (offset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (offset * 7));
    
    return DAYS_OF_WEEK.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates(currentWeekOffset);

  const getSlotForResourceAndTime = (resourceId: string, day: number, timeSlotStart: string) => {
    return timeSlots.find(slot => 
      slot.resourceId === resourceId && 
      slot.day === day && 
      slot.startTime === timeSlotStart
    );
  };

  const getSlotDisplay = (slot: TimeSlot | undefined, timeSlotLabel: string) => {
    if (!slot) {
      return {
        content: (
          <div className={`p-2 text-xs border border-dashed rounded transition-colors ${
            highlightAvailable 
              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' 
              : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}>
            <div className="font-medium">{timeSlotLabel}</div>
            <div className="text-xs mt-1">Available</div>
          </div>
        ),
        status: 'available' as const
      };
    }

    const statusColor = STATUS_COLORS[slot.status];
    
    return {
      content: (
        <div className={`p-2 text-xs rounded cursor-pointer transition-all hover:opacity-80 ${statusColor}`}>
          <div className="font-medium mb-1">{timeSlotLabel}</div>
          {showDetails && (
            <div className="space-y-1">
              <div className="font-semibold">{slot.department}</div>
              {slot.course && <div>{slot.course}</div>}
              {slot.className && <div>{slot.className}</div>}
              {slot.instructor && <div className="text-xs opacity-90">{slot.instructor}</div>}
              {slot.students && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {slot.students}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {slot.status}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      ),
      status: slot.status
    };
  };

  const filteredResources = selectedResourceId 
    ? resources.filter(r => r.id === selectedResourceId)
    : resources;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
            {viewMode === 'week' ? 'Weekly Schedule' : 'Resource Schedule'}
          </CardTitle>
          {showWeekNavigation && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-3">
                {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {currentWeekOffset !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentWeekOffset(0)}
                  className="text-indigo-600"
                >
                  Today
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[200px]">
                  Resource
                </th>
                {DAYS_OF_WEEK.map((day, index) => (
                  <th key={day.value} className="border border-slate-200 p-3 text-center font-semibold text-slate-700 min-w-[140px]">
                    <div>
                      <div>{day.label}</div>
                      <div className="text-xs text-slate-500 font-normal">
                        {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-slate-25">
                  <td className="border border-slate-200 p-3 font-medium text-slate-700 bg-slate-50">
                    <div className="space-y-2">
                      <div className="font-semibold">{resource.name}</div>
                      <div className="text-sm text-slate-600">
                        {resource.building && `${resource.building} • `}
                        {resource.floor && `Floor ${resource.floor}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Capacity: {resource.capacity}
                        </div>
                        {resource.location && (
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {resource.location}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {resource.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </td>
                  {DAYS_OF_WEEK.map((day) => (
                    <td key={day.value} className="border border-slate-200 p-2 align-top">
                      <div className="space-y-1">
                        {TIME_SLOTS.map((timeSlot) => {
                          const slot = getSlotForResourceAndTime(resource.id, day.value, timeSlot.start);
                          const { content, status } = getSlotDisplay(slot, timeSlot.label);
                          
                          return (
                            <div 
                              key={timeSlot.start}
                              className="relative"
                              onClick={() => onSlotClick?.(resource.id, day.value, timeSlot.start)}
                            >
                              {content}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Requested</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
