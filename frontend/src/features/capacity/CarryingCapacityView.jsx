import React, { useState, useEffect } from 'react';
import { Building2, Droplets, Utensils, Bed, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

export default function CarryingCapacityView() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShelters();
  }, []);

  const loadShelters = async () => {
    try {
      setLoading(true);
      const data = await api.getSheltersCapacity();
      setShelters(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OVER_CAPACITY': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH_LOAD': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'NORMAL': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'INACCESSIBLE': return 'bg-slate-700/50 text-slate-400 border-slate-600';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getBottleneckIcon = (resource) => {
    switch (resource) {
      case 'water': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'food': return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'medical': return <Stethoscope className="w-4 h-4 text-red-400" />;
      default: return <Bed className="w-4 h-4 text-emerald-400" />;
    }
  };

  const totalEffective = shelters.reduce((sum, s) => sum + (s.effective_safe_capacity || 0), 0);
  const totalOccupied = shelters.reduce((sum, s) => sum + (s.current_occupancy || 0), 0);
  const totalAvailable = Math.max(0, totalEffective - totalOccupied);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Carrying Capacity & Bottleneck Assessment</h2>
            <p className="text-xs text-slate-400">
              Multi-Resource Humanitarian Constraints (Water, Sanitation, Food, Beds, Medical)
            </p>
          </div>
        </div>

        {/* Global Summary */}
        <div className="flex items-center space-x-4 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Effective Capacity</span>
            <span className="font-black text-white text-sm">{totalEffective.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Occupied</span>
            <span className="font-black text-amber-400 text-sm">{totalOccupied.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Available Safe</span>
            <span className="font-black text-emerald-400 text-sm">{totalAvailable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Grid of Shelters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => (
          <div
            key={s.shelter_id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
          >
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-sm">{s.name}</h3>
                <span className="text-[11px] font-mono text-slate-400">{s.shelter_id} • {s.shelter_type}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(s.capacity_status)}`}>
                {s.capacity_status}
              </span>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Capacity Utilization</span>
                <span className="font-mono font-bold text-white">{s.capacity_utilization_pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.capacity_utilization_pct > 90
                      ? 'bg-red-500'
                      : s.capacity_utilization_pct > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, s.capacity_utilization_pct)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Occupancy: {s.current_occupancy}</span>
                <span>Safe Max: {s.effective_safe_capacity}</span>
                <span className="text-emerald-400 font-semibold">Available: {s.available_safe_capacity}</span>
              </div>
            </div>

            {/* Resource Normalized Limits */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Resource Breakdown (Sphere & WHO Standards)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`p-2 rounded-lg ${s.bottleneck_resource === 'water' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-slate-950/40'}`}>
                  <span className="text-slate-400 text-[10px] block">Water Limit</span>
                  <span className="font-mono font-bold text-white">{s.resource_limits?.water_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-lg ${s.bottleneck_resource === 'sanitation' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-950/40'}`}>
                  <span className="text-slate-400 text-[10px] block">Toilets Limit</span>
                  <span className="font-mono font-bold text-white">{s.resource_limits?.sanitation_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-lg ${s.bottleneck_resource === 'food' ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-slate-950/40'}`}>
                  <span className="text-slate-400 text-[10px] block">Food Meals</span>
                  <span className="font-mono font-bold text-white">{s.resource_limits?.food_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-lg ${s.bottleneck_resource === 'beds' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-950/40'}`}>
                  <span className="text-slate-400 text-[10px] block">Safe Beds</span>
                  <span className="font-mono font-bold text-white">{s.resource_limits?.bed_supported_people?.toLocaleString() || '-'}</span>
                </div>
              </div>
            </div>

            {/* Limiting Bottleneck Highlight */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20 flex items-start space-x-2 text-xs">
              <div className="mt-0.5">{getBottleneckIcon(s.bottleneck_resource)}</div>
              <div>
                <span className="font-bold text-amber-300 capitalize">
                  Bottleneck Resource: {s.bottleneck_resource}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.bottleneck_explanation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
