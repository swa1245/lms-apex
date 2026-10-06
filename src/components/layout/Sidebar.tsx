import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  School,
  CreditCard,
  CalendarCheck,
  Wallet,
  Settings,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ClipboardList,
  UserRound,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  route?: string;
  badge?: string;
  children?: {
    id: string;
    label: string;
    route: string;
    badge?: string;
  }[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    route: 'dashboard'
  },
  {
    id: 'students',
    label: 'Students',
    icon: GraduationCap,
    children: [
      { id: 'student-list', label: 'Student List', route: 'students/student-list' },
      { id: 'add-student', label: 'Add Student', route: 'students/add-student' },
      { id: 'student-profile', label: 'Student Profile', route: 'students/student-profile' },
      { id: 'parent-details', label: 'Parent Details', route: 'students/parent-details' },
      { id: 'documents', label: 'Documents', route: 'students/documents' },
      { id: 'student-history', label: 'Student History', route: 'students/student-history' }
    ]
  },
  {
    id: 'parents',
    label: 'Parents',
    icon: Users,
    children: [
      { id: 'parent-list', label: 'Parent List', route: 'parents/parent-list' },
    ]
  },
  {
    id: 'classes',
    label: 'Classes / Batches',
    icon: School,
    children: [
      { id: 'class-list', label: 'Class List', route: 'classes/class-list' },
      { id: 'batch-management', label: 'Batch Management', route: 'classes/batch-management' },
      { id: 'subjects', label: 'Subjects', route: 'classes/subjects' },
      { id: 'teacher-assignment', label: 'Teacher Assignment', route: 'classes/teacher-assignment' },
      { id: 'timetable', label: 'Timetable', route: 'classes/timetable' }
    ]
  },
  {
    id: 'fees',
    label: 'Fees Management',
    icon: CreditCard,
    children: [
      { id: 'fee-structure', label: 'Fee Structure', route: 'fees/fee-structure' },
      { id: 'student-fees', label: 'Student Fees', route: 'fees/student-fees' },
      { id: 'fee-collection', label: 'Fee Collection', route: 'fees/fee-collection' },
      { id: 'pending-fees', label: 'Pending & Partial', route: 'fees/pending-fees' },
      { id: 'payment-history', label: 'Payment History & Receipts', route: 'fees/payment-history' },
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    children: [
      { id: 'daily-attendance', label: 'Daily Attendance', route: 'attendance/daily-attendance' },
      { id: 'student-attendance', label: 'Student Attendance', route: 'attendance/student-attendance' },
      { id: 'batch-attendance', label: 'Batch Attendance', route: 'attendance/batch-attendance' },
      { id: 'attendance-reports', label: 'Attendance Reports', route: 'attendance/attendance-reports' }
    ]
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Wallet,
    children: [
      { id: 'expense-entry', label: 'Expense Entry', route: 'expenses/expense-entry' },
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'users-roles', label: 'Users & Roles', route: 'settings/users-roles' },
      { id: 'profile', label: 'Profile', route: 'settings/profile' }
    ]
  },
  {
    id: 'performance',
    label: 'Student Performance',
    icon: ClipboardList,
    children: [
      { id: 'results', label: 'Results', route: 'performance/results' },
      { id: 'assignments', label: 'Assignments', route: 'performance/assignments' },
      { id: 'quizzes', label: 'Quizzes', route: 'performance/quizzes' },
    ]
  }
];

export const STUDENT_NAV: NavSection[] = [
  { id: 'student-home', label: 'Dashboard', icon: UserRound, route: 'student/home' },
  { id: 'student-assignments', label: 'Assignments', icon: ClipboardList, route: 'student/assignments' },
  { id: 'student-quizzes', label: 'Quizzes', icon: BookOpen, route: 'student/quizzes' },
  { id: 'student-attendance', label: 'Attendance', icon: CalendarCheck, route: 'student/attendance' },
];

export const Sidebar: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    sidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    academicYear,
    institutionConfig,
    currentUser,
  } = useApp();

  const navSections = currentUser?.role === 'student'
    ? STUDENT_NAV
    : NAV_SECTIONS.filter((section) => {
        if (section.id !== 'performance') return true;
        return currentUser?.role === 'admin'
          || currentUser?.role === 'principal'
          || currentUser?.role === 'teacher'
          || currentUser?.role === 'superadmin';
      });

  // Find parent of current route to auto-expand
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = { students: true, fees: true, performance: true };
    navSections.forEach(sec => {
      if (sec.children?.some(c => c.route === currentRoute)) {
        initial[sec.id] = true;
      }
    });
    return initial;
  });

  useEffect(() => {
    navSections.forEach(sec => {
      if (sec.children?.some(c => c.route === currentRoute)) {
        setExpandedSections(prev => ({ ...prev, [sec.id]: true }));
      }
    });
  }, [currentRoute]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNavClick = (route: string) => {
    setCurrentRoute(route);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--cms-sidebar)] text-slate-300 select-none border-r border-[var(--cms-sidebar-border)]">
      {/* Brand Header */}
      <div className="h-[4.25rem] px-4 flex items-center justify-between border-b border-[var(--cms-sidebar-border)] sticky top-0 z-10 bg-[var(--cms-sidebar)]/95 backdrop-blur-md">
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
          id="sidebar-brand-btn"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <School className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[15px] tracking-tight text-white group-hover:text-sky-300 transition-colors truncate">
                {institutionConfig.schoolName || 'Campus LMS'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.16em]">
                Class Manager
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close Sidebar"
          id="mobile-close-sidebar-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pt-4 pb-2">
        {!sidebarCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {navSections.map(section => {
          const Icon = section.icon;
          const isDirect = !!section.route;
          const isActive = isDirect
            ? currentRoute === section.route
            : section.children?.some(c => c.route === currentRoute);
          const isExpanded = expandedSections[section.id];

          if (isDirect && section.route) {
            return (
              <button
                key={section.id}
                id={`nav-${section.id}`}
                onClick={() => handleNavClick(section.route!)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                title={sidebarCollapsed ? section.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!sidebarCollapsed && <span className="flex-1 text-left">{section.label}</span>}
              </button>
            );
          }

          return (
            <div key={section.id} className="space-y-1">
              <button
                id={`nav-section-${section.id}`}
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/8 text-white border border-white/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                title={sidebarCollapsed ? section.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && (
                    <span className="truncate text-left">{section.label}</span>
                  )}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex items-center gap-1.5 ml-2">
                    {section.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {section.badge}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>

              {!sidebarCollapsed && isExpanded && section.children && (
                <div className="pl-3 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-5 my-1">
                  {section.children.map(child => {
                    const isChildActive = currentRoute === child.route;
                    return (
                      <button
                        key={child.id}
                        id={`nav-item-${child.id}`}
                        onClick={() => handleNavClick(child.route)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isChildActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{child.label}</span>
                        {child.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300">
                            {child.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!sidebarCollapsed ? (
        <div className="p-3 border-t border-[var(--cms-sidebar-border)]">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="text-[11px] min-w-0">
                <p className="font-semibold text-slate-100 truncate">System Online</p>
                <p className="text-slate-400 truncate">Session {academicYear}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              Live
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-[var(--cms-sidebar-border)] flex justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title={`System Online • Academic Session ${academicYear}`} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`fixed top-0 bottom-0 left-0 transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
