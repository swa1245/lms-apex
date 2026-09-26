// Dashboard
export { Dashboard } from './Dashboard';

// Students
export {
  StudentListPage,
  AddStudentPage,
  StudentProfilePage,
  ParentDetailsPage,
  StudentDocumentsPage,
  StudentHistoryPage
} from './students';

// Parents
export {
  ParentsListPage,
  ParentProfilePage,
  ChildrenMappingPage,
  ParentPaymentHistoryPage
} from './parents';

// Classes
export {
  ClassListPage,
  BatchManagementPage,
  SubjectsPage,
  TeacherAssignmentPage,
  TimetablePage
} from './classes/ClassesPages';

// Fees
export {
  FeeStructurePage,
  StudentFeesPage,
  FeeCollectionPage,
  PendingFeesPage,
  PartialPaymentsPage,
  PaymentHistoryPage,
  ReceiptsPage
} from './fees/FeesPages';

// Attendance
export {
  DailyAttendancePage,
  StudentAttendancePage,
  BatchAttendancePage,
  AttendanceReportsPage
} from './attendance/AttendancePages';

// Expenses
export {
  ExpenseListPage,
  AddExpensePage,
  VendorPaymentsPage,
} from './expenses/ExpensesPages';

// Settings
export {
  ProfilePage,
  UserManagementPage,
  BackupRestorePage
} from './settings/SettingsPages';

// Legal (DPDP Act aligned)
export {
  PrivacyPolicyPage,
  TermsAndConditionsPage,
  LegalDocumentPage,
} from './legal/LegalPages';
