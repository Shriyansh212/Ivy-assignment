const fs = require('fs');
const path = require('path');

const API_KEY = process.env.IVY_API_KEY || 'IVY26-436663951613';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solve.ivy.homes';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'f5a9dd5f8a';

async function runDiscrepancyTests() {
  console.log('=== SYSTEMATIC API DISCREPANCY TESTING ===\n');

  // 1. Authenticate
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ email: 'demo1@ivy.homes', password: DEMO_PASSWORD })
  });
  const loginData = await loginRes.json();
  const token = loginData.access_token;
  console.log('Login token acquired.');

  const headers = {
    'X-API-Key': API_KEY,
    'Authorization': `Bearer ${token}`
  };

  // Test 1: Query param auth vs header auth
  console.log('\n--- 1. Testing Auth Methods ---');
  const queryAuthRes = await fetch(`${BASE_URL}/v1/listings?api_key=${API_KEY}`);
  console.log('Query param api_key status:', queryAuthRes.status, await queryAuthRes.json());

  // Test 2: Logout endpoint
  console.log('\n--- 2. Testing /auth/logout ---');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers
  });
  console.log('POST /auth/logout status:', logoutRes.status, await logoutRes.text());

  // Test 3: Similar listings endpoint
  console.log('\n--- 3. Testing /v1/listings/{id}/similar ---');
  const similarRes = await fetch(`${BASE_URL}/v1/listings/MAG-4001518/similar`, { headers });
  console.log('GET /v1/listings/MAG-4001518/similar status:', similarRes.status, await similarRes.text());

  // Test 4: Favourites endpoints
  console.log('\n--- 4. Testing /v1/favourites ---');
  const favGetRes = await fetch(`${BASE_URL}/v1/favourites`, { headers });
  console.log('GET /v1/favourites status:', favGetRes.status, await favGetRes.text());

  const favPostRes = await fetch(`${BASE_URL}/v1/favourites`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'MAG-4001518' })
  });
  console.log('POST /v1/favourites status:', favPostRes.status, await favPostRes.text());

  // Test 5: Server-side Filters on /v1/listings
  console.log('\n--- 5. Testing Server-Side Filters on /v1/listings ---');

  // Locality filter test
  const locRes = await fetch(`${BASE_URL}/v1/listings?locality=adyar`, { headers });
  const locData = await locRes.json();
  const nonAdyar = locData.results.filter(l => l.locality !== 'adyar');
  console.log(`locality=adyar filter: returned ${locData.results.length} items, non-adyar count: ${nonAdyar.length}`);

  // BHK filter test
  const bhkRes = await fetch(`${BASE_URL}/v1/listings?bhk=3`, { headers });
  const bhkData = await bhkRes.json();
  const non3bhk = bhkData.results.filter(l => l.bedroom !== 3);
  console.log(`bhk=3 filter: returned ${bhkData.results.length} items, non-3bhk count: ${non3bhk.length}`);

  // Furnishing filter test
  const furRes = await fetch(`${BASE_URL}/v1/listings?furnishing=fully-furnished`, { headers });
  const furData = await furRes.json();
  const nonFully = furData.results.filter(l => l.furnishing !== 'fully-furnished');
  console.log(`furnishing=fully-furnished filter: returned ${furData.results.length} items, non-fully count: ${nonFully.length}`);

  // Price filter test
  const priceRes = await fetch(`${BASE_URL}/v1/listings?min_price=10000000&max_price=15000000`, { headers });
  const priceData = await priceRes.json();
  const outOfPrice = priceData.results.filter(l => l.price < 10000000 || l.price > 15000000);
  console.log(`min_price=10M&max_price=15M filter: returned ${priceData.results.length} items, out of range count: ${outOfPrice.length}`);

  // Sort test
  const sortRes = await fetch(`${BASE_URL}/v1/listings?sort_by=price&order=asc`, { headers });
  const sortData = await sortRes.json();
  const prices = sortData.results.map(l => l.price);
  const isSorted = prices.every((val, i, arr) => !i || arr[i - 1] <= val);
  console.log(`sort_by=price&order=asc test: prices sample:`, prices.slice(0, 5), `isSorted: ${isSorted}`);

  // Test 6: Health Endpoint
  console.log('\n--- 6. Testing /health ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  console.log('/health response status:', healthRes.status, await healthRes.json());
}

runDiscrepancyTests().catch(console.error);
