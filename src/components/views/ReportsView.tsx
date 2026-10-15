import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Building,
  CheckCircle,
  FileText,
  Printer,
  ShieldCheck,
  Layers,
  Calendar,
  Filter,
  ArrowUpDown,
  Search,
  Code2,
} from 'lucide-react';
import { BuildingData, MonthlyConsumption } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface ReportsViewProps {
  buildings: BuildingData[];
  monthlyData: MonthlyConsumption[];
  onOpenExportReport: () => void;
  onResetData: () => void;
}

type SortField = 'name' | 'buildingName' | 'electricityKwh' | 'waterLitres' | 'paperSheets' | 'wasteKg' | 'reportingStatus';

export const ReportsView: React.FC<ReportsViewProps> = ({
  buildings,
  monthlyData,
  onOpenExportReport,
  onResetData,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'campus' | 'department' | 'carbon'>('campus');
  const [dateFilter, setDateFilter] = useState<'mtd' | 'q3' | 'ytd' | 'all'>('mtd');
  const [departmentCategoryFilter, setDepartmentCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('buildingName');
  const [sortAsc, setSortAsc] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Flatten departments for reporting
  const allDepartments = useMemo(() => {
    return buildings.flatMap((b) =>
      b.departments.map((d) => ({
        ...d,
        buildingName: b.name,
        buildingCode: b.code,
        buildingCategory: b.category,
        grossAreaSqFt: b.grossAreaSqFt,
      }))
    );
  }, [buildings]);

  // Aggregate metrics
  const totals = useMemo(() => {
    let elec = 0;
    let water = 0;
    let paper = 0;
    let waste = 0;
    let reported = 0;

    allDepartments.forEach((d) => {
      if (d.electricityKwh !== null) elec += d.electricityKwh;
      if (d.waterLitres !== null) water += d.waterLitres;
      if (d.paperSheets !== null) paper += d.paperSheets;
      if (d.wasteKg !== null) waste += d.wasteKg;
      if (d.reportingStatus === 'reported') reported++;
    });

    return { elec, water, paper, waste, reported, total: allDepartments.length };
  }, [allDepartments]);

  // Carbon model (Scope 1 boilers: 42.5 MT; Scope 2 electricity: 0.385 kg/kWh; Scope 3 paper/waste: 14.2 MT)
  const scope2CarbonTons = (totals.elec * 0.385) / 1000;
  const scope1NaturalGasTons = 42.5;
  const scope3WastePaperTons = 14.2;

  // Filter and sort departments
  const filteredDepartments = useMemo(() => {
    return allDepartments
      .filter((d) => {
        const matchesCat =
          departmentCategoryFilter === 'all' || d.buildingCategory === departmentCategoryFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          d.name.toLowerCase().includes(q) ||
          d.buildingName.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q);
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [allDepartments, departmentCategoryFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportJSON = () => {
    const reportPayload = {
      institution: 'GreenCampus University',
      reportTitle: 'Departmental Resource & Energy Consumption Ledger',
      reportingCadence: dateFilter.toUpperCase(),
      generatedAt: new Date().toISOString(),
      aggregateTotals: {
        totalElectricityKwh: totals.elec,
        totalWaterLitres: totals.water,
        totalPaperSheets: totals.paper,
        totalWasteKg: totals.waste,
        reportingCompletenessPercent:
          totals.total > 0 ? Math.round((totals.reported / totals.total) * 100) : 100,
      },
      carbonAccounting: {
        scope1NaturalGasMT: scope1NaturalGasTons,
        scope2ElectricityMT: Math.round(scope2CarbonTons * 10) / 10,
        scope3WastePaperMT: scope3WastePaperTons,
        totalCarbonMT: Math.round((scope1NaturalGasTons + scope2CarbonTons + scope3WastePaperTons) * 10) / 10,
      },
      departments: filteredDepartments.map((d) => ({
        buildingName: d.buildingName,
        buildingCode: d.buildingCode,
        buildingCategory: d.buildingCategory,
        departmentName: d.name,
        departmentCode: d.code,
        electricityKwh: d.electricityKwh,
        waterLitres: d.waterLitres,
        paperSheets: d.paperSheets,
        wasteKg: d.wasteKg,
        reportingStatus: d.reportingStatus,
        lastLogDate: d.lastLogDate,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `GreenCampus_Report_${dateFilter}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('JSON report export completed.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Banner with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Internal Resource & Sustainability Reports
          </h2>
          <p className="text-xs text-slate-500">
            Export department logs, institutional carbon accounts, and print-ready compliance audit registers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-2xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print / PDF View</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onOpenExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Date Filter & Scope Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span className="font-semibold text-slate-700">Reporting Cadence:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDateFilter('mtd')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dateFilter === 'mtd' ? 'bg-white text-emerald-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oct 2026 MTD
            </button>
            <button
              onClick={() => setDateFilter('q3')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dateFilter === 'q3' ? 'bg-white text-emerald-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q3 90-Day
            </button>
            <button
              onClick={() => setDateFilter('ytd')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dateFilter === 'ytd' ? 'bg-white text-emerald-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              YTD 2026
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dateFilter === 'all' ? 'bg-white text-emerald-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Recorded
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Completeness: <strong className="text-emerald-800">{totals.reported} of {totals.total}</strong> locations logged ({Math.round((totals.reported / totals.total) * 100)}%)
        </div>
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
            <span>{dateFilter.toUpperCase()} Period</span>
            <span>{selectedFormat === 'campus' ? 'Active View' : 'Select Template →'}</span>
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
            Full ledger of all {totals.total} departments with explicit status for reported vs missing logs.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>{totals.reported} of {totals.total} Complete</span>
            <span>{selectedFormat === 'department' ? 'Active View' : 'Select Template →'}</span>
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
            <span>{selectedFormat === 'carbon' ? 'Active View' : 'Select Template →'}</span>
          </div>
        </div>
      </div>

      {/* Department Comparisons Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department Consumption & Performance Register
            </h3>
            <p className="text-xs text-slate-500">
              Comparative department matrix with sorting and live category filtering
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by facility or department..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* Category Filter */}
            <select
              value={departmentCategoryFilter}
              onChange={(e) => setDepartmentCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden"
            >
              <option value="all">All Facility Types</option>
              <option value="Academic">Academic</option>
              <option value="Residential">Residential</option>
              <option value="Research & Labs">Research & Labs</option>
              <option value="Administrative">Administrative</option>
              <option value="Dining & Hub">Dining & Hub</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left min-w-[720px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('buildingName')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Building</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Department / Location</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('electricityKwh')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Electricity (kWh)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('waterLitres')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Water (Litres)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('paperSheets')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Paper (Sheets)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('wasteKg')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Waste (kg)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reportingStatus')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredDepartments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{d.buildingName}</td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <div>{d.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{d.buildingCategory}</span>
                  </td>
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
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        d.reportingStatus === 'reported'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {d.reportingStatus === 'reported' ? 'Logged' : 'Missing'}
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
