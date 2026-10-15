import React from 'react';
import { Target, PlusCircle, CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { SustainabilityTarget } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface TargetsViewProps {
  targets: SustainabilityTarget[];
  onOpenAddTarget: () => void;
  onResetData: () => void;
}

export const TargetsView: React.FC<TargetsViewProps> = ({
  targets,
  onOpenAddTarget,
  onResetData,
}) => {
  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Header & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            2030 Campus Decarbonization & Resource Targets
          </h2>
          <p className="text-xs text-slate-500">
            Institutional climate commitments approved by university board of trustees
          </p>
        </div>

        <button
          onClick={onOpenAddTarget}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Sustainability Target</span>
        </button>
      </div>

      {/* 2030 Roadmap Visual Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Campus Strategic Decarbonization Pathway (2020 – 2030)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Phased milestones toward net-zero operational greenhouse gas emissions
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400">PHASE 1 (2020–2022)</span>
            <div className="font-bold text-xs text-slate-800 mt-1">Metering & LED Retrofit</div>
            <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed (12% cut)</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-lg">
            <span className="text-[10px] font-mono text-emerald-800 font-bold">CURRENT (2023–2026)</span>
            <div className="font-bold text-xs text-slate-900 mt-1">Solar PV & Food Diversion</div>
            <div className="mt-2 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Active (18.2% cut)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400">PHASE 3 (2027–2028)</span>
            <div className="font-bold text-xs text-slate-800 mt-1">Chilled Plant Heat Pump Swap</div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">In Engineering Review</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400">PHASE 4 (2029–2030)</span>
            <div className="font-bold text-xs text-slate-800 mt-1">100% Renewable Microgrid</div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">Planned Procurement</div>
          </div>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((tar) => {
          const progressPct = Math.min(100, Math.round((tar.currentValue / tar.targetValue) * 100));

          return (
            <div
              key={tar.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800">{tar.category}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{tar.title}</h3>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      tar.status === 'on_track'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tar.status === 'needs_attention'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tar.status === 'on_track'
                      ? 'On Track'
                      : tar.status === 'needs_attention'
                      ? 'Needs Attention'
                      : 'Behind'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {tar.notes}
                </p>
              </div>

              <div>
                {/* Numbers */}
                <div className="flex items-baseline justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-500">
                    Current: <strong className="text-slate-900 text-sm">{tar.currentValue}</strong>{' '}
                    <span className="text-[10px]">{tar.unit}</span>
                  </span>
                  <span className="text-slate-500">
                    Target: <strong className="text-emerald-800 text-sm">{tar.targetValue}</strong>{' '}
                    <span className="text-[10px]">{tar.unit}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      tar.status === 'on_track'
                        ? 'bg-emerald-600'
                        : tar.status === 'needs_attention'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Sub details */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lead: <strong className="text-slate-700 font-medium">{tar.responsibleLead}</strong></span>
                  <span className="font-mono">Target Year: {tar.targetYear}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
