'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ListingCard, { ListingItem } from '@/components/ListingCard';
import FloatingOrbsCanvas from '@/components/3d/FloatingOrbsCanvas';
import { Search, AlertTriangle, ArrowUpDown, Info, Sparkles } from 'lucide-react';
import answersData from '@/answers.json';
import { useAuth } from '@/lib/AuthContext';
import { getSavedListingIds, toggleSavedListingId } from '@/lib/savedListings';

export default function BrowseListingsPage() {
  const { session } = useAuth();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [selectedBhk, setSelectedBhk] = useState<string>('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('all');
  const [selectedMaxPricePreset, setSelectedMaxPricePreset] = useState<string>('all');
  const [customMaxPrice, setCustomMaxPrice] = useState<string>('');
  const [liveOnly, setLiveOnly] = useState<boolean>(true);
  const [excludeCorrupt, setExcludeCorrupt] = useState<boolean>(true);
  const [excludeFake, setExcludeFake] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('posted_desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;

  const corruptIdsSet = useMemo(() => new Set(answersData.corrupt_listing_ids || []), []);
  const fakeIdsSet = useMemo(() => new Set(answersData.fake_listing_ids || []), []);

  useEffect(() => {
    function syncSaved() {
      setSavedIds(getSavedListingIds());
    }

    syncSaved();
    window.addEventListener('storage', syncSaved);
    window.addEventListener('saved_listings_change', syncSaved);
    window.addEventListener('auth_state_change', syncSaved);
    return () => {
      window.removeEventListener('storage', syncSaved);
      window.removeEventListener('saved_listings_change', syncSaved);
      window.removeEventListener('auth_state_change', syncSaved);
    };
  }, [session]);

  const toggleSave = (id: string) => {
    const next = toggleSavedListingId(id);
    setSavedIds(next);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/listings.json');
        if (!res.ok) throw new Error('Fallback to static import');
        const rawListings: ListingItem[] = await res.json();
        
        const annotated = rawListings.map(item => ({
          ...item,
          isCorrupt: corruptIdsSet.has(item.listing_id),
          isFake: fakeIdsSet.has(item.listing_id)
        }));
        setListings(annotated);
      } catch (err) {
        try {
          const raw = await import('@/listings.json');
          const annotated = (raw.default || raw).map((item: any) => ({
            ...item,
            isCorrupt: corruptIdsSet.has(item.listing_id),
            isFake: fakeIdsSet.has(item.listing_id)
          }));
          setListings(annotated);
        } catch (e) {
          console.error('Failed to load listings data:', e);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [corruptIdsSet, fakeIdsSet]);

  const localities = useMemo(() => {
    const locSet = new Set<string>();
    listings.forEach(l => {
      if (l.locality) locSet.add(l.locality.toLowerCase());
    });
    return Array.from(locSet).sort();
  }, [listings]);

  const effectiveMaxPrice = useMemo(() => {
    if (customMaxPrice.trim() !== '') {
      const parsed = parseFloat(customMaxPrice);
      return !isNaN(parsed) && parsed > 0 ? parsed : null;
    }
    if (selectedMaxPricePreset !== 'all') {
      const parsed = parseFloat(selectedMaxPricePreset);
      return !isNaN(parsed) && parsed > 0 ? parsed : null;
    }
    return null;
  }, [customMaxPrice, selectedMaxPricePreset]);

  const formattedMaxPriceHint = useMemo(() => {
    if (effectiveMaxPrice === null) return null;
    if (effectiveMaxPrice >= 10000000) {
      return `Filtering under ₹${(effectiveMaxPrice / 10000000).toFixed(2)} Crores`;
    }
    if (effectiveMaxPrice >= 100000) {
      return `Filtering under ₹${(effectiveMaxPrice / 100000).toFixed(2)} Lakhs`;
    }
    return `Filtering under ₹${effectiveMaxPrice.toLocaleString('en-IN')}`;
  }, [effectiveMaxPrice]);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (liveOnly && item.is_live !== true) return false;
      if (excludeCorrupt && item.isCorrupt) return false;
      if (excludeFake && item.isFake) return false;
      if (selectedLocality !== 'all' && (item.locality || '').toLowerCase() !== selectedLocality) return false;
      if (selectedBhk !== 'all') {
        const bhkNum = parseInt(selectedBhk, 10);
        if (bhkNum === 5 ? (item.bedroom || 0) < 5 : item.bedroom !== bhkNum) return false;
      }
      if (selectedFurnishing !== 'all' && (item.furnishing || '').toLowerCase() !== selectedFurnishing) return false;
      if (effectiveMaxPrice !== null) {
        if (item.price === undefined || item.price === null || item.price > effectiveMaxPrice) return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const text = `${item.apartment_name || ''} ${item.locality || ''} ${item.description || ''} ${item.listing_id}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'area_desc') return (b.carpet_area || 0) - (a.carpet_area || 0);
      return new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime();
    });
  }, [listings, liveOnly, excludeCorrupt, excludeFake, selectedLocality, selectedBhk, selectedFurnishing, effectiveMaxPrice, searchQuery, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocality, selectedBhk, selectedFurnishing, selectedMaxPricePreset, customMaxPrice, liveOnly, excludeCorrupt, excludeFake, sortBy]);

  const totalPages = Math.ceil(filteredListings.length / pageSize) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      <Navbar />

      {/* Global 3D Cursor-Reactive Pastel Orbs Background */}
      <FloatingOrbsCanvas />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Bento Hero Header Banner */}
        <div className="relative overflow-hidden bg-white/70 border border-white/80 rounded-3xl p-8 sm:p-10 shadow-bento-card backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Next-Gen AI Real Estate</span>
            </div>

            <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Curated Estates & Intelligence
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Experience airy pastel minimalism powered by an empirical client-side sanitization engine. Bypassing broken API filters & flagging fraudulent listings.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
            <div className="bg-white/80 border border-slate-200/80 p-4 rounded-2xl shadow-sm text-right backdrop-blur-md">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Harvester Dataset</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">3,900 Listings</span>
            </div>

            <div className="bg-white/80 border border-slate-200/80 p-4 rounded-2xl shadow-sm text-right backdrop-blur-md">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Locality</span>
              <span className="text-lg font-bold text-indigo-600">Perungudi, Chennai</span>
            </div>
          </div>
        </div>

        {/* Floating Glassmorphic Filter & Control Bento Box */}
        <div className="bg-white/70 border border-white/80 rounded-3xl p-6 sm:p-8 shadow-bento-card backdrop-blur-xl space-y-6">
          
          {/* Top Search Bar & Sort */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project, locality, description or ID..."
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white/90 border border-slate-200/80 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-700 w-full md:w-auto shadow-sm">
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="posted_desc">Newest Posted</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_desc">Carpet Area: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Locality */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Locality
              </label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full py-2.5 px-3 bg-white/90 border border-slate-200/80 rounded-xl text-slate-800 text-xs capitalize focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
              >
                <option value="all">All Localities ({localities.length})</option>
                {localities.map(loc => (
                  <option key={loc} value={loc} className="capitalize">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* BHK Bedrooms */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Bedrooms (BHK)
              </label>
              <select
                value={selectedBhk}
                onChange={(e) => setSelectedBhk(e.target.value)}
                className="w-full py-2.5 px-3 bg-white/90 border border-slate-200/80 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
              >
                <option value="all">Any Bedroom</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Furnishing
              </label>
              <select
                value={selectedFurnishing}
                onChange={(e) => setSelectedFurnishing(e.target.value)}
                className="w-full py-2.5 px-3 bg-white/90 border border-slate-200/80 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
              >
                <option value="all">Any Furnishing</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully-Furnished</option>
              </select>
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>Max Price (₹)</span>
                {customMaxPrice && (
                  <button
                    onClick={() => { setCustomMaxPrice(''); setSelectedMaxPricePreset('all'); }}
                    className="text-[10px] text-indigo-600 hover:underline lowercase"
                  >
                    reset
                  </button>
                )}
              </label>
              
              <div className="space-y-1.5">
                <input
                  type="number"
                  placeholder="e.g. 10000000 (₹1 Cr)"
                  value={customMaxPrice}
                  onChange={(e) => {
                    setCustomMaxPrice(e.target.value);
                    setSelectedMaxPricePreset('all');
                  }}
                  className="w-full py-2.5 px-3 bg-white/90 border border-slate-200/80 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
                />

                <select
                  value={selectedMaxPricePreset}
                  onChange={(e) => {
                    setSelectedMaxPricePreset(e.target.value);
                    setCustomMaxPrice('');
                  }}
                  className="w-full py-1.5 px-2 bg-white/90 border border-slate-200/80 rounded-lg text-slate-700 text-[11px] focus:outline-none"
                >
                  <option value="all">Preset Budget Tiers</option>
                  <option value="5000000">Under ₹50 Lakhs (₹50,00,000)</option>
                  <option value="7500000">Under ₹75 Lakhs (₹75,00,000)</option>
                  <option value="10000000">Under ₹1 Crore (₹1,00,00,000)</option>
                  <option value="15000000">Under ₹1.5 Crores (₹1,50,00,000)</option>
                  <option value="20000000">Under ₹2 Crores (₹2,00,00,000)</option>
                </select>

                {formattedMaxPriceHint && (
                  <div className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>{formattedMaxPriceHint}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Toggle Switches for Data Quality Filters */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer bg-white/90 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-sm">
                <input
                  type="checkbox"
                  checked={liveOnly}
                  onChange={(e) => setLiveOnly(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-800">Live Only (is_live: true)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white/90 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-sm">
                <input
                  type="checkbox"
                  checked={excludeCorrupt}
                  onChange={(e) => setExcludeCorrupt(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-rose-600">Exclude Corrupt Data (25 IDs)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white/90 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-sm">
                <input
                  type="checkbox"
                  checked={excludeFake}
                  onChange={(e) => setExcludeFake(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-amber-600">Exclude Fraud/Scam (24 IDs)</span>
              </label>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing <span className="font-bold text-indigo-600">{filteredListings.length}</span> of {listings.length} listings
            </div>
          </div>

        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold text-slate-500">Loading dataset...</p>
          </div>
        ) : paginatedListings.length === 0 ? (
          <div className="py-20 bg-white/80 border border-slate-200/80 rounded-3xl text-center p-8 space-y-4 shadow-bento-card backdrop-blur-md">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-2xl font-bold text-slate-900">No Properties Found</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {effectiveMaxPrice !== null && effectiveMaxPrice < 2190000 ? (
                <>
                  Max price entered is <strong className="text-indigo-600">₹{(effectiveMaxPrice / 100000).toFixed(2)} Lakhs</strong>. Legitimate sale properties start at <strong className="text-indigo-600">₹21.90 Lakhs</strong>. Try setting max price to ₹50 Lakhs or ₹1 Crore.
                </>
              ) : (
                'No property listings match your selected filter criteria. Try clearing some filters.'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedListings.map(listing => (
              <ListingCard
                key={listing.listing_id}
                listing={listing}
                isSaved={savedIds.includes(listing.listing_id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="py-6 flex items-center justify-between border-t border-slate-200/80">
            <div className="text-xs text-slate-500 font-mono">
              Page <span className="font-bold text-indigo-600">{currentPage}</span> of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-40 text-xs font-semibold text-slate-700 rounded-xl transition-all shadow-sm"
              >
                Previous
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-white rounded-xl transition-all shadow-md"
              >
                Next Page
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
