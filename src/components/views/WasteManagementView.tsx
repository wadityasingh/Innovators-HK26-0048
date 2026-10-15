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
  const [weighInBuilding, setWeighInBuilding] = useState('Orchard Commons Dining Hub');
  const [weighInStream, setWeighInStream] = useState('waste-compost');
  const [weighInWeight, setWeighInWeight] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // Recent weigh-in manifest records
  const [manifests, setManifests] = useState([
    {
      id: 'MNF-801',
      date: 'Oct 14, 2026 09:30 AM',
      facility: 'Orchard Commons Dining Hub',
      stream: 'Compostable Food & Organics',
      weightKg: 840,
      hauler: 'Regional Composting Partner',
      disposition: 'Composted',
    },
    {
      id: 'MNF-802',
      date: 'Oct 13, 2026 03:15 PM',
      facility: 'Founders Administration Hall',
      stream: 'Clean Paper & Flattened Cardboard',
      weightKg: 320,
      hauler: 'Fiber Recovery Recycler',
      disposition: 'Recycled',
    },
    {
      id: 'MNF-803',
      date: 'Oct 12, 2026 08:45 AM',
      facility: 'Evergreen Residence Hall North',
      stream: 'Bottles, Cans & Rigid Containers',
      weightKg: 460,
      hauler: 'Clean Stream MRF',
      disposition: 'Recycled',
    },
    {
      id: 'MNF-804',
      date: 'Oct 11, 2026 01:20 PM',
      facility: 'Franklin Science Center',
      stream: 'Municipal Landfill Waste',
      weightKg: 910,
      hauler: 'Municipal Waste Services',
      disposition: 'Landfill',
    },
  ]);

  const totalKg = wasteCategories.reduce((sum, c) => sum + c.weightKg, 0);
  const divertedKg = wasteCategories
    .filter((c) => c.isDiverted)
    .reduce((sum, c) => sum + c.weightKg, 0);
  const diversionRate = totalKg > 0 ? (divertedKg / totalKg) * 100 : 0;

  const handleSaveWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(weighInWeight);
    if (isNaN(kg) || kg <= 0) return;

    const streamObj = wasteCategories.find((c) => c.id === weighInStream);
    const newManifest = {
      id: `MNF-${Math.floor(Math.random() * 800 + 810)}`,
      date: 'Just now',
      facility: weighInBuilding,
      stream: streamObj?.name || 'Solid Waste',
      weightKg: kg,
      hauler: streamObj?.collectionPoint || 'Contracted Hauler',
      disposition: streamObj?.isDiverted ? 'Diverted' : 'Landfill',
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
            Solid Waste Stream Management & Diversion Tracking
          </h2>
          <p className="text-xs text-slate-500">
            Monitor weighed waste streams (kg), compostable organics, clean paper, and landfill totals
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <Scale className="w-4 h-4" />
          <span>Record Waste Weigh-In (kg)</span>
        </button>
      </div>

      {/* Interactive Waste Composition & Stream Breakdown */}
      <WasteCompositionChart categories={wasteCategories} />

      {/* Waste Audit & Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Compostable Food & Organics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            13,800 kg
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pre-consumer dining preparation scraps diverted to regional composting site
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Current Diversion Progress</span>
            <Trash2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900 tabular-nums">
            {diversionRate.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {divertedKg.toLocaleString()} kg diverted of {totalKg.toLocaleString()} kg total
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Landfill Tipping Fee Surcharge Avoided</span>
            <Scale className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900 tabular-nums">
            ${Math.round((divertedKg / 1000) * 95).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated at campus rate of $95 / ton municipal landfill surcharge avoided MTD
          </p>
        </div>
      </div>

      {/* Recent Scale Ticket Manifests */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Campus Hauling Scale Tickets
            </h3>
            <p className="text-xs text-slate-500">
              Internal log of waste scale tickets and hauling weight receipts
            </p>
          </div>
          <Truck className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Waste Stream</th>
                <th className="py-2.5 px-3">Weight (kg)</th>
                <th className="py-2.5 px-3">Collection Partner</th>
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
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        m.disposition === 'Landfill' ? 'text-slate-600' : 'text-emerald-700'
                      }`}
                    >
                      {m.disposition}
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
              <h3 className="text-sm font-bold text-slate-900">Record Waste Weigh-In (kg)</h3>
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
                <p className="text-xs text-slate-500">Added to campus solid waste tracking ledger.</p>
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
                    <option value="Orchard Commons Dining Hub">Orchard Commons Dining Hub</option>
                    <option value="Evergreen Residence Hall North">Evergreen Residence Hall North</option>
                    <option value="Franklin Science Center">Franklin Science Center</option>
                    <option value="Turing Engineering Hall">Turing Engineering Hall</option>
                    <option value="Founders Administration Hall">Founders Administration Hall</option>
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
