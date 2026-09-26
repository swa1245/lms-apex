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
  InstitutionConfig,
  AuditLogEntry,
  SystemFeatureToggle,
  RolePermissionMatrix
} from '../types';

export const STORAGE_KEYS = {
  CURRENT_ROUTE: 'cms_current_route',
  CURRENT_USER_ROLE: 'cms_active_user_role',
  CURRENT_USER: 'cms_current_user',
  ACADEMIC_YEAR: 'cms_academic_year',
  STUDENTS: 'cms_students',
  PARENTS: 'cms_parents',
  CLASSES: 'cms_classes',
  BATCHES: 'cms_batches',
  SUBJECTS: 'cms_subjects',
  TEACHER_ASSIGNMENTS: 'cms_teacher_assignments',
  TIMETABLE: 'cms_timetable',
  TIMETABLE_PERIODS: 'cms_timetable_periods',
  PENDING_FEES: 'cms_pending_fees',
  FEE_STRUCTURES: 'cms_fee_structures',
  NOTIFICATIONS: 'cms_notifications',
  ACTIVITIES: 'cms_activities',
  EXPENSES: 'cms_expenses',
  ANNOUNCEMENTS: 'cms_announcements',
  EXAMS: 'cms_exams',
  TEACHERS: 'cms_teachers',
  USERS: 'cms_users',
  INSTITUTION_CONFIG: 'cms_institution_config',
  AUDIT_LOGS: 'cms_audit_logs',
  FEATURE_TOGGLES: 'cms_feature_toggles',
  PERMISSION_MATRIX: 'cms_permission_matrix',
  SYSTEM_MAINTENANCE: 'cms_system_maintenance_mode'
};

// Default institution master setup
export const DEFAULT_INSTITUTION_CONFIG: InstitutionConfig = {
  schoolName: 'Apex International Public School',
  schoolCode: 'AIPS-DEL-894',
  tagline: 'Empowering Future Leaders with Excellence & Discipline',
  affiliationNo: 'CBSE/AFF/2024/98712',
  board: 'Central Board of Secondary Education (CBSE)',
  email: 'info@apexschool.edu',
  phone: '+91 (011) 2894-3300',
  alternatePhone: '+91 98765 43210',
  address: 'Sector 14, Institutional Area, New Delhi - 110075, India',
  website: 'https://apexschool.edu',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
  academicYear: '2026-2027',
  currency: 'INR',
  currencySymbol: '₹',
  taxRegistrationNo: 'GSTIN07AAACR1234F1Z5',
  timezone: 'Asia/Kolkata (IST, UTC+05:30)',
  branches: [
    {
      id: 'br-main',
      name: 'Apex Main Campus (Dwarka)',
      code: 'AIPS-DWK',
      city: 'New Delhi',
      principalName: 'Dr. Rajeshwar Sharma, Ph.D.',
      isMain: true
    },
    {
      id: 'br-noida',
      name: 'Apex City Campus (Noida)',
      code: 'AIPS-NOI',
      city: 'Noida, UP',
      principalName: 'Mrs. Sunita Venkat, M.Ed.',
      isMain: false
    }
  ]
};

// Default School Staff Users (Note: Superadmin is the App Developer operating at infrastructure level and is not mixed into school staff)
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin-1',
    name: 'School Administrator',
    email: 'admin@apexschool.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98000 00001',
    status: 'Active',
    lastLogin: 'Today, 09:15 AM',
    createdAt: '2023-01-01',
    department: 'School Operations & Administration',
    assignedBranch: 'All Campuses (School Level)'
  },
  {
    id: 'usr-principal',
    name: 'Dr. Rajeshwar Sharma',
    email: 'principal@apexschool.edu',
    role: 'principal',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98000 00002',
    status: 'Active',
    lastLogin: 'Today, 08:30 AM',
    createdAt: '2023-03-15',
    department: 'Academic Directorate',
    assignedBranch: 'Apex Main Campus'
  },
  {
    id: 'usr-accountant',
    name: 'Virendra Oberoi',
    email: 'accounts@apexschool.edu',
    role: 'accountant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98000 00003',
    status: 'Active',
    lastLogin: 'Today, 09:00 AM',
    createdAt: '2023-04-10',
    department: 'Finance & Treasury',
    assignedBranch: 'Apex Main Campus'
  },
  {
    id: 'usr-teacher-1',
    name: 'Mrs. Anjali Sen',
    email: 'anjali.sen@apexschool.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98000 00004',
    status: 'Active',
    lastLogin: 'Yesterday, 04:15 PM',
    createdAt: '2023-06-01',
    department: 'Science & Mathematics',
    assignedBranch: 'Apex Main Campus'
  },
  {
    id: 'usr-parent-1',
    name: 'Rameshwar Sharma (Parent)',
    email: 'ramesh.sharma@parent.apex.edu',
    role: 'parent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98123 45678',
    status: 'Active',
    lastLogin: '2 days ago',
    createdAt: '2023-07-20',
    department: 'PTA Committee',
    assignedBranch: 'Apex Main Campus'
  }
];

