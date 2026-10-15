import React, { useState } from 'react';
import { Trash2, PlusCircle, AlertCircle, CheckCircle2, Truck, Scale } from 'lucide-react';
import { WasteCategory } from '../../types';
import { WasteCompositionChart } from '../charts/WasteCompositionChart';
import { DemoNotice } from '../common/DemoNotice';

interface WasteManagementViewProps {
  wasteCategories: WasteCategory[];
  onResetData: () => void;
}

export const WasteManagementView: React.FC<WasteManagementViewProps> = ({
  wasteCategories,
  onResetData,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [weighInBuilding, setWeighInBuilding] = useState('Orchard Commons Dining');
  const [weighInStream, setWeighInStream] = useState('waste-compost');
  const [weighInWeight, setWeighInWeight] = useState('');
  const [contaminationPct, setContaminationPct] = useState('3.2');
  const [logSuccess, setLogSuccess] = useState(false);

  // Recent weigh-in manifest records
  const [manifests, setManifests] = useState([
    {
      id: 'mnf-801',
      date: 'Oct 14, 2026 09:30 AM',
      facility: 'Orchard Commons Dining',
      stream: 'Compostable & Food Scraps',
      weightKg: 840,
      hauler: 'Valley Organics Regional',
      contamination: '4.1%',
      status: 'Accepted',
    },
    {
      id: 'mnf-802',
      date: 'Oct 13, 2026 03:15 PM',
      facility: 'Founders Admin & Registrar',
      stream: 'Clean Cardboard & Paper',
      weightKg: 320,
      hauler: 'Mid-State Fiber Recovery',
      contamination: '1.2%',
      status: 'Accepted',
    },
    {
      id: 'mnf-803',
      date: 'Oct 13, 2026 11:00 AM',
      facility: 'Franklin Science Labs',
      stream: 'E-Waste & Lab Hazardous',
      weightKg: 195,
      hauler: 'CleanHarbors HazMat Depot',
      contamination: '0.0%',
      status: 'Certified Manifest',
    },
    {
      id: 'mnf-804',
      date: 'Oct 12, 2026 08:45 AM',
      facility: 'Evergreen Commons Res Hall',
      stream: 'Bottles, Cans & Rigid Plastics',
      weightKg: 460,
      hauler: 'County Clean Stream MRF',
      contamination: '8.4%',
      status: 'Warning Flag',
    },
  ]);

  const handleSaveWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(weighInWeight);
    if (isNaN(kg) || kg <= 0) return;

    const streamObj = wasteCategories.find((c) => c.id === weighInStream);
    const newManifest = {
      id: `mnf-${Date.now()}`,
      date: 'Just now',
      facility: weighInBuilding,
      stream: streamObj?.name || 'Solid Waste',
      weightKg: kg,
      hauler: streamObj?.handlingFacility || 'Certified Hauler',
      contamination: `${contaminationPct}%`,
      status: parseFloat(contaminationPct) > 5 ? 'Warning Flag' : 'Accepted',
    };

    setManifests([newManifest, ...manifests]);
    setLogSuccess(true);
    setTimeout(() => {
      setLogSuccess(false);
      setShowLogModal(false);
      setWeighInWeight('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Banner & Quick Weigh-In Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Solid Waste Stream Analytics & Diversion Control
          </h2>
          <p className="text-xs text-slate-500">
            Track haulage scale tickets, organics composting, and contaminated recycling streams
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <Scale className="w-4 h-4" />
          <span>Log Dumpster Scale Weigh-In</span>
        </button>
      </div>

      {/* Interactive Waste Composition & Stream Breakdown */}
      <WasteCompositionChart categories={wasteCategories} />

      {/* Waste Audit & Contamination Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Dining Food Waste Composting</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">17.4 tons</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pre-consumer scullery food scraps diverted to regional anaerobic digester
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Average Contamination Rate</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-900 tabular-nums">6.2%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Res Hall North flagged for unrinsed food containers in rigid plastic bin
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Landfill Tipping Fee Avoidance</span>
            <Trash2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900 tabular-nums">$3,180</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated at $95/ton municipal landfill tipping surcharge avoided MTD
          </p>
        </div>
      </div>

      {/* Recent Scale Ticket Manifests */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Waste Hauling Scale Tickets & Manifests
            </h3>
            <p className="text-xs text-slate-500">
              Verified weight slips from contracted municipal and specialty recyclers
            </p>
          </div>
          <Truck className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Building / Location</th>
                <th className="py-2.5 px-3">Waste Stream</th>
                <th className="py-2.5 px-3">Weight (kg)</th>
                <th className="py-2.5 px-3">Contracted Hauler</th>
                <th className="py-2.5 px-3">Contamination</th>
                <th className="py-2.5 px-3">Disposition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {manifests.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{m.id}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{m.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{m.facility}</td>
                  <td className="py-2.5 px-3 text-slate-700">{m.stream}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {m.weightKg.toLocaleString()} kg
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{m.hauler}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{m.contamination}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        m.status === 'Warning Flag' ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Weigh-In Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Record Waste Dumpster Weigh-In</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {logSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Weigh-In Ticket Recorded</h4>
                <p className="text-xs text-slate-500">Added to campus solid waste diversion ledger.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveWeighIn} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pickup Location / Facility
                  </label>
                  <select
                    value={weighInBuilding}
                    onChange={(e) => setWeighInBuilding(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Orchard Commons Dining">Orchard Commons Dining</option>
                    <option value="Evergreen Commons (Res North)">Evergreen Commons (Res North)</option>
                    <option value="Franklin Science Labs">Franklin Science Labs</option>
                    <option value="Turing Hall (Engineering)">Turing Hall (Engineering)</option>
                    <option value="Founders Admin">Founders Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waste Stream</label>
                  <select
                    value={weighInStream}
                    onChange={(e) => setWeighInStream(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {wasteCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Net Weight (kg)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={weighInWeight}
                    onChange={(e) => setWeighInWeight(e.target.value)}
                    placeholder="e.g. 750"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimated Contamination (% by volume)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={contaminationPct}
                    onChange={(e) => setContaminationPct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                  >
                    Save Weigh-In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
