import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Bug,
  Eye,
  Activity,
  AlertTriangle,
  Camera,
  Waves,
  Shield,
  Zap,
  ImageOff
} from "lucide-react";

type SoilData = Tables<"Soil_data">;

type PestImageRecord = {
  id: SoilData["id"];
  monitored_at: SoilData["monitored_at"];
  pest_image_url: string | null;
  pest_severity?: string | null;
};

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
  const [pestImages, setPestImages] = useState<PestImageRecord[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<PestImageRecord | null>(null);
  const [imageLoadErrorIds, setImageLoadErrorIds] = useState<Record<string, boolean>>({});
  const [pestSeverities, setPestSeverities] = useState<Record<string, string>>({});

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

  const handleImageError = (id: string) => {
    setImageLoadErrorIds((prev) => ({ ...prev, [id]: true }));
  };

  const formatTimeAgo = (timestamp: string | null | undefined) => {
    if (!timestamp) return "Unknown time";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Unknown time";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return "Just now";

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    let isMounted = true;
    const BACKEND_URL = 'https://agribuddy-backend.onrender.com';

    const fetchPestSeverity = async (imageUrl: string): Promise<string | null> => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/pest-severity?image_url=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) {
          return null;
        }
        const data = await response.json();
        return data.pest_severity || null;
      } catch (err) {
        console.error("Error fetching pest severity:", err);
        return null;
      }
    };

    const fetchPestImages = async () => {
      try {
        setLoadingImages(true);
        setImageError(null);

        const { data, error } = await supabase
          .from("Soil_data")
          .select("id, monitored_at, pest_image_url")
          .not("pest_image_url", "is", null)
          .neq("pest_image_url", "")
          .order("monitored_at", { ascending: false })
          .limit(6);

        if (error) {
          throw error;
        }

        if (isMounted && data) {
          const images = (data ?? []) as PestImageRecord[];
          setPestImages(images);

          // Fetch severity for each image
          const severityPromises = images.map(async (record) => {
            if (record.pest_image_url) {
              const severity = await fetchPestSeverity(record.pest_image_url);
              if (severity && isMounted) {
                setPestSeverities((prev) => ({
                  ...prev,
                  [String(record.id)]: severity,
                }));
              }
            }
          });

          await Promise.all(severityPromises);
        }
      } catch (err) {
        if (isMounted) {
          setImageError(err instanceof Error ? err.message : "Failed to load pest images");
        }
      } finally {
        if (isMounted) {
          setLoadingImages(false);
        }
      }
    };

    fetchPestImages();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <div className="space-y-4">
            {loadingImages && (
              <p className="text-sm text-muted-foreground">
                Loading recent pest images...
              </p>
            )}

            {!loadingImages && imageError && (
              <p className="text-sm text-destructive">
                {imageError}
              </p>
            )}

            {!loadingImages && !imageError && pestImages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent pest images available.
              </p>
            )}

            {!loadingImages && !imageError && pestImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {pestImages.slice(0, 3).map((record) => {
                    const recordId = String(record.id);
                    const hasError = imageLoadErrorIds[recordId];

                    return (
                      <div
                        key={recordId}
                        className="border rounded-lg p-3 flex flex-col md:flex-row gap-3 bg-muted/30"
                      >
                        <button
                          type="button"
                          className="relative w-full md:w-40 overflow-hidden rounded-md bg-muted flex items-center justify-center"
                          onClick={() => {
                            if (!hasError && record.pest_image_url) {
                              setSelectedImage(record);
                            }
                          }}
                        >
                          {!hasError && record.pest_image_url ? (
                            <img
                              src={record.pest_image_url}
                              alt="Pest detection"
                              loading="lazy"
                            onError={() => handleImageError(recordId)}
                              className="max-h-[150px] w-auto object-cover md:w-full"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
                              <ImageOff className="h-6 w-6" />
                              <span className="text-xs">Image unavailable</span>
                            </div>
                          )}
                        </button>

                        <div className="flex-1 flex flex-col justify-between text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon("visual")}
                              <span className="font-medium">
                                Camera Pest Detection
                              </span>
                            </div>
                            <Badge className={getSeverityColor(
                              (() => {
                                const severity = pestSeverities[recordId]?.toUpperCase() ?? "MEDIUM";
                                if (severity === "LOW") return "low";
                                if (severity === "HIGH") return "high";
                                return "medium";
                              })()
                            )}>
                              {(() => {
                                const severity = pestSeverities[recordId]?.toUpperCase() ?? "MEDIUM";
                                if (severity === "LOW") return "low risk";
                                if (severity === "HIGH") return "high risk";
                                return "medium risk";
                              })()}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(record.monitored_at)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (!hasError && record.pest_image_url) {
                                  setSelectedImage(record);
                                }
                              }}
                            >
                              View Image
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {pestImages.slice(3, 6).map((record) => {
                    const recordId = String(record.id);
                    const hasError = imageLoadErrorIds[recordId];

                    return (
                      <div
                        key={recordId}
                        className="border rounded-lg p-3 flex flex-col md:flex-row gap-3 bg-muted/30"
                      >
                        <button
                          type="button"
                          className="relative w-full md:w-40 overflow-hidden rounded-md bg-muted flex items-center justify-center"
                          onClick={() => {
                            if (!hasError && record.pest_image_url) {
                              setSelectedImage(record);
                            }
                          }}
                        >
                          {!hasError && record.pest_image_url ? (
                            <img
                              src={record.pest_image_url}
                              alt="Pest detection"
                              loading="lazy"
                            onError={() => handleImageError(recordId)}
                              className="max-h-[150px] w-auto object-cover md:w-full"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
                              <ImageOff className="h-6 w-6" />
                              <span className="text-xs">Image unavailable</span>
                            </div>
                          )}
                        </button>

                        <div className="flex-1 flex flex-col justify-between text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon("visual")}
                              <span className="font-medium">
                                Camera Pest Detection
                              </span>
                            </div>
                            <Badge className={getSeverityColor(
                              (() => {
                                const severity = pestSeverities[recordId]?.toUpperCase() ?? "MEDIUM";
                                if (severity === "LOW") return "low";
                                if (severity === "HIGH") return "high";
                                return "medium";
                              })()
                            )}>
                              {(() => {
                                const severity = pestSeverities[recordId]?.toUpperCase() ?? "MEDIUM";
                                if (severity === "LOW") return "low risk";
                                if (severity === "HIGH") return "high risk";
                                return "medium risk";
                              })()}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(record.monitored_at)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (!hasError && record.pest_image_url) {
                                  setSelectedImage(record);
                                }
                              }}
                            >
                              View Image
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Dialog
            open={!!selectedImage}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedImage(null);
              }
            }}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Pest Image Preview</DialogTitle>
              </DialogHeader>
              {selectedImage && selectedImage.pest_image_url && (
                <div className="mt-2 space-y-2">
                  <div className="w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-lg bg-muted">
                    <img
                      src={selectedImage.pest_image_url}
                      alt="Pest detection full size"
                      className="max-h-[80vh] w-auto object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Captured {formatTimeAgo(selectedImage.monitored_at)}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
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