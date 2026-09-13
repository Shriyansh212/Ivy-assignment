const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));

console.log('=== SCAM PHRASE & FRAUD PATTERN SCANNER ===\n');

const scamPhrases = [
  'booking amount',
  'pay before',
  'visit only after',
  'advance',
  'lorem ipsum',
  'test listing',
  'dummy'
];

const suspiciousListings = [];

listings.forEach(l => {
  const desc = (l.description || '').toLowerCase();
  let matchedPhrase = null;

  for (const phrase of scamPhrases) {
    if (desc.includes(phrase)) {
      matchedPhrase = phrase;
      break;
    }
  }

  // Price checks: < ₹500,000 for sale
  let isBaitPrice = false;
  if (l.price > 0 && l.price < 500000) {
    isBaitPrice = true;
  }

  if (matchedPhrase || isBaitPrice) {
    suspiciousListings.push({
      id: l.listing_id,
      price: l.price,
      carpet: l.carpet_area,
      matchedPhrase,
      isBaitPrice,
      desc: l.description
    });
  }
});

console.log(`Found ${suspiciousListings.length} suspicious/fraudulent listings:`);
suspiciousListings.forEach(s => {
  console.log(`${s.id}: price=₹${s.price}, bait=${s.isBaitPrice}, phrase="${s.matchedPhrase}" => desc="${s.desc}"`);
});
