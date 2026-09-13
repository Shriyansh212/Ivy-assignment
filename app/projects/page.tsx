'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FloatingOrbsCanvas from '@/components/3d/FloatingOrbsCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, MapPin, Layers, AlertCircle, CheckCircle2, Calendar, ShieldCheck, Tag, X, ExternalLink, Info, Check } from 'lucide-react';

export interface ProjectItem {
  project_id: string;
  project_url?: string;
  city_id?: number;
  apartment_name?: string;
  developer_name?: string;
  locality?: string;
  project_status?: string;
  total_units?: number;
  total_towers?: number;
  total_floors?: number;
  launch_date?: string;
  possession_date?: string;
  rera_number?: string;
  min_area_sqft?: number;
  max_area_sqft?: number;
  total_listings: number; // Reported in API
  price_min: number; // Float in Lakhs/Crores
  price_max: number; // Float in Lakhs/Crores
  amenities?: string[];
  latitude?: number;
  longitude?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const rawProj = await import('@/projects.json');
        const rawList = await import('@/listings.json');
        setProjects(rawProj.default || rawProj);
        setListings(rawList.default || rawList);
      } catch (err) {
        console.error('Error loading projects dataset:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const actualListingCounts = useMemo(() => {
    const map: Record<string, number> = {};
    listings.forEach(l => {
      if (l.project_id) {
        map[l.project_id] = (map[l.project_id] || 0) + 1;
      }
    });
    return map;
  }, [listings]);

  const localities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.locality) set.add(p.locality.toLowerCase().trim());
    });
    return Array.from(set).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (selectedLocality !== 'all' && (p.locality || '').toLowerCase().trim() !== selectedLocality) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const text = `${p.project_id} ${p.apartment_name || ''} ${p.developer_name || ''} ${p.locality || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [projects, selectedLocality, searchQuery]);

  const formatProjectPrice = (val: number) => {
    if (val === undefined || val === null) return 'N/A';
    if (val <= 10) {
      return `₹${val} Cr`;
    }
    return `₹${val} Lakhs`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      <Navbar />

      <FloatingOrbsCanvas />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Bento Header Banner */}
        <div className="relative overflow-hidden bg-white/70 border border-white/80 rounded-3xl p-8 shadow-bento-card backdrop-blur-xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5 text-purple-300" /> Builder Projects & Developments
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Architectural Builder Projects in Chennai
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl">
              Normalized price units (Lakhs & Crores) and cross-referenced actual live listing availability against API reported counts. Select any project card to view specs.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-bento-card backdrop-blur-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by builder, project name, or locality..."
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
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.slice(0, 48).map((project, index) => {
              const actualCount = actualListingCounts[project.project_id] || 0;
              const hasCountMismatch = project.total_listings !== actualCount;

              return (
                <motion.div
                  key={project.project_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                  onClick={() => setSelectedProject(project)}
                  className="spotlight-card group cursor-pointer bg-white/70 border border-slate-200/80 hover:border-purple-300/80 rounded-3xl p-5 shadow-bento-card hover:shadow-bento-hover space-y-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {project.project_status || 'Under Construction'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{project.project_id}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {project.apartment_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      By {project.developer_name || 'Builder'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 capitalize font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{project.locality}, Chennai</span>
                    </p>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 space-y-1">
                    <span className="text-[11px] text-slate-500 block font-medium">Price Range (Normalized)</span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatProjectPrice(project.price_min)} — {formatProjectPrice(project.price_max)}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Area: {project.min_area_sqft} - {project.max_area_sqft} sqft
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    hasCountMismatch
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-slate-50 border-slate-200/60 text-slate-700'
                  }`}>
                    <span>API Reported: <strong>{project.total_listings}</strong></span>
                    <span>Actual: <strong className={hasCountMismatch ? 'text-amber-600 underline font-bold' : 'text-slate-900'}>{actualCount}</strong> listings</span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm text-center"
                  >
                    View Project Details
                  </button>

                </motion.div>
              );
            })}
          </div>
        )}

      </main>

      {/* Interactive Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/90 border border-white/90 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {selectedProject.project_status || 'Project'}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedProject.apartment_name}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 capitalize font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{selectedProject.locality}, Chennai • By {selectedProject.developer_name || 'Builder'}</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price & Unit Range */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-2">
                <span className="text-xs text-slate-500 font-medium block">Price Range (Normalized Lakhs / Crores)</span>
                <div className="text-3xl font-bold text-slate-900">
                  {formatProjectPrice(selectedProject.price_min)} — {formatProjectPrice(selectedProject.price_max)}
                </div>
                <p className="text-xs text-slate-600">
                  Carpet Area Range: <strong className="text-indigo-600">{selectedProject.min_area_sqft} sqft</strong> to <strong className="text-indigo-600">{selectedProject.max_area_sqft} sqft</strong>
                </p>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Project ID</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedProject.project_id}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Total Units</span>
                  <span className="text-slate-900 font-semibold">{selectedProject.total_units || 'N/A'} Units</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Total Towers</span>
                  <span className="text-slate-900 font-semibold">{selectedProject.total_towers || 'N/A'} Towers</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Launch Date</span>
                  <span className="text-slate-900 font-semibold">{selectedProject.launch_date || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Possession Date</span>
                  <span className="text-slate-900 font-semibold">{selectedProject.possession_date || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">RERA Number</span>
                  <span className="text-indigo-600 font-mono font-bold text-[11px] truncate block">{selectedProject.rera_number || 'Registered'}</span>
                </div>
              </div>

              {/* Amenities */}
              {selectedProject.amenities && selectedProject.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Amenities & Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.amenities.map(item => (
                      <span key={item} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl capitalize">
                        <Check className="w-3.5 h-3.5 text-indigo-600" /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Link */}
              {selectedProject.project_url && (
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <a
                    href={selectedProject.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md uppercase tracking-wider"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Project Source</span>
                  </a>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
