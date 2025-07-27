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
    temperature: number;
    humidity: number;
    soilMoisture: number;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    lightIntensity: number;
  };
  isConnected: boolean;
}

export function OverviewSection({ sensorData, isConnected }: OverviewSectionProps) {
  const alerts = [
    { type: "warning", message: "Soil moisture below optimal range in Zone A", time: "5 min ago" },
    { type: "info", message: "Fertilizer application scheduled for tomorrow", time: "1 hour ago" },
    { type: "success", message: "Pest detection system online", time: "2 hours ago" },
  ];

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
                {isConnected 
                  ? "All sensors reporting normally. Last update: 30 seconds ago"
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
                  {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-warning" />}
                  {alert.type === "success" && <CheckCircle className="h-4 w-4 text-success" />}
                  {alert.type === "info" && <Clock className="h-4 w-4 text-primary" />}
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