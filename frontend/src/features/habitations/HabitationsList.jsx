import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldAlert, Filter, ChevronRight, MapPin, Sparkles, Mountain, ArrowUpRight } from 'lucide-react';
import { api } from '../../api/client';

export default function HabitationsList({
  onInspectHabitation,
  onLaunchSimulation,
  selectedRegion = 'ALL',
  currentRegionObj,
  theme = 'light'
}) {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const isDark = theme === 'dark';

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
    if (isDark) {
      switch (cat) {
        case 'CRITICAL': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
        case 'WARNING': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
        case 'WATCH': return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
        default: return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      }
    } else {
      switch (cat) {
        case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'WARNING': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'WATCH': return 'bg-sky-50 text-sky-700 border-sky-200';
        default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-bold tracking-wide">
            <span className="text-sky-600 dark:text-sky-400">SETTLEMENT VULNERABILITY REGISTER</span>
            <span className="text-slate-400">•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              {currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA MESH'}
            </span>
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Monitored Habitations & Hazard Exposure
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {habitations.length} Surveyed settlements & mountain wards with displacement indicators
          </p>
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
              className={`border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-56 font-sans transition-all ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
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
      <div className={`border rounded-3xl overflow-hidden shadow-sm transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className={`border-b font-bold text-[11px] tracking-wider uppercase ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
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
            <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
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
                  <tr key={h.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3.5 px-5">
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{h.name}</div>
                      <div className={`text-[11px] flex items-center space-x-1.5 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3 text-sky-500" />
                        <span>{h.district} • {h.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {h.primary_hazard_type}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {h.total_population.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-amber-500 font-bold text-sm">{h.vulnerable_population}</span>
                      <span className="text-[10px] opacity-60 block">
                        ({Math.round((h.vulnerable_population / Math.max(1, h.total_population)) * 100)}% dependent)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{h.slope_degrees}°</span>
                      <span className="text-[10px] opacity-60 block">{h.elevation_meters}m elev</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {((h.hazard_score || 0.8) * 100).toFixed(0)}%
                        </span>
                        <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(h.hazard_score || 0.8) * 100}%`,
                              backgroundColor: h.risk_category === 'CRITICAL' ? '#EF4444' : h.risk_category === 'WARNING' ? '#F59E0B' : '#0EA5E9'
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
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all inline-flex items-center space-x-1 ${
                          isDark 
                            ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/30' 
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 shadow-xs'
                        }`}
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
