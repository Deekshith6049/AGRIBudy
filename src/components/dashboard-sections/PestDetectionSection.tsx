import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Bug,
  Eye,
  Activity,
  AlertTriangle,
  Camera,
  Waves,
  Shield,
  Zap
} from "lucide-react";

interface PestAlert {
  id: string;
  type: "vibration" | "visual" | "movement";
  severity: "low" | "medium" | "high";
  location: string;
  timestamp: string;
  confidence: number;
  pestType?: string;
}

export function PestDetectionSection() {
  const [systemActive, setSystemActive] = useState(true);
  const [vibrationSensitivity, setVibrationSensitivity] = useState(75);
  const [autoResponse, setAutoResponse] = useState(false);

  const recentAlerts: PestAlert[] = [
    {
      id: "alert-1",
      type: "vibration",
      severity: "high",
      location: "Zone A - Root Area",
      timestamp: "2 min ago",
      confidence: 87,
      pestType: "Root Borer"
    },
    {
      id: "alert-2", 
      type: "visual",
      severity: "medium",
      location: "Zone B - Leaf Surface",
      timestamp: "15 min ago",
      confidence: 73,
      pestType: "Aphids"
    },
    {
      id: "alert-3",
      type: "movement",
      severity: "low",
      location: "Zone C - Soil Surface", 
      timestamp: "1 hour ago",
      confidence: 65,
      pestType: "Cutworm"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground"; 
      case "low": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vibration": return <Waves className="h-4 w-4" />;
      case "visual": return <Eye className="h-4 w-4" />;
      case "movement": return <Activity className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bug className="h-6 w-6 text-primary" />
          Advanced Pest Detection System
        </h2>
        <Badge variant="outline" className="text-sm">
          Model: underdogquality/yolo11s-pest-detection
        </Badge>
      </div>

      {/* System Status & Controls */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detection System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">System Active</label>
                <Switch checked={systemActive} onCheckedChange={setSystemActive} />
              </div>
              <Badge variant={systemActive ? "default" : "secondary"} className="w-full justify-center">
                {systemActive ? "Monitoring Active" : "System Offline"}
              </Badge>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Vibration Sensitivity</label>
              <Progress value={vibrationSensitivity} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Current: {vibrationSensitivity}% sensitivity
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Response</label>
                <Switch checked={autoResponse} onCheckedChange={setAutoResponse} />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically trigger countermeasures when pests detected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detection Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Waves className="h-5 w-5 text-primary" />
              Vibration Sensors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Underground Activity</span>
                <Badge variant="secondary">12 Active</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Zone A:</span>
                  <span className="text-destructive">High Activity</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Zone B:</span>
                  <span className="text-success">Normal</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Zone C:</span>
                  <span className="text-success">Normal</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-5 w-5 text-primary" />
              Visual Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Camera Sensors</span>
                <Badge variant="secondary">8 Online</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Leaf Monitoring:</span>
                  <span className="text-warning">2 Alerts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Stem Analysis:</span>
                  <span className="text-success">Clear</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fruit Inspection:</span>
                  <span className="text-success">Clear</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />
              IR Proximity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Surface Movement</span>
                <Badge variant="secondary">16 Sensors</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Crawling Pests:</span>
                  <span className="text-warning">1 Detected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Flying Insects:</span>
                  <span className="text-success">Minimal</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Large Mammals:</span>
                  <span className="text-success">None</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Pest Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(alert.type)}
                    <span className="font-medium">{alert.pestType || "Unknown Pest"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity} risk
                    </Badge>
                    <Badge variant="outline">
                      {alert.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Location:</strong> {alert.location}</p>
                    <p><strong>Detection Type:</strong> {alert.type}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{alert.timestamp}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Zap className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card className="bg-gradient-growth border-0">
        <CardHeader>
          <CardTitle>AI Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium mb-2">Current Threat Assessment:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span>Root borer activity increasing in Zone A (87% confidence)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Aphid colony formation detected on leaf surfaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Beneficial insect population stable</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="glow">
                Deploy Countermeasures
              </Button>
              <Button variant="outline">
                Generate Pest Report
              </Button>
              <Button variant="secondary">
                Contact Pest Expert
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}