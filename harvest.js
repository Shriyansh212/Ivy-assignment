const fs = require('fs');
const path = require('path');

const API_KEY = process.env.IVY_API_KEY || 'IVY26-436663951613';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solve.ivy.homes';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'f5a9dd5f8a';

async function login() {
  console.log('Logging in to get access token...');
  const res = await fetch(`${BASE_URL}/auth/login`, {
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

  if (!res.ok) {
    throw new Error(`Login failed with status ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log('Login successful! Access token obtained.');
  return data.access_token;
}

async function fetchAll(endpoint, token) {
  let allRecords = [];
  let offset = 0;
  let limit = 50; // Use max supported limit
  let totalReported = null;

  console.log(`\n=== Harvesting ${endpoint} ===`);

  while (true) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', limit);

    const res = await fetch(url.toString(), {
      headers: {
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error(`Error ${res.status} fetching ${url.toString()}: ${await res.text()}`);
      break;
    }

    const data = await res.json();
    if (totalReported === null) {
      totalReported = data.total;
      console.log(`Server reported total: ${data.total}`);
    }

    const results = data.results || (Array.isArray(data) ? data : []);
    console.log(`Offset ${offset}: got ${results.length} items (has_more=${data.has_more})`);

    if (results.length === 0) break;

    allRecords.push(...results);

    if (data.has_more === false || (data.total !== undefined && allRecords.length >= data.total)) {
      console.log(`Reached end of results. Total fetched: ${allRecords.length}`);
      break;
    }

    offset += results.length;
    await new Promise(r => setTimeout(r, 20)); // Gentle request spacing
  }

  console.log(`Total harvested for ${endpoint}: ${allRecords.length} records (Server total: ${totalReported})`);
  return allRecords;
}

async function main() {
  const token = await login();

  const listings = await fetchAll('/v1/listings', token);
  fs.writeFileSync(path.join(__dirname, 'listings.json'), JSON.stringify(listings, null, 2));
  console.log(`Saved ${listings.length} records to listings.json`);

  const rentals = await fetchAll('/v1/rentals', token);
  fs.writeFileSync(path.join(__dirname, 'rentals.json'), JSON.stringify(rentals, null, 2));
  console.log(`Saved ${rentals.length} records to rentals.json`);

  const projects = await fetchAll('/v1/projects', token);
  fs.writeFileSync(path.join(__dirname, 'projects.json'), JSON.stringify(projects, null, 2));
  console.log(`Saved ${projects.length} records to projects.json`);

  console.log('\nData harvest completed successfully!');
}

main().catch(err => {
  console.error('Harvest script error:', err);
  process.exit(1);
});
