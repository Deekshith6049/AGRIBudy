import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type SensorData = Tables<'Soil_data'>;

interface UseSensorDataReturn {
  data: SensorData | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: string | null;
}

export function useSensorData(): UseSensorDataReturn {
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Initial data fetch
    const fetchLatestData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sensorData, error: fetchError } = await supabase
          .from('Soil_data')
          .select('*')
          .order('monitored_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setData(sensorData);
          setIsConnected(true);
          setLastUpdated(new Date().toISOString());
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
          setIsConnected(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up real-time subscription
    const channel = supabase
      .channel('soil_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Soil_data'
        },
        (payload) => {
          if (mounted) {
            console.log('Real-time update received:', payload);
            
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setData(payload.new as SensorData);
              setIsConnected(true);
              setLastUpdated(new Date().toISOString());
            }
          }
        }
      )
      .subscribe((status) => {
        if (mounted) {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false);
            setError('Real-time connection lost');
          }
        }
      });

    // Fetch initial data
    fetchLatestData();

    // Cleanup
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    data,
    loading,
    error,
    isConnected,
    lastUpdated
  };
}
