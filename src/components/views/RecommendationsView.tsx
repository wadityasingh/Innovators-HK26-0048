import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Leaf,
  Clock,
  ChevronRight,
  Filter,
  AlertTriangle,
  RefreshCw,
  Info,
  CheckCircle2,
  FileText,
  Building,
} from 'lucide-react';
import { BuildingData, Recommendation, ResourceReading } from '../../types';
import { DemoNotice } from '../common/DemoNotice';
import {
  AUDIT_CONSTANTS,
  generateRulesBasedRecommendations,
} from '../../utils/recommendationEngine';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  buildings?: BuildingData[];
  readings?: ResourceReading[];
  onSelectRecommendation: (rec: Recommendation) => void;
  onUpdateRecommendations?: (recs: Recommendation[]) => void;
  onResetData: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  buildings = [],
  readings = [],
  onSelectRecommendation,
  onUpdateRecommendations,
  onResetData,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNote, setGenerationNote] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

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

  const handleRunAiAudit = () => {
    setIsGenerating(true);
    setGenerationNote(null);

    // Simulate analysis run across active departmental logs
    setTimeout(() => {
      const generated = generateRulesBasedRecommendations(buildings, readings);
      if (generated.length > 0 && onUpdateRecommendations) {
        onUpdateRecommendations(generated);
        setGenerationNote(
          `Analyzed ${buildings.length} campus facilities and ${buildings.reduce(
            (acc, b) => acc + b.departments.length,
            0
          )} departments. Generated ${generated.length} proposals using rules-based baseline model.`
        );
      } else {
        setGenerationNote(
          'Campus consumption audit completed. Existing initiatives are aligned with current department logs.'
        );
      }
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Rationale & Integrity Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>RESOURCE CONSERVATION PROPOSALS</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Campus Conservation Opportunities & Estimated Impacts
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Initiatives identified from department utility logs. Savings are unverified model estimates derived from standard institutional tariffs ($0.142/kWh electricity, $3.85/kL water) and require engineering review before capital commitment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <button
              onClick={handleRunAiAudit}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Analyzing Logs...' : 'Run Audit Analysis'}</span>
            </button>
          </div>
        </div>

        {generationNote && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{generationNote}</span>
          </div>
        )}

        {/* Methodology Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showMethodology ? 'Hide Calculation Methodology' : 'View Calculation Methodology & Constants'}</span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">Model: Rules-Based Baseline / Gemini Ready</span>
        </div>

        {showMethodology && (
          <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">Standard Campus Tariffs & Emissions Factors:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block">Electricity Tariff</span>
                <span className="font-bold text-slate-800">${AUDIT_CONSTANTS.ELECTRICITY_TARIFF_USD_PER_KWH} / kWh</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block">Potable Water Tariff</span>
                <span className="font-bold text-slate-800">${AUDIT_CONSTANTS.WATER_TARIFF_USD_PER_KL} / kL</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block">Paper Supply Cost</span>
                <span className="font-bold text-slate-800">${AUDIT_CONSTANTS.PAPER_COST_USD_PER_SHEET} / sheet</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block">Grid Emissions Coeff</span>
                <span className="font-bold text-slate-800">{AUDIT_CONSTANTS.GRID_EMISSIONS_FACTOR_KG_CO2_PER_KWH} kg CO₂/kWh</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-1">
              Note: Calculations avoid hallucinated savings. All ROI figures assume steady-state equipment operational schedules and require on-site walkthrough verification.
            </p>
          </div>
        )}
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
