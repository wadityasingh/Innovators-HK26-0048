import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

// Built-in default configuration for the GreenCampus AI project
const DEFAULT_FIREBASE_CONFIG = {
  projectId: 'peaceful-option-fw1xt',
  appId: '1:1009020100797:web:158a961c0b645929da57d4',
  apiKey: 'AIzaSyCcRZ01oXnWRi9YOWF4iMUevg4Fk9AbnRM',
  authDomain: 'peaceful-option-fw1xt.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-greencampusaisus-1e0b2fde-bec7-42d3-a5fe-6d19f47ea4da',
  storageBucket: 'peaceful-option-fw1xt.firebasestorage.app',
  messagingSenderId: '1009020100797',
  oAuthClientId: '1009020100797-ml6tqdrgejdonneo578q8u7p6bfgkuqb.apps.googleusercontent.com',
};

const fileConfig = (rawConfig || {}) as Record<string, string | undefined>;

// Hierarchy: 1. Environment variables -> 2. Config file -> 3. Project defaults
export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fileConfig.appId || DEFAULT_FIREBASE_CONFIG.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || fileConfig.firestoreDatabaseId || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId || '(default)',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  oAuthClientId: fileConfig.oAuthClientId || DEFAULT_FIREBASE_CONFIG.oAuthClientId,
};

let appInstance: FirebaseApp;
let dbInstance: Firestore;
let authInstance: Auth;
let configured = false;
let initErrorMessage: string | null = null;

try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  dbInstance = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(appInstance, firebaseConfig.firestoreDatabaseId)
    : getFirestore(appInstance);
  authInstance = getAuth(appInstance);
  configured = true;
} catch (err: unknown) {
  initErrorMessage = err instanceof Error ? err.message : String(err);
  console.warn('Firebase initialization notice (resilient mode active):', initErrorMessage);

  // Fallback to prevent app crash if custom config was malformed
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(DEFAULT_FIREBASE_CONFIG);
    dbInstance = getFirestore(appInstance, DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId);
    authInstance = getAuth(appInstance);
    configured = true;
  } catch (fallbackErr) {
    console.error('Firebase fallback could not initialize:', fallbackErr);
    // Provide non-crashing objects
    appInstance = (getApps().length > 0 ? getApp() : null) as unknown as FirebaseApp;
    dbInstance = null as unknown as Firestore;
    authInstance = null as unknown as Auth;
    configured = false;
  }
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;
export const isFirebaseConfigured = configured;
export const firebaseInitError = initErrorMessage;
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentFbUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentFbUser?.uid,
      email: currentFbUser?.email,
      emailVerified: currentFbUser?.emailVerified,
      isAnonymous: currentFbUser?.isAnonymous,
      tenantId: currentFbUser?.tenantId,
      providerInfo: currentFbUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Boot connection verification helper
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) {
    return false;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connection pending:', error.message);
      return false;
    }
    // A permission-denied or document-not-found means server reached successfully
    return true;
  }
}
