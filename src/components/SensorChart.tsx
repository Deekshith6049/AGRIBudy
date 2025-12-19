import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface SensorChartProps {
  sensorType: keyof Pick<Tables<'Soil_data'>, 'temperature' | 'humidity' | 'soil_moisture' | 'soil_ph' | 'nitrogen' | 'phosphorus' | 'potassium'>;
  title: string;
  unit: string;
  color: string;
  hours?: number;
}

export function SensorChart({ sensorType, title, unit, color, hours = 24 }: SensorChartProps) {
  // Fetch only rows where the specific sensor column is NOT NULL, limit to latest 20 entries
  const { data, loading, error } = useSensorHistory({ hours, limit: 20, sensorType });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load chart data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart, handling possible nulls safely
  const chartData = data.map((item) => {
    const rawValue = item[sensorType];
    const numericValue =
      typeof rawValue === "number"
        ? rawValue
        : rawValue == null
        ? null
        : Number(rawValue);

    return {
      time: new Date(item.monitored_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      value: numericValue,
      fullTime: item.monitored_at
    };
  });

  const formatValue = (value: number | null | undefined) => {
    if (value == null || Number.isNaN(value)) return "–";
    return value.toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            {data.length > 0 &&
              `${formatValue(
                (data[data.length - 1] as any)[sensorType] as number | null
              )}${unit}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatValue(value as number)}
              />
              <Tooltip
                formatter={(value: number | null | undefined) => [formatValue(value), unit]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]?.payload?.fullTime) {
                    return new Date(payload[0].payload.fullTime).toLocaleString();
                  }
                  return label;
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
