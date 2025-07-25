import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UniversityDashboard from "./pages/UniversityDashboard";
import CollegeDashboard from "./pages/CollegeDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import HODDashboard from "./pages/HODDashboard";
import CollegeDetails from "./pages/CollegeDetails";
import TeachingStaff from "./pages/TeachingStaff";
import NonTeachingStaff from "./pages/NonTeachingStaff";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/university" element={<UniversityDashboard />} />
          <Route path="/principal" element={<CollegeDashboard />} />
          <Route path="/department" element={<HODDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/college/:collegeName" element={<CollegeDetails />} />
          <Route path="/staff/teaching" element={<TeachingStaff />} />
          <Route path="/staff/non-teaching" element={<NonTeachingStaff />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
