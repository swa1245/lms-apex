import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { SearchModal } from './components/modals/SearchModal';
import { Toast } from './components/ui/Toast';
import { AuthPage } from './components/auth/AuthPage';

// Super Admin Standalone Module (Isolated in /src/superadmin)
import { SuperAdminApp } from './superadmin/SuperAdminApp';

// Pages Barrel Import
import {
  Dashboard,
  StudentListPage,
  StudentProfilePage,
  ParentDetailsPage,
  StudentDocumentsPage,
  StudentHistoryPage,
  ParentsListPage,
  ParentProfilePage,
  ChildrenMappingPage,
  ParentPaymentHistoryPage,
  ClassListPage,
  BatchManagementPage,
  SubjectsPage,
  TeacherAssignmentPage,
  TimetablePage,
  FeeStructurePage,
  StudentFeesPage,
  FeeCollectionPage,
  PendingFeesPage,
  PaymentHistoryPage,
  DailyAttendancePage,
  StudentAttendancePage,
  BatchAttendancePage,
  AttendanceReportsPage,
  ExpenseListPage,
  AddExpensePage,
  VendorPaymentsPage,
  ProfilePage,
  UserManagementPage,
  BackupRestorePage
} from './pages';
import { AssignmentsPage, QuizzesPage } from './pages/performance/PerformancePages';
import {
  StudentHomePage,
  StudentAssignmentsPage,
  StudentQuizzesPage,
  StudentAttendancePortalPage,
} from './pages/student/StudentPortalPages';
import { PrivacyPolicyPage, TermsAndConditionsPage } from './pages/legal/LegalPages';

