// File: supabase/functions/ai-chat/index.ts
// Deploy using: supabase functions deploy ai-chat --no-verify-jwt

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = "en", mode = "hf" } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Supabase real-time context
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: sensorData } = await supabase
      .from("Soil_data")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1);

    const dataContext = sensorData?.length
      ? `Latest field data — Temperature: ${sensorData[0].temperature}°C, Humidity: ${sensorData[0].humidity}%, Soil Moisture: ${sensorData[0].soil_moisture}%.`
      : "No recent sensor data available.";

    const systemPrompt = `You are a multilingual agricultural assistant (English, Telugu, Hindi).
Use the farm context to give concise, helpful advice.
Context: ${dataContext}`;

    let aiResponse = "";
    let audioBase64: string | null = null;

    // Use Hugging Face Inference for text generation
    const HF_API_KEY = Deno.env.get("HUGGING_FACE_API_KEY");
    if (!HF_API_KEY) {
      throw new Error("HUGGING_FACE_API_KEY not configured");
    }

    // Text generation with mosaicml/mpt-7b-chat
    const textInputs = `${systemPrompt}\n\nUser (${language}): ${message}`;
    const tgRes = await fetch("https://api-inference.huggingface.co/models/mosaicml/mpt-7b-chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: textInputs,
        parameters: { max_new_tokens: 256, temperature: 0.7 },
        options: { wait_for_model: true },
      }),
    });
    if (!tgRes.ok) {
      const errText = await tgRes.text();
      throw new Error(`HF text-generation error: ${tgRes.status} ${errText}`);
    }
    const tgData = await tgRes.json();
    if (Array.isArray(tgData) && tgData[0]?.generated_text) {
      aiResponse = tgData[0].generated_text as string;
    } else if (typeof tgData === "object" && tgData?.generated_text) {
      aiResponse = tgData.generated_text as string;
    } else {
      // Fallback parse for some model returns
      aiResponse = (tgData?.[0]?.summary_text || tgData?.[0]?.text || "I could not process your request.") as string;
    }

    // Optional TTS via facebook/mms-tts (language-specific submodels differ).
    // We'll map en/te/hi to closest supported voices if available; otherwise skip audio.
    const langToModel: Record<string, string> = {
      en: "facebook/mms-tts-eng",
      te: "facebook/mms-tts-tel",
      hi: "facebook/mms-tts-hin",
    };
    const ttsModel = langToModel[language];
    if (ttsModel) {
      const ttsRes = await fetch(`https://api-inference.huggingface.co/models/${ttsModel}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: aiResponse, options: { wait_for_model: true } }),
      });
      if (ttsRes.ok) {
        // HF can return binary audio; fetch as arrayBuffer then base64 encode
        const ab = await ttsRes.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        audioBase64 = btoa(binary);
      }
    }

    return new Response(
      JSON.stringify({ response: aiResponse, sensorData: sensorData?.[0] || null, audioBase64 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("AI Chat Error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
