import React, { useState } from 'react';
import {
  Settings,
  RefreshCw,
  Building,
  DollarSign,
  Leaf,
  Database,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { DemoNotice } from '../common/DemoNotice';

interface SettingsViewProps {
  onResetData: () => void;
  onRandomizeTelemetry: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetData,
  onRandomizeTelemetry,
}) => {
  const [saved, setSaved] = useState(false);

  // Editable configuration fields
  const [electricityTariff, setElectricityTariff] = useState('0.142');
  const [waterTariff, setWaterTariff] = useState('3.85');
  const [landfillTariff, setLandfillTariff] = useState('95.00');
  const [gridCarbonFactor, setGridCarbonFactor] = useState('0.385');
  const [campusSqFt, setCampusSqFt] = useState('913,000');
  const [fteStudents, setFteStudents] = useState('18,400');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Campus Operational Parameters & Utility Tariff Schedules
          </h2>
          <p className="text-xs text-slate-500">
            Configure institutional conversion coefficients, baseline floor areas, and demo simulation state
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRandomizeTelemetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Simulate Sensor Jitter</span>
          </button>
          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Campus Physical Baseline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Campus Physical Footprint Baseline</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Conditioned Gross Floor Area (Sq Ft)
              </label>
              <input
                type="text"
                value={campusSqFt}
                onChange={(e) => setCampusSqFt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
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
                value={fteStudents}
                onChange={(e) => setFteStudents(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
              />
              <span className="text-[10px] text-slate-400">
                Students, faculty, researchers, and operational staff
              </span>
            </div>
          </div>
        </div>

        {/* Utility Tariffs & Avoided Cost Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Utility Tariff Schedules & Emissions Multipliers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Electricity Blended Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.001"
                value={electricityTariff}
                onChange={(e) => setElectricityTariff(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Potable Water Tariff ($/kL)
              </label>
              <input
                type="number"
                step="0.01"
                value={waterTariff}
                onChange={(e) => setWaterTariff(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Landfill Surcharge ($/ton)
              </label>
              <input
                type="number"
                step="1"
                value={landfillTariff}
                onChange={(e) => setLandfillTariff(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Grid Carbon Factor (kg CO₂e/kWh)
              </label>
              <input
                type="number"
                step="0.001"
                value={gridCarbonFactor}
                onChange={(e) => setGridCarbonFactor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Demo Simulation Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Demo Simulation Environment Controls
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">
                  Simulate Live Telemetry Jitter
                </span>
                <p className="text-[11px] text-slate-500">
                  Adds ±3% micro-variance to submeter readings to test chart responsiveness
                </p>
              </div>
              <button
                type="button"
                onClick={onRandomizeTelemetry}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700"
              >
                Apply Jitter
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Reset Demo Data State</span>
                <p className="text-[11px] text-slate-500">
                  Restores default buildings, initial alerts, and conservation measures
                </p>
              </div>
              <button
                type="button"
                onClick={onResetData}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-medium"
              >
                Restore Factory Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration profiles saved successfully.</span>
            </div>
          )}
          {!saved && <div />}

          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
