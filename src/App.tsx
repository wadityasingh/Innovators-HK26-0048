import React, { useState, useEffect, useCallback } from 'react';
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
  ResourceReading,
  SystemRole,
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
  INITIAL_RESOURCE_READINGS,
} from './data/mockData';
import {
  loadStoredReadings,
  saveStoredReadings,
  clearStoredReadings,
} from './utils/readingUtils';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  fetchReadings,
  createReading,
  updateReading,
  deleteReading,
  fetchBuildings,
  saveBuilding,
  fetchCampusSettings,
  saveCampusSettings,
  CampusSettingsData,
  fetchTargets,
  saveTarget,
  fetchWasteCategories,
  fetchAudits,
  saveAudit,
  fetchAllUsers,
  createOrUpdateUserDoc,
  UserDocData,
} from './lib/firestoreService';

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
import { AddReadingModal } from './components/modals/AddReadingModal';
import { ReviewReadingModal } from './components/modals/ReviewReadingModal';
import { LogAuditModal } from './components/modals/LogAuditModal';
import { AddTargetModal } from './components/modals/AddTargetModal';
import { ExportReportModal } from './components/modals/ExportReportModal';
import { RecommendationDetailModal } from './components/modals/RecommendationDetailModal';
import { AuthModal } from './components/modals/AuthModal';

