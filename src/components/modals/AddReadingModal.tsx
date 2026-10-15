import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Calculator, FileText } from 'lucide-react';
import {
  BuildingData,
  CompatibleUnit,
  EntryDataSource,
  ResourceReading,
  ResourceType,
  UserProfile,
} from '../../types';
import {
  COMPATIBLE_UNITS,
  DEFAULT_UNITS,
  STANDARD_NORMALIZED_UNITS,
  normalizeReading,
  checkReadingAnomaly,
  checkDuplicateReading,
} from '../../utils/readingUtils';

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingData[];
  existingReadings: ResourceReading[];
  currentUser: UserProfile;
  onSaveReading: (reading: ResourceReading) => void;
}

export const AddReadingModal: React.FC<AddReadingModalProps> = ({
  isOpen,
  onClose,
  buildings,
  existingReadings,
  currentUser,
  onSaveReading,
}) => {
  // Form fields
  const isDeptStaff = currentUser.systemRole === 'Department Staff';
  const assignedDeptId = currentUser.departmentId;

  // Find assigned building if department staff
  const assignedBuilding = isDeptStaff && assignedDeptId
    ? buildings.find((b) => b.departments.some((d) => d.id === assignedDeptId))
    : undefined;

  const [readingDate, setReadingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportingPeriod, setReportingPeriod] = useState('Oct 2026');
  const [buildingId, setBuildingId] = useState(
    assignedBuilding ? assignedBuilding.id : buildings[0]?.id || ''
  );
  const selectedBuilding = buildings.find((b) => b.id === buildingId) || buildings[0];
  const [departmentId, setDepartmentId] = useState(
    isDeptStaff && assignedDeptId
      ? assignedDeptId
      : selectedBuilding?.departments[0]?.id || ''
  );
  const [resourceType, setResourceType] = useState<'electricity' | 'water' | 'paper'>('electricity');
  const [rawValue, setRawValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<CompatibleUnit>('kWh');
  const [dataSource, setDataSource] = useState<EntryDataSource>('Manual Entry');
  const [notes, setNotes] = useState('');

  // UI & Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [successStatus, setSuccessStatus] = useState<'Draft' | 'Pending Review'>('Pending Review');
  const [allowDuplicateOverride, setAllowDuplicateOverride] = useState(false);

  // Sync department selection when building changes
  const handleBuildingChange = (bId: string) => {
    if (isDeptStaff) return; // Prevent changing building if restricted to staff department
    setBuildingId(bId);
    const b = buildings.find((item) => item.id === bId);
    if (b && b.departments.length > 0) {
      setDepartmentId(b.departments[0].id);
    }
  };

  // Sync unit when resource type changes
  const handleResourceTypeChange = (newType: 'electricity' | 'water' | 'paper') => {
    setResourceType(newType);
    setSelectedUnit(DEFAULT_UNITS[newType]);
  };

  // Reset errors and override on input changes
  useEffect(() => {
    setErrors({});
    setAllowDuplicateOverride(false);
  }, [buildingId, departmentId, resourceType, reportingPeriod, rawValue, selectedUnit]);

  if (!isOpen) return null;

  const selectedDepartment = selectedBuilding?.departments.find((d) => d.id === departmentId);
  const numericVal = parseFloat(rawValue);
  const isValidNumber = !isNaN(numericVal) && numericVal >= 0;

  // Compute live normalized conversion
  const normalized = isValidNumber ? normalizeReading(numericVal, selectedUnit) : null;

  // Check for unusual consumption flag
  const anomalyCheck =
    normalized !== null
      ? checkReadingAnomaly(resourceType, normalized.normalizedValue, selectedDepartment?.name)
      : { isAnomalous: false };

  // Check for duplicate entry for same location, resource, and reporting period
  const duplicateEntry = checkDuplicateReading(
    existingReadings,
    departmentId,
    resourceType,
    reportingPeriod
  );

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!readingDate) {
      errs.readingDate = 'Reading date is required';
    } else if (new Date(readingDate).toString() === 'Invalid Date') {
      errs.readingDate = 'Please provide a valid calendar date';
    }

    if (!reportingPeriod.trim()) {
      errs.reportingPeriod = 'Reporting period is required (e.g. Oct 2026)';
    }

    if (!rawValue.trim()) {
      errs.value = 'Reading value is required';
    } else if (isNaN(numericVal)) {
      errs.value = 'Reading value must be a valid numeric figure';
    } else if (numericVal < 0) {
      errs.value = 'Reading cannot be negative; enter 0 or positive quantity';
    }

    if (!selectedDepartment) {
      errs.department = 'Department / location must be selected';
    }

    // Duplicate check validation
    if (duplicateEntry && !allowDuplicateOverride) {
      errs.duplicate = `A reading for ${selectedDepartment?.name || 'this department'} (${resourceType}) in period "${reportingPeriod}" already exists (Status: ${duplicateEntry.status}, ${duplicateEntry.originalValue.toLocaleString()} ${duplicateEntry.originalUnit}).`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (submitForReview: boolean) => {
    if (!validateForm()) return;
    if (!selectedBuilding || !selectedDepartment || normalized === null) return;

    const now = new Date().toISOString();
    const isAnomalous = anomalyCheck.isAnomalous;

    // Rules:
    // If saving draft -> 'Draft'
    // If submitForReview -> 'Pending Review' (or 'Flagged' if anomalous with flagReason)
    // Never automatically approved!
    let status: ResourceReading['status'] = 'Draft';
    if (submitForReview) {
      status = isAnomalous ? 'Flagged' : 'Pending Review';
    }

    const newReading: ResourceReading = {
      id: `rdg-${Date.now()}`,
      date: readingDate,
      reportingPeriod: reportingPeriod.trim(),
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      buildingCode: selectedBuilding.code,
      departmentId: selectedDepartment.id,
      departmentName: selectedDepartment.name,
      departmentCode: selectedDepartment.code,
      resourceType,
      originalValue: numericVal,
      originalUnit: selectedUnit,
      normalizedValue: normalized.normalizedValue,
      normalizedUnit: normalized.normalizedUnit,
      status,
      dataSource,
      enteredBy: currentUser.name,
      enteredByUid: currentUser.id,
      enteredByRole: currentUser.role,
      createdAt: now,
      updatedAt: now,
      notes: notes.trim() || undefined,
      isFlagged: isAnomalous,
      flagReason: isAnomalous ? anomalyCheck.flagReason : undefined,
      correctionHistory: [],
    };

    onSaveReading(newReading);
    setSuccessStatus(status === 'Draft' ? 'Draft' : 'Pending Review');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setRawValue('');
      setNotes('');
      setErrors({});
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add Resource Reading</h3>
            <p className="text-xs text-slate-500">
              Departmental meter log entry with live standard unit normalization
            </p>
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
            <h4 className="text-sm font-bold text-slate-900">
              Reading Saved as {successStatus}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {successStatus === 'Draft'
                ? 'Your reading has been stored as a Draft. You can edit and submit it for facilities review anytime.'
                : 'Your reading has been submitted for review. It will be verified by a facilities energy coordinator before final approval.'}
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(true);
            }}
            className="p-5 space-y-4 text-xs"
          >
            {/* Top Workflow Transparency Pill */}
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-950 flex items-start gap-2 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-emerald-900">Review Integrity:</strong> Submitted
                readings enter <span className="font-mono font-medium text-emerald-900">Pending Review</span> or{' '}
                <span className="font-mono font-medium text-amber-900">Flagged</span> status and require coordinator
                verification before final approval.
              </div>
            </div>

            {/* Date & Reporting Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reading Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={readingDate}
                  onChange={(e) => setReadingDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-hidden focus:border-emerald-600 font-mono text-xs ${
                    errors.readingDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.readingDate && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.readingDate}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reporting Period <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reportingPeriod}
                  onChange={(e) => setReportingPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600 text-xs"
                >
                  <option value="Oct 2026">Oct 2026 (Current MTD)</option>
                  <option value="Sep 2026">Sep 2026</option>
                  <option value="Aug 2026">Aug 2026</option>
                  <option value="Jul 2026">Jul 2026</option>
                  <option value="Nov 2026">Nov 2026 (Upcoming)</option>
                </select>
                {errors.reportingPeriod && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.reportingPeriod}</p>
                )}
              </div>
            </div>

            {/* Facility & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Campus Building <span className="text-rose-500">*</span>
                </label>
                <select
                  value={buildingId}
                  disabled={isDeptStaff}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600 text-xs ${
                    isDeptStaff ? 'bg-slate-100 cursor-not-allowed opacity-80' : ''
                  }`}
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                {isDeptStaff && (
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Scope restricted to assigned facility
                  </span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department / Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={departmentId}
                  disabled={isDeptStaff}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-hidden focus:border-emerald-600 text-xs ${
                    errors.department ? 'border-rose-400' : 'border-slate-300'
                  } ${isDeptStaff ? 'bg-slate-100 cursor-not-allowed opacity-80' : ''}`}
                >
                  {selectedBuilding?.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                {isDeptStaff && (
                  <span className="text-[10px] text-emerald-700 mt-0.5 block font-medium">
                    Locked to your verified department
                  </span>
                )}
              </div>
            </div>

            {/* Resource Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Resource Stream <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['electricity', 'water', 'paper'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleResourceTypeChange(type)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all capitalize ${
                      resourceType === type
                        ? type === 'electricity'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600/30'
                          : type === 'water'
                          ? 'bg-sky-50 border-sky-600 text-sky-950 ring-1 ring-sky-600/30'
                          : 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-600/30'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Value & Compatible Unit */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Entered Reading Value <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={rawValue}
                  onChange={(e) => setRawValue(e.target.value)}
                  placeholder={`e.g. ${
                    resourceType === 'electricity'
                      ? '56300'
                      : resourceType === 'water'
                      ? '480'
                      : '320'
                  }`}
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-xs focus:outline-hidden focus:border-emerald-600 ${
                    errors.value ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.value && <p className="text-[10px] text-rose-600 mt-1">{errors.value}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value as CompatibleUnit)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600 font-mono text-xs font-semibold text-slate-800"
                >
                  {COMPATIBLE_UNITS[resourceType].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Normalization Card */}
            {normalized !== null && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Standard Normalized Value:</span>
                </div>
                <div className="font-bold text-emerald-900 text-sm">
                  {normalized.normalizedValue.toLocaleString()} {normalized.normalizedUnit}
                  {selectedUnit !== normalized.normalizedUnit && (
                    <span className="text-[10px] font-normal text-slate-400 ml-1">
                      (from {numericVal} {selectedUnit})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Anomaly / Unusual Reading Warning (Does not reject) */}
            {anomalyCheck.isAnomalous && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-950">
                    High Consumption Observation Detected
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    {anomalyCheck.flagReason} This entry will be permitted but will automatically be flagged for facilities review.
                  </p>
                </div>
              </div>
            )}

            {/* Duplicate Entry Warning */}
            {duplicateEntry && (
              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-lg text-amber-950 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs">
                      Existing Reading Found for this Period
                    </div>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      {selectedDepartment?.name} already has a logged {resourceType} reading for{' '}
                      <strong>{reportingPeriod}</strong>: {duplicateEntry.originalValue.toLocaleString()}{' '}
                      {duplicateEntry.originalUnit} ({duplicateEntry.status}).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-amber-200 text-[11px]">
                  <input
                    type="checkbox"
                    id="allow-override"
                    checked={allowDuplicateOverride}
                    onChange={(e) => setAllowDuplicateOverride(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <label htmlFor="allow-override" className="cursor-pointer text-amber-950 font-medium">
                    I confirm this is an intentional revision / re-submission to be reviewed.
                  </label>
                </div>
              </div>
            )}

            {/* Data Source & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data Source</label>
                <select
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value as EntryDataSource)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600 text-xs"
                >
                  <option value="Manual Entry">Manual Entry</option>
                  <option value="Submeter Log">Submeter Log</option>
                  <option value="Utility Bill Log">Utility Bill Log</option>
                  <option value="Imported">Imported</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Entered By</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.role})`}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-medium text-xs truncate"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Observer Notes & Context (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log physical submeter serial, register readings, or equipment inspection findings..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                >
                  Submit for Review
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
