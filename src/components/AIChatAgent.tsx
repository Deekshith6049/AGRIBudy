import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSpeechAgent } from '@/hooks/useSpeechAgent';
import { sendChatMessage, getGreeting, getPlaceholder } from '@/utils/llmClient';
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
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false); // Default OFF
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking, isSupported } = useSpeechAgent({
    language: 'en', // backend handles detection
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
        text: getGreeting(),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const playAudio = async (audioUrl: string) => {
    try {
      stopCurrentAudio();
      const fullAudioUrl = audioUrl.startsWith('http')
        ? audioUrl
        : `https://agribuddy-backend.onrender.com${audioUrl}`;
      const audio = new Audio(fullAudioUrl);
      audioRef.current = audio;
      await audio.play();
      audio.addEventListener('ended', () => {
        audioRef.current = null;
      });
      audio.addEventListener('error', () => {
        audioRef.current = null;
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      audioRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Stop any current audio before sending
    stopCurrentAudio();

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
      const response = await sendChatMessage({
        message: inputText,
        voice: audioEnabled
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply_text,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (audioEnabled && response.audio_url) {
        await playAudio(response.audio_url);
      }

      if (!audioEnabled) {
        stopCurrentAudio();
      }

    } catch (error) {
      console.error('AI Chat error:', error);
      let errorMessage = 'Failed to get AI response';
      
      if (error instanceof Error) {
        if (error.message.includes('HTTP')) {
          errorMessage = `Connection error: ${error.message}`;
        } else if (error.message.toLowerCase().includes('no response')) {
          errorMessage = 'AI did not return a response. Try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'AI Assistant Error',
        description: errorMessage,
        variant: 'destructive'
      });
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
              🤖 AGRIBudy AI
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
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Voice Output</span>
        </div>
        <Switch
          checked={audioEnabled}
          onCheckedChange={(next) => {
            setAudioEnabled(next);
            if (!next) stopCurrentAudio();
          }}
          className="scale-110"
        />
      </div>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-3 overflow-visible">
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
                    "max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words overflow-visible leading-relaxed",
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
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-muted-foreground">AGRIBudy AI is analyzing live sensor data. Please wait…</span>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={getPlaceholder()}
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
