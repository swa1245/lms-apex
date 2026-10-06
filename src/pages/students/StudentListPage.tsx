import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  KeyRound,
  Phone,
  Mail,
  UserCheck,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Button, EmptyState, Modal, PageHeader, Select } from '../../components/ui';
import { AddStudentModal } from '../../components/modals/AddStudentModal';

type StudentListPageProps = {
  openAddOnMount?: boolean;
};

export const StudentListPage: React.FC<StudentListPageProps> = ({ openAddOnMount = false }) => {
  const { students, setSelectedStudentId, setCurrentRoute, deleteStudent, showToast, grantStudentLogin } = useApp();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(openAddOnMount);
  const [loginStudent, setLoginStudent] = useState<Student | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShare, setLoginShare] = useState<{ email: string; temporaryPassword: string } | null>(null);

  useEffect(() => {
    if (openAddOnMount) setAddOpen(true);
  }, [openAddOnMount]);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.includes(search);
    const matchClass = classFilter === 'All' || s.className === classFilter;
    const matchStatus = statusFilter === 'All' || s.feeStatus === statusFilter;
    return matchSearch && matchClass && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Admission No', 'Name', 'Class', 'Section', 'Roll No', 'Parent Name', 'Parent Phone', 'Fee Status', 'Attendance Rate'];
    const rows = filtered.map(s => [s.admissionNo, s.name, s.className, s.section, s.rollNo, s.parentName, s.parentPhone, s.feeStatus, `${s.attendanceRate}%`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_List_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Complete', `Exported ${filtered.length} student records to CSV.`, 'info');
  };

  const openAdd = () => setAddOpen(true);
  const closeAdd = () => {
    setAddOpen(false);
    if (openAddOnMount) setCurrentRoute('students/student-list');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        description="Manage enrolled student records, attendance rates, and admission dossiers"
        actions={
          <>
            <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>
              Add Student
            </Button>
          </>
        }
      />

      <AddStudentModal open={addOpen} onClose={closeAdd} />

      <Modal
        open={Boolean(loginStudent)}
        onClose={() => setLoginStudent(null)}
        title="Student login"
        description={loginStudent ? `Portal access for ${loginStudent.name}` : ''}
        size="md"
        footer={
          loginShare ? (
            <Button type="button" onClick={() => setLoginStudent(null)}>Done</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => setLoginStudent(null)}>Cancel</Button>
              <Button type="submit" form="student-login-form">Save login</Button>
            </>
          )
        }
      >
        {loginShare ? (
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-slate-800">Share these details. The first sign-in asks the student to choose a new password.</p>
            <p className="rounded-xl bg-slate-50 p-3 font-mono text-xs">Email: {loginShare.email}<br />Password: {loginShare.temporaryPassword}</p>
          </div>
        ) : (
          <form
            id="student-login-form"
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!loginStudent) return;
              try {
                const creds = grantStudentLogin(loginStudent.id, loginEmail, loginPassword);
                setLoginShare(creds);
              } catch (error) {
                showToast('Login not created', error instanceof Error ? error.message : 'Could not create the login.', 'warning');
              }
            }}
          >
            <div>
              <label className="cms-label">Login email</label>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                placeholder="student@school.edu"
              />
            </div>
            <div>
              <label className="cms-label">Temporary password</label>
              <input
                required
                minLength={8}
                type="text"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                placeholder="At least 8 characters"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, adm no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Class:</span>
          </div>
          <Select
            value={classFilter}
            onChange={setClassFilter}
            size="sm"
            className="w-36"
            options={[
              { value: 'All', label: 'All Classes' },
              { value: 'Class 2', label: 'Class 2' },
              { value: 'Class 3', label: 'Class 3' },
              { value: 'Class 5', label: 'Class 5' },
              { value: 'Class 6', label: 'Class 6' },
              { value: 'Class 7', label: 'Class 7' },
              { value: 'Class 8', label: 'Class 8' },
              { value: 'Class 10', label: 'Class 10' },
              { value: 'Class 11', label: 'Class 11' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            size="sm"
            className="w-40"
            options={[
              { value: 'All', label: 'All Fee Statuses' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Partial', label: 'Partial' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
        </div>
      </div>

      {/* Student Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-3">Adm No / Roll</th>
                <th className="py-3.5 px-3">Class & Sec</th>
                <th className="py-3.5 px-3">Guardian</th>
                <th className="py-3.5 px-3">Attendance</th>
                <th className="py-3.5 px-3">Fee Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      icon={<GraduationCap className="w-7 h-7" />}
                      title="No student records found"
                      description="Register new students through the admission form."
                      action={
                        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>
                          Enroll Student Now
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                             onClick={() => {
                               setSelectedStudentId(student.id);
                               setCurrentRoute('students/student-profile');
                             }}>
                            {student.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{student.gender} • DOB: {student.dob}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      <div>{student.admissionNo}</div>
                      <div className="text-[10px] text-slate-400">Roll: {student.rollNo}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {student.className} - {student.section}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parentName}</p>
                      <p className="text-[11px] text-slate-400">{student.parentPhone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${student.attendanceRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{student.attendanceRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                        student.feeStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : student.feeStatus === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setCurrentRoute('students/student-profile');
                          }}
                          className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setLoginStudent(student);
                            setLoginEmail(student.loginEmail || '');
                            setLoginPassword('');
                            setLoginShare(null);
                          }}
                          className="p-1.5 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                          title="Student login"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Archive record for ${student.name}?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Archive Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
