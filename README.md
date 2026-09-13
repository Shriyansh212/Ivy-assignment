# Ivy Homes — Software Engineering Internship Assessment (Chennai)

Candidate: **Shriyansh Gupta**  
Email: `shriyansh.20214042@mnnit.ac.in`  
Assigned Locality: **Perungudi** (Chennai City)  
Reference Anchor: `2026-09-10T00:00:00+05:30` (IST)  

---

## Quick Start & Run Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### 1. Environment Setup
Create a `.env` or `.env.local` file at the project root with the following configuration:

```env
NEXT_PUBLIC_API_BASE_URL=https://solve.ivy.homes
NEXT_PUBLIC_IVY_API_KEY=IVY26-436663951613
ASSIGNED_LOCALITY=perungudi
REFERENCE_TIMESTAMP=2026-09-10T00:00:00+05:30
DEMO_PASSWORD=f5a9dd5f8a
```

### 2. Install Dependencies & Build
```bash
npm install
npm run build
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## AI Agent Disclosure & Assistance

In full transparency as requested, this solution and application were developed in collaboration with **Antigravity (Google DeepMind)** AI Coding Agent.

### How the AI Agent was Used:
1. **Automated API Probing & Data Harvesting**: The agent authored scripts (`harvest.js`, `test_auth.js`, `test_pagination.js`, `test_discrepancies.js`) to page through all 3,900 listings, 1,500 rentals, and 450 projects from `https://solve.ivy.homes` while observing rate limits and response headers.
2. **Empirical Data Analysis**: The agent computed answers for all 10 questions (`analyze.js`), isolating 25 corrupt listing IDs (physical impossibilities), 24 fraudulent bait/scam listing IDs, and deduplicating physical property records.
3. **Full-Stack Next.js Application Development**: Built a React 19 / Next.js 16 web application featuring client-side filtering, session management, dynamic property detail pages, localStorage saved favorites, unit-corrected rental/project feeds, and Recharts interactive analytics dashboard.

---

## Methodology for Discovering API Discrepancies

Our methodology relied on **empirical hypothesis testing and systematic endpoint scanning**:

1. **Authentication Discovery**:
   - *Documented*: `GET /v1/listings?api_key=...`
   - *Testing*: Sent `api_key` as query parameter and received HTTP 401: `"send your key in the X-API-Key request header, not as a query parameter"`.
   - *Login response schema*: Documented as returning `{ token, expires_in: 86400 }` with no refresh flow. Testing returned `{ access_token, refresh_token, refresh_url: "/auth/refresh", expires_in: 900 }` (15-minute token expiry with an undocumented `/auth/refresh` endpoint).

2. **Pagination Mechanics**:
   - *Documented*: `page` (1-indexed) and `limit` up to 200.
   - *Testing*: Requesting `page=2` returned `offset=0` (same page 1 items repeated). The server requires `offset` parameter and ignores `page`. Requesting `limit=200` silently capped results at 50 per page (`limit: 50`).

3. **Units Discrepancy**:
   - *Documented*: `price_min` and `price_max` in `/v1/projects` are integers in Indian rupees (e.g. `8900000`).
   - *Testing*: Harvested `/v1/projects` and discovered `price_min` and `price_max` are floats in Crores (for values <= ~10) or Lakhs (for values > ~10), e.g. `price_max: 99.8` Lakhs and `3.78` Crores.

4. **Missing & Broken Endpoints**:
   - Tested `GET /v1/listings/{id}/similar` -> HTTP 404 Not Found.
   - Tested `GET /v1/favourites`, `POST /v1/favourites`, `DELETE /v1/favourites/{id}` -> HTTP 404 Not Found.

5. **Data Quality & Fraud Identification**:
   - **Corrupt (25 IDs)**: Filtered for negative prices, super built-up area < carpet area, 0 bathrooms with 5 bedrooms, and floor > total_floors.
   - **Fraud (24 IDs)**: Scanned for advance-fee scam phrases (`"Site visit only after the booking amount is paid"`) and bait prices (< ₹20,000 for sale property).

---

## What We Checked That Turned Out to Be Fine

Hypotheses that we specifically tested that **did NOT** show discrepancies:

1. **`POST /auth/logout` Endpoint**:
   - *Hypothesis*: Given the unreviewed documentation, we hypothesized `/auth/logout` would 404.
   - *Result*: Pinging `POST /auth/logout` succeeded with HTTP 200 `{"ok":true,"note":"tokens are stateless; discard them client side"}`.

2. **Server-Side Filters on `/v1/listings`**:
   - *Hypothesis*: We suspected server-side filters like `locality`, `bhk`, `furnishing`, `min_price`, `max_price` might be silently ignored.
   - *Result*: Testing showed that passing `locality=adyar`, `bhk=3`, `furnishing=fully-furnished`, and `min_price/max_price` query parameters DOES filter records on the server side. (We still built robust client-side filtering as secondary protection).

3. **Geographic Coordinate Validity**:
   - *Hypothesis*: We hypothesized that latitude and longitude coordinates might contain out-of-bounds or zeroed values.
   - *Result*: All harvested coordinates fell strictly within valid latitude (`12.8° N - 13.2° N`) and longitude (`80.1° E - 80.3° E`) bounds for Chennai City.

4. **Health Endpoint Service Status**:
   - *Hypothesis*: We checked if `/health` returned broken status or incorrect clock offsets.
   - *Result*: `/health` works cleanly, returning status `ok` and server time with IST offset (`+05:30`).

---

## Future Work (With 2 More Days)

If we had 2 additional days, we would implement:

1. **Interactive Map View**: Integrate Leaflet / Mapbox to plot listings spatially across Chennai with clustering and price heatmaps.
2. **Automated End-to-End Test Suite**: Add Playwright / Cypress E2E tests verifying session survival across refreshes, favorite toggling, and client-side filter combinations.
3. **PWA Offline Support & Service Worker Caching**: Add IndexedDB persistence for offline browsing of harvested properties.
4. **WebSocket Live Price Ticker**: Implement real-time notifications for price drops or new listings posted in user's saved localities.
