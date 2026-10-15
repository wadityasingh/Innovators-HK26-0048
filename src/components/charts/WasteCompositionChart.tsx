import React, { useState } from 'react';
import { WasteCategory } from '../../types';

interface WasteCompositionChartProps {
  categories: WasteCategory[];
}

export const WasteCompositionChart: React.FC<WasteCompositionChartProps> = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const totalTonnage = categories.reduce((sum, c) => sum + c.tonnage, 0);
  const landfillTonnage = categories.find((c) => c.id === 'waste-landfill')?.tonnage || 0;
  const divertedTonnage = totalTonnage - landfillTonnage;
  const diversionRate = totalTonnage > 0 ? (divertedTonnage / totalTonnage) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Solid Waste Streams & Landfill Diversion
          </h2>
          <div className="text-xs text-slate-500 mt-0.5">
            Haulage manifest weigh-in breakdown & diversion metrics (Oct 2026 MTD)
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 font-medium">Diversion Rate</div>
          <div className="text-lg font-bold text-emerald-800 font-mono tabular-nums leading-tight">
            {diversionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Diversion Milestone Progress */}
      <div className="mb-4 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs">
        <div className="flex items-center justify-between mb-1.5 font-medium">
          <span className="text-emerald-900">2027 Zero-Waste Milestone (90% Target)</span>
          <span className="font-mono text-emerald-800 font-semibold">
            {diversionRate.toFixed(1)}% / 90.0%
          </span>
        </div>
        <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-700 h-2 rounded-full transition-all"
            style={{ width: `${(diversionRate / 90) * 100}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-700">
          <span>Total Waste Generated: {totalTonnage.toFixed(1)} tons</span>
          <span>Diverted from Landfill: {divertedTonnage.toFixed(1)} tons</span>
        </div>
      </div>

      {/* Stacked Percentage Bar */}
      <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner mb-4">
        {categories.map((cat) => {
          const widthPct = (cat.tonnage / totalTonnage) * 100;
          return (
            <div
              key={cat.id}
              className="h-full transition-all cursor-pointer hover:opacity-90"
              style={{
                width: `${widthPct}%`,
                backgroundColor: cat.color,
              }}
              onMouseEnter={() => setActiveCategory(cat.id)}
              onMouseLeave={() => setActiveCategory(null)}
              title={`${cat.name}: ${cat.tonnage.toFixed(1)} tons (${cat.percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Categories Detailed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <div
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat.id)}
              onMouseLeave={() => setActiveCategory(null)}
              className={`p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-slate-50 border-slate-400'
                  : 'bg-white border-slate-150 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {cat.tonnage.toFixed(1)} t
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>{cat.percentage}% of total waste</span>
                <span className="truncate max-w-[140px] text-right" title={cat.handlingFacility}>
                  {cat.handlingFacility}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
