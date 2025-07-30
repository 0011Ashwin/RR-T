import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "./client"), // Set root to client directory
  publicDir: path.resolve(__dirname, "./public"), // Explicitly set public directory
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: path.resolve(__dirname, "dist/spa"), // Use absolute path
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const app = await createServer();

      // Add security middleware to block access to sensitive files
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        
        // Block access to server files and configuration
        const blockedPaths = [
          '/server/',
          '/package.json',
          '/tsconfig.json',
          '/vite.config.ts',
          '/vite.config.server.ts',
          '/.env',
          '/node_modules/',
          '/dist/',
          '/data/',
          '/.git/',
          '/tailwind.config.ts',
          '/postcss.config.js',
          '/components.json'
        ];
        
        // Check if the URL starts with any blocked path
        if (blockedPaths.some(path => url.startsWith(path))) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        
        next();
      });

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
