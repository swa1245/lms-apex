import {
  Student,
  Parent,
  ClassItem,
  PendingFeeItem,
  NotificationItem,
  ActivityItem,
  FeeCollectionDataPoint,
  ExpenseItem,
  Announcement,
  Exam,
  ClassPeriod,
  Teacher,
  BatchShift,
  SubjectItem,
  TeacherAssignment,
  TimetableEntry
} from '../types';

// Zero Initial Stats for Clean Slate
export const INITIAL_STATS = {
  totalStudents: 0,
  totalParents: 0,
  totalClasses: 0,
  totalFeeCollection: 0,
  pendingFees: 0,
  todayAttendanceRate: 0,
  totalConcession: 0,
  collectionPercentage: 0
};

export const FEE_COLLECTION_DATA: FeeCollectionDataPoint[] = [];

export const STUDENT_STRENGTH_DATA: { name: string; value: number; color: string }[] = [];

export const ATTENDANCE_TODAY_DATA: { name: string; value: number; color: string }[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_PENDING_FEES: PendingFeeItem[] = [];

export const INITIAL_ACTIVITIES: ActivityItem[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_PARENTS: Parent[] = [];

export const INITIAL_CLASSES: ClassItem[] = [];

export const INITIAL_EXPENSES: ExpenseItem[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_EXAMS: Exam[] = [];

export const INITIAL_BATCHES: BatchShift[] = [];

export const INITIAL_SUBJECTS: SubjectItem[] = [];

export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [];

export const INITIAL_TIMETABLE: TimetableEntry[] = [];

export const INITIAL_PERIODS: ClassPeriod[] = [];

export const INITIAL_TEACHERS: Teacher[] = [];

export const RECENT_FEE_TRANSACTIONS: any[] = [];

// Clean starter dataset for fresh registrations
export const SAMPLE_DEMO_DATASET = {
  students: [],
  parents: [],
  classes: [],
  pendingFees: []
};

