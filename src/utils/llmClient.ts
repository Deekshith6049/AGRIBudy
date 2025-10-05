import { supabase } from '@/integrations/supabase/client';

export type AIMode = 'gemini' | 'openai';
export type Language = 'en' | 'te' | 'hi';

interface ChatRequest {
  message: string;
  language: Language;
  mode: AIMode;
}

interface ChatResponse {
  response: string;
  sensorData: any;
}

/**
 * Send a message to the AI chat agent
 * Automatically fetches real-time sensor data from Supabase
 */
export async function sendChatMessage({ message, language, mode }: ChatRequest): Promise<ChatResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { message, language, mode }
    });

    if (error) throw error;

    return data as ChatResponse;
  } catch (error) {
    console.error('LLM Client Error:', error);
    throw new Error('Failed to get AI response. Please check your API keys in Supabase secrets.');
  }
}

/**
 * Get the appropriate greeting based on language
 */
export function getGreeting(language: Language): string {
  const greetings = {
    en: "Hello! I'm your Smart Agro assistant. How can I help you today?",
    te: "నమస్కారం! నేను మీ స్మార్ట్ అగ్రో సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    hi: "नमस्ते! मैं आपका स्मार्ट एग्रो सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?"
  };
  return greetings[language];
}

/**
 * Get language-specific placeholder text
 */
export function getPlaceholder(language: Language): string {
  const placeholders = {
    en: "Ask about soil, temperature, humidity...",
    te: "మట్టి, ఉష్ణోగ్రత, తేమ గురించి అడగండి...",
    hi: "मिट्टी, तापमान, नमी के बारे में पूछें..."
  };
  return placeholders[language];
}
