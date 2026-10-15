import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  PlusCircle,
  Check,
  Search,
  MessageSquare,
} from 'lucide-react';
import { PriorityAlert, SeverityLevel } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface AlertsViewProps {
  alerts: PriorityAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string, notes?: string) => void;
  onAddAlert: (alert: PriorityAlert) => void;
  onResetData: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onAddAlert,
  onResetData,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unacknowledged' | 'active' | 'resolved'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New alert form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PriorityAlert['category']>('Electricity');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('warning');
  const [newBuilding, setNewBuilding] = useState('Franklin Science & Laboratory Center');
  const [newObserved, setNewObserved] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [newRootCause, setNewRootCause] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unacknowledged'
        ? !a.acknowledged
        : statusFilter === 'resolved'
        ? a.resolved
        : !a.resolved;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.building.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: PriorityAlert = {
      id: `alt-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      severity: newSeverity,
      building: newBuilding,
      timestamp: 'Just now',
      observedValue: newObserved || 'Above baseline',
      expectedValue: newExpected || 'Normal operational envelope',
      acknowledged: false,
      resolved: false,
      rootCause: newRootCause || 'Manual alert created by user testing workflow.',
    };

    onAddAlert(created);
    setShowCreateModal(false);
    setNewTitle('');
    setNewObserved('');
  };

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Header & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Real-Time Resource Anomalies & Threshold Breaches
          </h2>
          <p className="text-xs text-slate-500">
            Automated alerts triggered by out-of-schedule consumption, leak detection, or communication dropouts
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Configure Threshold Alert</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alert by keyword or building..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <span className="font-semibold text-slate-700 ml-1">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Informational</option>
          </select>

          <span className="font-semibold text-slate-700 ml-1">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="all">All ({alerts.length})</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="active">Active (Open)</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          {filteredAlerts.length} alert{filteredAlerts.length === 1 ? '' : 's'} displayed
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Alerts Match Selected Filters</h3>
            <p className="text-xs text-slate-500">
              Campus telemetry operating nominal within specified parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded-xl p-4 sm:p-5 shadow-2xs transition-all ${
                alert.resolved
                  ? 'border-slate-200 opacity-75'
                  : alert.severity === 'critical'
                  ? 'border-rose-300 bg-rose-50/20'
                  : alert.severity === 'warning'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    {alert.severity === 'critical' ? (
                      <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px] uppercase">
                        <AlertTriangle className="w-3 h-3" />
                        Critical Anomaly
                      </span>
                    ) : alert.severity === 'warning' ? (
                      <span className="flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase">
                        <AlertCircle className="w-3 h-3" />
                        Warning
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase">
                        <Info className="w-3 h-3" />
                        Telemetry Info
                      </span>
                    )}

                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-800">{alert.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{alert.building}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400 text-[11px] font-mono">{alert.timestamp}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400">Observed: </span>
                      <span className="font-semibold text-rose-700">{alert.observedValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Expected Envelope: </span>
                      <span className="text-slate-800">{alert.expectedValue}</span>
                    </div>
                    {alert.assignedTo && (
                      <div className="font-sans">
                        <span className="text-slate-400">Assigned: </span>
                        <span className="text-slate-700 font-medium">{alert.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  {alert.rootCause && (
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800 font-semibold">Root Cause / Action Note:</strong>{' '}
                        {alert.rootCause}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {!alert.resolved ? (
                      <button
                        onClick={() =>
                          onResolveAlert(
                            alert.id,
                            'Resolved by facilities maintenance; confirmed return to normal baseline load.'
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Threshold Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Define Operational Threshold Alert</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alert Rule Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Science Autoclave Chilled Water Overconsumption"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Electricity">Electricity</option>
                    <option value="Water">Water</option>
                    <option value="Waste">Waste</option>
                    <option value="Paper">Paper</option>
                    <option value="Sensor Hardware">Sensor Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Informational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility</label>
                <input
                  type="text"
                  required
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Observed Value</label>
                  <input
                    type="text"
                    required
                    value={newObserved}
                    onChange={(e) => setNewObserved(e.target.value)}
                    placeholder="e.g. 52 kW"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Limit</label>
                  <input
                    type="text"
                    required
                    value={newExpected}
                    onChange={(e) => setNewExpected(e.target.value)}
                    placeholder="e.g. < 20 kW"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Root Cause / Investigation
                </label>
                <textarea
                  rows={2}
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  placeholder="Equipment context or diagnostic notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
