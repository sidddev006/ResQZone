import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, RefreshCw, FileCheck, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../../api/client';

export default function ReportViewer({ selectedRegion = 'ALL', theme = 'light' }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    generateReport();
  }, [selectedRegion]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const data = await api.getDistrictBrief();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-sans">
      {/* Action Header */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-bold tracking-wide">
            <span className="text-sky-600 dark:text-sky-400">OFFICIAL SITREP BRIEFING</span>
            <span className="text-slate-400">•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>DEOC DISASTER REPORT GENERATOR</span>
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Incident & Vulnerability Assessment Report
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Formal Briefing Manifest for District Magistrate & State SDMA Review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={generateReport}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print SITREP</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {report && (
        <div className={`p-8 rounded-3xl border shadow-sm space-y-6 transition-all print:p-0 print:border-none print:shadow-none print:bg-white print:text-black ${
          isDark ? 'bg-[#0F172A] border-white/[0.08] text-slate-200' : 'bg-white border-slate-200/90 text-slate-800'
        }`}>
          {/* Doc Header */}
          <div className={`border-b pb-4 flex justify-between items-start ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold block">
                OFFICIAL INCIDENT BRIEFING • NATIONAL DISASTER GRID
              </span>
              <h1 className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{report.title}</h1>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                District: <strong>{report.district}</strong> • State: <strong>{report.state}</strong>
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold text-sky-600 dark:text-sky-400 block">{report.report_id}</span>
              <span className="opacity-60 text-[10px]">{new Date(report.generated_at).toLocaleString()}</span>
              <span className="text-[10px] text-amber-500 block mt-0.5 font-bold">{report.disclaimer}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <h3 className="font-bold text-xs uppercase tracking-wider opacity-70">Executive Operational Summary</h3>
            <p className="leading-relaxed">{report.executive_summary}</p>
          </div>

          {/* District KPIs */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Metrics Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="opacity-60 text-[10px] uppercase font-bold block">Critical Red Zones</span>
                <span className="text-2xl font-black text-rose-600">{report.kpis?.critical_red_zones}</span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="opacity-60 text-[10px] uppercase font-bold block">High-Need Vulnerable</span>
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {report.kpis?.critical_vulnerable_population?.toLocaleString()}
                </span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="opacity-60 text-[10px] uppercase font-bold block">Available Safe Spots</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {report.kpis?.available_safe_capacity?.toLocaleString()}
                </span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="opacity-60 text-[10px] uppercase font-bold block">Capacity Utilization</span>
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {report.kpis?.capacity_utilization_pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Priority Critical Habitations */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Habitations Requiring Priority Evacuation
            </h3>
            <div className={`overflow-x-auto border rounded-2xl ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-bold text-[10px] uppercase ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <tr>
                    <th className="py-2.5 px-4">HABITATION</th>
                    <th className="py-2.5 px-3">PRIMARY HAZARD</th>
                    <th className="py-2.5 px-3">RISK SCORE</th>
                    <th className="py-2.5 px-3">SLOPE</th>
                    <th className="py-2.5 px-4">VULNERABLE POPULATION</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {report.priority_critical_habitations?.map((h) => (
                    <tr key={h.id} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-4 font-bold">{h.name}</td>
                      <td className="py-2.5 px-3">{h.primary_hazard}</td>
                      <td className="py-2.5 px-3 text-rose-600 font-bold">{h.risk_score}</td>
                      <td className="py-2.5 px-3">{h.slope_degrees}°</td>
                      <td className="py-2.5 px-4 text-amber-600 font-bold">{h.vulnerable_population}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shelter Capacity & Bottleneck Table */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Relief Shelter Capacities & Limiting Bottlenecks
            </h3>
            <div className={`overflow-x-auto border rounded-2xl ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-bold text-[10px] uppercase ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <tr>
                    <th className="py-2.5 px-4">SHELTER NAME</th>
                    <th className="py-2.5 px-3">EFFECTIVE SAFE CAP</th>
                    <th className="py-2.5 px-3">OCCUPANCY</th>
                    <th className="py-2.5 px-3">AVAILABLE SPOTS</th>
                    <th className="py-2.5 px-4">LIMITING RESOURCE</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {report.shelter_carrying_capacities?.map((s) => (
                    <tr key={s.id} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-4 font-bold">{s.name}</td>
                      <td className="py-2.5 px-3">{s.effective_safe_capacity}</td>
                      <td className="py-2.5 px-3">{s.current_occupancy}</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{s.available_capacity}</td>
                      <td className="py-2.5 px-4 capitalize text-sky-600 dark:text-sky-400 font-bold">{s.bottleneck_resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-off */}
          <div className={`pt-4 border-t flex justify-between items-center text-xs opacity-75 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>Incident Commander: <strong>{report.author}</strong></div>
            <div>Cryptographic Token: <span className="text-sky-600 dark:text-sky-400 font-mono text-[10px]">RESQZONE-DEOC-SECURE</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
