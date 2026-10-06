import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  UserX,
  AlertTriangle,
  Search,
  Save,
  CheckCheck,
  TrendingUp,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Select } from '../../components/ui';

export const DailyAttendancePage: React.FC = () => {
  const { students, classes, showToast, addActivity, saveDailyAttendance } = useApp();
  const [selectedClass, setSelectedClass] = useState(() => classes[0]?.name || '');
  const [selectedSection, setSelectedSection] = useState(() => classes[0]?.sections[0] || 'A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  // Initial attendance state for class students
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent' | 'Leave' | 'Half Day'>>(() => {
    const init: Record<string, 'Present' | 'Absent' | 'Leave' | 'Half Day'> = {};
    students.forEach((s) => {
      init[s.id] = 'Present';
    });
    return init;
  });

  useEffect(() => {
    if (classes[0] && !classes.some((item) => item.name === selectedClass)) {
      setSelectedClass(classes[0].name);
      setSelectedSection(classes[0].sections[0] || 'A');
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    setRecords((prev) => {
      const next = { ...prev };
      students.forEach((student) => {
        if (!next[student.id]) next[student.id] = 'Present';
      });
      return next;
    });
  }, [students]);

  const selectedClassRecord = classes.find((item) => item.name === selectedClass);
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          (!selectedClass || student.className.trim().toLowerCase() === selectedClass.trim().toLowerCase()) &&
          (!selectedSection || !student.section || student.section === selectedSection),
      ),
    [selectedClass, selectedSection, students],
  );

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Leave' | 'Half Day') => {
    setRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    const updated: Record<string, 'Present' | 'Absent' | 'Leave' | 'Half Day'> = {};
    filteredStudents.forEach(s => {
      updated[s.id] = 'Present';
    });
    setRecords(updated);
    showToast('Attendance Updated', `Marked all students as Present for ${selectedClass}-${selectedSection}.`, 'info');
  };

  const handleSaveAttendance = async () => {
    if (filteredStudents.length === 0) {
      showToast('No Students', 'There are no students in the selected class and section.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const rows = filteredStudents.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        className: student.className,
        section: student.section,
        status: records[student.id] || 'Present',
      }));
      await saveDailyAttendance(rows, attendanceDate, selectedClassRecord?.id);
      const presentCount = rows.filter((row) => row.status === 'Present').length;
      addActivity({
        description: `Daily attendance marked for ${selectedClass}-${selectedSection} (${presentCount} present)`,
        timestamp: 'Just now',
        type: 'attendance'
      });
      showToast('Attendance Saved', `Attendance recorded for ${attendanceDate}. Present: ${presentCount}/${rows.length}`, 'success');
    } catch (err: unknown) {
      showToast(
        'Attendance Save Failed',
        err instanceof Error ? err.message : 'Could not save attendance.',
        'danger',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="cms-panel p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="cms-page-title">Daily Attendance Register</h2>
          <p className="text-xs text-slate-500">Record and verify daily classroom attendance by grade and section</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllPresent}
            className="px-3.5 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving…' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Class"
          value={selectedClass}
          onChange={(value) => {
            setSelectedClass(value);
            setSelectedSection(classes.find((item) => item.name === value)?.sections[0] || 'A');
          }}
          className="w-full"
          size="sm"
          options={classes.map((item) => ({ value: item.name, label: item.name }))}
        />

        <Select
          label="Section"
          value={selectedSection}
          onChange={setSelectedSection}
          className="w-full"
          size="sm"
          options={(selectedClassRecord?.sections || ['A']).map((section) => ({
            value: section,
            label: `Section ${section}`,
          }))}
        />

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
          />
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="cms-panel overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Roll</th>
              <th className="py-3.5 px-3">Student Name</th>
              <th className="py-3.5 px-3">Admission No</th>
              <th className="py-3.5 px-3">Status Indicator</th>
              <th className="py-3.5 px-4 text-right">Attendance Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map(student => {
              const currentStatus = records[student.id] || 'Present';
              return (
                <tr key={student.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">#{student.rollNo}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{student.admissionNo}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      currentStatus === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                      currentStatus === 'Absent' ? 'bg-rose-100 text-rose-700' :
                      currentStatus === 'Leave' ? 'bg-amber-100 text-amber-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {currentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/60 gap-1">
                      {(['Present', 'Absent', 'Leave', 'Half Day'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => handleStatusChange(student.id, mode)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            currentStatus === mode
                              ? mode === 'Present' ? 'bg-emerald-600 text-white shadow-xs' :
                                mode === 'Absent' ? 'bg-rose-600 text-white shadow-xs' :
                                mode === 'Leave' ? 'bg-amber-500 text-white shadow-xs' :
                                'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          {mode === 'Half Day' ? 'Half' : mode}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StudentAttendancePage: React.FC = () => {
  const { students, attendanceRecords } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(() => students[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0] || null;

  const monthRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (record) =>
          record.studentId === selectedStudent?.id &&
          record.attendanceDate.startsWith(selectedMonth),
      ),
    [attendanceRecords, selectedMonth, selectedStudent?.id],
  );
  const recordByDate = useMemo(
    () => new Map(monthRecords.map((record) => [record.attendanceDate.slice(0, 10), record.status])),
    [monthRecords],
  );
  const daysInMonth = useMemo(() => {
    const [year = new Date().getFullYear(), month = new Date().getMonth() + 1] = selectedMonth.split('-').map(Number);
    const count = new Date(year, month, 0).getDate();
    return Array.from({ length: count }, (_, index) => {
      const day = index + 1;
      const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      return {
        day,
        status: recordByDate.get(date),
        isSunday: new Date(year, month - 1, day).getDay() === 0,
      };
    });
  }, [recordByDate, selectedMonth]);
  const attendanceRate = useMemo(() => {
    if (monthRecords.length === 0) return 0;
    const earned = monthRecords.reduce(
      (sum, record) => sum + (record.status === 'Present' ? 1 : record.status === 'Half Day' ? 0.5 : 0),
      0,
    );
    return Math.round((earned / monthRecords.length) * 1000) / 10;
  }, [monthRecords]);
  const monthLabel = new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  if (!selectedStudent) {
    return (
      <div className="space-y-5">
        <div className="cms-panel p-5 sm:p-6">
          <h2 className="cms-page-title">Student Monthly Attendance Heatmap</h2>
          <p className="text-xs text-slate-500">Day-by-day attendance calendar and session participation rate</p>
        </div>
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <h3 className="text-sm font-bold text-slate-800">No Enrolled Students</h3>
          <p className="text-xs text-slate-500">Enrol students to track monthly attendance patterns and participation rates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="cms-panel p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="cms-page-title">Student Monthly Attendance Heatmap</h2>
          <p className="text-xs text-slate-500">Day-by-day attendance calendar and session participation rate</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Student</label>
          <Select
            value={selectedStudent.id}
            onChange={setSelectedStudentId}
            size="sm"
            className="w-52"
            options={students.map(s => ({
              value: s.id,
              label: `${s.name} (${s.className})`,
            }))}
          />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">{monthLabel} Attendance Log for {selectedStudent.name}</h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            {monthRecords.length > 0 ? `${attendanceRate}%` : 'No marked days'}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
          {daysInMonth.map(d => (
            <div
              key={d.day}
              className={`p-3 rounded-xl border text-xs font-bold ${
                !d.status && d.isSunday ? 'bg-slate-100 text-slate-400 border-slate-200' :
                !d.status ? 'bg-white text-slate-400 border-slate-200' :
                d.status === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                d.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                d.status === 'Half Day' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="text-sm block">{d.day}</span>
              <span className="text-[10px] block font-normal">{d.status || (d.isSunday ? 'Sunday' : 'Unmarked')}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-rose-500" /> Absent</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-500" /> Approved Leave</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-indigo-500" /> Half Day</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-slate-300" /> Weekend Holiday</span>
        </div>
      </div>
    </div>
  );
};

export const BatchAttendancePage: React.FC = () => {
  const { batches, students, attendanceRecords } = useApp();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const groups = useMemo(() => {
    const definitions =
      batches.length > 0
        ? batches.map((batch) => ({ id: batch.id, name: batch.name, grades: batch.grades }))
        : Array.from(new Set(students.map((student) => student.className).filter(Boolean))).map((className) => ({
            id: className,
            name: className,
            grades: className,
          }));

    return definitions.map((group) => {
      const members = students.filter((student) => {
        if (batches.length === 0) return student.className === group.name;
        if (student.batchId === group.id || student.batchName === group.name) return true;
        const grades = group.grades
          .split(',')
          .map((grade) => grade.trim().toLowerCase())
          .filter(Boolean);
        return grades.some(
          (grade) =>
            student.className.toLowerCase() === grade ||
            student.className.toLowerCase().includes(grade),
        );
      });
      const memberIds = new Set(members.map((student) => student.id));
      const records = attendanceRecords.filter(
        (record) =>
          record.attendanceDate.slice(0, 10) === selectedDate &&
          (record.batchId === group.id || memberIds.has(record.studentId)),
      );
      const present = records.filter((record) => record.status === 'Present').length;
      const halfDay = records.filter((record) => record.status === 'Half Day').length;
      const absent = records.filter((record) => record.status === 'Absent').length;
      const leave = records.filter((record) => record.status === 'Leave').length;
      const rate = records.length > 0 ? Math.round(((present + halfDay * 0.5) / records.length) * 1000) / 10 : 0;
      return { ...group, students: members.length, marked: records.length, present, absent, leave, halfDay, rate };
    });
  }, [attendanceRecords, batches, selectedDate, students]);

  return (
    <div className="space-y-5">
      <div className="cms-panel p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="cms-page-title">Batch & Shift-wise Attendance Summary</h2>
          <p className="text-xs text-slate-500">Comparative attendance performance across academic sessions</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
        />
      </div>

      {groups.length === 0 ? (
        <div className="cms-panel p-12 text-center text-xs text-slate-500">
          No batches, classes, or students are available for attendance reporting.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map(group => (
          <div key={group.id} className="cms-panel p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{group.name}</h3>
              <p className="text-[10px] text-slate-400">{group.marked} of {group.students} students marked</p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                <span className="text-[10px] block text-slate-500">Present</span>
                <span className="text-sm font-bold">{group.present}</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-800">
                <span className="text-[10px] block text-slate-500">Absent</span>
                <span className="text-sm font-bold">{group.absent}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                <span className="text-[10px] block text-slate-500">Leave</span>
                <span className="text-sm font-bold">{group.leave}</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-800">
                <span className="text-[10px] block text-slate-500">Rate</span>
                <span className="text-sm font-bold">{group.marked ? `${group.rate}%` : '—'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export const AttendanceReportsPage: React.FC = () => {
  const { students, attendanceRecords, showToast } = useApp();
  const cutoff = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() - 90);
    return value.toISOString().slice(0, 10);
  }, []);
  const lowAttendanceStudents = useMemo(
    () =>
      students
        .map((student) => {
          const records = attendanceRecords.filter(
            (record) => record.studentId === student.id && record.attendanceDate.slice(0, 10) >= cutoff,
          );
          if (records.length === 0) return null;
          const earned = records.reduce(
            (sum, record) => sum + (record.status === 'Present' ? 1 : record.status === 'Half Day' ? 0.5 : 0),
            0,
          );
          const rate = Math.round((earned / records.length) * 1000) / 10;
          return rate < 75 ? { student, rate, marked: records.length } : null;
        })
        .filter(Boolean) as Array<{ student: (typeof students)[number]; rate: number; marked: number }>,
    [attendanceRecords, cutoff, students],
  );

  const handleReminder = (emailOrPhone: string) => {
    showToast(
      'Not configured',
      `SMS/WhatsApp reminders are not enabled yet${emailOrPhone ? ` for ${emailOrPhone}` : ''}.`,
      'warning',
    );
  };

  return (
    <div className="space-y-5">
      <div className="cms-panel p-5 sm:p-6">
        <h2 className="cms-page-title">Attendance Analytics & Defaulter Reports</h2>
        <p className="text-xs text-slate-500">Automated alerts for students with attendance below 75% threshold</p>
      </div>

      <div className="cms-panel overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Attendance Defaulters List (&lt;75%)</span>
          </div>
        </div>

        {lowAttendanceStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No students with marked attendance below 75% in the last 90 days.
          </div>
        ) : (
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-3">Class</th>
              <th className="py-3.5 px-3">Attendance Rate</th>
              <th className="py-3.5 px-3">Parent Contact</th>
              <th className="py-3.5 px-4 text-right">Action Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lowAttendanceStudents.map(({ student, rate, marked }) => (
              <tr key={student.id} className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 font-bold text-slate-800">{student.name}</td>
                <td className="py-3.5 px-3">{student.className} {student.section}</td>
                <td className="py-3.5 px-3 font-extrabold text-rose-600">{rate}% <span className="font-normal text-slate-400">({marked} days)</span></td>
                <td className="py-3.5 px-3">{student.parentName || 'Parent'} ({student.parentPhone || 'No phone'})</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleReminder(student.parentPhone)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700"
                  >
                    Send Reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};
