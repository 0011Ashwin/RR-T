import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>('student');
  const [adminSubRole, setAdminSubRole] = useState<'vc' | 'principal' | 'hod'>('vc');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const adminAccounts = {
    'vc@example.com': 'vc',
    'principal@example.com': 'principal',
    'hod@example.com': 'hod',
  };

  const handleLogin = () => {
    if (activeRole === 'student') {
      if (credentials.email && credentials.password) {
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('userEmail', credentials.email);
        navigate('/student');
      }
    } else if (activeRole === 'admin') {
      if (credentials.email && credentials.password) {
        const adminType = adminAccounts[credentials.email.toLowerCase()];
        if (adminType) {
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('adminType', adminType);
          localStorage.setItem('userEmail', credentials.email);
          switch (adminType) {
            case 'vc':
              navigate('/university');
              break;
            case 'principal':
              navigate('/principal');
              break;
            case 'hod':
              navigate('/department');
              break;
          }
        } else {
          // Optionally show error: not a recognized admin
        }
      }
    }
  };

  const roleConfig = {
    student: {
      color: 'student',
      icon: User,
      title: 'Student Portal',
      description: 'Access your profile, attendance, pay slip, notices, leave, and documents.'
    },
    admin: {
      color: 'admin',
      icon: Shield,
      title: 'Admin Portal',
      description: 'Login as VC, Principal, or HOD to manage university, college, or department.'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-university" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">University Management System</h1>
          <p className="text-slate-600 mt-2">Select your role to continue</p>
        </div>

        <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="student" className="data-[state=active]:bg-student data-[state=active]:text-student-foreground">
              Student
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-admin data-[state=active]:text-admin-foreground">
              Admin
            </TabsTrigger>
          </TabsList>

          {/* Student Login */}
          <TabsContent value="student">
            <Card>
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 p-3 rounded-full bg-student text-student-foreground w-fit`}>
                  <User className="h-6 w-6" />
                </div>
                <CardTitle>Student Portal</CardTitle>
                <CardDescription>Login with Email and Password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
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
                <div className={`mx-auto mb-4 p-3 rounded-full bg-admin text-admin-foreground w-fit`}>
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle>Admin Portal</CardTitle>
                <CardDescription>Login with Email and Password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
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
    </div>
  );
}
