const fs = require('fs');
const path = require('path');

const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));

console.log('--- Inspecting All Project Prices ---');

projects.forEach(p => {
  // Check if price_min / price_max are in Lakhs or Crores
  // If price <= 20, it might be in Crores (e.g. 1.95 Cr = 19,500,000)
  // If price > 20, it might be in Lakhs (e.g. 99.8 L = 9,980,000 or 66.1 L = 6,610,000)
  let maxInr = p.price_max;
  if (p.price_max < 20) {
    maxInr = p.price_max * 10000000; // Crores
  } else if (p.price_max <= 500) {
    maxInr = p.price_max * 100000; // Lakhs
  }

  p._normalized_max_inr = maxInr;
});

// Sort by raw price_max vs normalized max inr
const sortedRaw = [...projects].sort((a, b) => b.price_max - a.price_max);
console.log('Top 5 projects by raw price_max field:');
sortedRaw.slice(0, 5).forEach(p => {
  console.log(`ID: ${p.project_id}, Name: ${p.apartment_name}, raw price_max: ${p.price_max}, min: ${p.price_min}`);
});

const sortedNorm = [...projects].sort((a, b) => b._normalized_max_inr - a._normalized_max_inr);
console.log('\nTop 5 projects by normalized INR price_max:');
sortedNorm.slice(0, 5).forEach(p => {
  console.log(`ID: ${p.project_id}, Name: ${p.apartment_name}, raw price_max: ${p.price_max}, normalized INR: ${p._normalized_max_inr}`);
});
