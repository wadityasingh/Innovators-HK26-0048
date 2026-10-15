import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Building,
  CheckCircle,
  FileText,
  Printer,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { BuildingData, MonthlyConsumption } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface ReportsViewProps {
  buildings: BuildingData[];
  monthlyData: MonthlyConsumption[];
  onOpenExportReport: () => void;
  onResetData: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  buildings,
  monthlyData,
  onOpenExportReport,
  onResetData,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'campus' | 'department' | 'carbon'>('campus');

  // Flatten departments for reporting
  const allDepartments = buildings.flatMap((b) =>
    b.departments.map((d) => ({
      ...d,
      buildingName: b.name,
      buildingCode: b.code,
      buildingCategory: b.category,
      grossAreaSqFt: b.grossAreaSqFt,
    }))
  );

  let totalElectricity = 0;
  let totalWaterL = 0;
  let totalPaperSheets = 0;
  let totalWasteKg = 0;
  let reportedCount = 0;

  allDepartments.forEach((d) => {
    if (d.electricityKwh !== null) totalElectricity += d.electricityKwh;
    if (d.waterLitres !== null) totalWaterL += d.waterLitres;
    if (d.paperSheets !== null) totalPaperSheets += d.paperSheets;
    if (d.wasteKg !== null) totalWasteKg += d.wasteKg;
    if (d.reportingStatus === 'reported') reportedCount++;
  });

  // Carbon model (Scope 1 boilers: estimated 42.5 t; Scope 2 grid electricity: 0.385 kg/kWh; Scope 3 paper/waste: ~14.2 t)
  const scope2CarbonTons = (totalElectricity * 0.385) / 1000;
  const scope1NaturalGasTons = 42.5;
  const scope3WastePaperTons = 14.2;

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Internal Resource & Sustainability Reports
          </h2>
          <p className="text-xs text-slate-500">
            Export verified department logs and internal campus resource summaries
          </p>
        </div>

        <button
          onClick={onOpenExportReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Report Data (CSV)</span>
        </button>
      </div>

      {/* GHG Protocol Scopes Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scope 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Scope 1 (Direct Campus Fuel)</span>
            <span className="text-[10px] text-slate-400 font-mono">Boilers & Fleet</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {scope1NaturalGasTons.toFixed(1)} MT CO₂e
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Central heating natural gas & campus utility service vehicles
          </p>
        </div>

        {/* Scope 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Scope 2 (Purchased Electricity)</span>
            <span className="text-[10px] text-emerald-700 font-mono">Grid Power</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-900 tabular-nums">
            {scope2CarbonTons.toFixed(1)} MT CO₂e
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated at regional grid emissions factor of 0.385 kg CO₂e / kWh
          </p>
        </div>

        {/* Scope 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Scope 3 (Materials & Waste)</span>
            <span className="text-[10px] text-slate-400 font-mono">Paper & Landfill</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {scope3WastePaperTons.toFixed(1)} MT CO₂e
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Municipal solid waste landfill decay & virgin paper life cycle
          </p>
        </div>
      </div>

      {/* Report Templates Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedFormat('campus')}
          className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
            selectedFormat === 'campus'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Campus Summary Brief</span>
            <FileText className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Executive report covering total electricity (kWh), water (L), paper (sheets), and waste diversion (kg).
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>Oct 2026 MTD Cadence</span>
            <span>Select Template →</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedFormat('department')}
          className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
            selectedFormat === 'department'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Department Consumption Register</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Full ledger of all 14 departments and facilities with explicit status for reported vs missing logs.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>{reportedCount} of {allDepartments.length} Complete</span>
            <span>Select Template →</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedFormat('carbon')}
          className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
            selectedFormat === 'carbon'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Estimated GHG Accounting Model</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Scopes 1, 2, and 3 carbon calculations based on university utility conversion coefficients.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>Total: {(scope1NaturalGasTons + scope2CarbonTons + scope3WastePaperTons).toFixed(1)} MT CO₂e</span>
            <span>Select Template →</span>
          </div>
        </div>
      </div>

      {/* Data Preview Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {selectedFormat === 'campus'
                ? 'Campus Monthly Totals Summary'
                : selectedFormat === 'department'
                ? 'Departmental Consumption Register'
                : 'Greenhouse Gas Accounting Summary Table'}
            </h3>
            <p className="text-xs text-slate-500">
              Preview of data table ready for CSV export
            </p>
          </div>
          <button
            onClick={onOpenExportReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Data</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Building</th>
                <th className="py-2.5 px-3">Department / Location</th>
                <th className="py-2.5 px-3">Electricity (kWh)</th>
                <th className="py-2.5 px-3">Water (Litres)</th>
                <th className="py-2.5 px-3">Paper (Sheets)</th>
                <th className="py-2.5 px-3">Waste (kg)</th>
                <th className="py-2.5 px-3">Report Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {allDepartments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{d.buildingName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{d.name}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800 tabular-nums">
                    {d.electricityKwh === null ? (
                      <span className="text-amber-800 font-normal italic">Missing</span>
                    ) : (
                      d.electricityKwh.toLocaleString()
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-sky-800 tabular-nums">
                    {d.waterLitres === null ? (
                      <span className="text-amber-800 font-normal italic">Missing</span>
                    ) : (
                      `${(d.waterLitres / 1000).toLocaleString()} kL`
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-800 tabular-nums">
                    {d.paperSheets === null ? (
                      <span className="text-amber-800 font-normal italic">Missing</span>
                    ) : (
                      d.paperSheets.toLocaleString()
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800 tabular-nums">
                    {d.wasteKg === null ? (
                      <span className="text-amber-800 font-normal italic">Missing</span>
                    ) : (
                      d.wasteKg.toLocaleString()
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        d.reportingStatus === 'reported' ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {d.reportingStatus === 'reported' ? 'Logged' : 'Unreported'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
