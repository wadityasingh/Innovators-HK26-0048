import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { BuildingData, AuditRecord } from '../../types';

interface LogAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingData[];
  onSaveAudit: (audit: AuditRecord) => void;
  currentUser: string;
}

export const LogAuditModal: React.FC<LogAuditModalProps> = ({
  isOpen,
  onClose,
  buildings,
  onSaveAudit,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [building, setBuilding] = useState(buildings[0]?.name || '');
  const [scope, setScope] = useState('');
  const [score, setScore] = useState('85');
  const [notes, setNotes] = useState('');
  const [inspectionType, setInspectionType] = useState<AuditRecord['inspectionType']>(
    'Walkthrough Observation'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAudit: AuditRecord = {
      id: `aud-${Date.now()}`,
      auditNumber: `AUD-2026-Q4-0${Math.floor(Math.random() * 80 + 10)}`,
      title,
      auditorName: currentUser,
      auditDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      building,
      scope: scope || 'Internal department utility walkthrough',
      internalRating: parseInt(score, 10) || 85,
      status: 'Pending Review',
      unresolvedItemsCount: Math.floor(Math.random() * 3),
      notes: notes || 'Observation completed; follow-up action items noted for department.',
      inspectionType,
    };

    onSaveAudit(newAudit);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Record Walkthrough Audit</h3>
            <p className="text-xs text-slate-500">Log internal inspection findings and observation checklist</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Audit Record Filed</h4>
            <p className="text-xs text-slate-500">
              Audit logged under Pending Review in campus inspection logbook.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Science Complex Water Fixture & Lab Airflow Walkthrough"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Inspected
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspection Method
                </label>
                <select
                  value={inspectionType}
                  onChange={(e) =>
                    setInspectionType(e.target.value as AuditRecord['inspectionType'])
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="Walkthrough Observation">Walkthrough Observation</option>
                  <option value="Utility Meter Log Check">Utility Meter Log Check</option>
                  <option value="Waste Stream Inspection">Waste Stream Inspection</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Rating (0–100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewer
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser}
                  className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-600 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Walkthrough Scope
              </label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Specific floors, equipment rooms, or sorting stations observed..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observation Findings & Action Items
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observed conditions, fixture leaks, lighting timer status, or sorting compliance..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
              >
                File Audit Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
