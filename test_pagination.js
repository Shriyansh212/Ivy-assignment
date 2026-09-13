const API_KEY = process.env.IVY_API_KEY || 'IVY26-436663951613';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solve.ivy.homes';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'f5a9dd5f8a';

async function testPagination() {
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ email: 'demo1@ivy.homes', password: DEMO_PASSWORD })
  });
  const { access_token } = await loginRes.json();

  console.log('--- Testing page=2 ---');
  let res = await fetch(`${BASE_URL}/v1/listings?page=2&limit=50`, {
    headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${access_token}` }
  });
  let data = await res.json();
  console.log('page=2 response:', { offset: data.offset, limit: data.limit, count: data.count, total: data.total, first_id: data.results[0]?.listing_id });

  console.log('\n--- Testing offset=50 ---');
  res = await fetch(`${BASE_URL}/v1/listings?offset=50&limit=50`, {
    headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${access_token}` }
  });
  data = await res.json();
  console.log('offset=50 response:', { offset: data.offset, limit: data.limit, count: data.count, total: data.total, first_id: data.results[0]?.listing_id });

  console.log('\n--- Testing limit=200 ---');
  res = await fetch(`${BASE_URL}/v1/listings?limit=200`, {
    headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${access_token}` }
  });
  data = await res.json();
  console.log('limit=200 response:', { offset: data.offset, limit: data.limit, count: data.count, total: data.total });
}

testPagination();
