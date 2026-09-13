const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));

console.log('=== DEDUPLICATION & UNIQUE PROPERTIES ANALYSIS (Q2) ===\n');
console.log(`Total listing records: ${listings.length}`);

// Strategy A: Exact (latitude, longitude)
const geoSet = new Set();
listings.forEach(l => {
  geoSet.add(`${l.latitude.toFixed(5)},${l.longitude.toFixed(5)}`);
});
console.log(`Unique coordinates (5 decimal places): ${geoSet.size}`);

// Strategy B: Exact (latitude, longitude, bedroom, carpet_area)
const geoAttrSet = new Set();
listings.forEach(l => {
  geoAttrSet.add(`${l.latitude.toFixed(5)},${l.longitude.toFixed(5)}|${l.bedroom}|${l.carpet_area}`);
});
console.log(`Unique (coords + bedroom + carpet_area): ${geoAttrSet.size}`);

// Strategy C: Physical property identity key (locality, apartment_name, bedroom, bathroom, floor, carpet_area, lat, lng)
const propertyKeySet = new Set();
const keyGroups = {};

listings.forEach(l => {
  // Normalize apartment name and locality
  const apt = (l.apartment_name || '').toLowerCase().trim();
  const loc = (l.locality || '').toLowerCase().trim();
  const lat = l.latitude ? l.latitude.toFixed(4) : '';
  const lng = l.longitude ? l.longitude.toFixed(4) : '';
  
  // A physical property is uniquely identified by its location, building, unit attributes
  const key = `${loc}|${apt}|${l.bedroom}|${l.bathroom}|${l.floor}|${l.carpet_area}|${lat}|${lng}`;
  propertyKeySet.add(key);

  if (!keyGroups[key]) keyGroups[key] = [];
  keyGroups[key].push(l);
});

console.log(`Unique physical properties (Strategy C): ${propertyKeySet.size}`);

// Strategy D: Check duplicate groups and see what makes them duplicate
const duplicateGroups = Object.entries(keyGroups).filter(([k, list]) => list.length > 1);
console.log(`Found ${duplicateGroups.length} duplicate property groups representing ${duplicateGroups.reduce((sum, [k, l]) => sum + l.length, 0)} total records.`);

console.log('\nSample duplicate group:');
if (duplicateGroups.length > 0) {
  const [sampleKey, sampleList] = duplicateGroups[0];
  console.log(`Key: ${sampleKey}`);
  sampleList.forEach(item => {
    console.log(` - ID: ${item.listing_id}, price: ${item.price}, website: ${item.website}, contact: ${item.posted_by_contact}`);
  });
}

// Strategy E: Deduplicate by exact (locality, apartment_name, bedroom, bathroom, floor, carpet_area) ignoring lat/lng variations if apt name matches
const aptAttrSet = new Set();
listings.forEach(l => {
  const apt = (l.apartment_name || '').toLowerCase().trim();
  const loc = (l.locality || '').toLowerCase().trim();
  const key = `${loc}|${apt}|${l.bedroom}|${l.bathroom}|${l.floor}|${l.carpet_area}`;
  aptAttrSet.add(key);
});
console.log(`Unique properties by (locality + apt_name + bedroom + bathroom + floor + carpet_area): ${aptAttrSet.size}`);

// Strategy F: Deduplicate by exact lat/lng + bedroom + floor + carpet_area
const geoUnitSet = new Set();
listings.forEach(l => {
  geoUnitSet.add(`${l.latitude.toFixed(5)},${l.longitude.toFixed(5)}|${l.bedroom}|${l.floor}|${l.carpet_area}`);
});
console.log(`Unique properties by (coords + bedroom + floor + carpet_area): ${geoUnitSet.size}`);
