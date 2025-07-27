import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Sun,
  Camera,
  Move,
  RotateCw,
  MapPin,
  Lightbulb,
  Target,
  Settings
} from "lucide-react";

interface LightZone {
  id: string;
  name: string;
  lightLevel: number; // lux
  shadowCoverage: number; // percentage
  optimalLevel: number;
  status: "optimal" | "low" | "critical";
  recommendation: string;
}

export function ShadowOptimizerSection() {
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [reflectorAngle, setReflectorAngle] = useState([45]);
  const [systemActive, setSystemActive] = useState(true);

  const lightZones: LightZone[] = [
    {
      id: "zone-1",
      name: "North Section",
      lightLevel: 15000,
      shadowCoverage: 65,
      optimalLevel: 30000,
      status: "critical",
      recommendation: "Deploy 3 reflectors at 30° angle"
    },
    {
      id: "zone-2", 
      name: "Central Area",
      lightLevel: 28000,
      shadowCoverage: 25,
      optimalLevel: 30000,
      status: "low",
      recommendation: "Adjust existing reflector to 45°"
    },
    {
      id: "zone-3",
      name: "South Section",
      lightLevel: 32000,
      shadowCoverage: 10,
      optimalLevel: 30000,
      status: "optimal",
      recommendation: "Maintain current setup"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "bg-success text-success-foreground";
      case "low": return "bg-warning text-warning-foreground";
      case "critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return "text-success";
    if (efficiency >= 65) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sun className="h-6 w-6 text-primary" />
          Shadow-Aware Crop Growth Optimizer
        </h2>
        <Badge variant="outline" className="text-sm">
          Model: CropNet/CropNet
        </Badge>
      </div>

      {/* System Control Panel */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Optimization</label>
                <Switch checked={autoOptimization} onCheckedChange={setAutoOptimization} />
              </div>
              <p className="text-xs text-muted-foreground">
                AI automatically adjusts reflectors based on shadow mapping
              </p>
              <Badge variant={autoOptimization ? "default" : "secondary"} className="w-full justify-center">
                {autoOptimization ? "AI Active" : "Manual Mode"}
              </Badge>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Reflector Angle</label>
              <Slider
                value={reflectorAngle}
                onValueChange={setReflectorAngle}
                max={90}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Current: {reflectorAngle[0]}° from horizontal
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">System Status</label>
                <Switch checked={systemActive} onCheckedChange={setSystemActive} />
              </div>
              <Badge variant={systemActive ? "default" : "secondary"} className="w-full justify-center">
                {systemActive ? "Optimizing" : "Standby"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Light Mapping Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Real-time Light & Shadow Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {lightZones.map((zone) => (
              <div key={zone.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {zone.name}
                  </h4>
                  <Badge className={getStatusColor(zone.status)}>
                    {zone.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Light Intensity</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Current:</span>
                        <span className="font-medium">{zone.lightLevel.toLocaleString()} lux</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Optimal:</span>
                        <span className="text-muted-foreground">{zone.optimalLevel.toLocaleString()} lux</span>
                      </div>
                      <Progress 
                        value={(zone.lightLevel / zone.optimalLevel) * 100} 
                        className="h-2" 
                      />
                      <div className={`text-xs ${getEfficiencyColor((zone.lightLevel / zone.optimalLevel) * 100)}`}>
                        {Math.round((zone.lightLevel / zone.optimalLevel) * 100)}% of optimal
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Shadow Coverage</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Covered:</span>
                        <span className="font-medium">{zone.shadowCoverage}%</span>
                      </div>
                      <Progress value={zone.shadowCoverage} className="h-2" />
                      <div className={`text-xs ${zone.shadowCoverage > 50 ? "text-destructive" : zone.shadowCoverage > 25 ? "text-warning" : "text-success"}`}>
                        {zone.shadowCoverage > 50 ? "High shadow" : zone.shadowCoverage > 25 ? "Moderate shadow" : "Low shadow"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="font-medium">AI Recommendation:</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{zone.recommendation}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Target className="h-4 w-4 mr-1" />
                        Apply
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

      {/* Reflector Control System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Move className="h-5 w-5" />
              Active Reflector Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Reflectors:</span>
                <Badge variant="secondary">12 Units</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>North Sector:</span>
                  <span className="text-warning">3 Adjusting</span>
                </div>
                <div className="flex justify-between">
                  <span>Central Sector:</span>
                  <span className="text-success">4 Optimal</span>
                </div>
                <div className="flex justify-between">
                  <span>South Sector:</span>
                  <span className="text-success">5 Optimal</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                <RotateCw className="h-4 w-4 mr-1" />
                Recalibrate All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-5 w-5" />
              Shadow Detection Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Camera Network:</span>
                <Badge variant="secondary">8 Online</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Coverage Area:</span>
                  <span className="text-success">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Shadow Tracking:</span>
                  <span className="text-success">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Light Sensors:</span>
                  <span className="text-success">16 LDR Active</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                <Camera className="h-4 w-4 mr-1" />
                View Live Feed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Results */}
      <Card className="bg-gradient-growth border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            AI Optimization Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium mb-2">Current Optimization Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Light Efficiency:</span>
                  <div className="text-lg font-bold text-warning">73%</div>
                  <span className="text-xs text-muted-foreground">↑ 18% improvement</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Shadow Reduction:</span>
                  <div className="text-lg font-bold text-success">42%</div>
                  <span className="text-xs text-muted-foreground">↓ 25% less shadows</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Growth Potential:</span>
                  <div className="text-lg font-bold text-success">+28%</div>
                  <span className="text-xs text-muted-foreground">Projected increase</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium mb-2">Recommended Actions:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span>Deploy additional reflectors in North Section for 35% light boost</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Adjust reflector angles by 15° during morning hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Current South Section setup is optimal</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="glow">
                Execute Full Optimization
              </Button>
              <Button variant="outline">
                Generate Light Map Report
              </Button>
              <Button variant="secondary">
                Schedule Daily Adjustments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}