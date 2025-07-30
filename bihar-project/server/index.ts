import express from "express";
import cors from "cors";
import fs from "fs";
import { handleDemo } from "./routes/demo.js";
import { handleChat } from "./routes/chat.js";
import { initializeDatabase } from "./database/index.js";
import { departmentRouter } from "./routes/department.js";
import { classroomRouter } from "./routes/classroom.js";
import { facultyRouter } from "./routes/faculty.js";
import { subjectRouter } from "./routes/subject.js";
import { timetableRouter } from "./routes/timetable.js";
import { resourceRouter } from "./routes/resource.js";
import { classroomBookingRouter } from "./routes/classroom-booking.js";
import { adminRouter } from "./routes/admin.js";
import { bookingRequestRouter } from "./routes/booking-request.js";
import { classSessionRouter } from "./routes/class-session.js";
import { timeslotRouter } from "./routes/timeslot.js";
import { hodRouter } from "./routes/hod.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Data directory created at:', dataDir);
  }

  // Initialize database
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/chat", handleChat);

  // API routes for database entities
  app.use("/api/departments", departmentRouter);
  app.use("/api/classrooms", classroomRouter);
  app.use("/api/faculty", facultyRouter);
  app.use("/api/hods", hodRouter);
  app.use("/api/subjects", subjectRouter);
  app.use("/api/timetables", timetableRouter);
  app.use("/api/resources", resourceRouter);
  app.use("/api/classroom-bookings", classroomBookingRouter);
  app.use("/api/booking-requests", bookingRequestRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/class-sessions", classSessionRouter);
  app.use("/api/timeslots", timeslotRouter);

  return app;
}
