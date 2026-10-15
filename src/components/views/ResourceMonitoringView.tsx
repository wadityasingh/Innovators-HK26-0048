import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  FileText,
  Trash2,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { BuildingData, ResourceType } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface ResourceMonitoringViewProps {
  buildings: BuildingData[];
  onOpenLogMeter: () => void;
  onResetData: () => void;
}

export const ResourceMonitoringView: React.FC<ResourceMonitoringViewProps> = ({
  buildings,
  onOpenLogMeter,
  onResetData,
}) => {
  const [selectedStream, setSelectedStream] = useState<ResourceType>('electricity');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');

  const getStreamMeta = () => {
    switch (selectedStream) {
      case 'electricity':
        return {
          label: 'Electricity',
          unit: 'kWh',
          color: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          icon: Zap,
          getVal: (d: any) => d.electricityKwh,
          format: (v: number) => `${v.toLocaleString()} kWh`,
        };
      case 'water':
        return {
          label: 'Water',
          unit: 'Litres',
          color: 'text-sky-700',
          badgeBg: 'bg-sky-50 text-sky-900 border-sky-200',
          icon: Droplets,
          getVal: (d: any) => d.waterLitres,
          format: (v: number) => `${v.toLocaleString()} L (${(v / 1000).toLocaleString()} kL)`,
        };
      case 'paper':
        return {
          label: 'Paper',
          unit: 'Sheets',
          color: 'text-amber-700',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
          icon: FileText,
          getVal: (d: any) => d.paperSheets,
          format: (v: number) => `${v.toLocaleString()} sheets`,
        };
      case 'waste':
        return {
          label: 'Solid Waste',
          unit: 'kg',
          color: 'text-slate-700',
          badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
          icon: Trash2,
          getVal: (d: any) => d.wasteKg,
          format: (v: number) => `${v.toLocaleString()} kg`,
        };
    }
  };

  const meta = getStreamMeta();
  const StreamIcon = meta.icon;

  // Flatten all departments with their parent building context
  const allDepartments = buildings.flatMap((b) =>
    b.departments.map((d) => ({
      ...d,
      buildingId: b.id,
      buildingName: b.name,
      buildingCode: b.code,
      buildingCategory: b.category,
    }))
  );

  const filteredDepts = allDepartments.filter((d) => {
    const matchesBuilding =
      selectedBuildingId === 'all' || d.buildingId === selectedBuildingId;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBuilding && matchesSearch;
  });

  // Calculate stats for selected stream
  let totalReported = 0;
  let reportedCount = 0;
  let missingCount = 0;

  allDepartments.forEach((d) => {
    const val = meta.getVal(d);
    if (val !== null && val !== undefined) {
      totalReported += val;
      reportedCount++;
    } else {
      missingCount++;
    }
  });

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Stream Switcher & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        {/* Stream tabs */}
        <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setSelectedStream('electricity')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              selectedStream === 'electricity'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Electricity (kWh)</span>
          </button>
          <button
            onClick={() => setSelectedStream('water')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              selectedStream === 'water'
                ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>Water (Litres)</span>
          </button>
          <button
            onClick={() => setSelectedStream('paper')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              selectedStream === 'paper'
                ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Paper (Sheets)</span>
          </button>
          <button
            onClick={() => setSelectedStream('waste')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              selectedStream === 'waste'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Waste (kg)</span>
          </button>
        </div>

        <button
          onClick={onOpenLogMeter}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Department Reading</span>
        </button>
      </div>

      {/* Stream Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Total Reported {meta.label}</span>
            <StreamIcon className={`w-4 h-4 ${meta.color}`} />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {meta.format(totalReported)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sum of {reportedCount} reported department logs (Oct 2026 MTD)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Data Completeness Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
            {Math.round((reportedCount / allDepartments.length) * 1000) / 10}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {reportedCount} of {allDepartments.length} locations submitted readings
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Unreported / Missing Logs</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-900 tabular-nums">
            {missingCount} Location
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Excluded from totals; not treated as zero
          </p>
        </div>
      </div>

      {/* Campus → Buildings → Departments/Locations Hierarchy Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department & Location Readings Ledger ({filteredDepts.length} Locations)
            </h3>
            <p className="text-xs text-slate-500">
              Organized by Building → Department/Facility with explicit missing status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search department or building..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48 sm:w-56 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* Building filter */}
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Buildings ({buildings.length})</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Building</th>
                <th className="py-2.5 px-3">Department / Location</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Recorded {meta.label}</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Log Date</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredDepts.map((d) => {
                const val = meta.getVal(d);
                const isMissing = val === null || val === undefined;

                return (
                  <tr
                    key={d.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isMissing ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{d.buildingName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{d.buildingCode}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{d.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{d.code}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{d.type}</td>
                    <td className="py-3 px-3 font-mono font-semibold tabular-nums">
                      {isMissing ? (
                        <span className="text-amber-800 font-normal italic">
                          Missing Reading
                        </span>
                      ) : (
                        <span className="text-slate-900">{meta.format(val)}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isMissing ? (
                        <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Unreported
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Logged
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                      {d.lastLogDate}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                      {d.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
