import React, { useEffect, useMemo, useState } from 'react';
import {
  School,
  Save,
  Shield,
  Database,
  Download,
  RefreshCw,
  Plus,
  Mail,
  Phone,
  BadgeCheck,
  UserRound,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, Modal, PageHeader, Select } from '../../components/ui';
import type { UserRole } from '../../types';
import { backendClient } from '../../api/backendClient';
import { LOCAL_ONLY } from '../../config/localMode';

const INVITE_ROLES: UserRole[] = ['teacher', 'principal', 'accountant'];

const STAFF_ROLES: UserRole[] = ['admin', ...INVITE_ROLES];

const ROLE_LABEL: Record<string, string> = {
  admin: 'School Administrator',
  principal: 'Principal',
  accountant: 'Accountant',
  teacher: 'Teacher',
};

const ROLE_PERMISSIONS: Record<string, string> = {
  admin: 'Full Operational Access',
  principal: 'Academic & Institutional Governance',
  accountant: 'Fees & Expenses',
  teacher: 'Academic & Staff',
};

const emptyInvite = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'teacher' as UserRole,
  department: 'Academics',
};

export const UserManagementPage: React.FC = () => {
  const { users, inviteStaffUser, showToast, institutionConfig } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState(emptyInvite);
  const [inviting, setInviting] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);

  const staff = useMemo(
    () => users.filter((u) => u.role !== 'superadmin' && STAFF_ROLES.includes(u.role)),
    [users],
  );

  const openInvite = () => {
    setForm(emptyInvite);
    setInviteOpen(true);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      showToast('Missing Fields', 'Name and email are required.', 'warning');
      return;
    }
    if (form.password && form.password.length < 8) {
      showToast('Weak Password', 'Password must be at least 8 characters.', 'warning');
      return;
    }

    setInviting(true);
    try {
      const result = await inviteStaffUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        department: form.department.trim() || 'General',
        assignedBranch: institutionConfig.branches[0]?.name || 'Main Campus',
        password: form.password.trim() || undefined,
      });
      setInviteOpen(false);
      setForm(emptyInvite);
      if (result.temporaryPassword) {
        setCreatedCreds({
          email: result.staff.email,
          password: result.temporaryPassword,
        });
      }
    } catch (err: unknown) {
      showToast('Invite Failed', err instanceof Error ? err.message : 'Could not invite staff.', 'danger');
    } finally {
      setInviting(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  return (
    <div className="cms-page space-y-5">
      <PageHeader
        title="Staff Accounts & Role-Based Access Control"
        description="Manage administrative roles, faculty logins, and module authorization permissions"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openInvite}>
            Invite Staff
          </Button>
        }
      />

      <div className="cms-panel overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider dark:bg-slate-800/50 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Staff Name</th>
              <th className="py-3.5 px-3">Designation / Role</th>
              <th className="py-3.5 px-3">Login Email</th>
              <th className="py-3.5 px-3">Module Permissions</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No staff accounts yet. Click Invite Staff to add one.
                </td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                        {s.name.split(' ').slice(-1)[0]?.[0] || 'S'}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                    {ROLE_LABEL[s.role] || s.role}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">{s.email}</td>
                  <td className="py-3.5 px-3">
                    <span className="rounded-lg bg-blue-50 px-2 py-1 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {ROLE_PERMISSIONS[s.role] || s.department || 'Assigned modules'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        s.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        size="md"
        title="Create staff login"
        description="No email is sent — share the password with the staff member yourself"
        icon={<UserPlus className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="invite-staff-form" loading={inviting}>
              Create account
            </Button>
          </>
        }
      >
        <form id="invite-staff-form" onSubmit={handleInvite} className="grid gap-4">
          <div>
            <label className="cms-label">Full name</label>
            <input
              className={field}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Mrs. Sunita Dixit"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="cms-label">Login email</label>
            <input
              type="email"
              className={field}
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="staff@school.edu"
              required
            />
          </div>
          <div>
            <label className="cms-label">Temporary password (optional)</label>
            <input
              type="text"
              className={field}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Leave blank to auto-generate"
              minLength={8}
              autoComplete="new-password"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              If blank, a password is generated and shown once after create.
            </p>
          </div>
          <div>
            <label className="cms-label">Phone</label>
            <input
              type="tel"
              className={field}
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 …"
            />
          </div>
          <div>
            <label className="cms-label">Role</label>
            <Select
              value={form.role}
              onChange={(value) => setForm((prev) => ({ ...prev, role: value as UserRole }))}
              options={INVITE_ROLES.map((role) => ({
                value: role,
                label: ROLE_LABEL[role] || role,
              }))}
            />
          </div>
          <div>
            <label className="cms-label">Department</label>
            <input
              className={field}
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              placeholder="Academics"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(createdCreds)}
        onClose={() => setCreatedCreds(null)}
        size="md"
        title="Share these login details"
        description="Copy and send them manually — this password is shown only once"
        icon={<BadgeCheck className="h-5 w-5" />}
        footer={
          <Button
            type="button"
            onClick={async () => {
              if (!createdCreds) return;
              const text = `Email: ${createdCreds.email}\nPassword: ${createdCreds.password}`;
              try {
                await navigator.clipboard.writeText(text);
                showToast('Copied', 'Login details copied to clipboard.', 'success');
              } catch {
                showToast('Copy failed', 'Select and copy the details manually.', 'warning');
              }
              setCreatedCreds(null);
            }}
          >
            Copy & close
          </Button>
        }
      >
        {createdCreds && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</div>
              <div className="mt-0.5 font-mono font-semibold text-slate-800 dark:text-slate-100">{createdCreds.email}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</div>
              <div className="mt-0.5 font-mono font-semibold text-slate-800 dark:text-slate-100">{createdCreds.password}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const BackupRestorePage: React.FC = () => {
  const { students, expenses, parents, showToast } = useApp();

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0',
      students,
      parents,
      expenses,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup Exported', 'Full institutional local database exported as JSON.', 'success');
  };

  const handleResetData = () => {
    if (!import.meta.env.DEV) return;
    if (confirm('Are you sure you want to reset all mock data to factory defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="cms-page space-y-5">
      <PageHeader
        title="Database Backup & Export"
        description="Safely export a snapshot of the locally cached institutional data"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cms-panel flex flex-col justify-between gap-5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Export local database snapshot</h3>
              <p className="mt-1 text-xs text-slate-500">
                Download complete student, fee, and expense records as formatted JSON
              </p>
            </div>
          </div>
          <Button leftIcon={<Download className="h-4 w-4" />} onClick={handleExportBackup}>
            Download Backup
          </Button>
        </div>

        {import.meta.env.DEV && <div className="cms-panel flex flex-col justify-between gap-5 border-rose-200/80 p-5 sm:p-6 dark:border-rose-900/50">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-800 dark:text-rose-200">Factory reset demonstration data</h3>
              <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-300/80">
                Clears browser localStorage and restores the original clean dataset
              </p>
            </div>
          </div>
          <Button variant="danger" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={handleResetData}>
            Reset to Factory
          </Button>
        </div>}
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const {
    showToast,
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setUsers,
    academicYear,
    setCurrentRoute,
  } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setDesignation(currentUser.designation || '');
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Profile Unavailable', 'Sign in again before updating your profile.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updated = isAuthenticated && !LOCAL_ONLY
        ? await backendClient.updateProfile(currentUser.id, {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            designation: designation.trim() || undefined,
          })
        : {
            ...currentUser,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            designation: designation.trim() || undefined,
          };
      setCurrentUser(updated);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === updated.id
            ? {
                ...user,
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                department: updated.designation || user.department,
              }
            : user,
        ),
      );
      localStorage.setItem('smartlearning_current_user', JSON.stringify(updated));
      showToast('Profile Saved', 'Your profile details were updated successfully.', 'success');
    } catch (err: unknown) {
      showToast(
        'Profile Save Failed',
        err instanceof Error ? err.message : 'Could not update your profile.',
        'danger',
      );
    } finally {
      setSaving(false);
    }
  };

  const initial = (name || 'A').trim().charAt(0).toUpperCase();
  const sessionLabel = academicYear || '2026–2027';
  const field =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  return (
    <div className="cms-page space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Administrator Profile"
        description="Identity and contact details for your admin account"
        actions={
          <Button type="submit" form="admin-profile-form" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Update Profile
          </Button>
        }
      />

      <form id="admin-profile-form" onSubmit={handleSave} className="space-y-5">
        <section className="cms-panel overflow-hidden">
          <div className="relative isolate px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(37,99,235,0.14),transparent_55%),radial-gradient(90%_70%_at_100%_10%,rgba(14,165,233,0.12),transparent_50%),linear-gradient(180deg,#f8fbff_0%,#ffffff_72%)]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.45) 1px, transparent 0)',
                backgroundSize: '18px 18px',
              }}
            />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-blue-600 to-sky-500 text-4xl font-bold tracking-tight text-white shadow-[0_18px_40px_-18px_rgba(37,99,235,0.85)] ring-4 ring-white">
                  {initial}
                </div>

                <div className="min-w-0 pb-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                      <Shield className="h-3 w-3" />
                      Administrator
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                    {name || 'Administrator'}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{designation}</p>
                </div>
              </div>

              <div className="grid w-full gap-2.5 sm:grid-cols-3 lg:max-w-xl">
                <div className="rounded-2xl border border-white/70 bg-white/80 px-3.5 py-3 shadow-sm backdrop-blur-sm">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <Mail className="h-3 w-3 text-blue-500" />
                    Email
                  </div>
                  <p className="truncate text-xs font-semibold text-slate-800">{email}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 px-3.5 py-3 shadow-sm backdrop-blur-sm">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <Phone className="h-3 w-3 text-blue-500" />
                    Phone
                  </div>
                  <p className="truncate text-xs font-semibold text-slate-800">{phone}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 px-3.5 py-3 shadow-sm backdrop-blur-sm">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <School className="h-3 w-3 text-blue-500" />
                    Session
                  </div>
                  <p className="truncate text-xs font-semibold text-slate-800">{sessionLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cms-panel overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal details</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Shown on receipts, notices, and your header profile
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <label className="cms-label">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="cms-label">Official email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                placeholder="admin@school.edu"
              />
            </div>
            <div>
              <label className="cms-label">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={field}
                placeholder="+91 …"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="cms-label">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={field}
                placeholder="Role title"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/30 sm:px-6">
            <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
              Save changes
            </Button>
          </div>
        </section>
      </form>

      <section className="cms-panel p-5 sm:p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Legal &amp; compliance</h3>
        <p className="mt-1 text-xs text-slate-500">
          Production policies aligned with India’s Digital Personal Data Protection Act, 2023 (DPDP Act).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setCurrentRoute('legal/privacy')}>
            Privacy Policy
          </Button>
          <Button type="button" variant="secondary" onClick={() => setCurrentRoute('legal/terms')}>
            Terms &amp; Conditions
          </Button>
        </div>
      </section>
    </div>
  );
};

export const UsersAndRolesPage = UserManagementPage;
