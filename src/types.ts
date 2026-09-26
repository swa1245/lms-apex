export type NavigationItem = {
  id: string;
  label: string;
  icon?: string;
};

export type NavigationSection = {
  id: string;
  label: string;
  icon: string;
  children?: NavigationItem[];
};

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  batchId?: string;
  batchName?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  className: string;
  section: string;
  rollNo: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  avatar: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  admissionDate: string;
  bloodGroup: string;
  emergencyContact: string;
  feeStatus: 'Paid' | 'Partial' | 'Pending';
  totalFee: number;
  paidFee: number;
  attendanceRate: number;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  address: string;
  children: {
    studentId: string;
    studentName: string;
    className: string;
    section: string;
  }[];
  totalPaid: number;
  pendingDue: number;
}

export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  sections: string[];
  totalStudents: number;
  capacity: number;
  classTeacher: string;
  roomNo: string;
}

export interface PendingFeeItem {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  totalDue: number;
  dueDate: string;
  status: 'Overdue' | '5 Days Left' | '10 Days Left' | 'Pending' | 'Partial';
  contact: string;
}

export interface FeeStructureItem {
  id: string;
  grade: string;
  tuition: number;
  lab: number;
  sports: number;
  library: number;
  exam: number;
  total: number;
  academicYear: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'event' | 'fee' | 'admission' | 'meeting' | 'exam' | 'general';
  read: boolean;
}

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  type: 'fee' | 'marks' | 'attendance' | 'announcement' | 'receipt';
}

export interface FeeCollectionDataPoint {
  date: string;
  amount: number;
  studentsCount: number;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  section: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  remarks?: string;
}

export interface AttendanceRow {
  id: string;
  studentId: string;
  classId?: string;
  batchId?: string;
  attendanceDate: string;
  status: AttendanceRecord['status'];
  remarks?: string;
}

export interface Exam {
  id: string;
  name: string;
  term: string;
  startDate: string;
  endDate: string;
  classes: string[];
  totalSubjects?: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface MarkEntry {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paidTo: string;
  vendor?: string;
  paymentMode: 'Bank Transfer' | 'Cash' | 'Cheque' | 'UPI';
  receiptNo: string;
  status: 'Paid' | 'Pending';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Teachers' | 'Parents' | 'Students';
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  author: string;
}

export interface ClassPeriod {
  id: string;
  periodNo: number;
  timeSlot: string;
  subject: string;
  className: string;
  section: string;
  roomNo: string;
  teacherName: string;
  teacherAvatar?: string;
  status: 'Ongoing' | 'Upcoming' | 'Completed';
  color: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  assignedClasses: string[];
  avatar: string;
  status: 'On Duty' | 'On Leave' | 'In Class';
}

export type UserRole = 'superadmin' | 'admin' | 'principal' | 'accountant' | 'teacher' | 'parent' | 'student';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin?: string;
  createdAt: string;
  permissions?: string[];
  department?: string;
  assignedBranch?: string;
}

export interface InstitutionConfig {
  schoolName: string;
  schoolCode: string;
  tagline: string;
  affiliationNo: string;
  board: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  website?: string;
  logoUrl?: string;
  academicYear: string;
  currency: string;
  currencySymbol: string;
  taxRegistrationNo?: string;
  timezone: string;
  branches: {
    id: string;
    name: string;
    code: string;
    city: string;
    principalName: string;
    isMain: boolean;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actorEmail: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Failed' | 'Critical';
  details: string;
}

export interface SystemFeatureToggle {
  id: string;
  name: string;
  category: 'Core' | 'Finance' | 'Communication' | 'Academic' | 'Security';
  description: string;
  enabled: boolean;
  requiresSuperAdmin: boolean;
}

export interface RolePermissionMatrix {
  role: UserRole;
  label: string;
  description: string;
  permissions: {
    module: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    isRestricted?: boolean;
  }[];
}

export interface BatchShift {
  id: string;
  name: string;
  timing: string;
  grades: string;
  studentsCount: number;
  coordinator: string;
  status: 'Active' | 'Inactive';
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  dept: string;
  classes: string;
  periodsPerWeek: number;
  leadTeacher: string;
}

export interface TeacherAssignment {
  id: string;
  teacher: string;
  role: string;
  assignedClass: string;
  subject: string;
  weeklyLoad: string;
  status: 'Optimal' | 'High Load' | 'Available';
}

export interface TimetableEntry {
  id: string;
  className: string;
  day: string;
  periodIndex: number;
  subject: string;
}

export interface TimetablePeriodSlot {
  id: string;
  short: string;
  name: string;
  startTime: string;
  endTime: string;
  kind: 'teaching' | 'break';
}

export interface TimetablePeriodConfig {
  id: string;
  className: string;
  classId?: string;
  periods: TimetablePeriodSlot[];
}

export type ToastType = 'success' | 'info' | 'warning' | 'danger';

export interface ToastMessage {
  title: string;
  desc: string;
  type: ToastType;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  docType: string;
  uploadDate: string;
  status: 'Pending Review' | 'Verified' | string;
  size: string;
  url?: string;
}

export interface FeeReceipt {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number;
  mode: string;
  date: string;
  status: string;
}

export interface StudentHistoryEvent {
  id?: string;
  studentId: string;
  date: string;
  event: string;
  desc: string;
  type: string;
}

export interface AppStats {
  totalStudents: number;
  totalParents: number;
  totalClasses: number;
  totalFeeCollection: number;
  pendingFees: number;
  todayAttendanceRate: number;
  totalConcession: number;
  collectionPercentage: number;
}

export type ResourceTable =
  | 'profiles'
  | 'parents'
  | 'classes'
  | 'batches'
  | 'subjects'
  | 'teacher_assignments'
  | 'timetable'
  | 'timetable_periods'
  | 'account_settings'
  | 'staff_users'
  | 'audit_logs'
  | 'notifications'
  | 'activities'
  | 'student_history_events'
  | 'attendance'
  | 'fees'
  | 'fee_structures'
  | 'fee_payments'
  | 'expenses'
  | 'documents';

