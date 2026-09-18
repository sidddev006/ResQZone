import React, { useState, useEffect } from 'react';
import { Building2, Droplets, Utensils, Bed, Stethoscope, AlertCircle, ShieldCheck } from 'lucide-react';
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
      case 'OVER_CAPACITY': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-rose/30';
      case 'HIGH_LOAD': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'NORMAL': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'INACCESSIBLE': return 'bg-slate-700/40 text-slate-400 border-slate-600';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const totalEffective = shelters.reduce((sum, s) => sum + (s.effective_safe_capacity || 0), 0);
  const totalOccupied = shelters.reduce((sum, s) => sum + (s.current_occupancy || 0), 0);
  const totalAvailable = Math.max(0, totalEffective - totalOccupied);

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-mono text-cyan-400">
            <span>HUMANITARIAN STANDARDS SPHERE & WHO</span>
            <span>•</span>
            <span className="text-slate-400">{currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA RELIEF GRID'}</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">Shelter Carrying Capacity & Resource Bottlenecks</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict Multi-Resource Bottleneck Evaluation: Safe Water (15L/person/day), Sanitation (1 latrine:20 persons), Food Rations & Bed Area
          </p>
        </div>

        {/* Global Summary */}
        <div className="flex items-center space-x-4 bg-[#131A2B] px-5 py-2.5 rounded-xl border border-white/10 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Safe Capacity</span>
            <span className="font-bold text-white text-base">{totalEffective.toLocaleString()}</span>
          </div>
          <div className="h-7 w-px bg-white/10"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Occupied</span>
            <span className="font-bold text-amber-400 text-base">{totalOccupied.toLocaleString()}</span>
          </div>
          <div className="h-7 w-px bg-white/10"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Available Headroom</span>
            <span className="font-bold text-emerald-400 text-base">{totalAvailable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Grid of Shelters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => (
          <div
            key={s.shelter_id}
            className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-4 shadow-2xl"
          >
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm font-mono">{s.name}</h3>
                <span className="text-[10px] font-mono text-cyan-400">{s.shelter_id} • {s.shelter_type}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(s.capacity_status)}`}>
                {s.capacity_status}
              </span>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 text-[11px]">Safe Utilization</span>
                <span className="font-bold text-white">{s.capacity_utilization_pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#131A2B] overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.capacity_utilization_pct > 90
                      ? 'bg-rose-500 shadow-glow-rose'
                      : s.capacity_utilization_pct > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-400 shadow-glow-emerald'
                  }`}
                  style={{ width: `${Math.min(100, s.capacity_utilization_pct)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Occupants: <strong className="text-slate-200">{s.current_occupancy}</strong></span>
                <span>Safe Max: <strong className="text-slate-200">{s.effective_safe_capacity}</strong></span>
                <span className="text-emerald-400 font-bold">Free: {s.available_safe_capacity}</span>
              </div>
            </div>

            {/* Resource Normalized Limits */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                RESOURCE SPECIFIC CAPACITY (HEADCOUNT SUPPORTED)
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                <div className={`p-2 rounded-xl border ${s.bottleneck_resource === 'water' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-[#131A2B] border-white/5 text-slate-300'}`}>
                  <span className="text-slate-500 text-[9px] block">WATER (15L)</span>
                  <span className="font-bold text-white text-[13px]">{s.resource_limits?.water_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-xl border ${s.bottleneck_resource === 'sanitation' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-[#131A2B] border-white/5 text-slate-300'}`}>
                  <span className="text-slate-500 text-[9px] block">TOILETS (1:20)</span>
                  <span className="font-bold text-white text-[13px]">{s.resource_limits?.sanitation_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-xl border ${s.bottleneck_resource === 'food' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-[#131A2B] border-white/5 text-slate-300'}`}>
                  <span className="text-slate-500 text-[9px] block">FOOD (2100kcal)</span>
                  <span className="font-bold text-white text-[13px]">{s.resource_limits?.food_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-xl border ${s.bottleneck_resource === 'beds' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-[#131A2B] border-white/5 text-slate-300'}`}>
                  <span className="text-slate-500 text-[9px] block">BED SPACES</span>
                  <span className="font-bold text-white text-[13px]">{s.resource_limits?.bed_supported_people?.toLocaleString() || '-'}</span>
                </div>
              </div>
            </div>

            {/* Limiting Bottleneck Pill */}
            <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10 text-xs font-mono">
              <span className="font-bold text-amber-400 capitalize block">
                Limiting Constraint: {s.bottleneck_resource?.toUpperCase()}
              </span>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{s.bottleneck_explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
