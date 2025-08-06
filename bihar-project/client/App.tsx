import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HODAuthProvider } from "@/hooks/use-hod-auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UniversityDashboard from "./pages/UniversityDashboard";
import CollegeDashboard from "./pages/CollegeDashboard";
import StudentDashboard from "./pages/EnhancedStudentDashboard";
import HODDashboard from "./pages/HODDashboard";

import Resources from "./pages/Resources";
import RoutineBuilder from "./pages/RoutineBuilder";
import ResourceManagement from "./pages/ResourceManagement";
import BookingRequests from "./pages/BookingRequests";
import VCResourceApprovals from "./pages/VCResourceApprovals";
import CollegeDetails from "./pages/CollegeDetails";
import TeachingStaff from "./pages/TeachingStaff";
import NonTeachingStaff from "./pages/NonTeachingStaff";
import HODTest from "./pages/HODTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HODAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/university" element={<UniversityDashboard />} />
            <Route path="/principal" element={<CollegeDashboard />} />
            <Route path="/department" element={<HODDashboard />} />

            <Route path="/resources" element={<Resources />} />
            <Route path="/routine-builder" element={<RoutineBuilder />} />
            <Route path="/resource-management" element={<ResourceManagement />} />
            <Route path="/booking-requests" element={<BookingRequests />} />
            <Route path="/vc-resource-approvals" element={<VCResourceApprovals />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/college/:collegeName" element={<CollegeDetails />} />
            <Route path="/staff/teaching" element={<TeachingStaff />} />
            <Route path="/staff/non-teaching" element={<NonTeachingStaff />} />
            <Route path="/hod-test" element={<HODTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </HODAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
