import type {
  AttendanceRow,
  BatchShift,
  ClassItem,
  ExpenseItem,
  Parent,
  PendingFeeItem,
  Student,
  StudentDocument,
  SubjectItem,
  TeacherAssignment,
  TimetableEntry,
  TimetablePeriodConfig,
  TimetablePeriodSlot,
  FeeStructureItem,
  FeeReceipt,
  InstitutionConfig,
  SystemFeatureToggle,
  RolePermissionMatrix,
  UserAccount,
  UserRole,
  AuditLogEntry,
  NotificationItem,
  ActivityItem,
  StudentHistoryEvent,
} from '../types';
import type { BackendRow } from '../types/api';
import { todayIsoDate } from '../utils/date';

function readString(row: BackendRow, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return '';
}

function readNumber(row: BackendRow, ...keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return 0;
}

function readStringArray(row: BackendRow, key: string): string[] {
  const value = row[key];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

export function mapBackendStudent(row: BackendRow): Student {
  const statusRaw = readString(row, 'status').toLowerCase();
  const feeStatusRaw = readString(row, 'feeStatus', 'fee_status').toLowerCase();
  const genderRaw = readString(row, 'gender');

  return {
    id: readString(row, 'id') || readString(row, 'student_id'),
    admissionNo: readString(row, 'student_id', 'id'),
    name: readString(row, 'name'),
    batchId: readString(row, 'batch_id', 'batchId') || undefined,
    batchName: readString(row, 'batch_name', 'batchName') || undefined,
    gender: genderRaw === 'Female' || genderRaw === 'Other' ? genderRaw : 'Male',
    dob: readString(row, 'dob'),
    className: readString(row, 'class_name', 'className'),
    section: readString(row, 'section'),
    rollNo: readString(row, 'roll_no', 'rollNo'),
    parentName: readString(row, 'parent_name', 'parentName'),
    parentPhone: readString(row, 'parent_phone', 'parentPhone'),
    parentEmail: readString(row, 'parent_email', 'parentEmail', 'email'),
    address: readString(row, 'address'),
    avatar: readString(row, 'profile_photo_url', 'avatar'),
    status: statusRaw === 'inactive' ? 'Inactive' : statusRaw === 'suspended' ? 'Suspended' : 'Active',
    admissionDate: readString(row, 'created_at', 'admissionDate').slice(0, 10) || todayIsoDate(),
    bloodGroup: readString(row, 'blood_group', 'bloodGroup'),
    emergencyContact: readString(row, 'emergency_contact', 'emergencyContact'),
    feeStatus: feeStatusRaw === 'paid' ? 'Paid' : feeStatusRaw === 'partial' ? 'Partial' : 'Pending',
    totalFee: readNumber(row, 'totalFee', 'total_fee'),
    paidFee: readNumber(row, 'paidFee', 'paid_fee'),
    attendanceRate: readNumber(row, 'attendanceRate', 'attendance_rate') || 100,
  };
}

export function toBackendStudentPayload(student: Partial<Student> & { name?: string }): BackendRow {
  return {
    student_id: student.admissionNo || undefined,
    name: student.name,
    email: student.parentEmail || undefined,
    roll_no: student.rollNo || undefined,
    gender: student.gender || undefined,
    address: student.address || undefined,
    profile_photo_url: student.avatar || undefined,
    status: student.status ? student.status.toLowerCase() : undefined,
    total_fee: student.totalFee,
    paid_fee: student.paidFee,
    fee_status: student.feeStatus ? student.feeStatus.toLowerCase() : undefined,
  };
}

export function mapBackendParent(row: BackendRow): Parent {
  return {
    id: readString(row, 'id'),
    name: readString(row, 'name'),
    email: readString(row, 'email'),
    phone: readString(row, 'phone'),
    occupation: readString(row, 'occupation'),
    address: readString(row, 'address'),
    children: [],
    totalPaid: readNumber(row, 'total_paid', 'totalPaid'),
    pendingDue: readNumber(row, 'pending_due', 'pendingDue'),
  };
}

export function mapBackendClass(row: BackendRow): ClassItem {
  const sections = readStringArray(row, 'sections');
  return {
    id: readString(row, 'id'),
    name: readString(row, 'name'),
    grade: readString(row, 'grade'),
    sections: sections.length > 0 ? sections : ['A'],
    totalStudents: readNumber(row, 'total_students', 'totalStudents'),
    capacity: readNumber(row, 'capacity') || 40,
    classTeacher: readString(row, 'class_teacher', 'classTeacher'),
    roomNo: readString(row, 'room_no', 'roomNo'),
  };
}

export function mapBackendExpense(row: BackendRow): ExpenseItem {
  const paymentMode = readString(row, 'payment_mode', 'paymentMode');
  const normalizedMode =
    paymentMode === 'Cash' || paymentMode === 'Cheque' || paymentMode === 'UPI'
      ? paymentMode
      : 'Bank Transfer';

  const statusRaw = readString(row, 'status').toLowerCase();
  const paidTo = readString(row, 'paid_to', 'paidTo', 'vendor');

  return {
    id: readString(row, 'id'),
    title: readString(row, 'title'),
    category: readString(row, 'category') || 'General',
    amount: readNumber(row, 'amount'),
    date: readString(row, 'date') || todayIsoDate(),
    paidTo,
    vendor: readString(row, 'vendor') || paidTo,
    paymentMode: normalizedMode,
    receiptNo: readString(row, 'receipt_no', 'receiptNo') || `EXP-${readString(row, 'id')}`,
    status: statusRaw === 'pending' ? 'Pending' : 'Paid',
  };
}

export function mapBackendBatch(row: BackendRow): BatchShift {
  const statusRaw = readString(row, 'status').toLowerCase();
  return {
    id: readString(row, 'id'),
    name: readString(row, 'batch_name', 'name'),
    timing: readString(row, 'timing'),
    grades: readString(row, 'grades'),
    studentsCount: readNumber(row, 'students_count', 'studentsCount'),
    coordinator: readString(row, 'coordinator'),
    status: statusRaw === 'inactive' ? 'Inactive' : 'Active',
  };
}

export function mapBackendSubject(row: BackendRow): SubjectItem {
  return {
    id: readString(row, 'id'),
    code: readString(row, 'code'),
    name: readString(row, 'name'),
    dept: readString(row, 'dept') || 'General',
    classes: readString(row, 'classes') || readString(row, 'class_id'),
    periodsPerWeek: readNumber(row, 'periods_per_week', 'periodsPerWeek') || 5,
    leadTeacher: readString(row, 'lead_teacher', 'leadTeacher'),
  };
}

export function mapBackendTeacherAssignment(row: BackendRow): TeacherAssignment {
  const statusRaw = readString(row, 'status');
  return {
    id: readString(row, 'id'),
    teacher: readString(row, 'teacher'),
    role: readString(row, 'role') || 'Subject Teacher',
    assignedClass: readString(row, 'assigned_class', 'assignedClass'),
    subject: readString(row, 'subject'),
    weeklyLoad: readString(row, 'weekly_load', 'weeklyLoad') || 'Standard',
    status: statusRaw === 'High Load' || statusRaw === 'Available' ? statusRaw : 'Optimal',
  };
}

export function mapBackendAttendance(row: BackendRow): AttendanceRow {
  const statusRaw = readString(row, 'status').toLowerCase();
  const status =
    statusRaw === 'absent'
      ? 'Absent'
      : statusRaw === 'leave'
        ? 'Leave'
        : statusRaw === 'half day' || statusRaw === 'half_day'
          ? 'Half Day'
          : 'Present';

  return {
    id: readString(row, 'id'),
    studentId: readString(row, 'student_id', 'studentId'),
    classId: readString(row, 'class_id', 'classId') || undefined,
    batchId: readString(row, 'batch_id', 'batchId') || undefined,
    attendanceDate: readString(row, 'attendance_date', 'attendanceDate'),
    status,
    remarks: readString(row, 'remarks') || undefined,
  };
}

export function mapBackendTimetable(
  row: BackendRow,
  classes: ClassItem[] = [],
  subjects: SubjectItem[] = [],
): TimetableEntry {
  const classId = readString(row, 'class_id');
  const subjectId = readString(row, 'subject_id');

  return {
    id: readString(row, 'id'),
    className:
      readString(row, 'class_name', 'className') ||
      classes.find((item) => item.id === classId)?.name ||
      classId,
    day: readString(row, 'day_of_week', 'day'),
    periodIndex: readNumber(row, 'period_index', 'periodIndex'),
    subject:
      readString(row, 'subject') ||
      subjects.find((item) => item.id === subjectId)?.name ||
      subjectId,
  };
}

export function mapBackendDocument(row: BackendRow): StudentDocument {
  return {
    id: readString(row, 'id'),
    studentId: readString(row, 'student_id', 'studentId'),
    studentName: readString(row, 'student_name', 'studentName') || 'Student',
    title: readString(row, 'title'),
    docType: readString(row, 'doc_type', 'docType') || 'Identity',
    uploadDate: readString(row, 'upload_date', 'uploadDate') || todayIsoDate(),
    status: readString(row, 'status') || 'Pending Review',
    size: readString(row, 'size') || '1.0 MB',
    url: readString(row, 'url') || undefined,
  };
}

export function mapBackendFee(row: BackendRow): PendingFeeItem {
  const statusRaw = readString(row, 'status');
  const normalizedStatus =
    statusRaw === 'Overdue' ||
    statusRaw === '5 Days Left' ||
    statusRaw === '10 Days Left' ||
    statusRaw === 'Pending' ||
    statusRaw === 'Partial'
      ? statusRaw
      : 'Pending';

  return {
    id: readString(row, 'id'),
    studentName: readString(row, 'student_name', 'studentName'),
    studentId: readString(row, 'student_id', 'studentId'),
    className: readString(row, 'class_name', 'className'),
    totalDue: readNumber(row, 'total_due', 'totalDue'),
    dueDate: readString(row, 'due_date', 'dueDate') || todayIsoDate(),
    status: normalizedStatus,
    contact: readString(row, 'contact'),
  };
}

export function mapBackendFeeStructure(row: BackendRow): FeeStructureItem {
  const tuition = readNumber(row, 'tuition');
  const lab = readNumber(row, 'lab');
  const sports = readNumber(row, 'sports');
  const library = readNumber(row, 'library');
  const exam = readNumber(row, 'exam');
  const total = readNumber(row, 'total') || tuition + lab + sports + library + exam;

  return {
    id: readString(row, 'id'),
    grade: readString(row, 'grade'),
    tuition,
    lab,
    sports,
    library,
    exam,
    total,
    academicYear: readString(row, 'academic_year', 'academicYear'),
  };
}

export function mapBackendFeePayment(row: BackendRow): FeeReceipt {
  return {
    id: readString(row, 'id'),
    receiptNo: readString(row, 'receipt_no', 'receiptNo') || `RCP-${readString(row, 'id').slice(0, 8)}`,
    studentId: readString(row, 'student_id', 'studentId'),
    studentName: readString(row, 'student_name', 'studentName'),
    className: readString(row, 'class_name', 'className'),
    amount: readNumber(row, 'amount'),
    mode: readString(row, 'mode') || 'Cash',
    date: readString(row, 'date') || todayIsoDate(),
    status: readString(row, 'status') || 'Success',
  };
}

function normalizePeriodSlot(raw: unknown, index: number): TimetablePeriodSlot | null {
  if (!raw || typeof raw !== 'object') return null;
  const slot = raw as Record<string, unknown>;
  const kind = slot.kind === 'break' ? 'break' : 'teaching';
  const short =
    (typeof slot.short === 'string' && slot.short.trim()) ||
    (kind === 'break' ? 'Break' : `P${index + 1}`);
  const name =
    (typeof slot.name === 'string' && slot.name.trim()) ||
    short ||
    `Period ${index + 1}`;
  const startTime =
    (typeof slot.startTime === 'string' && slot.startTime) ||
    (typeof slot.start_time === 'string' && slot.start_time) ||
    '08:00';
  const endTime =
    (typeof slot.endTime === 'string' && slot.endTime) ||
    (typeof slot.end_time === 'string' && slot.end_time) ||
    '08:45';

  return {
    id: typeof slot.id === 'string' && slot.id ? slot.id : `slot-${index}`,
    short,
    name,
    startTime,
    endTime,
    kind,
  };
}

export function mapBackendTimetablePeriodConfig(row: BackendRow): TimetablePeriodConfig {
  const rawPeriods = row.periods;
  const list = Array.isArray(rawPeriods)
    ? rawPeriods
    : typeof rawPeriods === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(rawPeriods);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  return {
    id: readString(row, 'id'),
    className: readString(row, 'class_name', 'className'),
    classId: readString(row, 'class_id', 'classId') || undefined,
    periods: list
      .map((slot, index) => normalizePeriodSlot(slot, index))
      .filter((slot): slot is TimetablePeriodSlot => Boolean(slot)),
  };
}

export type AccountSettingsRecord = {
  id: string;
  academicYear: string;
  institution: InstitutionConfig | null;
  featureToggles: SystemFeatureToggle[];
  permissionMatrix: RolePermissionMatrix[];
  maintenanceMode: boolean;
};

export function mapBackendAccountSettings(row: BackendRow): AccountSettingsRecord {
  const institutionRaw = row.institution;
  const togglesRaw = row.feature_toggles;
  const matrixRaw = row.permission_matrix;

  return {
    id: readString(row, 'id'),
    academicYear: readString(row, 'academic_year', 'academicYear'),
    institution:
      institutionRaw && typeof institutionRaw === 'object'
        ? (institutionRaw as InstitutionConfig)
        : null,
    featureToggles: Array.isArray(togglesRaw) ? (togglesRaw as SystemFeatureToggle[]) : [],
    permissionMatrix: Array.isArray(matrixRaw) ? (matrixRaw as RolePermissionMatrix[]) : [],
    maintenanceMode: Boolean(row.maintenance_mode ?? row.maintenanceMode),
  };
}

export function mapBackendStaffUser(row: BackendRow): UserAccount {
  const role = (readString(row, 'role') || 'teacher') as UserRole;
  const statusRaw = readString(row, 'status') || 'Active';
  const status =
    statusRaw === 'Suspended' || statusRaw === 'Pending' || statusRaw === 'Active'
      ? statusRaw
      : 'Active';

  return {
    id: readString(row, 'id'),
    name: readString(row, 'name'),
    email: readString(row, 'email'),
    role,
    phone: readString(row, 'phone') || undefined,
    status,
    department: readString(row, 'department') || undefined,
    assignedBranch: readString(row, 'assigned_branch', 'assignedBranch') || undefined,
    avatar: readString(row, 'avatar') || undefined,
    lastLogin: readString(row, 'last_login', 'lastLogin') || undefined,
    createdAt: readString(row, 'created_at', 'createdAt').slice(0, 10) || todayIsoDate(),
    permissions: Array.isArray(row.permissions) ? (row.permissions as string[]) : undefined,
  };
}

export function mapBackendAuditLog(row: BackendRow): AuditLogEntry {
  const statusRaw = readString(row, 'status') || 'Success';
  const status =
    statusRaw === 'Warning' ||
    statusRaw === 'Failed' ||
    statusRaw === 'Critical' ||
    statusRaw === 'Success'
      ? statusRaw
      : 'Success';

  return {
    id: readString(row, 'id'),
    timestamp: readString(row, 'logged_at', 'timestamp', 'created_at') || new Date().toISOString(),
    actorName: readString(row, 'actor_name', 'actorName') || 'System',
    actorRole: (readString(row, 'actor_role', 'actorRole') || 'admin') as UserRole,
    actorEmail: readString(row, 'actor_email', 'actorEmail'),
    action: readString(row, 'action'),
    module: readString(row, 'module'),
    ipAddress: readString(row, 'ip_address', 'ipAddress') || 'local',
    status,
    details: readString(row, 'details'),
  };
}

export function mapBackendNotification(row: BackendRow): NotificationItem {
  const typeRaw = readString(row, 'type') || 'general';
  const type =
    typeRaw === 'event' ||
    typeRaw === 'fee' ||
    typeRaw === 'admission' ||
    typeRaw === 'meeting' ||
    typeRaw === 'exam' ||
    typeRaw === 'general'
      ? typeRaw
      : 'general';

  return {
    id: readString(row, 'id'),
    title: readString(row, 'title'),
    timestamp: readString(row, 'event_timestamp', 'timestamp') || 'Just now',
    type,
    read: Boolean(row.is_read ?? row.read),
  };
}

export function mapBackendActivity(row: BackendRow): ActivityItem {
  const typeRaw = readString(row, 'type') || 'fee';
  const type =
    typeRaw === 'fee' ||
    typeRaw === 'marks' ||
    typeRaw === 'attendance' ||
    typeRaw === 'announcement' ||
    typeRaw === 'receipt'
      ? typeRaw
      : 'fee';

  return {
    id: readString(row, 'id'),
    description: readString(row, 'description'),
    timestamp: readString(row, 'event_timestamp', 'timestamp') || 'Just now',
    type,
  };
}

export function mapBackendStudentHistoryEvent(row: BackendRow): StudentHistoryEvent {
  return {
    id: readString(row, 'id'),
    studentId: readString(row, 'student_id', 'studentId'),
    date: readString(row, 'event_date', 'date') || todayIsoDate(),
    event: readString(row, 'event'),
    desc: readString(row, 'event_desc', 'desc', 'description'),
    type: readString(row, 'type') || 'academic',
  };
}
