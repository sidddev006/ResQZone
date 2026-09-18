import React, { useState, useEffect } from 'react';
import { Building2, Droplets, Utensils, Bed, Stethoscope, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../api/client';

export default function CarryingCapacityView({ selectedRegion = 'ALL', currentRegionObj }) {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShelters();
  }, [selectedRegion]);

  const loadShelters = async () => {
    try {
      setLoading(true);
      const districtParam = selectedRegion === 'ALL' ? null : (currentRegionObj?.district || selectedRegion);
      const data = await api.getSheltersCapacity(districtParam);
      setShelters(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OVER_CAPACITY': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'HIGH_LOAD': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'NORMAL': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'INACCESSIBLE': return 'bg-slate-700/30 text-slate-400 border-slate-600';
      default: return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const totalEffective = shelters.reduce((sum, s) => sum + (s.effective_safe_capacity || 0), 0);
  const totalOccupied = shelters.reduce((sum, s) => sum + (s.current_occupancy || 0), 0);
  const totalAvailable = Math.max(0, totalEffective - totalOccupied);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="p-6 sm:p-7 rounded-3xl eleken-card border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400 font-semibold tracking-wide">
            <span>HUMANITARIAN STANDARDS (SPHERE & WHO)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA RELIEF BASES'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Safe Shelter Carrying Capacity & Resource Bottlenecks</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Strict multi-resource bottleneck evaluation: Minimum Safe Water (15L/day), Sanitation (1:20), Food Rations (2100 kcal), and Clinical Bed Area.
          </p>
        </div>

        {/* Global Summary Metric Ribbon */}
        <div className="flex items-center space-x-6 bg-[#131A2B]/80 px-6 py-3 rounded-2xl border border-white/[0.08] text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Safe Capacity</span>
            <span className="font-extrabold text-white text-lg">{totalEffective.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-white/[0.08]"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Occupied</span>
            <span className="font-extrabold text-amber-400 text-lg">{totalOccupied.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-white/[0.08]"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Available Headroom</span>
            <span className="font-extrabold text-emerald-400 text-lg">{totalAvailable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Grid of Shelters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shelters.map((s) => (
          <div
            key={s.shelter_id}
            className="p-6 rounded-3xl eleken-card border border-white/[0.08] space-y-4 shadow-xl"
          >
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3.5">
              <div>
                <h3 className="font-bold text-white text-base tracking-tight">{s.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 font-medium text-[11px]">
                    {s.shelter_type}
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400 font-medium">{s.district || 'District Base'}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(s.capacity_status)}`}>
                {s.capacity_status}
              </span>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Safe Carrying Capacity Utilization</span>
                <span className="font-bold text-white text-sm">{s.capacity_utilization_pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.capacity_utilization_pct > 90
                      ? 'bg-rose-500'
                      : s.capacity_utilization_pct > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, s.capacity_utilization_pct)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                <span>Occupants: <strong className="text-white">{s.current_occupancy}</strong></span>
                <span>Safe Ceiling: <strong className="text-white">{s.effective_safe_capacity}</strong></span>
                <span className="text-emerald-400 font-bold">Free: {s.available_safe_capacity}</span>
              </div>
            </div>

            {/* Resource Normalized Limits */}
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Resource Normalized Constraints (People Supported)
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-2xl border ${s.bottleneck_resource === 'water' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-white/[0.03] border-white/[0.05] text-slate-300'}`}>
                  <span className="text-slate-400 text-[10px] block font-medium">WATER (15L)</span>
                  <span className="font-bold text-white text-sm">{s.resource_limits?.water_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${s.bottleneck_resource === 'sanitation' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-white/[0.03] border-white/[0.05] text-slate-300'}`}>
                  <span className="text-slate-400 text-[10px] block font-medium">TOILETS (1:20)</span>
                  <span className="font-bold text-white text-sm">{s.resource_limits?.sanitation_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${s.bottleneck_resource === 'food' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-white/[0.03] border-white/[0.05] text-slate-300'}`}>
                  <span className="text-slate-400 text-[10px] block font-medium">FOOD (2100k)</span>
                  <span className="font-bold text-white text-sm">{s.resource_limits?.food_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${s.bottleneck_resource === 'beds' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-white/[0.03] border-white/[0.05] text-slate-300'}`}>
                  <span className="text-slate-400 text-[10px] block font-medium">BED SPACES</span>
                  <span className="font-bold text-white text-sm">{s.resource_limits?.bed_supported_people?.toLocaleString() || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
