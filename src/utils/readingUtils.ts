import {
  CompatibleUnit,
  EntryDataSource,
  ReadingStatus,
  ResourceReading,
  ResourceType,
} from '../types';

export const COMPATIBLE_UNITS: Record<'electricity' | 'water' | 'paper', CompatibleUnit[]> = {
  electricity: ['kWh', 'MWh'],
  water: ['kL', 'Litres', 'm³'],
  paper: ['Sheets', 'Reams', 'Boxes'],
};

export const DEFAULT_UNITS: Record<'electricity' | 'water' | 'paper', CompatibleUnit> = {
  electricity: 'kWh',
  water: 'kL',
  paper: 'Sheets',
};

export const STANDARD_NORMALIZED_UNITS: Record<'electricity' | 'water' | 'paper', 'kWh' | 'Litres' | 'Sheets'> = {
  electricity: 'kWh',
  water: 'Litres',
  paper: 'Sheets',
};

/**
 * Normalizes an entered value + unit into the campus standard unit:
 * - Electricity: standard unit is kWh (1 MWh = 1,000 kWh)
 * - Water: standard unit is Litres (1 kL = 1,000 L, 1 m³ = 1,000 L)
 * - Paper: standard unit is Sheets (1 Ream = 500 sheets, 1 Box = 5,000 sheets)
 */
export function normalizeReading(
  value: number,
  unit: CompatibleUnit
): { normalizedValue: number; normalizedUnit: 'kWh' | 'Litres' | 'Sheets' } {
  switch (unit) {
    case 'kWh':
      return { normalizedValue: value, normalizedUnit: 'kWh' };
    case 'MWh':
      return { normalizedValue: Math.round(value * 1000 * 100) / 100, normalizedUnit: 'kWh' };
    case 'Litres':
      return { normalizedValue: Math.round(value), normalizedUnit: 'Litres' };
    case 'kL':
    case 'm³':
      return { normalizedValue: Math.round(value * 1000), normalizedUnit: 'Litres' };
    case 'Sheets':
      return { normalizedValue: Math.round(value), normalizedUnit: 'Sheets' };
    case 'Reams':
      return { normalizedValue: Math.round(value * 500), normalizedUnit: 'Sheets' };
    case 'Boxes':
      return { normalizedValue: Math.round(value * 5000), normalizedUnit: 'Sheets' };
    default:
      return { normalizedValue: value, normalizedUnit: 'kWh' };
  }
}

/**
 * Evaluates whether an entered reading appears unusually high or anomalous
 * relative to expected department baselines.
 * Returns flagging metadata without silently rejecting the data.
 */
export function checkReadingAnomaly(
  resourceType: 'electricity' | 'water' | 'paper',
  normalizedValue: number,
  departmentName?: string
): { isAnomalous: boolean; flagReason?: string; severity?: 'warning' | 'critical' } {
  if (resourceType === 'electricity') {
    if (normalizedValue > 100000) {
      return {
        isAnomalous: true,
        flagReason: `Consumption of ${normalizedValue.toLocaleString()} kWh is over 100,000 kWh/mo (exceeds typical laboratory baseline threshold).`,
        severity: 'warning',
      };
    }
  } else if (resourceType === 'water') {
    // 2,000,000 Litres = 2,000 kL
    if (normalizedValue > 2000000) {
      return {
        isAnomalous: true,
        flagReason: `High water volume of ${(normalizedValue / 1000).toLocaleString()} kL (${normalizedValue.toLocaleString()} L) exceeds standard wet-lab seasonal envelope.`,
        severity: 'warning',
      };
    }
  } else if (resourceType === 'paper') {
    // 250,000 sheets = 500 reams
    if (normalizedValue > 250000) {
      return {
        isAnomalous: true,
        flagReason: `Print volume of ${normalizedValue.toLocaleString()} sheets is unusually high (>250k sheets/mo). Check for bulk academic batch printing.`,
        severity: 'warning',
      };
    }
  }

  return { isAnomalous: false };
}

/**
 * Checks if a reading for the same department, resource, and reporting period already exists.
 */
export function checkDuplicateReading(
  readings: ResourceReading[],
  departmentId: string,
  resourceType: 'electricity' | 'water' | 'paper',
  reportingPeriod: string,
  excludeReadingId?: string
): ResourceReading | undefined {
  return readings.find(
    (r) =>
      r.departmentId === departmentId &&
      r.resourceType === resourceType &&
      r.reportingPeriod.toLowerCase().trim() === reportingPeriod.toLowerCase().trim() &&
      r.id !== excludeReadingId
  );
}

const STORAGE_KEY = 'greencampus_resource_readings_v3';

export function loadStoredReadings(fallbackReadings: ResourceReading[]): ResourceReading[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackReadings;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallbackReadings;
  } catch (err) {
    console.warn('Unable to load readings from localStorage; falling back to mock dataset', err);
    return fallbackReadings;
  }
}

export function saveStoredReadings(readings: ResourceReading[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch (err) {
    console.warn('Unable to save readings to localStorage', err);
  }
}

export function clearStoredReadings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Unable to clear readings from localStorage', err);
  }
}
