import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SensorGrid } from "@/components/SensorGrid";
import heroImage from "@/assets/hero-agriculture.jpg";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Wifi,
  WifiOff
} from "lucide-react";

interface OverviewSectionProps {
  sensorData: {
    temperature: number | null;
    humidity: number | null;
    soilMoisture: number | null;
    ph: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    lightIntensity: number | null;
  };
  isConnected: boolean;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: string | null;
}

// Utility function to get relative time
const getRelativeTime = (timestamp: string | null): string => {
  if (!timestamp) return "Just now";
  
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

export function OverviewSection({ sensorData, isConnected, loading, error, lastUpdated }: OverviewSectionProps) {
  // Generate alerts based on sensor data
  const generateAlerts = () => {
    const alerts = [];
    const relativeTime = getRelativeTime(lastUpdated);

    // A. Soil Moisture Alert
    if (sensorData.soilMoisture !== null && (sensorData.soilMoisture === 0 || sensorData.soilMoisture < 25)) {
      alerts.push({
        type: "warning",
        message: "Soil moisture below optimal range",
        time: relativeTime,
        icon: null
      });
    }

    // B. Soil pH Alert
    if (sensorData.ph !== null && (sensorData.ph < 5.5 || sensorData.ph > 7.5)) {
      alerts.push({
        type: "warning",
        message: "Soil pH out of optimal range",
        time: relativeTime,
        icon: null
      });
    }

    // C. Nutrient Alert (NPK combined)
    if (
      (sensorData.nitrogen !== null && sensorData.nitrogen < 50) ||
      (sensorData.phosphorus !== null && sensorData.phosphorus < 30) ||
      (sensorData.potassium !== null && sensorData.potassium < 100)
    ) {
      alerts.push({
        type: "info",
        message: "Soil nutrient imbalance detected",
        time: relativeTime,
        icon: null
      });
    }

    // Fill remaining slots with system-status alerts if needed
    const systemAlerts = [
      { type: "success", message: "Pest detection system online", time: relativeTime, icon: null },
      { type: "success", message: "Sensor data streaming active", time: relativeTime, icon: null }
    ];

    while (alerts.length < 3 && systemAlerts.length > 0) {
      alerts.push(systemAlerts.shift()!);
    }

    return alerts.slice(0, 3); // Ensure exactly 3 alerts
  };

  const alerts = generateAlerts();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="relative overflow-hidden border-0 bg-gradient-earth">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <CardContent className="relative p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Welcome to Your Smart Farm Dashboard
            </h2>
            <p className="text-muted-foreground mb-6">
              Monitor, analyze, and optimize your agricultural operations with AI-powered insights
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="glow" className="shadow-soft">
                View Live Data
              </Button>
              <Button variant="outline">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-success" />
                System Status
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-destructive" />
                Connection Issues
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Badge variant={isConnected ? "secondary" : "destructive"}>
                {isConnected ? "All Systems Online" : "ESP32 Disconnected"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {loading 
                  ? "Loading sensor data..."
                  : error
                  ? `Error: ${error}`
                  : isConnected 
                  ? lastUpdated 
                    ? `All sensors reporting normally. Last update: ${new Date(lastUpdated).toLocaleTimeString()}`
                    : "All sensors reporting normally"
                  : "Check your ESP32 connection and network settings"
                }
              </p>
            </div>
            <Button variant={isConnected ? "success" : "destructive"} size="sm">
              {isConnected ? "Healthy" : "Troubleshoot"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Sensor Data */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Real-time Sensor Readings
        </h3>
        <SensorGrid data={sensorData} />
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Recent Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="mt-0.5">
                  {alert.icon && <span className="text-base">{alert.icon}</span>}
                  {!alert.icon && alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-warning" />}
                  {!alert.icon && alert.type === "success" && <CheckCircle className="h-4 w-4 text-success" />}
                  {!alert.icon && alert.type === "info" && <Clock className="h-4 w-4 text-primary" />}
                  {!alert.icon && alert.type === "error" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}