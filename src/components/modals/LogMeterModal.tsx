import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { BuildingData, ResourceType } from '../../types';

interface LogMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingData[];
  onSaveReading: (reading: {
    buildingId: string;
    departmentId: string;
    resourceType: ResourceType;
    value: number;
    unit: string;
    readingDate: string;
    notes: string;
  }) => void;
}

export const LogMeterModal: React.FC<LogMeterModalProps> = ({
  isOpen,
  onClose,
  buildings,
  onSaveReading,
}) => {
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const selectedBuilding = buildings.find((b) => b.id === buildingId) || buildings[0];
  const [departmentId, setDepartmentId] = useState(selectedBuilding?.departments[0]?.id || '');
  const [resourceType, setResourceType] = useState<ResourceType>('electricity');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync department selection when building changes
  const handleBuildingChange = (bId: string) => {
    setBuildingId(bId);
    const b = buildings.find((item) => item.id === bId);
    if (b && b.departments.length > 0) {
      setDepartmentId(b.departments[0].id);
    }
  };

  if (!isOpen) return null;

  const getUnit = () => {
    switch (resourceType) {
      case 'electricity':
        return 'kWh';
      case 'water':
        return 'Litres';
      case 'paper':
        return 'Sheets';
      case 'waste':
        return 'kg';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;

    onSaveReading({
      buildingId,
      departmentId,
      resourceType,
      value: num,
      unit: getUnit(),
      readingDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      notes,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setValue('');
      setNotes('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Record Department Reading</h3>
            <p className="text-xs text-slate-500">Log resource consumption reading by facility & department</p>
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
            <h4 className="text-sm font-bold text-slate-900">Department Reading Saved</h4>
            <p className="text-xs text-slate-500">
              Reading logged and campus data completeness updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-950 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Saving a reading converts any unsubmitted department status to logged and incorporates the figure into campus aggregates.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility / Building
              </label>
              <select
                value={buildingId}
                onChange={(e) => handleBuildingChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Specific Location
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
              >
                {selectedBuilding?.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code}) — {dept.reportingStatus === 'missing' ? 'Unreported' : 'Logged'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resource Stream
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['electricity', 'water', 'paper', 'waste'] as ResourceType[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResourceType(res)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                      resourceType === res
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recorded Value ({getUnit()})
              </label>
              <input
                type="number"
                step="any"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`e.g. ${
                  resourceType === 'electricity'
                    ? '45000'
                    : resourceType === 'water'
                    ? '1200000'
                    : resourceType === 'paper'
                    ? '25000'
                    : '1800'
                }`}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observer Notes / Log Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log source, physical submeter reading, or slip verification notes..."
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
                Save Reading
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
