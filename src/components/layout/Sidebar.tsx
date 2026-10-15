import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Trash2,
  Sparkles,
  AlertTriangle,
  FileText,
  Target,
  Users,
  ClipboardCheck,
  Settings,
  X,
  Leaf,
  Layers,
} from 'lucide-react';
import { TabType } from '../../types';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  alertCount: number;
  recommendationCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  alertCount,
  recommendationCount,
}) => {
  const navigationItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources', label: 'Resource Monitoring', icon: Activity },
    { id: 'waste', label: 'Waste Management', icon: Trash2 },
    {
      id: 'recommendations',
      label: 'AI Recommendations',
      icon: Sparkles,
      badge: recommendationCount,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: alertCount,
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'targets', label: 'Targets', icon: Target },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'audits', label: 'Audit History', icon: ClipboardCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight tracking-tight">
                GreenCampus AI
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Resource & Audit Portal</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500">
            PORTAL SECTIONS
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer with Department Reporting Status */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60 text-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Department Reporting</span>
            </span>
            <span className="font-mono text-[11px] text-slate-700">13 / 14 Logs</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '92.9%' }} />
          </div>
          <div className="mt-2 text-[10px] text-slate-500 leading-tight">
            Data Completeness: <span className="font-medium text-emerald-800">92.9% MTD</span>
          </div>
        </div>
      </aside>
    </>
  );
};
