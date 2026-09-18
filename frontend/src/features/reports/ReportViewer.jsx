import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
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
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Incident & Relocation Assessment Report</h2>
            <p className="text-xs text-slate-400">Formal DEOC Brief for District Magistrate & State SDMA Review</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={generateReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Fresh Brief</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {report && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-slate-300 print:bg-white print:text-black print:p-0 print:border-none">
          {/* Doc Header */}
          <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                Official Incident Operational Brief
              </span>
              <h1 className="text-xl font-black text-white mt-1 print:text-black">{report.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                District: <strong className="text-white">{report.district}</strong> • State: <strong className="text-white">{report.state}</strong>
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-mono font-bold text-indigo-300 block">{report.report_id}</span>
              <span className="text-slate-400 text-[11px]">{new Date(report.generated_at).toLocaleString()}</span>
              <span className="text-[10px] text-amber-400 block mt-1 font-semibold">{report.disclaimer}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed space-y-1">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">Executive Brief</h3>
            <p>{report.executive_summary}</p>
          </div>

          {/* District KPIs */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Key Metrics Snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Critical Red Zones</span>
                <span className="text-lg font-bold text-red-400">{report.kpis?.critical_red_zones}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">High-Need Vulnerable</span>
                <span className="text-lg font-bold text-amber-400">{report.kpis?.critical_vulnerable_population?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Safe Shelter Spots</span>
                <span className="text-lg font-bold text-emerald-400">{report.kpis?.available_safe_capacity?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Capacity Utilization</span>
                <span className="text-lg font-bold text-white">{report.kpis?.capacity_utilization_pct}%</span>
              </div>
            </div>
          </div>

          {/* Priority Critical Habitations */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              High-Risk Habitations Requiring Evacuation
            </h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Habitation</th>
                    <th className="py-2.5 px-3">Primary Hazard</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Slope</th>
                    <th className="py-2.5 px-3">Vulnerable Population</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {report.priority_critical_habitations?.map((h) => (
                    <tr key={h.id}>
                      <td className="py-2.5 px-3 font-semibold text-white">{h.name}</td>
                      <td className="py-2.5 px-3">{h.primary_hazard}</td>
                      <td className="py-2.5 px-3 font-mono text-red-400 font-bold">{h.risk_score}</td>
                      <td className="py-2.5 px-3 font-mono">{h.slope_degrees}°</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400">{h.vulnerable_population}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shelter Capacity & Bottleneck Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Relief Shelter Capacity & Bottlenecks
            </h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Shelter Name</th>
                    <th className="py-2.5 px-3">Effective Safe Cap</th>
                    <th className="py-2.5 px-3">Current Occupancy</th>
                    <th className="py-2.5 px-3">Available Spots</th>
                    <th className="py-2.5 px-3">Limiting Bottleneck</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {report.shelter_carrying_capacities?.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                      <td className="py-2.5 px-3 font-mono">{s.effective_safe_capacity}</td>
                      <td className="py-2.5 px-3 font-mono">{s.current_occupancy}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{s.available_capacity}</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-300 uppercase">{s.bottleneck_resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-off */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <div>Officer Author: <strong className="text-slate-200">{report.author}</strong></div>
            <div>Automated Signature: <span className="font-mono text-[10px] text-emerald-400">RESQZONE-VALIDATED-CHAMOLI</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
