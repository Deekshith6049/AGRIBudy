import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en', mode = 'gemini' } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Supabase client to fetch real-time data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch latest sensor data
    const { data: sensorData } = await supabase
      .from('Soil_data')
      .select('*')
      .order('monitored_at', { ascending: false })
      .limit(10);

    // Build context with sensor data
    const dataContext = sensorData 
      ? `Current sensor data: Temperature: ${sensorData[0]?.temperature}°C, Humidity: ${sensorData[0]?.humidity}%, Soil Moisture: ${sensorData[0]?.soil_moisture}%`
      : 'No sensor data available';

    const systemPrompt = `You are an intelligent agricultural assistant for Smart Agro Insight. You help farmers monitor their crops and provide actionable advice. You can speak Telugu, Hindi, and English. ${dataContext}. Keep responses concise and helpful.`;

    let aiResponse = '';

    if (mode === 'gemini') {
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\nUser (${language}): ${message}` }]
            }]
          })
        }
      );

      const geminiData = await geminiResponse.json();
      aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not process your request.';

    } else {
      // OpenAI mode
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 300
        }),
      });

      const openaiData = await openaiResponse.json();
      aiResponse = openaiData.choices?.[0]?.message?.content || 'I could not process your request.';
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        sensorData: sensorData?.[0] || null 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
