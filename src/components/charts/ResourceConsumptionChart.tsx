import React, { useState } from 'react';
import { MonthlyConsumption, ResourceType } from '../../types';

interface ResourceConsumptionChartProps {
  data: MonthlyConsumption[];
}

export const ResourceConsumptionChart: React.FC<ResourceConsumptionChartProps> = ({ data }) => {
  const [selectedResource, setSelectedResource] = useState<ResourceType>('electricity');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getResourceMeta = () => {
    switch (selectedResource) {
      case 'electricity':
        return {
          label: 'Electricity',
          unit: 'kWh',
          color: '#059669', // emerald-600
          lightColor: '#a7f3d0', // emerald-200
          getValue: (item: MonthlyConsumption) => item.electricityKwh,
          getTarget: (item: MonthlyConsumption) => item.targetElectricityKwh,
          format: (v: number) => `${(v / 1000).toFixed(1)}k kWh`,
        };
      case 'water':
        return {
          label: 'Potable Water',
          unit: 'kL',
          color: '#0284c7', // sky-600
          lightColor: '#bae6fd', // sky-200
          getValue: (item: MonthlyConsumption) => item.waterKL,
          getTarget: (item: MonthlyConsumption) => item.targetWaterKL,
          format: (v: number) => `${v.toLocaleString()} kL`,
        };
      case 'paper':
        return {
          label: 'Paper Usage',
          unit: 'Reams',
          color: '#d97706', // amber-600
          lightColor: '#fde68a', // amber-200
          getValue: (item: MonthlyConsumption) => item.paperReams,
          getTarget: (item: MonthlyConsumption) => item.targetPaperReams,
          format: (v: number) => `${v.toLocaleString()} reams`,
        };
    }
  };

  const meta = getResourceMeta();
  const maxVal = Math.max(
    ...data.flatMap((d) => [meta.getValue(d), meta.getTarget(d)])
  ) * 1.15;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
      {/* Header with Segmented Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Monthly Consumption vs. Reduction Target
          </h2>
          <div className="text-xs text-slate-500 mt-0.5">
            Measured baseline vs institutional reduction milestones (May – Oct 2026)
          </div>
        </div>

        {/* Interactive Segmented Filter */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setSelectedResource('electricity')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedResource === 'electricity'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Electricity (kWh)
          </button>
          <button
            onClick={() => setSelectedResource('water')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedResource === 'water'
                ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Water (kL)
          </button>
          <button
            onClick={() => setSelectedResource('paper')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedResource === 'paper'
                ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paper (Reams)
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative h-64 w-full">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = 180 - pct * 150;
            const gridVal = (maxVal * pct).toFixed(0);
            return (
              <g key={idx}>
                <line x1="40" y1={y} x2="590" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <text x="35" y={y + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                  {Number(gridVal) >= 1000 ? `${(Number(gridVal) / 1000).toFixed(0)}k` : gridVal}
                </text>
              </g>
            );
          })}

          {/* Bar Groups */}
          {data.map((item, index) => {
            const x = 70 + index * 85;
            const actualVal = meta.getValue(item);
            const targetVal = meta.getTarget(item);
            const actualHeight = (actualVal / maxVal) * 150;
            const targetY = 180 - (targetVal / maxVal) * 150;
            const isHovered = hoveredIndex === index;

            return (
              <g
                key={item.month}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Background hover highlight */}
                <rect
                  x={x - 25}
                  y={20}
                  width="50"
                  height="170"
                  fill={isHovered ? '#f8fafc' : 'transparent'}
                  rx="4"
                />

                {/* Actual Bar */}
                <rect
                  x={x - 14}
                  y={180 - actualHeight}
                  width="28"
                  height={actualHeight}
                  fill={meta.color}
                  rx="3"
                  className="transition-all duration-200"
                  opacity={isHovered ? 1 : 0.88}
                />

                {/* Target marker line */}
                <line
                  x1={x - 20}
                  y1={targetY}
                  x2={x + 20}
                  y2={targetY}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Month label */}
                <text
                  x={x}
                  y="200"
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            className="absolute -top-1 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-lg z-20"
            style={{
              left: `${Math.min(Math.max(15, (hoveredIndex / (data.length - 1)) * 80 + 10), 85)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-200">{data[hoveredIndex].month} Telemetry</div>
            <div className="mt-1 flex items-center justify-between gap-4 font-mono text-[11px]">
              <span className="text-slate-400">Actual:</span>
              <span className="text-emerald-400 font-semibold">
                {meta.format(meta.getValue(data[hoveredIndex]))}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 font-mono text-[11px]">
              <span className="text-slate-400">Target Ceiling:</span>
              <span className="text-rose-300">
                {meta.format(meta.getTarget(data[hoveredIndex]))}
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-700 text-[10px] text-slate-300">
              {meta.getValue(data[hoveredIndex]) <= meta.getTarget(data[hoveredIndex]) ? (
                <span className="text-emerald-300">Compliant (Under Target Ceiling)</span>
              ) : (
                <span className="text-rose-300">Over Target Ceiling</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Summary Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-xs inline-block"
              style={{ backgroundColor: meta.color }}
            />
            <span>Actual Consumption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500 inline-block" />
            <span>Target Benchmark Ceiling</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Oct MTD Progress: <span className="text-emerald-700 font-semibold">3.1% below ceiling</span>
        </div>
      </div>
    </div>
  );
};
