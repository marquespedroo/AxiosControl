const fetch = require('node-fetch');

async function testCookieFlow() {
  console.log('🍪 Testing Cookie Flow\n');

  // Step 1: Login
  console.log('1️⃣ Logging in...');
  const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'joao@exemplo.com', password: 'senha123' }),
  });

  const loginData = await loginResponse.json();
  const setCookieHeader = loginResponse.headers.get('set-cookie');

  console.log('   Status:', loginResponse.status);
  console.log('   Set-Cookie header:', setCookieHeader);
  console.log('');

  if (!setCookieHeader) {
    console.log('❌ NO SET-COOKIE HEADER FOUND!');
    console.log('   The server is not setting the cookie.');
    return;
  }

  // Extract cookie value
  const cookieMatch = setCookieHeader.match(/auth_token=([^;]+)/);
  const cookieValue = cookieMatch ? cookieMatch[1] : null;

  if (!cookieValue) {
    console.log('❌ NO auth_token IN COOKIE!');
    return;
  }

  console.log('✅ Cookie set successfully');
  console.log('   Token (first 50 chars):', cookieValue.substring(0, 50) + '...');
  console.log('');

  // Step 2: Try to access dashboard with cookie
  console.log('2️⃣ Accessing dashboard with cookie...');
  const dashboardResponse = await fetch('http://localhost:3001/dashboard', {
    headers: {
      'Cookie': `auth_token=${cookieValue}`,
    },
    redirect: 'manual', // Don't follow redirects
  });

  console.log('   Status:', dashboardResponse.status);
  console.log('   Location:', dashboardResponse.headers.get('location'));
  console.log('');

  if (dashboardResponse.status === 307 || dashboardResponse.status === 302) {
    console.log('❌ MIDDLEWARE IS REDIRECTING!');
    console.log('   The middleware is not reading the cookie correctly.');
    console.log('');
    console.log('🔍 Possible issues:');
    console.log('   1. Cookie name mismatch');
    console.log('   2. Middleware running before cookie is processed');
    console.log('   3. JWT verification failing');
  } else if (dashboardResponse.status === 200) {
    console.log('✅ ACCESS GRANTED!');
    console.log('   Dashboard is accessible with the cookie.');
  }
}

testCookieFlow().catch(console.error);
