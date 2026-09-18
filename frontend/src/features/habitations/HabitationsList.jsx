import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldAlert, Filter, ChevronRight, MapPin, Sparkles } from 'lucide-react';
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
      h.district.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'ALL' || h.risk_category === filterCategory;
    return matchSearch && matchCat;
  });

  const getBadgeClass = (cat) => {
    switch (cat) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-rose/30';
      case 'WARNING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'WATCH': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-mono text-cyan-400">
            <span>SETTLEMENT REGISTRY</span>
            <span>•</span>
            <span className="text-slate-400">{currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA MONITORING'}</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">Habitations & Vulnerability Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">{habitations.length} Monitored Settlements & High-Risk Wards Across Active Sectors</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search settlement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#131A2B] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-52 font-mono"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#131A2B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">P1 Critical (Evacuate)</option>
            <option value="WARNING">P2 Warning</option>
            <option value="WATCH">P3 Watch</option>
            <option value="SAFE">P4 Stable</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B0F17]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#131A2B]/80 border-b border-white/10 text-slate-400 font-medium text-[11px]">
              <tr>
                <th className="py-3.5 px-4">HABITATION</th>
                <th className="py-3.5 px-4">HAZARD VECTOR</th>
                <th className="py-3.5 px-4">CENSUS POP</th>
                <th className="py-3.5 px-4">HIGH-NEED COHORT</th>
                <th className="py-3.5 px-4">SLOPE / ELEV</th>
                <th className="py-3.5 px-4">RISK INDEX</th>
                <th className="py-3.5 px-4">PRIORITY TIER</th>
                <th className="py-3.5 px-4 text-right">AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 font-mono">
                    SYNCHRONIZING HABITATIONS REGISTRY...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 font-mono">
                    No habitations matching selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-[#131A2B]/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-[13px]">{h.name}</div>
                      <div className="text-[10px] text-cyan-400/80">{h.id} • {h.sub_district}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">{h.primary_hazard_type}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {h.total_population.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-amber-400 font-bold">{h.vulnerable_population}</span>
                      <span className="text-[10px] text-slate-500 block">
                        ({Math.round((h.vulnerable_population / h.total_population) * 100)}% dependent)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {h.slope_degrees}° / {h.elevation_meters}m
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-extrabold text-[13px]">{h.hazard_score.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeClass(h.risk_category)}`}>
                        {h.risk_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onInspectHabitation(h)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-medium transition-all border border-cyan-500/30 inline-flex items-center space-x-1 shadow-glow-cyan/20"
                      >
                        <ShieldAlert className="w-3 h-3 text-cyan-400" />
                        <span>Inspect Evidence</span>
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
