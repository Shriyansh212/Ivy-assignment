'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ListingCard, { ListingItem } from '@/components/ListingCard';
import FloatingOrbsCanvas from '@/components/3d/FloatingOrbsCanvas';
import { Heart, Trash2, Building2 } from 'lucide-react';
import answersData from '@/answers.json';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getSavedListingIds, toggleSavedListingId, clearSavedListings } from '@/lib/savedListings';

export default function SavedListingsPage() {
  const { session } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [allListings, setAllListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const corruptIdsSet = useMemo(() => new Set(answersData.corrupt_listing_ids || []), []);
  const fakeIdsSet = useMemo(() => new Set(answersData.fake_listing_ids || []), []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const raw = await import('@/listings.json');
        const data: ListingItem[] = (raw.default || raw).map((item: any) => ({
          ...item,
          isCorrupt: corruptIdsSet.has(item.listing_id),
          isFake: fakeIdsSet.has(item.listing_id)
        }));
        setAllListings(data);
      } catch (err) {
        console.error('Failed to load listings for saved page:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [corruptIdsSet, fakeIdsSet]);

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

  const handleClearAll = () => {
    clearSavedListings();
    setSavedIds([]);
  };

  const savedListings = useMemo(() => {
    const map = new Map(allListings.map(l => [l.listing_id, l]));
    return savedIds.map(id => map.get(id)).filter(Boolean) as ListingItem[];
  }, [savedIds, allListings]);

  const currentUserText = session?.user?.email
    ? `User: ${session.user.email}`
    : 'Guest Account';

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      <Navbar />

      <FloatingOrbsCanvas />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Bento Header */}
        <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 border border-white/80 p-8 rounded-3xl shadow-bento-card backdrop-blur-xl">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shadow-sm">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Saved Portfolio</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Per-User Saved Favorites ({currentUserText} — {savedListings.length} saved properties)
              </p>
            </div>
          </div>

          {savedListings.length > 0 && (
            <button
              onClick={handleClearAll}
              className="relative z-10 flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" /> Clear Saved Portfolio
            </button>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          </div>
        ) : savedListings.length === 0 ? (
          <div className="py-20 bg-white/80 border border-slate-200/80 rounded-3xl text-center p-8 space-y-5 shadow-bento-card backdrop-blur-md">
            <Heart className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-2xl font-bold text-slate-900">No Saved Residences</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No saved properties for {currentUserText}. Click the heart icon on any property card to bookmark it to your account.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md uppercase tracking-wider"
            >
              <Building2 className="w-4 h-4" /> Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map(listing => (
              <ListingCard
                key={listing.listing_id}
                listing={listing}
                isSaved={true}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
