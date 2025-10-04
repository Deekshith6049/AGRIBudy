import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testSupabaseConnection, testRealtimeSubscription } from '@/utils/testSupabaseConnection';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

export function ConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  } | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('Not tested');
  const [isTestingInsert, setIsTestingInsert] = useState(false);
  const [insertResult, setInsertResult] = useState<any>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setRealtimeStatus('Testing...');

    try {
      // Test basic connection
      const result = await testSupabaseConnection();
      
      setTestResult({
        success: result.success,
        message: result.success ? result.message : result.error,
        data: result.data,
        error: result.error
      });

      if (result.success) {
        // Test real-time subscription
        const channel = await testRealtimeSubscription();
        setRealtimeStatus('Real-time subscription active');
        
        // Clean up after 5 seconds
        setTimeout(() => {
          channel.unsubscribe();
          setRealtimeStatus('Real-time test completed');
        }, 5000);
      } else {
        setRealtimeStatus('Skipped - basic connection failed');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
        data: null,
        error: error
      });
      setRealtimeStatus('Failed');
    } finally {
      setIsTesting(false);
    }
  };

  const testInsert = async () => {
    setIsTestingInsert(true);
    setInsertResult(null);

    try {
      const testData = {
        temperature: 25.5,
        humidity: 65.0,
        soil_moisture: 50.0
      };

      const { data, error } = await supabase
        .from('Soil_data')
        .insert([testData])
        .select();

      if (error) {
        setInsertResult({
          success: false,
          error: error,
          message: error.message
        });
      } else {
        setInsertResult({
          success: true,
          data: data,
          message: 'Test insert successful!'
        });
      }
    } catch (err) {
      setInsertResult({
        success: false,
        error: err,
        message: err instanceof Error ? err.message : 'Insert test failed'
      });
    } finally {
      setIsTestingInsert(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Database Connection'
            )}
          </Button>
          
          <Button 
            onClick={testInsert} 
            disabled={isTestingInsert}
            variant="outline"
            className="w-full"
          >
            {isTestingInsert ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Insert...
              </>
            ) : (
              'Test Data Insert'
            )}
          </Button>
        </div>

        {testResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? "Connected" : "Failed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {testResult.message}
            </p>
            
            {/* Real-time Status */}
            <div className="flex items-center gap-2">
              {realtimeStatus.includes('active') ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : realtimeStatus.includes('Failed') ? (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm text-muted-foreground">
                Real-time: {realtimeStatus}
              </span>
            </div>

            {testResult.data && (
              <div>
                <p className="text-sm font-medium mb-2">Sample Data:</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}

            {testResult.error && (
              <div>
                <p className="text-sm font-medium mb-2 text-red-600">Error Details:</p>
                <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-32 text-red-700">
                  {JSON.stringify(testResult.error, null, 2)}
                </pre>
                
                {testResult.error?.code === '42501' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-800 mb-2">🔒 Row Level Security Issue</p>
                    <p className="text-xs text-blue-700 mb-2">
                      Data insertion is blocked by RLS policy. To fix this:
                    </p>
                    <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                      <li>Go to your Supabase Dashboard</li>
                      <li>Navigate to Authentication → Policies</li>
                      <li>Find the Soil_data table</li>
                      <li>Either disable RLS or create an insert policy</li>
                    </ol>
                    <p className="text-xs text-blue-600 mt-2">
                      See SUPABASE_SETUP_GUIDE.md for detailed instructions.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {insertResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {insertResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={insertResult.success ? "default" : "destructive"}>
                {insertResult.success ? "Insert Success" : "Insert Failed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {insertResult.message}
            </p>
            
            {insertResult.data && (
              <div>
                <p className="text-sm font-medium mb-2">Inserted Data:</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(insertResult.data, null, 2)}
                </pre>
              </div>
            )}

            {insertResult.error && (
              <div>
                <p className="text-sm font-medium mb-2 text-red-600">Insert Error:</p>
                <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-32 text-red-700">
                  {JSON.stringify(insertResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
