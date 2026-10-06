import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Student,
  Parent,
  ClassItem,
  PendingFeeItem,
  NotificationItem,
  ActivityItem,
  ExpenseItem,
  Teacher,
  UserAccount,
  UserRole,
  InstitutionConfig,
  AuditLogEntry,
  SystemFeatureToggle,
  RolePermissionMatrix,
  BatchShift,
  SubjectItem,
  TeacherAssignment,
  TimetableEntry,
  TimetablePeriodConfig,
  TimetablePeriodSlot,
  ToastMessage,
  ToastType,
  StudentDocument,
  FeeReceipt,
  AppStats,
  FeeStructureItem,
  StudentHistoryEvent,
  AttendanceRecord,
  AttendanceRow,
  AssignmentItem,
  AssignmentSubmission,
  QuizItem,
  QuizAttempt,
  AttendanceRequest,
} from '../types';
import type { AuthUser } from '../types/auth';
import { getErrorMessage } from '../utils/errors';
import {
  INITIAL_STATS,
  INITIAL_STUDENTS,
  INITIAL_PARENTS,
  INITIAL_CLASSES,
  INITIAL_PENDING_FEES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_EXPENSES,
  INITIAL_BATCHES,
  INITIAL_SUBJECTS,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_TIMETABLE,
  SAMPLE_DEMO_DATASET
} from '../data/mockData';
import {
  STORAGE_KEYS,
  DEFAULT_INSTITUTION_CONFIG,
  DEFAULT_USERS,
  DEMO_STUDENT,
  DEFAULT_FEATURE_TOGGLES,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_PERMISSION_MATRIX,
  getLocalItem,
  setLocalItem,
  clearAllLocalDatabase
} from '../data/localStorageManager';
import { backendClient, getAuthToken, clearAuthToken } from '../api/backendClient';
import { LOCAL_ONLY, LOCAL_DEMO_PASSWORD, DEMO_STUDENT_EMAIL, setLocalPassword, getLocalPassword } from '../config/localMode';

interface AppContextType {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  
  // Super Admin & Master System State
  activeUserRole: UserRole;
  setActiveUserRole: (role: UserRole) => void;
  institutionConfig: InstitutionConfig;
  setInstitutionConfig: React.Dispatch<React.SetStateAction<InstitutionConfig>>;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  auditLogs: AuditLogEntry[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
  featureToggles: SystemFeatureToggle[];
  setFeatureToggles: React.Dispatch<React.SetStateAction<SystemFeatureToggle[]>>;
  permissionMatrix: RolePermissionMatrix[];
  setPermissionMatrix: React.Dispatch<React.SetStateAction<RolePermissionMatrix[]>>;
  logAuditAction: (action: string, module: string, details: string, status?: 'Success' | 'Warning' | 'Failed' | 'Critical') => void;

  // Local Data Management
  clearAllData: () => void;
  resetToDemoData: () => void;

  // Data
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  selectedStudent: Student | null;
  setSelectedStudentId: (id: string | null) => void;
  addStudent: (student: Omit<Student, 'id'>) => Promise<Student>;
  updateStudent: (id: string, updated: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  parents: Parent[];
  setParents: React.Dispatch<React.SetStateAction<Parent[]>>;
  addParent: (parent: Omit<Parent, 'id'>) => Promise<void>;

  classes: ClassItem[];
  setClasses: React.Dispatch<React.SetStateAction<ClassItem[]>>;
  addClass: (newClass: Omit<ClassItem, 'id'>) => Promise<void>;

  pendingFees: PendingFeeItem[];
  setPendingFees: React.Dispatch<React.SetStateAction<PendingFeeItem[]>>;
  collectFee: (studentName: string, amount: number, paymentMode: string, note?: string) => void;

  feeStructures: FeeStructureItem[];
  setFeeStructures: React.Dispatch<React.SetStateAction<FeeStructureItem[]>>;
  addFeeStructure: (item: Omit<FeeStructureItem, 'id' | 'total'> & { total?: number }) => Promise<void>;
  deleteFeeStructure: (id: string) => Promise<void>;
  
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  inviteStaffUser: (details: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    department?: string;
    assignedBranch?: string;
    password?: string;
  }) => Promise<{ staff: UserAccount; temporaryPassword?: string }>;
  studentHistoryEvents: StudentHistoryEvent[];
  addStudentHistoryEvent: (event: Omit<StudentHistoryEvent, 'id'>) => Promise<StudentHistoryEvent>;

  activities: ActivityItem[];
  setActivities: React.Dispatch<React.SetStateAction<ActivityItem[]>>;
  addActivity: (activity: Omit<ActivityItem, 'id'>) => void;

  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => Promise<void>;

  batches: BatchShift[];
  setBatches: React.Dispatch<React.SetStateAction<BatchShift[]>>;
  addBatch: (batch: Omit<BatchShift, 'id'>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;

  subjects: SubjectItem[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectItem[]>>;
  addSubject: (subject: Omit<SubjectItem, 'id'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  teacherAssignments: TeacherAssignment[];
  setTeacherAssignments: React.Dispatch<React.SetStateAction<TeacherAssignment[]>>;
  addTeacherAssignment: (assignment: Omit<TeacherAssignment, 'id'>) => Promise<void>;
  deleteTeacherAssignment: (id: string) => Promise<void>;
  saveDailyAttendance: (
    records: AttendanceRecord[],
    date: string,
    classId?: string,
  ) => Promise<void>;
  attendanceRecords: AttendanceRow[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRow[]>>;

  assignments: AssignmentItem[];
  submissions: AssignmentSubmission[];
  quizzes: QuizItem[];
  quizAttempts: QuizAttempt[];
  attendanceRequests: AttendanceRequest[];
  grantStudentLogin: (studentId: string, email: string, password?: string, known?: Student) => { email: string; temporaryPassword: string };
  completeStudentPasswordReset: (email: string, newPassword: string) => void;
  addAssignment: (item: Omit<AssignmentItem, 'id' | 'createdAt'>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (payload: { assignmentId: string; studentId: string; studentName: string; fileName: string; fileData: string }) => void;
  gradeSubmission: (id: string, marks: number, feedback: string, gradedBy: string) => void;
  addQuiz: (item: Omit<QuizItem, 'id' | 'createdAt'>) => void;
  deleteQuiz: (id: string) => void;
  submitQuiz: (payload: { quizId: string; studentId: string; studentName: string; answers: number[]; score: number }) => void;
  requestAttendance: (payload: { studentId: string; studentName: string; className: string; section: string; date: string; note: string }) => void;
  noteAttendanceRequest: (id: string) => void;

  timetable: TimetableEntry[];
  setTimetable: React.Dispatch<React.SetStateAction<TimetableEntry[]>>;
  updateTimetableCell: (className: string, day: string, periodIndex: number, subject: string) => Promise<void>;
  timetablePeriodConfigs: TimetablePeriodConfig[];
  saveTimetablePeriods: (
    className: string,
    periods: TimetablePeriodSlot[],
    classId?: string,
  ) => Promise<TimetablePeriodConfig>;

  stats: AppStats;
  maintenanceMode: boolean;
  updateMaintenanceMode: (enabled: boolean) => Promise<void>;

  toastMessage: ToastMessage | null;
  showToast: (title: string, desc: string, type?: ToastType) => void;

  // Live Authentication State & Modals
  currentUser: AuthUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  authChecking: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => Promise<void>;

  // Student Documents Repository
  documents: StudentDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<StudentDocument[]>>;
  addDocument: (doc: Omit<StudentDocument, 'id'> & { id?: string }) => Promise<void>;
  verifyDocument: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Fee Receipts & Payments
  recentReceipts: FeeReceipt[];
  recordFeePayment: (payment: {
    studentId: string;
    studentName: string;
    className?: string;
    amount: number;
    mode?: string;
    receiptNo?: string;
    notes?: string;
  }) => Promise<FeeReceipt>;
  clearToast: () => void;

  // Theme support (Dark / Light Mode)
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const EMPTY_INSTITUTION_CONFIG: InstitutionConfig = {
  schoolName: 'Your Institution',
  schoolCode: '',
  tagline: '',
  affiliationNo: '',
  board: '',
  email: '',
  phone: '',
  address: '',
  academicYear: '2026-2027',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',
  branches: [],
};

// Ensure one-time migration to clear legacy dummy data and initialize fresh 2026-2027 session
function performOneTimeCleanWipeCheck() {
  try {
    const isCleaned = localStorage.getItem('cms_clean_state_v10');
    if (isCleaned !== 'true') {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers && storedUsers.includes('usr-superadmin')) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      }
      const storedRoute = localStorage.getItem(STORAGE_KEYS.CURRENT_ROUTE);
      if (storedRoute && storedRoute.startsWith('superadmin')) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ROUTE, 'dashboard');
      }
      const storedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE);
      if (storedRole === 'superadmin') {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, 'admin');
      }

      // Clear all dummy records
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PENDING_FEES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
      localStorage.setItem('cms_documents', JSON.stringify([]));
      localStorage.setItem('cms_fee_receipts', JSON.stringify([]));
      localStorage.removeItem('cms_selected_student');

      // Set active session to 2026-2027
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEAR, '2026-2027');

      localStorage.setItem('cms_clean_state_v10', 'true');
    }
  } catch {
    // Ignore storage issues in restricted env
  }
}

