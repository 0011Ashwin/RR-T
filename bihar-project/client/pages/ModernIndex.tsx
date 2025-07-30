/**
 * MODERN INDEX (HOME) PAGE
 *
 * PURPOSE: Redesigned landing page and authentication entry point for the Bihar University Management System
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
 * - Material Design 3 aesthetic
 * - Typing animation hero section
 * - Stats grid with animation
 * - Feature cards showcase
 * - Dual role authentication (Student/Admin)
 * - Admin role detection (VC/Principal/HOD)
 * - Mobile-first responsive design
 *
 * DEMO CREDENTIALS:
 * - Students: Any email/password combination
 * - VC: vc@example.com
 * - Principal: principal@example.com
 * - HOD: hod@example.com
 */

import { useState, useEffect } from "react";
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
import { User, Shield, LightBulb, Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ModernIndex() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<"student" | "admin">("student");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    colleges: 0,
    students: 0,
    districts: 0,
    uptime: 0,
  });

  const quote = "Empowering Bihar's education, one college at a time.";

  // Theme toggle functionality
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setDarkMode(prefersDark);
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Typing animation effect
  useEffect(() => {
    if (charIndex < quote.length) {
      const timeout = setTimeout(() => {
        setTypingText(quote.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 60);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, quote]);

  // Stats animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate stats
          const animateToTarget = (key: keyof typeof animatedStats, target: number) => {
            let current = 0;
            const duration = 1500;
            const stepTime = 20;
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;
            
            const updateStat = () => {
              current += increment;
              if (current < target) {
                setAnimatedStats(prev => ({ ...prev, [key]: Math.ceil(current) }));
                setTimeout(updateStat, stepTime);
              } else {
                setAnimatedStats(prev => ({ ...prev, [key]: target }));
              }
            };
            updateStat();
          };

          animateToTarget('colleges', 150);
          setTimeout(() => animateToTarget('students', 200), 100);
          setTimeout(() => animateToTarget('districts', 38), 200);
          setTimeout(() => animateToTarget('uptime', 99), 300);
        }
      });
    }, { threshold: 0.1 });

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, []);

  // ADMIN ACCOUNTS: Predefined admin emails with role mapping
  const adminAccounts = {
    "vc@example.com": "vc",
    "principal@example.com": "principal",
    "hod@example.com": "hod",
  };

  // LOGIN HANDLER: Process authentication and route to appropriate dashboard
  const handleLogin = () => {
    if (activeRole === "student") {
      if (credentials.email && credentials.password) {
        localStorage.setItem("userRole", "student");
        localStorage.setItem("userEmail", credentials.email);
        navigate("/student");
      }
    } else if (activeRole === "admin") {
      if (credentials.email && credentials.password) {
        const adminType = adminAccounts[credentials.email.toLowerCase()];
        if (adminType) {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("adminType", adminType);
          localStorage.setItem("userEmail", credentials.email);
          switch (adminType) {
            case "vc":
              navigate("/university");
              break;
            case "principal":
              navigate("/principal");
              break;
            case "hod":
              navigate("/department");
              break;
          }
        }
      }
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900'
    }`}>
      {/* Top App Bar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      } backdrop-blur-lg border-b`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">
            Smart Bihar CMS
          </div>
          <nav className="flex items-center gap-4">
            <Button
              onClick={() => setLoginOpen(true)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Sign In
            </Button>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className={`rounded-full transition-all duration-300 ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 transition-transform duration-300 rotate-0" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300 rotate-0" />
              )}
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6 text-center flex items-center justify-center min-h-[70vh]">
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8 ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <span>{typingText}</span>
              <span className={`inline-block w-1 h-12 md:h-16 lg:h-20 ml-2 animate-pulse ${
                darkMode ? 'bg-blue-400' : 'bg-blue-600'
              }`}></span>
            </h1>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats-section" className={`py-20 px-6 ${
          darkMode 
            ? 'bg-gray-800/50' 
            : 'bg-white/70 backdrop-blur-sm'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="transform transition-all duration-500 hover:scale-105">
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {animatedStats.colleges}
                </div>
                <div className={`text-sm md:text-base font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Colleges Onboarded
                </div>
              </div>
              <div className="transform transition-all duration-500 hover:scale-105">
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {animatedStats.students}
                </div>
                <div className={`text-sm md:text-base font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Thousand+ Students
                </div>
              </div>
              <div className="transform transition-all duration-500 hover:scale-105">
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {animatedStats.districts}
                </div>
                <div className={`text-sm md:text-base font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Districts Covered
                </div>
              </div>
              <div className="transform transition-all duration-500 hover:scale-105">
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {animatedStats.uptime}
                </div>
                <div className={`text-sm md:text-base font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  % Uptime SLA
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              The Complete Toolkit for Modern Education
            </h2>
            <p className={`text-lg text-center mb-12 max-w-3xl mx-auto leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Designed for the unique educational landscape of Bihar, our platform provides a robust, 
              unified system to handle every aspect of your institution's operations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "📊",
                  title: "Centralized Dashboard",
                  description: "Manage admissions, fee collections, staff payroll, and academic records from a single, intuitive interface. Say goodbye to scattered data."
                },
                {
                  icon: "💳",
                  title: "Online Admissions & Fees",
                  description: "Streamline the entire admission process and enable secure online fee payments through multiple gateways, reducing administrative burden."
                },
                {
                  icon: "📝",
                  title: "Examination & Results",
                  description: "Configure exam schedules, manage grading, and publish results online instantly to student portals, ensuring transparency and speed."
                },
                {
                  icon: "📈",
                  title: "Real-time Analytics",
                  description: "Generate insightful reports on student performance, attendance trends, and financial health to make data-driven decisions with confidence."
                },
                {
                  icon: "🎓",
                  title: "Dedicated Portals",
                  description: "Empower students and faculty with secure, self-service portals to access timetables, results, materials, and communication channels."
                },
                {
                  icon: "📱",
                  title: "Mobile-First Access",
                  description: "Access dashboards, reports, and portals anytime, anywhere. Our responsive design works flawlessly on desktops, tablets, and smartphones."
                }
              ].map((feature, index) => (
                <Card 
                  key={index}
                  className={`transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100'
                  }`}
                >
                  <CardHeader className="text-center">
                    <div className={`text-4xl mb-4 p-4 rounded-full w-fit mx-auto ${
                      darkMode 
                        ? 'bg-blue-900/50' 
                        : 'bg-blue-100'
                    }`}>
                      {feature.icon}
                    </div>
                    <CardTitle className={`text-xl font-bold ${
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-center leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className={`py-20 px-6 text-center ${
          darkMode 
            ? 'bg-gray-800/50' 
            : 'bg-white/70 backdrop-blur-sm'
        }`}>
          <div className="max-w-4xl mx-auto">
            <div className={`text-6xl mb-6 p-6 rounded-full w-fit mx-auto ${
              darkMode 
                ? 'bg-blue-900/50' 
                : 'bg-blue-100'
            }`}>
              🔗
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Built for Bihar's Ecosystem
            </h2>
            <p className={`text-lg max-w-3xl mx-auto leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We understand the importance of connectivity. Our system is built to integrate seamlessly 
              with state-level portals, including the BSEB database and government scholarship programs, 
              ensuring compliance and easy data exchange.
            </p>
          </div>
        </section>
      </main>

      {/* Login Modal - Preserving Original Functionality */}
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

              <TabsContent value="student">
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-student text-student-foreground w-fit">
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

              <TabsContent value="admin">
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-admin text-admin-foreground w-fit">
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
            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Demo credentials: Use any username/password combination</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
