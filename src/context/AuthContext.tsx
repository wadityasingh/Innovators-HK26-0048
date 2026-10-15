import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleAuthProvider, testFirestoreConnection } from '../lib/firebase';
import { getFirestoreUser, createOrUpdateUserDoc, UserDocData } from '../lib/firestoreService';
import { AuthenticatedUser, SystemRole, UserProfile } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  authUser: AuthenticatedUser | null;
  demoUser: UserProfile;
  activeUser: UserProfile;
  appMode: 'real' | 'demo';
  isLoading: boolean;
  firestoreConnected: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    role: SystemRole,
    departmentId?: string,
    departmentName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setAppMode: (mode: 'real' | 'demo') => void;
  setDemoUser: (user: UserProfile) => void;
  clearAuthError: () => void;
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known initial admin email from project metadata
const ADMIN_BOOTSTRAP_EMAIL = 'sadityasingh6275520@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);
  const [demoUser, setDemoUser] = useState<UserProfile>(CURRENT_USER);
  const [appMode, setAppMode] = useState<'real' | 'demo'>('real');
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreConnected, setFirestoreConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Test Firestore connection on load
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setFirestoreConnected(connected);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          let userDoc = await getFirestoreUser(fbUser.uid);

          // Bootstrap role if document does not exist yet
          if (!userDoc) {
            const isDefaultAdmin =
              fbUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
            const initialRole: SystemRole = isDefaultAdmin ? 'Admin' : 'Department Staff';

            userDoc = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Campus User',
              role: initialRole,
              departmentId: isDefaultAdmin ? undefined : 'dept-facilities',
              departmentName: isDefaultAdmin ? 'Campus Administration' : 'Facilities & Operations',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await createOrUpdateUserDoc(userDoc);
          }

          setAuthUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: userDoc.displayName || fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: userDoc.role,
            departmentId: userDoc.departmentId,
            departmentName: userDoc.departmentName,
            buildingId: userDoc.buildingId,
            buildingName: userDoc.buildingName,
          });

          // Authenticated users default to real mode
          setAppMode('real');
        } catch (err: unknown) {
          console.error('Failed to load user profile doc from Firestore:', err);
          // Still create a minimal authenticated session object
          setAuthUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || 'Campus User',
            photoURL: fbUser.photoURL,
            role:
              fbUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()
                ? 'Admin'
                : 'Department Staff',
          });
        }
      } else {
        setFirebaseUser(null);
        setAuthUser(null);
        // When unauthenticated, user is in demo mode
        setAppMode('demo');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserDoc = async () => {
    if (!firebaseUser) return;
    try {
      const userDoc = await getFirestoreUser(firebaseUser.uid);
      if (userDoc) {
        setAuthUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: userDoc.displayName,
          photoURL: firebaseUser.photoURL,
          role: userDoc.role,
          departmentId: userDoc.departmentId,
          departmentName: userDoc.departmentName,
          buildingId: userDoc.buildingId,
          buildingName: userDoc.buildingName,
        });
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Sign-in cancelled: login window was closed before completion.');
      } else if (msg.includes('auth/unauthorized-domain')) {
        setAuthError(
          'OAuth Domain authorization notice: please add this app domain to Authorized Domains in Firebase Console > Authentication > Settings.'
        );
      } else {
        setAuthError(msg);
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
        setAuthError('Invalid email or password. Please verify your credentials.');
      } else if (msg.includes('auth/operation-not-allowed')) {
        setAuthError(
          'Email/Password sign-in is not yet enabled in your Firebase Console. Go to Authentication > Sign-in method > Enable Email/Password.'
        );
      } else {
        setAuthError(msg);
      }
      throw err;
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    role: SystemRole,
    departmentId?: string,
    departmentName?: string
  ) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName });

      // Automatically assign Admin if matches the administrator bootstrap email
      const finalRole: SystemRole =
        email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() ? 'Admin' : role;

      const newUserDoc: UserDocData = {
        uid: cred.user.uid,
        email,
        displayName,
        role: finalRole,
        departmentId: departmentId || 'dept-facilities',
        departmentName: departmentName || 'Facilities & Operations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createOrUpdateUserDoc(newUserDoc);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/email-already-in-use')) {
        setAuthError('An account with this email address already exists. Please log in.');
      } else if (msg.includes('auth/weak-password')) {
        setAuthError('Password must be at least 6 characters long.');
      } else if (msg.includes('auth/operation-not-allowed')) {
        setAuthError(
          'Email/Password provider is disabled. Please enable it in Firebase Console > Authentication > Sign-in method.'
        );
      } else {
        setAuthError(msg);
      }
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
    setAppMode('demo');
  };

  const clearAuthError = () => setAuthError(null);

  // Map active profile for existing UI components seamlessly
  const activeUser: UserProfile =
    appMode === 'real' && authUser
      ? {
          id: authUser.uid,
          name: authUser.displayName || authUser.email || 'Campus User',
          email: authUser.email || '',
          role:
            authUser.role === 'Admin'
              ? 'Campus Sustainability Manager'
              : authUser.role === 'Sustainability Coordinator'
              ? 'Facilities Energy Coordinator'
              : 'Department Energy Liaison',
          systemRole: authUser.role,
          department: authUser.departmentName || 'Campus Administration',
          departmentId: authUser.departmentId,
          avatarInitials:
            (authUser.displayName || authUser.email || 'CU')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2) || 'CU',
        }
      : demoUser;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        authUser,
        demoUser,
        activeUser,
        appMode,
        isLoading,
        firestoreConnected,
        authError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        setAppMode,
        setDemoUser,
        clearAuthError,
        refreshUserDoc,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
