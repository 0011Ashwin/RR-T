import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useHODAuth } from '@/hooks/use-hod-auth';
import { Building2, LogIn, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function HODLogin() {
  const navigate = useNavigate();
  const { login, allHODs } = useHODAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email);
      if (success) {
        navigate('/department');
      } else {
        setError('Invalid email or HOD account not found.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (hodEmail: string) => {
    setEmail(hodEmail);
    setIsLoading(true);
    setError('');

    try {
      const success = await login(hodEmail);
      if (success) {
        navigate('/department');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              HOD Portal Login
            </CardTitle>
            <p className="text-slate-600">
              Multi-Department Resource Management System
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your HOD email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Available HOD Accounts */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Available HOD Accounts
            </CardTitle>
            <p className="text-sm text-slate-600">
              Click on any account to quick login (Demo)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {allHODs.map((hod) => (
              <div
                key={hod.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-indigo-300 bg-gradient-to-r from-white to-indigo-50"
                onClick={() => handleQuickLogin(hod.email)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {hod.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {hod.designation}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-green-600 border-green-200 bg-green-50"
                  >
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-3 w-3 mr-2" />
                    {hod.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Building2 className="h-3 w-3 mr-2" />
                    {hod.department}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Employee ID: {hod.employeeId} • {hod.experience} Experience
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Demo System:</strong> This is a demonstration of the multi-HOD resource management system. Each HOD has access to their department's resources and can request resources from other departments.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
