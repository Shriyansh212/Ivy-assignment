const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));

const projMap = {};
projects.forEach(p => projMap[p.project_id] = p);

const projListings = {};
listings.forEach(l => {
  if (l.project_id) {
    if (!projListings[l.project_id]) projListings[l.project_id] = [];
    projListings[l.project_id].push(l);
  }
});

console.log('--- Checking Project P40231 (Century Habitat, raw price_max=99.8) ---');
console.log('Project record:', projMap['P40231']);
console.log('Associated listings:', (projListings['P40231'] || []).map(l => ({ id: l.listing_id, price: l.price, carpet: l.carpet_area })));

console.log('\n--- Checking Project P40224 (Shriram Serenity, raw price_max=3.78) ---');
console.log('Project record:', projMap['P40224']);
console.log('Associated listings:', (projListings['P40224'] || []).map(l => ({ id: l.listing_id, price: l.price, carpet: l.carpet_area })));

console.log('\n--- Checking units across all projects ---');
// Let's check if all price_max < 10 are Crores (e.g. 3.78 Cr = 37,800,000 INR) and price_max >= 10 are Lakhs (e.g. 99.8 Lakhs = 9,980,000 INR)
// OR if price_max in INR is calculated by multiplying appropriately
projects.forEach(p => {
  const assoc = projListings[p.project_id] || [];
  if (assoc.length > 0) {
    const maxListingPrice = Math.max(...assoc.map(l => l.price));
    p._max_listing_price = maxListingPrice;
  }
});

const projectsWithListings = projects.filter(p => p._max_listing_price !== undefined);
console.log(`Projects with listings: ${projectsWithListings.length}`);
projectsWithListings.slice(0, 10).forEach(p => {
  console.log(`Proj ${p.project_id} (${p.apartment_name}): price_min=${p.price_min}, price_max=${p.price_max}, max listing price=${p._max_listing_price}`);
});

// Let's find project with highest max_listing_price
const highestListingProj = [...projectsWithListings].sort((a, b) => b._max_listing_price - a._max_listing_price)[0];
console.log('\nProject with highest associated listing price:', highestListingProj.project_id, highestListingProj.apartment_name, highestListingProj._max_listing_price);

