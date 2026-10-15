import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  ResourceReading,
  BuildingData,
  SustainabilityTarget,
  WasteCategory,
  AuditRecord,
} from '../types';

export interface CampusSettingsData {
  campusName: string;
  conditionedSqFt: string;
  ftePopulation: string;
  electricityTariff: string;
  waterTariff: string;
  landfillTariff: string;
  gridCarbonFactor: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UserDocData {
  uid: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Department Staff' | 'Sustainability Coordinator';
  departmentId?: string;
  departmentName?: string;
  buildingId?: string;
  buildingName?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to recursively remove undefined values from Firestore payloads
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

// -------------------------------------------------------------
// USER PROFILES & RBAC
// -------------------------------------------------------------

export async function getFirestoreUser(uid: string): Promise<UserDocData | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserDocData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createOrUpdateUserDoc(userData: UserDocData): Promise<void> {
  const path = `users/${userData.uid}`;
  try {
    const safeData: UserDocData = {
      uid: userData.uid,
      email: userData.email || '',
      displayName: userData.displayName || '',
      role: userData.role,
      departmentId: userData.departmentId ?? '',
      departmentName: userData.departmentName ?? '',
      buildingId: userData.buildingId ?? '',
      buildingName: userData.buildingName ?? '',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const cleaned = cleanFirestoreData(safeData);
    await setDoc(doc(db, 'users', userData.uid), cleaned, { merge: true });

    // If Admin, ensure presence in admins collection
    if (userData.role === 'Admin') {
      try {
        await setDoc(
          doc(db, 'admins', userData.uid),
          { uid: userData.uid, email: userData.email, assignedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (adminErr) {
        console.warn('Could not update admins collection:', adminErr);
      }
    } else {
      // Remove from admins if downgraded
      try {
        await deleteDoc(doc(db, 'admins', userData.uid));
      } catch {
        // Safe to ignore if not present
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllUsers(): Promise<UserDocData[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as UserDocData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// -------------------------------------------------------------
// CAMPUS SETTINGS
// -------------------------------------------------------------

export async function fetchCampusSettings(): Promise<CampusSettingsData | null> {
  const path = 'settings/global';
  try {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (snap.exists()) {
      return snap.data() as CampusSettingsData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCampusSettings(settings: CampusSettingsData): Promise<void> {
  const path = 'settings/global';
  try {
    await setDoc(doc(db, 'settings', 'global'), cleanFirestoreData(settings));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// BUILDINGS HIERARCHY
// -------------------------------------------------------------

export async function fetchBuildings(): Promise<BuildingData[]> {
  const path = 'buildings';
  try {
    const snap = await getDocs(collection(db, 'buildings'));
    return snap.docs.map((d) => d.data() as BuildingData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveBuilding(building: BuildingData): Promise<void> {
  const path = `buildings/${building.id}`;
  try {
    await setDoc(doc(db, 'buildings', building.id), cleanFirestoreData(building), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// RESOURCE READINGS (ABAC & Workflow)
// -------------------------------------------------------------

export async function fetchReadings(
  userRole?: string,
  userDepartmentId?: string
): Promise<ResourceReading[]> {
  const path = 'readings';
  try {
    // If department staff, query only by their assigned departmentId
    if (userRole === 'Department Staff' && userDepartmentId) {
      const q = query(
        collection(db, 'readings'),
        where('departmentId', '==', userDepartmentId),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ ...(d.data() as ResourceReading), id: d.id }));
    }

    // Admins & Sustainability Coordinators get all readings
    const q = query(collection(db, 'readings'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as ResourceReading), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createReading(
  reading: Omit<ResourceReading, 'id'>,
  customId?: string
): Promise<string> {
  const readingId = customId || `read-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `readings/${readingId}`;
  try {
    const record: ResourceReading = {
      ...reading,
      id: readingId,
      createdAt: reading.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'readings', readingId), cleanFirestoreData(record));
    return readingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReading(
  readingId: string,
  updates: Partial<ResourceReading>
): Promise<void> {
  const path = `readings/${readingId}`;
  try {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'readings', readingId), cleanFirestoreData(payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReading(readingId: string): Promise<void> {
  const path = `readings/${readingId}`;
  try {
    await deleteDoc(doc(db, 'readings', readingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// SUSTAINABILITY TARGETS
// -------------------------------------------------------------

export async function fetchTargets(): Promise<SustainabilityTarget[]> {
  const path = 'targets';
  try {
    const snap = await getDocs(collection(db, 'targets'));
    return snap.docs.map((d) => ({ ...(d.data() as SustainabilityTarget), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveTarget(target: SustainabilityTarget): Promise<void> {
  const path = `targets/${target.id}`;
  try {
    await setDoc(doc(db, 'targets', target.id), cleanFirestoreData(target), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// WASTE CATEGORIES & DIVERSION
// -------------------------------------------------------------

export async function fetchWasteCategories(): Promise<WasteCategory[]> {
  const path = 'waste';
  try {
    const snap = await getDocs(collection(db, 'waste'));
    return snap.docs.map((d) => ({ ...(d.data() as WasteCategory), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveWasteCategory(category: WasteCategory): Promise<void> {
  const path = `waste/${category.id}`;
  try {
    await setDoc(doc(db, 'waste', category.id), cleanFirestoreData(category), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// AUDIT LOGS (Protected from Ordinary Users)
// -------------------------------------------------------------

export async function fetchAudits(): Promise<AuditRecord[]> {
  const path = 'audits';
  try {
    const snap = await getDocs(collection(db, 'audits'));
    return snap.docs.map((d) => ({ ...(d.data() as AuditRecord), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveAudit(audit: AuditRecord): Promise<void> {
  const path = `audits/${audit.id}`;
  try {
    await setDoc(doc(db, 'audits', audit.id), cleanFirestoreData(audit), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
