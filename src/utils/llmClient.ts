import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

export type Language = 'en' | 'te' | 'hi';

interface ChatRequest {
  message: string;
  language: Language;
}

interface ChatResponse {
  response: string;
  sensorData: any;
}

/**
 * Send a message to the AI chat agent
 * Automatically fetches real-time sensor data from Supabase
 */
export async function sendChatMessage({ message, language }: ChatRequest): Promise<ChatResponse> {
  // Supabase Edge Function
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ message, language })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Edge function HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    if (!data) {
      throw new Error('No response from AI');
    }
    return data as ChatResponse;
  } catch (error) {
    console.error('LLM Client Error:', error);
    // Fallback: build a helpful local response with latest sensor data
    try {
      const { data: latest } = await supabase
        .from('Soil_data')
        .select('*')
        .order('monitored_at', { ascending: false })
        .limit(1);

      const latestRow = latest?.[0] || null;
      const dataContext = latestRow
        ? `Temperature: ${latestRow.temperature}°C, Humidity: ${latestRow.humidity}%, Soil Moisture: ${latestRow.soil_moisture}%`
        : 'No recent sensor data available';

      return {
        response: getFallbackResponse(message, language, dataContext),
        sensorData: latestRow,
      };
    } catch (_) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to get AI response. Please try again.');
    }
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

/**
 * Get fallback response when AI is not available
 */
function getFallbackResponse(message: string, language: Language, dataContext: string): string {
  const responses = {
    en: {
      greeting: "Hello! I'm your Smart Agro assistant. ",
      data: `Here's your current sensor data: ${dataContext}. `,
      help: "I can help you monitor your farm data. Try asking about temperature, humidity, or soil moisture.",
      note: "Note: AI features are being set up. You can still view your sensor data!"
    },
    te: {
      greeting: "నమస్కారం! నేను మీ స్మార్ట్ అగ్రో సహాయకుడిని. ",
      data: `మీ ప్రస్తుత సెన్సార్ డేటా: ${dataContext}. `,
      help: "నేను మీ పొల డేటాను పర్యవేక్షించడంలో సహాయపడగలను. ఉష్ణోగ్రత, తేమ లేదా మట్టి తేమ గురించి అడగండి.",
      note: "గమనిక: AI లక్షణాలు సెటప్ చేయబడుతున్నాయి. మీరు ఇప్పటికీ మీ సెన్సార్ డేటాను చూడవచ్చు!"
    },
    hi: {
      greeting: "नमस्ते! मैं आपका स्मार्ट एग्रो सहायक हूं। ",
      data: `आपका वर्तमान सेंसर डेटा: ${dataContext}. `,
      help: "मैं आपके खेत के डेटा की निगरानी में मदद कर सकता हूं। तापमान, नमी या मिट्टी की नमी के बारे में पूछें।",
      note: "नोट: AI सुविधाएं सेटअप की जा रही हैं। आप अभी भी अपना सेंसर डेटा देख सकते हैं!"
    }
  };

  const lang = responses[language];
  return `${lang.greeting}${lang.data}${lang.help} ${lang.note}`;
}

// Build a local fallback response using latest sensor data
export async function buildLocalFallback(message: string, language: Language): Promise<ChatResponse> {
  const { data: latest } = await supabase
    .from('Soil_data')
    .select('*')
    .order('monitored_at', { ascending: false })
    .limit(1);

  const latestRow = latest?.[0] || null;
  const dataContext = latestRow
    ? `Temperature: ${latestRow.temperature}°C, Humidity: ${latestRow.humidity}%, Soil Moisture: ${latestRow.soil_moisture}%`
    : 'No recent sensor data available';

  return {
    response: getFallbackResponse(message, language, dataContext),
    sensorData: latestRow,
  };
}
