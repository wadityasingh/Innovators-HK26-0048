import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Building,
  CheckCircle,
  FileText,
  Printer,
  ShieldCheck,
  ChevronRight,
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
  const [selectedFormat, setSelectedFormat] = useState<'AASHE' | 'GHG' | 'ESG'>('AASHE');

  // Carbon math approximations
  const totalElectricityKwh = buildings.reduce((sum, b) => sum + b.electricityKwh, 0);
  const scope2CarbonTons = (totalElectricityKwh * 0.385) / 1000;
  const scope1NaturalGasTons = 42.5; // Central heating boilers simulation
  const scope3WastePaperTons = 18.2;

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Institutional Audit Dossiers & ESG Disclosures
          </h2>
          <p className="text-xs text-slate-500">
            Standardized templates aligned with AASHE STARS v2.2, GHG Protocol Corporate Standard, and Second Nature
          </p>
        </div>

        <button
          onClick={onOpenExportReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Dossier (CSV / PDF)</span>
        </button>
      </div>

      {/* GHG Protocol Scopes Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scope 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Scope 1 (Direct Emissions)</span>
            <span className="text-[10px] text-slate-400 font-mono">Boilers & Fleet</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {scope1NaturalGasTons.toFixed(1)} MT CO₂e
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Central natural gas steam plant & campus maintenance utility vans
          </p>
        </div>

        {/* Scope 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Scope 2 (Market Grid Electricity)</span>
            <span className="text-[10px] text-emerald-700 font-mono">Location-Based</span>
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
            <span>Scope 3 (Value Chain / Materials)</span>
            <span className="text-[10px] text-slate-400 font-mono">Paper & Waste</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {scope3WastePaperTons.toFixed(1)} MT CO₂e
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Solid waste landfill decay emissions and virgin pulp paper life cycle
          </p>
        </div>
      </div>

      {/* Available Formal Audit Frameworks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedFormat('AASHE')}
          className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
            selectedFormat === 'AASHE'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">AASHE STARS v2.2 Report</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Higher Education Association sustainability rating system. Covers OP-1 Building Energy and OP-22 Water Consumption.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>Score: Gold (78.4 pts)</span>
            <span>View Template →</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedFormat('GHG')}
          className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
            selectedFormat === 'GHG'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">GHG Protocol Scope 1-3</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Global carbon accounting framework. Formatted for institutional carbon disclosure project and trustee reviews.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>Total: 317.8 MT CO₂e</span>
            <span>View Template →</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedFormat('ESG')}
          className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
            selectedFormat === 'ESG'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Executive Board Brief</span>
            <FileText className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Board-ready one-pager detailing capital payback, avoided utility costs, and target milestones for 2026-2027.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>Quarterly Cadence</span>
            <span>View Template →</span>
          </div>
        </div>
      </div>

      {/* Audit Data Preview Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {selectedFormat === 'AASHE'
                ? 'AASHE STARS Operational Data Table (May – Oct 2026)'
                : selectedFormat === 'GHG'
                ? 'Greenhouse Gas Accounting Summary Table'
                : 'Executive Sustainability Key Indicators'}
            </h3>
            <p className="text-xs text-slate-500">
              Verified physical walkthrough and automated digital sub-meter logs
            </p>
          </div>
          <button
            onClick={onOpenExportReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Formatted CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Gross Area</th>
                <th className="py-2.5 px-3">Electricity (kWh)</th>
                <th className="py-2.5 px-3">Water (kL)</th>
                <th className="py-2.5 px-3">Paper (Reams)</th>
                <th className="py-2.5 px-3">Waste (kg)</th>
                <th className="py-2.5 px-3">Audit Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{b.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{b.category}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {b.grossAreaSqFt.toLocaleString()} sqft
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">
                    {b.electricityKwh.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-sky-800">{b.waterKL.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-800">{b.paperReams.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-800">{b.wasteKg.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        b.meterStatus === 'online'
                          ? 'text-emerald-700'
                          : b.meterStatus === 'intermittent'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {b.meterStatus === 'online'
                        ? 'IoT Submetered'
                        : b.meterStatus === 'intermittent'
                        ? 'Estimated Interp.'
                        : 'Manual Walk Log'}
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
