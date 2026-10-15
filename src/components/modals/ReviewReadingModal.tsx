import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  History,
  Edit3,
  Shield,
  Trash2,
  Check,
  Building2,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import {
  CompatibleUnit,
  ReadingStatus,
  ResourceReading,
  UserProfile,
} from '../../types';
import {
  COMPATIBLE_UNITS,
  normalizeReading,
} from '../../utils/readingUtils';

interface ReviewReadingModalProps {
  reading: ResourceReading | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateReading: (updated: ResourceReading) => void;
  onDeleteReading?: (readingId: string) => void;
}

export const ReviewReadingModal: React.FC<ReviewReadingModalProps> = ({
  reading,
  isOpen,
  onClose,
  currentUser,
  onUpdateReading,
  onDeleteReading,
}) => {
  // Correction sub-form state
  const [isEditing, setIsEditing] = useState(false);
  const [correctedValue, setCorrectedValue] = useState('');
  const [correctedUnit, setCorrectedUnit] = useState<CompatibleUnit>('kWh');
  const [correctionReason, setCorrectionReason] = useState('');
  const [editError, setEditError] = useState('');

  // Flag reason state
  const [isFlagging, setIsFlagging] = useState(false);
  const [customFlagReason, setCustomFlagReason] = useState('');

  const canApprove =
    currentUser.systemRole === 'Admin' ||
    currentUser.systemRole === 'Sustainability Coordinator' ||
    (!currentUser.systemRole &&
      (currentUser.role.includes('Manager') || currentUser.role.includes('Coordinator')));

  if (!isOpen || !reading) return null;

  const handleStartCorrection = () => {
    setCorrectedValue(reading.originalValue.toString());
    setCorrectedUnit(reading.originalUnit);
    setCorrectionReason('');
    setEditError('');
    setIsEditing(true);
  };

  const handleApplyCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(correctedValue);
    if (isNaN(val) || val < 0) {
      setEditError('Please enter a valid non-negative reading value.');
      return;
    }
    if (!correctionReason.trim()) {
      setEditError('A transparent reason for the correction is required for the audit trail.');
      return;
    }

    const norm = normalizeReading(val, correctedUnit);
    const now = new Date().toISOString();

    const correctionRecord = {
      id: `cor-${Date.now()}`,
      timestamp: now,
      reviewedBy: currentUser.name,
      reviewerRole: currentUser.role,
      previousValue: reading.originalValue,
      previousUnit: reading.originalUnit,
      correctedValue: val,
      correctedUnit: correctedUnit,
      reason: correctionReason.trim(),
    };

    const updated: ResourceReading = {
      ...reading,
      originalValue: val,
      originalUnit: correctedUnit,
      normalizedValue: norm.normalizedValue,
      normalizedUnit: norm.normalizedUnit,
      updatedAt: now,
      correctionHistory: [correctionRecord, ...reading.correctionHistory],
      // If was flagged for high value and corrected to normal, flag can be cleared or kept
    };

    onUpdateReading(updated);
    setIsEditing(false);
  };

  const handleSetStatus = (newStatus: ReadingStatus, flagReasonNote?: string) => {
    const now = new Date().toISOString();
    const updated: ResourceReading = {
      ...reading,
      status: newStatus,
      updatedAt: now,
      reviewedBy: currentUser.name,
      reviewedAt: now,
      isFlagged: newStatus === 'Flagged',
      flagReason: newStatus === 'Flagged' ? (flagReasonNote || reading.flagReason || 'Flagged for coordinator review') : undefined,
    };

    onUpdateReading(updated);
    setIsFlagging(false);
  };

  const getStatusBadge = (status: ReadingStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Pending Review':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Flagged':
        return 'bg-rose-100 text-rose-950 border-rose-300';
      case 'Draft':
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(reading.status)}`}>
                {reading.status}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold uppercase text-slate-600 font-mono">
                {reading.resourceType}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-500">
                {reading.reportingPeriod}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {reading.departmentName} ({reading.departmentCode})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Simulated RBAC Notice Banner */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-start gap-2 text-[11px] leading-relaxed">
            <Shield className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Simulated Role:</strong> {currentUser.name} (
              <span className="font-semibold text-emerald-800">{currentUser.role}</span>).{' '}
              <span className="text-slate-500 italic">
                Role perspective is a DEMO simulation for testing workflow states and does not claim to enforce cryptographic security.
              </span>
            </div>
          </div>

          {/* Flag Notice If Flagged */}
          {reading.status === 'Flagged' && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-950 text-xs">Flagged for Review</div>
                <p className="text-[11px] text-rose-900/90 mt-0.5 leading-relaxed">
                  {reading.flagReason || 'Reading has been flagged for abnormal consumption variance or duplicate checking.'}
                </p>
              </div>
            </div>
          )}

          {/* Key Value & Conversion Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Original Entered Value</div>
              <div className="mt-1 font-mono font-bold text-base text-slate-900">
                {reading.originalValue.toLocaleString()} {reading.originalUnit}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Recorded as entered by reporter</div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <div className="text-[10px] text-emerald-800 uppercase font-semibold">Standard Normalized Value</div>
              <div className="mt-1 font-mono font-bold text-base text-emerald-950">
                {reading.normalizedValue.toLocaleString()} {reading.normalizedUnit}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Used in campus aggregate totals</div>
            </div>
          </div>

          {/* Context Details Grid */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Building / Facility:</span>
              <span className="font-semibold text-slate-900">{reading.buildingName} ({reading.buildingCode})</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Reading Date:</span>
              <span className="font-mono text-slate-800">{reading.date}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Reporting Period:</span>
              <span className="font-semibold text-slate-800">{reading.reportingPeriod}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Data Source:</span>
              <span className="font-medium text-slate-800">{reading.dataSource}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Entered By:</span>
              <span className="text-slate-800">{reading.enteredBy} ({reading.enteredByRole})</span>
            </div>
            {reading.reviewedBy && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reviewed By:</span>
                <span className="font-semibold text-emerald-800">{reading.reviewedBy}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {reading.notes && (
            <div>
              <div className="font-semibold text-slate-700 mb-1">Reporter Notes</div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                {reading.notes}
              </div>
            </div>
          )}

          {/* Traceable Corrections History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Traceable Audit & Correction Trail</span>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartCorrection}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Correct Reading</span>
                </button>
              )}
            </div>

            {reading.correctionHistory.length === 0 ? (
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-400 text-[11px] italic text-center">
                No adjustments or corrections recorded. This reading reflects original data.
              </div>
            ) : (
              <div className="space-y-2">
                {reading.correctionHistory.map((cor) => (
                  <div
                    key={cor.id}
                    className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-600 font-mono">
                      <span>
                        Changed from <strong>{cor.previousValue.toLocaleString()} {cor.previousUnit}</strong> →{' '}
                        <strong>{cor.correctedValue.toLocaleString()} {cor.correctedUnit}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(cor.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-700">
                      <strong>Reason:</strong> {cor.reason}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Reviewer: {cor.reviewedBy} ({cor.reviewerRole})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Make Traceable Correction Form */}
          {isEditing && (
            <form onSubmit={handleApplyCorrection} className="p-3.5 bg-slate-100/70 border border-slate-300 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 text-xs">
                Record Traceable Adjustment
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Corrected Value
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={correctedValue}
                    onChange={(e) => setCorrectedValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={correctedUnit}
                    onChange={(e) => setCorrectedUnit(e.target.value as CompatibleUnit)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                  >
                    {COMPATIBLE_UNITS[reading.resourceType].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Correction Reason (Required for audit compliance)
                </label>
                <textarea
                  rows={2}
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Submeter multiplier corrected from 10x to 1x following physical calibration inspection..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              {editError && <p className="text-[11px] text-rose-600 font-medium">{editError}</p>}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                >
                  Apply & Log Adjustment
                </button>
              </div>
            </form>
          )}

          {/* Flag Prompt Modal / Card */}
          {isFlagging && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-rose-950">Specify Reason for Flagging Reading</div>
              <textarea
                rows={2}
                value={customFlagReason}
                onChange={(e) => setCustomFlagReason(e.target.value)}
                placeholder="Explain observation discrepancy or why inspection is required..."
                className="w-full px-2.5 py-1.5 border border-rose-300 rounded-lg bg-white text-xs"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlagging(false)}
                  className="px-2.5 py-1 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStatus('Flagged', customFlagReason)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg"
                >
                  Confirm Flag
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            {reading.status === 'Draft' && onDeleteReading && (
              <button
                type="button"
                onClick={() => {
                  onDeleteReading(reading.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Draft</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {reading.status === 'Draft' && (
              <button
                type="button"
                onClick={() => handleSetStatus('Pending Review')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Submit for Review
              </button>
            )}

            {reading.status !== 'Flagged' && (
              <button
                type="button"
                onClick={() => setIsFlagging(true)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
              >
                Flag for Review
              </button>
            )}

            {reading.status !== 'Pending Review' && reading.status !== 'Draft' && (
              <button
                type="button"
                onClick={() => handleSetStatus('Pending Review')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Mark Pending Review
              </button>
            )}

            {reading.status !== 'Approved' && (
              canApprove ? (
                <button
                  type="button"
                  onClick={() => handleSetStatus('Approved')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Reading</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-500 italic px-2">
                  Approval requires Coordinator or Admin review
                </span>
              )
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
