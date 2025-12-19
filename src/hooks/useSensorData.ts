import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type RawSoilData = Tables<'Soil_data'>;

interface SensorData {
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  soil_ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
}

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

    const fetchLatestData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          { data: tempRow, error: tempError },
          { data: humRow, error: humError },
          { data: moistureRow, error: moistureError },
          { data: phRow, error: phError },
          { data: nRow, error: nError },
          { data: pRow, error: pError },
          { data: kRow, error: kError },
        ] = await Promise.all([
          supabase
            .from<RawSoilData>('Soil_data')
            .select('temperature, monitored_at')
            .not('temperature', 'is', null)
            .order('monitored_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from<RawSoilData>('Soil_data')
            .select('humidity, monitored_at')
            .not('humidity', 'is', null)
            .order('monitored_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from<RawSoilData>('Soil_data')
            .select('soil_moisture, monitored_at')
            .not('soil_moisture', 'is', null)
            .order('monitored_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from<RawSoilData>('Soil_data')
            .select('soil_ph, monitored_at')
            .not('soil_ph', 'is', null)
            .order('monitored_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from<RawSoilData>('Soil_data')
            .select('nitrogen, monitored_at')
            .not('nitrogen', 'is', null)
            .neq('nitrogen', -1)
            .order('monitored_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from<RawSoilData>('Soil_data')
            .select('phosphorus, monitored_at')
            .not('phosphorus', 'is', null)
            .neq('phosphorus', -1)
            .order('monitored_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from<RawSoilData>('Soil_data')
            .select('potassium, monitored_at')
            .not('potassium', 'is', null)
            .neq('potassium', -1)
            .order('monitored_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const firstError =
          tempError || humError || moistureError || phError || nError || pError || kError;

        if (firstError) {
          throw firstError;
        }

        const resolved: SensorData = {
          temperature: (tempRow as any)?.temperature ?? null,
          humidity: (humRow as any)?.humidity ?? null,
          soil_moisture: (moistureRow as any)?.soil_moisture ?? null,
          soil_ph: (phRow as any)?.soil_ph ?? null,
          nitrogen: (nRow as any)?.nitrogen ?? null,
          phosphorus: (pRow as any)?.phosphorus ?? null,
          potassium: (kRow as any)?.potassium ?? null,
        };

        const timestamps: string[] = [
          (tempRow as any)?.monitored_at,
          (humRow as any)?.monitored_at,
          (moistureRow as any)?.monitored_at,
          (phRow as any)?.monitored_at,
          (nRow as any)?.monitored_at,
          (pRow as any)?.monitored_at,
          (kRow as any)?.monitored_at,
        ].filter(Boolean);

        const latestTimestamp =
          timestamps.length > 0
            ? timestamps.sort((a, b) => (a > b ? 1 : -1))[timestamps.length - 1]
            : null;

        if (mounted) {
          setData(resolved);
          setIsConnected(true);
          setLastUpdated(latestTimestamp ?? null);
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
        () => {
          if (mounted) {
            fetchLatestData();
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
