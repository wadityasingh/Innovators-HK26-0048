import React from 'react';
import {
  Zap,
  Droplets,
  FileText,
  Trash2,
  Target,
  Database,
  ArrowDownRight,
  ArrowUpRight,
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
  onNavigateTab,
  onOpenLogMeter,
  onOpenLogAudit,
  onOpenExportReport,
  onAcknowledgeAlert,
  onResetData,
}) => {
  // Aggregate Metrics
  const totalElectricity = buildings.reduce((sum, b) => sum + b.electricityKwh, 0);
  const totalWater = buildings.reduce((sum, b) => sum + b.waterKL, 0);
  const totalPaper = buildings.reduce((sum, b) => sum + b.paperReams, 0);
  const totalWasteKg = buildings.reduce((sum, b) => sum + b.wasteKg, 0);
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  // Honest Data Completeness Calculation
  const meteredCount = buildings.filter((b) => b.meterStatus === 'online').length;
  const intermittentCount = buildings.filter((b) => b.meterStatus === 'intermittent').length;
  const manualCount = buildings.filter((b) => b.meterStatus === 'manual_estimate').length;
  const completenessPercent = Math.round(
    ((meteredCount * 1.0 + intermittentCount * 0.5 + manualCount * 0.2) / buildings.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Demo simulation transparent banner */}
      <DemoNotice onResetData={onResetData} />

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <div className="text-xs text-slate-500 font-medium">Campus Operational State</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            Fall Academic Term · Oct 2026 Audit Cycle
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenLogMeter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Log Meter</span>
          </button>
          <button
            onClick={onOpenLogAudit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>New Audit</span>
          </button>
          <button
            onClick={onOpenExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export ESG Report</span>
          </button>
        </div>
      </div>

      {/* 7 Core Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Green Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Campus Green Score</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">78.4</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>AASHE STARS Gold tier</span>
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
              {(totalElectricity / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500">kWh (MTD)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>3.1% under ceiling</span>
            </span>
            <span className="text-slate-500 font-mono">Peak: 485 kW</span>
          </div>
        </div>

        {/* Card 3: Water Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Potable Water Flow</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-800">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalWater.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">kL (MTD)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>3.9% under ceiling</span>
            </span>
            <span className="text-slate-500 font-mono">Recycled: 14%</span>
          </div>
        </div>

        {/* Card 4: Paper Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Paper Consumption</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalPaper.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">Reams (MTD)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>9.6% reduction</span>
            </span>
            <span className="text-slate-500 font-mono">~22.8 trees saved</span>
          </div>
        </div>

        {/* Card 5: Waste Generated & Diversion */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Waste & Landfill Diversion</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">74.3%</span>
            <span className="text-xs text-slate-500">Diverted</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">Total: {(totalWasteKg / 1000).toFixed(1)}t</span>
            <span className="text-amber-700 font-medium">Target: 90% by 2027</span>
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
            <span className="text-xs text-slate-500">Milestones On Track</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-700 font-medium">1 At Risk (Waste 90%)</span>
            <button
              onClick={() => onNavigateTab('targets')}
              className="text-emerald-700 hover:text-emerald-900 font-medium"
            >
              Roadmap →
            </button>
          </div>
        </div>

        {/* Card 7: Data Completeness & Sensor Health (Honest Disclosure) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between sm:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Data Completeness & Sub-Meter Coverage</span>
                <span title="Discloses real sensor availability vs estimated logs">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Honest reporting: 5 digital IoT meters active, 1 intermittent, 1 manual log
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-mono font-semibold mb-1">
              <span className="text-slate-700">Campus Sensor Confidence</span>
              <span className="text-emerald-800">{completenessPercent}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div className="bg-emerald-600 h-2" style={{ width: '71.4%' }} title="Online IoT meters (71.4%)" />
              <div className="bg-amber-400 h-2" style={{ width: '14.3%' }} title="Intermittent submeters (14.3%)" />
              <div className="bg-slate-300 h-2" style={{ width: '14.3%' }} title="Manual log estimations (14.3%)" />
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Online (5)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Intermittent (1)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Manual (1)
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('resources')}
              className="text-emerald-700 hover:text-emerald-900 font-medium"
            >
              Audit Sensors →
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Resource Consumption Chart */}
        <ResourceConsumptionChart data={monthlyData} />

        {/* Building & Department Comparative Footprint */}
        <DepartmentComparisonChart buildings={buildings} />
      </div>

      {/* Lower Row: Waste Composition & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waste Breakdown (takes 2 cols on lg) */}
        <div className="lg:col-span-2">
          <WasteCompositionChart categories={wasteCategories} />
        </div>

        {/* Priority Operational Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Priority Alerts</h3>
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
                    {alert.building} · Observed: <span className="font-mono">{alert.observedValue}</span>
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
            <span>{activeAlerts.length} unacknowledged anomalies</span>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-emerald-700 font-medium hover:underline"
            >
              Resolve alerts →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Field Audits & Activity Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Sustainability Audits & Inspections</h3>
            <p className="text-xs text-slate-500">Formal energy walks, waste sorts, and sensor calibrations</p>
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
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Audit Reference</th>
                <th className="py-2.5 px-3">Inspection Title</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Auditor</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {audits.slice(0, 4).map((audit) => (
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
                    {audit.complianceScore.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        audit.status === 'Certified'
                          ? 'text-emerald-700'
                          : audit.status === 'Findings Open'
                          ? 'text-rose-700'
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
