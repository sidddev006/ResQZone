import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldAlert, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';

export default function HabitationsList({ onInspectHabitation, onLaunchSimulation }) {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    loadHabitations();
  }, []);

  const loadHabitations = async () => {
    try {
      setLoading(true);
      const data = await api.getHabitations();
      setHabitations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = habitations.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'ALL' || h.risk_category === filterCategory;
    return matchSearch && matchCat;
  });

  const getBadgeClass = (cat) => {
    switch (cat) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'WARNING': return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
      case 'WATCH': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Vulnerable Habitations Register</h2>
            <p className="text-xs text-slate-400">20 Surveyed Wards & Villages in Chamoli-Joshimath District</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search habitation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-48"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="CRITICAL">Critical (Immediate)</option>
            <option value="WARNING">Warning</option>
            <option value="WATCH">Watch</option>
            <option value="SAFE">Safe</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Habitation</th>
                <th className="py-3.5 px-4">Hazard Type</th>
                <th className="py-3.5 px-4">Population</th>
                <th className="py-3.5 px-4">Vulnerable Cohort</th>
                <th className="py-3.5 px-4">Slope / Elev</th>
                <th className="py-3.5 px-4">Hazard Score</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">Loading habitations...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">No habitations matching criteria.</td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{h.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{h.id} • {h.sub_district}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200">{h.primary_hazard_type}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-white">
                      {h.total_population.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-amber-400 font-semibold">{h.vulnerable_population}</span>
                      <span className="text-[10px] text-slate-400 block">
                        ({Math.round((h.vulnerable_population / h.total_population) * 100)}% dependent)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {h.slope_degrees}° / {h.elevation_meters}m
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {h.hazard_score.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getBadgeClass(h.risk_category)}`}>
                        {h.risk_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onInspectHabitation(h)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Evidence</span>
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
