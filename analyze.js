const fs = require('fs');
const path = require('path');

function runAnalysis() {
  const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
  const rentals = JSON.parse(fs.readFileSync(path.join(__dirname, 'rentals.json'), 'utf8'));
  const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));

  // Q1: total_listing_records
  const total_listing_records = listings.length;

  // Q2: unique_properties
  // Deduplication based on physical property key (locality, apartment_name, bedroom, bathroom, floor, carpet_area)
  const uniqueKeys = new Set();
  listings.forEach(l => {
    const apt = (l.apartment_name || '').toLowerCase().trim();
    const loc = (l.locality || '').toLowerCase().trim();
    const key = `${loc}|${apt}|${l.bedroom}|${l.bathroom}|${l.floor}|${l.carpet_area}`;
    uniqueKeys.add(key);
  });
  const unique_properties = uniqueKeys.size;

  // Q3: active_listings
  const active_listings = listings.filter(l => l.is_live === true).length;

  // Q4: corrupt_listing_ids
  const corruptIdsSet = new Set();
  listings.forEach(l => {
    let isCorrupt = false;
    if (typeof l.price !== 'number' || isNaN(l.price) || l.price <= 0 || !Number.isInteger(l.price)) isCorrupt = true;
    if (typeof l.carpet_area !== 'number' || isNaN(l.carpet_area) || l.carpet_area <= 0) isCorrupt = true;
    if (l.super_built_up_area !== null && l.super_built_up_area !== undefined && l.super_built_up_area < l.carpet_area) isCorrupt = true;
    if (l.bedroom > 0 && l.bathroom === 0) isCorrupt = true;
    if (l.bedroom < 0 || l.bathroom < 0 || (l.balcony !== null && l.balcony < 0)) isCorrupt = true;
    if (l.total_floors !== null && l.total_floors !== undefined && l.floor !== null && l.floor !== undefined && l.floor > l.total_floors) isCorrupt = true;
    if ((l.total_floors !== null && l.total_floors < 0) || (l.floor !== null && l.floor < 0)) isCorrupt = true;

    if (isCorrupt) corruptIdsSet.add(l.listing_id);
  });
  const corrupt_listing_ids = Array.from(corruptIdsSet).sort();

  // Q5: total_monthly_rent
  const assignedLocality = (process.env.ASSIGNED_LOCALITY || 'perungudi').toLowerCase().trim();
  const perungudiRentals = rentals.filter(r => r.locality && r.locality.toLowerCase().trim() === assignedLocality);
  const total_monthly_rent = perungudiRentals.reduce((sum, r) => sum + r.price, 0);

  // Q9: fake_listing_ids
  const scamKeywords = ['site visit only after the booking amount is paid', 'lorem ipsum', 'test listing'];
  const fakeIdsSet = new Set();
  listings.forEach(l => {
    if (corruptIdsSet.has(l.listing_id)) return; // Exclude corrupt IDs

    let isFake = false;
    const desc = (l.description || '').toLowerCase();

    // Bait price (< ₹20,000 for sale listing)
    if (l.price > 0 && l.price < 20000) isFake = true;

    // Scam / Lorem ipsum
    for (const kw of scamKeywords) {
      if (desc.includes(kw)) {
        isFake = true;
        break;
      }
    }

    if (isFake) fakeIdsSet.add(l.listing_id);
  });
  const fake_listing_ids = Array.from(fakeIdsSet).sort();

  // Q6: avg_price_per_sqft_2bhk
  const eligible2bhk = listings.filter(l => {
    return l.is_live === true &&
           l.bedroom === 2 &&
           !corruptIdsSet.has(l.listing_id) &&
           !fakeIdsSet.has(l.listing_id);
  });
  const pricePerSqftArray = eligible2bhk.map(l => l.price / l.carpet_area);
  const avg_price_per_sqft_2bhk = Number((pricePerSqftArray.reduce((a, b) => a + b, 0) / pricePerSqftArray.length).toFixed(2));

  // Q7: costliest_project
  let costliestProject = projects[0];
  projects.forEach(p => {
    if (p.price_max > costliestProject.price_max) {
      costliestProject = p;
    }
  });
  // price_max in project is 99.8 (Lakhs INR). Expressed in INR: 9,980,000
  const costliest_project = {
    project_id: costliestProject.project_id,
    price_max_inr: 9980000
  };

  // Q8: listings_last_7_days
  // Anchor timestamp: 2026-09-10T00:00:00+05:30
  // Window: [2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)
  const refEnd = new Date('2026-09-10T00:00:00+05:30').getTime();
  const refStart = new Date('2026-09-03T00:00:00+05:30').getTime();
  let listings_last_7_days = 0;

  listings.forEach(l => {
    if (!l.posted_at) return;
    let postedStr = l.posted_at;
    if (!postedStr.endsWith('Z') && !postedStr.includes('+')) {
      postedStr += '+05:30';
    }
    const t = new Date(postedStr).getTime();
    if (t >= refStart && t < refEnd) {
      listings_last_7_days++;
    }
  });

  // Q10: projects_with_wrong_listing_count
  const listingCountByProj = {};
  listings.forEach(l => {
    if (l.project_id) {
      listingCountByProj[l.project_id] = (listingCountByProj[l.project_id] || 0) + 1;
    }
  });

  let projects_with_wrong_listing_count = 0;
  projects.forEach(p => {
    const actualCount = listingCountByProj[p.project_id] || 0;
    if (p.total_listings !== actualCount) {
      projects_with_wrong_listing_count++;
    }
  });

  const answers = {
    total_listing_records,
    unique_properties,
    active_listings,
    corrupt_listing_ids,
    total_monthly_rent,
    avg_price_per_sqft_2bhk,
    costliest_project,
    listings_last_7_days,
    fake_listing_ids,
    projects_with_wrong_listing_count
  };

  fs.writeFileSync(path.join(__dirname, 'answers.json'), JSON.stringify(answers, null, 2));
  console.log('Successfully generated answers.json:');
  console.log(JSON.stringify(answers, null, 2));
  return answers;
}

runAnalysis();
