# SQLite Backend Implementation

## Overview

This backend implementation uses SQLite with Knex.js to provide a robust database solution for the timetable management, class allotment, and resource management system. The implementation is designed to be used by administrators and Heads of Departments (HODs) to manage departmental resources efficiently.

## Database Schema

The database consists of the following tables:

1. **departments** - Stores information about academic departments
2. **classrooms** - Manages classroom information including capacity and features
3. **faculty** - Contains faculty member details and their department associations
4. **subjects** - Stores subject information including credits and department associations
5. **timetables** - Manages timetable metadata
6. **timetable_entries** - Contains individual timetable entries with faculty, subject, and classroom assignments
7. **resources** - Tracks departmental resources including equipment and facilities
8. **classroom_bookings** - Manages classroom booking requests and approvals

## API Endpoints

### Department Management

- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `GET /api/departments/code/:code` - Get department by code
- `POST /api/departments` - Create a new department
- `PUT /api/departments/:id` - Update a department
- `DELETE /api/departments/:id` - Delete a department

### Classroom Management

- `GET /api/classrooms` - Get all classrooms
- `GET /api/classrooms/:id` - Get classroom by ID
- `GET /api/classrooms/department/:departmentId` - Get classrooms by department
- `POST /api/classrooms` - Create a new classroom
- `PUT /api/classrooms/:id` - Update a classroom
- `DELETE /api/classrooms/:id` - Delete a classroom

### Faculty Management

- `GET /api/faculty` - Get all faculty members
- `GET /api/faculty/:id` - Get faculty member by ID
- `GET /api/faculty/email/:email` - Get faculty member by email
- `GET /api/faculty/department/:departmentId` - Get faculty members by department
- `GET /api/faculty/:id/subjects` - Get faculty member with assigned subjects
- `POST /api/faculty` - Create a new faculty member
- `PUT /api/faculty/:id` - Update a faculty member
- `DELETE /api/faculty/:id` - Delete a faculty member

### Subject Management

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `GET /api/subjects/code/:code` - Get subject by code
- `GET /api/subjects/department/:departmentId` - Get subjects by department
- `GET /api/subjects/:id/faculty` - Get subject with assigned faculty
- `POST /api/subjects` - Create a new subject
- `PUT /api/subjects/:id` - Update a subject
- `DELETE /api/subjects/:id` - Delete a subject

### Timetable Management

- `GET /api/timetables` - Get all timetables
- `GET /api/timetables/:id` - Get timetable by ID
- `GET /api/timetables/department/:departmentId` - Get timetables by department
- `GET /api/timetables/:id/entries` - Get timetable entries
- `POST /api/timetables` - Create a new timetable
- `PUT /api/timetables/:id` - Update a timetable
- `DELETE /api/timetables/:id` - Delete a timetable
- `POST /api/timetables/:id/entries` - Add a timetable entry
- `PUT /api/timetables/entries/:entryId` - Update a timetable entry
- `DELETE /api/timetables/entries/:entryId` - Delete a timetable entry

### Resource Management

- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource by ID
- `GET /api/resources/department/:departmentId` - Get resources by department
- `GET /api/resources/type/:type` - Get resources by type
- `POST /api/resources` - Create a new resource
- `PUT /api/resources/:id` - Update a resource
- `DELETE /api/resources/:id` - Delete a resource

### Classroom Booking Management

- `GET /api/classroom-bookings` - Get all bookings
- `GET /api/classroom-bookings/:id` - Get booking by ID
- `GET /api/classroom-bookings/date/:date` - Get bookings by date
- `GET /api/classroom-bookings/department/:departmentId` - Get bookings by department
- `GET /api/classroom-bookings/classroom/:classroomId` - Get bookings by classroom
- `GET /api/classroom-bookings/date/:date/department/:departmentId` - Get bookings by date and department
- `GET /api/classroom-bookings/available` - Get available classrooms for a time slot
- `POST /api/classroom-bookings` - Create a new booking
- `PUT /api/classroom-bookings/:id` - Update a booking
- `DELETE /api/classroom-bookings/:id` - Delete a booking

### Admin and HOD Specific Endpoints

- `GET /api/admin/department/:departmentId/dashboard` - Get department dashboard data
- `GET /api/admin/department/:departmentId/timetable-conflicts` - Get timetable conflicts for a department
- `GET /api/admin/department/:departmentId/resource-utilization` - Get resource utilization report
- `GET /api/admin/department/:departmentId/faculty-workload` - Get faculty workload report
- `PUT /api/admin/classroom-bookings/:id/status` - Approve or reject a classroom booking
- `GET /api/admin/department/:departmentId/pending-bookings` - Get all pending bookings for approval

## Authentication

The admin routes include a placeholder middleware for authentication. In a production environment, this should be replaced with a proper authentication system that verifies user roles (admin or HOD) before allowing access to these endpoints.

## Error Handling

All API endpoints include proper error handling with appropriate HTTP status codes and error messages. Common error scenarios handled include:

- 404 Not Found - When requested resources don't exist
- 400 Bad Request - When input validation fails
- 409 Conflict - When there are scheduling conflicts
- 500 Internal Server Error - For unexpected server errors

## Database Initialization

The database is automatically initialized when the server starts. The initialization process creates all necessary tables if they don't already exist. This ensures that the application can run without manual database setup.

## Usage

To use this backend:

1. Start the server with `npm run dev` or `npm start`
2. The server will initialize the SQLite database automatically
3. Access the API endpoints using the base URL (e.g., `http://localhost:3000/api/`)

## Dependencies

- **express**: Web server framework
- **knex**: SQL query builder
- **better-sqlite3**: SQLite driver
- **cors**: Cross-origin resource sharing middleware