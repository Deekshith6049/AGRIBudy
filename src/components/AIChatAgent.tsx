import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSpeechAgent } from '@/hooks/useSpeechAgent';
import { sendChatMessage, buildLocalFallback, getGreeting, getPlaceholder, type Language, type AIMode } from '@/utils/llmClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [aiMode, setAiMode] = useState<AIMode>('hf');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking, isSupported } = useSpeechAgent({
    language,
    onTranscript: (text) => {
      setInputText(text);
    }
  });

  // Don't show warning immediately - only when user tries to use speech

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome message when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        text: getGreeting(language),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      if (autoSpeak) speak(welcomeMsg.text);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const { response, sensorData, audioBase64 } = await sendChatMessage({
        message: inputText,
        language,
        mode: aiMode
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (autoSpeak) {
        if (audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
          audio.play();
        } else {
          speak(response);
        }
      }

      // Show sensor data in toast if relevant
      if (sensorData && inputText.toLowerCase().includes('sensor')) {
        toast({
          title: 'Current Sensor Data',
          description: `Temp: ${sensorData.temperature}°C | Humidity: ${sensorData.humidity}% | Soil: ${sensorData.soil_moisture}%`
        });
      }

    } catch (error) {
      console.error('AI Chat error:', error);
      let errorMessage = 'Failed to get AI response';
      
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('edge')) {
          errorMessage = 'Edge function failed. Please check Supabase → Edge Functions → ai-chat → Logs.';
        } else if (error.message.toLowerCase().includes('no response')) {
          errorMessage = 'AI did not return a response. Try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }

      // As a last resort in production (Lovable), build a local fallback
      try {
        const fb = await buildLocalFallback(userMsg.text, language);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: fb.response,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (_) {
        toast({
          title: 'AI Assistant Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSupported) {
        startListening();
      } else {
        toast({
          title: "Speech Recognition Not Available",
          description: "Your browser doesn't support speech recognition. You can still type messages.",
          variant: "default",
        });
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-7 h-7 text-primary-foreground group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl border-2 border-primary/20 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="text-lg">AI Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {aiMode === 'gemini' ? '🌟 Gemini' : '🤖 GPT'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between gap-2">
        <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <Globe className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="te">తెలుగు</SelectItem>
            <SelectItem value="hi">हिंदी</SelectItem>
          </SelectContent>
        </Select>

        <Select value={aiMode} onValueChange={(val) => setAiMode(val as AIMode)}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hf">HuggingFace</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAutoSpeak(!autoSpeak)}
          className="h-8 w-8"
        >
          {autoSpeak ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
        </Button>
      </div>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={getPlaceholder(language)}
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          {isSupported && (
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleMic}
              disabled={isLoading}
              className={cn(isListening && "animate-pulse")}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isSpeaking && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <Volume2 className="w-3 h-3 animate-pulse" />
            Speaking...
          </div>
        )}
      </div>
    </Card>
  );
}
