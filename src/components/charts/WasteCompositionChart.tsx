import React, { useState } from 'react';
import { WasteCategory } from '../../types';

interface WasteCompositionChartProps {
  categories: WasteCategory[];
}

export const WasteCompositionChart: React.FC<WasteCompositionChartProps> = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const totalKg = categories.reduce((sum, c) => sum + c.weightKg, 0);
  const divertedKg = categories.filter((c) => c.isDiverted).reduce((sum, c) => sum + c.weightKg, 0);
  const diversionRate = totalKg > 0 ? (divertedKg / totalKg) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Solid Waste Streams & Landfill Diversion (kg)
          </h2>
          <div className="text-xs text-slate-500 mt-0.5">
            Campus waste stream weight tickets & material breakdown (Oct 2026 MTD)
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 font-medium">Reported Diversion Rate</div>
          <div className="text-lg font-bold text-emerald-800 font-mono tabular-nums leading-tight">
            {diversionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Diversion Milestone Progress */}
      <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
        <div className="flex items-center justify-between mb-1.5 font-medium">
          <span className="text-emerald-950 font-semibold">2027 Campus Waste Diversion Milestone (85.0% Target)</span>
          <span className="font-mono text-emerald-900 font-bold">
            {diversionRate.toFixed(1)}% / 85.0%
          </span>
        </div>
        <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-700 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (diversionRate / 85) * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-800">
          <span>Total Reported Waste: {totalKg.toLocaleString()} kg ({(totalKg / 1000).toFixed(1)} tons)</span>
          <span>Diverted from Landfill: {divertedKg.toLocaleString()} kg ({(divertedKg / 1000).toFixed(1)} tons)</span>
        </div>
      </div>

      {/* Stacked Percentage Bar */}
      <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner mb-4">
        {categories.map((cat) => {
          const widthPct = (cat.weightKg / totalKg) * 100;
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
              title={`${cat.name}: ${cat.weightKg.toLocaleString()} kg (${cat.percentage.toFixed(1)}%)`}
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
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {cat.weightKg.toLocaleString()} kg
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                    ({(cat.weightKg / 1000).toFixed(1)} t)
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {cat.percentage}% of total ·{' '}
                  <strong className={cat.isDiverted ? 'text-emerald-700 font-medium' : 'text-slate-600 font-medium'}>
                    {cat.isDiverted ? 'Diverted' : 'Landfill'}
                  </strong>
                </span>
                <span className="truncate max-w-[140px] text-right" title={cat.collectionPoint}>
                  {cat.collectionPoint}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
