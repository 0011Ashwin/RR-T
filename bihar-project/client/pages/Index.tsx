import { useState } from "react";
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
import { GraduationCap, User, Shield } from "lucide-react";
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

export default function Index() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<"student" | "admin">("student");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loginOpen, setLoginOpen] = useState(false);

  const adminAccounts = {
    "vc@example.com": "vc",
    "principal@example.com": "principal",
    "hod@example.com": "hod",
  };

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
        } else {
          // Optionally show error: not a recognized admin
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-3 bg-[#0072ce] shadow-sm">
        <div className="flex items-center gap-2">
          <img
            src="/bihar-logo-red.png"
            alt="Government of Bihar"
            className="h-12 w-auto mr-2"
            style={{ minWidth: 48 }}
          />
          <h1
            className="font-bold text-white text-lg leading-tight"
            style={{ lineHeight: "1.1" }}
          >
            <span>Government</span>
            <br />
            <span>of</span>
            <br />
            <span>Bihar</span>
          </h1>
        </div>
        <Button
          onClick={() => setLoginOpen(true)}
          className="bg-admin text-admin-foreground px-6 py-2 rounded-md font-semibold shadow-none"
        >
          Login
        </Button>
      </nav>

      {/* Banner Carousel */}
      <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Carousel>
          <CarouselContent>
            <CarouselItem>
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
                <div className="absolute left-8 top-8 text-white text-3xl md:text-5xl font-bold drop-shadow-xl">
                  Development with{" "}
                  <span className="text-green-400">Social Justice</span>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
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
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Yellow Section Below Banner */}
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

      {/* Login Modal */}
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

              {/* Student Login */}
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

              {/* Admin Login */}
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
            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Demo credentials: Use any username/password combination</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
