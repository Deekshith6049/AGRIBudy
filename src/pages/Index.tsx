import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";
import { OverviewSection } from "@/components/dashboard-sections/OverviewSection";
import { DataVisualizationSection } from "@/components/dashboard-sections/DataVisualizationSection";
import { SoilFatigueSection } from "@/components/dashboard-sections/SoilFatigueSection";
import { FertilizerSection } from "@/components/dashboard-sections/FertilizerSection";
import { PestDetectionSection } from "@/components/dashboard-sections/PestDetectionSection";
import { PlantEmotionSection } from "@/components/dashboard-sections/PlantEmotionSection";
import { ShadowOptimizerSection } from "@/components/dashboard-sections/ShadowOptimizerSection";
import { ChatSection } from "@/components/dashboard-sections/ChatSection";
import { AIChatAgent } from "@/components/AIChatAgent";
import { useSensorData } from "@/hooks/useSensorData";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Real-time sensor data from Supabase
  const { data: sensorDataRaw, loading, error, isConnected, lastUpdated } = useSensorData();

  // Transform data to match component interface
  const sensorData = sensorDataRaw ? {
    temperature: sensorDataRaw.temperature,
    humidity: sensorDataRaw.humidity,
    soilMoisture: sensorDataRaw.soil_moisture,
    ph: 6.8, // Default value since this column doesn't exist
    nitrogen: 75, // Default value since this column doesn't exist
    phosphorus: 45, // Default value since this column doesn't exist
    potassium: 200, // Default value since this column doesn't exist
    lightIntensity: 35000, // Default value since this column doesn't exist
  } : {
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    ph: 6.8,
    nitrogen: 75,
    phosphorus: 45,
    potassium: 200,
    lightIntensity: 35000,
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
      case "fertilizer":
        return <FertilizerSection />;
      case "pest-detection":
        return <PestDetectionSection />;
      case "plant-emotion":
        return <PlantEmotionSection />;
      case "shadow-optimizer":
        return <ShadowOptimizerSection />;
      case "chat":
        return <ChatSection />;
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