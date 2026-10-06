import React, { useState } from 'react';
import {
  Lock,
  Mail,
  AlertCircle,
  GraduationCap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { backendClient } from '../../api/backendClient';
import type { AuthUser } from '../../types/auth';
import { getErrorMessage } from '../../utils/errors';
import { LOCAL_ONLY, verifyLocalPassword } from '../../config/localMode';
import { DEFAULT_USERS } from '../../data/localStorageManager';
import type { UserAccount } from '../../types';
import { LegalDocumentPage, type LegalDoc } from '../../pages/legal/LegalPages';

const FEATURES = [
  { n: 1, title: 'Student Management', text: 'Admissions, profiles & class allocation' },
  { n: 2, title: 'Fee Management', text: 'Collections, dues & payment tracking' },
  { n: 3, title: 'Attendance & Exams', text: 'Daily registers, schedules & results' },
] as const;

export const AuthPage: React.FC = () => {
  const { showToast, setCurrentUser, setIsAuthenticated, setCurrentRoute, users, completeStudentPasswordReset } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const [resetAccount, setResetAccount] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const activeStep = 1;

  if (legalDoc) {
    return <LegalDocumentPage doc={legalDoc} onBack={() => setLegalDoc(null)} />;
  }

  const finishAuth = (profile: AuthUser) => {
    setCurrentUser(profile);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('smartlearning_current_user', JSON.stringify(profile));
    } catch {
      // ignore
    }
    showToast('Welcome back', `Signed in as ${profile.name || profile.email}`, 'success');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (LOCAL_ONLY) {
        const normalized = email.trim().toLowerCase();
        const match =
          users.find((user) => user.email.toLowerCase() === normalized) ||
          DEFAULT_USERS.find((user) => user.email.toLowerCase() === normalized);
        if (!match) {
          setErrorMessage('No account for that email.');
          return;
        }
        if (match.status === 'Suspended') {
          setErrorMessage('This account is suspended. Ask an administrator to reactivate it.');
          return;
        }
        if (!verifyLocalPassword(email, password, match.role)) {
          setErrorMessage(
            match.role === 'student'
              ? 'Wrong password. Use the temporary password from the school, or the new password you created.'
              : 'Wrong password.',
          );
          return;
        }
        if (match.role === 'student' && match.mustChangePassword) {
          setResetAccount(match);
          setNewPassword('');
          setConfirmPassword('');
          setInfoMessage('');
          return;
        }
        finishAuth({
          id: match.id,
          name: match.name,
          email: match.email,
          role: match.role,
          phone: match.phone,
          designation: match.department,
          studentId: match.studentId,
          mustChangePassword: false,
        });
        setCurrentRoute(match.role === 'student' ? 'student/home' : 'dashboard');
        return;
      }

      const res = await backendClient.signin({ email: email.trim(), password });
      const profile: AuthUser = res.profile || {
        id: res.user?.id || 'unknown',
        name: res.user?.user_metadata?.name || res.user?.email || email.trim(),
        email: res.user?.email || email.trim(),
        role: 'admin',
      };
      finishAuth(profile);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full h-12 rounded-2xl border border-transparent bg-[#F3F4F6] px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10';

  return (
    <div className="min-h-screen w-full bg-gray-300 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-6xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] grid lg:grid-cols-[1.25fr_1fr] min-h-[680px] lg:p-2.5 lg:gap-2.5">
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-[1.35rem] bg-[#1E4ED8] p-9 xl:p-10 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(96,200,255,0.85),transparent_55%),radial-gradient(ellipse_at_20%_80%,rgba(37,99,235,0.9),transparent_50%),linear-gradient(160deg,#1D4ED8_0%,#2563EB_40%,#38BDF8_100%)]" />
          <div className="pointer-events-none absolute -right-10 top-10 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-blue-800/50 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.35),transparent_40%)]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <p className="text-lg font-bold tracking-tight">Campus LMS</p>
            </div>

            <div className="mt-16 max-w-md">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                Secure access
              </span>
              <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[1.08] tracking-tight">
                Welcome back
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-white/90">
                Staff manage the school. Students sign in to see their profile, assignments, quizzes, and attendance.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            {FEATURES.map((item) => {
              const active = item.n === activeStep;
              return (
                <div
                  key={item.n}
                  className={`rounded-2xl border p-3.5 transition ${
                    active
                      ? 'border-transparent bg-white text-slate-900 shadow-lg shadow-blue-950/20'
                      : 'border-white/25 bg-white/10 text-white backdrop-blur-md'
                  }`}
                >
                  <div
                    className={`mb-2.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      active ? 'bg-[#2F6BFF] text-white' : 'bg-white/25 text-white'
                    }`}
                  >
                    {item.n}
                  </div>
                  <p className={`text-[12px] font-bold leading-snug ${active ? 'text-slate-900' : 'text-white'}`}>
                    {item.title}
                  </p>
                  <p className={`mt-1 text-[11px] leading-snug ${active ? 'text-slate-500' : 'text-white/80'}`}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col justify-center rounded-[1.35rem] bg-white px-6 py-8 sm:px-10 lg:px-10 xl:px-12">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F6BFF] text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <p className="text-base font-bold text-slate-900">Campus LMS</p>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            {resetAccount ? (
              <>
                <h2 className="text-center text-[1.65rem] font-bold tracking-tight text-slate-900">Set a new password</h2>
                <p className="mt-1.5 text-center text-sm text-slate-500">
                  This is your first sign-in for {resetAccount.email}. The school password was temporary. Choose a new one, then sign in with it.
                </p>
                {errorMessage ? (
                  <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                ) : null}
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setErrorMessage('');
                    if (newPassword.trim().length < 8) {
                      setErrorMessage('Use at least 8 characters.');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setErrorMessage('The two passwords do not match.');
                      return;
                    }
                    try {
                      completeStudentPasswordReset(resetAccount.email, newPassword);
                      const savedEmail = resetAccount.email;
                      setResetAccount(null);
                      setEmail(savedEmail);
                      setPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setInfoMessage('Password saved. Sign in with your new password.');
                    } catch (error) {
                      setErrorMessage(error instanceof Error ? error.message : 'Could not save the password.');
                    }
                  }}
                >
                  <div className="space-y-1.5">
                    <label htmlFor="auth-new-password" className="block text-sm font-medium text-slate-600">New password</label>
                    <input
                      id="auth-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-slate-600">Confirm password</label>
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-xs font-semibold text-slate-500"
                  >
                    {showPassword ? 'Hide passwords' : 'Show passwords'}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#2F6BFF] text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,107,255,0.35)] transition hover:bg-[#2559E0]"
                  >
                    Save password
                  </button>
                </form>
              </>
            ) : (
              <>
            <h2 className="text-center text-[1.65rem] font-bold tracking-tight text-slate-900">Log In</h2>
            <p className="mt-1.5 text-center text-sm text-slate-500">
              Staff and students sign in here. Nothing is sent to a server.
            </p>

            {infoMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800">
                {infoMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            ) : null}

            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="auth-signin-email" className="block text-sm font-medium text-slate-600">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-signin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@school.com"
                    className={`${fieldClass} pl-11`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-signin-password" className="block text-sm font-medium text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-signin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${fieldClass} pl-11 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#2F6BFF] text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,107,255,0.35)] transition hover:bg-[#2559E0] disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Students use the email and temporary password from the school. The first sign-in asks for a new password. Records stay in this browser.
            </p>
              </>
            )}

            <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
              By continuing you agree to Campus LMS{' '}
              <button
                type="button"
                onClick={() => setLegalDoc('privacy')}
                className="font-medium text-[#2F6BFF] hover:underline"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setLegalDoc('terms')}
                className="font-medium text-[#2F6BFF] hover:underline"
              >
                Terms &amp; Conditions
              </button>
              , aligned with India’s DPDP Act, 2023.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
