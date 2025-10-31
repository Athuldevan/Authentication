// test-auth.js - Simple testing script for learning
const axios = require('axios');

const BASE_URL = 'http://localhost:7000/auth';

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

// Test functions
async function testSignup() {
  console.log('\n🔵 Testing Signup...');
  return await makeRequest('POST', '/signup', {
    name: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });
}

async function testLogin() {
  console.log('\n🔵 Testing Login...');
  return await makeRequest('POST', '/login', {
    email: 'test@example.com',
    password: 'password123'
  });
}

async function testProtectedRoute(accessToken) {
  console.log('\n🔵 Testing Protected Route...');
  return await makeRequest('GET', '/me', null, {
    'Authorization': `Bearer ${accessToken}`
  });
}

async function testRefresh(refreshToken) {
  console.log('\n🔵 Testing Refresh Token...');
  return await makeRequest('POST', '/refresh', null, {
    'Cookie': `refresh-token=${refreshToken}`
  });
}

async function testLogout(refreshToken) {
  console.log('\n🔵 Testing Logout...');
  return await makeRequest('POST', '/logout', null, {
    'Cookie': `refresh-token=${refreshToken}`
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting JWT Authentication Tests...\n');
  
  // Test 1: Signup
  await testSignup();
  
  // Test 2: Login
  const loginResult = await testLogin();
  if (!loginResult) return;
  
  const accessToken = loginResult.accessToken;
  console.log('\n📝 Access Token:', accessToken);
  
  // Test 3: Access Protected Route
  await testProtectedRoute(accessToken);
  
  // Test 4: Refresh Token (simulate expired access token)
  console.log('\n⚠️  Simulating expired access token...');
  await testRefresh('your-refresh-token-here'); // You'll need to get this from browser cookies
  
  // Test 5: Logout
  await testLogout('your-refresh-token-here');
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSignup,
  testLogin,
  testProtectedRoute,
  testRefresh,
  testLogout
};
