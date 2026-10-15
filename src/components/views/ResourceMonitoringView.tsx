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
  Clock,
  Check,
  Shield,
  Layers,
  FileSpreadsheet,
  History,
  Calendar,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import {
  BuildingData,
  ReadingStatus,
  ResourceReading,
  ResourceType,
  UserProfile,
} from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface ResourceMonitoringViewProps {
  buildings: BuildingData[];
  readings: ResourceReading[];
  currentUser: UserProfile;
  onOpenAddReading: () => void;
  onSelectReadingForReview: (reading: ResourceReading) => void;
  onResetData: () => void;
}

export const ResourceMonitoringView: React.FC<ResourceMonitoringViewProps> = ({
  buildings,
  readings,
  currentUser,
  onOpenAddReading,
  onSelectReadingForReview,
  onResetData,
}) => {
  // Primary sub-view toggle
  const [activeSubView, setActiveSubView] = useState<'readings' | 'departments'>('readings');

  // Readings Registry Filters
  const [resourceFilter, setResourceFilter] = useState<'all' | 'electricity' | 'water' | 'paper'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReadingStatus>('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Department Ledger Stream Filter
  const [departmentStream, setDepartmentStream] = useState<ResourceType>('electricity');

  // --- Calculations for Readings Registry ---
  const filteredReadings = readings.filter((r) => {
    const matchesResource = resourceFilter === 'all' || r.resourceType === resourceFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesBuilding = selectedBuildingId === 'all' || r.buildingId === selectedBuildingId;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.buildingName.toLowerCase().includes(q) ||
      r.buildingCode.toLowerCase().includes(q) ||
      r.departmentName.toLowerCase().includes(q) ||
      r.departmentCode.toLowerCase().includes(q) ||
      r.enteredBy.toLowerCase().includes(q) ||
      r.reportingPeriod.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q));

    return matchesResource && matchesStatus && matchesBuilding && matchesSearch;
  });

  const totalReadingsCount = readings.length;
  const pendingCount = readings.filter((r) => r.status === 'Pending Review').length;
  const flaggedCount = readings.filter((r) => r.status === 'Flagged').length;
  const approvedCount = readings.filter((r) => r.status === 'Approved').length;
  const draftCount = readings.filter((r) => r.status === 'Draft').length;

  // --- Department Ledger Helpers ---
  const allDepartments = buildings.flatMap((b) =>
    b.departments.map((d) => ({
      ...d,
      buildingId: b.id,
      buildingName: b.name,
      buildingCode: b.code,
      buildingCategory: b.category,
    }))
  );

  const getStreamMeta = () => {
    switch (departmentStream) {
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

  const filteredDepts = allDepartments.filter((d) => {
    const matchesBuilding = selectedBuildingId === 'all' || d.buildingId === selectedBuildingId;
    const matchesSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBuilding && matchesSearch;
  });

  let deptTotalReported = 0;
  let deptReportedCount = 0;
  let deptMissingCount = 0;

  allDepartments.forEach((d) => {
    const val = meta.getVal(d);
    if (val !== null && val !== undefined) {
      deptTotalReported += val;
      deptReportedCount++;
    } else {
      deptMissingCount++;
    }
  });

  const getStatusBadge = (status: ReadingStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Approved</span>
          </span>
        );
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Flagged</span>
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <span>Draft</span>
          </span>
        );
    }
  };

  const getResourceIcon = (resType: 'electricity' | 'water' | 'paper') => {
    switch (resType) {
      case 'electricity':
        return <Zap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'water':
        return <Droplets className="w-3.5 h-3.5 text-sky-600" />;
      case 'paper':
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Notice Banner with Reset */}
      <DemoNotice onResetData={onResetData} />

      {/* Role-Perspective Advisory Banner */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              Active Role Session: <span className="text-emerald-800">{currentUser.name}</span>{' '}
              <span className="font-mono text-[11px] text-slate-500">({currentUser.role})</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Role switching is a DEMO simulation. Review actions reflect role privileges in preview mode without server authentication.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddReading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Resource Reading</span>
        </button>
      </div>

      {/* Metric Summary Strip for Readings & Data Completeness */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Total Meter Logs
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totalReadingsCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{approvedCount} Approved</span> · <span>{draftCount} Drafts</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Pending Review
          </div>
          <div className="text-2xl font-bold font-mono text-sky-800 mt-1">
            {pendingCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Awaiting facilities review & sign-off
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Flagged for Variance
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800 mt-1">
            {flaggedCount}
          </div>
          <p className="text-[10px] text-rose-700 mt-1">
            Exceeds baseline threshold; unverified
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Data Completeness
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            {Math.round((deptReportedCount / (allDepartments.length || 1)) * 1000) / 10}%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {deptReportedCount} of {allDepartments.length} locations submitted
          </p>
        </div>
      </div>

      {/* Primary Sub-View Tabs: Readings Registry vs Campus Location Ledger */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveSubView('readings')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubView === 'readings'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Resource Readings Registry ({filteredReadings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('departments')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubView === 'departments'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>Campus Location Ledger ({allDepartments.length} Departments)</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUB-VIEW 1: RESOURCE READINGS ENTRY & REVIEW REGISTRY TABLE */}
      {/* ============================================================ */}
      {activeSubView === 'readings' && (
        <div className="bg-white border border-slate-200 rounded-b-xl -mt-6 p-5 shadow-2xs space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Stream Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setResourceFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  resourceFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setResourceFilter('electricity')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  resourceFilter === 'electricity'
                    ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Electricity</span>
              </button>
              <button
                onClick={() => setResourceFilter('water')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  resourceFilter === 'water'
                    ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Droplets className="w-3 h-3 text-sky-600" />
                <span>Water</span>
              </button>
              <button
                onClick={() => setResourceFilter('paper')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  resourceFilter === 'paper'
                    ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3 h-3 text-amber-600" />
                <span>Paper</span>
              </button>
            </div>

            {/* Dropdowns & Search */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Statuses ({readings.length})</option>
                <option value="Approved">Approved ({approvedCount})</option>
                <option value="Pending Review">Pending Review ({pendingCount})</option>
                <option value="Flagged">Flagged ({flaggedCount})</option>
                <option value="Draft">Draft ({draftCount})</option>
              </select>

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

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location, reporter..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-44 sm:w-52 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5">Date & Period</th>
                  <th className="py-2.5 px-3.5">Campus Building & Location</th>
                  <th className="py-2.5 px-3.5">Resource</th>
                  <th className="py-2.5 px-3.5">Original Entered Value</th>
                  <th className="py-2.5 px-3.5">Standard Normalized Value</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Entered By & Updated</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredReadings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No resource readings match your selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReadings.map((reading) => {
                    const hasCorrections = reading.correctionHistory && reading.correctionHistory.length > 0;
                    return (
                      <tr
                        key={reading.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          reading.status === 'Flagged' ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        {/* Date & Period */}
                        <td className="py-3 px-3.5">
                          <div className="font-mono text-slate-900 font-semibold">{reading.date}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {reading.reportingPeriod}
                          </div>
                        </td>

                        {/* Campus Building & Location */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900">{reading.buildingName}</div>
                          <div className="text-slate-600 flex items-center gap-1.5">
                            <span>{reading.departmentName}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({reading.departmentCode})
                            </span>
                          </div>
                        </td>

                        {/* Resource */}
                        <td className="py-3 px-3.5">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 font-medium capitalize text-slate-800">
                            {getResourceIcon(reading.resourceType)}
                            <span>{reading.resourceType}</span>
                          </div>
                        </td>

                        {/* Original Entered Value */}
                        <td className="py-3 px-3.5 font-mono font-medium text-slate-700">
                          <div className="font-bold text-slate-900">
                            {reading.originalValue.toLocaleString()} {reading.originalUnit}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Source: {reading.dataSource}
                          </div>
                        </td>

                        {/* Normalized Value & Standard Unit */}
                        <td className="py-3 px-3.5 font-mono">
                          <div className="font-bold text-emerald-900">
                            {reading.normalizedValue.toLocaleString()} {reading.normalizedUnit}
                          </div>
                          {reading.originalUnit !== reading.normalizedUnit && (
                            <div className="text-[10px] text-slate-400">
                              Normalized from {reading.originalUnit}
                            </div>
                          )}
                        </td>

                        {/* Entry Status */}
                        <td className="py-3 px-3.5">
                          <div className="space-y-1">
                            <div>{getStatusBadge(reading.status)}</div>
                            {reading.status === 'Flagged' && reading.flagReason && (
                              <div
                                className="text-[10px] text-rose-800 max-w-xs truncate cursor-help"
                                title={reading.flagReason}
                              >
                                {reading.flagReason}
                              </div>
                            )}
                            {hasCorrections && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer"
                                onClick={() => onSelectReadingForReview(reading)}
                                title="Click to view traceable adjustments"
                              >
                                <History className="w-2.5 h-2.5 text-amber-700" />
                                <span>{reading.correctionHistory.length} revision(s)</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Entered By & Last Updated */}
                        <td className="py-3 px-3.5">
                          <div className="text-slate-800 font-medium">{reading.enteredBy}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(reading.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            · {new Date(reading.updatedAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectReadingForReview(reading)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg shadow-2xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Review / Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Showing {filteredReadings.length} of {readings.length} entries · All readings maintain original & normalized figures
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Traceable audits supported
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-VIEW 2: CAMPUS LOCATION BREAKDOWN & COMPLETENESS LEDGER */}
      {/* ============================================================ */}
      {activeSubView === 'departments' && (
        <div className="bg-white border border-slate-200 rounded-b-xl -mt-6 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department & Location Ledger ({filteredDepts.length} Locations)
              </h3>
              <p className="text-xs text-slate-500">
                Organized by Building → Department/Facility with explicit missing status
              </p>
            </div>

            {/* Department stream switcher */}
            <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setDepartmentStream('electricity')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  departmentStream === 'electricity'
                    ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Electricity</span>
              </button>
              <button
                onClick={() => setDepartmentStream('water')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  departmentStream === 'water'
                    ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Droplets className="w-3 h-3 text-sky-600" />
                <span>Water</span>
              </button>
              <button
                onClick={() => setDepartmentStream('paper')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  departmentStream === 'paper'
                    ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3 h-3 text-amber-600" />
                <span>Paper</span>
              </button>
              <button
                onClick={() => setDepartmentStream('waste')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  departmentStream === 'waste'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trash2 className="w-3 h-3 text-slate-600" />
                <span>Waste</span>
              </button>
            </div>
          </div>

          {/* Department Ledger Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left min-w-[750px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Building</th>
                  <th className="py-2.5 px-3">Department / Location</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Current Recorded {meta.label}</th>
                  <th className="py-2.5 px-3">Reporting Status</th>
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
      )}
    </div>
  );
};
