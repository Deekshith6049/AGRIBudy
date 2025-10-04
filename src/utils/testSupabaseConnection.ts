import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('Soil_data')
      .select('*')
      .order('monitored_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('Supabase connection successful!');
    console.log('Data:', data);
    
    return {
      success: true,
      data: data,
      message: 'Connection successful'
    };
  } catch (err) {
    console.error('Connection test failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
}

// Test real-time subscription
export async function testRealtimeSubscription() {
  console.log('Testing real-time subscription...');
  
  const channel = supabase
    .channel('test_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Soil_data'
      },
      (payload) => {
        console.log('Real-time update received:', payload);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  return channel;
}