function AppWorkspace() {
  const {
    firebaseUser,
    authUser,
    activeUser,
    demoUser,
    setDemoUser,
    appMode,
  } = useAuth();

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // --- Real Firestore States ---
  const [realReadings, setRealReadings] = useState<ResourceReading[]>([]);
  const [realBuildings, setRealBuildings] = useState<BuildingData[]>([]);
  const [realTargets, setRealTargets] = useState<SustainabilityTarget[]>([]);
  const [realWaste, setRealWaste] = useState<WasteCategory[]>([]);
  const [realAudits, setRealAudits] = useState<AuditRecord[]>([]);
  const [realUsers, setRealUsers] = useState<UserDocData[]>([]);
  const [realSettings, setRealSettings] = useState<CampusSettingsData | null>(null);
  const [isRealLoading, setIsRealLoading] = useState(false);
  const [realDataError, setRealDataError] = useState<string | null>(null);

  // --- Demo Synthetic States ---
  const [demoBuildings, setDemoBuildings] = useState<BuildingData[]>(BUILDINGS_DATA);
  const [demoMonthlyData, setDemoMonthlyData] = useState<MonthlyConsumption[]>(MONTHLY_CONSUMPTION_DATA);
  const [demoWasteCategories, setDemoWasteCategories] = useState<WasteCategory[]>(WASTE_CATEGORIES);
  const [demoAlerts, setDemoAlerts] = useState<PriorityAlert[]>(PRIORITY_ALERTS);
  const [demoRecommendations, setDemoRecommendations] = useState<Recommendation[]>(AI_RECOMMENDATIONS);
  const [demoTargets, setDemoTargets] = useState<SustainabilityTarget[]>(SUSTAINABILITY_TARGETS);
  const [demoAudits, setDemoAudits] = useState<AuditRecord[]>(AUDIT_RECORDS);
  const [demoUsers, setDemoUsers] = useState<CampusUser[]>(CAMPUS_USERS);
  const [demoReadings, setDemoReadings] = useState<ResourceReading[]>(() =>
    loadStoredReadings(INITIAL_RESOURCE_READINGS)
  );

  // Modal Visibility States
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [selectedReadingForReview, setSelectedReadingForReview] = useState<ResourceReading | null>(null);
  const [isLogAuditOpen, setIsLogAuditOpen] = useState(false);
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  // Persist demo changes to localStorage
  useEffect(() => {
    saveStoredReadings(demoReadings);
  }, [demoReadings]);

  // Load Real Data from Firestore when in Real Mode & Authenticated
  const loadRealFirestoreData = useCallback(async () => {
    if (!firebaseUser) return;
    setIsRealLoading(true);
    setRealDataError(null);
    try {
      // 1. Fetch real readings (respecting role-based scope: department staff gets only their department)
      const readingsData = await fetchReadings(authUser?.role, authUser?.departmentId);
      setRealReadings(readingsData || []);

      // 2. Fetch buildings hierarchy
      const buildingsData = await fetchBuildings();
      setRealBuildings(buildingsData || []);

      // 3. Fetch targets
      const targetsData = await fetchTargets();
      setRealTargets(targetsData || []);

      // 4. Fetch waste streams
      const wasteData = await fetchWasteCategories();
      setRealWaste(wasteData || []);

      // 5. Fetch audits (protected: coordinator or admin only)
      if (authUser?.role === 'Admin' || authUser?.role === 'Sustainability Coordinator') {
        const auditsData = await fetchAudits();
        setRealAudits(auditsData || []);
      }

      // 6. Fetch users (admin only)
      if (authUser?.role === 'Admin') {
        const usersData = await fetchAllUsers();
        setRealUsers(usersData || []);
      }

      // 7. Fetch settings
      const settingsData = await fetchCampusSettings();
      setRealSettings(settingsData || null);
    } catch (err: unknown) {
      console.warn('Real Firestore load exception:', err);
      setRealDataError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRealLoading(false);
    }
  }, [firebaseUser, authUser?.role, authUser?.departmentId]);

  useEffect(() => {
    if (appMode === 'real' && firebaseUser) {
      loadRealFirestoreData();
    }
  }, [appMode, firebaseUser, loadRealFirestoreData]);

  // Sync approved reading into building department cards
  const syncApprovedReadingToBuildings = (r: ResourceReading, isReal: boolean) => {
    const updateFn = (prev: BuildingData[]) =>
      prev.map((b) => {
        if (b.id === r.buildingId) {
          return {
            ...b,
            departments: b.departments.map((d) => {
              if (d.id === r.departmentId) {
                const updatedDept = {
                  ...d,
                  reportingStatus: 'reported' as const,
                  lastLogDate: new Date(r.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                  notes: r.notes || d.notes,
                };
                if (r.resourceType === 'electricity') {
                  updatedDept.electricityKwh = r.normalizedValue;
                } else if (r.resourceType === 'water') {
                  updatedDept.waterLitres = r.normalizedValue;
                } else if (r.resourceType === 'paper') {
                  updatedDept.paperSheets = r.normalizedValue;
                }
                return updatedDept;
              }
              return d;
            }),
          };
        }
        return b;
      });

    if (isReal) {
      setRealBuildings(updateFn);
    } else {
      setDemoBuildings(updateFn);
    }
  };

  // --- Handlers for Readings ---

  const handleSaveReading = async (newReading: ResourceReading) => {
    if (appMode === 'real') {
      try {
        const readingWithAuth: ResourceReading = {
          ...newReading,
          enteredBy: authUser?.displayName || authUser?.email || newReading.enteredBy,
          enteredByUid: authUser?.uid || '',
          enteredByRole: authUser?.role || 'Department Staff',
        };
        await createReading(readingWithAuth, readingWithAuth.id);
        setRealReadings((prev) => [readingWithAuth, ...prev]);

        if (readingWithAuth.status === 'Approved') {
          syncApprovedReadingToBuildings(readingWithAuth, true);
        }
      } catch (err) {
        console.error('Failed to create reading in Firestore:', err);
      }
    } else {
      // Demo Mode
      setDemoReadings((prev) => [newReading, ...prev]);
      if (newReading.status === 'Approved') {
        syncApprovedReadingToBuildings(newReading, false);
      }
    }
  };

  const handleUpdateReading = async (updated: ResourceReading) => {
    if (appMode === 'real') {
      try {
        await updateReading(updated.id, updated);
        setRealReadings((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
        setSelectedReadingForReview(updated);

        if (updated.status === 'Approved') {
          syncApprovedReadingToBuildings(updated, true);
        }
      } catch (err) {
        console.error('Failed to update reading in Firestore:', err);
      }
    } else {
      // Demo Mode
      setDemoReadings((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedReadingForReview(updated);
      if (updated.status === 'Approved') {
        syncApprovedReadingToBuildings(updated, false);
      }
    }
  };

  const handleDeleteReading = async (readingId: string) => {
    if (appMode === 'real') {
      try {
        await deleteReading(readingId);
        setRealReadings((prev) => prev.filter((r) => r.id !== readingId));
        if (selectedReadingForReview?.id === readingId) {
          setSelectedReadingForReview(null);
        }
      } catch (err) {
        console.error('Failed to delete reading in Firestore:', err);
      }
    } else {
      setDemoReadings((prev) => prev.filter((r) => r.id !== readingId));
      if (selectedReadingForReview?.id === readingId) {
        setSelectedReadingForReview(null);
      }
    }
  };

  // --- Handlers for Alerts, Recommendations, Audits, Targets ---

  const handleAcknowledgeAlert = (id: string) => {
    setDemoAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleResolveAlert = (id: string, notes?: string) => {
    setDemoAlerts((prev) =>
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

  const handleAddAlert = (newAlert: PriorityAlert) => {
    setDemoAlerts((prev) => [newAlert, ...prev]);
  };

  const handleUpdateRecommendationStatus = (
    id: string,
    newStatus: Recommendation['reviewStatus']
  ) => {
    setDemoRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reviewStatus: newStatus } : r))
    );
  };

  const handleSaveAudit = async (newAudit: AuditRecord) => {
    if (appMode === 'real') {
      try {
        await saveAudit(newAudit);
        setRealAudits((prev) => [newAudit, ...prev]);
      } catch (err) {
        console.error('Failed to save audit to Firestore:', err);
      }
    } else {
      setDemoAudits((prev) => [newAudit, ...prev]);
    }
  };

  const handleAddTarget = async (newTarget: SustainabilityTarget) => {
    if (appMode === 'real') {
      try {
        await saveTarget(newTarget);
        setRealTargets((prev) => [newTarget, ...prev]);
      } catch (err) {
        console.error('Failed to save target to Firestore:', err);
      }
    } else {
      setDemoTargets((prev) => [newTarget, ...prev]);
    }
  };

  const handleAddUser = (newUser: CampusUser) => {
    setDemoUsers((prev) => [newUser, ...prev]);
  };

  // Seed / Sync default buildings hierarchy into Firestore
  const handleSeedBuildings = async () => {
    for (const b of BUILDINGS_DATA) {
      await saveBuilding(b);
    }
    setRealBuildings(BUILDINGS_DATA);
  };

  // Update user role in Firestore (Admin feature)
  const handleUpdateRealUserRole = async (
    uid: string,
    newRole: SystemRole,
    deptId?: string,
    deptName?: string
  ) => {
    const existing = realUsers.find((u) => u.uid === uid);
    if (!existing) return;
    const updated: UserDocData = {
      ...existing,
      role: newRole,
      departmentId: deptId || existing.departmentId,
      departmentName: deptName || existing.departmentName,
      updatedAt: new Date().toISOString(),
    };
    await createOrUpdateUserDoc(updated);
    setRealUsers((prev) => prev.map((u) => (u.uid === uid ? updated : u)));
  };

  // Save settings in Firestore
  const handleSaveRealSettings = async (settings: CampusSettingsData) => {
    await saveCampusSettings(settings);
    setRealSettings(settings);
  };

  // Reset Demo simulation state & LocalStorage
  const handleResetData = () => {
    clearStoredReadings();
    setDemoReadings(INITIAL_RESOURCE_READINGS);
    setDemoBuildings(BUILDINGS_DATA);
    setDemoMonthlyData(MONTHLY_CONSUMPTION_DATA);
    setDemoWasteCategories(WASTE_CATEGORIES);
    setDemoAlerts(PRIORITY_ALERTS);
    setDemoRecommendations(AI_RECOMMENDATIONS);
    setDemoTargets(SUSTAINABILITY_TARGETS);
    setDemoAudits(AUDIT_RECORDS);
    setDemoUsers(CAMPUS_USERS);
    setDemoUser(CURRENT_USER);
  };

  // Active data sources based on current mode
  const currentBuildings =
    appMode === 'real'
      ? realBuildings.length > 0
        ? realBuildings
        : BUILDINGS_DATA
      : demoBuildings;

  const currentReadings = appMode === 'real' ? realReadings : demoReadings;
  const currentTargets = appMode === 'real' ? realTargets : demoTargets;
  const currentWaste =
    appMode === 'real' && realWaste.length > 0 ? realWaste : demoWasteCategories;
  const currentAudits = appMode === 'real' ? realAudits : demoAudits;

  const unreadAlertsCount = demoAlerts.filter((a) => !a.acknowledged).length;
  const activeRecommendationsCount = demoRecommendations.filter(
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
          currentUser={activeUser}
          availableRoles={AVAILABLE_ROLES}
          onSelectUser={setDemoUser}
          selectedTimeRange={selectedTimeRange}
          onChangeTimeRange={setSelectedTimeRange}
          alerts={demoAlerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onNavigateToTab={setActiveTab}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                buildings={currentBuildings}
                monthlyData={demoMonthlyData}
                wasteCategories={currentWaste}
                alerts={demoAlerts}
                targets={currentTargets}
                audits={currentAudits}
                selectedTimeRange={selectedTimeRange}
                onNavigateTab={setActiveTab}
                onOpenLogMeter={() => setIsAddReadingOpen(true)}
                onOpenLogAudit={() => setIsLogAuditOpen(true)}
                onOpenExportReport={() => setIsExportReportOpen(true)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'resources' && (
              <ResourceMonitoringView
                buildings={currentBuildings}
                readings={currentReadings}
                currentUser={activeUser}
                onOpenAddReading={() => setIsAddReadingOpen(true)}
                onSelectReadingForReview={(r) => setSelectedReadingForReview(r)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'waste' && (
              <WasteManagementView
                wasteCategories={currentWaste}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'recommendations' && (
              <RecommendationsView
                recommendations={demoRecommendations}
                onSelectRecommendation={(rec) => setSelectedRecommendation(rec)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={demoAlerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
                onAddAlert={handleAddAlert}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                buildings={currentBuildings}
                monthlyData={demoMonthlyData}
                onOpenExportReport={() => setIsExportReportOpen(true)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'targets' && (
              <TargetsView
                targets={currentTargets}
                onOpenAddTarget={() => setIsAddTargetOpen(true)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'users' && (
              <UsersRolesView
                users={demoUsers}
                realUsers={realUsers}
                currentUser={activeUser}
                availableRoles={AVAILABLE_ROLES}
                appMode={appMode}
                onSelectUser={setDemoUser}
                onAddUser={handleAddUser}
                onUpdateRealUserRole={handleUpdateRealUserRole}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'audits' && (
              <AuditHistoryView
                audits={currentAudits}
                currentUser={activeUser}
                appMode={appMode}
                onOpenLogAudit={() => setIsLogAuditOpen(true)}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                currentUser={activeUser}
                appMode={appMode}
                realSettings={realSettings}
                buildingsCount={realBuildings.length}
                onSaveRealSettings={handleSaveRealSettings}
                onSeedBuildings={handleSeedBuildings}
                onResetData={handleResetData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Shared Modals */}
      <AddReadingModal
        isOpen={isAddReadingOpen}
        onClose={() => setIsAddReadingOpen(false)}
        buildings={currentBuildings}
        existingReadings={currentReadings}
        currentUser={activeUser}
        onSaveReading={handleSaveReading}
      />

      <ReviewReadingModal
        reading={selectedReadingForReview}
        isOpen={selectedReadingForReview !== null}
        onClose={() => setSelectedReadingForReview(null)}
        currentUser={activeUser}
        onUpdateReading={handleUpdateReading}
        onDeleteReading={handleDeleteReading}
      />

      <LogAuditModal
        isOpen={isLogAuditOpen}
        onClose={() => setIsLogAuditOpen(false)}
        buildings={currentBuildings}
        onSaveAudit={handleSaveAudit}
        currentUser={activeUser.name}
      />

      <AddTargetModal
        isOpen={isAddTargetOpen}
        onClose={() => setIsAddTargetOpen(false)}
        onAddTarget={handleAddTarget}
      />

      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        buildings={currentBuildings}
        monthlyData={demoMonthlyData}
      />

      <RecommendationDetailModal
        recommendation={selectedRecommendation}
        isOpen={selectedRecommendation !== null}
        onClose={() => setSelectedRecommendation(null)}
        onUpdateStatus={handleUpdateRecommendationStatus}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppWorkspace />
    </AuthProvider>
  );
}
