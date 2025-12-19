import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";
import { OverviewSection } from "@/components/dashboard-sections/OverviewSection";
import { DataVisualizationSection } from "@/components/dashboard-sections/DataVisualizationSection";
import { SoilFatigueSection } from "@/components/dashboard-sections/SoilFatigueSection";
import { PestDetectionSection } from "@/components/dashboard-sections/PestDetectionSection";
import { AIChatAgent } from "@/components/AIChatAgent";
import { useSensorData } from "@/hooks/useSensorData";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Real-time sensor data from Supabase
  const { data: sensorDataRaw, loading, error, isConnected, lastUpdated } = useSensorData();

  // Transform data to match component interface, using latest resolved values
  const sensorData = sensorDataRaw ? {
    temperature: sensorDataRaw.temperature,
    humidity: sensorDataRaw.humidity,
    soilMoisture: sensorDataRaw.soil_moisture,
    ph: sensorDataRaw.soil_ph,
    nitrogen: sensorDataRaw.nitrogen,
    phosphorus: sensorDataRaw.phosphorus,
    potassium: sensorDataRaw.potassium,
    lightIntensity: 35000, // Synthetic value (no sensor yet)
  } : {
    temperature: null,
    humidity: null,
    soilMoisture: null,
    ph: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    lightIntensity: null,
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection 
            sensorData={sensorData} 
            isConnected={isConnected}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
          />
        );
      case "data-visualization":
        return <DataVisualizationSection />;
      case "soil-fatigue":
        return <SoilFatigueSection />;
      case "pest-detection":
        return <PestDetectionSection />;
      default:
        return (
          <OverviewSection 
            sensorData={sensorData} 
            isConnected={isConnected}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          farmerName="John Smith"
        />
        
        <main 
          className={cn(
            "flex-1 p-6 transition-all duration-300",
            "bg-gradient-earth min-h-screen"
          )}
        >
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>

      {/* AI Chat Agent - Floating across all pages */}
      <AIChatAgent />
    </div>
  );
};

export default Index;