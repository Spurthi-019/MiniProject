const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🔄 Testing login API endpoint...\n');
    
    const loginData = {
      login: 'admin@example.com',
      password: 'admin123'
    };

    console.log('📤 Sending request to: http://localhost:5000/api/auth/login');
    console.log('📦 Request body:', loginData);
    console.log('');

    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);

    console.log('✅ Login successful!');
    console.log('📥 Response:', {
      status: response.status,
      message: response.data.message,
      user: response.data.user,
      tokenReceived: !!response.data.token
    });

  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.error('❌ No response from server. Is the server running?');
      console.error('Make sure to run: npm start (in the server directory)');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLoginAPI();
