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

export type TimeRange = '7d' | '30d' | '90d' | 'ytd' | '1y';

export type ResourceType = 'electricity' | 'water' | 'paper';

export type SeverityLevel = 'critical' | 'warning' | 'info';

export type UserRole =
  | 'Campus Sustainability Director'
  | 'Facilities Energy Engineer'
  | 'Student Green Council Lead'
  | 'Department Auditor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarInitials: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  unit: string;
  changePercent: number;
  changeDirection: 'increase' | 'decrease' | 'neutral';
  isFavorable: boolean;
  benchmark: string;
  completeness: number; // Percentage of sensors active
  isEstimated?: boolean;
}

export interface BuildingData {
  id: string;
  name: string;
  code: string;
  category: 'Academic' | 'Residential' | 'Research / Labs' | 'Administrative' | 'Athletics & Dining';
  grossAreaSqFt: number;
  occupancy: number;
  electricityKwh: number;
  waterKL: number;
  paperReams: number;
  wasteKg: number;
  meterStatus: 'online' | 'intermittent' | 'manual_estimate';
  lastReading: string;
  anomalyDetected: boolean;
  peakDemandKw: number;
}

export interface MonthlyConsumption {
  month: string;
  electricityKwh: number;
  targetElectricityKwh: number;
  waterKL: number;
  targetWaterKL: number;
  paperReams: number;
  targetPaperReams: number;
  wasteTons: number;
  divertedTons: number;
}

export interface WasteCategory {
  id: string;
  name: string;
  color: string;
  tonnage: number;
  percentage: number;
  trend: 'improving' | 'stable' | 'declining';
  handlingFacility: string;
}

export interface PriorityAlert {
  id: string;
  title: string;
  category: 'Electricity' | 'Water' | 'Waste' | 'Paper' | 'Sensor Hardware';
  severity: SeverityLevel;
  building: string;
  timestamp: string;
  observedValue: string;
  expectedValue: string;
  acknowledged: boolean;
  resolved: boolean;
  assignedTo?: string;
  rootCause?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: 'HVAC Optimization' | 'Lighting & Controls' | 'Water Conservation' | 'Digital Transition' | 'Waste Diversion';
  building: string;
  potentialSavingsAnnualUsd: number;
  co2ReductionTons: number;
  estimatedCostUsd: number;
  paybackMonths: number;
  confidence: 'High' | 'Medium' | 'Low';
  status: 'review' | 'approved' | 'in_progress' | 'dismissed';
  evidenceData: string;
  engineeringChecklist: string[];
}

export interface SustainabilityTarget {
  id: string;
  title: string;
  category: 'Energy' | 'Water' | 'Waste' | 'Paper' | 'Emissions';
  currentValue: number;
  targetValue: number;
  unit: string;
  baselineYear: number;
  targetYear: number;
  deadlineDate: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  departmentLead: string;
  initiativeSummary: string;
}

export interface AuditRecord {
  id: string;
  auditNumber: string;
  title: string;
  auditorName: string;
  auditDate: string;
  building: string;
  scope: string;
  complianceScore: number;
  status: 'Certified' | 'Draft' | 'Pending Review' | 'Findings Open';
  findingsCount: number;
  notes: string;
  verificationMethod: 'On-site physical walk' | 'Telemetry automated verification' | 'Manual meter log review';
}

export interface CampusUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedBuildings: string[];
  lastActive: string;
  status: 'active' | 'invited' | 'disabled';
}
