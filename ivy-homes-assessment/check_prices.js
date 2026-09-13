const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
const answers = JSON.parse(fs.readFileSync(path.join(__dirname, 'answers.json'), 'utf8'));

const corruptIdsSet = new Set(answers.corrupt_listing_ids);
const fakeIdsSet = new Set(answers.fake_listing_ids);

const validListings = listings.filter(l => l.is_live && !corruptIdsSet.has(l.listing_id) && !fakeIdsSet.has(l.listing_id));

const prices = validListings.map(l => l.price).sort((a, b) => a - b);

console.log(`Total valid active listings: ${validListings.length}`);
console.log(`Lowest genuine price: ₹${prices[0]} (₹${(prices[0]/100000).toFixed(2)} Lakhs)`);
console.log(`Highest genuine price: ₹${prices[prices.length - 1]} (₹${(prices[prices.length - 1]/10000000).toFixed(2)} Crores)`);
console.log(`10th percentile: ₹${prices[Math.floor(prices.length * 0.1)]} (₹${(prices[Math.floor(prices.length * 0.1)]/100000).toFixed(2)} Lakhs)`);
console.log(`50th percentile (Median): ₹${prices[Math.floor(prices.length * 0.5)]} (₹${(prices[Math.floor(prices.length * 0.5)]/100000).toFixed(2)} Lakhs)`);
