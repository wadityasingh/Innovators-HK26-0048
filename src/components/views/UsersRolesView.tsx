import React, { useState } from 'react';
import { Users, UserPlus, Shield, Check, Lock, Building, CheckCircle2 } from 'lucide-react';
import { CampusUser, UserProfile, UserRole } from '../../types';
import { DemoNotice } from '../common/DemoNotice';

interface UsersRolesViewProps {
  users: CampusUser[];
  currentUser: UserProfile;
  availableRoles: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onAddUser: (user: CampusUser) => void;
  onResetData: () => void;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  users,
  currentUser,
  availableRoles,
  onSelectUser,
  onAddUser,
  onResetData,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Department Energy Liaison');
  const [inviteBuilding, setInviteBuilding] = useState('Founders Administration Hall');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const rolePermissions: {
    role: UserRole;
    description: string;
    permissions: string[];
  }[] = [
    {
      role: 'Campus Sustainability Manager',
      description: 'Institutional leadership over campus targets, baseline configurations, and resource policy sign-off.',
      permissions: [
        'Review and approve conservation proposals',
        'Configure campus tariffs and area baselines',
        'Export verified resource datasets',
        'Manage campus access and user roles',
      ],
    },
    {
      role: 'Facilities Energy Coordinator',
      description: 'Operational coordinator for mechanical plant systems, utility submeters, and inspection walk-throughs.',
      permissions: [
        'Record manual department utility readings',
        'Acknowledge & investigate consumption exceptions',
        'File walkthrough inspection checklists',
        'Review equipment schedules & temperature logs',
      ],
    },
    {
      role: 'Student Green Council Representative',
      description: 'Student oversight over dining waste streams, residence hall recycling, and peer engagement initiatives.',
      permissions: [
        'Record solid waste scale weigh-in manifests',
        'Inspect dining compost and sorting bins',
        'Track paperless transition targets',
      ],
    },
    {
      role: 'Department Energy Liaison',
      description: 'Departmental representative coordinating local utility sheets, equipment shutoff, and internal audit reviews.',
      permissions: [
        'Submit monthly department utility logs',
        'Verify departmental paper consumption',
        'Participate in building walk-throughs',
      ],
    },
  ];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newUser: CampusUser = {
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      assignedScope: inviteBuilding,
      lastActive: 'Invited just now',
      status: 'Active',
    };

    onAddUser(newUser);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <DemoNotice onResetData={onResetData} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Institutional Stakeholders & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500">
            Enforces strict segregation of duties between operational maintenance, student advocates, and compliance auditors
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Campus Auditor</span>
        </button>
      </div>

      {/* Role Switcher Sandbox (Test Different Perspectives) */}
      <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Simulate User Perspective
              </h3>
            </div>
            <p className="text-xs text-emerald-900/90 mt-0.5">
              Click any profile to test portal workflows from that role's institutional vantage point
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200">
            Active: <strong>{currentUser.role}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {availableRoles.map((roleUser) => (
            <button
              key={roleUser.id}
              onClick={() => onSelectUser(roleUser)}
              className={`p-3 rounded-lg border text-left transition-all ${
                currentUser.id === roleUser.id
                  ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-50 flex items-center justify-center font-bold text-xs shrink-0">
                  {roleUser.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {roleUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 truncate">{roleUser.role}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Authorized Campus Operators ({users.length} Active Accounts)
        </h3>

        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Assigned Scope</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-emerald-800">{u.role}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">{u.email}</td>
                  <td className="py-3 px-3 text-slate-600">
                    {u.assignedScope}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">{u.lastActive}</td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Governance Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Institutional Permission Matrix by Role
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolePermissions.map((rp, i) => (
            <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-xs text-slate-900">{rp.role}</h4>
              </div>
              <p className="text-[11px] text-slate-500">{rp.description}</p>
              <div className="space-y-1 pt-1">
                {rp.permissions.map((p, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Invite Institutional Auditor</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {inviteSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Invitation Dispatched</h4>
                <p className="text-xs text-slate-500">
                  User added to campus access directory with requested permissions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Dr. Robert Vance, PE"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institutional Email (.edu)
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="r.vance@campus.edu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Campus Sustainability Manager">Campus Sustainability Manager</option>
                    <option value="Facilities Energy Coordinator">Facilities Energy Coordinator</option>
                    <option value="Student Green Council Representative">Student Green Council Representative</option>
                    <option value="Department Energy Liaison">Department Energy Liaison</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Facility Scope
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteBuilding}
                    onChange={(e) => setInviteBuilding(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                  >
                    Send Invitation
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
