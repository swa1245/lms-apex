import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Database,
  Lock,
  Unlock,
  KeyRound,
  Building2,
  Sliders,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Server,
  Layers,
  GraduationCap,
  CreditCard,
  School,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalStorageSize, exportFullDatabase, clearAllLocalDatabase } from '../data/localStorageManager';

export const SuperAdminDashboard: React.FC = () => {
  const {
    setCurrentRoute,
    activeUserRole,
    setActiveUserRole,
    institutionConfig,
    students,
    classes,
    parents,
    pendingFees,
    expenses,
    auditLogs,
    featureToggles,
    setFeatureToggles,
    users,
    showToast,
    resetToDemoData,
    clearAllData,
    maintenanceMode,
    updateMaintenanceMode,
  } = useApp();

  const [confirmCleanModal, setConfirmCleanModal] = useState(false);

  const storageInfo = getLocalStorageSize();

  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceMode;
    try {
      await updateMaintenanceMode(nextState);
      showToast(
        nextState ? 'Maintenance Mode Engaged' : 'System Live for All Users',
        nextState ? 'Standard users and parents will see maintenance notice.' : 'All users can access standard portals normally.',
        nextState ? 'warning' : 'success'
      );
    } catch (err: unknown) {
      showToast(
        'Maintenance update failed',
        err instanceof Error ? err.message : 'Could not update account settings.',
        'danger',
      );
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex_school_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database Backup Exported', 'Full JSON database file has been saved to your downloads.', 'success');
  };

  const handleCleanWipe = () => {
    clearAllData();
    setConfirmCleanModal(false);
  };

  // Quick privilege cards
  const superAdminModules = [
    {
      title: 'Omni-Access Master Hub',
      desc: 'All 11 system domains, 35+ administrative endpoints & complete operational launchpad',
      icon: Layers,
      route: 'superadmin/master-access',
      color: 'from-amber-600 to-indigo-700',
      badge: 'ALL-ACCESS ROOT'
    },
    {
      title: 'User & Role Control',
      desc: 'Govern all 7 user roles, credentials, permissions, and session impersonation',
      icon: Users,
      route: 'superadmin/users-roles',
      color: 'from-blue-600 to-indigo-600',
      badge: `${users.length} Accounts`
    },
    {
      title: 'Institution Master Setup',
      desc: 'School profile, multiple branches, affiliation numbers, and academic sessions',
      icon: Building2,
      route: 'superadmin/institution-setup',
      color: 'from-emerald-600 to-teal-700',
      badge: `${institutionConfig.branches.length} Campuses`
    },
    {
      title: 'Global Permission Matrix',
      desc: 'Granular view/edit/delete/export permissions per module across every role',
      icon: Sliders,
      route: 'superadmin/permissions',
      color: 'from-purple-600 to-violet-800',
      badge: 'RBAC Active'
    },
    {
      title: 'Local Database & Backups',
      desc: 'Full JSON backup export, JSON restore import, storage manager, and clean wipe',
      icon: Database,
      route: 'superadmin/database-manager',
      color: 'from-amber-500 to-orange-600',
      badge: `${storageInfo.sizeKb} KB Stored`
    },
    {
      title: 'Security & Audit Logs',
      desc: 'Real-time chronological audit trail of all staff logins, fees, and mutations',
      icon: ShieldCheck,
      route: 'superadmin/audit-logs',
      color: 'from-slate-700 to-slate-900',
      badge: `${auditLogs.length} Events`
    },
    {
      title: 'System Health & Diagnostics',
      desc: 'Storage breakdown, quota diagnostics, cache purger, and schema integrity',
      icon: Activity,
      route: 'superadmin/system-health',
      color: 'from-sky-600 to-cyan-700',
      badge: 'Optimal (100%)'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Super Admin Golden Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>SUPER ADMIN ROOT ACCESS • UNRESTRICTED GOVERNANCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Super Administrator Command Center</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Full unhindered control over institution configuration, local storage persistence, role permissions, live user accounts, and direct module overrides.
            </p>
          </div>

          {/* Quick Root Operations */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setCurrentRoute('dashboard')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Exit to School Portal</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>

            <button
              onClick={() => setCurrentRoute('superadmin/database-manager')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Database Manager</span>
            </button>

            {import.meta.env.DEV && (
              <button
                onClick={() => setConfirmCleanModal(true)}
                className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clean Local Wipe</span>
              </button>
            )}
          </div>
        </div>

        {/* Live System Status Subbar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-slate-400 block text-[11px]">Database State</span>
              <span className="font-bold text-slate-100">Local Storage Active</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Storage Footprint</span>
            <span className="font-bold text-amber-300">{storageInfo.sizeKb} KB ({storageInfo.itemsCount} Keys)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Active Institution</span>
            <span className="font-bold text-slate-100 truncate">{institutionConfig.schoolName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Maintenance Mode</span>
            <span className={`font-bold ${maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`}>
              {maintenanceMode ? 'Locked (Maintenance)' : 'Online & Open'}
            </span>
          </div>
        </div>
      </div>

      {/* Role Impersonation / Test Role Simulator */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Live Role Switching & Impersonation Simulator</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly simulate what other campus roles experience while retaining instant Super Admin switch-back privileges.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
            Current Active Role: <span className="uppercase">{activeUserRole}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {(
            [
              { role: 'superadmin', label: 'Super Admin', desc: 'Root Master', color: 'border-amber-500 bg-amber-50/50 text-amber-900' },
              { role: 'principal', label: 'Principal', desc: 'Academic Admin', color: 'border-blue-400 bg-blue-50/50 text-blue-900' },
              { role: 'accountant', label: 'Accountant', desc: 'Finance Officer', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-900' },
              { role: 'teacher', label: 'Teacher', desc: 'Faculty Staff', color: 'border-purple-400 bg-purple-50/50 text-purple-900' },
              { role: 'admin', label: 'School Admin', desc: 'Operations', color: 'border-indigo-400 bg-indigo-50/50 text-indigo-900' },
              { role: 'parent', label: 'Parent', desc: 'Guardian App', color: 'border-pink-400 bg-pink-50/50 text-pink-900' },
              { role: 'student', label: 'Student', desc: 'Learner Portal', color: 'border-cyan-400 bg-cyan-50/50 text-cyan-900' }
            ] as const
          ).map(item => {
            const isSelected = activeUserRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => {
                  setActiveUserRole(item.role);
                  showToast(`Role Switched to ${item.label}`, `Now simulating ${item.desc} permissions.`, 'info');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${item.color} ring-2 ring-blue-500 font-bold shadow-xs`
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <span className="block text-xs font-bold leading-tight">{item.label}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-extrabold mt-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Super Admin Master Hub Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Super Admin Governance Suite</h2>
            <p className="text-xs text-slate-500">Dedicated management consoles exclusive to Super Administrators</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {superAdminModules.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.route}
                onClick={() => setCurrentRoute(mod.route)}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Console</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Global Module Access Matrix */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Direct Module Access & Admin Override Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Super Administrator has direct unrestricted bypass access to every operational module in the institution.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Student Admissions', route: 'students/student-list', icon: GraduationCap, count: `${students.length} Records` },
            { label: 'Parent Directory', route: 'parents/parent-list', icon: Users, count: `${parents.length} Guardians` },
            { label: 'Classes & Batches', route: 'classes/class-list', icon: School, count: `${classes.length} Classes` },
            { label: 'Fee Collection POS', route: 'fees/fee-collection', icon: CreditCard, count: `${pendingFees.length} Pending` },
            { label: 'Daily Attendance', route: 'attendance/daily-attendance', icon: Calendar, count: 'Live Register' },
            { label: 'Campus Expenses', route: 'expenses/expense-list', icon: Server, count: `${expenses.length} Logged` },
            { label: 'Timetable Matrix', route: 'classes/timetable', icon: Calendar, count: 'Master Slots' },
            { label: 'Staff Directory', route: 'classes/teacher-assignment', icon: UserCheck, count: 'Faculty' },
            { label: 'General Settings', route: 'settings/general', icon: Sliders, count: 'Config' }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => setCurrentRoute(item.route)}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-300 transition-all text-left group cursor-pointer"
              >
                <Icon className="w-5 h-5 text-slate-700 group-hover:text-indigo-600 transition-colors mb-2" />
                <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600 leading-tight">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Control & System Maintenance Box */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Emergency Maintenance & System Lock</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Lock student/parent portal access during fiscal audits, database migrations, or fee structure re-configurations. Super Admins retain full access.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleToggleMaintenance}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                maintenanceMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {maintenanceMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{maintenanceMode ? 'Maintenance Mode ACTIVE' : 'Enable Maintenance Lock'}</span>
            </button>

            {import.meta.env.DEV && (
              <button
                onClick={resetToDemoData}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                title="Populate Starter Data"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Load Starter Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clean Wipe (dev only) */}
      {import.meta.env.DEV && confirmCleanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Clean Wipe Local Database?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will remove all student records, fee receipts, parent accounts, and expenses from your browser's local storage and start with a fresh clean empty database.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
              Tip: You can re-populate sample starter records at any time using the "Load Starter Data" button.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmCleanModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanWipe}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Yes, Clean Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
