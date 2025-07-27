import { StatusCard } from "@/components/StatusCard";
import {
  Thermometer,
  Droplets,
  Gauge,
  Zap,
  Wind,
  Sun,
  Activity,
  Leaf
} from "lucide-react";

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  lightIntensity: number;
}

interface SensorGridProps {
  data: SensorData;
}

export function SensorGrid({ data }: SensorGridProps) {
  const getStatus = (value: number, optimal: [number, number]): "good" | "warning" | "critical" => {
    if (value >= optimal[0] && value <= optimal[1]) return "good";
    if (value < optimal[0] - 5 || value > optimal[1] + 5) return "critical";
    return "warning";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        title="Temperature"
        value={data.temperature}
        unit="°C"
        icon={<Thermometer className="h-4 w-4" />}
        status={getStatus(data.temperature, [20, 28])}
        trend="up"
      />
      
      <StatusCard
        title="Humidity"
        value={data.humidity}
        unit="%"
        icon={<Droplets className="h-4 w-4" />}
        status={getStatus(data.humidity, [60, 80])}
        trend="stable"
      />
      
      <StatusCard
        title="Soil Moisture"
        value={data.soilMoisture}
        unit="%"
        icon={<Activity className="h-4 w-4" />}
        status={getStatus(data.soilMoisture, [40, 70])}
        trend="down"
      />
      
      <StatusCard
        title="Soil pH"
        value={data.ph}
        unit="pH"
        icon={<Gauge className="h-4 w-4" />}
        status={getStatus(data.ph, [6.0, 7.5])}
        trend="stable"
      />
      
      <StatusCard
        title="Nitrogen (N)"
        value={data.nitrogen}
        unit="ppm"
        icon={<Leaf className="h-4 w-4" />}
        status={getStatus(data.nitrogen, [50, 200])}
        trend="up"
      />
      
      <StatusCard
        title="Phosphorus (P)"
        value={data.phosphorus}
        unit="ppm"
        icon={<Zap className="h-4 w-4" />}
        status={getStatus(data.phosphorus, [30, 100])}
        trend="stable"
      />
      
      <StatusCard
        title="Potassium (K)"
        value={data.potassium}
        unit="ppm"
        icon={<Wind className="h-4 w-4" />}
        status={getStatus(data.potassium, [100, 300])}
        trend="down"
      />
      
      <StatusCard
        title="Light Intensity"
        value={data.lightIntensity}
        unit="lux"
        icon={<Sun className="h-4 w-4" />}
        status={getStatus(data.lightIntensity, [30000, 50000])}
        trend="up"
      />
    </div>
  );
}