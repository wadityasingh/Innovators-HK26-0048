import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  FileText,
  AlertTriangle,
  PlusCircle,
  Wifi,
  WifiOff,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { BuildingData, ResourceType } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface ResourceMonitoringViewProps {
  buildings: BuildingData[];
  onOpenLogMeter: () => void;
  onResetData: () => void;
}

export const ResourceMonitoringView: React.FC<ResourceMonitoringViewProps> = ({
  buildings,
  onOpenLogMeter,
  onResetData,
}) => {
  const [selectedStream, setSelectedStream] = useState<ResourceType>('electricity');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 24-hour diurnal simulation curve (kW load or L/min or pages)
  const diurnalHours = [
    { hour: '00:00', load: 120, baseline: 110 },
    { hour: '02:00', load: 115, baseline: 110 },
    { hour: '04:00', load: 118, baseline: 110 },
    { hour: '06:00', load: 165, baseline: 140 },
    { hour: '08:00', load: 310, baseline: 290 },
    { hour: '10:00', load: 445, baseline: 410 },
    { hour: '12:00', load: 485, baseline: 440 }, // Peak lunch / solar hours
    { hour: '14:00', load: 460, baseline: 430 },
    { hour: '16:00', load: 410, baseline: 390 },
    { hour: '18:00', load: 320, baseline: 300 },
    { hour: '20:00', load: 240, baseline: 210 },
    { hour: '22:00', load: 160, baseline: 140 },
  ];

  const maxDiurnal = Math.max(...diurnalHours.map((d) => d.load)) * 1.15;

  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Stream Switcher & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        {/* Stream tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setSelectedStream('electricity')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              selectedStream === 'electricity'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Electricity (kWh)</span>
          </button>
          <button
            onClick={() => setSelectedStream('water')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              selectedStream === 'water'
                ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>Potable Water (kL)</span>
          </button>
          <button
            onClick={() => setSelectedStream('paper')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              selectedStream === 'paper'
                ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Paper Usage (Reams)</span>
          </button>
        </div>

        <button
          onClick={onOpenLogMeter}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Manual Sub-Meter</span>
        </button>
      </div>

      {/* 24-Hour Diurnal Demand Curve */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Campus 24-Hour Diurnal Profile · Real-Time Basal vs. Peak Load
            </h3>
            <p className="text-xs text-slate-500">
              Interval metering captures overnight vampire draw and afternoon thermal/air conditioning peaks
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Current Measured Demand: </span>
            <span className="font-mono text-sm font-bold text-emerald-800">460 kW</span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative h-56 w-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
            {/* Grid */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const y = 150 - pct * 120;
              return (
                <line
                  key={idx}
                  x1="30"
                  y1={y}
                  x2="590"
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Baseline threshold line */}
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              points={diurnalHours
                .map((d, i) => `${45 + i * 48},${150 - (d.baseline / maxDiurnal) * 120}`)
                .join(' ')}
            />

            {/* Active load polyline */}
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              points={diurnalHours
                .map((d, i) => `${45 + i * 48},${150 - (d.load / maxDiurnal) * 120}`)
                .join(' ')}
            />

            {/* Data points */}
            {diurnalHours.map((d, i) => {
              const cx = 45 + i * 48;
              const cy = 150 - (d.load / maxDiurnal) * 120;
              return (
                <g key={d.hour}>
                  <circle cx={cx} cy={cy} r="3.5" fill="#059669" className="hover:r-5 transition-all" />
                  <text
                    x={cx}
                    y="170"
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {d.hour}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
              <span>Actual Load Curve</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed inline-block" />
              <span>Expected Baseline Model</span>
            </span>
          </div>
          <span className="text-[11px] font-mono">Sampling interval: 15-minute pulsed digital integration</span>
        </div>
      </div>

      {/* Honest Data Completeness / Missing Sensors Alert Card */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 text-xs text-amber-950">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">
              Sensor Health & Missing Telemetry Disclosures
            </h4>
            <div className="text-[11px] text-amber-900/90 leading-relaxed">
              <span className="font-semibold">Cascades Hall (Residence South):</span> Analog rotary meter; lacks digital pulse transceiver. Consumption is logged manually on the 1st of each month.
              <br />
              <span className="font-semibold">Carnegie Central Library:</span> Sub-meter gateway intermittent since Oct 11. Current readings are linearly interpolated from historical 2025 seasonal baseline.
            </div>
          </div>
        </div>
      </div>

      {/* Building Sub-Meter Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Sub-Metered Facility Ledger ({filteredBuildings.length} Facilities)
            </h3>
            <p className="text-xs text-slate-500">
              Per-facility breakdown of electricity, water, and paper flows
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search facility name or code..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48 sm:w-60 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Research / Labs">Research / Labs</option>
              <option value="Residential">Residential</option>
              <option value="Athletics & Dining">Athletics & Dining</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Facility Code</th>
                <th className="py-2.5 px-3">Building Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Gross Area</th>
                <th className="py-2.5 px-3">Electricity (kWh)</th>
                <th className="py-2.5 px-3">Water (kL)</th>
                <th className="py-2.5 px-3">Paper (Reams)</th>
                <th className="py-2.5 px-3">Telemetry State</th>
                <th className="py-2.5 px-3">Last Polled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredBuildings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-800">{b.code}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{b.name}</div>
                    {b.anomalyDetected && (
                      <span className="text-[10px] text-rose-700 font-medium">
                        Operational anomaly active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{b.category}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {b.grossAreaSqFt.toLocaleString()} sqft
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-800 tabular-nums">
                    {b.electricityKwh.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-sky-800 tabular-nums">
                    {b.waterKL.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-800 tabular-nums">
                    {b.paperReams.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    {b.meterStatus === 'online' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <Wifi className="w-3 h-3 text-emerald-600" />
                        <span>Online (Pulsed IoT)</span>
                      </span>
                    ) : b.meterStatus === 'intermittent' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                        <WifiOff className="w-3 h-3 text-amber-600" />
                        <span>Intermittent (Estimated)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Manual Logged</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {b.lastReading}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
