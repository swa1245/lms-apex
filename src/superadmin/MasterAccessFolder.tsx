import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  School,
  CreditCard,
  CalendarCheck,
  Wallet,
  Settings,
  Database,
  Sliders,
  Activity,
  CheckCircle2,
  KeyRound,
  Download,
  Building2,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  Layers,
  ChevronRight,
  HelpCircle,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportFullDatabase, getLocalStorageSize } from '../data/localStorageManager';

interface DomainSection {
  id: string;
  title: string;
  category: 'Super Admin Core' | 'Academic Operations' | 'Financial & Admin' | 'System & Reports';
  description: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  badge: string;
  statsLabel: string;
  statsValue: string | number;
  routes: {
    label: string;
    route: string;
    description: string;
    isPrimary?: boolean;
  }[];
}

export const MasterAccessFolder: React.FC = () => {
  const {
    setCurrentRoute,
    activeUserRole,
    setActiveUserRole,
    students,
    classes,
    parents,
    pendingFees,
    expenses,
    users,
    institutionConfig,
    stats,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [adminBypassMode, setAdminBypassMode] = useState(true);

  const storageInfo = getLocalStorageSize();

  const handleDownloadBackup = () => {
    const jsonStr = exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superadmin_omni_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Omni Backup Exported', 'Full JSON database export downloaded successfully.', 'success');
  };

  const domainSections: DomainSection[] = [
    {
      id: 'sa-root',
      title: 'Super Admin Root Governance',
      category: 'Super Admin Core',
      description: 'Master architecture, user credentials, database storage management, security audit logs, and global permissions.',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      badge: 'ROOT 100% ACCESS',
      statsLabel: 'System Accounts',
      statsValue: `${users.length} Active Users`,
      routes: [
        { label: 'Super Admin Command Center', route: 'superadmin/dashboard', description: 'Central KPI metrics, quick actions & system overview', isPrimary: true },
        { label: 'User & Role Control', route: 'superadmin/users-roles', description: 'Manage passwords, role privileges & new staff' },
        { label: 'Institution Master Setup', route: 'superadmin/institution-setup', description: 'School profile, branches, affiliations & sessions' },
        { label: 'Global Permission Matrix', route: 'superadmin/permissions', description: 'Granular RBAC view/create/edit/delete matrix' },
        { label: 'Local DB & Backups', route: 'superadmin/database-manager', description: 'JSON backup export, import, storage manager & wipe' },
        { label: 'Security & Audit Logs', route: 'superadmin/audit-logs', description: 'Chronological activity & authorization audit trail' },
        { label: 'System Health & Diagnostics', route: 'superadmin/system-health', description: 'Storage quota, cache integrity & system metrics' }
      ]
    },
    {
      id: 'students-domain',
      title: 'Student Admissions & Lifecycle',
      category: 'Academic Operations',
      description: 'Complete student registry, new admission wizard, 360-degree student profiles, parent link, and document archive.',
      icon: GraduationCap,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      badge: 'STUDENT REGISTRY',
      statsLabel: 'Enrolled Students',
      statsValue: `${students.length} Records`,
      routes: [
        { label: 'Student Directory', route: 'students/student-list', description: 'Master directory with filter, search & quick actions', isPrimary: true },
        { label: 'Add New Student', route: 'students/add-student', description: 'Multi-step admission onboarding wizard', isPrimary: true },
        { label: 'Student Profile 360°', route: 'students/student-profile', description: 'Academic, financial, attendance & parent profile' },
        { label: 'Parent Details', route: 'students/parent-details', description: 'Guardian contacts, profession & residential address' },
        { label: 'Document Locker', route: 'students/documents', description: 'Birth certificates, transfer certs & ID proofs' },
        { label: 'Student History', route: 'students/student-history', description: 'Past grades, promotions & conduct timeline' }
      ]
    },
    {
      id: 'parents-domain',
      title: 'Parents & Family Network',
      category: 'Academic Operations',
      description: 'Parent registry, guardian credentials, multi-child mapping, and parent payment history.',
      icon: Users,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      badge: 'FAMILY HUB',
      statsLabel: 'Registered Parents',
      statsValue: `${parents.length} Parents`,
      routes: [
        { label: 'Parent List', route: 'parents/parent-list', description: 'Directory of all enrolled student guardians', isPrimary: true },
      ]
    },
    {
      id: 'classes-domain',
      title: 'Classes, Batches & Master Timetable',
      category: 'Academic Operations',
      description: 'Class divisions, batch creation, curriculum subjects, faculty assignment, and weekly master timetables.',
      icon: School,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'CURRICULUM & TIMETABLE',
      statsLabel: 'Active Classes',
      statsValue: `${classes.length} Classes`,
      routes: [
        { label: 'Class List', route: 'classes/class-list', description: 'Class overview, section capacities & teachers', isPrimary: true },
        { label: 'Batch Management', route: 'classes/batch-management', description: 'Academic cohorts, sections & promotion batches' },
        { label: 'Subject Directory', route: 'classes/subjects', description: 'Curriculum subjects, codes & theory/practical tags' },
        { label: 'Teacher Assignment', route: 'classes/teacher-assignment', description: 'Assign class teachers and subject educators' },
        { label: 'Master Timetable', route: 'classes/timetable', description: 'Weekly schedule planner & room allocation' }
      ]
    },
    {
      id: 'fees-domain',
      title: 'Fees, Billing & POS Financial Engine',
      category: 'Financial & Admin',
      description: 'Fee structures, POS collection desk, overdue defaulter manager, partial installment plans, and printed receipts.',
      icon: CreditCard,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      badge: 'FINANCIAL POS',
      statsLabel: 'Total Collected',
      statsValue: `₹${stats.totalFeeCollection.toLocaleString('en-IN')}`,
      routes: [
        { label: 'Fee Structure', route: 'fees/fee-structure', description: 'Add and manage academic fee heads', isPrimary: true },
        { label: 'Student Fee Ledgers', route: 'fees/student-fees', description: 'Individual dues, discounts & balances' },
        { label: 'Fee Collection POS', route: 'fees/fee-collection', description: 'Instant fee collection terminal with receipt print' },
        { label: 'Pending & Partial', route: 'fees/pending-fees', description: 'Outstanding and partial payment list' },
        { label: 'Payment History & Receipts', route: 'fees/payment-history', description: 'Transactions and receipts in one place' },
      ]
    },
    {
      id: 'attendance-domain',
      title: 'Attendance & Biometrics Tracking',
      category: 'Academic Operations',
      description: 'Daily class attendance roll-call, individual student attendance history, and monthly attendance reporting.',
      icon: CalendarCheck,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      badge: 'DAILY ROLL CALL',
      statsLabel: 'Today Attendance',
      statsValue: `${stats.todayAttendanceRate}% Avg`,
      routes: [
        { label: 'Daily Attendance', route: 'attendance/daily-attendance', description: 'Quick section roll call with Present/Absent/Late', isPrimary: true },
        { label: 'Student Attendance Profile', route: 'attendance/student-attendance', description: 'Individual student monthly attendance calendar' },
        { label: 'Batch Attendance', route: 'attendance/batch-attendance', description: 'Batch-wise daily logs and faculty records' },
        { label: 'Attendance Reports', route: 'attendance/attendance-reports', description: 'Monthly summaries, defaulter lists & analytics' }
      ]
    },
    {
      id: 'expenses-domain',
      title: 'Institutional Expenses & Accounts',
      category: 'Financial & Admin',
      description: 'Operational expense ledger, category management, vendor disbursements, and income vs expense summaries.',
      icon: Wallet,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      badge: 'ACCOUNTS & EXPENSES',
      statsLabel: 'Total Expenses',
      statsValue: `${expenses.length} Records`,
      routes: [
        { label: 'Expense Entry', route: 'expenses/expense-entry', description: 'Record vouchers, utility bills & maintenance costs', isPrimary: true },
      ]
    },
    {
      id: 'settings-domain',
      title: 'System Settings & Infrastructure',
      category: 'System & Reports',
      description: 'General system settings, fee rules, academic year configuration, and backup restoration.',
      icon: Settings,
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-500/10 border-slate-500/20',
      badge: 'CONFIGURATION',
      statsLabel: 'Academic Year',
      statsValue: institutionConfig.academicYear,
      routes: [
        { label: 'Profile', route: 'settings/profile', description: 'Administrator identity', isPrimary: true },
        { label: 'Users & Roles', route: 'settings/users-roles', description: 'Administrative staff logins and assignments' },
        { label: 'Backup & Restore', route: 'settings/backup-restore', description: 'Local storage database snapshot & recovery' }
      ]
    }
  ];

  // Filtering
  const filteredDomains = domainSections.filter(domain => {
    const matchesCategory = selectedCategory === 'All' || domain.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      domain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.routes.some(r => r.label.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Super Admin Core', 'Academic Operations', 'Financial & Admin', 'System & Reports'];

  return (
    <div className="space-y-6 pb-12">
      {/* Super Admin Golden Omni-Access Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>APP DEVELOPER ROOT ACCESS • UNRESTRICTED INFRASTRUCTURE SUITE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>App Developer Omni-Access Master Suite</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Complete, unhindered root control across all system domains. As the App Developer / Super Administrator, you operate at the core infrastructure layer with 100% unrestricted access to every database table, permission matrix, ledger, and diagnostics tool without being listed inside regular school staff directories.
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
              onClick={() => setCurrentRoute('superadmin/dashboard')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Command Center</span>
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
          </div>
        </div>

        {/* Live System Footprint */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-slate-400 block text-[11px]">Omni Access Privileges</span>
              <span className="font-bold text-amber-300">Root / Full Administrative Control</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Database Persistence</span>
            <span className="font-bold text-slate-100">{storageInfo.sizeKb} KB (Clean Local Storage)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Institution & Branches</span>
            <span className="font-bold text-slate-100">{institutionConfig.schoolName} ({institutionConfig.branches.length} Campuses)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Admin Access Mode</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Modules Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* Super Admin Quick Launchpad (Instant Access Dock) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Super Admin Direct Action Launchpad</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant 1-click execution shortcuts for all primary Super Admin and Admin workflows across the campus.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
            10 Express Access Channels
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Admit New Student', route: 'students/add-student', icon: GraduationCap, color: 'hover:border-blue-500 bg-blue-50/50 text-blue-900' },
            { label: 'Collect Fee POS', route: 'fees/fee-collection', icon: CreditCard, color: 'hover:border-teal-500 bg-teal-50/50 text-teal-900' },
            { label: 'Create / View Classes', route: 'classes/class-list', icon: School, color: 'hover:border-emerald-500 bg-emerald-50/50 text-emerald-900' },
            { label: 'Mark Attendance', route: 'attendance/daily-attendance', icon: CalendarCheck, color: 'hover:border-cyan-500 bg-cyan-50/50 text-cyan-900' },
            { label: 'Record Expense', route: 'expenses/expense-entry', icon: Wallet, color: 'hover:border-rose-500 bg-rose-50/50 text-rose-900' },
            { label: 'User & Password Control', route: 'superadmin/users-roles', icon: Users, color: 'hover:border-indigo-500 bg-indigo-50/50 text-indigo-900' },
            { label: 'Institution Master Setup', route: 'superadmin/institution-setup', icon: Building2, color: 'hover:border-amber-500 bg-amber-50/50 text-amber-900' },
            { label: 'Database Backup & Reset', route: 'superadmin/database-manager', icon: Database, color: 'hover:border-slate-500 bg-slate-100 text-slate-900' }
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.route}
                onClick={() => setCurrentRoute(action.route)}
                className={`p-3 rounded-xl border border-slate-200/80 transition-all flex flex-col items-start gap-2 text-left cursor-pointer group hover:shadow-md ${action.color}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4 text-slate-800" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight group-hover:text-blue-600 transition-colors">
                    {action.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Jump to Module →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Super Admin vs Admin Privilege Comparison Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 border border-indigo-900/80 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Super Admin Omnipotence Matrix</h3>
              <p className="text-xs text-slate-300">You automatically inherit and surpass all permissions granted to regular School Admins.</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 self-start sm:self-auto">
            Active Role: SUPER ADMIN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Exclusive Super Admin Powers
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Full Local Storage database export, import, and clean factory reset.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Creation, credential reset, and deletion of all user accounts (including Admin & Principal).</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Dynamic RBAC permissions editing and feature toggle governance.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Institution profile, multiple campuses, and academic year configuration.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Real-time security audit trails and system diagnostics.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="font-bold text-blue-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" /> Complete Admin Academic & Financial Access
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Direct student admissions, editing profiles, and document archiving.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> POS Fee Collection, fee structures, concessions, and receipt printing.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Classrooms, timetable creation, subject management, and teacher assignment.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Daily attendance roll call and attendance reports.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Exam schedules, marks entry, and official report card generation.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Directory Filter & Search Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter modules or routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Master Domains Grid (11 Complete Folders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDomains.map(domain => {
          const Icon = domain.icon;
          return (
            <div
              key={domain.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Domain Header */}
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${domain.bgColor}`}>
                      <Icon className={`w-5 h-5 ${domain.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">{domain.title}</h3>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {domain.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{domain.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 block">{domain.statsLabel}</span>
                    <span className="text-xs font-extrabold text-slate-800">{domain.statsValue}</span>
                  </div>
                </div>

                {/* Sub-Routes Action Links List */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {domain.routes.map(r => (
                      <div
                        key={r.route}
                        onClick={() => setCurrentRoute(r.route)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                          r.isPrimary
                            ? 'bg-blue-50/50 border-blue-200/80 hover:border-blue-400 hover:bg-blue-50'
                            : 'bg-slate-50/50 border-slate-200/70 hover:border-slate-300 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                            {r.label}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Domain Footer */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">{domain.routes.length} Access Endpoints</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Full Super Admin Privileges
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
