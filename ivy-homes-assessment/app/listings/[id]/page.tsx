'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ListingCard, { ListingItem } from '@/components/ListingCard';
import SilkMeshCanvas from '@/components/3d/SilkMeshCanvas';
import { Heart, MapPin, Bed, Bath, Layers, CheckCircle2, AlertTriangle, ShieldAlert, ArrowLeft, Phone, User, Building, Info } from 'lucide-react';
import answersData from '@/answers.json';
import { useAuth } from '@/lib/AuthContext';
import { getSavedListingIds, toggleSavedListingId } from '@/lib/savedListings';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { session } = useAuth();

  const [listing, setListing] = useState<ListingItem | null>(null);
  const [allListings, setAllListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

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

  const toggleSave = (listingId: string) => {
    const next = toggleSavedListingId(listingId);
    setSavedIds(next);
  };

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      try {
        const raw = await import('@/listings.json');
        const data: ListingItem[] = (raw.default || raw).map((item: any) => ({
          ...item,
          isCorrupt: corruptIdsSet.has(item.listing_id),
          isFake: fakeIdsSet.has(item.listing_id)
        }));
        setAllListings(data);

        const target = data.find(l => l.listing_id === id);
        if (target) {
          setListing(target);
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error('Error loading listing detail:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadListing();
  }, [id, corruptIdsSet, fakeIdsSet]);

  const similarListings = useMemo(() => {
    if (!listing) return [];
    return allListings
      .filter(l => l.listing_id !== listing.listing_id && l.is_live === true && !l.isCorrupt && !l.isFake)
      .filter(l => (l.locality || '').toLowerCase() === (listing.locality || '').toLowerCase() || l.bedroom === listing.bedroom)
      .slice(0, 3);
  }, [listing, allListings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Listing Not Found</h2>
          <p className="text-slate-500 text-sm">No property listing found with ID "{id}".</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const isSaved = savedIds.includes(listing.listing_id);

  const formattedPrice = listing.price !== undefined && listing.price !== null
    ? listing.price < 0
      ? `₹${listing.price.toLocaleString('en-IN')} (CORRUPT PRICE)`
      : listing.price >= 10000000
        ? `₹${(listing.price / 10000000).toFixed(2)} Crores`
        : `₹${(listing.price / 100000).toFixed(2)} Lakhs`
    : 'N/A';

  const pricePerSqft = listing.carpet_area && listing.carpet_area > 0 && listing.price && listing.price > 0
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative pb-24">
      <Navbar />

      {/* Global 3D Rippling Silk Mesh Background */}
      <SilkMeshCanvas />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Navigation & Reference ID */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold transition-all shadow-sm backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" /> Back to Collection
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Ref ID:</span>
            <span className="font-mono text-xs text-slate-700 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-sm font-semibold">
              {listing.listing_id}
            </span>
          </div>
        </div>

        {/* Warning Banners */}
        {listing.isCorrupt && (
          <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-800 text-sm flex items-start gap-4 shadow-sm backdrop-blur-md">
            <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900 font-bold mb-1">Corrupt Listing Data Flagged</strong>
              This record describes a physically impossible state (e.g. negative price, floor exceeding total floors, or super built up area smaller than carpet area).
            </div>
          </div>
        )}

        {listing.isFake && (
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm flex items-start gap-4 shadow-sm backdrop-blur-md">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-900 font-bold mb-1">Fraudulent / Bait Listing Flagged</strong>
              This listing has been flagged by our analytics engine for advance-fee scam text or bait pricing. Never transfer booking money before physical verification.
            </div>
          </div>
        )}

        {/* Hero Banner Bento Card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/90 bg-white/70 shadow-bento-card backdrop-blur-xl">
          <div className="h-72 sm:h-96 w-full bg-gradient-to-tr from-violet-100/60 via-sky-100/40 to-emerald-100/30 relative flex flex-col justify-end p-6 sm:p-10 overflow-hidden">
            
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -left-20 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-700 bg-white/90 px-3.5 py-1 rounded-full border border-indigo-100 shadow-sm">
                  {listing.property_type || 'Apartment'}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-white/80 px-3.5 py-1 rounded-full border border-slate-200">
                  Source: {listing.website || 'Ivy Homes Direct'}
                </span>
                {listing.is_verified && (
                  <span className="text-xs font-bold text-white bg-emerald-500 px-3.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Residence
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                {listing.apartment_name || 'Architectural Residence'}
              </h1>

              <p className="text-base text-slate-600 flex items-center gap-2 capitalize font-medium">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>{listing.locality}, Chennai, Tamil Nadu</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bento Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Key Metrics Bento Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/80 border border-slate-200/80 p-5 rounded-2xl shadow-sm backdrop-blur-md">
                <Bed className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Bedrooms</span>
                <span className="text-2xl font-bold text-slate-900">{listing.bedroom || 0} BHK</span>
              </div>

              <div className="bg-white/80 border border-slate-200/80 p-5 rounded-2xl shadow-sm backdrop-blur-md">
                <Bath className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Bathrooms</span>
                <span className="text-2xl font-bold text-slate-900">{listing.bathroom || 0} Bath</span>
              </div>

              <div className="bg-white/80 border border-slate-200/80 p-5 rounded-2xl shadow-sm backdrop-blur-md">
                <Layers className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Carpet Area</span>
                <span className="text-2xl font-bold text-slate-900">{listing.carpet_area || 0} <span className="text-xs font-normal text-slate-500">sqft</span></span>
              </div>

              <div className="bg-white/80 border border-slate-200/80 p-5 rounded-2xl shadow-sm backdrop-blur-md">
                <Building className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Elevation</span>
                <span className="text-2xl font-bold text-slate-900">
                  {listing.floor !== null ? `Fl. ${listing.floor}` : 'N/A'} {listing.total_floors ? `/ ${listing.total_floors}` : ''}
                </span>
              </div>
            </div>

            {/* Property Overview Bento Card */}
            <div className="bg-white/80 border border-white/90 rounded-3xl p-8 space-y-4 shadow-bento-card backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
                Property Description & Narrative
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                {listing.description || 'This exclusive residence offers modern living space tailored for elegance and functionality in the heart of Chennai.'}
              </p>
            </div>

            {/* Technical Specs Bento Card */}
            <div className="bg-white/80 border border-white/90 rounded-3xl p-8 space-y-6 shadow-bento-card backdrop-blur-xl">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" /> Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Listing ID</span>
                  <span className="font-mono text-slate-900 font-bold">{listing.listing_id}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Super Built-up Area</span>
                  <span className="text-slate-900 font-semibold">{listing.super_built_up_area ? `${listing.super_built_up_area} sqft` : 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Furnishing</span>
                  <span className="text-indigo-600 font-semibold capitalize">{listing.furnishing || 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Facing Direction</span>
                  <span className="text-slate-900 font-semibold capitalize">{listing.facing_direction || 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Covered Parking</span>
                  <span className="text-slate-900 font-semibold">{listing.covered_parking ? `${listing.covered_parking} Slot(s)` : 'None'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Balcony Count</span>
                  <span className="text-slate-900 font-semibold">{listing.balcony !== undefined ? `${listing.balcony}` : 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Coordinates</span>
                  <span className="font-mono text-slate-700">{listing.latitude}, {listing.longitude}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Project Code</span>
                  <span className="font-mono text-indigo-600 font-bold">{listing.project_id || 'Resale / Standalone'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Sidebar Bento Box */}
          <div className="space-y-6">
            
            <div className="bg-white/80 border border-white/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-bento-card backdrop-blur-xl sticky top-28">
              
              <div className="space-y-2 border-b border-slate-100 pb-6">
                <span className="text-xs text-indigo-600 uppercase tracking-widest font-bold block">Asking Price</span>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  {formattedPrice}
                </div>
                {pricePerSqft !== null && (
                  <p className="text-xs text-slate-500">
                    Rate: <strong className="text-indigo-600">₹{pricePerSqft.toLocaleString('en-IN')}</strong> / sqft carpet
                  </p>
                )}
              </div>

              <button
                onClick={() => toggleSave(listing.listing_id)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm ${
                  isSaved
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved in Portfolio' : 'Bookmark Property'}</span>
              </button>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Agent / Owner</span>
                    <span className="font-bold text-slate-900 text-sm">{listing.posted_by_name || 'Verified Partner'}</span>
                  </div>
                </div>

                <a
                  href={`tel:${listing.posted_by_contact}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md uppercase tracking-wider"
                >
                  <Phone className="w-4 h-4" />
                  <span>Inquire Now ({listing.posted_by_contact || 'Contact'})</span>
                </a>
              </div>

            </div>

          </div>

        </div>

        {/* Similar Listings Carousel */}
        {similarListings.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-200/80">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Building className="w-6 h-6 text-indigo-600" /> Curated Residences in {listing.locality}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarListings.map(sim => (
                <ListingCard
                  key={sim.listing_id}
                  listing={sim}
                  isSaved={savedIds.includes(sim.listing_id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 border-t border-slate-200 backdrop-blur-xl px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <span className="text-xs text-slate-500 block font-medium">Interested in this property?</span>
            <span className="text-sm font-bold text-slate-900">{listing.apartment_name || 'Residence Detail'} — {formattedPrice}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => toggleSave(listing.listing_id)}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                isSaved ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <a
              href={`tel:${listing.posted_by_contact}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md uppercase tracking-wider"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Agent</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
