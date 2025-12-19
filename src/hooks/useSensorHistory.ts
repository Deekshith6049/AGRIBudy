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
  sensorType?: keyof Pick<Tables<'Soil_data'>, 'temperature' | 'humidity' | 'soil_moisture' | 'soil_ph' | 'nitrogen' | 'phosphorus' | 'potassium'>;
}

export function useSensorHistory(options: UseSensorHistoryOptions = {}): UseSensorHistoryReturn {
  const { limit = 20, hours = 24, sensorType } = options;
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - hours);

      // Base query: select needed columns and filter by time window
      let query = supabase
        .from('Soil_data')
        .select('id, monitored_at, temperature, humidity, soil_moisture, pest_detected, pest_image_url, soil_ph, nitrogen, phosphorus, potassium')
        .gte('monitored_at', hoursAgo.toISOString());

      // If sensorType provided, exclude NULLs for that column so each chart fetches its own valid rows
      if (sensorType) {
        // Use PostgREST .not to check IS NOT NULL
        query = query.not(sensorType as string, 'is', null);
      }

      // Order DESC to get latest values first, limit to latest N, then reverse below
      const { data: sensorData, error: fetchError } = await query
        .order('monitored_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      // Reverse so time flows left -> right when plotted
      setData((sensorData || []).slice().reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, hours, options.sensorType]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
