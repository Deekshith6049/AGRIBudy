# 🤖 AI Talking Agent Setup Guide

## Overview
Your Smart Agro Insight dashboard now includes a **multilingual AI talking assistant** that can:
- 🗣️ Speak and listen in **English, Telugu (తెలుగు), and Hindi (हिंदी)**
- 📊 Access real-time IoT sensor data from Supabase
- 🌾 Provide agricultural insights and recommendations
- 🤗 Run on a single Hugging Face model pipeline (no OpenAI/Gemini keys needed)

---

## 🔑 Required API Key

Only a Hugging Face Inference API key is needed:
1. Go to [Hugging Face Settings → Access Tokens](https://huggingface.co/settings/tokens)
2. Create a token with **Read** access
3. Add to Supabase Secrets as: **`HUGGING_FACE_API_KEY`** (or `HUGGINGFACE_API_KEY` / `HF_API_KEY`)

---

## 📝 How to Add Secrets to Supabase

### Method 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add your API key:
   - Name: `HUGGING_FACE_API_KEY`
   - Value: Your Hugging Face token

### Method 2: Using Supabase CLI (if you have it installed)
```bash
supabase secrets set GEMINI_API_KEY=your_key_here
# OR
supabase secrets set OPENAI_API_KEY=your_key_here
```

---

## ✨ Features

### 🎤 Voice Interaction
- Click the **microphone icon** to speak
- Browser will request microphone permission
- Supports Telugu, Hindi, and English speech recognition

### 🌐 Language Support
- **English** - Full support
- **తెలుగు (Telugu)** - Native speech & text
- **हिंदी (Hindi)** - Native speech & text

### 🤖 AI Model
- **Hugging Face** - Default and only model path (no model switching needed)

### 📊 Data-Aware Responses
The AI can answer questions about your farm data:
- *"What's the current soil moisture?"*
- *"మట్టి తేమ స్థాయి ఎంత ఉంది?"*
- *"आज का तापमान कैसा है?"*

---

## 🎨 Design
- **Floating button** at bottom-right corner
- **Green pulse indicator** shows it's active
- **Transparent glassmorphism** chat window
- Maintains your existing green/white theme

---

## 🔧 Technical Details

### Files Added
```
src/components/AIChatAgent.tsx       # Main chat UI component
src/hooks/useSpeechAgent.ts          # Speech recognition & synthesis
src/utils/llmClient.ts               # LLM API wrapper
supabase/functions/ai-chat/index.ts  # Backend edge function
```

### Edge Function Endpoint
- **URL**: `https://<project-ref>.supabase.co/functions/v1/ai-chat`
- **Method**: POST
- **Body**: `{ message: string, language: 'en'|'te'|'hi' }`

### Browser Compatibility
- **Speech Recognition**: Chrome, Edge, Safari
- **Speech Synthesis**: All modern browsers
- Gracefully degrades if not supported

---

## 📚 Example Queries

### English
- "Show me today's temperature"
- "Is the soil moisture level healthy?"
- "What's the humidity trend?"

### Telugu (తెలుగు)
- "నేటి ఉష్ణోగ్రత ఎంత?"
- "మట్టి తేమ స్థాయి ఆరోగ్యకరమైనదా?"
- "తేమ ధోరణి ఎలా ఉంది?"

### Hindi (हिंदी)
- "आज का तापमान क्या है?"
- "मिट्टी की नमी का स्तर स्वस्थ है?"
- "नमी की प्रवृत्ति क्या है?"

---

## 🚀 Usage

1. **Click the floating green button** in the bottom-right
2. **Select your language** from the dropdown
3. **Type or speak** your question
4. **Listen to the response** (auto-enabled)
5. Toggle voice output with the speaker icon

---

## 🐛 Troubleshooting

### "Failed to get AI response"
→ Check that you've added API keys to Supabase Secrets

### "Microphone not working"
→ Grant microphone permission in browser settings

### "Speech not detected"
→ Ensure you're using Chrome/Edge/Safari
→ Speak clearly after clicking the mic icon

### "Function not found"
→ Edge function will auto-deploy with your next project build

---

## 💰 Cost Considerations

- **Hugging Face Inference**: Pay attention to your plan limits; the agent calls the API only when you send a message (no auto-polling)

---

## 🔒 Security

- ✅ API keys stored securely in Supabase Secrets
- ✅ Edge function runs on server-side
- ✅ No API keys exposed to frontend
- ✅ CORS properly configured

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Verify API keys in Supabase dashboard
3. Test edge function deployment status

---

**Enjoy your AI-powered agricultural assistant! 🌾🤖**
