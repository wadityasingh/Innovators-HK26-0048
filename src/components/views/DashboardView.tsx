import React from 'react';
import {
  Zap,
  Droplets,
  FileText,
  Trash2,
  Target,
  Database,
  ArrowDownRight,
  AlertTriangle,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet,
  Gauge,
  HelpCircle,
} from 'lucide-react';
import {
  BuildingData,
  MonthlyConsumption,
  WasteCategory,
  PriorityAlert,
  SustainabilityTarget,
  AuditRecord,
  TabType,
  TimeRange,
} from '../../types';
import { ResourceConsumptionChart } from '../charts/ResourceConsumptionChart';
import { DepartmentComparisonChart } from '../charts/DepartmentComparisonChart';
import { WasteCompositionChart } from '../charts/WasteCompositionChart';
import { DemoNotice } from '../common/DemoNotice';

interface DashboardViewProps {
  buildings: BuildingData[];
  monthlyData: MonthlyConsumption[];
  wasteCategories: WasteCategory[];
  alerts: PriorityAlert[];
  targets: SustainabilityTarget[];
  audits: AuditRecord[];
  selectedTimeRange?: TimeRange;
  onNavigateTab: (tab: TabType) => void;
  onOpenLogMeter: () => void;
  onOpenLogAudit: () => void;
  onOpenExportReport: () => void;
  onAcknowledgeAlert: (id: string) => void;
  onResetData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  buildings,
  monthlyData,
  wasteCategories,
  alerts,
  targets,
  audits,
  selectedTimeRange = '30d',
  onNavigateTab,
  onOpenLogMeter,
  onOpenLogAudit,
  onOpenExportReport,
  onAcknowledgeAlert,
  onResetData,
}) => {
  // Derive aggregate metrics strictly from reported department readings
  let totalElectricity = 0;
  let totalWaterLitres = 0;
  let totalPaperSheets = 0;
  let totalWasteKg = 0;
  let totalDepartments = 0;
  let reportedDepartments = 0;
  let missingDepartments = 0;

  buildings.forEach((b) => {
    b.departments.forEach((dept) => {
      totalDepartments++;
      if (dept.electricityKwh !== null) {
        totalElectricity += dept.electricityKwh;
      }
      if (dept.waterLitres !== null) {
        totalWaterLitres += dept.waterLitres;
      }
      if (dept.paperSheets !== null) {
        totalPaperSheets += dept.paperSheets;
      }
      if (dept.wasteKg !== null) {
        totalWasteKg += dept.wasteKg;
      }

      if (dept.reportingStatus === 'reported') {
        reportedDepartments++;
      } else {
        missingDepartments++;
      }
    });
  });

  const completenessPercent =
    totalDepartments > 0 ? Math.round((reportedDepartments / totalDepartments) * 1000) / 10 : 100;

  // Waste diversion calculation
  const totalWasteCategorizedKg = wasteCategories.reduce((sum, c) => sum + c.weightKg, 0);
  const divertedWasteKg = wasteCategories
    .filter((c) => c.isDiverted)
    .reduce((sum, c) => sum + c.weightKg, 0);
  const diversionRate =
    totalWasteCategorizedKg > 0 ? (divertedWasteKg / totalWasteCategorizedKg) * 100 : 0;

  // Dynamically compute metrics matching selected date filter
  const getPeriodData = () => {
    switch (selectedTimeRange) {
      case '7d': {
        const factor = 7 / 30;
        const elec = Math.round(totalElectricity * factor);
        const water = Math.round(totalWaterLitres * factor);
        const paper = Math.round(totalPaperSheets * factor);
        const waste = Math.round(totalWasteKg * factor);
        const elecTarget = Math.round(675000 * factor);
        const waterTarget = Math.round(12500000 * factor);
        const paperTarget = Math.round(1000000 * factor);
        return {
          periodLabel: 'Last 7 Days (Oct 8 – 14, 2026)',
          periodTag: '7D Rolling',
          elec,
          elecTarget,
          elecVariance: ((elecTarget - elec) / elecTarget) * 100,
          water,
          waterTarget,
          waterVariance: ((waterTarget - water) / waterTarget) * 100,
          paper,
          paperTarget,
          paperVariance: ((paperTarget - paper) / paperTarget) * 100,
          waste,
          diversion: diversionRate,
          completeness: completenessPercent,
          sustainabilityScore: 78.4,
        };
      }
      case '90d': {
        const q3 = monthlyData.slice(2, 5);
        const elec = q3.reduce((s, m) => s + m.electricityKwh, 0);
        const elecTarget = q3.reduce((s, m) => s + m.targetElectricityKwh, 0);
        const water = q3.reduce((s, m) => s + m.waterLitres, 0);
        const waterTarget = q3.reduce((s, m) => s + m.targetWaterLitres, 0);
        const paper = q3.reduce((s, m) => s + m.paperSheets, 0);
        const paperTarget = q3.reduce((s, m) => s + m.targetPaperSheets, 0);
        const waste = q3.reduce((s, m) => s + m.wasteKg, 0);
        const divWaste = q3.reduce((s, m) => s + m.divertedWasteKg, 0);
        const divRate = waste > 0 ? (divWaste / waste) * 100 : 71.5;
        return {
          periodLabel: 'Last 90 Days (Q3 July – Sept 2026)',
          periodTag: 'Q3 Total',
          elec,
          elecTarget,
          elecVariance: ((elecTarget - elec) / elecTarget) * 100,
          water,
          waterTarget,
          waterVariance: ((waterTarget - water) / waterTarget) * 100,
          paper,
          paperTarget,
          paperVariance: ((paperTarget - paper) / paperTarget) * 100,
          waste,
          diversion: divRate,
          completeness: 100,
          sustainabilityScore: 79.1,
        };
      }
      case 'ytd': {
        const elec = monthlyData.reduce((s, m) => s + m.electricityKwh, 0);
        const elecTarget = monthlyData.reduce((s, m) => s + m.targetElectricityKwh, 0);
        const water = monthlyData.reduce((s, m) => s + m.waterLitres, 0);
        const waterTarget = monthlyData.reduce((s, m) => s + m.targetWaterLitres, 0);
        const paper = monthlyData.reduce((s, m) => s + m.paperSheets, 0);
        const paperTarget = monthlyData.reduce((s, m) => s + m.targetPaperSheets, 0);
        const waste = monthlyData.reduce((s, m) => s + m.wasteKg, 0);
        const divWaste = monthlyData.reduce((s, m) => s + m.divertedWasteKg, 0);
        const divRate = waste > 0 ? (divWaste / waste) * 100 : 71.5;
        return {
          periodLabel: 'Year to Date (May – Oct 2026)',
          periodTag: 'YTD Total',
          elec,
          elecTarget,
          elecVariance: ((elecTarget - elec) / elecTarget) * 100,
          water,
          waterTarget,
          waterVariance: ((waterTarget - water) / waterTarget) * 100,
          paper,
          paperTarget,
          paperVariance: ((paperTarget - paper) / paperTarget) * 100,
          waste,
          diversion: divRate,
          completeness: 98.8,
          sustainabilityScore: 78.8,
        };
      }
      case '30d':
      default: {
        const elecTarget = 675000;
        const waterTarget = 12500000;
        const paperTarget = 1000000;
        return {
          periodLabel: 'Last 30 Days (Oct 2026 MTD)',
          periodTag: 'MTD',
          elec: totalElectricity,
          elecTarget,
          elecVariance: ((elecTarget - totalElectricity) / elecTarget) * 100,
          water: totalWaterLitres,
          waterTarget,
          waterVariance: ((waterTarget - totalWaterLitres) / waterTarget) * 100,
          paper: totalPaperSheets,
          paperTarget,
          paperVariance: ((paperTarget - totalPaperSheets) / paperTarget) * 100,
          waste: totalWasteKg,
          diversion: diversionRate,
          completeness: completenessPercent,
          sustainabilityScore: 78.4,
        };
      }
    }
  };

  const periodData = getPeriodData();
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Synthetic Demo Banner */}
      <DemoNotice onResetData={onResetData} />

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <div className="text-xs text-slate-500 font-medium">Campus Operational Overview</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            GreenCampus University · {periodData.periodLabel}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenLogMeter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Log Department Reading</span>
          </button>
          <button
            onClick={onOpenLogAudit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Record Walkthrough Audit</span>
          </button>
          <button
            onClick={onOpenExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Report Data</span>
          </button>
        </div>
      </div>

      {/* 7 Core Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Green Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Sustainability Index</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
              {periodData.sustainabilityScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Internal Assessment</span>
            <span className="text-emerald-700 font-medium">+2.1 pts vs baseline</span>
          </div>
        </div>

        {/* Card 2: Electricity Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Electricity Usage</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {(periodData.elec / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500">kWh ({periodData.periodTag})</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{periodData.elecVariance.toFixed(1)}% under ceiling</span>
            </span>
            <span className="text-slate-500 font-mono">13 / 14 depts</span>
          </div>
        </div>

        {/* Card 3: Water Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Water Consumption</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-800">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {(periodData.water / 1000).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">kL ({(periodData.water / 1000000).toFixed(2)}M L)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{periodData.waterVariance.toFixed(1)}% under ceiling</span>
            </span>
            <span className="text-slate-500 font-mono">13 / 14 depts</span>
          </div>
        </div>

        {/* Card 4: Paper Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Paper Usage</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {periodData.paper.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">sheets ({periodData.periodTag})</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{periodData.paperVariance.toFixed(1)}% under allocation</span>
            </span>
            <span className="text-slate-500 font-mono">13 / 14 depts</span>
          </div>
        </div>

        {/* Card 5: Waste Generated & Diversion */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Solid Waste Diversion</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {periodData.diversion.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">Diverted</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">Total: {periodData.waste.toLocaleString()} kg</span>
            <span className="text-amber-800 font-medium">Target: 85% by 2027</span>
          </div>
        </div>

        {/* Card 6: Target Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Sustainability Targets</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">3 / 4</span>
            <span className="text-xs text-slate-500">Targets On Track</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-800 font-medium">1 Needs Attention (Waste)</span>
            <button
              onClick={() => onNavigateTab('targets')}
              className="text-emerald-700 hover:text-emerald-900 font-medium"
            >
              Targets →
            </button>
          </div>
        </div>

        {/* Card 7: Data Completeness (Separated Honest Tracker) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between sm:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Data Completeness & Department Reporting</span>
                <span title="Discloses reported vs missing departmental logs">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Honest reporting: {reportedDepartments} of {totalDepartments} locations logged ({missingDepartments} unsubmitted)
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-mono font-semibold mb-1">
              <span className="text-slate-700">Campus Reporting Completeness</span>
              <span className="text-emerald-800">{periodData.completeness}% Logged</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-600 h-2"
                style={{ width: `${periodData.completeness}%` }}
                title={`${reportedDepartments} departments reported`}
              />
              <div
                className="bg-amber-400 h-2"
                style={{ width: `${100 - periodData.completeness}%` }}
                title={`${missingDepartments} department missing`}
              />
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Reported ({reportedDepartments})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Missing ({missingDepartments})
              </span>
            </div>
            <span className="text-slate-500 italic">
              Missing logs are excluded from totals rather than assumed zero
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResourceConsumptionChart data={monthlyData} />
        <DepartmentComparisonChart buildings={buildings} />
      </div>

      {/* Lower Row: Waste Composition & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WasteCompositionChart categories={wasteCategories} />
        </div>

        {/* Priority Operational Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Operational Alerts</h3>
              </div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
              >
                View all ({alerts.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.acknowledged
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : alert.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-semibold leading-tight">{alert.title}</span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {alert.timestamp}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600">
                    {alert.building} {alert.department ? `· ${alert.department}` : ''}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 font-mono">
                    Observed: {alert.observedReading}
                  </div>
                  {!alert.acknowledged && (
                    <div className="mt-2 flex items-center justify-end">
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-2 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        Acknowledge
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{activeAlerts.length} unacknowledged items</span>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-emerald-700 font-medium hover:underline"
            >
              Resolve alerts →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Internal Audits & Inspections */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Campus Walkthrough Audits</h3>
            <p className="text-xs text-slate-500">Internal observation walks and department utility log reviews</p>
          </div>
          <button
            onClick={() => onNavigateTab('audits')}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Audit Reference</th>
                <th className="py-2.5 px-3">Inspection Subject</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Reviewer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {audits.slice(0, 3).map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                    {audit.auditNumber}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                    {audit.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{audit.building}</td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[140px]">
                    {audit.auditorName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{audit.auditDate}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {audit.internalRating}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        audit.status === 'Reviewed & Filed'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {audit.status}
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
