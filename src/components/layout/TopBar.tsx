import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  Menu,
  Shield,
  Building2,
  Calendar,
  AlertTriangle,
  Info,
  LogIn,
  LogOut,
  Database,
  Sparkles,
} from 'lucide-react';
import { TabType, TimeRange, UserProfile, PriorityAlert } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  activeTab: TabType;
  onOpenMobileMenu: () => void;
  currentUser: UserProfile;
  availableRoles: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  selectedTimeRange: TimeRange;
  onChangeTimeRange: (range: TimeRange) => void;
  alerts: PriorityAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onNavigateToTab: (tab: TabType) => void;
  onOpenAuthModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobileMenu,
  currentUser,
  availableRoles,
  onSelectUser,
  selectedTimeRange,
  onChangeTimeRange,
  alerts,
  onAcknowledgeAlert,
  onNavigateToTab,
  onOpenAuthModal,
}) => {
  const {
    firebaseUser,
    authUser,
    appMode,
    setAppMode,
    logout,
    firestoreConnected,
  } = useAuth();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  const getPageTitle = (tab: TabType): { title: string; subtitle: string } => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Campus Sustainability Dashboard',
          subtitle: 'Campus, building, and department level resource consumption & data completeness',
        };
      case 'resources':
        return {
          title: 'Campus & Department Resource Monitoring',
          subtitle: 'Electricity (kWh), water (Litres), and paper (sheets) by building & department',
        };
      case 'waste':
        return {
          title: 'Solid Waste & Diversion Management',
          subtitle: 'Waste streams (kg), compostable organics, clean paper, containers & landfill',
        };
      case 'recommendations':
        return {
          title: 'Conservation Recommendations (Draft Proposals)',
          subtitle: 'Estimated savings and draft initiatives subject to facilities review',
        };
      case 'alerts':
        return {
          title: 'Consumption Alerts & Log Exceptions',
          subtitle: 'Exceptions, elevated consumption flags, and missing department reports',
        };
      case 'reports':
        return {
          title: 'Internal Resource & Audit Summary Reports',
          subtitle: 'Departmental summaries and draft ESG reporting templates',
        };
      case 'targets':
        return {
          title: 'Campus Sustainability Targets',
          subtitle: 'Institutional targets for electricity, water, paper, and waste reduction',
        };
      case 'users':
        return {
          title: 'Users & Role Responsibilities',
          subtitle: 'Campus sustainability stakeholders, facilities coordinators, and reviewers',
        };
      case 'audits':
        return {
          title: 'Campus Audit & Inspection Logbook',
          subtitle: 'Internal walkthrough observation records and department utility log reviews',
        };
      case 'settings':
        return {
          title: 'Portal Parameters & Configuration',
          subtitle: 'Campus floor area, population figures, utility tariffs & demo state',
        };
    }
  };

  const { title } = getPageTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Campus Label, Mode Badge & Date Filter */}
        <div className="hidden md:flex items-center gap-2">
          {/* Mode Badge & Switcher */}
          <div className="flex items-center">
            {appMode === 'real' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <Database className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Live Firestore</span>
                <button
                  onClick={() => setAppMode('demo')}
                  className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-white border border-emerald-300 rounded text-emerald-800 hover:bg-emerald-100 font-medium transition-colors"
                  title="Switch to synthetic demo dataset"
                >
                  View Demo
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Synthetic Demo</span>
                {firebaseUser ? (
                  <button
                    onClick={() => setAppMode('real')}
                    className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800 transition-colors"
                  >
                    Return to Real Data
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-slate-800 text-white rounded font-medium hover:bg-slate-900 transition-colors"
                  >
                    Log In
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fixed Single Campus Scope */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="font-semibold text-slate-900">GreenCampus University</span>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedTimeRange}
              onChange={(e) => onChangeTimeRange(e.target.value as TimeRange)}
              className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days (Oct 2026)</option>
              <option value="90d">Last 90 Days (Q3)</option>
              <option value="ytd">Year to Date (2026)</option>
            </select>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Notification Popover */}
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    Active Exceptions ({unreadAlerts.length} unacknowledged)
                  </span>
                  <button
                    onClick={() => {
                      setShowNotificationMenu(false);
                      onNavigateToTab('alerts');
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium"
                  >
                    View All Alerts
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-2.5 rounded-lg border text-xs transition-colors ${
                        alert.acknowledged
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : alert.severity === 'critical'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : 'bg-amber-50/70 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold">
                          {alert.severity === 'critical' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span className="truncate">{alert.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {alert.timestamp}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600 line-clamp-1">
                        {alert.building} {alert.department ? `· ${alert.department}` : ''}
                      </div>
                      {!alert.acknowledged && (
                        <div className="mt-2 flex items-center justify-end">
                          <button
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Acknowledge</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile & Auth / Demo Switcher */}
          {firebaseUser && authUser ? (
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                    <span>{authUser.displayName || authUser.email}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    <span>{authUser.role}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Authenticated User Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 text-xs">
                  <div className="pb-2.5 border-b border-slate-100 mb-2">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                      Authenticated Profile
                    </div>
                    <div className="font-semibold text-slate-900 truncate mt-0.5">
                      {authUser.displayName || authUser.email}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{authUser.email}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        {authUser.role}
                      </span>
                      {authUser.departmentName && (
                        <span className="text-[10px] text-slate-500 truncate">
                          · {authUser.departmentName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mode Toggle inside menu */}
                  <div className="py-2 border-b border-slate-100 mb-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Data Scope
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 block">
                          {appMode === 'real' ? 'Live Firestore Data' : 'Synthetic Demo Dataset'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {appMode === 'real'
                            ? 'Operations persist to cloud database'
                            : 'Using browser local demo state'}
                        </span>
                      </div>
                      <button
                        onClick={() => setAppMode(appMode === 'real' ? 'demo' : 'real')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                          appMode === 'real'
                            ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                            : 'bg-emerald-800 text-white hover:bg-emerald-900'
                        }`}
                      >
                        {appMode === 'real' ? 'Use Demo' : 'Use Real'}
                      </button>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={async () => {
                      setShowRoleMenu(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              {/* Demo Role Switcher button */}
              <div className="relative" ref={roleMenuRef}>
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  title="Simulate different user perspectives in Demo mode"
                >
                  <Shield className="w-3 h-3 text-slate-500" />
                  <span className="hidden sm:inline">Role View: {currentUser.role.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 text-xs">
                    <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                      <div className="text-slate-500 text-[10px] uppercase font-bold">
                        Demo Simulation Perspectives
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Preview how permissions and filters change by role
                      </div>
                    </div>
                    <div className="space-y-1">
                      {availableRoles.map((roleUser) => (
                        <button
                          key={roleUser.id}
                          onClick={() => {
                            onSelectUser(roleUser);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                            currentUser.id === roleUser.id
                              ? 'bg-emerald-50 text-emerald-950 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                            {roleUser.avatarInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs truncate">{roleUser.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal truncate">
                              {roleUser.role}
                            </div>
                          </div>
                          {currentUser.id === roleUser.id && (
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
