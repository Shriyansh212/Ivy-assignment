const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));

console.log('=== COMPREHENSIVE FAKE LISTINGS DETECTOR ===\n');

// Exclude corrupt listing IDs first as required by Q6 logic (and to avoid overlap)
const corruptIds = new Set([
  "100-4000397", "100-4000449", "100-4000457", "100-4000491", "100-4000738", "100-4002961",
  "DWE-4000412", "DWE-4001424", "DWE-4001442", "DWE-4002247", "DWE-4002374", "DWE-4002712",
  "DWE-4003067", "MAG-4000145", "MAG-4000283", "MAG-4001981", "MAG-4002776", "MAG-4003100",
  "SQU-4000308", "SQU-4000583", "SQU-4001225", "SQU-4002483", "ZER-4000021", "ZER-4001161", "ZER-4001287"
]);

const fakeMap = new Map();

// 1. Price analysis: Check price distribution for sale listings in Chennai
console.log('--- Price distribution check ---');
const validPriceListings = listings.filter(l => !corruptIds.has(l.listing_id));

validPriceListings.forEach(l => {
  const p = l.price;
  const pricePerSqft = p / l.carpet_area;

  // Impossibly low total price for a sale property (e.g. < 500,000 INR)
  if (p > 0 && p < 1000000) {
    fakeMap.set(l.listing_id, { id: l.listing_id, reason: `Bait price: ₹${p} (₹${pricePerSqft.toFixed(0)}/sqft)`, item: l });
  }

  // Impossibly low price per sqft (e.g. < 1000 INR/sqft in Chennai where market rate is 4000-12000 INR/sqft)
  if (p > 0 && pricePerSqft < 1000) {
    if (!fakeMap.has(l.listing_id)) {
      fakeMap.set(l.listing_id, { id: l.listing_id, reason: `Impossibly low price per sqft: ₹${pricePerSqft.toFixed(0)}/sqft (price: ₹${p}, carpet: ${l.carpet_area})`, item: l });
    }
  }
});

// 2. Description checks: Lorem ipsum, boilerplate, or nonsense
console.log('\n--- Description check ---');
const loremKeywords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'test listing', 'dummy', 'sample description'];

validPriceListings.forEach(l => {
  const desc = (l.description || '').toLowerCase();
  for (const kw of loremKeywords) {
    if (desc.includes(kw)) {
      if (!fakeMap.has(l.listing_id)) {
        fakeMap.set(l.listing_id, { id: l.listing_id, reason: `Lorem ipsum / template description: "${l.description}"`, item: l });
      }
      break;
    }
  }
});

// 3. Contact spam across completely different property profiles / locations
console.log('\n--- Contact spam check ---');
const contactLocalityMap = {};
validPriceListings.forEach(l => {
  if (!l.posted_by_contact) return;
  if (!contactLocalityMap[l.posted_by_contact]) {
    contactLocalityMap[l.posted_by_contact] = [];
  }
  contactLocalityMap[l.posted_by_contact].push(l);
});

// Find contacts that post the EXACT SAME description or exact same attributes across completely different localities/apartments
Object.entries(contactLocalityMap).forEach(([contact, items]) => {
  if (items.length > 5) {
    // Check if the descriptions or titles are identical across different localities
    const descSet = new Set(items.map(i => i.description.trim()));
    const locSet = new Set(items.map(i => i.locality));
    if (descSet.size === 1 && locSet.size > 3) {
      console.log(`Contact ${contact} posted 1 identical description across ${locSet.size} localities! (${items.length} listings)`);
      items.forEach(l => {
        if (!fakeMap.has(l.listing_id)) {
          fakeMap.set(l.listing_id, { id: l.listing_id, reason: `Contact spam: identical description across ${locSet.size} localities (${contact})`, item: l });
        }
      });
    }
  }
});

console.log(`\nTotal fake listings identified: ${fakeMap.size}`);
const sortedFakeIds = Array.from(fakeMap.keys()).sort();
console.log('Sorted Fake Listing IDs:', JSON.stringify(sortedFakeIds, null, 2));

console.log('\nDetailed Breakdown:');
Array.from(fakeMap.values()).forEach(f => {
  console.log(`${f.id}: ${f.reason}`);
});
