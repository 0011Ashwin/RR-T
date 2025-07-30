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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const adminAccounts = {
    'vc@example.com': 'vc',
    'principal@example.com': 'principal',
    'hod@example.com': 'hod',
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (activeRole === 'student') {
        // Student login logic
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('userEmail', credentials.email);
        toast.success('Login successful!');
        navigate('/student');
      } else if (activeRole === 'admin') {
        console.log('Admin login attempt:', { adminSubRole, email: credentials.email });

        if (adminSubRole === 'hod') {
          // HOD login through backend authentication
          console.log('Attempting HOD backend authentication');
          try {
            const response = await fetch('/api/hod-auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
              }),
            });

            console.log('HOD auth response status:', response.status);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Server returned non-JSON response');
            }

            const data = await response.json();
            console.log('HOD auth response data:', data);

            if (response.ok && data.success) {
              // Store HOD data in localStorage
              localStorage.setItem('currentHODId', data.hod.id.toString());
              localStorage.setItem('userRole', 'hod');
              localStorage.setItem('userEmail', credentials.email);
              toast.success('HOD login successful!');
              navigate('/department');
            } else {
              setError(data.error || 'Invalid HOD credentials. Please check your email and password.');
            }
          } catch (authError) {
            console.error('HOD auth error:', authError);
            setError('Failed to authenticate HOD. Please try again.');
          }
        } else {
          // Handle VC and Principal login with static accounts
          const adminType = adminSubRole; // Use the selected admin sub role

          if (adminSubRole === 'vc' && credentials.email.toLowerCase() === 'vc@example.com') {
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('adminType', 'vc');
            localStorage.setItem('userEmail', credentials.email);
            toast.success('VC login successful!');
            navigate('/university');
          } else if (adminSubRole === 'principal' && credentials.email.toLowerCase() === 'principal@example.com') {
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('adminType', 'principal');
            localStorage.setItem('userEmail', credentials.email);
            toast.success('Principal login successful!');
            navigate('/principal');
          } else {
            // Check if it's one of the predefined admin accounts
            const predefinedAdminType = adminAccounts[credentials.email.toLowerCase()];
            if (predefinedAdminType) {
              localStorage.setItem('userRole', 'admin');
              localStorage.setItem('adminType', predefinedAdminType);
              localStorage.setItem('userEmail', credentials.email);
              toast.success('Login successful!');
              switch (predefinedAdminType) {
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
              setError(`Invalid ${adminSubRole.toUpperCase()} credentials. Please check your email and password.`);
            }
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
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
                <CardDescription>Login as VC, Principal, or HOD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-type">Admin Type</Label>
                  <Select
                    value={adminSubRole}
                    onValueChange={(value: 'vc' | 'principal' | 'hod') => {
                      console.log('Admin type changed to:', value);
                      setAdminSubRole(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select admin type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vc">Vice Chancellor (VC)</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="hod">Head of Department (HOD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500">
                    Current selection: {adminSubRole}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">
                    {adminSubRole === 'hod' ? 'HOD Email' : 'Email'}
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder={
                      adminSubRole === 'hod'
                        ? 'Enter your HOD email (e.g., amitabh.singh@bec.ac.in)'
                        : adminSubRole === 'vc'
                          ? 'vc@example.com'
                          : 'principal@example.com'
                    }
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">
                    {adminSubRole === 'hod' ? 'HOD Password' : 'Password'}
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder={
                      adminSubRole === 'hod'
                        ? 'Enter your HOD password (default: hod123)'
                        : 'Enter your password'
                    }
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full bg-admin hover:bg-admin/90 text-admin-foreground"
                  onClick={handleLogin}
                  disabled={!credentials.email || !credentials.password || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    `Login as ${adminSubRole === 'vc' ? 'VC' : adminSubRole === 'principal' ? 'Principal' : 'HOD'}`
                  )}
                </Button>

                {adminSubRole === 'hod' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Demo HOD Accounts:</strong>
                      <div className="mt-1 space-y-1 text-xs">
                        <div>• amitabh.singh@bec.ac.in (CSE Department)</div>
                        <div>• sunita.kumari@bec.ac.in (ECE Department)</div>
                        <div>• manoj.kumar@msc.ac.in (Physics Department)</div>
                        <div className="mt-2"><strong>Password:</strong> hod123 (for all accounts)</div>
                      </div>
                    </div>
                  </div>
                )}
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
