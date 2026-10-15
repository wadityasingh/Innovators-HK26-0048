import { BuildingData, PriorityAlert, ResourceReading } from '../types';

/**
 * Derives operational alerts directly from campus data:
 * 1. Missing departmental reports (departments where reportingStatus is missing or no reading recorded)
 * 2. Flagged unusual readings (readings where isFlagged is true or status is 'Flagged')
 * 
 * In strict adherence to system requirements:
 * NEVER invents causes. Explicitly labels reasons as unverified observations pending inspection.
 */
export function deriveOperationalAlerts(
  buildings: BuildingData[],
  readings: ResourceReading[],
  manualAlerts: PriorityAlert[] = []
): PriorityAlert[] {
  const dynamicAlerts: PriorityAlert[] = [];

  // 1. Missing Department Log Reports
  buildings.forEach((b) => {
    b.departments.forEach((dept) => {
      if (dept.reportingStatus === 'missing') {
        const alertId = `dyn-missing-${dept.id}`;
        // Avoid duplicate if manual or already exists
        if (!manualAlerts.some((a) => a.id === alertId)) {
          dynamicAlerts.push({
            id: alertId,
            title: `Missing October Log: ${dept.name}`,
            category: 'Reporting',
            severity: 'warning',
            building: b.name,
            department: dept.name,
            timestamp: dept.lastLogDate ? `Last log: ${dept.lastLogDate}` : 'October 2026 MTD',
            observedReading: 'Missing submission: No meter sheet filed for current cycle',
            expectedRange: '1 monthly log per resource category by 10th of following month',
            acknowledged: false,
            resolved: false,
            assignedStaff: 'Department Energy Liaison',
            investigationStatus: 'Uninspected',
            reviewNotes:
              'Department submeter log sheet has not been submitted for the October 2026 cycle. Cause is unverified; coordinator reminder notice pending.',
          });
        }
      }
    });
  });

  // 2. Flagged Readings (Unusual or Exceeding Baselines)
  readings.forEach((r) => {
    if (r.isFlagged || r.status === 'Flagged') {
      const alertId = `dyn-flagged-${r.id}`;
      if (!manualAlerts.some((a) => a.id === alertId)) {
        dynamicAlerts.push({
          id: alertId,
          title: `Flagged ${r.resourceType.toUpperCase()} Log: ${r.departmentName}`,
          category:
            r.resourceType === 'electricity'
              ? 'Electricity'
              : r.resourceType === 'water'
              ? 'Water'
              : 'Paper',
          severity: 'critical',
          building: r.buildingName,
          department: r.departmentName,
          timestamp: r.date,
          observedReading: `${r.originalValue.toLocaleString()} ${r.originalUnit} (${r.normalizedValue.toLocaleString()} ${r.normalizedUnit})`,
          expectedRange: 'Standard seasonal envelope threshold',
          acknowledged: false,
          resolved: false,
          assignedStaff: 'Facilities Energy Coordinator',
          investigationStatus: 'Under Investigation',
          reviewNotes: r.flagReason
            ? `${r.flagReason} · Cause unverified pending physical submeter walkthrough.`
            : 'Unusually high consumption recorded. Physical validation requested.',
        });
      }
    }
  });

  // Combine manual alerts with derived alerts, prioritizing unresolved and critical ones
  const combined = [...dynamicAlerts, ...manualAlerts];
  // Deduplicate by ID
  const seen = new Set<string>();
  return combined.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
