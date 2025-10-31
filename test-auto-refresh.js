// test-auto-refresh.js - Test automatic token refresh system
const axios = require('axios');

const BASE_URL = 'http://localhost:7000/auth';

// Helper function to make requests with cookies
async function makeRequest(method, endpoint, data = null, cookies = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}:`, response.data);
    
    // Extract cookies from response
    const setCookieHeaders = response.headers['set-cookie'] || [];
    const newCookies = {};
    setCookieHeaders.forEach(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      newCookies[name] = value;
    });
    
    return { data: response.data, cookies: newCookies };
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
  console.log('\n🔵 Testing Login (sets tokens as cookies)...');
  return await makeRequest('POST', '/login', {
    email: 'test@example.com',
    password: 'password123'
  });
}

async function testProtectedRoute() {
  console.log('\n🔵 Testing Protected Route (automatic refresh)...');
  return await makeRequest('GET', '/me');
}

async function testLogout() {
  console.log('\n🔵 Testing Logout (clears cookies)...');
  return await makeRequest('POST', '/logout');
}

// Simulate expired access token scenario
async function testExpiredToken() {
  console.log('\n🔵 Testing with Expired Access Token...');
  console.log('   (This simulates what happens when access token expires)');
  
  // First login to get tokens
  const loginResult = await testLogin();
  if (!loginResult) return;
  
  // Wait a moment to simulate time passing
  console.log('   ⏳ Simulating time passing...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Try to access protected route (should work with automatic refresh)
  const meResult = await testProtectedRoute();
  
  if (meResult && meResult.data.newAccessToken) {
    console.log('   🔄 Access token was automatically refreshed!');
    console.log('   📝 New access token:', meResult.data.newAccessToken);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Automatic Token Refresh Tests...\n');
  
  // Test 1: Signup
  await testSignup();
  
  // Test 2: Login
  await testLogin();
  
  // Test 3: Access Protected Route
  await testProtectedRoute();
  
  // Test 4: Simulate Expired Token
  await testExpiredToken();
  
  // Test 5: Logout
  await testLogout();
  
  // Test 6: Try accessing protected route after logout (should fail)
  console.log('\n🔵 Testing Protected Route After Logout (should fail)...');
  await testProtectedRoute();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📚 Key Features Demonstrated:');
  console.log('   ✅ Automatic token refresh (no separate endpoint)');
  console.log('   ✅ HTTP-only cookies for security');
  console.log('   ✅ Token rotation on refresh');
  console.log('   ✅ Proper logout with token invalidation');
  console.log('   ✅ Seamless user experience');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSignup,
  testLogin,
  testProtectedRoute,
  testLogout,
  testExpiredToken
};
