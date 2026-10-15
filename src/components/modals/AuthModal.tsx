import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Shield,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SystemRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

const DEPARTMENTS_LIST = [
  { id: 'dept-facilities', name: 'Facilities & Mechanical Operations', building: 'Founders Administration Hall' },
  { id: 'dept-bio', name: 'Biological Sciences & Genomics', building: 'BioSciences Research Pavilion' },
  { id: 'dept-eng', name: 'Computer Science & Engineering', building: 'Science & Engineering Complex' },
  { id: 'dept-dining', name: 'Dining Hall & Food Services', building: 'University Dining & Student Hub' },
  { id: 'dept-residence', name: 'Residential Life & Housing', building: 'Alder Student Residences' },
  { id: 'dept-library', name: 'Campus Library & Digital Learning', building: 'Memorial Academic Library' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    authError,
    clearAuthError,
    isFirebaseConfigured,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<SystemRole>('Department Staff');
  const [departmentId, setDepartmentId] = useState('dept-facilities');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        if (!email.trim() || !password.trim()) {
          setLocalError('Please enter both email and password.');
          setIsSubmitting(false);
          return;
        }
        await loginWithEmail(email.trim(), password);
      } else {
        if (!displayName.trim() || !email.trim() || !password.trim()) {
          setLocalError('Please fill in all required fields.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        const selectedDept = DEPARTMENTS_LIST.find((d) => d.id === departmentId);
        await registerWithEmail(
          email.trim(),
          password,
          displayName.trim(),
          role,
          departmentId,
          selectedDept?.name
        );
      }
      onClose();
    } catch (err: unknown) {
      // Error handled by AuthContext state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {activeTab === 'login' ? 'Sign In to GreenCampus AI' : 'Create Campus Account'}
              </h2>
              <p className="text-[11px] text-emerald-300">
                Secure Firebase Authentication & RBAC Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              clearAuthError();
              setLocalError(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              clearAuthError();
              setLocalError(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Unconfigured notice */}
          {!isFirebaseConfigured && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-amber-950">Standalone Demo Mode</span>
                Firebase cloud keys are not configured for this domain. All application features, modules, and role views are accessible in offline demo mode.
              </div>
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{displayError}</div>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-medium text-slate-400">
              or use campus email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as SystemRole)}
                      className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-white"
                    >
                      <option value="Department Staff">Department Staff</option>
                      <option value="Sustainability Coordinator">
                        Sustainability Coordinator
                      </option>
                    </select>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Admin role requires bootstrap authorization
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department / Scope
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-white truncate"
                    >
                      {DEPARTMENTS_LIST.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-700" />
                    <span>Role Permissions Summary</span>
                  </div>
                  <div>
                    {role === 'Department Staff' ? (
                      <p>
                        Can record and modify readings only for your selected department, subject to review.
                      </p>
                    ) : (
                      <p>
                        Can review campus-wide readings, manage targets, alerts, and export reports.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs disabled:opacity-50 mt-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          {/* Footnote / notice */}
          <div className="pt-2 text-[11px] text-slate-500 text-center">
            {activeTab === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setActiveTab('register');
                    clearAuthError();
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setActiveTab('login');
                    clearAuthError();
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
