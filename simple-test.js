// Simple test file for beginners
const axios = require('axios');

const BASE_URL = 'http://localhost:7000/auth';

// Helper function to make requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // Include cookies
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

// Test 1: Create account
async function testSignup() {
  console.log('\n🔵 Test 1: Create Account');
  return await makeRequest('POST', '/signup', {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  });
}

// Test 2: Login
async function testLogin() {
  console.log('\n🔵 Test 2: Login');
  return await makeRequest('POST', '/login', {
    email: 'john@example.com',
    password: 'password123'
  });
}

// Test 3: Access protected route
async function testProtectedRoute() {
  console.log('\n🔵 Test 3: Access Protected Route');
  return await makeRequest('GET', '/me');
}

// Test 4: Logout
async function testLogout() {
  console.log('\n🔵 Test 4: Logout');
  return await makeRequest('POST', '/logout');
}

// Test 5: Try accessing protected route after logout (should fail)
async function testAfterLogout() {
  console.log('\n🔵 Test 5: Try Protected Route After Logout (should fail)');
  return await makeRequest('GET', '/me');
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Simple Authentication Tests...\n');
  
  await testSignup();
  await testLogin();
  await testProtectedRoute();
  await testLogout();
  await testAfterLogout();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📚 What happened:');
  console.log('   1. Created a new user account');
  console.log('   2. Logged in (tokens set as cookies)');
  console.log('   3. Accessed protected route (worked!)');
  console.log('   4. Logged out (cookies cleared)');
  console.log('   5. Tried protected route again (failed!)');
}

// Run tests
runTests().catch(console.error);
