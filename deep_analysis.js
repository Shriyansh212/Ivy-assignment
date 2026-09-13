const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
const rentals = JSON.parse(fs.readFileSync(path.join(__dirname, 'rentals.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));

console.log('=== DEEP ANALYSIS OF DATASET ===\n');

// 1. Check Projects Units (price_min, price_max)
console.log('--- Project Price Samples ---');
projects.slice(0, 10).forEach(p => {
  console.log(`Project ${p.project_id}: name="${p.apartment_name}", price_min=${p.price_min}, price_max=${p.price_max}, min_area=${p.min_area_sqft}, max_area=${p.max_area_sqft}`);
});

// Check max project price in projects dataset:
let maxProj = null;
projects.forEach(p => {
  if (!maxProj || p.price_max > maxProj.price_max) {
    maxProj = p;
  }
});
console.log('Max project:', maxProj);

// 2. Check Corrupt Listings Exhaustively
console.log('\n--- Exhaustive Check for Corrupt Listings (Q4) ---');
/*
Corrupt criteria candidates:
- Price <= 0, negative, or non-numeric
- Carpet area <= 0 or non-numeric
- super_built_up_area < carpet_area
- bedroom < 0 or bathroom < 0 or balcony < 0
- bedroom > 0 and bathroom == 0
- floor > total_floors (when total_floors > 0)
- total_floors < 0 or floor < 0 (unless floor=0 ground)
- latitude / longitude out of valid range or physically impossible
*/

const corruptMap = new Map();

listings.forEach(l => {
  const reasons = [];
  
  if (l.price <= 0 || typeof l.price !== 'number' || !Number.isInteger(l.price)) {
    reasons.push(`price=${l.price}`);
  }
  if (l.carpet_area <= 0 || typeof l.carpet_area !== 'number') {
    reasons.push(`carpet_area=${l.carpet_area}`);
  }
  if (l.super_built_up_area !== null && l.super_built_up_area !== undefined && l.super_built_up_area < l.carpet_area) {
    reasons.push(`super_built_up_area (${l.super_built_up_area}) < carpet_area (${l.carpet_area})`);
  }
  if (l.bedroom > 0 && l.bathroom === 0) {
    reasons.push(`bedroom=${l.bedroom}, bathroom=${l.bathroom}`);
  }
  if (l.bedroom < 0 || l.bathroom < 0 || l.balcony < 0) {
    reasons.push(`negative rooms: bed=${l.bedroom}, bath=${l.bathroom}, balcony=${l.balcony}`);
  }
  if (l.total_floors !== null && l.total_floors !== undefined && l.floor !== null && l.floor !== undefined) {
    if (l.floor > l.total_floors) {
      reasons.push(`floor (${l.floor}) > total_floors (${l.total_floors})`);
    }
  }
  if (l.total_floors < 0 || l.floor < 0) {
    reasons.push(`negative floor or total_floors: floor=${l.floor}, total_floors=${l.total_floors}`);
  }

  if (reasons.length > 0) {
    corruptMap.set(l.listing_id, { id: l.listing_id, reasons, item: l });
  }
});

console.log(`Total corrupt listings identified: ${corruptMap.size}`);
Array.from(corruptMap.values()).forEach(c => {
  console.log(`ID: ${c.id} => ${c.reasons.join(' | ')}`);
});

// 3. Check Fake / Fraudulent Listings (Q9)
console.log('\n--- Exhaustive Check for Fake Listings (Q9) ---');
/*
Fake / Fraud criteria candidates:
- Contact number repetition across different property profiles/names/locations (agent spam / clickbait)
- Impossibly low prices (bait prices, e.g. price per sqft < 500 or 1000 in a premium city)
- Lorem ipsum or generated / template descriptions (e.g. "Lorem ipsum", "test description", repeated nonsense)
- Listing URLs pointing to fake/invalid domains or dummy values
- Unusually high number of listings by same contact with identical descriptions across different locations
*/

// Check contact number counts and distribution
const contactCounts = {};
listings.forEach(l => {
  if (l.posted_by_contact) {
    contactCounts[l.posted_by_contact] = (contactCounts[l.posted_by_contact] || 0) + 1;
  }
});

// Check descriptions for Lorem ipsum or repetitive text
const loremListings = [];
const suspiciousPriceListings = [];
const fakeMap = new Map();

listings.forEach(l => {
  const reasons = [];

  // Description checks
  const desc = (l.description || '').toLowerCase();
  if (desc.includes('lorem ipsum') || desc.includes('sample text') || desc.includes('test listing') || desc.includes('fake listing')) {
    reasons.push(`Suspicious description: "${l.description.slice(0, 40)}..."`);
  }

  // Price per sqft checks (Impossibly low prices, e.g. 3 BHK in Chennai for 50,000 INR or < 1,00,000 INR total price!)
  const pricePerSqft = l.price / l.carpet_area;
  if (l.price > 0 && l.price < 500000) { // Price less than 5 Lakhs for a house in Chennai
    reasons.push(`Impossibly low price: ₹${l.price} (₹${pricePerSqft.toFixed(0)}/sqft)`);
  } else if (pricePerSqft < 500 && l.price > 0) {
    reasons.push(`Impossibly low price per sqft: ₹${pricePerSqft.toFixed(0)}/sqft (Price: ₹${l.price})`);
  }

  if (reasons.length > 0 && !corruptMap.has(l.listing_id)) {
    fakeMap.set(l.listing_id, { id: l.listing_id, reasons, item: l });
  }
});

console.log(`Preliminary fake map size: ${fakeMap.size}`);

// Check high-frequency contacts across multiple different apartment names / localities
const contactProperties = {};
listings.forEach(l => {
  if (!l.posted_by_contact) return;
  if (!contactProperties[l.posted_by_contact]) {
    contactProperties[l.posted_by_contact] = new Set();
  }
  contactProperties[l.posted_by_contact].add(`${l.locality}|${l.apartment_name}`);
});

console.log('\nTop contact numbers by distinct locality/apartment count:');
Object.entries(contactProperties)
  .map(([contact, set]) => ({ contact, count: set.size, totalListings: contactCounts[contact] }))
  .filter(c => c.count > 10)
  .sort((a, b) => b.count - a.count)
  .slice(0, 15)
  .forEach(c => console.log(`Contact: ${c.contact} => ${c.count} distinct property profiles (${c.totalListings} total listings)`));

// 4. Check Unique Properties (Q2)
console.log('\n--- Inspecting Duplicate Properties (Q2) ---');
// Let's inspect how listings group by coordinates, description, or physical attributes
const coordMap = {};
const descMap = {};
const attrMap = {};

listings.forEach(l => {
  const coordKey = `${l.latitude.toFixed(5)},${l.longitude.toFixed(5)}`;
  coordMap[coordKey] = (coordMap[coordKey] || 0) + 1;

  const descKey = l.description ? l.description.trim().toLowerCase() : '';
  if (descKey) descMap[descKey] = (descMap[descKey] || 0) + 1;

  const attrKey = `${l.locality}|${l.apartment_name}|${l.bedroom}|${l.bathroom}|${l.carpet_area}|${l.floor}`;
  attrMap[attrKey] = (attrMap[attrKey] || 0) + 1;
});

const duplicateCoordsCount = Object.values(coordMap).filter(c => c > 1).reduce((a, b) => a + b, 0);
const duplicateDescsCount = Object.values(descMap).filter(c => c > 1).reduce((a, b) => a + b, 0);
const duplicateAttrsCount = Object.values(attrMap).filter(c => c > 1).reduce((a, b) => a + b, 0);

console.log(`Listings sharing exact lat/lng with another listing: ${duplicateCoordsCount}`);
console.log(`Listings sharing exact description: ${duplicateDescsCount}`);
console.log(`Listings sharing exact physical attributes (locality+apt+bed+bath+carpet+floor): ${duplicateAttrsCount}`);

