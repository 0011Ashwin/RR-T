/**
 * INDEX (HOME) PAGE
 *
 * PURPOSE: Main landing page and authentication entry point for the Bihar University Management System
 *
 * ACCESS CONTROL: Public access - no authentication required
 *
 * NAVIGATION FROM:
 * - Direct URL access (/)
 * - Logout from any dashboard (redirects here)
 * - App.tsx default route
 *
 * NAVIGATION TO:
 * - /student (Student Dashboard after student login)
 * - /university (University Dashboard after VC login)
 * - /principal (College Dashboard after Principal login)
 * - /department (HOD Dashboard after HOD login)
 *
 * KEY FEATURES:
 * - Dual role authentication (Student/Admin)
 * - Admin role detection (VC/Principal/HOD)
 * - Government of Bihar branding
 * - Image carousel banner
 * - Modal-based login system
 *
 * DEMO CREDENTIALS:
 * - Students: Any email/password combination
 * - VC: vc@example.com
 * - Principal: principal@example.com
 * - HOD: hod@example.com
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, User, Shield, ChevronDown } from "lucide-react";
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Index() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<"student" | "admin">("student");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const newsScrollRef = useRef<HTMLDivElement>(null);
  const [isNewsHovered, setIsNewsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>();

  // Auto-advance carousel
  useEffect(() => {
    if (!carouselApi) return;

    const interval = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [carouselApi]);

  // Auto-scroll effect for news only
  useEffect(() => {
    const newsElement = newsScrollRef.current;
    if (!newsElement) return;

    const scrollHeight = newsElement.scrollHeight;
    const clientHeight = newsElement.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) return;

    let scrollPosition = 0;
    let direction = 1;

    const scroll = () => {
      if (isNewsHovered) return; // Don't scroll when hovered
      
      scrollPosition += direction * 0.3;
      
      if (scrollPosition >= maxScroll) {
        direction = -1;
        scrollPosition = maxScroll;
      } else if (scrollPosition <= 0) {
        direction = 1;
        scrollPosition = 0;
      }

      newsElement.scrollTop = scrollPosition;
    };

    const interval = setInterval(scroll, 60);
    return () => clearInterval(interval);
  }, [isNewsHovered]);

  // ADMIN ACCOUNTS: Predefined admin emails with role mapping
  // Maps email addresses to admin types for role-based routing
  const adminAccounts = {
    "vc@example.com": "vc",
    "principal@example.com": "principal",
    "hod@example.com": "hod",
  };

  // LOGIN HANDLER: Process authentication and route to appropriate dashboard
  // Sets localStorage for session management and navigates based on role
  const handleLogin = () => {
    if (activeRole === "student") {
      // STUDENT LOGIN: Any credentials accepted for demo purposes
      if (credentials.email && credentials.password) {
        localStorage.setItem("userRole", "student");
        localStorage.setItem("userEmail", credentials.email);
        navigate("/student"); // → StudentDashboard.tsx
      }
    } else if (activeRole === "admin") {
      // ADMIN LOGIN: Check against predefined admin accounts
      if (credentials.email && credentials.password) {
        const adminType = adminAccounts[credentials.email.toLowerCase()];
        if (adminType) {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("adminType", adminType);
          localStorage.setItem("userEmail", credentials.email);
          // ROLE-BASED ROUTING: Navigate to appropriate dashboard
          switch (adminType) {
            case "vc":
              navigate("/university"); // → UniversityDashboard.tsx
              break;
            case "principal":
              navigate("/principal"); // → CollegeDashboard.tsx
              break;
            case "hod":
              navigate("/department"); // → HODDashboard.tsx
              break;
          }
        } else {
          // Optionally show error: not a recognized admin
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-3 bg-[#0072ce] shadow-sm relative z-20">
        <div className="flex items-center gap-8">
          {/* Gallery Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white font-semibold hover:text-blue-200 transition-colors">
              Gallery
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Photo Gallery</DropdownMenuItem>
              <DropdownMenuItem>Video Gallery</DropdownMenuItem>
              <DropdownMenuItem>Virtual Tour</DropdownMenuItem>
              <DropdownMenuItem>Campus Images</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* About Us Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white font-semibold hover:text-blue-200 transition-colors">
              About Us
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Our History</DropdownMenuItem>
              <DropdownMenuItem>Mission & Vision</DropdownMenuItem>
              <DropdownMenuItem>Leadership</DropdownMenuItem>
              <DropdownMenuItem>Awards & Recognition</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Academics Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white font-semibold hover:text-blue-200 transition-colors">
              Academics
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Departments</DropdownMenuItem>
              <DropdownMenuItem>Courses Offered</DropdownMenuItem>
              <DropdownMenuItem>Faculty</DropdownMenuItem>
              <DropdownMenuItem>Research</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white font-semibold hover:text-blue-200 transition-colors">
              Services
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Student Services</DropdownMenuItem>
              <DropdownMenuItem>Library</DropdownMenuItem>
              <DropdownMenuItem>IT Support</DropdownMenuItem>
              <DropdownMenuItem>Career Guidance</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Feedback Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white font-semibold hover:text-blue-200 transition-colors">
              Feedback
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Student Feedback</DropdownMenuItem>
              <DropdownMenuItem>Faculty Feedback</DropdownMenuItem>
              <DropdownMenuItem>General Suggestions</DropdownMenuItem>
              <DropdownMenuItem>Complaint Portal</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* LOGIN TRIGGERS */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setLoginOpen(true)}
            className="bg-admin text-admin-foreground px-6 py-2 rounded-md font-semibold shadow-none"
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Banner Carousel */}
      <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
        <Carousel 
          setApi={setCarouselApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="ml-0">
            <CarouselItem className="pl-0">
              <div className="relative w-full h-[420px] md:h-[520px] rounded-none overflow-hidden flex items-center justify-center">
                <img
                  src="/banner-1.jpg"
                  alt="Banner 1"
                  className="object-cover w-full h-full"
                />
                <div className="absolute left-8 top-8 flex flex-col items-start z-10">
                  <img
                    src="/bihar-logo-red.png"
                    alt="Bihar Logo"
                    className="h-16 w-auto mb-2"
                  />
                  <h1
                    className="font-bold text-white text-2xl leading-tight"
                    style={{ lineHeight: "1.1" }}
                  >
                    <span>Government</span>
                    <br />
                    <span>of</span>
                    <br />
                    <span>Bihar</span>
                  </h1>
                </div>
                <div className="absolute left-8 bottom-8 text-white text-3xl md:text-5xl font-bold drop-shadow-xl">
                  Development with{" "}
                  <span className="text-green-400">Social Justice</span>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="pl-0">
              <div className="relative w-full h-[420px] md:h-[520px] rounded-none overflow-hidden flex items-center justify-center">
                <img
                  src="/Banner-2.jpg"
                  alt="Banner 2"
                  className="object-cover w-full h-full"
                />
                {/* You can add overlay text or leave it blank */}
              </div>
            </CarouselItem>
          </CarouselContent>
          
          {/* Custom positioned arrows */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
            <CarouselPrevious className="relative translate-x-0 translate-y-0 bg-white/20 hover:bg-white/30 border-white/30 text-white" />
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
            <CarouselNext className="relative translate-x-0 translate-y-0 bg-white/20 hover:bg-white/30 border-white/30 text-white" />
          </div>
        </Carousel>
      </div>

      {/* GOVERNMENT ANNOUNCEMENTS: Links to official speeches and documents */}
      <div className="w-full bg-[#f6a800] py-8 flex flex-col items-center">
        <a href="#" className="text-blue-800 font-semibold underline mb-4">
          Speech given by Honourable Governor of Bihar during joint session of
          Bihar Vidhan Mandal 2023.
        </a>
        <a href="#" className="text-blue-800 font-semibold underline mb-4">
          Speech given by Honourable Governor of Bihar during joint session of
          Bihar Vidhan Mandal 2024.
        </a>
        <a href="#" className="text-blue-800 font-semibold underline">
          Speech given by Honourable Governor of Bihar during joint session of
          Bihar Vidhan Mandal 2025.
        </a>
      </div>

      {/* Key Contacts and Latest News Section */}
      <div className="w-full max-w-full flex overflow-x-hidden">
        {/* Key Contacts Section */}
        <div className="w-1/2 bg-[#ff7f00] text-white relative">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Key Contacts</h2>
            <div 
              className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-orange-400 relative"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#ea580c #fb923c'
              }}
            >
              <div className="space-y-6">
                <div className="border-b border-orange-300 pb-4">
                  <h3 className="font-bold text-lg">Toll Free No.</h3>
                  <p className="text-sm">14417, 18003456417</p>
                </div>
                
                <div className="border-b border-orange-300 pb-4">
                  <h3 className="font-bold text-lg">Sri (Dr.) S. Siddharth, I.A.S.</h3>
                  <p className="text-sm text-orange-100">Additional Chief Secretary, I.A.S.</p>
                  <p className="text-sm">📞 0612-2217016</p>
                  <p className="text-sm">✉️ secy.edu.bih@nic.in</p>
                </div>

                <div className="border-b border-orange-300 pb-4">
                  <h3 className="font-bold text-lg">Sri Mayank Warwade, I.A.S.</h3>
                  <p className="text-sm text-orange-100">Director, Bihar Education Project Council</p>
                  <p className="text-sm">📞 0612-2507515</p>
                  <p className="text-sm">✉️ d.bepc@gmail.com</p>
                </div>

                <div className="border-b border-orange-300 pb-4">
                  <h3 className="font-bold text-lg">Sri Ajay Yadav, I.A.S.</h3>
                  <p className="text-sm text-orange-100">Secretary</p>
                </div>

                <div className="border-b border-orange-300 pb-4">
                  <h3 className="font-bold text-lg">Sri Dinesh Kumar, I.A.S.</h3>
                  <p className="text-sm text-orange-100">Secretary</p>
                  <p className="text-sm">📞 0612-2217016</p>
                </div>

                <div className="border-b border-orange-300 pb-4">
                  <h3 className="font-bold text-lg">Additional Contact</h3>
                  <p className="text-sm text-orange-100">Joint Secretary, Education Department</p>
                  <p className="text-sm">📞 0612-2217020</p>
                  <p className="text-sm">✉️ joint.secy@bihar.gov.in</p>
                </div>

                <div className="pb-4">
                  <h3 className="font-bold text-lg">Regional Office</h3>
                  <p className="text-sm text-orange-100">Regional Education Officer</p>
                  <p className="text-sm">📞 0612-2217025</p>
                  <p className="text-sm">✉️ regional@bihar.gov.in</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors">
                📞 Phone Directory
              </button>
            </div>
          </div>
        </div>

        {/* Latest News Section */}
        <div className="w-1/2 bg-[#2196f3] text-white relative">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Latest News</h2>
            <div 
              ref={newsScrollRef}
              className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-400"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#2563eb #60a5fa'
              }}
              onMouseEnter={() => setIsNewsHovered(true)}
              onMouseLeave={() => setIsNewsHovered(false)}
            >
              <div className="space-y-4">
                <div className="bg-white text-gray-800 p-4 rounded-lg flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img src="/bihar-logo-red.png" alt="Bihar Logo" className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Block & School Allotment of Head Teacher - All Districts</h3>
                    <p className="text-xs text-gray-600 mt-1">Posted on January 15, 2025</p>
                  </div>
                </div>

                <div className="bg-white text-gray-800 p-4 rounded-lg flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img src="/bihar-logo-red.png" alt="Bihar Logo" className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Block & School Allotment list of HM - 11.07.2025</h3>
                    <p className="text-xs text-gray-600 mt-1">नियम संबंधी</p>
                    <p className="text-xs text-gray-600">Posted on July 11, 2025</p>
                  </div>
                </div>

                <div className="bg-white text-gray-800 p-4 rounded-lg flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img src="/bihar-logo-red.png" alt="Bihar Logo" className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">शिक्षा संबंधी अधिकारियों के स्थानापन्न हेतु दिशा निर्देश</h3>
                    <p className="text-xs text-gray-600 mt-1">Posted on December 20, 2024</p>
                  </div>
                </div>

                <div className="bg-white text-gray-800 p-4 rounded-lg flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img src="/bihar-logo-red.png" alt="Bihar Logo" className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">District Allotment List of HT 📋</h3>
                    <p className="text-xs text-gray-600 mt-1">New allocation guidelines released</p>
                    <p className="text-xs text-gray-600">Posted on November 5, 2024</p>
                  </div>
                </div>

                <div className="bg-white text-gray-800 p-4 rounded-lg flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img src="/bihar-logo-red.png" alt="Bihar Logo" className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Teacher Training Program 2025</h3>
                    <p className="text-xs text-gray-600 mt-1">Registration now open for all districts</p>
                    <p className="text-xs text-gray-600">Posted on January 10, 2025</p>
                  </div>
                </div>

                <div className="bg-white text-gray-800 p-4 rounded-lg flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img src="/bihar-logo-red.png" alt="Bihar Logo" className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Digital Bihar Initiative Launch</h3>
                    <p className="text-xs text-gray-600 mt-1">New technology integration in schools</p>
                    <p className="text-xs text-gray-600">Posted on December 28, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white">
        {/* Main Footer Content */}
        <div className="px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Government Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/bihar-logo-red.png" alt="Bihar Logo" className="h-12 w-auto" />
                <div>
                  <h3 className="font-bold text-lg">Government of Bihar</h3>
                  <p className="text-gray-300 text-sm">Education Department</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Committed to providing quality education and fostering development with social justice across Bihar.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-blue-400">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Student Portal</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Faculty Portal</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Admission Guidelines</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Scholarship Information</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Academic Calendar</a></li>
              </ul>
            </div>

            {/* Important Resources */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-blue-400">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">RTI Information</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Public Grievances</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Digital Bihar Initiative</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Policy Documents</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tenders & Notices</a></li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-blue-400">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">📍</span>
                  <p className="text-gray-300">
                    Bihar Education Department<br />
                    Secretariat, Patna - 800015
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">📞</span>
                  <p className="text-gray-300">Toll Free: 14417, 18003456417</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">✉️</span>
                  <p className="text-gray-300">secy.edu.bih@nic.in</p>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="flex gap-3 pt-2">
                <a href="#" className="bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors">
                  <span className="text-xs">📘 Facebook</span>
                </a>
                <a href="#" className="bg-blue-400 hover:bg-blue-500 p-2 rounded transition-colors">
                  <span className="text-xs">🐦 Twitter</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="border-t border-gray-700 px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
            <div className="text-sm text-gray-400 text-center">
              <p>© 2025 Government of Bihar, Education Department. All rights reserved.</p>
              <p className="mt-1">Best viewed in Chrome, Firefox, Safari, Edge | Updated: July 25, 2025</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {/* AUTHENTICATION MODAL: Dual-role login system (Student/Admin) */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-md w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Login to University Portal
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            <Tabs
              value={activeRole}
              onValueChange={(value) => setActiveRole(value as any)}
              className="w-full"
            >
              {/* ROLE SELECTOR: Toggle between Student and Admin login */}
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="student"
                  className="data-[state=active]:bg-student data-[state=active]:text-student-foreground"
                >
                  Student
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-admin data-[state=active]:text-admin-foreground"
                >
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* STUDENT LOGIN FORM: Email/password authentication */}
              <TabsContent value="student">
                <Card>
                  <CardHeader className="text-center">
                    <div
                      className={`mx-auto mb-4 p-3 rounded-full bg-student text-student-foreground w-fit`}
                    >
                      <User className="h-6 w-6" />
                    </div>
                    <CardTitle>Student Portal</CardTitle>
                    <CardDescription>
                      Login with Email and Password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="Enter your email"
                        value={credentials.email}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full bg-student hover:bg-student/90 text-student-foreground"
                      onClick={handleLogin}
                      disabled={!credentials.email || !credentials.password}
                    >
                      Login as Student
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ADMIN LOGIN FORM: Email/password with role detection */}
              <TabsContent value="admin">
                <Card>
                  <CardHeader className="text-center">
                    <div
                      className={`mx-auto mb-4 p-3 rounded-full bg-admin text-admin-foreground w-fit`}
                    >
                      <Shield className="h-6 w-6" />
                    </div>
                    <CardTitle>Admin Portal</CardTitle>
                    <CardDescription>
                      Login with Email and Password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={credentials.email}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full bg-admin hover:bg-admin/90 text-admin-foreground"
                      onClick={handleLogin}
                      disabled={!credentials.email || !credentials.password}
                    >
                      Login as Admin
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            {/* DEMO INFORMATION: Credential guidance for testing */}
            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Demo credentials: Use any username/password combination</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