export const DEFAULT_FEATURE_TOGGLES: SystemFeatureToggle[] = [
  {
    id: 'feat-superadmin-mode',
    name: 'Super Admin Unrestricted Access',
    category: 'Security',
    description: 'Enables global root access, master overrides, schema modifications, and data wipes.',
    enabled: true,
    requiresSuperAdmin: true
  },
  {
    id: 'feat-pos-fee-collection',
    name: 'POS Instant Fee Collection',
    category: 'Finance',
    description: 'Allow on-spot counter receipt generation, UPI QR codes, and partial collection entries.',
    enabled: true,
    requiresSuperAdmin: false
  },
  {
    id: 'feat-sms-alerts',
    name: 'Automated SMS / WhatsApp Gateway',
    category: 'Communication',
    description: 'Send fee defaulter alerts, absent student triggers, and circular announcements automatically.',
    enabled: true,
    requiresSuperAdmin: false
  },
  {
    id: 'feat-parent-portal',
    name: 'Parent Guardian Portal',
    category: 'Core',
    description: 'Permit parents to log in, review live attendance cards, download fee receipts, and track marks.',
    enabled: true,
    requiresSuperAdmin: false
  },
  {
    id: 'feat-exam-marks-lock',
    name: 'Marks Entry Approval Lockdown',
    category: 'Academic',
    description: 'Require Super Admin or Principal sign-off before finalized report cards are published.',
    enabled: false,
    requiresSuperAdmin: true
  },
  {
    id: 'feat-audit-trail',
    name: 'Detailed System Audit Logging',
    category: 'Security',
    description: 'Record IP addresses, timestamps, role actors, and database mutations in real time.',
    enabled: true,
    requiresSuperAdmin: true
  }
];

