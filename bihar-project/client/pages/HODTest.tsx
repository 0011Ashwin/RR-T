import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HODTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testHODEndpoints = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Check if HODs exist in database
      addResult('Testing HOD database endpoint...');
      const testResponse = await fetch('/api/hod-auth/test-hods');
      const testData = await testResponse.json();
      addResult(`Test HODs response: ${JSON.stringify(testData)}`);

      // Test 2: Try to authenticate with known credentials
      addResult('Testing HOD authentication...');
      const loginResponse = await fetch('/api/hod-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'amitabh.singh@bec.ac.in',
          password: 'hod123'
        }),
      });

      addResult(`Login response status: ${loginResponse.status}`);
      
      const contentType = loginResponse.headers.get('content-type');
      addResult(`Response content-type: ${contentType}`);

      if (contentType && contentType.includes('application/json')) {
        const loginData = await loginResponse.json();
        addResult(`Login response data: ${JSON.stringify(loginData)}`);
      } else {
        const textResponse = await loginResponse.text();
        addResult(`Login response (text): ${textResponse}`);
      }

      // Test 3: Try different HOD credentials
      addResult('Testing second HOD authentication...');
      const login2Response = await fetch('/api/hod-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'sunita.kumari@bec.ac.in',
          password: 'hod123'
        }),
      });

      const login2Data = await login2Response.json();
      addResult(`Second login response: ${JSON.stringify(login2Data)}`);

    } catch (error) {
      addResult(`Error during testing: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testInvalidLogin = async () => {
    setIsLoading(true);
    addResult('Testing invalid HOD credentials...');
    
    try {
      const loginResponse = await fetch('/api/hod-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid@email.com',
          password: 'wrongpassword'
        }),
      });

      const loginData = await loginResponse.json();
      addResult(`Invalid login response: ${JSON.stringify(loginData)}`);
    } catch (error) {
      addResult(`Error during invalid login test: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>HOD Authentication Debug</CardTitle>
            <CardDescription>Test HOD login endpoints and database connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testHODEndpoints} disabled={isLoading}>
                {isLoading ? 'Testing...' : 'Test Valid HOD Login'}
              </Button>
              <Button onClick={testInvalidLogin} disabled={isLoading} variant="outline">
                Test Invalid Login
              </Button>
              <Button onClick={() => setTestResults([])} variant="secondary">
                Clear Results
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <div className="space-y-1 text-sm font-mono">
                  {testResults.map((result, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Known HOD Test Accounts:</h3>
              <div className="space-y-2 text-sm">
                <div>• amitabh.singh@bec.ac.in / hod123 (CSE Department)</div>
                <div>• sunita.kumari@bec.ac.in / hod123 (ECE Department)</div>
                <div>• manoj.kumar@msc.ac.in / hod123 (Physics Department)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
