export type TabType =
  | 'dashboard'
  | 'resources'
  | 'waste'
  | 'recommendations'
  | 'alerts'
  | 'reports'
  | 'targets'
  | 'users'
  | 'audits'
  | 'settings';

export type TimeRange = '7d' | '30d' | '90d' | 'ytd';

export type ResourceType = 'electricity' | 'water' | 'paper' | 'waste';

export type SeverityLevel = 'critical' | 'warning' | 'info';

export type SystemRole = 'Admin' | 'Department Staff' | 'Sustainability Coordinator';

export type UserRole =
  | 'Campus Sustainability Manager'
  | 'Facilities Energy Coordinator'
  | 'Student Green Council Representative'
  | 'Department Energy Liaison';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  systemRole?: SystemRole;
  department: string;
  departmentId?: string;
  avatarInitials: string;
}

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: SystemRole;
  departmentId?: string;
  departmentName?: string;
  buildingId?: string;
  buildingName?: string;
}

export interface DepartmentLocation {
  id: string;
  name: string;
  code: string;
  type: 'Department' | 'Laboratory' | 'Facility' | 'Zone';
  // Numeric readings (null indicates a missing/unreported reading)
  electricityKwh: number | null;
  waterLitres: number | null; // Litres (1 kL = 1,000 L)
  paperSheets: number | null; // Sheets
  wasteKg: number | null; // Kilograms
  reportingStatus: 'reported' | 'missing' | 'delayed';
  lastLogDate: string;
  notes?: string;
  flaggedForReview?: boolean;
}

export interface BuildingData {
  id: string;
  name: string;
  code: string;
  category: 'Academic' | 'Residential' | 'Research & Labs' | 'Administrative' | 'Dining & Hub';
  grossAreaSqFt: number;
  occupancy: number;
  departments: DepartmentLocation[];
}

export interface MonthlyConsumption {
  month: string;
  electricityKwh: number;
  targetElectricityKwh: number;
  waterLitres: number;
  targetWaterLitres: number;
  paperSheets: number;
  targetPaperSheets: number;
  wasteKg: number;
  divertedWasteKg: number;
  reportingCompletenessPercent: number; // percentage of departments with complete reports
}

export interface WasteCategory {
  id: string;
  name: string;
  color: string;
  weightKg: number;
  percentage: number;
  isDiverted: boolean;
  collectionPoint: string;
}

export interface PriorityAlert {
  id: string;
  title: string;
  category: 'Electricity' | 'Water' | 'Waste' | 'Paper' | 'Reporting';
  severity: SeverityLevel;
  building: string;
  department?: string;
  timestamp: string;
  observedReading: string;
  expectedRange: string;
  acknowledged: boolean;
  resolved: boolean;
  assignedStaff?: string;
  investigationStatus: 'Uninspected' | 'Under Investigation' | 'Resolved';
  reviewNotes?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: 'Heating & Cooling' | 'Lighting Schedule' | 'Water Fixtures' | 'Digital Forms' | 'Waste Diversion';
  building: string;
  department?: string;
  estimatedAnnualSavingsUsd: number;
  estimatedCarbonReductionKg: number;
  estimatedImplementationCostUsd: number;
  paybackMonths: number;
  reviewStatus: 'Draft Proposal' | 'Under Review' | 'Approved for Implementation' | 'Dismissed';
  supportingData: string;
  actionItems: string[];
}

export interface SustainabilityTarget {
  id: string;
  title: string;
  category: 'Electricity' | 'Water' | 'Paper' | 'Waste';
  currentValue: number;
  targetValue: number;
  unit: string;
  baselineYear: number;
  targetYear: number;
  status: 'on_track' | 'needs_attention' | 'off_track';
  responsibleLead: string;
  notes: string;
}

export interface AuditRecord {
  id: string;
  auditNumber: string;
  title: string;
  auditorName: string;
  auditDate: string;
  building: string;
  department?: string;
  scope: string;
  internalRating: number; // percentage
  status: 'Internal Draft' | 'Pending Review' | 'Reviewed & Filed';
  unresolvedItemsCount: number;
  notes: string;
  inspectionType: 'Walkthrough Observation' | 'Utility Meter Log Check' | 'Waste Stream Inspection';
}

export interface CampusUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedScope: string;
  lastActive: string;
  status: 'Active' | 'Invited';
}

export type ReadingStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Flagged';

export type EntryDataSource = 'Manual Entry' | 'Imported' | 'Utility Bill Log' | 'Submeter Log';

export type CompatibleUnit =
  | 'kWh'
  | 'MWh'
  | 'Litres'
  | 'kL'
  | 'm³'
  | 'Sheets'
  | 'Reams'
  | 'Boxes';

export interface ReadingCorrectionRecord {
  id: string;
  timestamp: string;
  reviewedBy: string;
  reviewerRole: string;
  previousValue: number;
  previousUnit: CompatibleUnit;
  correctedValue: number;
  correctedUnit: CompatibleUnit;
  reason: string;
}

export interface ResourceReading {
  id: string;
  date: string; // "YYYY-MM-DD"
  reportingPeriod: string; // e.g. "Oct 2026", "Sep 2026"
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  resourceType: 'electricity' | 'water' | 'paper';
  originalValue: number;
  originalUnit: CompatibleUnit;
  normalizedValue: number;
  normalizedUnit: 'kWh' | 'Litres' | 'Sheets';
  status: ReadingStatus;
  dataSource: EntryDataSource;
  enteredBy: string;
  enteredByUid?: string;
  enteredByRole: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isFlagged?: boolean;
  flagReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  correctionHistory: ReadingCorrectionRecord[];
}
