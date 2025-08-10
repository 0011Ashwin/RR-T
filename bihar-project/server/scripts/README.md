# Database Setup Scripts

## Overview

This directory contains the database setup and population scripts for the Bihar University Resource Management System.

## Available Scripts

### `complete-demo-setup.cjs`

**Purpose:** Complete database initialization and demo data population script

**Features:**

- Creates all required database tables with proper schema
- Populates comprehensive demo data for testing
- Includes 2 departments (Computer Science & Mathematics)
- Adds 10 faculty members (including HODs)
- Creates 12 subjects/courses
- Sets up 10 classrooms and resources
- Includes sample timetables with minimal conflicts
- Adds sample booking requests

**Usage:**

```bash
cd server
node scripts/complete-demo-setup.cjs
```

**What it creates:**

- 📊 **Departments:** Computer Science & Mathematics
- 👨‍🏫 **Faculty:** 5 per department including HODs
- 🏫 **Resources:** Labs, classrooms, auditorium, conference hall
- 📚 **Subjects:** Mix of lectures and practicals
- 📅 **Timetables:** Pre-configured sample schedules
- 📋 **Booking Requests:** Sample cross-department requests

**Login Credentials for Testing:**

- **CS HOD:** Dr. Rajesh Kumar Singh (rajesh.singh@biharuniv.edu)
- **Math HOD:** Dr. Priya Sharma (priya.sharma@biharuniv.edu)

## Notes

- The script automatically deletes the old database if it exists
- Creates fresh database schema before populating data
- Designed to minimize conflicts for easier session creation testing
- Safe to run multiple times (clears existing data first)

## Development

- Uses CommonJS format (.cjs) for compatibility
- Includes comprehensive error handling
- Provides detailed console output during execution
