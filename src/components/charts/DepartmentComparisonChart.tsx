import React, { useState } from 'react';
import { BuildingData, ResourceType } from '../../types';
import { ChevronDown, ChevronRight, AlertCircle, Info } from 'lucide-react';

interface DepartmentComparisonChartProps {
  buildings: BuildingData[];
}

export const DepartmentComparisonChart: React.FC<DepartmentComparisonChartProps> = ({
  buildings,
}) => {
  const [metric, setMetric] = useState<ResourceType>('electricity');
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  const getMetricMeta = () => {
    switch (metric) {
      case 'electricity':
        return {
          label: 'Electricity',
          unit: 'kWh',
          color: 'bg-emerald-600',
          getDeptVal: (d: any) => d.electricityKwh,
          format: (v: number | null) => (v === null ? 'Missing reading' : `${v.toLocaleString()} kWh`),
          formatSummary: (v: number) => `${(v / 1000).toFixed(1)}k kWh`,
        };
      case 'water':
        return {
          label: 'Water',
          unit: 'Litres',
          color: 'bg-sky-600',
          getDeptVal: (d: any) => d.waterLitres,
          format: (v: number | null) =>
            v === null ? 'Missing reading' : `${(v / 1000).toLocaleString()} kL (${v.toLocaleString()} L)`,
          formatSummary: (v: number) => `${(v / 1000).toLocaleString()} kL`,
        };
      case 'paper':
        return {
          label: 'Paper',
          unit: 'Sheets',
          color: 'bg-amber-600',
          getDeptVal: (d: any) => d.paperSheets,
          format: (v: number | null) => (v === null ? 'Missing reading' : `${v.toLocaleString()} sheets`),
          formatSummary: (v: number) => `${v.toLocaleString()} sheets`,
        };
      case 'waste':
        return {
          label: 'Waste',
          unit: 'kg',
          color: 'bg-slate-700',
          getDeptVal: (d: any) => d.wasteKg,
          format: (v: number | null) => (v === null ? 'Missing reading' : `${v.toLocaleString()} kg`),
          formatSummary: (v: number) => `${v.toLocaleString()} kg`,
        };
    }
  };

  const meta = getMetricMeta();

  // Calculate building totals based only on reported readings
  const getBuildingStats = (b: BuildingData) => {
    let sum = 0;
    let reportedCount = 0;
    let missingCount = 0;

    b.departments.forEach((dept) => {
      const val = meta.getDeptVal(dept);
      if (val !== null && val !== undefined) {
        sum += val;
        reportedCount++;
      } else {
        missingCount++;
      }
    });

    return { sum, reportedCount, missingCount, totalDepts: b.departments.length };
  };

  const buildingStats = buildings.map((b) => ({
    building: b,
    ...getBuildingStats(b),
  }));

  const maxVal = Math.max(...buildingStats.map((s) => s.sum)) || 1;
  const sortedStats = [...buildingStats].sort((a, b) => b.sum - a.sum);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
      {/* Header with Metric Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Building & Department Comparative Footprint
          </h2>
          <div className="text-xs text-slate-500 mt-0.5">
            Campus → Buildings → Departments/Locations hierarchy (Click row to expand)
          </div>
        </div>

        {/* Metric Selector */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setMetric('electricity')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              metric === 'electricity'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Power (kWh)
          </button>
          <button
            onClick={() => setMetric('water')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              metric === 'water'
                ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Water (L)
          </button>
          <button
            onClick={() => setMetric('paper')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              metric === 'paper'
                ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paper (Sheets)
          </button>
          <button
            onClick={() => setMetric('waste')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              metric === 'waste'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waste (kg)
          </button>
        </div>
      </div>

      {/* Building list with drill-down */}
      <div className="space-y-3 mt-4">
        {sortedStats.map(({ building, sum, reportedCount, missingCount, totalDepts }) => {
          const pct = Math.min(100, Math.max(4, (sum / maxVal) * 100));
          const isExpanded = expandedBuildingId === building.id;

          return (
            <div
              key={building.id}
              className="border border-slate-150 rounded-lg p-3 hover:border-slate-300 transition-colors bg-white"
            >
              <div
                onClick={() => setExpandedBuildingId(isExpanded ? null : building.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-900 truncate">
                      {building.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      ({building.code})
                    </span>
                    {missingCount > 0 && (
                      <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded shrink-0">
                        {missingCount} missing log
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {meta.formatSummary(sum)}
                    </span>
                    {missingCount > 0 && (
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({reportedCount}/{totalDepts} depts)
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${meta.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Department Drill-down Table (Accordion) */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">
                    Department & Location Logs:
                  </div>
                  <div className="space-y-1.5">
                    {building.departments.map((dept) => {
                      const val = meta.getDeptVal(dept);
                      return (
                        <div
                          key={dept.id}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 text-[11px]"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-slate-800">{dept.name}</span>
                            <span className="text-slate-400 ml-1.5 text-[10px]">
                              ({dept.type} · {dept.lastLogDate})
                            </span>
                            {dept.flaggedForReview && (
                              <span className="ml-2 text-rose-700 font-medium text-[10px]">
                                [Flagged for review]
                              </span>
                            )}
                          </div>
                          <div className="font-mono shrink-0 ml-2">
                            {val === null ? (
                              <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Missing Reading
                              </span>
                            ) : (
                              <span className="font-semibold text-slate-900">{meta.format(val)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
