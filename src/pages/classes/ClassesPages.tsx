import React, { useEffect, useMemo, useState } from 'react';
import { School, Plus, BookOpen, Clock, UserCheck, Trash2, CalendarDays, Coffee, Pencil, Settings2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, EmptyState, Modal, PageHeader, Select } from '../../components/ui';
import type { TimetablePeriodSlot } from '../../types';

export const ClassListPage: React.FC = () => {
  const { classes, addClass } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newTeacher, setNewTeacher] = useState('');
  const [newRoom, setNewRoom] = useState('');

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClass({
      name: newClassName.trim(),
      grade: 'General',
      sections: ['A', 'B'],
      totalStudents: 0,
      capacity: 40,
      classTeacher: newTeacher.trim() || 'Assigned Faculty',
      roomNo: newRoom.trim() || 'Block B - 206'
    });
    setShowAddModal(false);
    setNewClassName('');
    setNewTeacher('');
    setNewRoom('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Sections Master"
        description="Live overview of classes, divisions, appointed class teachers, and room allocations"
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add New Class
          </Button>
        }
      />

      {classes.length === 0 ? (
        <EmptyState
          icon={<School className="w-7 h-7" />}
          title="No Classes Registered Yet"
          description="The database is clean with 0 records. Add your first academic class and assign sections."
          action={
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              Create First Class
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div key={cls.id} className="cms-panel p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">{cls.grade}</span>
                  <h3 className="text-base font-extrabold text-slate-800">{cls.name}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Class Teacher:</span>
                  <span className="font-bold text-slate-800">{cls.classTeacher}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Room / Hall:</span>
                  <span className="font-semibold text-slate-700">{cls.roomNo}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Active Sections:</span>
                  <div className="flex gap-1">
                    {cls.sections.map(sec => (
                      <span key={sec} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                        Sec {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Enrolled: </span>
                  <span className="font-bold text-slate-800">{cls.totalStudents} / {cls.capacity}</span>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {cls.capacity > 0 ? Math.round((cls.totalStudents / cls.capacity) * 100) : 0}% Occupancy
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="md"
        title="Add New Academic Class"
        description="Create a grade with teacher and room allocation"
        icon={<School className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-class-modal-form">
              Create Class
            </Button>
          </>
        }
      >
        <form id="add-class-modal-form" onSubmit={handleCreateClass} className="space-y-3 text-xs">
          <div>
            <label className="cms-label">Class / grade name</label>
            <input
              type="text"
              placeholder="e.g. Class 10 A"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="cms-label">Class teacher</label>
            <input
              type="text"
              placeholder="e.g. Dr. Harish Sen"
              value={newTeacher}
              onChange={(e) => setNewTeacher(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="cms-label">Room assignment</label>
            <input
              type="text"
              placeholder="e.g. Block E - 101"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const BatchManagementPage: React.FC = () => {
  const { batches, addBatch, deleteBatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [shiftName, setShiftName] = useState('');
  const [timing, setTiming] = useState('08:00 AM - 02:00 PM');
  const [grades, setGrades] = useState('Class 1 to 10');
  const [coordinator, setCoordinator] = useState('');
  const [studentsCount, setStudentsCount] = useState(0);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim()) return;
    await addBatch({
      name: shiftName.trim(),
      timing: timing.trim() || '08:00 AM - 02:00 PM',
      grades: grades.trim() || 'All Classes',
      coordinator: coordinator.trim() || 'Lead Faculty',
      studentsCount: Number(studentsCount) || 0,
      status: 'Active'
    });
    setShowAddModal(false);
    setShiftName('');
    setCoordinator('');
    setStudentsCount(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch & Shift Management"
        description="Configure academic shifts, batch coordinators, timing schedules, and student allotments"
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add Academic Shift
          </Button>
        }
      />

      {batches.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-7 h-7" />}
          title="No Academic Shifts Configured"
          description="Configure your real academic morning, day, or evening shifts."
          action={
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              Create Academic Shift
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {batches.map(b => (
            <div key={b.id} className="cms-panel p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{b.status}</span>
                  <h3 className="text-base font-bold text-slate-800 mt-1">{b.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => deleteBatch(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Shift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Clock className="w-5 h-5 text-slate-400 ml-1" />
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Shift Timings:</span>
                  <span className="font-bold text-slate-800">{b.timing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="font-semibold text-slate-700">{b.grades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinator:</span>
                  <span className="font-bold text-blue-600">{b.coordinator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Strength:</span>
                  <span className="font-extrabold text-slate-900">{b.studentsCount} Students</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="md"
        title="Add Academic Shift / Batch"
        description="Configure timing, grades, and shift coordinator"
        icon={<Clock className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-batch-modal-form">
              Save Shift
            </Button>
          </>
        }
      >
        <form id="add-batch-modal-form" onSubmit={handleCreateBatch} className="space-y-3 text-xs">
          <div>
            <label className="cms-label">Shift / batch name</label>
            <input
              type="text"
              placeholder="e.g. Morning Primary Shift"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="cms-label">Shift timings</label>
            <input
              type="text"
              placeholder="e.g. 08:00 AM - 01:30 PM"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="cms-label">Coverage / grades</label>
            <input
              type="text"
              placeholder="e.g. Nursery to Class 5"
              value={grades}
              onChange={(e) => setGrades(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="cms-label">Shift coordinator</label>
            <input
              type="text"
              placeholder="e.g. Mrs. Suman Rao"
              value={coordinator}
              onChange={(e) => setCoordinator(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="cms-label">Enrolled strength (optional)</label>
            <input
              type="number"
              placeholder="0"
              value={studentsCount || ''}
              onChange={(e) => setStudentsCount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const SubjectsPage: React.FC = () => {
  const { subjects, addSubject, deleteSubject } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState('General');
  const [classes, setClasses] = useState('Class 1 to 10');
  const [periods, setPeriods] = useState(5);
  const [leadTeacher, setLeadTeacher] = useState('');

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addSubject({
      code: code.trim() || `SUB-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      dept: dept.trim() || 'General',
      classes: classes.trim() || 'All Classes',
      periodsPerWeek: Number(periods) || 4,
      leadTeacher: leadTeacher.trim() || 'Faculty Head'
    });
    setShowAddModal(false);
    setCode('');
    setName('');
    setLeadTeacher('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Subjects Catalog"
        description="Curriculum subject codes, weekly period allocations, and department leads"
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add New Subject
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title="No Subjects Configured Yet"
          description="Add subjects to construct curriculum timetables."
          action={
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              Add First Subject
            </Button>
          }
        />
      ) : (
        <div className="cms-panel overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Subject Code & Name</th>
                <th className="py-3.5 px-3">Department</th>
                <th className="py-3.5 px-3">Class Applicability</th>
                <th className="py-3.5 px-3">Periods / Week</th>
                <th className="py-3.5 px-4">Department Head</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{s.code}</span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-600">{s.dept}</td>
                  <td className="py-3.5 px-3">{s.classes}</td>
                  <td className="py-3.5 px-3 font-bold text-blue-600">{s.periodsPerWeek} Periods</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{s.leadTeacher}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteSubject(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="md"
        title="Add Academic Subject"
        description="Register curriculum subject and lead teacher"
        icon={<BookOpen className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-subject-modal-form">
              Save Subject
            </Button>
          </>
        }
      >
        <form id="add-subject-modal-form" onSubmit={handleCreateSubject} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="cms-label">Subject name</label>
              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="cms-label">Subject code</label>
              <input
                type="text"
                placeholder="e.g. MTH-101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="cms-label">Department</label>
              <input
                type="text"
                placeholder="e.g. Science & Math"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="cms-label">Periods / week</label>
              <input
                type="number"
                value={periods}
                onChange={(e) => setPeriods(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="cms-label">Class applicability</label>
            <input
              type="text"
              placeholder="e.g. Class 1 to 10"
              value={classes}
              onChange={(e) => setClasses(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="cms-label">Lead teacher</label>
            <input
              type="text"
              placeholder="e.g. Mrs. Sunita Dixit"
              value={leadTeacher}
              onChange={(e) => setLeadTeacher(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const TeacherAssignmentPage: React.FC = () => {
  const { teacherAssignments, addTeacherAssignment, deleteTeacherAssignment } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [teacher, setTeacher] = useState('');
  const [role, setRole] = useState('Faculty');
  const [assignedClass, setAssignedClass] = useState('Class 5 A');
  const [subject, setSubject] = useState('');
  const [weeklyLoad, setWeeklyLoad] = useState('20 Periods');
  const [saving, setSaving] = useState(false);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher.trim()) return;
    setSaving(true);
    try {
      await addTeacherAssignment({
        teacher: teacher.trim(),
        role: role.trim() || 'Faculty',
        assignedClass: assignedClass.trim() || 'Class 1 A',
        subject: subject.trim() || 'General Studies',
        weeklyLoad: weeklyLoad.trim() || '20 Periods',
        status: 'Optimal'
      });
      setShowAddModal(false);
      setTeacher('');
      setSubject('');
    } catch {
      // Context displays the API error.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher & Class Assignments"
        description="Mapping subject educators to designated classrooms with workload balance indicators"
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Assign Teacher
          </Button>
        }
      />

      {teacherAssignments.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-7 h-7" />}
          title="No Teacher Assignments Found"
          description="Assign educators to classes and subjects to build workload allotments."
          action={
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              Create Assignment
            </Button>
          }
        />
      ) : (
        <div className="cms-panel overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Faculty Member</th>
                <th className="py-3.5 px-3">Designation</th>
                <th className="py-3.5 px-3">Class & Section</th>
                <th className="py-3.5 px-3">Subjects</th>
                <th className="py-3.5 px-3">Weekly Load</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherAssignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{a.teacher}</td>
                  <td className="py-3.5 px-3 text-slate-500">{a.role}</td>
                  <td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">{a.assignedClass}</span></td>
                  <td className="py-3.5 px-3 font-medium text-slate-700">{a.subject}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{a.weeklyLoad}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'High Load' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => void deleteTeacherAssignment(a.id).catch(() => undefined)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="cms-panel p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-800">Assign Teacher to Class</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher / Faculty Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Sunita Dixit"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Faculty"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Class</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 5 A"
                    value={assignedClass}
                    onChange={(e) => setAssignedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject(s)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weekly Load</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 Periods"
                    value={weeklyLoad}
                    onChange={(e) => setWeeklyLoad(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>Assign Faculty</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function subjectChipClass(subject: string) {
  const key = subject.toLowerCase();
  if (key.includes('math') || key.includes('algebra') || key.includes('arith')) {
    return 'bg-blue-50 text-blue-700 ring-blue-100';
  }
  if (key.includes('eng') || key.includes('lang') || key.includes('hindi')) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  }
  if (key.includes('sci') || key.includes('phys') || key.includes('chem') || key.includes('bio') || key.includes('lab')) {
    return 'bg-indigo-50 text-indigo-700 ring-indigo-100';
  }
  if (key.includes('hist') || key.includes('geo') || key.includes('civ') || key.includes('soc')) {
    return 'bg-amber-50 text-amber-800 ring-amber-100';
  }
  if (key.includes('art') || key.includes('music') || key.includes('sport') || key.includes('pe') || key.includes('yoga')) {
    return 'bg-rose-50 text-rose-700 ring-rose-100';
  }
  if (key.includes('comp') || key.includes('it') || key.includes('code')) {
    return 'bg-cyan-50 text-cyan-700 ring-cyan-100';
  }
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

const DEFAULT_PERIODS: TimetablePeriodSlot[] = [
  { id: 'p1', short: 'P1', name: 'Period 1', startTime: '08:00', endTime: '08:45', kind: 'teaching' },
  { id: 'p2', short: 'P2', name: 'Period 2', startTime: '08:45', endTime: '09:30', kind: 'teaching' },
  { id: 'p3', short: 'P3', name: 'Period 3', startTime: '09:30', endTime: '10:15', kind: 'teaching' },
  { id: 'break', short: 'Break', name: 'Recess', startTime: '10:15', endTime: '10:45', kind: 'break' },
  { id: 'p4', short: 'P4', name: 'Period 4', startTime: '10:45', endTime: '11:30', kind: 'teaching' },
  { id: 'p5', short: 'P5', name: 'Period 5', startTime: '11:30', endTime: '12:15', kind: 'teaching' },
  { id: 'p6', short: 'P6', name: 'Period 6', startTime: '12:15', endTime: '13:00', kind: 'teaching' },
];

function formatPeriodTime(start: string, end: string) {
  const pretty = (value: string) => {
    const [hRaw, mRaw] = value.split(':');
    const h = Number(hRaw);
    const m = mRaw || '00';
    if (!Number.isFinite(h)) return value;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${m} ${suffix}`;
  };
  return `${pretty(start)} – ${pretty(end)}`;
}

function resolvePeriodsForClass(
  className: string,
  configs: { className: string; periods: TimetablePeriodSlot[] }[],
): TimetablePeriodSlot[] {
  const saved = configs.find((row) => row.className === className)?.periods;
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map((slot, index) => ({
      id: slot.id || `slot-${index}`,
      short: slot.short || `P${index + 1}`,
      name: slot.name || slot.short || `Period ${index + 1}`,
      startTime: slot.startTime || '08:00',
      endTime: slot.endTime || '08:45',
      kind: slot.kind === 'break' ? 'break' : 'teaching',
    }));
  }
  return DEFAULT_PERIODS.map((slot) => ({ ...slot }));
}

export const TimetablePage: React.FC = () => {
  const { classes, addClass, timetable, updateTimetableCell, timetablePeriodConfigs, saveTimetablePeriods, showToast } = useApp();
  const [selectedClass, setSelectedClass] = useState(() => classes[0]?.name || '');
  const [periods, setPeriods] = useState<TimetablePeriodSlot[]>(() =>
    resolvePeriodsForClass(classes[0]?.name || '', []),
  );
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newTeacher, setNewTeacher] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [editingCell, setEditingCell] = useState<{ day: string; periodIndex: number; currentValue: string } | null>(null);
  const [cellSubjectInput, setCellSubjectInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [draftPeriods, setDraftPeriods] = useState<TimetablePeriodSlot[]>([]);
  const [savingPeriods, setSavingPeriods] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (classes.length === 0) {
      setSelectedClass('');
      return;
    }
    if (!classes.some((item) => item.name === selectedClass)) {
      setSelectedClass(classes[0].name);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    setPeriods(resolvePeriodsForClass(selectedClass, timetablePeriodConfigs));
  }, [selectedClass, timetablePeriodConfigs]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newClassName.trim();
    if (!name) return;
    if (classes.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      showToast('Class exists', `${name} is already in the timetable list.`, 'warning');
      return;
    }
    await addClass({
      name,
      grade: 'General',
      sections: ['A'],
      totalStudents: 0,
      capacity: 40,
      classTeacher: newTeacher.trim() || 'Assigned Faculty',
      roomNo: newRoom.trim() || 'Room TBD',
    });
    setSelectedClass(name);
    setShowAddClass(false);
    setNewClassName('');
    setNewTeacher('');
    setNewRoom('');
  };

  const getSubjectAt = (day: string, periodIndex: number) => {
    if (periods[periodIndex]?.kind === 'break') return 'BREAK';
    const match = timetable.find(
      (t) => t.className === selectedClass && t.day === day && t.periodIndex === periodIndex,
    );
    return match?.subject?.trim() ? match.subject : '';
  };

  const stats = useMemo(() => {
    const teachingIndexes = periods
      .map((period, index) => (period.kind === 'teaching' ? index : -1))
      .filter((index) => index >= 0);
    const teachingSlots = days.length * teachingIndexes.length;
    let filled = 0;
    for (const day of days) {
      for (const idx of teachingIndexes) {
        const match = timetable.find(
          (t) => t.className === selectedClass && t.day === day && t.periodIndex === idx,
        );
        if (match?.subject?.trim()) filled += 1;
      }
    }
    return {
      teachingSlots,
      filled,
      free: teachingSlots - filled,
      coverage: teachingSlots === 0 ? 0 : Math.round((filled / teachingSlots) * 100),
    };
  }, [selectedClass, timetable, periods]);

  const openCellEdit = (day: string, periodIndex: number) => {
    if (periods[periodIndex]?.kind === 'break') return;
    const current = getSubjectAt(day, periodIndex);
    setEditingCell({ day, periodIndex, currentValue: current });
    setCellSubjectInput(current);
  };

  const handleSaveCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;
    setSaving(true);
    try {
      await updateTimetableCell(selectedClass, editingCell.day, editingCell.periodIndex, cellSubjectInput.trim());
      setEditingCell(null);
    } finally {
      setSaving(false);
    }
  };

  const openPeriodsEditor = () => {
    setDraftPeriods(periods.map((slot) => ({ ...slot })));
    setPeriodsOpen(true);
  };

  const updateDraft = (index: number, patch: Partial<TimetablePeriodSlot>) => {
    setDraftPeriods((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addDraftPeriod = (kind: 'teaching' | 'break' = 'teaching') => {
    const teachingCount = draftPeriods.filter((slot) => slot.kind === 'teaching').length;
    setDraftPeriods((prev) => [
      ...prev,
      {
        id: `slot-${Date.now()}`,
        short: kind === 'break' ? 'Break' : `P${teachingCount + 1}`,
        name: kind === 'break' ? 'Recess' : `Period ${teachingCount + 1}`,
        startTime: prev[prev.length - 1]?.endTime || '13:00',
        endTime: '13:45',
        kind,
      },
    ]);
  };

  const removeDraftPeriod = (index: number) => {
    if (draftPeriods.length <= 1) {
      showToast('Keep one period', 'Timetable needs at least one column.', 'warning');
      return;
    }
    setDraftPeriods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePeriods = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: TimetablePeriodSlot[] = draftPeriods.map((slot, index) => ({
      id: slot.id || `slot-${index}`,
      short: slot.short.trim() || (slot.kind === 'break' ? 'Break' : `P${index + 1}`),
      name: slot.name.trim() || slot.short.trim() || `Period ${index + 1}`,
      startTime: slot.startTime || '08:00',
      endTime: slot.endTime || '08:45',
      kind: slot.kind === 'break' ? 'break' : 'teaching',
    }));
    setSavingPeriods(true);
    try {
      const classId = classes.find((c) => c.name === selectedClass)?.id;
      await saveTimetablePeriods(selectedClass, cleaned, classId);
      setPeriods(cleaned);
      setPeriodsOpen(false);
      showToast('Periods updated', `${selectedClass} timetable times saved in this browser.`, 'success');
    } catch {
      // toast handled in context
    } finally {
      setSavingPeriods(false);
    }
  };

  const selectedClassMeta = classes.find((c) => c.name === selectedClass);
  const periodLabel = (index: number) => periods[index]?.name || `Period ${index + 1}`;
  const field =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  return (
    <div className="cms-page space-y-5">
      <PageHeader
        eyebrow="Classes"
        title="Weekly Class Timetable"
        description="Plan the week by period — customize times per class, then click any slot to assign a subject"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddClass(true)}>
              Add Class
            </Button>
            <Button leftIcon={<Settings2 className="h-4 w-4" />} variant="secondary" onClick={openPeriodsEditor} disabled={!selectedClass}>
              Customize periods
            </Button>
            {classes.length > 0 ? (
              <Select
                value={selectedClass}
                onChange={setSelectedClass}
                size="sm"
                className="w-48"
                options={classes.map((c) => ({ value: c.name, label: c.name }))}
              />
            ) : null}
          </div>
        }
      />

      {classes.length === 0 ? (
        <EmptyState
          icon={<School className="w-7 h-7" />}
          title="No classes yet"
          description="Add a class first. It will appear in the timetable dropdown so you can set that class's weekly schedule."
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddClass(true)}>
              Add Class
            </Button>
          }
        />
      ) : (
      <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Active class',
            value: selectedClass,
            hint: selectedClassMeta?.classTeacher || 'Class schedule',
            icon: <School className="h-4 w-4" />,
            tone: 'from-blue-600 to-sky-500',
          },
          {
            label: 'Filled periods',
            value: String(stats.filled),
            hint: `of ${stats.teachingSlots} teaching slots`,
            icon: <BookOpen className="h-4 w-4" />,
            tone: 'from-emerald-600 to-teal-500',
          },
          {
            label: 'Free slots',
            value: String(stats.free),
            hint: 'Ready to assign',
            icon: <Clock className="h-4 w-4" />,
            tone: 'from-slate-700 to-slate-500',
          },
          {
            label: 'Coverage',
            value: `${stats.coverage}%`,
            hint: 'Week filled',
            icon: <CalendarDays className="h-4 w-4" />,
            tone: 'from-indigo-600 to-violet-500',
          },
        ].map((card) => (
          <div key={card.label} className="cms-panel overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-md`}
              >
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{card.label}</p>
                <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <p className="truncate text-[11px] text-slate-500">{card.hint}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="cms-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedClass} · Weekly grid
            </h3>
            <p className="text-xs text-slate-500">
              Click a period to edit · Use Customize periods for class-specific times
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Free
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Subject
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                <Coffee className="h-3 w-3" />
                Recess
              </span>
            </div>
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openPeriodsEditor}>
              Periods
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#2563eb_100%)] text-white">
                <th className="sticky left-0 z-20 w-32 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] px-3 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                  Day
                </th>
                {periods.map((period) => (
                  <th
                    key={period.id}
                    className={`min-w-[7.5rem] px-2 py-3 text-center ${
                      period.kind === 'break' ? 'bg-amber-500/20' : ''
                    }`}
                  >
                    <div className="text-[11px] font-bold tracking-wide">{period.short}</div>
                    <div className="mt-0.5 text-[10px] font-medium text-white/70">
                      {formatPeriodTime(period.startTime, period.endTime)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => (
                <tr key={day} className={dayIndex % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/60 dark:bg-slate-900/40'}>
                  <td className="sticky left-0 z-10 border-r border-slate-100 bg-inherit px-3 py-2.5 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{day}</div>
                    <div className="text-[10px] font-medium text-slate-400">Day {dayIndex + 1}</div>
                  </td>
                  {periods.map((period, idx) => {
                    const subject = getSubjectAt(day, idx);
                    const isBreak = period.kind === 'break';
                    const isFree = !isBreak && !subject;

                    if (isBreak) {
                      return (
                        <td key={`${day}-${period.id}`} className="border-r border-slate-100 p-1.5 last:border-r-0 dark:border-slate-800">
                          <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50 text-amber-700 ring-1 ring-amber-100/80 dark:from-amber-950/30 dark:to-orange-950/20 dark:text-amber-300 dark:ring-amber-900/40">
                            <Coffee className="mb-1 h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">{period.short}</span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={`${day}-${period.id}`} className="border-r border-slate-100 p-1.5 last:border-r-0 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => openCellEdit(day, idx)}
                          title="Click to edit period"
                          className={`group flex h-[4.25rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl px-2 text-center transition ${
                            isFree
                              ? 'border border-dashed border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950'
                              : `ring-1 ${subjectChipClass(subject)} hover:brightness-[0.98] hover:shadow-sm`
                          }`}
                        >
                          {isFree ? (
                            <>
                              <Plus className="mb-1 h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" />
                              <span className="text-[10px] font-semibold">Free</span>
                            </>
                          ) : (
                            <>
                              <span className="line-clamp-2 text-[11px] font-bold leading-snug">{subject}</span>
                              <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide opacity-60 transition group-hover:opacity-100">
                                <Pencil className="h-2.5 w-2.5" />
                                Edit
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>
      )}

      <Modal
        open={showAddClass}
        onClose={() => setShowAddClass(false)}
        size="md"
        title="Add class"
        description="This class is saved in this browser and listed in the timetable dropdown"
        icon={<School className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowAddClass(false)}>
              Cancel
            </Button>
            <Button type="submit" form="timetable-add-class-form">
              Create class
            </Button>
          </>
        }
      >
        <form id="timetable-add-class-form" onSubmit={handleCreateClass} className="space-y-3 text-xs">
          <div>
            <label className="cms-label">Class name</label>
            <input
              type="text"
              placeholder="e.g. Class 10 A"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              required
              className={field}
            />
          </div>
          <div>
            <label className="cms-label">Class teacher</label>
            <input
              type="text"
              placeholder="e.g. Dr. Harish Sen"
              value={newTeacher}
              onChange={(e) => setNewTeacher(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className="cms-label">Room</label>
            <input
              type="text"
              placeholder="e.g. Block E - 101"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className={field}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingCell)}
        onClose={() => {
          if (!saving) setEditingCell(null);
        }}
        size="md"
        title="Edit period"
        description={
          editingCell
            ? `${selectedClass} · ${editingCell.day} · ${periodLabel(editingCell.periodIndex)}`
            : undefined
        }
        icon={<Pencil className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" disabled={saving} onClick={() => setEditingCell(null)}>
              Cancel
            </Button>
            <Button type="submit" form="timetable-cell-form" loading={saving}>
              Save period
            </Button>
          </>
        }
      >
        <form id="timetable-cell-form" onSubmit={handleSaveCell} className="space-y-4">
          <div>
            <label className="cms-label">Subject / activity</label>
            <input
              type="text"
              placeholder="e.g. Mathematics, English, Physics Lab"
              value={cellSubjectInput}
              onChange={(e) => setCellSubjectInput(e.target.value)}
              className={field}
              autoFocus
            />
            <p className="mt-2 text-[11px] text-slate-500">Leave empty and save to mark the slot as free.</p>
          </div>
        </form>
      </Modal>

      <Modal
        open={periodsOpen}
        onClose={() => {
          if (!savingPeriods) setPeriodsOpen(false);
        }}
        size="xl"
        title="Customize timetable periods"
        description={`${selectedClass} — set labels, start/end times, and recess columns`}
        icon={<Settings2 className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" disabled={savingPeriods} onClick={() => setPeriodsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="timetable-periods-form" loading={savingPeriods}>
              Save periods
            </Button>
          </>
        }
      >
        <form id="timetable-periods-form" onSubmit={handleSavePeriods} className="space-y-4">
          <div className="space-y-3">
            {draftPeriods.map((slot, index) => (
              <div
                key={slot.id}
                className={`grid gap-3 rounded-2xl border p-3 sm:grid-cols-[4.5rem_1fr_1fr_7rem_7rem_auto] sm:items-end ${
                  slot.kind === 'break'
                    ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20'
                    : 'border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/40'
                }`}
              >
                <div>
                  <label className="cms-label">Code</label>
                  <input
                    className={field}
                    value={slot.short}
                    onChange={(e) => updateDraft(index, { short: e.target.value })}
                    placeholder="P1"
                  />
                </div>
                <div>
                  <label className="cms-label">Label</label>
                  <input
                    className={field}
                    value={slot.name}
                    onChange={(e) => updateDraft(index, { name: e.target.value })}
                    placeholder="Period 1"
                  />
                </div>
                <div>
                  <label className="cms-label">Type</label>
                  <Select
                    value={slot.kind}
                    onChange={(value) => updateDraft(index, { kind: value as 'teaching' | 'break' })}
                    options={[
                      { value: 'teaching', label: 'Teaching' },
                      { value: 'break', label: 'Recess / Break' },
                    ]}
                  />
                </div>
                <div>
                  <label className="cms-label">Start</label>
                  <input
                    type="time"
                    className={field}
                    value={slot.startTime}
                    onChange={(e) => updateDraft(index, { startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="cms-label">End</label>
                  <input
                    type="time"
                    className={field}
                    value={slot.endTime}
                    onChange={(e) => updateDraft(index, { endTime: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-end pb-0.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => removeDraftPeriod(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => addDraftPeriod('teaching')}>
              Add period
            </Button>
            <Button type="button" variant="secondary" leftIcon={<Coffee className="h-4 w-4" />} onClick={() => addDraftPeriod('break')}>
              Add recess
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDraftPeriods(DEFAULT_PERIODS.map((slot) => ({ ...slot })))}
            >
              Reset defaults
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

