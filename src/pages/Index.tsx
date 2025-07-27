import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";
import { OverviewSection } from "@/components/dashboard-sections/OverviewSection";
import { SoilFatigueSection } from "@/components/dashboard-sections/SoilFatigueSection";
import { FertilizerSection } from "@/components/dashboard-sections/FertilizerSection";
import { PestDetectionSection } from "@/components/dashboard-sections/PestDetectionSection";
import { PlantEmotionSection } from "@/components/dashboard-sections/PlantEmotionSection";
import { ShadowOptimizerSection } from "@/components/dashboard-sections/ShadowOptimizerSection";
import { ChatSection } from "@/components/dashboard-sections/ChatSection";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Mock sensor data - in real implementation, this would come from your ESP32 via Supabase
  const sensorData = {
    temperature: 25.3,
    humidity: 68,
    soilMoisture: 45,
    ph: 6.8,
    nitrogen: 75,
    phosphorus: 42,
    potassium: 220,
    lightIntensity: 35000,
  };

  const isConnected = true; // Mock connection status

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection sensorData={sensorData} isConnected={isConnected} />;
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
        return <OverviewSection sensorData={sensorData} isConnected={isConnected} />;
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
    </div>
  );
};

export default Index;