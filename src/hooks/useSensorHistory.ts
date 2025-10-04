import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type SensorData = Tables<'Soil_data'>;

interface UseSensorHistoryReturn {
  data: SensorData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSensorHistoryOptions {
  limit?: number;
  hours?: number;
}

export function useSensorHistory(options: UseSensorHistoryOptions = {}): UseSensorHistoryReturn {
  const { limit = 100, hours = 24 } = options;
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - hours);

      const { data: sensorData, error: fetchError } = await supabase
        .from('Soil_data')
        .select('*')
        .gte('monitored_at', hoursAgo.toISOString())
        .order('monitored_at', { ascending: true })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      setData(sensorData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit, hours]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
