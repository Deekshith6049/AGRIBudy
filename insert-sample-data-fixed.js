// Script to insert sample sensor data that works with the actual table structure
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bfqsbgfhcghwxewooypo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcXNiZ2ZoY2dod3hld29veXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjAwNjIsImV4cCI6MjA3NDg5NjA2Mn0.8GBos1qji_OeOAD6zCN-97HSfnXdkPPu-YQjvG46MQU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Generate sample sensor data with only the available columns
function generateSampleData() {
  const now = new Date();
  const data = [];
  
  // Generate data for the last 24 hours (every 30 minutes)
  for (let i = 0; i < 48; i++) {
    const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000));
    
    // Simulate realistic sensor readings with some variation
    const baseTemp = 25 + Math.sin(i * 0.1) * 5; // Temperature varies between 20-30°C
    const baseHumidity = 65 + Math.sin(i * 0.15) * 15; // Humidity varies between 50-80%
    const baseSoilMoisture = 50 + Math.sin(i * 0.2) * 20; // Soil moisture varies between 30-70%
    
    data.push({
      temperature: Math.round((baseTemp + (Math.random() - 0.5) * 2) * 10) / 10,
      humidity: Math.round((baseHumidity + (Math.random() - 0.5) * 5) * 10) / 10,
      soil_moisture: Math.round((baseSoilMoisture + (Math.random() - 0.5) * 5) * 10) / 10,
      monitored_at: timestamp.toISOString(),
      pest_detected: Math.random() > 0.9 // 10% chance of pest detection
    });
  }
  
  return data.reverse(); // Return in chronological order
}

async function insertSampleData() {
  console.log('🌱 Generating sample sensor data for available columns...');
  
  const sampleData = generateSampleData();
  console.log(`📊 Generated ${sampleData.length} sample records`);
  console.log('📋 Sample record:', sampleData[0]);
  
  try {
    console.log('📤 Inserting sample data into Soil_data table...');
    
    // Try inserting one record first to test RLS
    console.log('🧪 Testing single record insert...');
    const { data: testData, error: testError } = await supabase
      .from('Soil_data')
      .insert([sampleData[0]])
      .select();

    if (testError) {
      console.error('❌ Single record insert failed:', testError);
      console.error('Error details:', JSON.stringify(testError, null, 2));
      
      // Check if it's an RLS issue
      if (testError.code === '42501') {
        console.log('\n🔒 Row Level Security (RLS) is enabled on the Soil_data table.');
        console.log('💡 You need to either:');
        console.log('   1. Disable RLS for the Soil_data table in Supabase dashboard');
        console.log('   2. Create a policy that allows inserts');
        console.log('   3. Use a service role key instead of anon key');
        console.log('\n📖 To fix this:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to Authentication > Policies');
        console.log('   3. Find the Soil_data table');
        console.log('   4. Create a policy that allows INSERT for authenticated users or disable RLS');
      }
      return;
    }

    console.log('✅ Single record insert successful!');
    console.log('📊 Inserted test data:', testData);
    
    // If single insert works, try inserting all data
    console.log('\n📤 Inserting all sample data...');
    const { data: allData, error: allError } = await supabase
      .from('Soil_data')
      .insert(sampleData)
      .select();

    if (allError) {
      console.error('❌ Bulk insert failed:', allError);
      return;
    }

    console.log('✅ All sample data inserted successfully!');
    console.log(`📊 Inserted ${allData.length} records`);
    
    // Verify the data was inserted
    const { count } = await supabase
      .from('Soil_data')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📈 Total records in Soil_data table: ${count}`);
    console.log('🎉 You can now view the data in your dashboard!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

insertSampleData();