performOneTimeCleanWipeCheck();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRouteState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_ROUTE);
    if (!saved || saved.startsWith('superadmin')) {
      return 'dashboard';
    }
    return saved;
  });

  const [activeUserRole, setActiveUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE) as UserRole;
    if (!saved || saved === 'superadmin') {
      return 'admin';
    }
    return saved;
  });

  const [institutionConfig, setInstitutionConfig] = useState<InstitutionConfig>(() => {
    return getLocalItem(STORAGE_KEYS.INSTITUTION_CONFIG, DEFAULT_INSTITUTION_CONFIG);
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    return getLocalItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return getLocalItem(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  });

  const [featureToggles, setFeatureToggles] = useState<SystemFeatureToggle[]>(() => {
    return getLocalItem(STORAGE_KEYS.FEATURE_TOGGLES, DEFAULT_FEATURE_TOGGLES);
  });

  const [permissionMatrix, setPermissionMatrix] = useState<RolePermissionMatrix[]>(() => {
    return getLocalItem(STORAGE_KEYS.PERMISSION_MATRIX, DEFAULT_PERMISSION_MATRIX);
  });

  const [academicYear, setAcademicYearState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEAR);
    if (!saved || saved === '2024-25' || saved === '2023-24' || saved === '2025-26') {
      return '2026-2027';
    }
    return saved;
  });

  const setAcademicYear = (year: string) => {
    setAcademicYearState(year);
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEAR, year);
    setInstitutionConfig(prev => ({
      ...prev,
      academicYear: year
    }));
  };

  // Theme Support (Light and Dark Mode)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cms_theme') as 'light' | 'dark';
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('cms_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Core collections from LocalStorage
  const [students, setStudents] = useState<Student[]>(() => {
    return getLocalItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  });

  useEffect(() => {
    if (!getLocalPassword(DEMO_STUDENT_EMAIL)) {
      setLocalPassword(DEMO_STUDENT_EMAIL, LOCAL_DEMO_PASSWORD);
    }
    setUsers((prev) => {
      if (prev.some((user) => user.email.toLowerCase() === DEMO_STUDENT_EMAIL)) return prev;
      const demoUser = DEFAULT_USERS.find((user) => user.email.toLowerCase() === DEMO_STUDENT_EMAIL);
      if (!demoUser) return prev;
      const saved = getLocalPassword(DEMO_STUDENT_EMAIL);
      return [...prev, { ...demoUser, mustChangePassword: !saved || saved === LOCAL_DEMO_PASSWORD }];
    });
    setStudents((prev) => {
      if (prev.some((student) => student.id === DEMO_STUDENT.id || student.loginEmail?.toLowerCase() === DEMO_STUDENT_EMAIL)) {
        return prev;
      }
      return [DEMO_STUDENT, ...prev];
    });
  }, []);

  const [selectedStudentId, setSelectedStudentIdState] = useState<string | null>(() => {
    return localStorage.getItem('cms_selected_student') || (students[0]?.id || null);
  });

  const [parents, setParents] = useState<Parent[]>(() => {
    return getLocalItem(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
  });

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    return getLocalItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  });

  const [pendingFees, setPendingFees] = useState<PendingFeeItem[]>(() => {
    return getLocalItem(STORAGE_KEYS.PENDING_FEES, INITIAL_PENDING_FEES);
  });

  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>(() => {
    return getLocalItem<FeeStructureItem[]>(STORAGE_KEYS.FEE_STRUCTURES, []);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return getLocalItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    return getLocalItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    return getLocalItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  });

  const [batches, setBatches] = useState<BatchShift[]>(() => {
    return getLocalItem(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    return getLocalItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  });

  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>(() => {
    return getLocalItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, INITIAL_TEACHER_ASSIGNMENTS);
  });

  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    return getLocalItem(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  });

  const [timetablePeriodConfigs, setTimetablePeriodConfigs] = useState<TimetablePeriodConfig[]>(() => {
    const stored = getLocalItem<TimetablePeriodConfig[]>('cms_timetable_period_configs', []);
    if (stored.length > 0) return stored;
    const map = getLocalItem<Record<string, TimetablePeriodSlot[]>>(STORAGE_KEYS.TIMETABLE_PERIODS, {});
    return Object.entries(map).map(([className, periods]) => ({
      id: `local-${className}`,
      className,
      periods,
    }));
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRow[]>(() => {
    return getLocalItem<AttendanceRow[]>('cms_attendance', []);
  });
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => getLocalItem(STORAGE_KEYS.ASSIGNMENTS, []));
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => getLocalItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, []));
  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => getLocalItem(STORAGE_KEYS.QUIZZES, []));
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => getLocalItem(STORAGE_KEYS.QUIZ_ATTEMPTS, []));
  const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>(() => getLocalItem(STORAGE_KEYS.ATTENDANCE_REQUESTS, []));

  const [accountSettingsId, setAccountSettingsId] = useState<string | null>(null);
  const [accountSettingsHydrated, setAccountSettingsHydrated] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('cms_system_maintenance_mode') === 'true';
  });
  const [studentHistoryEvents, setStudentHistoryEvents] = useState<StudentHistoryEvent[]>(() => {
    return getLocalItem<StudentHistoryEvent[]>('cms_student_history_events', []);
  });

  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  // Authentication State & Modals
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('smartlearning_current_user');
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (!LOCAL_ONLY) return false;
    try {
      return Boolean(localStorage.getItem('smartlearning_current_user'));
    } catch {
      return false;
    }
  });
  const [authChecking, setAuthChecking] = useState(() => (LOCAL_ONLY ? false : Boolean(getAuthToken())));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const bootstrapWarningShown = useRef(false);

  // Validate stored session on boot — never show app until auth is confirmed
  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      if (LOCAL_ONLY) {
        clearAuthToken();
        if (!cancelled) setAuthChecking(false);
        return;
      }
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setAuthChecking(false);
        }
        return;
      }

      try {
        const me = await backendClient.getMe();
        if (cancelled) return;

        if (me) {
          setCurrentUser(me);
          setIsAuthenticated(true);
          localStorage.setItem('smartlearning_current_user', JSON.stringify(me));
        } else {
          clearAuthToken();
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        if (!cancelled) {
          clearAuthToken();
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    };

    void bootstrapAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Force logout UI when API reports expired session
  useEffect(() => {
    const onExpired = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsLoginModalOpen(false);
    };
    window.addEventListener('cms:auth-expired', onExpired);
    return () => window.removeEventListener('cms:auth-expired', onExpired);
  }, []);

  const [documents, setDocuments] = useState<StudentDocument[]>(() => {
    return getLocalItem<StudentDocument[]>('cms_documents', []);
  });

  const [recentReceipts, setRecentReceipts] = useState<FeeReceipt[]>(() => {
    return getLocalItem<FeeReceipt[]>('cms_fee_receipts', []);
  });

  // Pull core collections from backend when authenticated
  useEffect(() => {
    if (!isAuthenticated || !getAuthToken()) return;

    void (async () => {
      const results = await Promise.allSettled([
        backendClient.getStudents(),
        backendClient.getParents(),
        backendClient.getClasses(),
        backendClient.getExpenses(),
        backendClient.getBatches(),
        backendClient.getSubjects(),
        backendClient.getTeacherAssignments(),
        backendClient.getFees(),
        backendClient.getFeeStructures(),
        backendClient.getFeePayments(),
        backendClient.getDocuments(),
        backendClient.getTimetablePeriodConfigs(),
        backendClient.getStaffUsers(),
        backendClient.getAccountSettings(),
        backendClient.getAuditLogs(),
        backendClient.getNotifications(),
        backendClient.getActivities(),
        backendClient.getStudentHistoryEvents(),
        backendClient.getAttendance(),
      ]);

      const [
        studentsResult,
        parentsResult,
        classesResult,
        expensesResult,
        batchesResult,
        subjectsResult,
        assignmentsResult,
        feesResult,
        feeStructuresResult,
        feePaymentsResult,
        documentsResult,
        timetablePeriodsResult,
        staffUsersResult,
        accountSettingsResult,
        auditLogsResult,
        notificationsResult,
        activitiesResult,
        studentHistoryResult,
        attendanceResult,
      ] = results;

      const classesData = classesResult.status === 'fulfilled' ? classesResult.value : [];
      const subjectsData = subjectsResult.status === 'fulfilled' ? subjectsResult.value : [];

      if (studentsResult.status === 'fulfilled') setStudents(studentsResult.value);
      if (parentsResult.status === 'fulfilled') setParents(parentsResult.value);
      if (classesResult.status === 'fulfilled') setClasses(classesData);
      if (expensesResult.status === 'fulfilled') setExpenses(expensesResult.value);
      if (batchesResult.status === 'fulfilled') setBatches(batchesResult.value);
      if (subjectsResult.status === 'fulfilled') setSubjects(subjectsData);
      if (assignmentsResult.status === 'fulfilled') setTeacherAssignments(assignmentsResult.value);
      if (feesResult.status === 'fulfilled') setPendingFees(feesResult.value);
      if (feeStructuresResult.status === 'fulfilled') setFeeStructures(feeStructuresResult.value);
      if (feePaymentsResult.status === 'fulfilled') setRecentReceipts(feePaymentsResult.value);
      if (documentsResult.status === 'fulfilled') setDocuments(documentsResult.value);
      if (timetablePeriodsResult.status === 'fulfilled') {
        setTimetablePeriodConfigs(timetablePeriodsResult.value);
      }
      if (staffUsersResult.status === 'fulfilled') {
        const authenticatedUser = currentUser
          ? [{
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role,
              phone: currentUser.phone,
              status: 'Active' as const,
              createdAt: new Date().toISOString().slice(0, 10),
              department: currentUser.designation,
            }]
          : [];
        setUsers(staffUsersResult.value.length > 0 ? staffUsersResult.value : authenticatedUser);
      }
      if (auditLogsResult.status === 'fulfilled' && auditLogsResult.value.length > 0) {
        setAuditLogs(auditLogsResult.value);
      }
      if (notificationsResult.status === 'fulfilled' && notificationsResult.value.length > 0) {
        setNotifications(notificationsResult.value);
      }
      if (activitiesResult.status === 'fulfilled' && activitiesResult.value.length > 0) {
        setActivities(activitiesResult.value);
      }
      if (studentHistoryResult.status === 'fulfilled') {
        setStudentHistoryEvents(studentHistoryResult.value);
      }
      if (attendanceResult.status === 'fulfilled') {
        setAttendanceRecords(attendanceResult.value);
      }
      if (accountSettingsResult.status === 'fulfilled' && accountSettingsResult.value[0]) {
        const settings = accountSettingsResult.value[0];
        setAccountSettingsId(settings.id);
        if (settings.academicYear) {
          setAcademicYearState(settings.academicYear);
          localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEAR, settings.academicYear);
        }
        if (settings.institution) {
          setInstitutionConfig({
            ...DEFAULT_INSTITUTION_CONFIG,
            ...settings.institution,
            academicYear: settings.academicYear || settings.institution.academicYear || '2026-2027',
          });
        }
        if (settings.featureToggles.length > 0) setFeatureToggles(settings.featureToggles);
        if (settings.permissionMatrix.length > 0) setPermissionMatrix(settings.permissionMatrix);
        setMaintenanceMode(settings.maintenanceMode);
        localStorage.setItem('cms_system_maintenance_mode', String(settings.maintenanceMode));
      } else if (
        accountSettingsResult.status === 'fulfilled' &&
        (institutionConfig.schoolName === DEFAULT_INSTITUTION_CONFIG.schoolName ||
          institutionConfig.email === DEFAULT_INSTITUTION_CONFIG.email)
      ) {
        setInstitutionConfig({
          ...EMPTY_INSTITUTION_CONFIG,
          academicYear,
        });
      }
      setAccountSettingsHydrated(true);

      const failedCount = results.filter((result) => result.status === 'rejected').length;
      if (failedCount > results.length / 2 && !bootstrapWarningShown.current) {
        bootstrapWarningShown.current = true;
        showToast(
          'Some data could not be loaded',
          'Most server requests failed. Displayed data may be incomplete.',
          'warning',
        );
      }

      try {
        const timetableData = await backendClient.getTimetable(classesData, subjectsData);
        setTimetable(timetableData);
      } catch {
        // Keep local timetable cache if backend pull fails
      }
    })();
  }, [isAuthenticated]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROUTE, currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, activeUserRole);
  }, [activeUserRole]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.INSTITUTION_CONFIG, institutionConfig);
  }, [institutionConfig]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.FEATURE_TOGGLES, featureToggles);
  }, [featureToggles]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.PERMISSION_MATRIX, permissionMatrix);
  }, [permissionMatrix]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.STUDENTS, students);
  }, [students]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.PARENTS, parents);
  }, [parents]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.CLASSES, classes);
  }, [classes]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.PENDING_FEES, pendingFees);
  }, [pendingFees]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.FEE_STRUCTURES, feeStructures);
  }, [feeStructures]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.EXPENSES, expenses);
  }, [expenses]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.BATCHES, batches);
  }, [batches]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.SUBJECTS, subjects);
  }, [subjects]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, teacherAssignments);
  }, [teacherAssignments]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.TIMETABLE, timetable);
  }, [timetable]);

  useEffect(() => {
    setLocalItem('cms_attendance', attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }, [assignments]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, submissions);
  }, [submissions]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.QUIZZES, quizzes);
  }, [quizzes]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.QUIZ_ATTEMPTS, quizAttempts);
  }, [quizAttempts]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.ATTENDANCE_REQUESTS, attendanceRequests);
  }, [attendanceRequests]);

  useEffect(() => {
    const map: Record<string, TimetablePeriodSlot[]> = {};
    for (const config of timetablePeriodConfigs) {
      if (config.className) map[config.className] = config.periods;
    }
    setLocalItem(STORAGE_KEYS.TIMETABLE_PERIODS, map);
  }, [timetablePeriodConfigs]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    setLocalItem(STORAGE_KEYS.ACTIVITIES, activities);
  }, [activities]);

  useEffect(() => {
    setLocalItem('cms_student_history_events', studentHistoryEvents);
  }, [studentHistoryEvents]);

  useEffect(() => {
    setLocalItem('cms_documents', documents);
  }, [documents]);

  useEffect(() => {
    setLocalItem('cms_fee_receipts', recentReceipts);
  }, [recentReceipts]);

  useEffect(() => {
    setLocalItem('cms_timetable_period_configs', timetablePeriodConfigs);
  }, [timetablePeriodConfigs]);

  useEffect(() => {
    localStorage.setItem('cms_system_maintenance_mode', String(maintenanceMode));
  }, [maintenanceMode]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem('smartlearning_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (!isAuthenticated || !getAuthToken() || !accountSettingsHydrated) return;

    const timer = window.setTimeout(() => {
      void (async () => {
        const payload = {
          academic_year: academicYear,
          institution: { ...institutionConfig, academicYear },
          feature_toggles: featureToggles,
          permission_matrix: permissionMatrix,
          maintenance_mode: maintenanceMode,
        };
        try {
          if (accountSettingsId && /^[0-9a-f-]{36}$/i.test(accountSettingsId)) {
            const updated = await backendClient.updateAccountSettings(accountSettingsId, payload);
            setAccountSettingsId(updated.id);
          } else {
            const created = await backendClient.createAccountSettings(payload);
            setAccountSettingsId(created.id);
          }
        } catch {
          // Keep local settings if backend sync fails (e.g. migration not applied yet)
        }
      })();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    academicYear,
    institutionConfig,
    featureToggles,
    permissionMatrix,
    maintenanceMode,
    isAuthenticated,
    accountSettingsHydrated,
    accountSettingsId,
  ]);

  const logAuditAction = (action: string, module: string, details: string, status: 'Success' | 'Warning' | 'Failed' | 'Critical' = 'Success') => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      actorName: currentUser?.name || (activeUserRole === 'superadmin' ? 'Super Administrator' : `${activeUserRole.toUpperCase()} User`),
      actorRole: activeUserRole,
      actorEmail: currentUser?.email || `${activeUserRole}@apexschool.edu`,
      action,
      module,
      ipAddress: '127.0.0.1 (Local Client)',
      status,
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    if (isAuthenticated && getAuthToken()) {
      void backendClient
        .createAuditLog({
          logged_at: new Date().toISOString(),
          actor_name: newEntry.actorName,
          actor_role: newEntry.actorRole,
          actor_email: newEntry.actorEmail,
          action,
          module,
          ip_address: newEntry.ipAddress,
          status,
          details,
        })
        .then((saved) => {
          setAuditLogs((prev) => [saved, ...prev.filter((row) => row.id !== newEntry.id && row.id !== saved.id)]);
        })
        .catch(() => {
          // local entry already stored
        });
    }
  };

  const setCurrentRoute = (route: string) => {
    setCurrentRouteState(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setActiveUserRole = (role: UserRole) => {
    setActiveUserRoleState(role);
    logAuditAction(`Role Switched to ${role}`, 'Security Engine', `User context switched to ${role} simulation.`);
  };

  const setSelectedStudentId = (id: string | null) => {
    setSelectedStudentIdState(id);
    if (id) {
      localStorage.setItem('cms_selected_student', id);
    }
  };

  const showToast = (title: string, desc: string, type: ToastType = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const clearToast = () => setToastMessage(null);

  // Clean Wipe All Data
  const clearAllData = () => {
    clearAllLocalDatabase();
    setStudents([]);
    setParents([]);
    setClasses([]);
    setBatches([]);
    setSubjects([]);
    setTeacherAssignments([]);
    setTimetable([]);
    setTimetablePeriodConfigs([]);
    setAttendanceRecords([]);
    setPendingFees([]);
    setFeeStructures([]);
    setExpenses([]);
    setNotifications([]);
    setActivities([]);
    showToast('Clean Wipe Complete', 'All data cleared. Database is now in a clean local state with 0 records.', 'warning');
    logAuditAction('Database Clean Wiped', 'Database Manager', 'All collections purged to empty local storage.', 'Warning');
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setStudents(SAMPLE_DEMO_DATASET.students);
    setParents(SAMPLE_DEMO_DATASET.parents);
    setClasses(SAMPLE_DEMO_DATASET.classes);
    setBatches([]);
    setSubjects([]);
    setTeacherAssignments([]);
    setTimetable([]);
    setPendingFees(SAMPLE_DEMO_DATASET.pendingFees);
    setFeeStructures([]);
    setExpenses([]);
    setNotifications([]);
    setActivities([]);
    showToast('Sample Starter Data Loaded', 'Sample student, parent, class, and fee records populated into Local Storage.', 'success');
    logAuditAction('Sample Data Loaded', 'Database Manager', 'Populated starter records for demo inspection.');
  };

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    if (LOCAL_ONLY || !getAuthToken()) {
      const created: Student = {
        ...studentData,
        id: `STU-${Date.now()}`,
      };
      setStudents((prev) => [created, ...prev]);
      addActivity({
        description: `New student ${created.name} admitted in ${created.className || studentData.className}`,
        timestamp: 'Just now',
        type: 'attendance',
      });
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: `New student admitted: ${created.name}`,
          timestamp: 'Just now',
          type: 'admission',
          read: false,
        },
        ...prev,
      ]);
      logAuditAction(`Admitted Student: ${created.name}`, 'Students Subsystem', 'Saved in this browser');
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }
      showToast('Student Admitted', `${created.name} saved in this browser.`, 'success');
      return created;
    }

    try {
      const created = await backendClient.createStudent(studentData);
      setStudents(prev => [created, ...prev.filter(s => s.id !== created.id)]);

      addActivity({
        description: `New student ${created.name} admitted in ${created.className || studentData.className}`,
        timestamp: 'Just now',
        type: 'attendance'
      });

      const localNotif: NotificationItem = {
        id: `n-${Date.now()}`,
        title: `New student admitted: ${created.name}`,
        timestamp: 'Just now',
        type: 'admission',
        read: false
      };
      setNotifications(prev => [localNotif, ...prev]);
      if (isAuthenticated && getAuthToken()) {
        void backendClient
          .createNotification({
            title: localNotif.title,
            event_timestamp: localNotif.timestamp,
            type: 'admission',
            is_read: false,
          })
          .then((saved) => {
            setNotifications((prev) => [
              saved,
              ...prev.filter((row) => row.id !== localNotif.id && row.id !== saved.id),
            ]);
          })
          .catch(() => undefined);
      }
      logAuditAction(`Admitted Student: ${created.name}`, 'Students Subsystem', `Saved via backend API`);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }

      showToast('Student Admitted Successfully', `${created.name} saved to backend database.`, 'success');
      return created;
    } catch (err: unknown) {
      showToast('Student Save Failed', getErrorMessage(err, 'Could not save student to backend.'), 'danger');
      throw err;
    }
  };

  const updateStudent = async (id: string, updated: Partial<Student>) => {
    if (LOCAL_ONLY || !getAuthToken()) {
      setStudents((prev) => prev.map((student) => (student.id === id ? { ...student, ...updated } : student)));
      logAuditAction(`Updated Student Record (${id})`, 'Students Subsystem', 'Saved in this browser');
      showToast('Student Updated', 'Student profile saved in this browser.', 'info');
      return;
    }

    try {
      const saved = await backendClient.updateStudent(id, updated);
      setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...saved } : s)));
      logAuditAction(`Updated Student Record (${id})`, 'Students Subsystem', `Synced to backend.`);
      showToast('Student Updated', 'Student profile updated on backend.', 'info');
    } catch (err: unknown) {
      showToast('Update Failed', getErrorMessage(err, 'Could not update student on backend.'), 'danger');
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    const target = students.find(s => s.id === id);
    if (LOCAL_ONLY || !getAuthToken()) {
      setStudents((prev) => prev.filter((student) => student.id !== id));
      setUsers((prev) => prev.filter((user) => user.studentId !== id));
      logAuditAction(`Deleted Student (${id})`, 'Students Subsystem', `Removed ${target?.name || id} from this browser`, 'Warning');
      showToast('Student Removed', 'Student deleted from this browser.', 'warning');
      return;
    }

    try {
      await backendClient.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      logAuditAction(`Deleted Student (${id})`, 'Students Subsystem', `Removed ${target?.name || id} from backend`, 'Warning');
      showToast('Student Removed', 'Student deleted from backend.', 'warning');
    } catch (err: unknown) {
      showToast('Delete Failed', getErrorMessage(err, 'Could not delete student on backend.'), 'danger');
      throw err;
    }
  };

  const addParent = async (parentData: Omit<Parent, 'id'>) => {
    try {
      const created = isAuthenticated && getAuthToken()
        ? await backendClient.createParent({
            name: parentData.name,
            email: parentData.email,
            phone: parentData.phone,
            occupation: parentData.occupation,
            address: parentData.address,
          })
        : { ...parentData, id: `PAR-${100 + parents.length + 1}` };

      setParents(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      logAuditAction(`Registered Parent: ${created.name}`, 'Parent Subsystem', `Phone: ${created.phone}`);
      showToast('Parent Registered', `${created.name} has been added to guardian records.`, 'success');
    } catch (err: unknown) {
      showToast('Parent Save Failed', getErrorMessage(err, 'Could not save parent.'), 'danger');
      throw err;
    }
  };

  const addClass = async (classData: Omit<ClassItem, 'id'>) => {
    try {
      const created =
        isAuthenticated && getAuthToken()
          ? await backendClient.createClass({
              name: classData.name,
              grade: classData.grade,
              sections: classData.sections,
              capacity: classData.capacity,
              class_teacher: classData.classTeacher,
              room_no: classData.roomNo,
              status: 'active',
            })
          : {
              ...classData,
              id: `c-${Date.now()}`,
            };

      setClasses((prev) => [...prev.filter((row) => row.id !== created.id), created]);
      logAuditAction(`Created Class: ${created.name}`, 'Classes Subsystem', `Room: ${created.roomNo}`);
      showToast('Class Added', `${created.name} created successfully.`, 'success');
    } catch (err: unknown) {
      showToast('Class Save Failed', getErrorMessage(err, 'Could not save class.'), 'danger');
      throw err;
    }
  };

  const collectFee = (studentName: string, amount: number, paymentMode: string, note?: string) => {
    setPendingFees(prev => prev.filter(p => !p.studentName.toLowerCase().includes(studentName.toLowerCase())));
    
    setStudents(prev =>
      prev.map(s => {
        if (s.name.toLowerCase().includes(studentName.toLowerCase())) {
          const newPaid = s.paidFee + amount;
          return {
            ...s,
            paidFee: newPaid,
            feeStatus: newPaid >= s.totalFee ? 'Paid' : 'Partial'
          };
        }
        return s;
      })
    );

    addActivity({
      description: `Fee collected ₹${amount.toLocaleString('en-IN')} from ${studentName} (${paymentMode})`,
      timestamp: 'Just now',
      type: 'fee'
    });

    logAuditAction(
      `Fee Collected: ₹${amount.toLocaleString('en-IN')}`,
      'Fee Management',
      `Student: ${studentName}, Mode: ${paymentMode}, Note: ${note || 'Direct POS'}`
    );

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {
      // Ignore
    }

    showToast('Fee Payment Received', `₹${amount.toLocaleString('en-IN')} received for ${studentName} via ${paymentMode}.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    if (isAuthenticated && getAuthToken() && /^[0-9a-f-]{36}$/i.test(id)) {
      void backendClient.updateNotification(id, { is_read: true }).catch(() => undefined);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isAuthenticated && getAuthToken()) {
      notifications
        .filter((n) => !n.read && /^[0-9a-f-]{36}$/i.test(n.id))
        .forEach((n) => {
          void backendClient.updateNotification(n.id, { is_read: true }).catch(() => undefined);
        });
    }
    showToast('Notifications Updated', 'All notifications marked as read.', 'info');
  };

  const addActivity = (actData: Omit<ActivityItem, 'id'>) => {
    const newAct: ActivityItem = {
      ...actData,
      id: `act-${Date.now()}`
    };
    setActivities(prev => [newAct, ...prev]);
    if (isAuthenticated && getAuthToken()) {
      void backendClient
        .createActivity({
          description: actData.description,
          event_timestamp: actData.timestamp,
          type: actData.type,
        })
        .then((saved) => {
          setActivities((prev) => [saved, ...prev.filter((row) => row.id !== newAct.id && row.id !== saved.id)]);
        })
        .catch(() => undefined);
    }
  };

  const addNotification = (title: string, type: NotificationItem['type'] = 'general') => {
    const local: NotificationItem = {
      id: `ntf-${Date.now()}`,
      title,
      timestamp: 'Just now',
      type,
      read: false,
    };
    setNotifications((prev) => [local, ...prev]);
    if (isAuthenticated && getAuthToken()) {
      void backendClient
        .createNotification({
          title,
          event_timestamp: local.timestamp,
          type,
          is_read: false,
        })
        .then((saved) => {
          setNotifications((prev) => [saved, ...prev.filter((row) => row.id !== local.id && row.id !== saved.id)]);
        })
        .catch(() => undefined);
    }
  };

  const inviteStaffUser = async (details: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    department?: string;
    assignedBranch?: string;
    password?: string;
  }): Promise<{ staff: UserAccount; temporaryPassword?: string }> => {
    if (users.some((u) => u.email.toLowerCase() === details.email.trim().toLowerCase())) {
      throw new Error('A staff account with this email already exists.');
    }

    if (isAuthenticated && getAuthToken()) {
      try {
        const invited = await backendClient.inviteStaff({
          name: details.name.trim(),
          email: details.email.trim().toLowerCase(),
          password: details.password,
          phone: details.phone,
          role: details.role,
          department: details.department,
          assigned_branch: details.assignedBranch,
          designation: details.department,
        });
        const staff =
          invited.staff ||
          (await backendClient.createStaffUser({
            name: details.name.trim(),
            email: details.email.trim().toLowerCase(),
            phone: details.phone,
            role: details.role,
            department: details.department,
            assigned_branch: details.assignedBranch,
            status: 'Active',
            last_login: 'Never logged in',
          }));
        setUsers((prev) => [staff, ...prev.filter((u) => u.id !== staff.id && u.email !== staff.email)]);
        logAuditAction(`Invited Staff: ${staff.name}`, 'Users & Roles', `Role: ${staff.role}`);
        showToast('Staff Account Created', `Share login details with ${staff.name} manually.`, 'success');
        return { staff, temporaryPassword: invited.temporaryPassword };
      } catch (err: unknown) {
        // Fallback: directory-only row if auth invite fails (e.g. email exists in Auth)
        const staff = await backendClient.createStaffUser({
          name: details.name.trim(),
          email: details.email.trim().toLowerCase(),
          phone: details.phone,
          role: details.role,
          department: details.department,
          assigned_branch: details.assignedBranch,
          status: 'Active',
          last_login: 'Never logged in',
        });
        setUsers((prev) => [staff, ...prev.filter((u) => u.id !== staff.id)]);
        logAuditAction(`Added Staff Directory: ${staff.name}`, 'Users & Roles', `Role: ${staff.role}`, 'Warning');
        showToast(
          'Staff Saved (directory)',
          getErrorMessage(err, 'Auth invite failed; saved to staff directory only.'),
          'warning',
        );
        return { staff };
      }
    }

    const local: UserAccount = {
      id: `usr-${Date.now()}`,
      name: details.name.trim(),
      email: details.email.trim().toLowerCase(),
      role: details.role,
      phone: details.phone,
      department: details.department,
      assignedBranch: details.assignedBranch,
      status: 'Active',
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: 'Never logged in',
    };
    setUsers((prev) => [local, ...prev]);
    const password = details.password && details.password.length >= 8 ? details.password : LOCAL_DEMO_PASSWORD;
    setLocalPassword(local.email, password);
    showToast('Staff Invited', `Account for ${local.name} has been created locally.`, 'success');
    return { staff: local, temporaryPassword: password };
  };

  const addStudentHistoryEvent = async (event: Omit<StudentHistoryEvent, 'id'>) => {
    const local: StudentHistoryEvent = { ...event, id: `hist-${Date.now()}` };
    setStudentHistoryEvents((prev) => [local, ...prev]);
    if (isAuthenticated && getAuthToken()) {
      try {
        const saved = await backendClient.createStudentHistoryEvent({
          student_id: event.studentId,
          event_date: event.date,
          event: event.event,
          event_desc: event.desc,
          type: event.type,
        });
        setStudentHistoryEvents((prev) => [saved, ...prev.filter((row) => row.id !== local.id && row.id !== saved.id)]);
        return saved;
      } catch (err: unknown) {
        showToast('History Save Failed', getErrorMessage(err, 'Could not save history event.'), 'danger');
        throw err;
      }
    }
    return local;
  };

  const addExpense = async (expData: Omit<ExpenseItem, 'id'>) => {
    try {
      const created = isAuthenticated && getAuthToken()
        ? await backendClient.createExpense({
            title: expData.title,
            category: expData.category,
            amount: expData.amount,
            date: expData.date,
            paid_to: expData.paidTo,
            payment_mode: expData.paymentMode,
            status: expData.status.toLowerCase(),
          })
        : { ...expData, id: `EXP-${expenses.length + 1}` };

      setExpenses(prev => [created, ...prev.filter(e => e.id !== created.id)]);
      logAuditAction(`Recorded Expense: ₹${created.amount}`, 'Expenses', `${created.title} paid to ${created.paidTo}`);
      showToast('Expense Recorded', `₹${created.amount.toLocaleString('en-IN')} logged for ${created.title}`, 'info');
    } catch (err: unknown) {
      showToast('Expense Save Failed', getErrorMessage(err, 'Could not save expense.'), 'danger');
      throw err;
    }
  };

  const addFeeStructure = async (item: Omit<FeeStructureItem, 'id' | 'total'> & { total?: number }) => {
    const total =
      item.total ??
      Number(item.tuition || 0) +
        Number(item.lab || 0) +
        Number(item.sports || 0) +
        Number(item.library || 0) +
        Number(item.exam || 0);

    try {
      const created =
        isAuthenticated && getAuthToken()
          ? await backendClient.createFeeStructure({
              grade: item.grade,
              tuition: item.tuition,
              lab: item.lab,
              sports: item.sports,
              library: item.library,
              exam: item.exam,
              total,
              academic_year: item.academicYear,
            })
          : {
              id: `FS-${Date.now()}`,
              grade: item.grade,
              tuition: item.tuition,
              lab: item.lab,
              sports: item.sports,
              library: item.library,
              exam: item.exam,
              total,
              academicYear: item.academicYear,
            };

      setFeeStructures((prev) => [created, ...prev.filter((row) => row.id !== created.id)]);
      logAuditAction(`Added Fee Structure: ${created.grade}`, 'Fees', `Annual total ₹${created.total}`);
      showToast('Fee Structure Saved', `${created.grade} added successfully.`, 'success');
    } catch (err: unknown) {
      showToast('Fee Structure Save Failed', getErrorMessage(err, 'Could not save fee structure.'), 'danger');
      throw err;
    }
  };

  const deleteFeeStructure = async (id: string) => {
    try {
      if (isAuthenticated && getAuthToken()) {
        await backendClient.deleteFeeStructure(id);
      }
      setFeeStructures((prev) => prev.filter((row) => row.id !== id));
      showToast('Fee Structure Removed', 'Row deleted from fee structure list.', 'info');
    } catch (err: unknown) {
      showToast('Delete Failed', getErrorMessage(err, 'Could not delete fee structure.'), 'danger');
      throw err;
    }
  };

  const isPersistedResourceId = (id: string) =>
    !id.startsWith('batch-') && !id.startsWith('subj-') && !id.startsWith('tt-');
  const isUuid = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  const addBatch = async (batchData: Omit<BatchShift, 'id'>) => {
    try {
      const created = isAuthenticated && getAuthToken()
        ? await backendClient.createBatch({
            batch_name: batchData.name,
            timing: batchData.timing,
            grades: batchData.grades,
            status: batchData.status.toLowerCase(),
          })
        : { ...batchData, id: `batch-${Date.now()}` };

      setBatches(prev => [created, ...prev.filter(b => b.id !== created.id)]);
      logAuditAction(`Created Academic Shift: ${created.name}`, 'Batch Management', `Timings: ${created.timing}, Grades: ${created.grades}`);
      showToast('Shift / Batch Created', `${created.name} configured successfully.`, 'success');
    } catch (err: unknown) {
      showToast('Batch Save Failed', getErrorMessage(err, 'Could not save academic shift.'), 'danger');
      throw err;
    }
  };

  const deleteBatch = async (id: string) => {
    const target = batches.find(b => b.id === id);
    try {
      if (isAuthenticated && getAuthToken() && isPersistedResourceId(id)) {
        await backendClient.deleteBatch(id);
      }
      setBatches(prev => prev.filter(b => b.id !== id));
      logAuditAction(`Deleted Shift: ${target?.name || id}`, 'Batch Management', 'Shift schedule removed.', 'Warning');
      showToast('Shift Deleted', 'Academic shift removed.', 'warning');
    } catch (err: unknown) {
      showToast('Delete Failed', getErrorMessage(err, 'Could not delete academic shift.'), 'danger');
      throw err;
    }
  };

  const addSubject = async (subjData: Omit<SubjectItem, 'id'>) => {
    try {
      const created = isAuthenticated && getAuthToken()
        ? await backendClient.createSubject({
            name: subjData.name,
            code: subjData.code,
            dept: subjData.dept,
            status: 'active',
          })
        : { ...subjData, id: `subj-${Date.now()}` };

      setSubjects(prev => [created, ...prev.filter(s => s.id !== created.id)]);
      logAuditAction(`Created Subject: ${created.name} (${created.code})`, 'Academics', `Dept: ${created.dept}`);
      showToast('Subject Added', `${created.name} registered.`, 'success');
    } catch (err: unknown) {
      showToast('Subject Save Failed', getErrorMessage(err, 'Could not save subject.'), 'danger');
      throw err;
    }
  };

  const deleteSubject = async (id: string) => {
    const target = subjects.find(s => s.id === id);
    try {
      if (isAuthenticated && getAuthToken() && isPersistedResourceId(id)) {
        await backendClient.deleteSubject(id);
      }
      setSubjects(prev => prev.filter(s => s.id !== id));
      logAuditAction(`Deleted Subject: ${target?.name || id}`, 'Academics', 'Subject curriculum removed.', 'Warning');
      showToast('Subject Removed', 'Subject removed from curriculum.', 'warning');
    } catch (err: unknown) {
      showToast('Delete Failed', getErrorMessage(err, 'Could not delete subject.'), 'danger');
      throw err;
    }
  };

  const addTeacherAssignment = async (assignData: Omit<TeacherAssignment, 'id'>) => {
    try {
      const created =
        isAuthenticated && getAuthToken()
          ? await backendClient.createTeacherAssignment({
              teacher: assignData.teacher,
              assigned_class: assignData.assignedClass,
              subject: assignData.subject,
              status: assignData.status,
            })
          : { ...assignData, id: `assign-${Date.now()}` };

      const assignment = { ...created, role: assignData.role, weeklyLoad: assignData.weeklyLoad };
      setTeacherAssignments(prev => [assignment, ...prev.filter((row) => row.id !== assignment.id)]);
      logAuditAction(`Assigned Teacher: ${assignment.teacher}`, 'Staff Allotment', `Class: ${assignment.assignedClass}, Subject: ${assignment.subject}`);
      showToast('Teacher Assigned', `${assignment.teacher} assigned to ${assignment.assignedClass}`, 'success');
    } catch (err: unknown) {
      showToast('Assignment Failed', getErrorMessage(err, 'Could not save teacher assignment.'), 'danger');
      throw err;
    }
  };

  const deleteTeacherAssignment = async (id: string) => {
    try {
      if (isAuthenticated && getAuthToken() && isUuid(id)) {
        await backendClient.deleteTeacherAssignment(id);
      }
      setTeacherAssignments(prev => prev.filter(a => a.id !== id));
      logAuditAction('Removed Teacher Assignment', 'Staff Allotment', 'Workload allotment updated.', 'Warning');
      showToast('Assignment Removed', 'Teacher allotment removed.', 'warning');
    } catch (err: unknown) {
      showToast('Delete Failed', getErrorMessage(err, 'Could not remove teacher assignment.'), 'danger');
      throw err;
    }
  };

  const saveDailyAttendance = async (
    records: AttendanceRecord[],
    date: string,
    classId?: string,
  ) => {
    if (LOCAL_ONLY || !isAuthenticated || !getAuthToken()) {
      setAttendanceRecords((prev) => {
        const kept = prev.filter(
          (row) =>
            !(
              records.some((record) => record.studentId === row.studentId) &&
              row.attendanceDate === date &&
              (classId ? row.classId === classId : true)
            ),
        );
        const next = records.map((record) => ({
          id: `att-${date}-${record.studentId}`,
          studentId: record.studentId,
          classId,
          attendanceDate: date,
          status: record.status,
          remarks: record.remarks,
        }));
        return [...next, ...kept];
      });
      return;
    }

    const existing = await backendClient.getAttendance();
    await Promise.all(
      records.map((record) => {
        const saved = existing.find(
          (row) =>
            row.studentId === record.studentId &&
            row.attendanceDate === date &&
            (classId ? row.classId === classId : true),
        );
        const payload = {
          student_id: record.studentId,
          class_id: classId,
          attendance_date: date,
          status: record.status,
          remarks: record.remarks,
        };
        return saved
          ? backendClient.updateAttendance(saved.id, payload)
          : backendClient.createAttendance(payload);
      }),
    );
    setAttendanceRecords(await backendClient.getAttendance());
  };

  const updateMaintenanceMode = async (enabled: boolean) => {
    if (LOCAL_ONLY || !isAuthenticated || !getAuthToken()) {
      setMaintenanceMode(enabled);
      localStorage.setItem('cms_system_maintenance_mode', String(enabled));
      return;
    }
    const payload = { maintenance_mode: enabled };
    const saved =
      accountSettingsId && /^[0-9a-f-]{36}$/i.test(accountSettingsId)
        ? await backendClient.updateAccountSettings(accountSettingsId, payload)
        : await backendClient.createAccountSettings(payload);
    setAccountSettingsId(saved.id);
    setMaintenanceMode(saved.maintenanceMode);
    localStorage.setItem('cms_system_maintenance_mode', String(saved.maintenanceMode));
  };

  const updateTimetableCell = async (className: string, day: string, periodIndex: number, subject: string) => {
    const trimmedSubject = subject.trim();
    const existing = timetable.find(
      (entry) => entry.className === className && entry.day === day && entry.periodIndex === periodIndex,
    );
    const classRecord = classes.find((item) => item.name === className);

    try {
      if (!trimmedSubject) {
        if (isAuthenticated && getAuthToken() && existing && isPersistedResourceId(existing.id)) {
          await backendClient.deleteTimetableEntry(existing.id);
        }
        setTimetable((prev) =>
          prev.filter((entry) => !(entry.className === className && entry.day === day && entry.periodIndex === periodIndex)),
        );
        showToast('Timetable Updated', `${className} (${day} Period ${periodIndex + 1}) -> Free`, 'info');
        return;
      }

      let subjectRecord = subjects.find((item) => item.name.toLowerCase() === trimmedSubject.toLowerCase());
      if (!subjectRecord && isAuthenticated && getAuthToken()) {
        subjectRecord = await backendClient.createSubject({
          code: `SUB-${Date.now()}`,
          name: trimmedSubject,
          dept: 'General',
          status: 'active',
        });
        setSubjects((prev) => [subjectRecord!, ...prev.filter((item) => item.id !== subjectRecord!.id)]);
      }

      let saved: TimetableEntry;
      const payload = {
        day_of_week: day,
        period_index: periodIndex,
        class_id: classRecord?.id,
        subject_id: subjectRecord?.id,
      };

      if (isAuthenticated && getAuthToken()) {
        saved =
          existing && isPersistedResourceId(existing.id)
            ? await backendClient.updateTimetableEntry(existing.id, payload, classes, subjects)
            : await backendClient.createTimetableEntry(payload, classes, subjects);
        saved = {
          ...saved,
          className: saved.className || className,
          subject: saved.subject || trimmedSubject,
        };
      } else {
        saved = {
          id: existing?.id || `tt-${className}-${day}-${periodIndex}`,
          className,
          day,
          periodIndex,
          subject: trimmedSubject,
        };
      }

      setTimetable((prev) => {
        const filtered = prev.filter(
          (entry) => !(entry.className === className && entry.day === day && entry.periodIndex === periodIndex),
        );
        return [...filtered, saved];
      });
      showToast('Timetable Updated', `${className} (${day} Period ${periodIndex + 1}) -> ${trimmedSubject}`, 'info');
    } catch (err: unknown) {
      showToast('Timetable Save Failed', getErrorMessage(err, 'Could not save timetable cell.'), 'danger');
      throw err;
    }
  };

  const saveTimetablePeriods = async (
    className: string,
    periods: TimetablePeriodSlot[],
    classId?: string,
  ): Promise<TimetablePeriodConfig> => {
    const existing = timetablePeriodConfigs.find((row) => row.className === className);
    const payloadPeriods = periods.map((slot, index) => ({
      id: slot.id || `slot-${index}`,
      short: slot.short,
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      kind: slot.kind,
    }));

    try {
      let saved: TimetablePeriodConfig;
      if (isAuthenticated && getAuthToken()) {
        saved =
          existing && isPersistedResourceId(existing.id)
            ? await backendClient.updateTimetablePeriodConfig(existing.id, {
                class_name: className,
                class_id: classId,
                periods: payloadPeriods,
              })
            : await backendClient.createTimetablePeriodConfig({
                class_name: className,
                class_id: classId,
                periods: payloadPeriods,
              });
      } else {
        saved = {
          id: existing?.id || `local-${className}`,
          className,
          classId,
          periods: payloadPeriods,
        };
      }

      setTimetablePeriodConfigs((prev) => {
        const filtered = prev.filter((row) => row.className !== className && row.id !== saved.id);
        return [saved, ...filtered];
      });
      return saved;
    } catch (err: unknown) {
      showToast('Period Save Failed', getErrorMessage(err, 'Could not save timetable periods.'), 'danger');
      throw err;
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0] || null;

  // Dynamic Live Stats calculated purely from local storage collections
  const totalCollectedCalc = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);
  const pendingFeesCalc = pendingFees.reduce((acc, p) => acc + (p.totalDue || 0), 0) || students.reduce((acc, s) => acc + Math.max(0, (s.totalFee || 0) - (s.paidFee || 0)), 0);
  const totalTargetFee = totalCollectedCalc + pendingFeesCalc;
  const collectionPercentageCalc = totalTargetFee > 0 ? Math.round((totalCollectedCalc / totalTargetFee) * 100) : 0;

  const dynamicStats = {
    totalStudents: students.length,
    totalParents: parents.length,
    totalClasses: classes.length,
    totalFeeCollection: totalCollectedCalc,
    pendingFees: pendingFeesCalc,
    todayAttendanceRate: students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.attendanceRate || 90), 0) / students.length) : 0,
    totalConcession: 0,
    collectionPercentage: collectionPercentageCalc
  };

  const logout = async () => {
    if (!LOCAL_ONLY) {
      try {
        await backendClient.signout();
      } catch {
        // ignore
      }
    }
    clearAuthToken();
    localStorage.removeItem('smartlearning_current_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsLoginModalOpen(false);
    if (LOCAL_ONLY) {
      setCurrentRoute('dashboard');
      showToast('Logged Out', 'Signed out. Your local demo data is still saved in this browser.', 'info');
      return;
    }
    setStudents([]);
    setParents([]);
    setClasses([]);
    setPendingFees([]);
    setFeeStructures([]);
    setExpenses([]);
    setBatches([]);
    setSubjects([]);
    setTeacherAssignments([]);
    setTimetable([]);
    setTimetablePeriodConfigs([]);
    setAttendanceRecords([]);
    setDocuments([]);
    setRecentReceipts([]);
    setStudentHistoryEvents([]);
    setAccountSettingsId(null);
    setAccountSettingsHydrated(false);
    setCurrentRoute('dashboard');
    showToast('Logged Out', 'Signed out from administrator portal.', 'info');
  };

  const addDocument = async (docData: Omit<StudentDocument, 'id'> & { id?: string }) => {
    let newDoc: StudentDocument = {
      id: docData.id || `DOC-${Date.now()}`,
      studentId: docData.studentId || '',
      studentName: docData.studentName || 'Student',
      title: docData.title,
      docType: docData.docType || 'Identity',
      uploadDate: docData.uploadDate || new Date().toISOString().slice(0, 10),
      status: docData.status || 'Pending Review',
      size: docData.size || '1.2 MB',
      ...(docData.url ? { url: docData.url } : {}),
    };

    if (isAuthenticated && getAuthToken()) {
      try {
        newDoc = await backendClient.createDocument({
          student_id: newDoc.studentId,
          student_name: newDoc.studentName,
          title: newDoc.title,
          doc_type: newDoc.docType,
          upload_date: newDoc.uploadDate,
          status: newDoc.status,
          size: newDoc.size,
          ...(newDoc.url ? { url: newDoc.url } : {}),
        });
      } catch {
        // Keep local fallback if backend write fails
      }
    }
    setDocuments(prev => {
      const updated = [newDoc, ...prev];
      localStorage.setItem('cms_documents', JSON.stringify(updated));
      return updated;
    });
    showToast('Document Uploaded', `Attached ${newDoc.title} to student record.`, 'success');
  };

  const verifyDocument = async (id: string) => {
    const target = documents.find((document) => document.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Verified' ? 'Pending Review' : 'Verified';

    try {
      const saved =
        isAuthenticated && getAuthToken() && isUuid(id)
          ? await backendClient.updateDocument(id, { status: nextStatus })
          : { ...target, status: nextStatus };
      setDocuments(prev => {
        const updated = prev.map(d => d.id === id ? saved : d);
        localStorage.setItem('cms_documents', JSON.stringify(updated));
        return updated;
      });
      showToast('Verification Updated', 'Document status toggled.', 'info');
    } catch (err: unknown) {
      showToast('Verification Failed', getErrorMessage(err, 'Could not update document.'), 'danger');
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      if (isAuthenticated && getAuthToken() && isUuid(id)) {
        await backendClient.deleteDocument(id);
      }
      setDocuments(prev => {
        const updated = prev.filter(d => d.id !== id);
        localStorage.setItem('cms_documents', JSON.stringify(updated));
        return updated;
      });
      showToast('Document Removed', 'Document deleted successfully.', 'info');
    } catch (err: unknown) {
      showToast('Delete Failed', getErrorMessage(err, 'Could not delete document.'), 'danger');
      throw err;
    }
  };

  const recordFeePayment = async (payment: {
    studentId: string;
    studentName: string;
    className?: string;
    amount: number;
    mode?: string;
    receiptNo?: string;
    notes?: string;
  }): Promise<FeeReceipt> => {
    const date = new Date().toISOString().slice(0, 10);
    const student = students.find((s) => s.id === payment.studentId);
    const newPaid = Number(student?.paidFee || 0) + Number(payment.amount);
    const total = Number(student?.totalFee || 0);
    const feeStatus: Student['feeStatus'] =
      total > 0 && newPaid >= total ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

    try {
      let receipt: FeeReceipt = {
        id: `REC-${Date.now()}`,
        receiptNo:
          payment.receiptNo ||
          `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: payment.studentId,
        studentName: payment.studentName,
        className: payment.className || student?.className || '',
        amount: payment.amount,
        mode: payment.mode || 'Cash',
        date,
        status: 'Success',
      };

      if (isAuthenticated && getAuthToken()) {
        receipt = await backendClient.createFeePayment({
          student_id: payment.studentId || undefined,
          student_name: payment.studentName,
          class_name: payment.className || student?.className || undefined,
          amount: payment.amount,
          mode: payment.mode || 'Cash',
          receipt_no: receipt.receiptNo,
          notes: payment.notes || undefined,
          date,
          status: 'Success',
        });

        if (payment.studentId) {
          try {
            await backendClient.updateStudent(payment.studentId, {
              paidFee: newPaid,
              feeStatus,
              totalFee: total || student?.totalFee,
            });
          } catch {
            // Payment is saved; student balance sync may fail if columns missing
          }
        }
      }

      setRecentReceipts((prev) => {
        const updated = [receipt, ...prev.filter((r) => r.id !== receipt.id)];
        localStorage.setItem('cms_fee_receipts', JSON.stringify(updated));
        return updated;
      });

      if (payment.studentId) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === payment.studentId
              ? {
                  ...s,
                  paidFee: newPaid,
                  feeStatus,
                }
              : s,
          ),
        );

        setPendingFees((prev) =>
          prev
            .map((p) => {
              if (p.studentId !== payment.studentId && !p.studentName.toLowerCase().includes(payment.studentName.toLowerCase())) {
                return p;
              }
              const remaining = Math.max(0, Number(p.totalDue || 0) - Number(payment.amount));
              if (remaining <= 0) return null;
              return {
                ...p,
                totalDue: remaining,
                status: remaining > 20000 ? ('Overdue' as const) : ('Partial' as const),
              };
            })
            .filter(Boolean) as typeof prev,
        );
      }

      addActivity({
        description: `Fee collected ₹${payment.amount.toLocaleString('en-IN')} from ${payment.studentName} (${payment.mode || 'Cash'})`,
        timestamp: 'Just now',
        type: 'fee',
      });

      logAuditAction(
        `Fee Collected: ₹${payment.amount.toLocaleString('en-IN')}`,
        'Fee Management',
        `Student: ${payment.studentName}, Mode: ${payment.mode || 'Cash'}, Receipt: ${receipt.receiptNo}`,
      );

      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
      } catch {
        // ignore
      }

      showToast(
        'Fee Payment Received',
        `₹${payment.amount.toLocaleString('en-IN')} received for ${payment.studentName}.`,
        'success',
      );
      return receipt;
    } catch (err: unknown) {
      showToast('Payment Failed', getErrorMessage(err, 'Could not save fee payment.'), 'danger');
      throw err;
    }
  };

  const grantStudentLogin = (studentId: string, email: string, password?: string, known?: Student) => {
    const student = known || students.find((item) => item.id === studentId);
    if (!student) throw new Error('Student not found.');
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error('Enter a valid login email.');
    }
    const temporaryPassword = (password || '').trim() || LOCAL_DEMO_PASSWORD;
    if (temporaryPassword.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
    const clash = users.find((user) => user.email.toLowerCase() === normalized && user.studentId !== studentId);
    if (clash) throw new Error('That email is already used by another account.');
    setLocalPassword(normalized, temporaryPassword);
    setUsers((prev) => {
      const existing = prev.find((user) => user.studentId === studentId);
      const account: UserAccount = {
        id: existing?.id || `usr-${studentId}`,
        name: student.name,
        email: normalized,
        role: 'student',
        status: existing?.status === 'Suspended' ? 'Suspended' : 'Active',
        phone: student.parentPhone,
        createdAt: existing?.createdAt || new Date().toISOString(),
        studentId,
        department: `${student.className} ${student.section}`.trim(),
        mustChangePassword: true,
      };
      return existing
        ? prev.map((user) => (user.studentId === studentId ? account : user))
        : [account, ...prev];
    });
    setStudents((prev) => prev.map((item) => (item.id === studentId ? { ...item, loginEmail: normalized } : item)));
    logAuditAction(`Student login: ${student.name}`, 'Student Portal', normalized);
    return { email: normalized, temporaryPassword };
  };

  const completeStudentPasswordReset = (email: string, newPassword: string) => {
    const normalized = email.trim().toLowerCase();
    const next = newPassword.trim();
    if (next.length < 8) throw new Error('Use at least 8 characters.');
    const current = getLocalPassword(normalized);
    if (current && next === current) throw new Error('Choose a password that is different from the temporary one.');
    setLocalPassword(normalized, next);
    setUsers((prev) =>
      prev.map((user) => (user.email.toLowerCase() === normalized ? { ...user, mustChangePassword: false } : user)),
    );
  };

  const addAssignment = (item: Omit<AssignmentItem, 'id' | 'createdAt'>) => {
    const created: AssignmentItem = { ...item, id: `asg-${Date.now()}`, createdAt: new Date().toISOString() };
    setAssignments((prev) => [created, ...prev]);
    showToast('Assignment saved', `${created.title} is ready for students.`, 'success');
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((item) => item.id !== id));
    setSubmissions((prev) => prev.filter((item) => item.assignmentId !== id));
    showToast('Assignment removed', 'That assignment and its answers were removed from this browser.', 'warning');
  };

  const submitAssignment = (payload: { assignmentId: string; studentId: string; studentName: string; fileName: string; fileData: string }) => {
    const existing = submissions.find((item) => item.assignmentId === payload.assignmentId && item.studentId === payload.studentId);
    if (existing?.marks != null) {
      showToast('Already graded', 'This answer is graded. Ask your teacher before sending another file.', 'warning');
      return;
    }
    const next: AssignmentSubmission = {
      id: existing?.id || `sub-${Date.now()}`,
      assignmentId: payload.assignmentId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      fileName: payload.fileName,
      fileData: payload.fileData,
      submittedAt: new Date().toISOString(),
      marks: null,
      feedback: '',
    };
    setSubmissions((prev) => [next, ...prev.filter((item) => item.id !== next.id)]);
    showToast('Answer submitted', 'Your PDF is with the teacher.', 'success');
  };

  const gradeSubmission = (id: string, marks: number, feedback: string, gradedBy: string) => {
    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, marks, feedback, gradedBy, gradedAt: new Date().toISOString() }
          : item,
      ),
    );
    showToast('Grade saved', 'The student can see this mark on their portal.', 'success');
  };

  const addQuiz = (item: Omit<QuizItem, 'id' | 'createdAt'>) => {
    const created: QuizItem = { ...item, id: `quiz-${Date.now()}`, createdAt: new Date().toISOString() };
    setQuizzes((prev) => [created, ...prev]);
    showToast('Quiz saved', `${created.title} is open for that class.`, 'success');
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((item) => item.id !== id));
    setQuizAttempts((prev) => prev.filter((item) => item.quizId !== id));
    showToast('Quiz removed', 'That quiz and its attempts were removed from this browser.', 'warning');
  };

  const submitQuiz = (payload: { quizId: string; studentId: string; studentName: string; answers: number[]; score: number }) => {
    if (quizAttempts.some((item) => item.quizId === payload.quizId && item.studentId === payload.studentId)) {
      showToast('Already submitted', 'You can take this quiz only once.', 'warning');
      return;
    }
    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      quizId: payload.quizId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      answers: payload.answers,
      score: payload.score,
      submittedAt: new Date().toISOString(),
    };
    setQuizAttempts((prev) => [attempt, ...prev]);
    showToast('Quiz submitted', `Score ${payload.score}.`, 'success');
  };

  const requestAttendance = (payload: { studentId: string; studentName: string; className: string; section: string; date: string; note: string }) => {
    const duplicate = attendanceRequests.find(
      (item) => item.studentId === payload.studentId && item.date === payload.date && item.status === 'Pending',
    );
    if (duplicate) {
      showToast('Already sent', 'Your teacher already has a request for that date.', 'info');
      return;
    }
    const created: AttendanceRequest = {
      id: `ar-${Date.now()}`,
      ...payload,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setAttendanceRequests((prev) => [created, ...prev]);
    showToast('Request sent', 'Your teacher will mark the register. This does not mark you present.', 'success');
  };

  const noteAttendanceRequest = (id: string) => {
    setAttendanceRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Noted' } : item)));
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        academicYear,
        setAcademicYear,
        theme,
        setTheme,
        toggleTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        searchQuery,
        setSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,

        // Authentication & Modals
        currentUser,
        setCurrentUser,
        isAuthenticated,
        setIsAuthenticated,
        authChecking,
        isLoginModalOpen,
        setIsLoginModalOpen,
        logout,

        // Student Documents
        documents,
        setDocuments,
        addDocument,
        verifyDocument,
        deleteDocument,

        // Fee Receipts & Payments
        recentReceipts,
        recordFeePayment,

        // Super Admin & Master
        activeUserRole,
        setActiveUserRole,
        institutionConfig,
        setInstitutionConfig,
        users,
        setUsers,
        auditLogs,
        setAuditLogs,
        featureToggles,
        setFeatureToggles,
        permissionMatrix,
        setPermissionMatrix,
        logAuditAction,

        // Data Management
        clearAllData,
        resetToDemoData,

        // Data
        students,
        setStudents,
        selectedStudent,
        setSelectedStudentId,
        addStudent,
        updateStudent,
        deleteStudent,
        parents,
        setParents,
        addParent,
        classes,
        setClasses,
        addClass,
        pendingFees,
        setPendingFees,
        collectFee,
        feeStructures,
        setFeeStructures,
        addFeeStructure,
        deleteFeeStructure,
        notifications,
        setNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        inviteStaffUser,
        studentHistoryEvents,
        addStudentHistoryEvent,
        activities,
        setActivities,
        addActivity,
        expenses,
        setExpenses,
        addExpense,
        batches,
        setBatches,
        addBatch,
        deleteBatch,
        subjects,
        setSubjects,
        addSubject,
        deleteSubject,
        teacherAssignments,
        setTeacherAssignments,
        addTeacherAssignment,
        deleteTeacherAssignment,
        saveDailyAttendance,
        attendanceRecords,
        setAttendanceRecords,
        assignments,
        submissions,
        quizzes,
        quizAttempts,
        attendanceRequests,
        grantStudentLogin,
        completeStudentPasswordReset,
        addAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        addQuiz,
        deleteQuiz,
        submitQuiz,
        requestAttendance,
        noteAttendanceRequest,
        timetable,
        setTimetable,
        updateTimetableCell,
        timetablePeriodConfigs,
        saveTimetablePeriods,
        stats: dynamicStats,
        maintenanceMode,
        updateMaintenanceMode,
        toastMessage,
        showToast,
        clearToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
