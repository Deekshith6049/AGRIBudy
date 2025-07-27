import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Truck,
  MapPin,
  Zap,
  Timer,
  Settings,
  Play,
  Pause,
  RotateCw
} from "lucide-react";

interface Zone {
  id: string;
  name: string;
  needsLevel: "low" | "medium" | "high";
  npkValues: { n: number; p: number; k: number };
  lastApplication: string;
  status: "active" | "scheduled" | "completed";
}

export function FertilizerSection() {
  const [autoMode, setAutoMode] = useState(true);
  const [dispenserSpeed, setDispenserSpeed] = useState([50]);
  const [systemActive, setSystemActive] = useState(false);

  const zones: Zone[] = [
    {
      id: "zone-a",
      name: "Zone A - North Field",
      needsLevel: "high",
      npkValues: { n: 45, p: 32, k: 180 },
      lastApplication: "3 days ago",
      status: "scheduled"
    },
    {
      id: "zone-b", 
      name: "Zone B - South Field",
      needsLevel: "medium",
      npkValues: { n: 85, p: 55, k: 220 },
      lastApplication: "1 week ago",
      status: "active"
    },
    {
      id: "zone-c",
      name: "Zone C - East Field", 
      needsLevel: "low",
      npkValues: { n: 110, p: 75, k: 280 },
      lastApplication: "2 weeks ago",
      status: "completed"
    }
  ];

  const getNeedsColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-primary text-primary-foreground";
      case "scheduled": return "bg-warning text-warning-foreground";
      case "completed": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          AI-Guided Targeted Fertilizer Delivery
        </h2>
        <Badge variant="outline" className="text-sm">
          Model: DNgigi/FertiliserApplication
        </Badge>
      </div>

      {/* System Control Panel */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Mode</label>
                <Switch checked={autoMode} onCheckedChange={setAutoMode} />
              </div>
              <p className="text-xs text-muted-foreground">
                AI determines optimal fertilizer distribution automatically
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Dispenser Speed</label>
              <Slider
                value={dispenserSpeed}
                onValueChange={setDispenserSpeed}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Current: {dispenserSpeed[0]}% speed
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={systemActive ? "destructive" : "success"}
                  size="sm"
                  onClick={() => setSystemActive(!systemActive)}
                  className="flex-1"
                >
                  {systemActive ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Stop System
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Start System
                    </>
                  )}
                </Button>
              </div>
              <Badge variant={systemActive ? "default" : "secondary"} className="w-full justify-center">
                {systemActive ? "System Active" : "System Idle"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Micro-Zone Analysis & Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{zone.name}</h4>
                  <div className="flex gap-2">
                    <Badge className={getNeedsColor(zone.needsLevel)}>
                      {zone.needsLevel} priority
                    </Badge>
                    <Badge className={getStatusColor(zone.status)}>
                      {zone.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Current NPK Levels</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Nitrogen (N):</span>
                        <span className={zone.npkValues.n < 60 ? "text-destructive" : "text-success"}>
                          {zone.npkValues.n} ppm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phosphorus (P):</span>
                        <span className={zone.npkValues.p < 50 ? "text-destructive" : "text-success"}>
                          {zone.npkValues.p} ppm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potassium (K):</span>
                        <span className={zone.npkValues.k < 200 ? "text-warning" : "text-success"}>
                          {zone.npkValues.k} ppm
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span>Last application: {zone.lastApplication}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Zap className="h-4 w-4 mr-1" />
                        Apply Now
                      </Button>
                      <Button size="sm" variant="ghost">
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-growth border-0">
        <CardHeader>
          <CardTitle>AI Dispensing Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium mb-2">Current AI Analysis:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span><strong>Zone A:</strong> Requires immediate nitrogen application (45% deficiency)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span><strong>Zone B:</strong> Moderate phosphorus supplementation needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span><strong>Zone C:</strong> Optimal nutrient levels maintained</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="glow">
                Execute AI Recommendations
              </Button>
              <Button variant="outline">
                Schedule Batch Application
              </Button>
              <Button variant="secondary">
                Generate Application Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}