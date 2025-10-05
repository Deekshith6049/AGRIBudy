# 🔑 Supabase API Keys Setup

## Quick Fix for AI Agent Errors

### Step 1: Get a Free Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Add to Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Click **"New Secret"**
4. Name: `GEMINI_API_KEY`
5. Value: Paste your API key
6. Click **"Save"**

### Step 3: Deploy Edge Function
The edge function should auto-deploy, but if not:
1. Go to **Edge Functions** in Supabase dashboard
2. Find `ai-chat` function
3. Click **"Deploy"** if needed

## Alternative: OpenAI API Key
If you prefer OpenAI:
1. Go to: https://platform.openai.com/api-keys
2. Create new API key
3. Add as `OPENAI_API_KEY` in Supabase Secrets

## Test the Fix
1. Open your website
2. Look for green floating chat button (bottom-right)
3. Click it and try sending a message
4. Should work without errors now!
