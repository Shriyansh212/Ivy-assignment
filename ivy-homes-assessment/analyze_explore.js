const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
const rentals = JSON.parse(fs.readFileSync(path.join(__dirname, 'rentals.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));

console.log(`Loaded ${listings.length} listings, ${rentals.length} rentals, ${projects.length} projects.`);

// Q1
console.log(`Q1 Total listings: ${listings.length}`);

// Q3
const activeListings = listings.filter(l => l.is_live === true);
console.log(`Q3 Active listings (is_live === true): ${activeListings.length}`);

// Inspecting Corrupt Listings (Q4)
console.log('\n--- Inspecting potential corrupt listings (Q4) ---');
const corruptListings = [];

listings.forEach(l => {
  const issues = [];
  
  // Price checks
  if (typeof l.price !== 'number' || isNaN(l.price) || l.price <= 0 || !Number.isInteger(l.price)) {
    issues.push(`Invalid price: ${l.price}`);
  }
  
  // Area checks
  if (typeof l.carpet_area !== 'number' || l.carpet_area <= 0) {
    issues.push(`Invalid carpet_area: ${l.carpet_area}`);
  }
  if (l.super_built_up_area !== null && l.super_built_up_area !== undefined) {
    if (l.super_built_up_area < l.carpet_area) {
      issues.push(`super_built_up_area (${l.super_built_up_area}) < carpet_area (${l.carpet_area})`);
    }
  }

  // Bedroom / Bathroom ratio
  if (l.bedroom > 0 && l.bathroom === 0) {
    issues.push(`0 bathrooms with ${l.bedroom} bedrooms`);
  }
  if (l.bedroom < 0 || l.bathroom < 0 || l.balcony < 0) {
    issues.push(`Negative room count: bed=${l.bedroom}, bath=${l.bathroom}, balcony=${l.balcony}`);
  }

  // Floor checks
  if (l.floor !== null && l.total_floors !== null && l.total_floors !== undefined) {
    if (l.floor > l.total_floors) {
      issues.push(`floor (${l.floor}) > total_floors (${l.total_floors})`);
    }
  }

  if (issues.length > 0) {
    corruptListings.push({ id: l.listing_id, issues, item: l });
  }
});

console.log(`Found ${corruptListings.length} corrupt listings:`);
corruptListings.forEach(c => console.log(` - ID: ${c.id}: ${c.issues.join('; ')}`));

// Q5
console.log('\n--- Inspecting Rentals for Perungudi (Q5) ---');
const perungudiRentals = rentals.filter(r => r.locality && r.locality.toLowerCase().trim() === 'perungudi');
console.log(`Perungudi rentals count: ${perungudiRentals.length}`);
const totalRent = perungudiRentals.reduce((sum, r) => sum + r.price, 0);
console.log(`Total monthly rent for Perungudi: ${totalRent}`);

// Q7
console.log('\n--- Inspecting Costliest Project (Q7) ---');
let costliest = null;
projects.forEach(p => {
  if (!costliest || p.price_max > costliest.price_max) {
    costliest = p;
  }
});
console.log('Costliest project:', { project_id: costliest.project_id, apartment_name: costliest.apartment_name, price_max_inr: costliest.price_max });

// Q8
console.log('\n--- Inspecting Last 7 Days Listings (Q8) ---');
// REFERENCE = 2026-09-10T00:00:00+05:30
// 7 days before = 2026-09-03T00:00:00+05:30
const refEnd = new Date('2026-09-10T00:00:00+05:30').getTime();
const refStart = new Date('2026-09-03T00:00:00+05:30').getTime();
console.log(`Time window IST: ${new Date(refStart).toISOString()} to ${new Date(refEnd).toISOString()}`);

let last7DaysCount = 0;
listings.forEach(l => {
  if (!l.posted_at) return;
  // Parse posted_at as IST if no offset, or standard ISO
  let postedStr = l.posted_at;
  if (!postedStr.endsWith('Z') && !postedStr.includes('+')) {
    postedStr += '+05:30'; // posted_at timestamp in server
  }
  const postedTime = new Date(postedStr).getTime();
  if (postedTime >= refStart && postedTime < refEnd) {
    last7DaysCount++;
  }
});
console.log(`Q8 Count of listings posted in last 7 days: ${last7DaysCount}`);

// Q10
console.log('\n--- Inspecting Projects Listing Count Mismatch (Q10) ---');
const listingCountsByProject = {};
listings.forEach(l => {
  if (l.project_id) {
    listingCountsByProject[l.project_id] = (listingCountsByProject[l.project_id] || 0) + 1;
  }
});

let mismatchCount = 0;
const mismatchedProjects = [];
projects.forEach(p => {
  const actualCount = listingCountsByProject[p.project_id] || 0;
  if (p.total_listings !== actualCount) {
    mismatchCount++;
    mismatchedProjects.push({ project_id: p.project_id, reported: p.total_listings, actual: actualCount });
  }
});
console.log(`Q10 Projects with wrong listing count: ${mismatchCount} out of ${projects.length}`);
console.log('Sample mismatched projects (first 5):', mismatchedProjects.slice(0, 5));
