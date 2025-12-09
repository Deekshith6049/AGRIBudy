import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Leaf, Droplets, Bug, Thermometer, Sun, MessageCircle, BarChart3, Settings, ChevronLeft, Sprout, Truck } from "lucide-react";
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}
const navigationItems = [{
  id: "overview",
  label: "Dashboard Overview",
  icon: Home
}, {
  id: "data-visualization",
  label: "Data Visualization",
  icon: BarChart3
}, {
  id: "soil-fatigue",
  label: "Soil Fatigue Predictor",
  icon: Leaf
}, {
  id: "fertilizer",
  label: "Smart Fertilizer System",
  icon: Truck
}, {
  id: "pest-detection",
  label: "Pest Detection",
  icon: Bug
}, {
  id: "plant-emotion",
  label: "Plant Health Monitor",
  icon: Thermometer
}, {
  id: "shadow-optimizer",
  label: "Growth Optimizer",
  icon: Sun
}, {
  id: "chat",
  label: "AI Assistant",
  icon: MessageCircle
}];
export function Sidebar({
  isCollapsed,
  onToggle,
  activeSection,
  onSectionChange
}: SidebarProps) {
  return <div className={cn("bg-card border-r transition-all duration-300 ease-in-out relative", isCollapsed ? "w-16" : "w-64")}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isCollapsed && <div className="flex items-center gap-2">
                <Sprout className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">AGRIBudy</span>
              </div>}
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map(item => {
          const Icon = item.icon;
          return <Button key={item.id} variant={activeSection === item.id ? "secondary" : "ghost"} className={cn("w-full justify-start", isCollapsed ? "px-2" : "px-3", activeSection === item.id && "bg-accent/50 text-accent-foreground")} onClick={() => onSectionChange(item.id)}>
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </Button>;
        })}
        </nav>

        <div className="p-2 border-t">
          <Button variant="ghost" className={cn("w-full justify-start", isCollapsed ? "px-2" : "px-3")}>
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </Button>
        </div>
      </div>
    </div>;
}