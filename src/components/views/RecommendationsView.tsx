import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Leaf,
  Clock,
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
    const matchesStatus = statusFilter === 'all' || r.reviewStatus === statusFilter;
    return matchesCat && matchesStatus;
  });

  const totalEstimatedSavings = recommendations
    .filter((r) => r.reviewStatus !== 'Dismissed')
    .reduce((sum, r) => sum + r.estimatedAnnualSavingsUsd, 0);

  const totalEstimatedCarbon = recommendations
    .filter((r) => r.reviewStatus !== 'Dismissed')
    .reduce((sum, r) => sum + r.estimatedCarbonReductionKg, 0);

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Rationale & Integrity Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>RESOURCE CONSERVATION PROPOSALS</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Campus Conservation Opportunities & Estimated Impacts
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Preliminary initiatives identified from department utility consumption patterns. Savings are unverified model estimates and require verification before project approval.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 shrink-0">
            <div>
              <div className="text-[11px] text-emerald-800 font-medium">Estimated Annual Cost Savings</div>
              <div className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                ${totalEstimatedSavings.toLocaleString()} / yr
              </div>
              <div className="text-[10px] text-slate-500 italic">Unverified projection</div>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div>
              <div className="text-[11px] text-emerald-800 font-medium">Estimated Carbon Reduction</div>
              <div className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                {(totalEstimatedCarbon / 1000).toFixed(1)} MT CO₂e
              </div>
              <div className="text-[10px] text-slate-500 italic">Calculated model</div>
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
            <option value="Heating & Cooling">Heating & Cooling</option>
            <option value="Digital Forms">Digital Forms</option>
            <option value="Water Fixtures">Water Fixtures</option>
            <option value="Lighting Schedule">Lighting Schedule</option>
            <option value="Waste Diversion">Waste Diversion</option>
          </select>

          <span className="font-semibold text-slate-700 ml-2">Review Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Draft Proposal">Draft Proposal</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved for Implementation">Approved for Implementation</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Showing {filtered.length} proposal{filtered.length === 1 ? '' : 's'}
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
                  {rec.department && (
                    <>
                      <span>·</span>
                      <span className="text-slate-600">{rec.department}</span>
                    </>
                  )}
                  <span>·</span>
                  <span
                    className={`font-semibold text-[10px] px-2 py-0.5 rounded ${
                      rec.reviewStatus === 'Approved for Implementation'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : rec.reviewStatus === 'Under Review'
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : rec.reviewStatus === 'Dismissed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {rec.reviewStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {rec.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rec.supportingData}
                </p>
              </div>

              {/* Metrics strip */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Estimated Annual Savings</div>
                  <div className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                    ${rec.estimatedAnnualSavingsUsd.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Unverified Estimate</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>Carbon: {(rec.estimatedCarbonReductionKg / 1000).toFixed(1)}t</span>
                  <span>Payback: {rec.paybackMonths}mo</span>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                  <span>Review Details</span>
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
