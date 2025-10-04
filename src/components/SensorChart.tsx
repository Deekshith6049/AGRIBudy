import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface SensorChartProps {
  sensorType: keyof Pick<Tables<'Soil_data'>, 'temperature' | 'humidity' | 'soil_moisture'>;
  title: string;
  unit: string;
  color: string;
  hours?: number;
}

export function SensorChart({ sensorType, title, unit, color, hours = 24 }: SensorChartProps) {
  const { data, loading, error } = useSensorHistory({ hours });

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

  // Transform data for chart
  const chartData = data.map((item) => ({
    time: new Date(item.monitored_at).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    value: item[sensorType],
    fullTime: item.monitored_at
  }));

  const formatValue = (value: number) => {
    if (sensorType === 'light_intensity') {
      return Math.round(value).toLocaleString();
    }
    return value.toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            {data.length > 0 && `${formatValue(data[data.length - 1][sensorType])}${unit}`}
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
                tickFormatter={(value) => formatValue(value)}
              />
              <Tooltip
                formatter={(value: number) => [formatValue(value), unit]}
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
