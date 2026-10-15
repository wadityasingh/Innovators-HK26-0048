import React, { useState } from 'react';
import {
  ClipboardCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Filter,
} from 'lucide-react';
import { AuditRecord, UserProfile } from '../../types';
import { DemoNotice } from '../common/DemoNotice';
import { ShieldAlert, Lock } from 'lucide-react';

interface AuditHistoryViewProps {
  audits: AuditRecord[];
  currentUser?: UserProfile;
  appMode?: 'real' | 'demo';
  onOpenLogAudit: () => void;
  onResetData: () => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({
  audits,
  currentUser,
  appMode,
  onOpenLogAudit,
  onResetData,
}) => {
  const isDeptStaff = appMode === 'real' && currentUser?.systemRole === 'Department Staff';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);

  if (isDeptStaff) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Audit Records Restricted
          </h2>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Campus walkthrough inspection logs and confidential audit compliance ratings are restricted to 
            <span className="font-semibold text-slate-900"> Sustainability Coordinators</span> and 
            <span className="font-semibold text-slate-900"> Campus Administrators</span> under institutional governance.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Department Staff Access Scope</span>
            </div>
            <p className="text-[11px]">
              You can log, review, and adjust resource meter readings for your assigned department in 
              <span className="font-medium text-emerald-800"> Resource Monitoring</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredAudits = audits.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.auditNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Campus Audit & Inspection Logbook
          </h2>
          <p className="text-xs text-slate-500">
            Internal repository of walkthrough inspections, department utility log reviews, and waste sort observations
          </p>
        </div>

        <button
          onClick={onOpenLogAudit}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Walkthrough Audit</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit ID, title, facility..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-56 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <span className="font-semibold text-slate-700 ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Audits ({audits.length})</option>
            <option value="Reviewed & Filed">Reviewed & Filed</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Internal Draft">Internal Draft</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          {filteredAudits.length} record{filteredAudits.length === 1 ? '' : 's'} listed
        </div>
      </div>

      {/* Audits Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Audit Reference</th>
                <th className="py-2.5 px-3">Inspection Subject</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Methodology</th>
                <th className="py-2.5 px-3">Reviewer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Internal Rating</th>
                <th className="py-2.5 px-3">Unresolved Items</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredAudits.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedAudit(a)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono font-medium text-slate-700">
                    {a.auditNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{a.title}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{a.scope}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{a.building}</td>
                  <td className="py-3 px-3 text-slate-500">{a.inspectionType}</td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]">
                    {a.auditorName}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{a.auditDate}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {a.internalRating}%
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {a.unresolvedItemsCount > 0 ? (
                      <span className="text-amber-800 font-semibold">
                        {a.unresolvedItemsCount} open
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Clear</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        a.status === 'Reviewed & Filed'
                          ? 'text-emerald-700'
                          : 'text-amber-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
              <div>
                <span className="font-mono text-[11px] text-slate-500">
                  {selectedAudit.auditNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{selectedAudit.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500">Facility / Location</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedAudit.building}</div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500">Internal Rating</div>
                  <div className="font-mono font-bold text-sm text-slate-900 mt-0.5">
                    {selectedAudit.internalRating}%
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-700 mb-1">Inspection Scope & Protocol</div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  {selectedAudit.scope}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-700 mb-1">Lead Reviewer Findings</div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                  {selectedAudit.notes}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Reviewer: <strong>{selectedAudit.auditorName}</strong></span>
                <span>Date: {selectedAudit.auditDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-1.5 font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
