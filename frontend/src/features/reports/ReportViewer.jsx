import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, RefreshCw, FileCheck, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../../api/client';

export default function ReportViewer() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, []);

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
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-mono">
      {/* Action Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400">
            <span>OFFICIAL BRIEFING</span>
            <span>•</span>
            <span className="text-slate-400">DEOC SITREP COMPILER</span>
          </div>
          <h2 className="text-xl font-bold text-white">Incident & Vulnerability Assessment Report</h2>
          <p className="text-xs text-slate-400 mt-0.5">Formal Briefing Manifest for District Magistrate & State SDMA Review</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={generateReport}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#131A2B] hover:bg-[#1A233A] text-slate-300 hover:text-white text-xs border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REGENERATE</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#131A2B] hover:bg-[#1A233A] text-slate-300 hover:text-white text-xs border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT SITREP</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {report && (
        <div className="p-8 rounded-2xl bg-[#0B0F17]/90 border border-white/10 shadow-2xl space-y-6 text-slate-200 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
          {/* Doc Header */}
          <div className="border-b border-white/10 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold block">
                OFFICIAL INCIDENT OPERATIONAL BRIEFING • DEOC CHAMOLI
              </span>
              <h1 className="text-xl font-bold text-white mt-1">{report.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                District: <strong className="text-slate-200">{report.district}</strong> • State: <strong className="text-slate-200">{report.state}</strong>
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold text-cyan-300 block">{report.report_id}</span>
              <span className="text-slate-500 text-[10px]">{new Date(report.generated_at).toLocaleString()}</span>
              <span className="text-[10px] text-amber-400 block mt-0.5 font-bold">{report.disclaimer}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-[#131A2B] border border-white/10 text-xs leading-relaxed space-y-1">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Executive Operational Summary</h3>
            <p className="text-slate-300 font-sans">{report.executive_summary}</p>
          </div>

          {/* District KPIs */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Metrics Snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase block">Critical Red Zones</span>
                <span className="text-2xl font-extrabold text-rose-400">{report.kpis?.critical_red_zones}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase block">High-Need Vulnerable</span>
                <span className="text-2xl font-extrabold text-white">{report.kpis?.critical_vulnerable_population?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase block">Available Safe Spots</span>
                <span className="text-2xl font-extrabold text-emerald-400">{report.kpis?.available_safe_capacity?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase block">Capacity Utilization</span>
                <span className="text-2xl font-extrabold text-white">{report.kpis?.capacity_utilization_pct}%</span>
              </div>
            </div>
          </div>

          {/* Priority Critical Habitations */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Habitations Requiring Priority Evacuation
            </h3>
            <div className="overflow-x-auto border border-white/10 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131A2B] text-slate-400 font-medium text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">HABITATION</th>
                    <th className="py-2.5 px-3">PRIMARY HAZARD</th>
                    <th className="py-2.5 px-3">RISK SCORE</th>
                    <th className="py-2.5 px-3">SLOPE</th>
                    <th className="py-2.5 px-3">VULNERABLE POPULATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {report.priority_critical_habitations?.map((h) => (
                    <tr key={h.id} className="hover:bg-[#131A2B]/60">
                      <td className="py-2 px-3 font-bold text-white">{h.name}</td>
                      <td className="py-2 px-3">{h.primary_hazard}</td>
                      <td className="py-2 px-3 text-rose-400 font-bold">{h.risk_score}</td>
                      <td className="py-2 px-3">{h.slope_degrees}°</td>
                      <td className="py-2 px-3 text-amber-400 font-bold">{h.vulnerable_population}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shelter Capacity & Bottleneck Table */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Relief Shelter Capacities & Limiting Bottlenecks
            </h3>
            <div className="overflow-x-auto border border-white/10 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131A2B] text-slate-400 font-medium text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">SHELTER NAME</th>
                    <th className="py-2.5 px-3">EFFECTIVE SAFE CAP</th>
                    <th className="py-2.5 px-3">OCCUPANCY</th>
                    <th className="py-2.5 px-3">AVAILABLE SPOTS</th>
                    <th className="py-2.5 px-3">LIMITING RESOURCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {report.shelter_carrying_capacities?.map((s) => (
                    <tr key={s.id} className="hover:bg-[#131A2B]/60">
                      <td className="py-2 px-3 font-bold text-white">{s.name}</td>
                      <td className="py-2 px-3">{s.effective_safe_capacity}</td>
                      <td className="py-2 px-3">{s.current_occupancy}</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">{s.available_capacity}</td>
                      <td className="py-2 px-3 capitalize text-cyan-300 font-bold">{s.bottleneck_resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-off */}
          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
            <div>Incident Commander: <strong className="text-white">{report.author}</strong></div>
            <div>Cryptographic Token: <span className="text-cyan-400 font-mono text-[10px]">RESQZONE-DEOC-CHAMOLI-SECURE</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
