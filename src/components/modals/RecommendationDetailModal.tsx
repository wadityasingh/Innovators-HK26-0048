import React from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, DollarSign, Leaf, Clock } from 'lucide-react';
import { Recommendation } from '../../types';

interface RecommendationDetailModalProps {
  recommendation: Recommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: Recommendation['status']) => void;
}

export const RecommendationDetailModal: React.FC<RecommendationDetailModalProps> = ({
  recommendation,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Leaf className="w-3.5 h-3.5" />
              <span>{recommendation.category}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">{recommendation.building}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {recommendation.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Transparent AI Engineering Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-950">
                Preliminary Algorithmic Proposal (Confidence: {recommendation.confidence})
              </div>
              <div className="text-[11px] text-amber-900/90 leading-relaxed">
                This conservation opportunity was derived from statistical interval regression and historical campus weather correlation. It does not replace on-site physical engineering verification by a licensed Professional Engineer (PE).
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Annual Savings</span>
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900 font-mono">
                ${recommendation.potentialSavingsAnnualUsd.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>CO₂ Avoidance</span>
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900 font-mono">
                {recommendation.co2ReductionTons} tons/yr
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Simple Payback</span>
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900 font-mono">
                {recommendation.paybackMonths} months
              </div>
            </div>
          </div>

          {/* Data Evidence Section */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5">Sensor Evidence & Anomaly Basis</h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] leading-relaxed">
              {recommendation.evidenceData}
            </div>
          </div>

          {/* Engineering Verification Checklist */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Facilities Engineering Pre-Implementation Checklist</span>
            </h4>
            <div className="space-y-1.5">
              {recommendation.engineeringChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-slate-50/60 border border-slate-200 rounded-md text-[11px]"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50/50">
          <div className="text-[11px] text-slate-500 font-medium">
            Status:{' '}
            <span className="font-bold uppercase tracking-wider text-slate-800">
              {recommendation.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onUpdateStatus(recommendation.id, 'dismissed');
                onClose();
              }}
              className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200"
            >
              Dismiss Measure
            </button>
            <button
              onClick={() => {
                onUpdateStatus(recommendation.id, 'approved');
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg"
            >
              Approve for Engineering Scope
            </button>
            <button
              onClick={() => {
                onUpdateStatus(recommendation.id, 'in_progress');
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
            >
              Mark In Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
