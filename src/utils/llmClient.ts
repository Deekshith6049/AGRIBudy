// Backend URL - Render deployment
const BACKEND_URL = 'https://agribuddy-backend.onrender.com';

export interface ChatRequest {
  message: string;
  voice: boolean;
}

export interface ChatResponse {
  reply_text: string;
  language: string;
  voice_enabled: boolean;
  audio_url: string | null;
}

/**
 * Send a message to the AI chat agent
 * Connects to Render backend API
 * Uses 120 second timeout to accommodate slow responses
 */
export async function sendChatMessage({ message, voice }: ChatRequest): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message, 
        voice 
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    
    if (!data || !data.reply_text) {
      throw new Error('No response from AI');
    }

    return {
      reply_text: data.reply_text,
      language: data.language || 'English',
      voice_enabled: data.voice_enabled || false,
      audio_url: data.audio_url || null,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Network error: Request timed out after waiting for the backend.');
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach backend.');
      }
      throw error;
    }

    throw new Error('Failed to get AI response. Please try again.');
  }
}

export function getGreeting(): string {
  return "Hello! I'm your AGRIBudy AI assistant. I can help you with farming questions, sensor data, and agricultural advice. How can I help you today?";
}

export function getPlaceholder(): string {
  return "Ask about soil, temperature, humidity, farming advice...";
}
