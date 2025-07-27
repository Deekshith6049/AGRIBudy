import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Thermometer,
  Camera,
  Heart,
  Droplets,
  AlertCircle,
  TrendingUp,
  Smile,
  Frown,
  Meh
} from "lucide-react";

interface PlantData {
  id: string;
  name: string;
  stressLevel: number; // 1-5 scale
  temperature: number;
  leafHealth: number;
  waterStress: number;
  mood: "happy" | "neutral" | "stressed";
  recommendations: string[];
}

export function PlantEmotionSection() {
  const [selectedPlant, setSelectedPlant] = useState("plant-1");

  const plantsData: PlantData[] = [
    {
      id: "plant-1",
      name: "Tomato Section A",
      stressLevel: 2,
      temperature: 24.5,
      leafHealth: 85,
      waterStress: 20,
      mood: "happy",
      recommendations: ["Maintain current watering schedule", "Optimal temperature range"]
    },
    {
      id: "plant-2", 
      name: "Pepper Section B",
      stressLevel: 4,
      temperature: 28.2,
      leafHealth: 65,
      waterStress: 75,
      mood: "stressed",
      recommendations: ["Increase irrigation immediately", "Provide shade during peak hours", "Check for pest damage"]
    },
    {
      id: "plant-3",
      name: "Lettuce Section C",
      stressLevel: 3,
      temperature: 22.1,
      leafHealth: 78,
      waterStress: 45,
      mood: "neutral",
      recommendations: ["Monitor water levels closely", "Consider nutrient supplementation"]
    }
  ];

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": return <Smile className="h-5 w-5 text-success" />;
      case "neutral": return <Meh className="h-5 w-5 text-warning" />;
      case "stressed": return <Frown className="h-5 w-5 text-destructive" />;
      default: return <Meh className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStressColor = (level: number) => {
    if (level <= 2) return "text-success";
    if (level <= 3) return "text-warning";
    return "text-destructive";
  };

  const getStressLabel = (level: number) => {
    if (level <= 2) return "Low Stress";
    if (level <= 3) return "Moderate Stress";
    return "High Stress";
  };

  const currentPlant = plantsData.find(p => p.id === selectedPlant) || plantsData[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Plant Emotion Detection System
        </h2>
        <Badge variant="outline" className="text-sm">
          Model: foduucom/plant-leaf-detection-and-classification
        </Badge>
      </div>

      {/* Plant Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Plant Monitoring Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plantsData.map((plant) => (
              <div
                key={plant.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlant === plant.id ? "border-primary bg-accent/50" : "hover:border-muted-foreground"
                }`}
                onClick={() => setSelectedPlant(plant.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{plant.name}</h4>
                  {getMoodIcon(plant.mood)}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Stress Level:</span>
                    <span className={getStressColor(plant.stressLevel)}>
                      {plant.stressLevel}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leaf Health:</span>
                    <span className={plant.leafHealth >= 80 ? "text-success" : plant.leafHealth >= 60 ? "text-warning" : "text-destructive"}>
                      {plant.leafHealth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getMoodIcon(currentPlant.mood)}
            {currentPlant.name} - Detailed Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="emotion" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="emotion">Plant Emotion</TabsTrigger>
              <TabsTrigger value="thermal">Thermal Data</TabsTrigger>
              <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="emotion" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Stress Assessment</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Overall Stress Level</span>
                        <span className={`font-medium ${getStressColor(currentPlant.stressLevel)}`}>
                          {getStressLabel(currentPlant.stressLevel)}
                        </span>
                      </div>
                      <Progress value={(currentPlant.stressLevel / 5) * 100} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Water Stress</span>
                        <span className="font-medium">{currentPlant.waterStress}%</span>
                      </div>
                      <Progress value={currentPlant.waterStress} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Leaf Health</span>
                        <span className="font-medium">{currentPlant.leafHealth}%</span>
                      </div>
                      <Progress value={currentPlant.leafHealth} className="h-3" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Plant Mood Indicator</h4>
                  <div className="text-center p-6 border rounded-lg bg-muted/50">
                    <div className="mb-3">
                      {getMoodIcon(currentPlant.mood)}
                    </div>
                    <div className="text-2xl font-bold capitalize mb-2">
                      {currentPlant.mood}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on thermal + visual fusion analysis
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="thermal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Thermometer className="h-5 w-5" />
                      Thermal IR Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Current Temperature:</span>
                        <span className="font-medium">{currentPlant.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimal Range:</span>
                        <span className="text-muted-foreground">20-26°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heat Stress Risk:</span>
                        <span className={currentPlant.temperature > 26 ? "text-warning" : "text-success"}>
                          {currentPlant.temperature > 26 ? "Moderate" : "Low"}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((currentPlant.temperature / 35) * 100, 100)} 
                        className="h-3" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-5 w-5" />
                      Temperature Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last 1hr avg:</span>
                        <span>{(currentPlant.temperature - 0.5).toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily max:</span>
                        <span>{(currentPlant.temperature + 3.2).toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily min:</span>
                        <span>{(currentPlant.temperature - 5.8).toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend:</span>
                        <span className="text-warning">Gradually rising</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Visual Leaf Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="font-medium">Detected Conditions</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Wilting Signs:</span>
                          <span className={currentPlant.stressLevel > 3 ? "text-warning" : "text-success"}>
                            {currentPlant.stressLevel > 3 ? "Moderate" : "None"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Color Changes:</span>
                          <span className="text-success">Normal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Leaf Damage:</span>
                          <span className="text-success">Minimal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth Rate:</span>
                          <span className="text-success">Healthy</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium">AI Confidence Scores</h5>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Stress Detection:</span>
                            <span>89%</span>
                          </div>
                          <Progress value={89} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Health Assessment:</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Species Recognition:</span>
                            <span>96%</span>
                          </div>
                          <Progress value={96} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-growth border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            AI Care Recommendations for {currentPlant.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium mb-2">Immediate Actions Required:</h4>
              <ul className="space-y-1">
                {currentPlant.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="glow">
                Apply Recommendations
              </Button>
              <Button variant="outline">
                Schedule Care Tasks
              </Button>
              <Button variant="secondary">
                Generate Health Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}