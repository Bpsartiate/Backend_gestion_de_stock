// Simple test to check if activities are properly returned
const fetch = require('node-fetch');

async function testActivities() {
  try {
    // You need to replace with a valid business ID and token
    const businessId = '67894d5e9e8a2b0001234567'; // Replace with real ID
    const token = 'your-jwt-token'; // Replace with real token
    
    const response = await fetch(`https://backend-gestion-de-stock.onrender.com/api/business/${businessId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('=== Business Data Response ===');
    console.log('Status:', response.status);
    console.log('');
    
    if (data.activities) {
      console.log('✅ Activities found:', data.activities.length);
      console.log('');
      console.log('Sample activities:');
      data.activities.slice(0, 3).forEach((act, i) => {
        console.log(`${i+1}. Type: ${act.type || 'unknown'}`);
        console.log(`   Title: ${act.title}`);
        console.log(`   Description: ${act.description}`);
        console.log(`   Icon: ${act.icon}`);
        console.log(`   Date: ${act.date}`);
        console.log('');
      });
    } else {
      console.log('❌ No activities found in response');
      console.log('Response keys:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testActivities();
