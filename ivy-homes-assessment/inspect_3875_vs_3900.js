const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));

console.log('=== INSPECTING THE 25 DUPLICATED / OVERLAPPING RECORDS ===\n');

// Let's check duplicates by physical key (locality + apt_name + bedroom + bathroom + floor + carpet_area)
const keyMap = {};
listings.forEach(l => {
  const apt = (l.apartment_name || '').toLowerCase().trim();
  const loc = (l.locality || '').toLowerCase().trim();
  const key = `${loc}|${apt}|${l.bedroom}|${l.bathroom}|${l.floor}|${l.carpet_area}`;
  if (!keyMap[key]) keyMap[key] = [];
  keyMap[key].push(l);
});

const duplicateKeys = Object.entries(keyMap).filter(([k, list]) => list.length > 1);
console.log(`Found ${duplicateKeys.length} physical property keys with multiple listing records!`);

duplicateKeys.slice(0, 10).forEach(([key, list]) => {
  console.log(`\nProperty Key: ${key} (${list.length} records)`);
  list.forEach(item => {
    console.log(`  - ID: ${item.listing_id}, site: ${item.website}, price: ₹${item.price}, contact: ${item.posted_by_contact}, posted_at: ${item.posted_at}`);
  });
});

// Let's check if the duplicate listing records match latitude/longitude within a small radius or exact apartment
console.log('\nChecking description duplicates:');
const descMap = {};
listings.forEach(l => {
  const desc = (l.description || '').trim();
  if (!descMap[desc]) descMap[desc] = [];
  descMap[desc].push(l);
});
const dupDescs = Object.entries(descMap).filter(([d, list]) => list.length > 1);
console.log(`Unique descriptions shared by multiple listings: ${dupDescs.length}`);
dupDescs.forEach(([d, list]) => {
  console.log(`\nDescription: "${d.slice(0, 60)}..."`);
  list.forEach(i => console.log(`  - ID: ${i.listing_id}, loc: ${i.locality}, apt: ${i.apartment_name}, price: ${i.price}`));
});

// Let's check exact coordinate duplicates (latitude + longitude)
const coordMap = {};
listings.forEach(l => {
  const cKey = `${l.latitude.toFixed(4)},${l.longitude.toFixed(4)}`;
  if (!coordMap[cKey]) coordMap[cKey] = [];
  coordMap[cKey].push(l);
});
const dupCoords = Object.entries(coordMap).filter(([c, list]) => list.length > 1);
console.log(`\nUnique coordinates (4 decimals) shared by multiple listings: ${dupCoords.length}`);
