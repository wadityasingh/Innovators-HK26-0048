import React, { useState } from 'react';
import { BuildingData } from '../../types';
import { AlertCircle } from 'lucide-react';

interface DepartmentComparisonChartProps {
  buildings: BuildingData[];
}

export const DepartmentComparisonChart: React.FC<DepartmentComparisonChartProps> = ({
  buildings,
}) => {
  const [metric, setMetric] = useState<'electricity' | 'water' | 'paper' | 'waste'>('electricity');
  const [normalizeByArea, setNormalizeByArea] = useState<boolean>(false);

  const getMetricMeta = () => {
    switch (metric) {
      case 'electricity':
        return {
          label: 'Electricity',
          unit: normalizeByArea ? 'kWh / 1k sq ft' : 'kWh',
          color: 'bg-emerald-600',
          getValue: (b: BuildingData) =>
            normalizeByArea ? (b.electricityKwh / b.grossAreaSqFt) * 1000 : b.electricityKwh,
          format: (v: number) =>
            normalizeByArea ? `${v.toFixed(1)} kWh/k-sqft` : `${(v / 1000).toFixed(1)}k kWh`,
        };
      case 'water':
        return {
          label: 'Water',
          unit: normalizeByArea ? 'kL / 1k sq ft' : 'kL',
          color: 'bg-sky-600',
          getValue: (b: BuildingData) =>
            normalizeByArea ? (b.waterKL / b.grossAreaSqFt) * 1000 : b.waterKL,
          format: (v: number) =>
            normalizeByArea ? `${v.toFixed(2)} kL/k-sqft` : `${v.toLocaleString()} kL`,
        };
      case 'paper':
        return {
          label: 'Paper',
          unit: normalizeByArea ? 'Reams / 1k sq ft' : 'Reams',
          color: 'bg-amber-600',
          getValue: (b: BuildingData) =>
            normalizeByArea ? (b.paperReams / b.grossAreaSqFt) * 1000 : b.paperReams,
          format: (v: number) =>
            normalizeByArea ? `${v.toFixed(2)} reams/k-sqft` : `${v} reams`,
        };
      case 'waste':
        return {
          label: 'Solid Waste',
          unit: normalizeByArea ? 'kg / 1k sq ft' : 'kg',
          color: 'bg-slate-700',
          getValue: (b: BuildingData) =>
            normalizeByArea ? (b.wasteKg / b.grossAreaSqFt) * 1000 : b.wasteKg,
          format: (v: number) =>
            normalizeByArea ? `${v.toFixed(1)} kg/k-sqft` : `${(v / 1000).toFixed(1)}t`,
        };
    }
  };

  const meta = getMetricMeta();
  const sortedBuildings = [...buildings].sort((a, b) => meta.getValue(b) - meta.getValue(a));
  const maxVal = Math.max(...buildings.map((b) => meta.getValue(b))) || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
      {/* Header with Metric Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Building & Department Comparative Footprint
          </h2>
          <div className="text-xs text-slate-500 mt-0.5">
            Cross-facility benchmark for resource allocation and anomaly isolation
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Intensity Toggle */}
          <button
            onClick={() => setNormalizeByArea(!normalizeByArea)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              normalizeByArea
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {normalizeByArea ? 'Per 1k Sq Ft' : 'Gross Total'}
          </button>

          {/* Metric Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMetric('electricity')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'electricity'
                  ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Power
            </button>
            <button
              onClick={() => setMetric('water')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'water'
                  ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Water
            </button>
            <button
              onClick={() => setMetric('paper')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'paper'
                  ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paper
            </button>
            <button
              onClick={() => setMetric('waste')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'waste'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waste
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Bar List */}
      <div className="space-y-3 mt-4">
        {sortedBuildings.map((building) => {
          const val = meta.getValue(building);
          const pct = Math.min(100, Math.max(5, (val / maxVal) * 100));

          return (
            <div key={building.id} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-800 truncate">
                    {building.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({building.code})
                  </span>
                  {building.anomalyDetected && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                      <AlertCircle className="w-3 h-3" />
                      Anomaly Flagged
                    </span>
                  )}
                  {building.meterStatus === 'manual_estimate' && (
                    <span className="text-[10px] text-slate-600 italic">
                      [Estimated Manual Log]
                    </span>
                  )}
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums ml-2 shrink-0">
                  {meta.format(val)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    building.anomalyDetected ? 'bg-rose-500' : meta.color
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Micro specs */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 mt-0.5">
                <span>{building.category} · {building.grossAreaSqFt.toLocaleString()} sq ft</span>
                <span className="font-mono">Peak Demand: {building.peakDemandKw} kW</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
