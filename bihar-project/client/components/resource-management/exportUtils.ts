import { DAYS_OF_WEEK, TIME_SLOTS } from './types';
import type { Resource, TimeSlot, BookingRequest } from './types';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportScheduleToPDF = async (
  resources: Resource[], 
  timeSlots: TimeSlot[], 
  weekOffset: number = 0
) => {
  // For now, we'll create a simple text-based representation
  // In a real implementation, you'd use a library like jsPDF or html2canvas
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  const weekDates = DAYS_OF_WEEK.map((_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
  });

  let content = `Resource Schedule Report\n`;
  content += `Week: ${weekDates[0].toLocaleDateString()} - ${weekDates[6].toLocaleDateString()}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n\n`;

  resources.forEach(resource => {
    content += `\n${resource.name} (${resource.type} - Capacity: ${resource.capacity})\n`;
    content += `${'='.repeat(50)}\n`;

    DAYS_OF_WEEK.forEach(day => {
      content += `\n${day.label} - ${weekDates[day.value].toLocaleDateString()}\n`;
      content += `${'-'.repeat(30)}\n`;

      TIME_SLOTS.forEach(timeSlot => {
        const slot = timeSlots.find(s => 
          s.resourceId === resource.id && 
          s.day === day.value && 
          s.startTime === timeSlot.start
        );

        if (slot) {
          content += `${timeSlot.label}: ${slot.department} - ${slot.course || 'N/A'}\n`;
          if (slot.instructor) content += `  Instructor: ${slot.instructor}\n`;
          if (slot.students) content += `  Students: ${slot.students}\n`;
          content += `  Status: ${slot.status}\n`;
        } else {
          content += `${timeSlot.label}: Available\n`;
        }
      });
    });
  });

  downloadFile(content, `resource_schedule_${weekDates[0].toISOString().split('T')[0]}.txt`, 'text/plain');
};

export const exportResourceList = (resources: Resource[]) => {
  const exportData = resources.map(resource => ({
    'Resource Name': resource.name,
    'Type': resource.type.replace('_', ' '),
    'Capacity': resource.capacity,
    'Department': resource.owningDepartment,
    'Building': resource.building || 'N/A',
    'Floor': resource.floor || 'N/A',
    'Location': resource.location || 'N/A',
    'Equipment': resource.equipment.join('; '),
    'Facilities': resource.facilities.join('; '),
    'Status': resource.isActive ? 'Active' : 'Inactive',
    'Created': new Date(resource.createdAt).toLocaleDateString(),
    'Updated': new Date(resource.updatedAt).toLocaleDateString()
  }));

  exportToCSV(exportData, `resources_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportBookingRequests = (requests: BookingRequest[]) => {
  const exportData = requests.map(request => ({
    'Request ID': request.id,
    'Resource': request.resourceName,
    'Requested By': request.requestedBy,
    'Department': request.requestedByDepartment,
    'Date': request.date,
    'Time': `${request.startTime} - ${request.endTime}`,
    'Purpose': request.purpose,
    'Expected Attendees': request.expectedAttendees,
    'Status': request.status,
    'Requested At': new Date(request.requestedAt).toLocaleString(),
    'Reviewed By': request.reviewedBy || 'N/A',
    'Reviewed At': request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : 'N/A',
    'Review Notes': request.reviewNotes || 'N/A'
  }));

  exportToCSV(exportData, `booking_requests_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportUtilizationReport = (resources: Resource[], timeSlots: TimeSlot[]) => {
  const utilizationData = resources.map(resource => {
    const totalSlots = DAYS_OF_WEEK.length * TIME_SLOTS.length;
    const occupiedSlots = timeSlots.filter(slot => 
      slot.resourceId === resource.id && 
      (slot.status === 'occupied' || slot.status === 'approved')
    ).length;
    
    const utilizationRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    return {
      'Resource Name': resource.name,
      'Type': resource.type.replace('_', ' '),
      'Department': resource.owningDepartment,
      'Capacity': resource.capacity,
      'Total Time Slots': totalSlots,
      'Occupied Slots': occupiedSlots,
      'Available Slots': totalSlots - occupiedSlots,
      'Utilization Rate (%)': utilizationRate.toFixed(2),
      'Status': resource.isActive ? 'Active' : 'Inactive'
    };
  });

  exportToCSV(utilizationData, `utilization_report_${new Date().toISOString().split('T')[0]}.csv`);
};

const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateWeeklyReport = (
  resources: Resource[], 
  timeSlots: TimeSlot[], 
  weekOffset: number = 0
) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weeklySlots = timeSlots.filter(slot => {
    const slotDate = new Date(startOfWeek);
    slotDate.setDate(startOfWeek.getDate() + slot.day);
    return slotDate >= startOfWeek && slotDate <= endOfWeek;
  });

  const reportData = {
    weekPeriod: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`,
    totalResources: resources.length,
    activeResources: resources.filter(r => r.isActive).length,
    totalTimeSlots: resources.length * DAYS_OF_WEEK.length * TIME_SLOTS.length,
    occupiedSlots: weeklySlots.filter(s => s.status === 'occupied' || s.status === 'approved').length,
    pendingRequests: weeklySlots.filter(s => s.status === 'pending').length,
    utilizationRate: 0
  };

  reportData.utilizationRate = reportData.totalTimeSlots > 0 
    ? (reportData.occupiedSlots / reportData.totalTimeSlots) * 100 
    : 0;

  return reportData;
};
