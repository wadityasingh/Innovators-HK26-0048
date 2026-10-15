import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Check,
  Lock,
  Building,
  CheckCircle2,
  Database,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { CampusUser, UserProfile, UserRole, SystemRole } from '../../types';
import { UserDocData } from '../../lib/firestoreService';
import { DemoNotice } from '../common/DemoNotice';

interface UsersRolesViewProps {
  users: CampusUser[];
  realUsers?: UserDocData[];
  currentUser: UserProfile;
  availableRoles: UserProfile[];
  appMode?: 'real' | 'demo';
  onSelectUser: (user: UserProfile) => void;
  onAddUser: (user: CampusUser) => void;
  onUpdateRealUserRole?: (
    uid: string,
    newRole: SystemRole,
    deptId?: string,
    deptName?: string
  ) => Promise<void>;
  onResetData: () => void;
}

const DEPARTMENTS = [
  { id: 'dept-facilities', name: 'Facilities & Mechanical Operations', building: 'Founders Administration Hall' },
  { id: 'dept-bio', name: 'Biological Sciences & Genomics', building: 'BioSciences Research Pavilion' },
  { id: 'dept-eng', name: 'Computer Science & Engineering', building: 'Science & Engineering Complex' },
  { id: 'dept-dining', name: 'Dining Hall & Food Services', building: 'University Dining & Student Hub' },
  { id: 'dept-residence', name: 'Residential Life & Housing', building: 'Alder Student Residences' },
  { id: 'dept-library', name: 'Campus Library & Digital Learning', building: 'Memorial Academic Library' },
];

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  users,
  realUsers = [],
  currentUser,
  availableRoles,
  appMode = 'demo',
  onSelectUser,
  onAddUser,
  onUpdateRealUserRole,
  onResetData,
}) => {
  const isAdmin = currentUser.systemRole === 'Admin' || currentUser.role.includes('Manager');

  // Real Mode Edit State for Admin
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<SystemRole>('Department Staff');
  const [editDeptId, setEditDeptId] = useState<string>('dept-facilities');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Demo Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Department Energy Liaison');
  const [inviteBuilding, setInviteBuilding] = useState('Founders Administration Hall');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const rolePermissions: {
    role: string;
    description: string;
    permissions: string[];
  }[] = [
    {
      role: 'Admin',
      description: 'Campus executive authority over users, permissions, campus physical parameters, and global settings.',
      permissions: [
        'Manage campus users and assign roles',
        'Configure utility tariffs and carbon baselines',
        'Review, flag, and approve all campus resource readings',
        'Access confidential compliance audit logbook',
      ],
    },
    {
      role: 'Sustainability Coordinator',
      description: 'Operational coordinator overseeing campus-wide sustainability performance, reports, and review sign-offs.',
      permissions: [
        'Review and approve submitted departmental readings',
        'Flag anomalous consumption records with audit reasons',
        'Manage sustainability targets and solid waste streams',
        'Access and file walkthrough inspection records',
      ],
    },
    {
      role: 'Department Staff',
      description: 'Assigned facility representative recording monthly meter logs for their specific department only.',
      permissions: [
        'Log meter readings for assigned department',
        'Save drafts and submit readings for review',
        'Correct flagged readings with transparent reason trail',
        'View departmental consumption performance',
      ],
    },
  ];

  const handleStartEdit = (u: UserDocData) => {
    setEditingUid(u.uid);
    setEditRole(u.role);
    setEditDeptId(u.departmentId || 'dept-facilities');
  };

  const handleSaveRole = async (uid: string) => {
    if (!onUpdateRealUserRole) return;
    setIsUpdating(true);
    try {
      const selectedDept = DEPARTMENTS.find((d) => d.id === editDeptId);
      await onUpdateRealUserRole(uid, editRole, editDeptId, selectedDept?.name);
      setUpdateSuccess(uid);
      setEditingUid(null);
      setTimeout(() => setUpdateSuccess(null), 2500);
    } catch (err) {
      console.error('Error saving role:', err);
    } finally {
      setIsUpdating(false);
    }
  };

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
      {appMode === 'demo' ? (
        <DemoNotice onResetData={onResetData} />
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-900">LIVE FIRESTORE RBAC DIRECTORY:</span>{' '}
              <span>
                User accounts, roles, and department assignments are synchronized directly with Cloud Firestore.
              </span>
            </div>
          </div>
          <div className="text-[11px] font-medium text-emerald-800">
            {realUsers.length} Registered User(s)
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Institutional Stakeholders & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500">
            Enforces strict segregation of duties between operational staff, coordinators, and administrators
          </p>
        </div>

        {appMode === 'demo' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Campus Stakeholder (Demo)</span>
          </button>
        )}
      </div>

      {/* RBAC Rules Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rolePermissions.map((rp) => (
          <div
            key={rp.role}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{rp.role}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">{rp.description}</p>
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Authorized Capabilities
                </div>
                {rp.permissions.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight text-[11px]">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real Firestore Users Table (if in Real Mode) */}
      {appMode === 'real' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Verified Cloud Firestore User Accounts
              </h3>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'As an Administrator, you can promote users and manage assigned department scopes.'
                  : 'Role administration is restricted to Campus Administrators. Directory displayed in read-only mode.'}
              </p>
            </div>
            {!isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Read-Only</span>
              </span>
            )}
          </div>

          {realUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <p>No other registered users in Firestore database yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                New accounts appear here once campus members register or log in.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Campus Member</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Department Scope</th>
                    <th className="py-2.5 px-3">Last Updated</th>
                    {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {realUsers.map((u) => {
                    const isEditing = editingUid === u.uid;
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                              {(u.displayName || u.email || 'CU').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {u.displayName || 'Campus User'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                UID: {u.uid.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-700 font-mono text-[11px]">
                          {u.email}
                        </td>

                        <td className="py-3 px-3">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as SystemRole)}
                              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                            >
                              <option value="Department Staff">Department Staff</option>
                              <option value="Sustainability Coordinator">
                                Sustainability Coordinator
                              </option>
                              <option value="Admin">Admin</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.role === 'Admin'
                                  ? 'bg-purple-100 text-purple-900'
                                  : u.role === 'Sustainability Coordinator'
                                  ? 'bg-sky-100 text-sky-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              <Shield className="w-2.5 h-2.5" />
                              <span>{u.role}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {isEditing ? (
                            <select
                              value={editDeptId}
                              onChange={(e) => setEditDeptId(e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white truncate max-w-xs"
                            >
                              {DEPARTMENTS.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-700 font-medium">
                              {u.departmentName || 'Campus Administration'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(u.updatedAt || u.createdAt).toLocaleDateString()}
                        </td>

                        {isAdmin && (
                          <td className="py-3 px-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingUid(null)}
                                  className="px-2 py-1 text-slate-600 hover:text-slate-800 text-[11px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleSaveRole(u.uid)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-semibold"
                                >
                                  {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
                                  <span>Save</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(u)}
                                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold"
                              >
                                Modify Role
                              </button>
                            )}
                            {updateSuccess === u.uid && (
                              <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                                Saved to Firestore!
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Demo Users Table (if in Demo Mode) */}
      {appMode === 'demo' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Synthetic Stakeholder Directory (Demo State)
              </h3>
              <p className="text-xs text-slate-500">
                Sample staff members configured for offline role perspective preview
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Stakeholder</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Institutional Role</th>
                  <th className="py-2.5 px-3">Assigned Facility Scope</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Perspective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.lastActive}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-emerald-900">{u.role}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{u.assignedScope}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {currentUser.id === u.id ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold text-[11px]">
                          <Check className="w-3 h-3" />
                          <span>Active Role</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const found = availableRoles.find((r) => r.id === u.id);
                            if (found) onSelectUser(found);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                        >
                          View As
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demo Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Invite Campus Stakeholder (Demo)</h3>
            <p className="text-xs text-slate-500">
              Add a synthetic stakeholder profile to preview simulated access delegation
            </p>
            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Prof. Marcus Vance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="marcus.vance@university.edu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Campus Sustainability Manager">Campus Sustainability Manager</option>
                  <option value="Facilities Energy Coordinator">Facilities Energy Coordinator</option>
                  <option value="Student Green Council Representative">
                    Student Green Council Representative
                  </option>
                  <option value="Department Energy Liaison">Department Energy Liaison</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  {inviteSuccess ? 'Added!' : 'Add Stakeholder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
