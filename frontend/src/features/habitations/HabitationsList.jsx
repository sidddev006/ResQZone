import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldAlert, Filter, ChevronRight } from 'lucide-react';
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
      case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'WARNING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WATCH': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Habitations & Vulnerability Register</h2>
          <p className="text-xs text-stone-500 mt-0.5">20 Surveyed Wards & Villages in Chamoli-Joshimath District</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search habitation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 w-48 shadow-xs"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none shadow-xs"
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
      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-medium text-[11px]">
              <tr>
                <th className="py-3 px-4">Habitation</th>
                <th className="py-3 px-4">Hazard Type</th>
                <th className="py-3 px-4">Population</th>
                <th className="py-3 px-4">Vulnerable Cohort</th>
                <th className="py-3 px-4">Slope / Elev</th>
                <th className="py-3 px-4">Hazard Score</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-400">Loading habitations...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-400">No habitations matching criteria.</td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{h.name}</div>
                      <div className="text-[11px] font-mono text-stone-400">{h.id} • {h.sub_district}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-stone-700">{h.primary_hazard_type}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-stone-900">
                      {h.total_population.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-amber-800 font-medium">{h.vulnerable_population}</span>
                      <span className="text-[10px] text-stone-400 block">
                        ({Math.round((h.vulnerable_population / h.total_population) * 100)}% dependent)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">
                      {h.slope_degrees}° / {h.elevation_meters}m
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {h.hazard_score.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getBadgeClass(h.risk_category)}`}>
                        {h.risk_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onInspectHabitation(h)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium transition-colors border border-stone-200 inline-flex items-center space-x-1"
                      >
                        <ShieldAlert className="w-3 h-3 text-stone-500" />
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
