import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Printer, CheckCircle } from 'lucide-react';
import { BuildingData, MonthlyConsumption } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingData[];
  monthlyData: MonthlyConsumption[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  buildings,
  monthlyData,
}) => {
  const [reportType, setReportType] = useState<'aashe' | 'ghg' | 'executive'>('aashe');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'aashe') {
      csvContent += 'AASHE STARS v2.2 Campus Sustainability Report (Simulation)\r\n';
      csvContent += 'Building Name,Building Code,Category,Gross SqFt,Occupancy,Electricity (kWh),Water (kL),Paper (Reams),Waste (kg),Submeter Status\r\n';
      buildings.forEach((b) => {
        csvContent += `"${b.name}","${b.code}","${b.category}",${b.grossAreaSqFt},${b.occupancy},${b.electricityKwh},${b.waterKL},${b.paperReams},${b.wasteKg},"${b.meterStatus}"\r\n`;
      });
    } else if (reportType === 'ghg') {
      csvContent += 'GHG Protocol Campus Carbon Accounting Summary (Scopes 1-3 Simulation)\r\n';
      csvContent += 'Month,Electricity (kWh),Calculated Scope 2 MT CO2e,Water (kL),Calculated Water CO2e,Paper (Reams),Waste Generated (Tons),Diverted (Tons)\r\n';
      monthlyData.forEach((m) => {
        // approx 0.385 kg CO2e per kWh for regional grid
        const scope2 = ((m.electricityKwh * 0.385) / 1000).toFixed(2);
        const waterCo2 = ((m.waterKL * 0.298) / 1000).toFixed(2);
        csvContent += `"${m.month}",${m.electricityKwh},${scope2},${m.waterKL},${waterCo2},${m.paperReams},${m.wasteTons},${m.divertedTons}\r\n`;
      });
    } else {
      csvContent += 'Executive Monthly Campus Sustainability Brief\r\n';
      csvContent += 'Metric,Total YTD Value,Unit,Target Milestone,Status\r\n';
      csvContent += '"Grid Electricity",3757500,"kWh","4000000 kWh Ceiling","Compliant"\r\n';
      csvContent += '"Potable Water",85640,"kL","90000 kL Ceiling","Compliant"\r\n';
      csvContent += '"Waste Landfill Diversion",74.3,"%","90.0% Target","Needs Intervention"\r\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GreenCampus_${reportType}_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Export Institutional Sustainability Audit</h3>
            <p className="text-xs text-slate-500">Generate compliance dossiers for AASHE STARS or ESG reporting</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Framework / Audit Protocol
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReportType('aashe')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === 'aashe'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">AASHE STARS v2.2</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Building-by-building OP-1 Energy & OP-22 Water credit metrics
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('ghg')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === 'ghg'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">GHG Protocol (Scopes 1-3)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Scope 2 purchased grid power and Scope 3 solid waste carbon model
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('executive')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === 'executive'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">Executive Board Brief</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  High-level summary of targets, budget impacts & audits for trustees
                </div>
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
              <span>Audit Export Preview (First 5 Rows)</span>
              <span className="text-[11px] font-mono text-slate-500">Format: CSV / UTF-8</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-mono">
                  <tr>
                    <th className="py-2 px-3">Facility</th>
                    <th className="py-2 px-3">Gross Area</th>
                    <th className="py-2 px-3">Electricity (kWh)</th>
                    <th className="py-2 px-3">Water (kL)</th>
                    <th className="py-2 px-3">Waste (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {buildings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-800">{b.name}</td>
                      <td className="py-2 px-3 font-mono">{b.grossAreaSqFt.toLocaleString()} sqft</td>
                      <td className="py-2 px-3 font-mono font-semibold text-emerald-700">
                        {b.electricityKwh.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono text-sky-700">{b.waterKL.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{b.wasteKg.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {downloaded && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-emerald-900 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>CSV file successfully downloaded to your browser.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200/60 rounded-lg border border-slate-300"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
