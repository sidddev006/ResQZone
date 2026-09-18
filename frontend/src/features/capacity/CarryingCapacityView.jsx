import React, { useState, useEffect } from 'react';
import { Building2, Droplets, Utensils, Bed, Stethoscope, AlertCircle } from 'lucide-react';
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OVER_CAPACITY': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH_LOAD': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'NORMAL': return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'INACCESSIBLE': return 'bg-stone-200 text-stone-600 border-stone-300';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const totalEffective = shelters.reduce((sum, s) => sum + (s.effective_safe_capacity || 0), 0);
  const totalOccupied = shelters.reduce((sum, s) => sum + (s.current_occupancy || 0), 0);
  const totalAvailable = Math.max(0, totalEffective - totalOccupied);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Shelter Carrying Capacity & Resource Bottlenecks</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Humanitarian Sphere & WHO Constraints: Safe Water (15L/day), Sanitation (1:20), Food Rations & Space
          </p>
        </div>

        {/* Global Summary */}
        <div className="flex items-center space-x-4 bg-stone-50 px-4 py-2 rounded-lg border border-stone-200 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Effective Capacity</span>
            <span className="font-bold text-stone-900 text-sm font-mono">{totalEffective.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-stone-200"></div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Occupied</span>
            <span className="font-bold text-amber-700 text-sm font-mono">{totalOccupied.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-stone-200"></div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Available Safe</span>
            <span className="font-bold text-emerald-700 text-sm font-mono">{totalAvailable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Grid of Shelters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => (
          <div
            key={s.shelter_id}
            className="p-5 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 transition-all space-y-4 shadow-card"
          >
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">{s.name}</h3>
                <span className="text-[11px] font-mono text-stone-400">{s.shelter_id} • {s.shelter_type}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(s.capacity_status)}`}>
                {s.capacity_status}
              </span>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px]">Safe Utilization</span>
                <span className="font-mono font-medium text-stone-900">{s.capacity_utilization_pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.capacity_utilization_pct > 90
                      ? 'bg-rose-500'
                      : s.capacity_utilization_pct > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, s.capacity_utilization_pct)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>Occupancy: {s.current_occupancy}</span>
                <span>Safe Max: {s.effective_safe_capacity}</span>
                <span className="text-emerald-700 font-medium">Available: {s.available_safe_capacity}</span>
              </div>
            </div>

            {/* Resource Normalized Limits */}
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-2">
                Resource Capacities
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`p-2 rounded-lg border ${s.bottleneck_resource === 'water' ? 'bg-amber-50/80 border-amber-200' : 'bg-stone-50 border-stone-100'}`}>
                  <span className="text-stone-400 text-[10px] block">Water</span>
                  <span className="font-mono font-semibold text-stone-800">{s.resource_limits?.water_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-lg border ${s.bottleneck_resource === 'sanitation' ? 'bg-amber-50/80 border-amber-200' : 'bg-stone-50 border-stone-100'}`}>
                  <span className="text-stone-400 text-[10px] block">Toilets</span>
                  <span className="font-mono font-semibold text-stone-800">{s.resource_limits?.sanitation_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-lg border ${s.bottleneck_resource === 'food' ? 'bg-amber-50/80 border-amber-200' : 'bg-stone-50 border-stone-100'}`}>
                  <span className="text-stone-400 text-[10px] block">Meals</span>
                  <span className="font-mono font-semibold text-stone-800">{s.resource_limits?.food_supported_people?.toLocaleString() || '-'}</span>
                </div>
                <div className={`p-2 rounded-lg border ${s.bottleneck_resource === 'beds' ? 'bg-amber-50/80 border-amber-200' : 'bg-stone-50 border-stone-100'}`}>
                  <span className="text-stone-400 text-[10px] block">Beds</span>
                  <span className="font-mono font-semibold text-stone-800">{s.resource_limits?.bed_supported_people?.toLocaleString() || '-'}</span>
                </div>
              </div>
            </div>

            {/* Limiting Bottleneck Pill */}
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs">
              <span className="font-medium text-stone-900 capitalize block">
                Limiting Bottleneck: {s.bottleneck_resource}
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{s.bottleneck_explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
