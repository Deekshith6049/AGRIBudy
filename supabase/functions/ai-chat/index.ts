import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { message, language = "en", mode = "gemini" } = await req.json();
    console.log("AI Chat Request:", {
      message,
      language,
      mode
    });
    if (!message) throw new Error("Message is required.");
    // Supabase credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase environment variables.");
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Fetch latest data
    const { data: sensorData, error: dbError } = await supabase.from("Soil_data").select("*").order("timestamp", {
      ascending: false
    }).limit(1);
    if (dbError) console.error("DB Error:", dbError);
    const dataContext = sensorData?.length ? `Latest field data — Temperature: ${sensorData[0].temperature}°C, Humidity: ${sensorData[0].humidity}%, Soil Moisture: ${sensorData[0].soil_moisture}%, Pest: ${sensorData[0].pest_detected ? "Detected" : "Not Detected"}.` : "No recent sensor data available.";
    const systemPrompt = `
You are an intelligent multilingual agricultural assistant for Smart Agro Insight.
You monitor soil, humidity, temperature, and pest data and give actionable, natural advice.
Languages supported: English, Telugu, Hindi.
Current farm info: ${dataContext}
Be clear, helpful, and conversational.
`;
    let aiResponse = "";
    if (mode === "gemini") {
      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
      if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured.");
      console.log("Querying Gemini API (v1 gemini-1.5-flash)...");
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\nUser (${language}): ${message}`
                }
              ]
            }
          ]
        })
      });
      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error("Gemini Error:", geminiResponse.status, errText);
        throw new Error(`Gemini API error: ${geminiResponse.status} ${errText}`);
      }
      const geminiData = await geminiResponse.json();
      aiResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn’t generate a response right now.";
    } else {
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured.");
      console.log("Querying OpenAI...");
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });
      if (!openaiResponse.ok) {
        const errText = await openaiResponse.text();
        console.error("OpenAI Error:", openaiResponse.status, errText);
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }
      const openaiData = await openaiResponse.json();
      aiResponse = openaiData?.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a response right now.";
    }
    return new Response(JSON.stringify({
      response: aiResponse,
      sensorData: sensorData?.[0] || null
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
