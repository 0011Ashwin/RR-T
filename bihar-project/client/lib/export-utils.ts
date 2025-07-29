import { Routine, ClassSession, Course, Resource, DEFAULT_TIME_SLOTS, BookingRequest } from '../../shared/resource-types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface ExportData {
  routine?: Routine;
  sessions?: ClassSession[];
  courses?: Course[];
  resources?: Resource[];
  bookingRequests?: BookingRequest[];
}

// Generate CSV content for routine export
export const generateRoutineCSV = (data: ExportData): string => {
  if (!data.routine || !data.sessions || !data.courses || !data.resources) {
    throw new Error('Missing required data for routine export');
  }

  const { routine, sessions, courses, resources } = data;
  
  // Create header
  const headers = ['Day', 'Time Slot', 'Course Code', 'Course Name', 'Faculty', 'Resource', 'Type', 'Students'];
  let csvContent = headers.join(',') + '\n';

  // Add sessions data
  sessions
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      const timeA = DEFAULT_TIME_SLOTS.find(t => t.id === a.timeSlotId)?.startTime || '';
      const timeB = DEFAULT_TIME_SLOTS.find(t => t.id === b.timeSlotId)?.startTime || '';
      return timeA.localeCompare(timeB);
    })
    .forEach(session => {
      const course = courses.find(c => c.id === session.courseId);
      const resource = resources.find(r => r.id === session.resourceId);
      const timeSlot = DEFAULT_TIME_SLOTS.find(t => t.id === session.timeSlotId);
      
      if (course && resource && timeSlot) {
        const row = [
          DAYS[session.dayOfWeek],
          timeSlot.label,
          course.code,
          `"${course.name}"`, // Quotes to handle commas in course names
          `"${session.faculty}"`,
          `"${resource.name}"`,
          session.type,
          course.expectedSize.toString()
        ];
        csvContent += row.join(',') + '\n';
      }
    });

  return csvContent;
};

