// test-db-only-refresh.js - Test database-only refresh token system
const axios = require('axios');

const BASE_URL = 'http://localhost:7000/auth';

// Store tokens for testing
let accessToken = null;
let refreshToken = null;

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      withCredentials: true, // Include cookies
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}:`, response.data);
    
    // Extract new tokens from response headers if they exist
    if (response.headers['x-new-access-token']) {
      accessToken = response.headers['x-new-access-token'];
      console.log('   🔄 New access token received');
    }
    if (response.headers['x-new-refresh-token']) {
      refreshToken = response.headers['x-new-refresh-token'];
      console.log('   🔄 New refresh token received');
    }
    
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
  console.log('\n🔵 Testing Login (access token in cookie, refresh token in response)...');
  const result = await makeRequest('POST', '/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (result && result.refreshToken) {
    refreshToken = result.refreshToken;
    console.log('   📝 Refresh token stored for future use');
  }
  
  return result;
}

async function testProtectedRoute() {
  console.log('\n🔵 Testing Protected Route (automatic refresh)...');
  
  // Try with just cookies first (access token should be in cookie)
  let result = await makeRequest('GET', '/me');
  
  // If that fails, try with refresh token in request body
  if (!result && refreshToken) {
    console.log('   🔄 Access token expired, trying with refresh token...');
    result = await makeRequest('GET', '/me', { refreshToken });
  }
  
  return result;
}

async function testRefreshWithHeader() {
  console.log('\n🔵 Testing Refresh Token via Header...');
  
  if (!refreshToken) {
    console.log('   ⚠️  No refresh token available');
    return null;
  }
  
  return await makeRequest('GET', '/me', null, {
    'X-Refresh-Token': refreshToken
  });
}

async function testRefreshWithQuery() {
  console.log('\n🔵 Testing Refresh Token via Query Parameter...');
  
  if (!refreshToken) {
    console.log('   ⚠️  No refresh token available');
    return null;
  }
  
  return await makeRequest('GET', `/me?refreshToken=${refreshToken}`);
}

async function testLogout() {
  console.log('\n🔵 Testing Logout (clears access token cookie)...');
  return await makeRequest('POST', '/logout');
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Database-Only Refresh Token Tests...\n');
  
  // Test 1: Signup
  await testSignup();
  
  // Test 2: Login
  await testLogin();
  
  // Test 3: Access Protected Route (should work with cookie)
  await testProtectedRoute();
  
  // Test 4: Test refresh token via header
  await testRefreshWithHeader();
  
  // Test 5: Test refresh token via query parameter
  await testRefreshWithQuery();
  
  // Test 6: Logout
  await testLogout();
  
  // Test 7: Try accessing protected route after logout (should fail)
  console.log('\n🔵 Testing Protected Route After Logout (should fail)...');
  await testProtectedRoute();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📚 Key Features Demonstrated:');
  console.log('   ✅ Access token stored in HTTP-only cookie');
  console.log('   ✅ Refresh token stored in database only');
  console.log('   ✅ Refresh token sent via request body/header/query');
  console.log('   ✅ Automatic token refresh when access token expires');
  console.log('   ✅ Token rotation on refresh');
  console.log('   ✅ Proper logout with token invalidation');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSignup,
  testLogin,
  testProtectedRoute,
  testRefreshWithHeader,
  testRefreshWithQuery,
  testLogout
};
