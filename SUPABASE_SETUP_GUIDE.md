# 🌱 Supabase Setup Guide for Smart Agriculture Dashboard

## ✅ Current Status
- **Connection**: ✅ Working perfectly
- **Table Access**: ✅ Soil_data table accessible
- **Real-time**: ✅ Subscription working
- **Data Insertion**: ❌ Blocked by Row Level Security (RLS)

## 📊 Database Schema
Your `Soil_data` table currently has these columns:
- `id` (number, primary key)
- `temperature` (number)
- `humidity` (number) 
- `soil_moisture` (number)

## 🔒 Issue: Row Level Security (RLS)
The table has RLS enabled which prevents data insertion with the current anon key.

## 🛠️ Solutions

### Option 1: Disable RLS (Recommended for Development)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `bfqsbgfhcghwxewooypo`
3. Navigate to **Authentication** → **Policies**
4. Find the `Soil_data` table
5. Click **Disable RLS** for the table
6. Confirm the action

### Option 2: Create Insert Policy
1. In Supabase Dashboard → **Authentication** → **Policies**
2. Click **New Policy** for `Soil_data` table
3. Choose **For full customization**
4. Set:
   - **Policy name**: `Allow inserts for anon users`
   - **Target roles**: `anon`
   - **Operation**: `INSERT`
   - **Target**: `All rows`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
5. Click **Review** and **Save policy**

### Option 3: Use Service Role Key (For Production)
1. Go to **Settings** → **API**
2. Copy the **service_role** key (not anon)
3. Update `src/integrations/supabase/client.ts` with the service role key

## 🧪 Testing the Fix

After applying one of the solutions above, run:

```bash
node insert-sample-data-fixed.js
```

You should see:
```
✅ All sample data inserted successfully!
📊 Inserted 48 records
🎉 You can now view the data in your dashboard!
```

## 🚀 Next Steps

1. **Fix RLS** using one of the options above
2. **Insert sample data** using the script
3. **View your dashboard** - it will show real-time data!
4. **Connect your ESP32** to start sending real sensor data

## 📱 ESP32 Integration

Once RLS is fixed, your ESP32 can send data using this format:

```json
{
  "temperature": 25.5,
  "humidity": 65.0,
  "soil_moisture": 50.0
}
```

Send POST requests to:
```
https://bfqsbgfhcghwxewooypo.supabase.co/rest/v1/Soil_data
```

With headers:
```
apikey: YOUR_ANON_KEY
Content-Type: application/json
```

## 🔍 Current Dashboard Features

- ✅ Real-time data fetching
- ✅ Live connection status
- ✅ Interactive charts for available sensors
- ✅ Connection test tool
- ✅ Responsive design

The dashboard is ready and will automatically display data once the RLS issue is resolved!






