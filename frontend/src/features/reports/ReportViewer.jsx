import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, RefreshCw } from 'lucide-react';
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
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Action Header */}
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Incident & Vulnerability Assessment Report</h2>
          <p className="text-xs text-stone-500 mt-0.5">Formal DEOC Incident Brief for District Magistrate & State SDMA Review</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={generateReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {report && (
        <div className="p-8 rounded-xl bg-white border border-stone-200/80 shadow-card space-y-6 text-stone-800 print:p-0 print:border-none print:shadow-none">
          {/* Doc Header */}
          <div className="border-b border-stone-200 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold block">
                Official Incident Operational Brief
              </span>
              <h1 className="text-lg font-bold text-stone-900 mt-1">{report.title}</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                District: <strong className="text-stone-800">{report.district}</strong> • State: <strong className="text-stone-800">{report.state}</strong>
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-mono font-medium text-stone-700 block">{report.report_id}</span>
              <span className="text-stone-400 text-[11px]">{new Date(report.generated_at).toLocaleString()}</span>
              <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">{report.disclaimer}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80 text-xs leading-relaxed space-y-1">
            <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">Executive Summary</h3>
            <p className="text-stone-700">{report.executive_summary}</p>
          </div>

          {/* District KPIs */}
          <div>
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">Metrics Snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 text-[10px] block">Critical Red Zones</span>
                <span className="text-base font-bold text-rose-600 font-mono">{report.kpis?.critical_red_zones}</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 text-[10px] block">High-Need Vulnerable</span>
                <span className="text-base font-bold text-stone-900 font-mono">{report.kpis?.critical_vulnerable_population?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 text-[10px] block">Available Safe Spots</span>
                <span className="text-base font-bold text-emerald-700 font-mono">{report.kpis?.available_safe_capacity?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 text-[10px] block">Capacity Utilization</span>
                <span className="text-base font-bold text-stone-900 font-mono">{report.kpis?.capacity_utilization_pct}%</span>
              </div>
            </div>
          </div>

          {/* Priority Critical Habitations */}
          <div>
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
              Habitations Requiring Priority Evacuation
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-medium text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Habitation</th>
                    <th className="py-2.5 px-3">Primary Hazard</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Slope</th>
                    <th className="py-2.5 px-3">Vulnerable Population</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {report.priority_critical_habitations?.map((h) => (
                    <tr key={h.id}>
                      <td className="py-2 px-3 font-medium text-stone-900">{h.name}</td>
                      <td className="py-2 px-3">{h.primary_hazard}</td>
                      <td className="py-2 px-3 font-mono text-rose-600 font-medium">{h.risk_score}</td>
                      <td className="py-2 px-3 font-mono">{h.slope_degrees}°</td>
                      <td className="py-2 px-3 font-mono text-amber-800">{h.vulnerable_population}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shelter Capacity & Bottleneck Table */}
          <div>
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
              Relief Shelter Capacities & Limiting Bottlenecks
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-medium text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Shelter Name</th>
                    <th className="py-2.5 px-3">Effective Safe Cap</th>
                    <th className="py-2.5 px-3">Occupancy</th>
                    <th className="py-2.5 px-3">Available Spots</th>
                    <th className="py-2.5 px-3">Bottleneck</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {report.shelter_carrying_capacities?.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 px-3 font-medium text-stone-900">{s.name}</td>
                      <td className="py-2 px-3 font-mono">{s.effective_safe_capacity}</td>
                      <td className="py-2 px-3 font-mono">{s.current_occupancy}</td>
                      <td className="py-2 px-3 font-mono text-emerald-700 font-medium">{s.available_capacity}</td>
                      <td className="py-2 px-3 capitalize text-stone-800 font-medium">{s.bottleneck_resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-off */}
          <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
            <div>Reporting Officer: <strong className="text-stone-800">{report.author}</strong></div>
            <div>Digital Validation: <span className="font-mono text-[10px] text-stone-500">RESQZONE-DEOC-CHAMOLI</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
