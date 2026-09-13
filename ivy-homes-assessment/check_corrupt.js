const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));

console.log('=== COMPREHENSIVE CORRUPT LISTINGS DETECTOR ===\n');

const corruptListings = [];

listings.forEach(l => {
  const issues = [];

  // Price checks
  if (typeof l.price !== 'number' || isNaN(l.price) || l.price <= 0 || !Number.isInteger(l.price)) {
    issues.push(`Invalid price: ${l.price}`);
  }

  // Carpet area checks
  if (typeof l.carpet_area !== 'number' || isNaN(l.carpet_area) || l.carpet_area <= 0) {
    issues.push(`Invalid carpet_area: ${l.carpet_area}`);
  }

  // Super built-up area vs carpet area
  if (l.super_built_up_area !== null && l.super_built_up_area !== undefined) {
    if (typeof l.super_built_up_area !== 'number' || l.super_built_up_area < l.carpet_area) {
      issues.push(`super_built_up_area (${l.super_built_up_area}) < carpet_area (${l.carpet_area})`);
    }
  }

  // Bedroom / Bathroom checks
  if (l.bedroom > 0 && l.bathroom === 0) {
    issues.push(`bedroom (${l.bedroom}) > 0 but bathroom is 0`);
  }
  if (l.bedroom < 0 || l.bathroom < 0 || (l.balcony !== null && l.balcony < 0)) {
    issues.push(`Negative rooms: bed=${l.bedroom}, bath=${l.bathroom}, balcony=${l.balcony}`);
  }

  // Floor vs total floors
  if (l.floor !== null && l.total_floors !== null && l.total_floors !== undefined) {
    if (l.floor > l.total_floors) {
      issues.push(`floor (${l.floor}) > total_floors (${l.total_floors})`);
    }
  }
  if ((l.total_floors !== null && l.total_floors < 0) || (l.floor !== null && l.floor < 0)) {
    issues.push(`Negative floor count: floor=${l.floor}, total_floors=${l.total_floors}`);
  }

  // Lat / Lng checks (Chennai latitude ~12.8 - 13.2, longitude ~80.1 - 80.3)
  if (typeof l.latitude !== 'number' || typeof l.longitude !== 'number' || Math.abs(l.latitude) > 90 || Math.abs(l.longitude) > 180) {
    issues.push(`Invalid coordinates: lat=${l.latitude}, lng=${l.longitude}`);
  }

  if (issues.length > 0) {
    corruptListings.push({ id: l.listing_id, issues, item: l });
  }
});

console.log(`Total corrupt listing IDs found: ${corruptListings.length}`);
const sortedCorruptIds = corruptListings.map(c => c.id).sort();
console.log('Sorted Corrupt Listing IDs:', JSON.stringify(sortedCorruptIds, null, 2));

console.log('\nDetailed Breakdown:');
corruptListings.forEach(c => {
  console.log(`${c.id}: ${c.issues.join(' | ')}`);
});
