import type {
  AttendanceRow,
  BatchShift,
  ClassItem,
  ExpenseItem,
  Parent,
  PendingFeeItem,
  ResourceTable,
  Student,
  StudentDocument,
  SubjectItem,
  TeacherAssignment,
  TimetableEntry,
  FeeStructureItem,
  FeeReceipt,
  TimetablePeriodConfig,
  TimetablePeriodSlot,
  UserAccount,
  InstitutionConfig,
  SystemFeatureToggle,
  RolePermissionMatrix,
  AuditLogEntry,
  NotificationItem,
  ActivityItem,
  StudentHistoryEvent,
  UserRole,
} from '../types';
import type { AuthSession, AuthUser } from '../types/auth';
import type { ApiErrorBody, BackendRow, DashboardSummary, HealthResponse, SignInResponse } from '../types/api';
import {
  mapBackendAttendance,
  mapBackendBatch,
  mapBackendClass,
  mapBackendDocument,
  mapBackendExpense,
  mapBackendFee,
  mapBackendFeePayment,
  mapBackendFeeStructure,
  mapBackendParent,
  mapBackendStudent,
  mapBackendSubject,
  mapBackendTeacherAssignment,
  mapBackendTimetable,
  mapBackendTimetablePeriodConfig,
  mapBackendAccountSettings,
  mapBackendStaffUser,
  mapBackendAuditLog,
  mapBackendNotification,
  mapBackendActivity,
  mapBackendStudentHistoryEvent,
  toBackendStudentPayload,
} from './mappers';
import type { AccountSettingsRecord } from './mappers';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api';
const TOKEN_KEY = 'smartlearning_auth_token';
const USER_KEY = 'smartlearning_current_user';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Cannot reach backend. Make sure the API is running on port 3000.');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearAuthToken();
      try {
        window.dispatchEvent(new CustomEvent('cms:auth-expired'));
      } catch {
        // ignore
      }
      throw new Error('Session expired. Please sign in again.');
    }
    const err = data as ApiErrorBody;
    throw new Error(err.error || err.message || `Request failed (${res.status})`);
  }

  return data as T;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function mapAuthProfile(data: SignInResponse): AuthUser | null {
  if (data.profile) {
    return {
      id: data.profile.id,
      name: data.profile.name,
      email: data.profile.email,
      role: normalizeUserRole(data.profile.role),
      designation: data.profile.designation,
    };
  }

  if (data.user?.id) {
    return {
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email || 'Administrator',
      email: data.user.email || '',
      role: normalizeUserRole(data.user.user_metadata?.role || 'admin'),
      designation: data.user.user_metadata?.designation,
      phone: data.user.user_metadata?.phone,
    };
  }

  return null;
}

function normalizeUserRole(value: unknown): UserRole {
  if (typeof value !== 'string' || !value.trim()) return 'admin';

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const aliases: Record<string, UserRole> = {
    super_admin: 'superadmin',
    school_admin: 'admin',
    administrator: 'admin',
  };
  const resolved = aliases[normalized] || normalized;
  const roles: UserRole[] = [
    'superadmin',
    'admin',
    'principal',
    'accountant',
    'teacher',
    'parent',
    'student',
  ];

  // Unknown backend roles must not silently receive administrator privileges.
  return roles.includes(resolved as UserRole) ? (resolved as UserRole) : 'teacher';
}

async function listResource<T>(
  table: ResourceTable,
  mapper: (row: BackendRow) => T,
): Promise<T[]> {
  const rows = await request<BackendRow[]>(`/${table}`);
  return Array.isArray(rows) ? rows.map(mapper) : [];
}

