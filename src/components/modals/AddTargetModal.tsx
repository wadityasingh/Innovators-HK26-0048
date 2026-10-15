import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { SustainabilityTarget } from '../../types';

interface AddTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTarget: (target: SustainabilityTarget) => void;
}

export const AddTargetModal: React.FC<AddTargetModalProps> = ({ isOpen, onClose, onAddTarget }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SustainabilityTarget['category']>('Energy');
  const [currentValue, setCurrentValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('% reduction vs 2020 baseline');
  const [targetYear, setTargetYear] = useState('2028');
  const [departmentLead, setDepartmentLead] = useState('Facilities & Engineering');
  const [initiativeSummary, setInitiativeSummary] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTarget: SustainabilityTarget = {
      id: `tar-${Date.now()}`,
      title,
      category,
      currentValue: parseFloat(currentValue) || 10,
      targetValue: parseFloat(targetValue) || 25,
      unit,
      baselineYear: 2020,
      targetYear: parseInt(targetYear, 10) || 2028,
      deadlineDate: `Dec ${targetYear}`,
      status: 'on_track',
      departmentLead,
      initiativeSummary: initiativeSummary || 'Campus-wide efficiency capital improvement plan.',
    };

    onAddTarget(newTarget);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Define Sustainability Target</h3>
            <p className="text-xs text-slate-500">Add institutional benchmark milestone</p>
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
            <h4 className="text-sm font-bold text-slate-900">Sustainability Target Created</h4>
            <p className="text-xs text-slate-500">
              Target tracked across campus dashboard and compliance reports.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Milestone Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 30% Potable Water Intensity Reduction"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as SustainabilityTarget['category'])
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="Energy">Energy</option>
                  <option value="Water">Water</option>
                  <option value="Waste">Waste</option>
                  <option value="Paper">Paper</option>
                  <option value="Emissions">Emissions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Year
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2030">2030 (Net Zero)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Value
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="e.g. 15.4"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 30.0"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="% reduction vs baseline or tons diverted"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Department / Office
              </label>
              <input
                type="text"
                required
                value={departmentLead}
                onChange={(e) => setDepartmentLead(e.target.value)}
                placeholder="e.g. Dining Services, Central Plant, Housing"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Plan Summary
              </label>
              <textarea
                rows={2}
                value={initiativeSummary}
                onChange={(e) => setInitiativeSummary(e.target.value)}
                placeholder="Key equipment retrofits, behavior campaigns, or procurement policies..."
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
                Save Target
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
