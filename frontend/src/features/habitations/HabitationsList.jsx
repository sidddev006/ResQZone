import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldAlert, Filter, ChevronRight, MapPin, Sparkles, Mountain, ArrowUpRight } from 'lucide-react';
import { api } from '../../api/client';

export default function HabitationsList({
  onInspectHabitation,
  onLaunchSimulation,
  selectedRegion = 'ALL',
  currentRegionObj
}) {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    loadHabitations();
  }, [selectedRegion]);

  const loadHabitations = async () => {
    try {
      setLoading(true);
      const districtParam = selectedRegion === 'ALL' ? null : (currentRegionObj?.district || selectedRegion);
      const data = await api.getHabitations({ district: districtParam });
      setHabitations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = habitations.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
      h.id.toLowerCase().includes(search.toLowerCase()) ||
      (h.district && h.district.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCategory === 'ALL' || h.risk_category === filterCategory;
    return matchSearch && matchCat;
  });

  const getBadgeClass = (cat) => {
    switch (cat) {
      case 'CRITICAL': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'WARNING': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'WATCH': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default: return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl eleken-card border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400 font-semibold tracking-wide">
            <span>SETTLEMENT VULNERABILITY LEDGER</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA REGISTRY'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monitored Habitations & Risk Assessment</h2>
          <p className="text-xs text-slate-400 mt-1">{habitations.length} Surveyed settlements & mountain wards with displacement indicators</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search settlement or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#131A2B] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-56 font-sans"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#131A2B] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">P1 Critical (Evacuate)</option>
            <option value="WARNING">P2 Warning</option>
            <option value="WATCH">P3 Watch</option>
            <option value="SAFE">P4 Stable</option>
          </select>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="eleken-card border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#131A2B]/80 border-b border-white/[0.06] text-slate-400 font-semibold text-[11px] tracking-wider uppercase">
              <tr>
                <th className="py-4 px-5">Habitation & District</th>
                <th className="py-4 px-4">Hazard Vector</th>
                <th className="py-4 px-4">Population</th>
                <th className="py-4 px-4">Vulnerable Cohort</th>
                <th className="py-4 px-4">Terrain Slope</th>
                <th className="py-4 px-4">Risk Index</th>
                <th className="py-4 px-4">Priority Tier</th>
                <th className="py-4 px-5 text-right">Audit & Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-slate-500">
                    Synchronizing habitation spatial registry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-slate-500">
                    No habitations matching selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white text-sm">{h.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{h.district} • {h.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {h.primary_hazard_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {h.total_population.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-amber-400 font-bold text-sm">{h.vulnerable_population}</span>
                      <span className="text-[10px] text-slate-500 block">
                        ({Math.round((h.vulnerable_population / Math.max(1, h.total_population)) * 100)}% dependent)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="font-medium text-white">{h.slope_degrees}°</span>
                      <span className="text-[10px] text-slate-500 block">{h.elevation_meters}m elev</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{((h.hazard_score || 0.8) * 100).toFixed(0)}%</span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(h.hazard_score || 0.8) * 100}%`,
                              backgroundColor: h.risk_category === 'CRITICAL' ? '#F43F5E' : h.risk_category === 'WARNING' ? '#F59E0B' : '#06B6D4'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getBadgeClass(h.risk_category)}`}>
                        {h.risk_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onInspectHabitation(h)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                      >
                        <span>Evidence</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
