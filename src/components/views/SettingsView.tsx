import React, { useState, useEffect } from 'react';
import {
  Settings,
  RefreshCw,
  Building,
  DollarSign,
  Leaf,
  Database,
  CheckCircle2,
  Sliders,
  Lock,
  Loader2,
  Building2,
} from 'lucide-react';
import { DemoNotice } from '../common/DemoNotice';
import { UserProfile } from '../../types';
import { CampusSettingsData } from '../../lib/firestoreService';

interface SettingsViewProps {
  currentUser?: UserProfile;
  appMode?: 'real' | 'demo';
  realSettings?: CampusSettingsData | null;
  buildingsCount?: number;
  onSaveRealSettings?: (settings: CampusSettingsData) => Promise<void>;
  onSeedBuildings?: () => Promise<void>;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  appMode = 'demo',
  realSettings,
  buildingsCount = 0,
  onSaveRealSettings,
  onSeedBuildings,
  onResetData,
}) => {
  const isAdmin = currentUser?.systemRole === 'Admin' || currentUser?.role.includes('Manager');

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Editable configuration fields
  const [campusName, setCampusName] = useState('GreenCampus University');
  const [electricityTariff, setElectricityTariff] = useState('0.142');
  const [waterTariff, setWaterTariff] = useState('3.85');
  const [landfillTariff, setLandfillTariff] = useState('95.00');
  const [gridCarbonFactor, setGridCarbonFactor] = useState('0.385');
  const [campusSqFt, setCampusSqFt] = useState('913,000');
  const [fteStudents, setFteStudents] = useState('18,400');

  // Sync from realSettings when available
  useEffect(() => {
    if (appMode === 'real' && realSettings) {
      if (realSettings.campusName) setCampusName(realSettings.campusName);
      if (realSettings.electricityTariff) setElectricityTariff(realSettings.electricityTariff);
      if (realSettings.waterTariff) setWaterTariff(realSettings.waterTariff);
      if (realSettings.landfillTariff) setLandfillTariff(realSettings.landfillTariff);
      if (realSettings.gridCarbonFactor) setGridCarbonFactor(realSettings.gridCarbonFactor);
      if (realSettings.conditionedSqFt) setCampusSqFt(realSettings.conditionedSqFt);
      if (realSettings.ftePopulation) setFteStudents(realSettings.ftePopulation);
    }
  }, [appMode, realSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (appMode === 'real') {
      if (!isAdmin) return;
      setIsSaving(true);
      try {
        if (onSaveRealSettings) {
          await onSaveRealSettings({
            campusName,
            conditionedSqFt: campusSqFt,
            ftePopulation: fteStudents,
            electricityTariff,
            waterTariff,
            landfillTariff,
            gridCarbonFactor,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Admin',
          });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        console.error('Failed to save settings:', err);
      } finally {
        setIsSaving(false);
      }
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSeedBuildings = async () => {
    if (!onSeedBuildings) return;
    setIsSeeding(true);
    try {
      await onSeedBuildings();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to seed catalog:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {appMode === 'demo' ? (
        <DemoNotice onResetData={onResetData} />
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-900">FIRESTORE SETTINGS:</span>{' '}
              <span>
                Campus baseline figures and utility conversion tariffs persist in Cloud Firestore collection <code className="font-mono bg-emerald-100/70 px-1 rounded">/settings/global</code>.
              </span>
            </div>
          </div>
          <div className="text-[11px] font-medium text-emerald-800">
            {isAdmin ? 'Admin Authorizations Active' : 'Read-Only Mode'}
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Campus Operational Parameters & Utility Tariff Schedules
          </h2>
          <p className="text-xs text-slate-500">
            Configure institutional conversion coefficients, baseline floor areas, and building hierarchies
          </p>
        </div>

        <div className="flex items-center gap-2">
          {appMode === 'demo' ? (
            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          ) : (
            isAdmin && (
              <button
                type="button"
                disabled={isSeeding}
                onClick={handleSeedBuildings}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                title="Populate standard campus buildings & departments into Firestore"
              >
                {isSeeding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>
                  {seedSuccess
                    ? 'Catalog Initialized!'
                    : `Sync Buildings Catalog (${buildingsCount} in Cloud)`}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Campus Physical Baseline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Campus Physical Footprint Baseline</h3>
            </div>
            {appMode === 'real' && !isAdmin && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Lock className="w-3 h-3" />
                <span>Admin Only</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Campus Institution Name
              </label>
              <input
                type="text"
                disabled={appMode === 'real' && !isAdmin}
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                  appMode === 'real' && !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Conditioned Gross Floor Area (Sq Ft)
              </label>
              <input
                type="text"
                disabled={appMode === 'real' && !isAdmin}
                value={campusSqFt}
                onChange={(e) => setCampusSqFt(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-hidden focus:border-emerald-600 ${
                  appMode === 'real' && !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Used to calculate EUI (Energy Use Intensity kBtu/sqft)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full-Time Equivalent (FTE) Campus Population
              </label>
              <input
                type="text"
                disabled={appMode === 'real' && !isAdmin}
                value={fteStudents}
                onChange={(e) => setFteStudents(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-hidden focus:border-emerald-600 ${
                  appMode === 'real' && !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Students, faculty, researchers, and operational staff
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Grid Carbon Intensity Factor (kg CO₂e per kWh)
              </label>
              <input
                type="text"
                disabled={appMode === 'real' && !isAdmin}
                value={gridCarbonFactor}
                onChange={(e) => setGridCarbonFactor(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-hidden focus:border-emerald-600 ${
                  appMode === 'real' && !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Regional electrical transmission emission coefficient
              </span>
            </div>
          </div>
        </div>

        {/* Utility Tariff Schedules */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Utility Billing Tariffs & Escalation</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Electricity Tariff ($ / kWh)
              </label>
              <input
                type="text"
                disabled={appMode === 'real' && !isAdmin}
                value={electricityTariff}
                onChange={(e) => setElectricityTariff(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-hidden focus:border-emerald-600 ${
                  appMode === 'real' && !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Blended commercial supply & distribution rate
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Municipal Water Tariff ($ / kL)
              </label>
              <input
                type="text"
                disabled={appMode === 'real' && !isAdmin}
                value={waterTariff}
                onChange={(e) => setWaterTariff(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-hidden focus:border-emerald-600 ${
                  appMode === 'real' && !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Combined domestic water and sewer effluent
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Landfill Tipping Fee ($ / Tonne)
              </label>
              <input
                type="text"
                disabled={appMode === 'real' && !isAdmin}
                value={landfillTariff}
                onChange={(e) => setLandfillTariff(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-hidden focus:border-emerald-600 ${
                  appMode === 'real' && !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Municipal solid waste disposal contract charge
              </span>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        {(appMode === 'demo' || isAdmin) && (
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-xs text-slate-500">
              {appMode === 'real'
                ? 'Changes are committed directly to Firestore database.'
                : 'Changes update session parameters.'}
            </div>

            <div className="flex items-center gap-3">
              {saved && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{appMode === 'real' ? 'Saved to Firestore!' : 'Parameters updated!'}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{appMode === 'real' ? 'Save Live Settings' : 'Apply Configuration'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
