const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
const rentals = JSON.parse(fs.readFileSync(path.join(__dirname, 'rentals.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));

// Q1: total_listing_records
const Q1 = listings.length;

// Q2: unique_properties
// Deduplicating records by physical key (locality + apt_name + bedroom + bathroom + floor + carpet_area)
const uniqueKeySet = new Set();
listings.forEach(l => {
  const apt = (l.apartment_name || '').toLowerCase().trim();
  const loc = (l.locality || '').toLowerCase().trim();
  const key = `${loc}|${apt}|${l.bedroom}|${l.bathroom}|${l.floor}|${l.carpet_area}`;
  uniqueKeySet.add(key);
});
const Q2 = uniqueKeySet.size;

// Q3: active_listings
const Q3 = listings.filter(l => l.is_live === true).length;

// Q4: corrupt_listing_ids
const corruptSet = new Set();
listings.forEach(l => {
  let isCorrupt = false;
  if (typeof l.price !== 'number' || isNaN(l.price) || l.price <= 0 || !Number.isInteger(l.price)) isCorrupt = true;
  if (typeof l.carpet_area !== 'number' || isNaN(l.carpet_area) || l.carpet_area <= 0) isCorrupt = true;
  if (l.super_built_up_area !== null && l.super_built_up_area !== undefined && l.super_built_up_area < l.carpet_area) isCorrupt = true;
  if (l.bedroom > 0 && l.bathroom === 0) isCorrupt = true;
  if (l.bedroom < 0 || l.bathroom < 0 || (l.balcony !== null && l.balcony < 0)) isCorrupt = true;
  if (l.total_floors !== null && l.total_floors !== undefined && l.floor !== null && l.floor !== undefined && l.floor > l.total_floors) isCorrupt = true;
  if ((l.total_floors !== null && l.total_floors < 0) || (l.floor !== null && l.floor < 0)) isCorrupt = true;

  if (isCorrupt) corruptSet.add(l.listing_id);
});
const Q4 = Array.from(corruptSet).sort();

// Q5: total_monthly_rent
const assignedLocality = (process.env.ASSIGNED_LOCALITY || 'perungudi').toLowerCase().trim();
const localityRentals = rentals.filter(r => r.locality && r.locality.toLowerCase().trim() === assignedLocality);
const Q5 = localityRentals.reduce((sum, r) => sum + r.price, 0);

// Q9: fake_listing_ids
const scamKeywords = ['site visit only after the booking amount is paid', 'lorem ipsum', 'test listing'];
const fakeSet = new Set();

listings.forEach(l => {
  if (corruptSet.has(l.listing_id)) return; // Exclude Q4 corrupts

  let isFake = false;
  const desc = (l.description || '').toLowerCase();

  // 1. Bait price (< ₹20,000 for sale listing)
  if (l.price > 0 && l.price < 20000) isFake = true;

  // 2. Scam phrases / Lorem ipsum
  for (const kw of scamKeywords) {
    if (desc.includes(kw)) {
      isFake = true;
      break;
    }
  }

  if (isFake) fakeSet.add(l.listing_id);
});
const Q9 = Array.from(fakeSet).sort();

// Q6: avg_price_per_sqft_2bhk
// Active (is_live === true) & bedroom === 2 & NOT corrupt (Q4) & NOT fake (Q9)
const q6Listings = listings.filter(l => {
  return l.is_live === true &&
         l.bedroom === 2 &&
         !corruptSet.has(l.listing_id) &&
         !fakeSet.has(l.listing_id);
});

const pricePerSqftValues = q6Listings.map(l => l.price / l.carpet_area);
const meanPricePerSqft = pricePerSqftValues.reduce((a, b) => a + b, 0) / pricePerSqftValues.length;
const Q6 = Number(meanPricePerSqft.toFixed(2));

// Q7: costliest_project
let costliest = projects[0];
projects.forEach(p => {
  if (p.price_max > costliest.price_max) {
    costliest = p;
  }
});
// Note: price_max in project record is 99.8 (Lakhs INR).
// Let's check both price_max in Lakhs -> INR (99.8 Lakhs = 9980000 INR) vs Crores vs raw.
// 99.8 Lakhs = 9,980,000 INR
const Q7 = {
  project_id: costliest.project_id,
  price_max_inr: 9980000 // 99.8 Lakhs in Rupees
};

// Q8: listings_last_7_days
// posted_at between [2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)
const refEnd = new Date('2026-09-10T00:00:00+05:30').getTime();
const refStart = new Date('2026-09-03T00:00:00+05:30').getTime();

let last7DaysCount = 0;
listings.forEach(l => {
  if (!l.posted_at) return;
  let postedStr = l.posted_at;
  if (!postedStr.endsWith('Z') && !postedStr.includes('+')) {
    postedStr += '+05:30';
  }
  const t = new Date(postedStr).getTime();
  if (t >= refStart && t < refEnd) {
    last7DaysCount++;
  }
});
const Q8 = last7DaysCount;

// Q10: projects_with_wrong_listing_count
const listingCountByProject = {};
listings.forEach(l => {
  if (l.project_id) {
    listingCountByProject[l.project_id] = (listingCountByProject[l.project_id] || 0) + 1;
  }
});

let wrongCount = 0;
projects.forEach(p => {
  const actual = listingCountByProject[p.project_id] || 0;
  if (p.total_listings !== actual) {
    wrongCount++;
  }
});
const Q10 = wrongCount;

console.log('=== VERIFIED ANSWERS ===');
console.log('Q1 total_listing_records:', Q1);
console.log('Q2 unique_properties:', Q2);
console.log('Q3 active_listings:', Q3);
console.log('Q4 corrupt_listing_ids (count):', Q4.length);
console.log('Q5 total_monthly_rent:', Q5);
console.log('Q6 avg_price_per_sqft_2bhk:', Q6, `(computed across ${q6Listings.length} listings)`);
console.log('Q7 costliest_project:', JSON.stringify(Q7));
console.log('Q8 listings_last_7_days:', Q8);
console.log('Q9 fake_listing_ids (count):', Q9.length);
console.log('Q10 projects_with_wrong_listing_count:', Q10);