// Generate CSV content for resources export
export const generateResourcesCSV = (resources: Resource[]): string => {
  const headers = ['Name', 'Type', 'Capacity', 'Department', 'Location', 'Facilities', 'Shared', 'Status'];
  let csvContent = headers.join(',') + '\n';

  resources.forEach(resource => {
    const row = [
      `"${resource.name}"`,
      resource.type.replace('_', ' '),
      resource.capacity.toString(),
      `"${resource.department}"`,
      `"${resource.location || ''}"`,
      `"${(resource.facilities || []).join('; ')}"`,
      resource.isShared ? 'Yes' : 'No',
      resource.isActive ? 'Active' : 'Inactive'
    ];
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
};

// Generate CSV content for booking requests export
export const generateBookingRequestsCSV = (bookingRequests: BookingRequest[]): string => {
  const headers = [
    'Request ID',
    'Requester ID',
    'Target Resource ID',
    'Status',
    'Request Date',
    'Approved By',
    'Notes',
    'VC Approved',
    'VC Response Date'
  ];
  let csvContent = headers.join(',') + '\n';

  bookingRequests.forEach(request => {
    const row = [
      request.id.toString(),
      request.requesterId.toString(),
      request.targetResourceId.toString(),
      request.status,
      new Date(request.requestDate).toLocaleDateString(),
      request.approvedBy || '',
      `"${request.notes || ''}"`,
      request.vcApproved ? 'Yes' : 'No',
      request.vcResponseDate ? new Date(request.vcResponseDate).toLocaleDateString() : ''
    ];
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generate HTML table for PDF printing
export const generateRoutineHTML = (data: ExportData): string => {
  if (!data.routine || !data.sessions || !data.courses || !data.resources) {
    throw new Error('Missing required data for routine export');
  }

  const { routine, sessions, courses, resources } = data;

  // Create time slot grid
  const weekDays = DAYS.slice(1, 6); // Monday to Friday
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${routine.name} - Class Routine</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          font-size: 12px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          color: #333;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: center;
          vertical-align: top;
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold;
        }
        .time-slot {
          background-color: #f9f9f9;
          font-weight: bold;
          white-space: nowrap;
        }
        .class-cell {
          min-height: 60px;
          padding: 5px;
          font-size: 10px;
        }
        .course-name {
          font-weight: bold;
          color: #333;
        }
        .course-code {
          color: #666;
          font-size: 9px;
        }
        .faculty {
          color: #444;
          font-size: 9px;
        }
        .resource {
          color: #666;
          font-size: 8px;
        }
        .type-badge {
          display: inline-block;
          padding: 1px 4px;
          background-color: #e3f2fd;
          border-radius: 3px;
          font-size: 8px;
          margin-top: 2px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body { margin: 0; font-size: 10px; }
          .header h1 { font-size: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${routine.name}</h1>
        <p>Department: ${routine.department} | Academic Year: ${routine.academicYear}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th class="time-slot">Time</th>
  `;

  weekDays.forEach(day => {
    htmlContent += `<th>${day}</th>`;
  });

  htmlContent += `
          </tr>
        </thead>
        <tbody>
  `;

  DEFAULT_TIME_SLOTS.forEach(timeSlot => {
    htmlContent += `
          <tr>
            <td class="time-slot">${timeSlot.label}</td>
    `;

    [1, 2, 3, 4, 5].forEach(dayIndex => {
      const session = sessions.find(s => 
        s.timeSlotId === timeSlot.id && s.dayOfWeek === dayIndex
      );
      
      if (session) {
        const course = courses.find(c => c.id === session.courseId);
        const resource = resources.find(r => r.id === session.resourceId);
        
        if (course && resource) {
          htmlContent += `
            <td class="class-cell">
              <div class="course-name">${course.name}</div>
              <div class="course-code">${course.code}</div>
              <div class="faculty">${session.faculty}</div>
              <div class="resource">${resource.name}</div>
              <div class="type-badge">${session.type}</div>
            </td>
          `;
        } else {
          htmlContent += `<td class="class-cell">-</td>`;
        }
      } else {
        htmlContent += `<td class="class-cell">-</td>`;
      }
    });

    htmlContent += `</tr>`;
  });

  htmlContent += `
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>Legend:</strong> Course Name (Course Code) | Faculty | Resource | Type</p>
        <p>Total Classes: ${sessions.length} | Total Courses: ${courses.length}</p>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

// Print HTML content (for PDF generation)
export const printHTML = (htmlContent: string): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
};

// Generate resources HTML for printing
export const generateResourcesHTML = (resources: Resource[], title: string = 'Resources List'): string => {
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          font-size: 12px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold;
        }
        .status-active { color: #28a745; }
        .status-inactive { color: #dc3545; }
        .shared-yes { color: #007bff; }
        .type-badge {
          display: inline-block;
          padding: 2px 6px;
          background-color: #e9ecef;
          border-radius: 3px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Resource Name</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Department</th>
            <th>Location</th>
            <th>Facilities</th>
            <th>Shared</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  resources.forEach(resource => {
    htmlContent += `
          <tr>
            <td><strong>${resource.name}</strong></td>
            <td><span class="type-badge">${resource.type.replace('_', ' ')}</span></td>
            <td>${resource.capacity}</td>
            <td>${resource.department}</td>
            <td>${resource.location || '-'}</td>
            <td>${(resource.facilities || []).join(', ') || '-'}</td>
            <td class="${resource.isShared ? 'shared-yes' : ''}">${resource.isShared ? 'Yes' : 'No'}</td>
            <td class="${resource.isActive ? 'status-active' : 'status-inactive'}">${resource.isActive ? 'Active' : 'Inactive'}</td>
          </tr>
    `;
  });

  htmlContent += `
        </tbody>
      </table>
      
      <div style="margin-top: 20px; font-size: 10px; color: #666;">
        <p>Total Resources: ${resources.length}</p>
        <p>Active Resources: ${resources.filter(r => r.isActive).length}</p>
        <p>Shared Resources: ${resources.filter(r => r.isShared).length}</p>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

// Main export functions that can be called from components
export const exportRoutine = {
  toPDF: (data: ExportData) => {
    const htmlContent = generateRoutineHTML(data);
    printHTML(htmlContent);
  },
  
  toCSV: (data: ExportData, filename?: string) => {
    const csvContent = generateRoutineCSV(data);
    const name = filename || `routine-${data.routine?.name?.replace(/\s+/g, '-') || 'export'}`;
    downloadCSV(csvContent, name);
  }
};

export const exportResources = {
  toPDF: (resources: Resource[], title?: string) => {
    const htmlContent = generateResourcesHTML(resources, title);
    printHTML(htmlContent);
  },
  
  toCSV: (resources: Resource[], filename?: string) => {
    const csvContent = generateResourcesCSV(resources);
    const name = filename || 'resources-export';
    downloadCSV(csvContent, name);
  }
};
