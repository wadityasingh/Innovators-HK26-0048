import React from 'react';
import { Info, RefreshCw } from 'lucide-react';

interface DemoNoticeProps {
  onResetData?: () => void;
  compact?: boolean;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({ onResetData, compact }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-950">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Synthetic Demo Dataset · Missing readings are tracked explicitly</span>
        </div>
        {onResetData && (
          <button
            onClick={onResetData}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 underline underline-offset-2 ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-lg p-3 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="p-1 bg-emerald-100 rounded text-emerald-800 shrink-0 mt-0.5 sm:mt-0">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-emerald-900">DEMO PREVIEW DATASET:</span>{' '}
          <span className="text-emerald-900/90">
            All figures are synthetic sample data for portal preview and testing. Missing department logs are explicitly flagged rather than assumed zero. Unverified estimates are designated as draft proposals.
          </span>
        </div>
      </div>
      {onResetData && (
        <button
          onClick={onResetData}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 rounded text-emerald-800 font-medium hover:bg-emerald-50 transition-colors whitespace-nowrap self-start sm:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      )}
    </div>
  );
};
