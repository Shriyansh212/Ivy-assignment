const API_KEY = process.env.IVY_API_KEY || 'IVY26-436663951613';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solve.ivy.homes';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'f5a9dd5f8a';

async function testAuth() {
  console.log('Testing /auth/login...');
  
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      email: 'demo1@ivy.homes',
      password: DEMO_PASSWORD
    })
  });

  const loginData = await loginRes.json();
  console.log('Login response keys:', Object.keys(loginData));

  const token = loginData.access_token;
  if (token) {
    console.log('\nTesting /v1/listings with Bearer token & X-API-Key...');
    const listingsRes = await fetch(`${BASE_URL}/v1/listings?limit=5`, {
      headers: {
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Listings status:', listingsRes.status);
    const listingsData = await listingsRes.json();
    console.log('Listings response keys:', Object.keys(listingsData));
    console.log('Listings total:', listingsData.total, 'page_size:', listingsData.page_size, 'results length:', listingsData.results?.length);
    if (listingsData.results && listingsData.results.length > 0) {
      console.log('Sample listing item keys:', Object.keys(listingsData.results[0]));
      console.log('Sample listing item:', JSON.stringify(listingsData.results[0], null, 2));
    }
  }
}

testAuth();
