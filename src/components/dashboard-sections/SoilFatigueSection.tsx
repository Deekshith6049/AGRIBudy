import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  AlertCircle,
  TrendingDown,
  Calendar,
  Beaker,
  RotateCcw
} from "lucide-react";

export function SoilFatigueSection() {
  const fatigueScore = 65; // 0-100 scale
  const npkData = {
    nitrogen: { current: 45, optimal: 120, status: "low" },
    phosphorus: { current: 35, optimal: 80, status: "low" },
    potassium: { current: 180, optimal: 250, status: "moderate" }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return "text-success";
    if (score <= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreStatus = (score: number) => {
    if (score <= 30) return "Healthy";
    if (score <= 60) return "Moderate Fatigue";
    return "High Fatigue";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          AI-Driven Soil Fatigue Predictor
        </h2>
        <Badge variant="outline" className="text-sm">
          Model: DNgigi/FertiliserApplication
        </Badge>
      </div>

      {/* Fatigue Score Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Current Soil Fatigue Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(fatigueScore)}`}>
                {fatigueScore}/100
              </div>
              <p className="text-muted-foreground mt-1">{getScoreStatus(fatigueScore)}</p>
            </div>
            <Progress value={fatigueScore} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Healthy (0-30)</span>
              <span>Moderate (31-60)</span>
              <span>Critical (61-100)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NPK Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            NPK Nutrient Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(npkData).map(([nutrient, data]) => (
              <div key={nutrient} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{nutrient}</h4>
                  <Badge 
                    variant={data.status === "low" ? "destructive" : data.status === "moderate" ? "secondary" : "default"}
                  >
                    {data.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current:</span>
                    <span className="font-medium">{data.current} ppm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Optimal:</span>
                    <span className="font-medium">{data.optimal} ppm</span>
                  </div>
                  <Progress value={(data.current / data.optimal) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-growth border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium mb-2">Immediate Actions Required:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  Apply nitrogen-rich fertilizer (120 kg/hectare)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  Consider phosphorus supplementation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Soil pH levels are optimal
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium mb-2">Long-term Strategy:</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Based on historical data and current fatigue levels, the AI model recommends:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">2-week rest period after harvest</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span className="text-sm">Plant legumes for nitrogen fixation</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="glow">
          Generate Detailed Report
        </Button>
        <Button variant="outline">
          Schedule Soil Treatment
        </Button>
        <Button variant="secondary">
          View Historical Data
        </Button>
      </div>
    </div>
  );
}