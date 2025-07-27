import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Lightbulb,
  AlertCircle,
  Leaf,
  Bug
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  message: string;
  timestamp: string;
  category?: "general" | "pest" | "soil" | "fertilizer" | "irrigation";
}

export function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant", 
      message: "Hello! I'm your AI Agricultural Assistant. I can help you with pest detection, soil analysis, fertilizer recommendations, irrigation planning, and general farming questions. What would you like to know?",
      timestamp: "10:30 AM",
      category: "general"
    },
    {
      id: "2",
      type: "user",
      message: "My tomato plants in Zone A are showing some yellowing leaves. What could be the cause?",
      timestamp: "10:32 AM",
      category: "general"
    },
    {
      id: "3",
      type: "assistant",
      message: "Based on your Zone A sensor data, I can see elevated stress levels and low nitrogen readings (45 ppm vs optimal 120 ppm). The yellowing is likely nitrogen deficiency combined with possible overwatering. Your soil moisture is at 65% which is slightly high. I recommend:\n\n1. Reduce watering frequency by 30%\n2. Apply nitrogen-rich fertilizer (120 kg/hectare)\n3. Monitor the pest detection system as stressed plants attract more pests\n\nWould you like me to schedule an automatic fertilizer application?",
      timestamp: "10:33 AM",
      category: "fertilizer"
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");

  const quickQuestions = [
    "What's the optimal watering schedule for today?",
    "Are there any pest alerts I should be concerned about?", 
    "When should I apply fertilizer next?",
    "How is my soil health looking?",
    "What's the weather forecast impact on my crops?"
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "general"
    };

    // Simulate AI response
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant", 
      message: "I understand your question. Let me analyze your current sensor data and provide recommendations based on your specific situation...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "general"
    };

    setMessages(prev => [...prev, newUserMessage, aiResponse]);
    setInputMessage("");
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "pest": return <Bug className="h-3 w-3" />;
      case "soil": return <Leaf className="h-3 w-3" />;
      case "fertilizer": return <Lightbulb className="h-3 w-3" />;
      default: return <MessageCircle className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "pest": return "bg-destructive/10 text-destructive";
      case "soil": return "bg-success/10 text-success";
      case "fertilizer": return "bg-warning/10 text-warning";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          AI Agricultural Assistant
        </h2>
        <Badge variant="outline" className="text-sm">
          Powered by Agricultural AI Models
        </Badge>
      </div>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5" />
            Quick Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            Chat with AI Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.type === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                      {message.category && message.category !== "general" && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getCategoryColor(message.category)}`}
                        >
                          {getCategoryIcon(message.category)}
                          <span className="ml-1 capitalize">{message.category}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your crops, soil, pests, or farming advice..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <Card className="bg-gradient-growth border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            AI Assistant Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Real-time Analysis:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Soil health and NPK level interpretation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Pest identification and treatment advice</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Plant stress and emotion analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Weather impact predictions</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Smart Recommendations:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Fertilizer timing and quantity optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Irrigation scheduling based on soil moisture</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Light optimization for better growth</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Preventive pest management strategies</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}