async function createResource<T>(
  table: ResourceTable,
  payload: BackendRow,
  mapper: (row: BackendRow) => T,
): Promise<T> {
  const row = await request<BackendRow>(`/${table}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapper(row);
}

async function updateResource<T>(
  table: ResourceTable,
  id: string,
  payload: BackendRow,
  mapper: (row: BackendRow) => T,
): Promise<T> {
  const row = await request<BackendRow>(`/${table}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return mapper(row);
}

async function deleteResource(table: ResourceTable, id: string): Promise<void> {
  await request(`/${table}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export const backendClient = {
  async getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  async signin(credentials: { email: string; password: string }): Promise<AuthSession & SignInResponse> {
    const data = await request<SignInResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const token = data.session?.access_token || data.access_token;
    if (!token) {
      throw new Error('Sign-in succeeded but no access token was returned.');
    }
    setAuthToken(token);

    let profile = mapAuthProfile(data);
    try {
      const me = await this.getMe();
      if (me) profile = me;
    } catch {
      // keep mapped profile if /me fails
    }

    if (profile) {
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }
    return { ...data, access_token: token, profile: profile ?? undefined };
  },

  async signout(): Promise<void> {
    try {
      await request('/auth/signout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    clearAuthToken();
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const data = await request<{ user?: BackendRow; profile?: BackendRow }>('/auth/me');
      const profile = data.profile;
      const user = data.user;
      if (!profile && !user) return null;

      const id = String(profile?.id ?? user?.id ?? '');
      if (!id) return null;

      return {
        id,
        name: String(profile?.name ?? user?.email ?? 'Administrator'),
        email: String(profile?.email ?? user?.email ?? ''),
        role: normalizeUserRole(profile?.role),
        designation: typeof profile?.designation === 'string' ? profile.designation : undefined,
        phone: typeof profile?.phone === 'string' ? profile.phone : undefined,
      };
    } catch {
      return null;
    }
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>('/dashboard/summary');
  },

  async getStudents(): Promise<Student[]> {
    const rows = await request<BackendRow[]>('/students');
    return Array.isArray(rows) ? rows.map(mapBackendStudent) : [];
  },

  async createStudent(student: Omit<Student, 'id'> | Partial<Student>): Promise<Student> {
    const row = await request<BackendRow>('/students', {
      method: 'POST',
      body: JSON.stringify(toBackendStudentPayload(student)),
    });
    return mapBackendStudent(row);
  },

  async updateStudent(id: string, updated: Partial<Student>): Promise<Student> {
    const row = await request<BackendRow>(`/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(toBackendStudentPayload(updated)),
    });
    return mapBackendStudent(row);
  },

  async deleteStudent(id: string): Promise<void> {
    await request(`/students/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getTeachers(): Promise<BackendRow[]> {
    return request<BackendRow[]>('/teachers');
  },

  getParents(): Promise<Parent[]> {
    return listResource('parents', mapBackendParent);
  },

  createParent(payload: BackendRow): Promise<Parent> {
    return createResource('parents', payload, mapBackendParent);
  },

  getClasses(): Promise<ClassItem[]> {
    return listResource('classes', mapBackendClass);
  },

  createClass(payload: BackendRow): Promise<ClassItem> {
    return createResource('classes', payload, mapBackendClass);
  },

  getExpenses(): Promise<ExpenseItem[]> {
    return listResource('expenses', mapBackendExpense);
  },

  createExpense(payload: BackendRow): Promise<ExpenseItem> {
    return createResource('expenses', payload, mapBackendExpense);
  },

  getBatches(): Promise<BatchShift[]> {
    return listResource('batches', mapBackendBatch);
  },

  createBatch(payload: BackendRow): Promise<BatchShift> {
    return createResource('batches', payload, mapBackendBatch);
  },

  deleteBatch(id: string): Promise<void> {
    return deleteResource('batches', id);
  },

  getSubjects(): Promise<SubjectItem[]> {
    return listResource('subjects', mapBackendSubject);
  },

  createSubject(payload: BackendRow): Promise<SubjectItem> {
    return createResource('subjects', payload, mapBackendSubject);
  },

  deleteSubject(id: string): Promise<void> {
    return deleteResource('subjects', id);
  },

  getTeacherAssignments(): Promise<TeacherAssignment[]> {
    return listResource('teacher_assignments', mapBackendTeacherAssignment);
  },

  createTeacherAssignment(payload: BackendRow): Promise<TeacherAssignment> {
    return createResource('teacher_assignments', payload, mapBackendTeacherAssignment);
  },

  updateTeacherAssignment(id: string, payload: BackendRow): Promise<TeacherAssignment> {
    return updateResource('teacher_assignments', id, payload, mapBackendTeacherAssignment);
  },

  deleteTeacherAssignment(id: string): Promise<void> {
    return deleteResource('teacher_assignments', id);
  },

  async getTimetable(classes: ClassItem[] = [], subjects: SubjectItem[] = []): Promise<TimetableEntry[]> {
    const rows = await request<BackendRow[]>('/timetable');
    return Array.isArray(rows) ? rows.map((row) => mapBackendTimetable(row, classes, subjects)) : [];
  },

  async createTimetableEntry(
    payload: BackendRow,
    classes: ClassItem[] = [],
    subjects: SubjectItem[] = [],
  ): Promise<TimetableEntry> {
    const row = await request<BackendRow>('/timetable', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendTimetable(row, classes, subjects);
  },

  async updateTimetableEntry(
    id: string,
    payload: BackendRow,
    classes: ClassItem[] = [],
    subjects: SubjectItem[] = [],
  ): Promise<TimetableEntry> {
    const row = await request<BackendRow>(`/timetable/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendTimetable(row, classes, subjects);
  },

  deleteTimetableEntry(id: string): Promise<void> {
    return deleteResource('timetable', id);
  },

  getTimetablePeriodConfigs(): Promise<TimetablePeriodConfig[]> {
    return listResource('timetable_periods', mapBackendTimetablePeriodConfig);
  },

  createTimetablePeriodConfig(payload: {
    class_name: string;
    class_id?: string;
    periods: TimetablePeriodSlot[];
  }): Promise<TimetablePeriodConfig> {
    return createResource('timetable_periods', payload, mapBackendTimetablePeriodConfig);
  },

  updateTimetablePeriodConfig(
    id: string,
    payload: {
      class_name?: string;
      class_id?: string;
      periods: TimetablePeriodSlot[];
    },
  ): Promise<TimetablePeriodConfig> {
    return updateResource('timetable_periods', id, payload, mapBackendTimetablePeriodConfig);
  },

  getAccountSettings(): Promise<AccountSettingsRecord[]> {
    return listResource('account_settings', mapBackendAccountSettings);
  },

  createAccountSettings(payload: BackendRow): Promise<AccountSettingsRecord> {
    return createResource('account_settings', payload, mapBackendAccountSettings);
  },

  updateAccountSettings(id: string, payload: BackendRow): Promise<AccountSettingsRecord> {
    return updateResource('account_settings', id, payload, mapBackendAccountSettings);
  },

  getStaffUsers(): Promise<UserAccount[]> {
    return listResource('staff_users', mapBackendStaffUser);
  },

  createStaffUser(payload: BackendRow): Promise<UserAccount> {
    return createResource('staff_users', payload, mapBackendStaffUser);
  },

  updateStaffUser(id: string, payload: BackendRow): Promise<UserAccount> {
    return updateResource('staff_users', id, payload, mapBackendStaffUser);
  },

  deleteStaffUser(id: string): Promise<void> {
    return deleteResource('staff_users', id);
  },

  async inviteStaff(details: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    role?: string;
    designation?: string;
    department?: string;
    assigned_branch?: string;
  }): Promise<{ staff?: UserAccount; temporaryPassword?: string }> {
    const data = await request<{ staff?: BackendRow; temporaryPassword?: string }>('/auth/invite', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    return {
      staff: data.staff ? mapBackendStaffUser(data.staff) : undefined,
      temporaryPassword: data.temporaryPassword,
    };
  },

  async resetStaffPassword(email: string): Promise<{ ok: true; recoveryLink?: string | null }> {
    return request<{ ok: true; recoveryLink?: string | null }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  getAuditLogs(): Promise<AuditLogEntry[]> {
    return listResource('audit_logs', mapBackendAuditLog);
  },

  createAuditLog(payload: BackendRow): Promise<AuditLogEntry> {
    return createResource('audit_logs', payload, mapBackendAuditLog);
  },

  getNotifications(): Promise<NotificationItem[]> {
    return listResource('notifications', mapBackendNotification);
  },

  createNotification(payload: BackendRow): Promise<NotificationItem> {
    return createResource('notifications', payload, mapBackendNotification);
  },

  updateNotification(id: string, payload: BackendRow): Promise<NotificationItem> {
    return updateResource('notifications', id, payload, mapBackendNotification);
  },

  getActivities(): Promise<ActivityItem[]> {
    return listResource('activities', mapBackendActivity);
  },

  createActivity(payload: BackendRow): Promise<ActivityItem> {
    return createResource('activities', payload, mapBackendActivity);
  },

  getStudentHistoryEvents(): Promise<StudentHistoryEvent[]> {
    return listResource('student_history_events', mapBackendStudentHistoryEvent);
  },

  createStudentHistoryEvent(payload: BackendRow): Promise<StudentHistoryEvent> {
    return createResource('student_history_events', payload, mapBackendStudentHistoryEvent);
  },

  getFees(): Promise<PendingFeeItem[]> {
    return listResource('fees', mapBackendFee);
  },

  getFeeStructures(): Promise<FeeStructureItem[]> {
    return listResource('fee_structures', mapBackendFeeStructure);
  },

  createFeeStructure(payload: BackendRow): Promise<FeeStructureItem> {
    return createResource('fee_structures', payload, mapBackendFeeStructure);
  },

  deleteFeeStructure(id: string): Promise<void> {
    return deleteResource('fee_structures', id);
  },

  getFeePayments(): Promise<FeeReceipt[]> {
    return listResource('fee_payments', mapBackendFeePayment);
  },

  createFeePayment(payload: BackendRow): Promise<FeeReceipt> {
    return createResource('fee_payments', payload, mapBackendFeePayment);
  },

  getDocuments(): Promise<StudentDocument[]> {
    return listResource('documents', mapBackendDocument);
  },

  createDocument(payload: BackendRow): Promise<StudentDocument> {
    return createResource('documents', payload, mapBackendDocument);
  },

  updateDocument(id: string, payload: BackendRow): Promise<StudentDocument> {
    return updateResource('documents', id, payload, mapBackendDocument);
  },

  deleteDocument(id: string): Promise<void> {
    return deleteResource('documents', id);
  },

  getAttendance(): Promise<AttendanceRow[]> {
    return listResource('attendance', mapBackendAttendance);
  },

  createAttendance(payload: BackendRow): Promise<AttendanceRow> {
    return createResource('attendance', payload, mapBackendAttendance);
  },

  updateAttendance(id: string, payload: BackendRow): Promise<AttendanceRow> {
    return updateResource('attendance', id, payload, mapBackendAttendance);
  },

  deleteAttendance(id: string): Promise<void> {
    return deleteResource('attendance', id);
  },

  updateProfile(id: string, payload: BackendRow): Promise<AuthUser> {
    return updateResource('profiles', id, payload, (row) => ({
      id: String(row.id ?? id),
      name: String(row.name ?? ''),
      email: String(row.email ?? ''),
      role: normalizeUserRole(row.role),
      designation: typeof row.designation === 'string' ? row.designation : undefined,
      phone: typeof row.phone === 'string' ? row.phone : undefined,
    }));
  },
};
