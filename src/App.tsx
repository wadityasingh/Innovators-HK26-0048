import React, { useState } from 'react';
import {
  TabType,
  TimeRange,
  UserProfile,
  BuildingData,
  MonthlyConsumption,
  WasteCategory,
  PriorityAlert,
  Recommendation,
  SustainabilityTarget,
  AuditRecord,
  CampusUser,
  ResourceType,
} from './types';
import {
  CURRENT_USER,
  AVAILABLE_ROLES,
  BUILDINGS_DATA,
  MONTHLY_CONSUMPTION_DATA,
  WASTE_CATEGORIES,
  PRIORITY_ALERTS,
  AI_RECOMMENDATIONS,
  SUSTAINABILITY_TARGETS,
  AUDIT_RECORDS,
  CAMPUS_USERS,
} from './data/mockData';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ResourceMonitoringView } from './components/views/ResourceMonitoringView';
import { WasteManagementView } from './components/views/WasteManagementView';
import { RecommendationsView } from './components/views/RecommendationsView';
import { AlertsView } from './components/views/AlertsView';
import { ReportsView } from './components/views/ReportsView';
import { TargetsView } from './components/views/TargetsView';
import { UsersRolesView } from './components/views/UsersRolesView';
import { AuditHistoryView } from './components/views/AuditHistoryView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { LogMeterModal } from './components/modals/LogMeterModal';
import { LogAuditModal } from './components/modals/LogAuditModal';
import { AddTargetModal } from './components/modals/AddTargetModal';
import { ExportReportModal } from './components/modals/ExportReportModal';
import { RecommendationDetailModal } from './components/modals/RecommendationDetailModal';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [users, setUsers] = useState<CampusUser[]>(CAMPUS_USERS);

  // Core Data States
  const [buildings, setBuildings] = useState<BuildingData[]>(BUILDINGS_DATA);
  const [monthlyData, setMonthlyData] = useState<MonthlyConsumption[]>(MONTHLY_CONSUMPTION_DATA);
  const [wasteCategories, setWasteCategories] = useState<WasteCategory[]>(WASTE_CATEGORIES);
  const [alerts, setAlerts] = useState<PriorityAlert[]>(PRIORITY_ALERTS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(AI_RECOMMENDATIONS);
  const [targets, setTargets] = useState<SustainabilityTarget[]>(SUSTAINABILITY_TARGETS);
  const [audits, setAudits] = useState<AuditRecord[]>(AUDIT_RECORDS);

  // Modal Visibility States
  const [isLogMeterOpen, setIsLogMeterOpen] = useState(false);
  const [isLogAuditOpen, setIsLogAuditOpen] = useState(false);
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  // --- Handlers ---

  // Acknowledge alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  // Resolve alert
  const handleResolveAlert = (id: string, notes?: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              acknowledged: true,
              resolved: true,
              investigationStatus: 'Resolved',
              reviewNotes: notes ? `${a.reviewNotes || ''} · [Action Note]: ${notes}` : a.reviewNotes,
            }
          : a
      )
    );
  };

  // Add new threshold alert
  const handleAddAlert = (newAlert: PriorityAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Update recommendation status
  const handleUpdateRecommendationStatus = (
    id: string,
    newStatus: Recommendation['reviewStatus']
  ) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reviewStatus: newStatus } : r))
    );
  };

  // Save manual department reading
  const handleSaveMeterReading = (reading: {
    buildingId: string;
    departmentId: string;
    resourceType: ResourceType;
    value: number;
    unit: string;
    readingDate: string;
    notes: string;
  }) => {
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id === reading.buildingId) {
          const updatedDepts = b.departments.map((dept) => {
            if (dept.id === reading.departmentId) {
              const updatedDept = {
                ...dept,
                reportingStatus: 'reported' as const,
                lastLogDate: reading.readingDate,
                notes: reading.notes || dept.notes,
              };
              if (reading.resourceType === 'electricity') {
                updatedDept.electricityKwh = reading.value;
              } else if (reading.resourceType === 'water') {
                updatedDept.waterLitres = reading.value;
              } else if (reading.resourceType === 'paper') {
                updatedDept.paperSheets = reading.value;
              } else if (reading.resourceType === 'waste') {
                updatedDept.wasteKg = reading.value;
              }
              return updatedDept;
            }
            return dept;
          });
          return {
            ...b,
            departments: updatedDepts,
          };
        }
        return b;
      })
    );
  };

  // Save formal audit
  const handleSaveAudit = (newAudit: AuditRecord) => {
    setAudits((prev) => [newAudit, ...prev]);
  };

  // Add sustainability target
  const handleAddTarget = (newTarget: SustainabilityTarget) => {
    setTargets((prev) => [newTarget, ...prev]);
  };

  // Add authorized user
  const handleAddUser = (newUser: CampusUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  // Reset Demo simulation state
  const handleResetData = () => {
    setBuildings(BUILDINGS_DATA);
    setMonthlyData(MONTHLY_CONSUMPTION_DATA);
    setWasteCategories(WASTE_CATEGORIES);
    setAlerts(PRIORITY_ALERTS);
    setRecommendations(AI_RECOMMENDATIONS);
    setTargets(SUSTAINABILITY_TARGETS);
    setAudits(AUDIT_RECORDS);
    setUsers(CAMPUS_USERS);
    setCurrentUser(CURRENT_USER);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const activeRecommendationsCount = recommendations.filter(
    (r) => r.reviewStatus === 'Under Review' || r.reviewStatus === 'Draft Proposal'
  ).length;

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-900 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        alertCount={unreadAlertsCount}
        recommendationCount={activeRecommendationsCount}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
          availableRoles={AVAILABLE_ROLES}
          onSelectUser={setCurrentUser}
          selectedTimeRange={selectedTimeRange}
          onChangeTimeRange={setSelectedTimeRange}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onNavigateToTab={setActiveTab}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                buildings={buildings}
                monthlyData={monthlyData}
                wasteCategories={wasteCategories}
                alerts={alerts}
                targets={targets}
                audits={audits}
                selectedTimeRange={selectedTimeRange}
                onNavigateTab={setActiveTab}
                onOpenLogMeter={() => setIsLogMeterOpen(true)}
                onOpenLogAudit={() => setIsLogAuditOpen(true)}
                onOpenExportReport={() => setIsExportReportOpen(true)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'resources' && (
              <ResourceMonitoringView
                buildings={buildings}
                onOpenLogMeter={() => setIsLogMeterOpen(true)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'waste' && (
              <WasteManagementView
                wasteCategories={wasteCategories}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'recommendations' && (
              <RecommendationsView
                recommendations={recommendations}
                onSelectRecommendation={(rec) => setSelectedRecommendation(rec)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
                onAddAlert={handleAddAlert}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                buildings={buildings}
                monthlyData={monthlyData}
                onOpenExportReport={() => setIsExportReportOpen(true)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'targets' && (
              <TargetsView
                targets={targets}
                onOpenAddTarget={() => setIsAddTargetOpen(true)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'users' && (
              <UsersRolesView
                users={users}
                currentUser={currentUser}
                availableRoles={AVAILABLE_ROLES}
                onSelectUser={setCurrentUser}
                onAddUser={handleAddUser}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'audits' && (
              <AuditHistoryView
                audits={audits}
                onOpenLogAudit={() => setIsLogAuditOpen(true)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onResetData={handleResetData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Shared Modals */}
      <LogMeterModal
        isOpen={isLogMeterOpen}
        onClose={() => setIsLogMeterOpen(false)}
        buildings={buildings}
        onSaveReading={handleSaveMeterReading}
      />

      <LogAuditModal
        isOpen={isLogAuditOpen}
        onClose={() => setIsLogAuditOpen(false)}
        buildings={buildings}
        onSaveAudit={handleSaveAudit}
        currentUser={currentUser.name}
      />

      <AddTargetModal
        isOpen={isAddTargetOpen}
        onClose={() => setIsAddTargetOpen(false)}
        onAddTarget={handleAddTarget}
      />

      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        buildings={buildings}
        monthlyData={monthlyData}
      />

      <RecommendationDetailModal
        recommendation={selectedRecommendation}
        isOpen={selectedRecommendation !== null}
        onClose={() => setSelectedRecommendation(null)}
        onUpdateStatus={handleUpdateRecommendationStatus}
      />
    </div>
  );
}