const MainLayout: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    toastMessage,
    showToast,
    clearToast,
    isAuthenticated,
    authChecking,
    currentUser,
    maintenanceMode,
  } = useApp();

  const canAccessSuperAdmin =
    currentUser?.role === 'superadmin' ||
    (import.meta.env.DEV && currentUser?.role === 'admin');

  // Super Admin: production only for role=superadmin; in DEV admins may use Ctrl+Shift+S
  useEffect(() => {
    if (!isAuthenticated || !canAccessSuperAdmin) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        if (currentRoute.startsWith('superadmin/')) {
          setCurrentRoute('dashboard');
          showToast('School Portal', 'Returned to school dashboard.', 'info');
        } else {
          setCurrentRoute('superadmin/master-access');
          showToast('Super Admin', 'Entered Super Admin suite.', 'info');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoute, setCurrentRoute, showToast, isAuthenticated, canAccessSuperAdmin]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    if (currentUser.role === 'student' && !currentRoute.startsWith('student/') && !currentRoute.startsWith('legal/')) {
      setCurrentRoute('student/home');
    }
    if (currentUser.role !== 'student' && currentRoute.startsWith('student/')) {
      setCurrentRoute('dashboard');
    }
  }, [currentRoute, currentUser, isAuthenticated, setCurrentRoute]);

  // URL trigger only in development, and only for allowed roles
  useEffect(() => {
    if (!isAuthenticated || !import.meta.env.DEV || !canAccessSuperAdmin) return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (
        searchParams.get('superadmin') === 'true' ||
        searchParams.get('dev') === 'true' ||
        window.location.hash === '#superadmin'
      ) {
        setCurrentRoute('superadmin/master-access');
      }
    } catch {
      // ignore
    }
  }, [setCurrentRoute, isAuthenticated, canAccessSuperAdmin]);

  if (authChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--cms-bg)] text-slate-500">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold">Checking session...</p>
        </div>
        {toastMessage ? <Toast message={toastMessage} onClose={clearToast} /> : null}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        {toastMessage ? <Toast message={toastMessage} onClose={clearToast} /> : null}
      </>
    );
  }

  if (
    maintenanceMode &&
    currentUser?.role !== 'superadmin' &&
    currentUser?.role !== 'admin'
  ) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-lg text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-3xl">
            🛠️
          </div>
          <h1 className="text-2xl font-extrabold">Scheduled maintenance in progress</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The learning management system is temporarily unavailable while administrators perform maintenance.
            Please try again later.
          </p>
        </div>
        {toastMessage ? <Toast message={toastMessage} onClose={clearToast} /> : null}
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentRoute) {
      // Dashboard
      case 'dashboard':
        return <Dashboard />;

      // Students
      case 'students/student-list':
        return <StudentListPage />;
      case 'students/add-student':
        return <StudentListPage openAddOnMount />;
      case 'students/student-profile':
        return <StudentProfilePage />;
      case 'students/parent-details':
        return <ParentDetailsPage />;
      case 'students/documents':
        return <StudentDocumentsPage />;
      case 'students/student-history':
        return <StudentHistoryPage />;

      // Parents
      case 'parents/parent-list':
        return <ParentsListPage />;
      case 'parents/parent-profile':
        return <ParentProfilePage />;
      case 'parents/children':
        return <ChildrenMappingPage />;
      case 'parents/payment-history':
        return <ParentPaymentHistoryPage />;

      // Classes / Batches
      case 'classes/class-list':
        return <ClassListPage />;
      case 'classes/batch-management':
        return <BatchManagementPage />;
      case 'classes/subjects':
        return <SubjectsPage />;
      case 'classes/teacher-assignment':
        return <TeacherAssignmentPage />;
      case 'classes/timetable':
        return <TimetablePage />;

      // Fees Management
      case 'fees/fee-structure':
        return <FeeStructurePage />;
      case 'fees/student-fees':
        return <StudentFeesPage />;
      case 'fees/fee-collection':
        return <FeeCollectionPage />;
      case 'fees/pending-fees':
      case 'fees/partial-payments':
        return <PendingFeesPage />;
      case 'fees/payment-history':
      case 'fees/receipts':
        return <PaymentHistoryPage />;

      // Attendance
      case 'attendance/daily-attendance':
        return <DailyAttendancePage />;
      case 'attendance/student-attendance':
        return <StudentAttendancePage />;
      case 'attendance/batch-attendance':
        return <BatchAttendancePage />;
      case 'attendance/attendance-reports':
        return <AttendanceReportsPage />;

      case 'performance/assignments':
        return <AssignmentsPage />;
      case 'performance/quizzes':
        return <QuizzesPage />;

      case 'student/home':
        return <StudentHomePage />;
      case 'student/assignments':
        return <StudentAssignmentsPage />;
      case 'student/quizzes':
        return <StudentQuizzesPage />;
      case 'student/attendance':
        return <StudentAttendancePortalPage />;

      // Expenses
      case 'expenses/expense-entry':
      case 'expenses/expense-list':
      case 'expenses/categories':
      case 'expenses/expense-reports':
      case 'expenses/financial-summary':
        return <ExpenseListPage />;
      case 'expenses/add-expense':
        return <AddExpensePage />;
      case 'expenses/vendor-payments':
        return <VendorPaymentsPage />;

      // Settings
      case 'settings/users-roles':
      case 'settings/user-management':
        return <UserManagementPage />;
      case 'settings/profile':
      case 'settings/general':
        return <ProfilePage />;
      case 'settings/backup-restore':
        return <BackupRestorePage />;

      case 'legal/privacy':
        return (
          <PrivacyPolicyPage
            embedded
            onBack={() => setCurrentRoute('settings/profile')}
          />
        );
      case 'legal/terms':
        return (
          <TermsAndConditionsPage
            embedded
            onBack={() => setCurrentRoute('settings/profile')}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  if (currentRoute.startsWith('superadmin')) {
    if (!canAccessSuperAdmin) {
      return (
        <div className="flex h-screen w-full bg-[var(--cms-bg)] text-[var(--cms-text)] overflow-hidden antialiased font-sans transition-colors">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
            <TopHeader />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-7 pb-12">
                <Dashboard />
              </div>
            </main>
          </div>
          {toastMessage ? <Toast message={toastMessage} onClose={clearToast} /> : null}
        </div>
      );
    }
    return (
      <div className="min-h-screen w-full bg-slate-950">
        <SuperAdminApp onExit={() => setCurrentRoute('dashboard')} />
        {toastMessage ? <Toast message={toastMessage} onClose={clearToast} /> : null}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[var(--cms-bg)] text-[var(--cms-text)] overflow-hidden antialiased font-sans transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopHeader />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-7 pb-12">
            {renderCurrentPage()}
          </div>
        </main>
      </div>

      {currentUser?.role === 'student' ? null : <SearchModal />}

      {toastMessage ? <Toast message={toastMessage} onClose={clearToast} /> : null}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