export const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-101',
    timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    actorName: 'Super Administrator',
    actorRole: 'superadmin',
    actorEmail: 'superadmin@apexschool.edu',
    action: 'System Root Session Started',
    module: 'SuperAdmin Hub',
    ipAddress: '192.168.1.10 (Secured Intranet)',
    status: 'Success',
    details: 'Super Administrator logged in with full master privileges.'
  },
  {
    id: 'aud-102',
    timestamp: new Date(Date.now() - 3600000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    actorName: 'Virendra Oberoi',
    actorRole: 'accountant',
    actorEmail: 'accounts@apexschool.edu',
    action: 'Fee POS Receipt Generated',
    module: 'Fee Management',
    ipAddress: '192.168.1.44 (Accounts Desk)',
    status: 'Success',
    details: 'Receipt voucher issued to Aarav Sharma for Term 1 installment.'
  },
  {
    id: 'aud-103',
    timestamp: new Date(Date.now() - 7200000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    actorName: 'Dr. Rajeshwar Sharma',
    actorRole: 'principal',
    actorEmail: 'principal@apexschool.edu',
    action: 'Class Timetable Shift Approved',
    module: 'Classes & Timetable',
    ipAddress: '192.168.1.12 (Principal Office)',
    status: 'Success',
    details: 'Period 3 Math slot assigned to Grade 10-A.'
  }
];

export const DEFAULT_PERMISSION_MATRIX: RolePermissionMatrix[] = [
  {
    role: 'superadmin',
    label: 'App Developer / Super Admin',
    description: 'External root infrastructure power across all system databases, settings, and bypass mechanisms.',
    permissions: [
      { module: 'Students & Admissions', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Parent Directory', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Classes & Batches', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Fee & Financial Ledgers', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Daily Attendance Registers', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Exams & Grade Records', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Campus Expenses', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'SMS & Broadcasting', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'System Master & Backups', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true }
    ]
  },
  {
    role: 'admin',
    label: 'School Administrator',
    description: 'Complete operational management across all school modules and institutional settings.',
    permissions: [
      { module: 'Students & Admissions', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Parent Directory', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Classes & Batches', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Fee & Financial Ledgers', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Daily Attendance Registers', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Exams & Grade Records', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'Campus Expenses', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'SMS & Broadcasting', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { module: 'System Master & Backups', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true }
    ]
  },
  {
    role: 'principal',
    label: 'Principal / Academic Admin',
    description: 'Academic governance, faculty management, curriculum, and reports.',
    permissions: [
      { module: 'Students & Admissions', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'Parent Directory', canView: true, canCreate: false, canEdit: true, canDelete: false, canExport: true },
      { module: 'Classes & Batches', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'Fee & Financial Ledgers', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { module: 'Daily Attendance Registers', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'Exams & Grade Records', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'Campus Expenses', canView: true, canCreate: true, canEdit: false, canDelete: false, canExport: true },
      { module: 'SMS & Broadcasting', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'System Master & Backups', canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, isRestricted: true }
    ]
  },
  {
    role: 'accountant',
    label: 'Finance Officer / Accountant',
    description: 'Fee collection, POS receipts, expense tracking, and financial ledgers.',
    permissions: [
      { module: 'Students & Admissions', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { module: 'Parent Directory', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { module: 'Classes & Batches', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { module: 'Fee & Financial Ledgers', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'Daily Attendance Registers', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { module: 'Exams & Grade Records', canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, isRestricted: true },
      { module: 'Campus Expenses', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'SMS & Broadcasting', canView: true, canCreate: true, canEdit: false, canDelete: false, canExport: false },
      { module: 'System Master & Backups', canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, isRestricted: true }
    ]
  },
  {
    role: 'teacher',
    label: 'Teacher / Faculty',
    description: 'Attendance entry, marks grading, and classroom schedules.',
    permissions: [
      { module: 'Students & Admissions', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { module: 'Parent Directory', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { module: 'Classes & Batches', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { module: 'Fee & Financial Ledgers', canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, isRestricted: true },
      { module: 'Daily Attendance Registers', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'Exams & Grade Records', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { module: 'Campus Expenses', canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, isRestricted: true },
      { module: 'SMS & Broadcasting', canView: true, canCreate: true, canEdit: false, canDelete: false, canExport: false },
      { module: 'System Master & Backups', canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, isRestricted: true }
    ]
  }
];

// Helper to get raw storage item with fallback
export function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

// Helper to set storage item
export function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// Calculate total localStorage usage in KB
export function getLocalStorageSize(): { sizeKb: number; itemsCount: number } {
  try {
    let totalBytes = 0;
    let itemsCount = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const val = localStorage.getItem(key);
        if (val) {
          totalBytes += (key.length + val.length) * 2; // UTF-16
          itemsCount++;
        }
      }
    }
    return {
      sizeKb: parseFloat((totalBytes / 1024).toFixed(2)),
      itemsCount
    };
  } catch {
    return { sizeKb: 0, itemsCount: 0 };
  }
}

// Full Database Export as JSON file
export function exportFullDatabase(): string {
  const fullBackup: Record<string, any> = {
    exportDate: new Date().toISOString(),
    version: '2.0.0-superadmin',
    institution: getLocalItem(STORAGE_KEYS.INSTITUTION_CONFIG, DEFAULT_INSTITUTION_CONFIG),
    users: getLocalItem(STORAGE_KEYS.USERS, DEFAULT_USERS),
    students: getLocalItem(STORAGE_KEYS.STUDENTS, []),
    parents: getLocalItem(STORAGE_KEYS.PARENTS, []),
    classes: getLocalItem(STORAGE_KEYS.CLASSES, []),
    batches: getLocalItem(STORAGE_KEYS.BATCHES, []),
    subjects: getLocalItem(STORAGE_KEYS.SUBJECTS, []),
    teacherAssignments: getLocalItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []),
    timetable: getLocalItem(STORAGE_KEYS.TIMETABLE, []),
    pendingFees: getLocalItem(STORAGE_KEYS.PENDING_FEES, []),
    expenses: getLocalItem(STORAGE_KEYS.EXPENSES, []),
    notifications: getLocalItem(STORAGE_KEYS.NOTIFICATIONS, []),
    activities: getLocalItem(STORAGE_KEYS.ACTIVITIES, []),
    auditLogs: getLocalItem(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS),
    featureToggles: getLocalItem(STORAGE_KEYS.FEATURE_TOGGLES, DEFAULT_FEATURE_TOGGLES),
    permissionMatrix: getLocalItem(STORAGE_KEYS.PERMISSION_MATRIX, DEFAULT_PERMISSION_MATRIX)
  };
  return JSON.stringify(fullBackup, null, 2);
}

// Full Database Import from JSON
export function importFullDatabase(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON payload provided.' };
    }

    if (data.students) setLocalItem(STORAGE_KEYS.STUDENTS, data.students);
    if (data.parents) setLocalItem(STORAGE_KEYS.PARENTS, data.parents);
    if (data.classes) setLocalItem(STORAGE_KEYS.CLASSES, data.classes);
    if (data.batches) setLocalItem(STORAGE_KEYS.BATCHES, data.batches);
    if (data.subjects) setLocalItem(STORAGE_KEYS.SUBJECTS, data.subjects);
    if (data.teacherAssignments) setLocalItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, data.teacherAssignments);
    if (data.timetable) setLocalItem(STORAGE_KEYS.TIMETABLE, data.timetable);
    if (data.pendingFees) setLocalItem(STORAGE_KEYS.PENDING_FEES, data.pendingFees);
    if (data.expenses) setLocalItem(STORAGE_KEYS.EXPENSES, data.expenses);
    if (data.institution) setLocalItem(STORAGE_KEYS.INSTITUTION_CONFIG, data.institution);
    if (data.users) setLocalItem(STORAGE_KEYS.USERS, data.users);
    if (data.auditLogs) setLocalItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
    if (data.featureToggles) setLocalItem(STORAGE_KEYS.FEATURE_TOGGLES, data.featureToggles);
    if (data.permissionMatrix) setLocalItem(STORAGE_KEYS.PERMISSION_MATRIX, data.permissionMatrix);

    return { success: true, message: 'Database imported successfully and stored into local storage!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to parse JSON backup file.' };
  }
}

// Clean Wipe - Resets everything to an empty clean database
export function clearAllLocalDatabase(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // Set default active role to school administrator
  setLocalItem(STORAGE_KEYS.CURRENT_USER_ROLE, 'admin');
  setLocalItem(STORAGE_KEYS.ACADEMIC_YEAR, '2026-2027');
  setLocalItem(STORAGE_KEYS.INSTITUTION_CONFIG, DEFAULT_INSTITUTION_CONFIG);
  setLocalItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
  setLocalItem(STORAGE_KEYS.FEATURE_TOGGLES, DEFAULT_FEATURE_TOGGLES);
  setLocalItem(STORAGE_KEYS.PERMISSION_MATRIX, DEFAULT_PERMISSION_MATRIX);
  setLocalItem(STORAGE_KEYS.STUDENTS, []);
  setLocalItem(STORAGE_KEYS.PARENTS, []);
  setLocalItem(STORAGE_KEYS.CLASSES, []);
  setLocalItem(STORAGE_KEYS.BATCHES, []);
  setLocalItem(STORAGE_KEYS.SUBJECTS, []);
  setLocalItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);
  setLocalItem(STORAGE_KEYS.TIMETABLE, []);
  setLocalItem(STORAGE_KEYS.PENDING_FEES, []);
  setLocalItem(STORAGE_KEYS.EXPENSES, []);
  setLocalItem(STORAGE_KEYS.NOTIFICATIONS, []);
  setLocalItem(STORAGE_KEYS.ACTIVITIES, []);
  setLocalItem(STORAGE_KEYS.AUDIT_LOGS, [
    {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      actorName: 'Super Administrator',
      actorRole: 'superadmin',
      actorEmail: 'superadmin@apexschool.edu',
      action: 'Complete Database Clean Wipe Executed',
      module: 'SuperAdmin Database Manager',
      ipAddress: '127.0.0.1 (Local Client Storage)',
      status: 'Warning',
      details: 'All student, fee, class, and expense records wiped clean. System initialized with zero records in LocalStorage.'
    }
  ]);
}
