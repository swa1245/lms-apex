import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  MessageSquare,
  Search,
  ChevronDown,
  Calendar,
  User,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Code,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NAV_SECTIONS, STUDENT_NAV } from './Sidebar';

export const TopHeader: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    sidebarCollapsed,
    setSidebarCollapsed,
    setMobileMenuOpen,
    academicYear,
    setAcademicYear,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsSearchModalOpen,
    activeUserRole,
    setActiveUserRole,
    showToast,
    currentUser,
    isAuthenticated,
    logout,
    institutionConfig,
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [messagesDropdownOpen, setMessagesDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const ACADEMIC_YEARS = [
    { value: '2026-2027', label: '2026–2027', current: true },
    { value: '2027-2028', label: '2027–2028', current: false },
    { value: '2028-2029', label: '2028–2029', current: false },
  ] as const;

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setMessagesDropdownOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Resolve page title & section from currentRoute
  const getPageDetails = () => {
    if (currentRoute === 'legal/privacy') {
      return { section: 'Legal', title: 'Privacy Policy' };
    }
    if (currentRoute === 'legal/terms') {
      return { section: 'Legal', title: 'Terms & Conditions' };
    }
    if (currentRoute === 'dashboard') {
      return { section: 'Overview', title: 'Dashboard Overview' };
    }
    const studentPage = STUDENT_NAV.find((item) => item.route === currentRoute);
    if (studentPage) {
      return { section: 'Student portal', title: studentPage.label };
    }
    if (currentRoute.startsWith('superadmin/')) {
      const sub = currentRoute.replace('superadmin/', '');
      const map: Record<string, string> = {
        dashboard: 'App Developer Command Center',
        'master-access': 'Developer Omni-Access Hub',
        'users-roles': 'User & Staff Directory',
        'institution-setup': 'Institution Master Setup',
        permissions: 'Global Access Control',
        'database-manager': 'Local Database & Backups',
        'audit-logs': 'Security & Audit Trail',
        'system-health': 'System Health & Diagnostics'
      };
      return { section: 'Developer Console', title: map[sub] || 'Developer Console' };
    }
    for (const sec of NAV_SECTIONS) {
      if (sec.children) {
        const found = sec.children.find(c => c.route === currentRoute);
        if (found) {
          return { section: sec.label, title: found.label };
        }
      }
    }
    return { section: 'Management', title: 'Class Management' };
  };

  const pageDetails = getPageDetails();

  return (
    <header className="h-[4.25rem] sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left section: Toggle & Title */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          id="mobile-sidebar-toggle"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="hidden lg:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          id="desktop-sidebar-toggle"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar Collapse"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-[0.12em]">
            <span>{institutionConfig.schoolName || 'Campus LMS'}</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-blue-600 dark:text-blue-400 normal-case tracking-normal">{pageDetails.section}</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-base lg:text-lg font-bold text-[var(--cms-text)] truncate tracking-tight">
            {pageDetails.title}
          </h1>
        </div>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Global Search Bar */}
        {currentUser?.role === 'student' ? null : (
        <div
          onClick={() => setIsSearchModalOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-100 text-slate-500 dark:text-slate-400 rounded-xl cursor-pointer border border-slate-200/70 dark:border-slate-700 transition-all w-48 lg:w-72 group"
          id="global-search-trigger"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal select-none truncate">Search students, fees...</span>
          <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono">
            ⌘K
          </kbd>
        </div>
        )}

        {/* Mobile Search Icon Button */}
        {currentUser?.role === 'student' ? null : (
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          id="mobile-search-btn"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        )}

        {/* Academic Year Dropdown */}
        <div className="relative" ref={yearRef}>
          <button
            type="button"
            id="academic-year-select"
            aria-haspopup="listbox"
            aria-expanded={yearDropdownOpen}
            onClick={() => {
              setYearDropdownOpen((prev) => !prev);
              setNotifDropdownOpen(false);
              setMessagesDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="group flex items-center gap-2 rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50 to-sky-50/80 px-3 py-2 text-xs font-semibold text-blue-800 shadow-sm shadow-blue-500/5 transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-blue-800/70 dark:from-blue-950/70 dark:to-slate-900/80 dark:text-blue-200 dark:hover:border-blue-700"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300">
              <Calendar className="h-3.5 w-3.5" />
            </span>
            <span className="hidden sm:inline tracking-tight">
              {ACADEMIC_YEARS.find((y) => y.value === academicYear)?.label ?? academicYear}
              {ACADEMIC_YEARS.find((y) => y.value === academicYear)?.current ? (
                <span className="ml-1.5 rounded-md bg-blue-600/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-400/15 dark:text-blue-300">
                  Current
                </span>
              ) : null}
            </span>
            <span className="sm:hidden tracking-tight">{academicYear}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-blue-500 transition-transform duration-200 dark:text-blue-400 ${yearDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {yearDropdownOpen && (
            <div
              role="listbox"
              aria-label="Academic year"
              className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/40"
            >
              <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Academic session
              </p>
              {ACADEMIC_YEARS.map((year) => {
                const selected = academicYear === year.value;
                return (
                  <button
                    key={year.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setAcademicYear(year.value);
                      setYearDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className={`h-3.5 w-3.5 ${selected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`} />
                      {year.label}
                    </span>
                    {year.current ? (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          selected
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}
                      >
                        Current
                      </span>
                    ) : selected ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-100" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages Icon */}
        <div className="relative" ref={messagesRef}>
          <button
            onClick={() => setMessagesDropdownOpen(prev => !prev)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            id="messages-btn"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {messagesDropdownOpen && (
            <div className="cms-menu absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Direct Messages</span>
              </div>
              <div className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Parent messaging is not available yet. Use student and parent records from the dashboard.
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <button
                  onClick={() => { setCurrentRoute('dashboard'); setMessagesDropdownOpen(false); }}
                  className="w-full py-1.5 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(prev => !prev)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            id="notifications-btn"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="cms-menu absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                  {unreadNotifCount > 0 && (
                    <span className="text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">
                      {unreadNotifCount} new
                    </span>
                  )}
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === 'fee' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' :
                      n.type === 'admission' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' :
                      n.type === 'exam' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' :
                      'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${!n.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{n.timestamp}</span>
                      </div>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <button
                  onClick={() => { setCurrentRoute('dashboard'); setNotifDropdownOpen(false); }}
                  className="w-full py-1.5 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Section */}
        <div className="relative pl-1 lg:pl-3 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
          {isAuthenticated ? (
            <button
              onClick={() => setProfileDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
              id="admin-profile-dropdown-btn"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs ring-2 ring-blue-100 dark:ring-slate-700">
                {currentUser?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {currentUser?.name || 'Admin'}
                </span>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 leading-tight">
                  {currentUser?.designation || currentUser?.role || 'School Admin'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          ) : null}

          {profileDropdownOpen && (
            <div className="cms-menu absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'admin@smartlearning.com'}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Live Authenticated Session</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => { setCurrentRoute('dashboard'); setProfileDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Dashboard Overview
                </button>
                <button
                  onClick={() => { setCurrentRoute('settings/profile'); setProfileDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Administrator Profile
                </button>
                <button
                  onClick={() => { setCurrentRoute('settings/users-roles'); setProfileDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Users & Roles
                </button>
              </div>

              {/* Log Out */}
              <div className="p-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                <button
                  onClick={async () => {
                    setProfileDropdownOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                  id="header-logout-btn"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
