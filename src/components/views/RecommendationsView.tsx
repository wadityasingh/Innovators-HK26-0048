import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Leaf,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { Recommendation } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  onSelectRecommendation: (rec: Recommendation) => void;
  onResetData: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onSelectRecommendation,
  onResetData,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = recommendations.filter((r) => {
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const totalSavings = recommendations
    .filter((r) => r.status !== 'dismissed')
    .reduce((sum, r) => sum + r.potentialSavingsAnnualUsd, 0);

  const totalCo2 = recommendations
    .filter((r) => r.status !== 'dismissed')
    .reduce((sum, r) => sum + r.co2ReductionTons, 0);

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Rationale & Integrity Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>EMPIRICAL CONSERVATION PIPELINE</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              AI-Detected Energy & Resource Conservation Opportunities
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Derived from high-frequency submeter interval deviations, outdoor weather regression, and campus schedule cross-referencing. All measures require verification by facilities engineering prior to capital commitment.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 shrink-0">
            <div>
              <div className="text-[11px] text-emerald-800 font-medium">Potential Annual Utility Savings</div>
              <div className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                ${totalSavings.toLocaleString()} / yr
              </div>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div>
              <div className="text-[11px] text-emerald-800 font-medium">Estimated Carbon Avoidance</div>
              <div className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                {totalCo2.toFixed(1)} MT CO₂e
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Categories ({recommendations.length})</option>
            <option value="HVAC Optimization">HVAC Optimization</option>
            <option value="Lighting & Controls">Lighting & Controls</option>
            <option value="Water Conservation">Water Conservation</option>
            <option value="Digital Transition">Digital Transition</option>
            <option value="Waste Diversion">Waste Diversion</option>
          </select>

          <span className="font-semibold text-slate-700 ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="review">Review Needed</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Showing {filtered.length} conservation measure{filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectRecommendation(rec)}
            className="bg-white border border-slate-200 hover:border-emerald-500/70 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-800">{rec.category}</span>
                  <span>·</span>
                  <span>{rec.building}</span>
                  <span>·</span>
                  <span
                    className={`font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                      rec.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800'
                        : rec.status === 'dismissed'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {rec.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rec.evidenceData}
                </p>
              </div>

              {/* Metrics strip */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Annual Savings</div>
                  <div className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                    ${rec.potentialSavingsAnnualUsd.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>CO₂: {rec.co2ReductionTons}t</span>
                  <span>Payback: {rec.paybackMonths}mo</span>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                  <span>Review Checklist</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
