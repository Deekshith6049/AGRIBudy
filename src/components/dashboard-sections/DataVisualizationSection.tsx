import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorChart } from "@/components/SensorChart";
import { ConnectionTest } from "@/components/ConnectionTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Calendar } from "lucide-react";
import { useState } from "react";

export function DataVisualizationSection() {
  const [timeRange, setTimeRange] = useState<24 | 48 | 168>(24); // 24h, 48h, 1 week

  const timeRangeOptions = [
    { value: 24, label: "24 Hours" },
    { value: 48, label: "48 Hours" },
    { value: 168, label: "1 Week" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sensor Data Visualization</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time Range:</span>
            </div>
            <div className="flex gap-2">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(option.value as 24 | 48 | 168)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <ConnectionTest />

      {/* Charts */}
      <Tabs defaultValue="environmental" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="soil">Soil Analysis</TabsTrigger>
          <TabsTrigger value="nutrients">Nutrients</TabsTrigger>
        </TabsList>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SensorChart
              sensorType="temperature"
              title="Temperature"
              unit="°C"
              color="#ef4444"
              hours={timeRange}
            />
            <SensorChart
              sensorType="humidity"
              title="Humidity"
              unit="%"
              color="#3b82f6"
              hours={timeRange}
            />
            <SensorChart
              sensorType="soil_moisture"
              title="Soil Moisture"
              unit="%"
              color="#8b5cf6"
              hours={timeRange}
            />
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>Additional sensors (pH, nutrients, light intensity) are not available in the current database schema.</p>
                  <p className="text-sm mt-2">Only temperature, humidity, and soil moisture data is being fetched from Supabase.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="soil" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SensorChart
              sensorType="soil_moisture"
              title="Soil Moisture"
              unit="%"
              color="#8b5cf6"
              hours={timeRange}
            />
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>Soil pH data is not available in the current database schema.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nutrients" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>Nutrient data (Nitrogen, Phosphorus, Potassium) is not available in the current database schema.</p>
                  <p className="text-sm mt-2">The Soil_data table only contains: id, temperature, humidity, and soil_moisture columns.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
