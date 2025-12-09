# 🔑 Supabase API Keys Setup

## Quick Fix for AI Agent Errors

### Step 1: Get a Hugging Face Inference Token
1. Go to: https://huggingface.co/settings/tokens
2. Click "Create new token"
3. Choose **Read** access and copy the token

### Step 2: Add to Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Click **"New Secret"**
4. Name: `HUGGING_FACE_API_KEY` (or `HUGGINGFACE_API_KEY` / `HF_API_KEY`)
5. Value: Paste your token
6. Click **"Save"**

### Step 3: Deploy Edge Function
The edge function should auto-deploy, but if not:
1. Go to **Edge Functions** in Supabase dashboard
2. Find `ai-chat` function
3. Click **"Deploy"** if needed

## Test the Fix
1. Open your website
2. Look for green floating chat button (bottom-right)
3. Click it and try sending a message
4. Should work without errors now!
