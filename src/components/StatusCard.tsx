import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  status: "good" | "warning" | "critical" | "neutral";
  trend?: "up" | "down" | "stable";
  className?: string;
}

const statusStyles = {
  good: "border-success/20 bg-success/5",
  warning: "border-warning/20 bg-warning/5",
  critical: "border-destructive/20 bg-destructive/5",
  neutral: "border-border bg-card"
};

const statusColors = {
  good: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
  neutral: "text-muted-foreground"
};

export function StatusCard({ 
  title, 
  value, 
  unit, 
  icon, 
  status, 
  trend, 
  className 
}: StatusCardProps) {
  return (
    <Card className={cn(statusStyles[status], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-1 rounded-lg", statusColors[status])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-1">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          {unit && (
            <div className="text-sm text-muted-foreground">
              {unit}
            </div>
          )}
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <span className={cn(
              trend === "up" && "text-success",
              trend === "down" && "text-destructive"
            )}>
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
            </span>
            <span>vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}