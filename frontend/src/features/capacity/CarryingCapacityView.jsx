import React, { useState, useEffect } from 'react';
import { Building2, Droplets, Utensils, Bed, Stethoscope, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../api/client';

export default function CarryingCapacityView({ 
  selectedRegion = 'ALL', 
  currentRegionObj,
  theme = 'light' 
}) {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

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
    if (isDark) {
      switch (status) {
        case 'OVER_CAPACITY': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
        case 'HIGH_LOAD': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
        case 'NORMAL': return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
        case 'INACCESSIBLE': return 'bg-slate-700/30 text-slate-400 border-slate-600';
        default: return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      }
    } else {
      switch (status) {
        case 'OVER_CAPACITY': return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'HIGH_LOAD': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'NORMAL': return 'bg-sky-50 text-sky-700 border-sky-200';
        case 'INACCESSIBLE': return 'bg-slate-100 text-slate-600 border-slate-200';
        default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
    }
  };

  const totalEffective = shelters.reduce((sum, s) => sum + (s.effective_safe_capacity || 0), 0);
  const totalOccupied = shelters.reduce((sum, s) => sum + (s.current_occupancy || 0), 0);
  const totalAvailable = Math.max(0, totalEffective - totalOccupied);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-bold tracking-wide">
            <span className="text-sky-600 dark:text-sky-400">HUMANITARIAN STANDARDS (SPHERE & WHO)</span>
            <span className="text-slate-400">•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              {currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA RELIEF BASES'}
            </span>
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Safe Shelter Carrying Capacity & Resource Bottlenecks
          </h2>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Strict multi-resource bottleneck evaluation: Minimum Safe Water (15L/day), Sanitation (1:20), Food Rations (2100 kcal), and Clinical Bed Area.
          </p>
        </div>

        {/* Summary Metric Ribbon */}
        <div className={`flex items-center space-x-6 px-6 py-3.5 rounded-2xl border text-xs ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className="opacity-60 block text-[10px] uppercase font-bold tracking-wider">Safe Capacity</span>
            <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalEffective.toLocaleString()}</span>
          </div>
          <div className={`h-8 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          <div>
            <span className="opacity-60 block text-[10px] uppercase font-bold tracking-wider">Occupied</span>
            <span className="font-black text-amber-500 text-lg">{totalOccupied.toLocaleString()}</span>
          </div>
          <div className={`h-8 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          <div>
            <span className="opacity-60 block text-[10px] uppercase font-bold tracking-wider">Available Headroom</span>
            <span className="font-black text-emerald-500 text-lg">{totalAvailable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Grid of Shelters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shelters.map((s) => (
          <div
            key={s.shelter_id}
            className={`p-6 rounded-3xl border space-y-4 shadow-sm transition-all ${
              isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
            }`}
          >
            {/* Title & Status */}
            <div className={`flex items-start justify-between gap-3 border-b pb-3.5 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <h3 className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {s.name}
                </h3>
                <div className="flex items-center space-x-2 text-xs opacity-70 mt-1">
                  <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] border ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {s.shelter_type}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">{s.district || 'District Base'}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(s.capacity_status)}`}>
                {s.capacity_status}
              </span>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Safe Carrying Capacity Utilization</span>
                <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {s.capacity_utilization_pct}%
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.capacity_utilization_pct > 90
                      ? 'bg-rose-500'
                      : s.capacity_utilization_pct > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, s.capacity_utilization_pct)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs opacity-75 pt-0.5">
                <span>Occupants: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{s.current_occupancy}</strong></span>
                <span>Safe Ceiling: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{s.effective_safe_capacity}</strong></span>
                <span className="text-emerald-500 font-bold">Free: {s.available_safe_capacity}</span>
              </div>
            </div>

            {/* Resource Normalized Limits */}
            <div className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Resource Normalized Constraints (People Supported)
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-2xl border ${
                  s.bottleneck_resource === 'water' 
                    ? (isDark ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900 font-semibold') 
                    : (isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                }`}>
                  <span className="opacity-60 text-[10px] block font-bold">WATER (15L)</span>
                  <span className="font-extrabold text-sm">{s.resource_limits?.water_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${
                  s.bottleneck_resource === 'sanitation' 
                    ? (isDark ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900 font-semibold') 
                    : (isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                }`}>
                  <span className="opacity-60 text-[10px] block font-bold">TOILETS (1:20)</span>
                  <span className="font-extrabold text-sm">{s.resource_limits?.sanitation_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${
                  s.bottleneck_resource === 'food' 
                    ? (isDark ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900 font-semibold') 
                    : (isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                }`}>
                  <span className="opacity-60 text-[10px] block font-bold">FOOD (2100k)</span>
                  <span className="font-extrabold text-sm">{s.resource_limits?.food_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${
                  s.bottleneck_resource === 'beds' 
                    ? (isDark ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900 font-semibold') 
                    : (isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                }`}>
                  <span className="opacity-60 text-[10px] block font-bold">BED SPACES</span>
                  <span className="font-extrabold text-sm">{s.resource_limits?.bed_supported_people?.toLocaleString() || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
