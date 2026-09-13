'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Layers, CheckCircle2, AlertTriangle, ShieldAlert, ArrowUpRight } from 'lucide-react';

export interface ListingItem {
  listing_id: string;
  listing_url?: string;
  website?: string;
  city_id?: number;
  apartment_name?: string;
  locality?: string;
  property_type?: string;
  bedroom?: number;
  bathroom?: number;
  balcony?: number;
  floor?: number;
  total_floors?: number;
  furnishing?: string;
  facing_direction?: string;
  covered_parking?: number;
  price?: number;
  carpet_area?: number;
  super_built_up_area?: number;
  latitude?: number;
  longitude?: number;
  posted_by?: string;
  posted_by_name?: string;
  posted_by_contact?: string;
  project_id?: string;
  description?: string;
  posted_at?: string;
  is_verified?: boolean;
  is_live?: boolean;
  isCorrupt?: boolean;
  isFake?: boolean;
}

interface Props {
  listing: ListingItem;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export default function ListingCard({ listing, isSaved, onToggleSave }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Framer Motion 3D Tilt Effect Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [6, -6]);
  const rotateY = useTransform(x, [-100, 100], [-6, 6]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Set CSS custom variables for mouse spotlight border glow
    cardRef.current.style.setProperty('--mouse-x', `${(mouseX / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--mouse-y', `${(mouseY / rect.height) * 100}%`);

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const pricePerSqft = listing.carpet_area && listing.carpet_area > 0 && listing.price && listing.price > 0
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  const formattedPrice = listing.price !== undefined && listing.price !== null
    ? listing.price < 0
      ? `₹${listing.price.toLocaleString('en-IN')} (CORRUPT)`
      : listing.price >= 10000000
        ? `₹${(listing.price / 10000000).toFixed(2)} Cr`
        : `₹${(listing.price / 100000).toFixed(2)} Lakhs`
    : 'N/A';

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`spotlight-card group relative bg-white/70 border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-bento-card hover:shadow-bento-hover hover:-translate-y-1 ${
        listing.isCorrupt
          ? 'border-rose-300/80 bg-rose-50/30'
          : listing.isFake
            ? 'border-amber-300/80 bg-amber-50/30'
            : 'border-slate-200/80 hover:border-purple-300/80'
      }`}
    >
      {/* Visual Header Banner */}
      <div className="relative h-44 bg-gradient-to-br from-violet-100/50 via-sky-50/40 to-emerald-50/30 p-5 flex flex-col justify-between overflow-hidden">
        
        {/* Iridescent Pastel Gradient Blur */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-300/30 rounded-full blur-2xl group-hover:bg-purple-400/40 transition-all" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl" />

        {/* Badges Header */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            {listing.is_verified && (
              <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}

            {listing.is_live === false && (
              <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold">
                Inactive
              </span>
            )}

            {listing.isCorrupt && (
              <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                <ShieldAlert className="w-3 h-3" /> Corrupt Data
              </span>
            )}

            {listing.isFake && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                <AlertTriangle className="w-3 h-3" /> Fraud Flagged
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(listing.listing_id);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isSaved
                ? 'bg-rose-500 text-white shadow-rose-500/30 scale-110'
                : 'bg-white/80 text-slate-400 hover:text-slate-900 hover:bg-white'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Property'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Price Banner */}
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 block mb-0.5 font-bold">
            {listing.property_type || 'Apartment'} • {listing.website || 'Direct'}
          </span>
          <div className="font-sans text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{formattedPrice}</span>
            {pricePerSqft !== null && pricePerSqft > 0 && (
              <span className="text-xs font-medium text-slate-500">
                (₹{pricePerSqft.toLocaleString('en-IN')}/sqft)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {listing.apartment_name || 'Property Listing'}
          </h3>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1 capitalize">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span>{listing.locality || 'Chennai'}</span>
          </p>

          <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
            {listing.description || 'No description provided.'}
          </p>
        </div>

        {/* Specs Bento Pills */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-slate-700 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-slate-50/80 p-2 rounded-xl border border-slate-200/60 justify-center">
            <Bed className="w-3.5 h-3.5 text-purple-500" />
            <span>{listing.bedroom || 0} BHK</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50/80 p-2 rounded-xl border border-slate-200/60 justify-center">
            <Bath className="w-3.5 h-3.5 text-purple-500" />
            <span>{listing.bathroom || 0} Bath</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50/80 p-2 rounded-xl border border-slate-200/60 justify-center">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>{listing.carpet_area || 0} sqft</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-mono">
            ID: {listing.listing_id}
          </span>
          <Link
            href={`/listings/${listing.listing_id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm group/link"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
