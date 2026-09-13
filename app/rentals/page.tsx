'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FloatingOrbsCanvas from '@/components/3d/FloatingOrbsCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Search, MapPin, Bed, Bath, Layers, Filter, ShieldCheck, DollarSign, Calendar, X, Phone, ExternalLink, Info, User, Building } from 'lucide-react';

export interface RentalItem {
  listing_id: string;
  listing_url?: string;
  website?: string;
  city_id?: number;
  title?: string;
  apartment_name?: string;
  locality?: string;
  property_type?: string;
  bedroom?: number;
  bathroom?: number;
  floor?: number;
  total_floors?: number;
  furnishing?: string;
  facing_direction?: string;
  price: number; // monthly rent
  deposit?: number;
  maintenance?: number;
  carpet_area: number;
  super_builtup_area?: number;
  latitude?: number;
  longitude?: number;
  posted_by?: string;
  posted_by_name?: string;
  posted_by_contact?: string;
  description?: string;
  posted_at?: string;
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<RentalItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [selectedBhk, setSelectedBhk] = useState<string>('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('all');

  useEffect(() => {
    async function loadRentals() {
      setLoading(true);
      try {
        const raw = await import('@/rentals.json');
        setRentals(raw.default || raw);
      } catch (err) {
        console.error('Error loading rentals dataset:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRentals();
  }, []);

  const localities = useMemo(() => {
    const set = new Set<string>();
    rentals.forEach(r => {
      if (r.locality) set.add(r.locality.toLowerCase().trim());
    });
    return Array.from(set).sort();
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      if (selectedLocality !== 'all' && (r.locality || '').toLowerCase().trim() !== selectedLocality) return false;
      if (selectedBhk !== 'all') {
        const num = parseInt(selectedBhk, 10);
        if (num === 4 ? (r.bedroom || 0) < 4 : r.bedroom !== num) return false;
      }
      if (selectedFurnishing !== 'all' && (r.furnishing || '').toLowerCase().trim() !== selectedFurnishing) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const text = `${r.title || ''} ${r.apartment_name || ''} ${r.locality || ''} ${r.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rentals, selectedLocality, selectedBhk, selectedFurnishing, searchQuery]);

  const perungudiRentTotal = useMemo(() => {
    const list = rentals.filter(r => r.locality && r.locality.toLowerCase().trim() === 'perungudi');
    return list.reduce((sum, r) => sum + r.price, 0);
  }, [rentals]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      <Navbar />

      <FloatingOrbsCanvas />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Bento Header */}
        <div className="relative overflow-hidden bg-white/70 border border-white/80 rounded-3xl p-8 shadow-bento-card backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-3">
              <KeyRound className="w-3.5 h-3.5 text-purple-300" /> Rental Residences Collection
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Curated Rental Homes in Chennai
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl">
              All prices rendered in Monthly Rent (₹/month) & Carpet Area in SqFt. Select any property card to view details.
            </p>
          </div>

          <div className="relative z-10 bg-white/80 border border-slate-200/80 p-4 rounded-2xl text-right backdrop-blur-md shadow-sm">
            <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">
              Assigned Locality (Perungudi) Rent Sum
            </span>
            <span className="text-2xl font-bold text-indigo-600 font-mono">
              ₹{perungudiRentTotal.toLocaleString('en-IN')} <span className="text-xs font-sans text-slate-500">/ mo</span>
            </span>
          </div>
        </div>

        {/* Toolbar Filter Bento Box */}
        <div className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-bento-card backdrop-blur-xl">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rentals by title, apartment, or locality..."
                className="w-full py-2.5 pl-10 pr-4 bg-white/90 border border-slate-200/80 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <div>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full py-2.5 px-3 bg-white/90 border border-slate-200/80 rounded-xl text-slate-800 text-xs capitalize focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
              >
                <option value="all">All Localities ({localities.length})</option>
                {localities.map(loc => (
                  <option key={loc} value={loc} className="capitalize">{loc}</option>
                ))}
              </select>
            </div>

            <div>
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
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRentals.slice(0, 48).map((rental, index) => (
              <motion.div
                key={rental.listing_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                onClick={() => setSelectedRental(rental)}
                className="spotlight-card group cursor-pointer bg-white/70 border border-slate-200/80 hover:border-purple-300/80 rounded-3xl p-5 shadow-bento-card hover:shadow-bento-hover space-y-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {rental.furnishing || 'Rental'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{rental.listing_id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {rental.title || `${rental.bedroom} BHK in ${rental.apartment_name || 'Residence'}`}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 capitalize font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{rental.locality}, Chennai</span>
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Monthly Rent</span>
                    <span className="text-xl font-bold text-slate-900">
                      ₹{rental.price?.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">/mo</span>
                    </span>
                  </div>
                  {rental.deposit && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Deposit</span>
                      <span className="text-xs font-bold text-indigo-600">₹{(rental.deposit / 1000).toFixed(0)}k</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Bedrooms</span>
                    <span>{rental.bedroom} BHK</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Bathrooms</span>
                    <span>{rental.bathroom} Bath</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Carpet Area</span>
                    <span>{rental.carpet_area} sqft</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm text-center"
                >
                  View Details
                </button>

              </motion.div>
            ))}
          </div>
        )}

      </main>

      {/* Interactive Detail Modal */}
      <AnimatePresence>
        {selectedRental && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/90 border border-white/90 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {selectedRental.furnishing || 'Rental Home'}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedRental.title || `${selectedRental.bedroom} BHK Residence`}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 capitalize font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{selectedRental.locality}, Chennai</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRental(null)}
                  className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Financial Highlights */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Monthly Rent</span>
                  <span className="text-2xl font-bold text-indigo-600">₹{selectedRental.price?.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Security Deposit</span>
                  <span className="text-lg font-bold text-slate-900">₹{selectedRental.deposit?.toLocaleString('en-IN') || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Maintenance</span>
                  <span className="text-lg font-bold text-slate-900">₹{selectedRental.maintenance ? `${selectedRental.maintenance}/mo` : 'Included'}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <Bed className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">Bedrooms</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRental.bedroom} BHK</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <Bath className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">Bathrooms</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRental.bathroom} Bath</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <Layers className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">Carpet Area</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRental.carpet_area} sqft</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <Building className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">Floor</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRental.floor || 0} of {selectedRental.total_floors || 0}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  {selectedRental.description || 'No description provided for this rental property.'}
                </p>
              </div>

              {/* Contact Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase block">Posted By ({selectedRental.posted_by || 'owner'})</span>
                    <span className="text-xs font-bold text-slate-900">{selectedRental.posted_by_name || 'Property Owner'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${selectedRental.posted_by_contact}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md uppercase tracking-wider"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {selectedRental.posted_by_contact || 'Owner'}</span>
                  </a>

                  {selectedRental.listing_url && (
                    <a
                      href={selectedRental.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
