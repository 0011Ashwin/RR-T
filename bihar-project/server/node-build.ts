import path from "path";
import { createServer } from "./index.js";
import * as express from "express";

// Self-executing async function to handle async createServer
(async () => {
  const app = await createServer();
  const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

// Try to start the server with port fallback mechanism
const startServer = (portToUse: number) => {
  const server = app.listen(portToUse, () => {
    console.log(`🚀 Fusion Starter server running on port ${portToUse}`);
    console.log(`📱 Frontend: http://localhost:${portToUse}`);
    console.log(`🔧 API: http://localhost:${portToUse}/api`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${portToUse} is already in use, trying port ${portToUse + 1}`);
      startServer(portToUse + 1);
    } else {
      console.error('Server error:', error);
    }
  });
};

// Start the server with the initial port
startServer(port as number);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});

})(); // Close the async IIFE
