import React, { useState } from 'react';
import { Clock, Award, CheckCircle2, TrendingUp, BookOpen, AlertCircle, Plus, Calendar, X, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Select } from '../../components/ui';

export const StudentHistoryPage: React.FC = () => {
  const { students, recentReceipts, showToast, studentHistoryEvents, addStudentHistoryEvent } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const customEvents = studentHistoryEvents;

  // Modal form fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('academic');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Derive dynamic timeline events for the selected student
  const studentTimeline: Array<{ date: string; event: string; desc: string; type: string }> = [];

  if (selectedStudent) {
    // 1. Enrollment Milestone
    studentTimeline.push({
      date: selectedStudent.admissionDate || 'Current Academic Year',
      event: `Enrolled in Class ${selectedStudent.className || 'General'}`,
      desc: `Official enrollment registered under Admission #${selectedStudent.admissionNo || selectedStudent.id}. Contact: ${selectedStudent.parentPhone || 'N/A'}.`,
      type: 'admission'
    });

    // 2. Fee Receipts for this student
    const studentReceipts = recentReceipts.filter(r => r.studentId === selectedStudent.id || r.studentName === selectedStudent.name);
    studentReceipts.forEach(r => {
      studentTimeline.push({
        date: r.date || 'Recent',
        event: 'Tuition Fee Payment Recorded',
        desc: `Collected ₹${Number(r.amount || 0).toLocaleString()} via ${r.mode || 'Cash'} (Receipt #${r.receiptNo || r.id}).`,
        type: 'fee'
      });
    });

    // 3. User-created milestones
    const userEvents = customEvents.filter(e => e.studentId === selectedStudent.id);
    studentTimeline.push(...userEvents);
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      showToast('Title Required', 'Please enter a milestone title.', 'warning');
      return;
    }

    const newMilestone = {
      studentId: selectedStudent?.id || '',
      date: new Date().toISOString().slice(0, 10),
      event: eventTitle.trim(),
      desc: eventDesc.trim() || 'Recorded by school administration.',
      type: eventType
    };

    setSaving(true);
    void (async () => {
      try {
        await addStudentHistoryEvent(newMilestone);
        setEventTitle('');
        setEventDesc('');
        setIsModalOpen(false);
        showToast('Milestone Added', `Recorded milestone for ${selectedStudent?.name || 'Student'}.`, 'success');
      } catch {
        // toast handled in context
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Student Academic Progression & History</h2>
          <p className="text-xs text-slate-500">Live chronological audit of admissions, fee receipts, promotions, and achievements</p>
        </div>

        <div className="flex items-center gap-3">
          {students.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Student:</label>
              <Select
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                size="sm"
                className="w-52"
                options={students.map(s => ({
                  value: s.id,
                  label: `${s.name} (${s.className})`,
                }))}
              />
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedStudent}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!selectedStudent ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Students Registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Register students in the Student Directory. Once enrolled, their chronological milestones, fee records, and achievements will appear here live.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Progression Log: {selectedStudent.name}
              </h3>
              <p className="text-xs text-slate-400">Class {selectedStudent.className || 'N/A'} • Admission #{selectedStudent.admissionNo || selectedStudent.id}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-900">
              Active Student
            </span>
          </div>

          <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {studentTimeline.map((item, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                  item.type === 'promotion' ? 'bg-emerald-500 text-white' :
                  item.type === 'award' ? 'bg-amber-500 text-white' :
                  item.type === 'fee' ? 'bg-blue-500 text-white' :
                  'bg-indigo-500 text-white'
                }`}>
                  {item.type === 'award' ? <Award className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.event}</h4>
                    <span className="text-[11px] font-semibold text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Milestone</h3>
                  <p className="text-xs text-slate-400">For {selectedStudent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Milestone Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Examination 1st Rank"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Select
                label="Category"
                value={eventType}
                onChange={setEventType}
                className="w-full"
                options={[
                  { value: 'academic', label: 'Academic Achievement' },
                  { value: 'promotion', label: 'Class Promotion' },
                  { value: 'award', label: 'Extracurricular / Sports Award' },
                  { value: 'discipline', label: 'Official Note / Commendation' },
                ]}
              />

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Remarks
                </label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Enter details about marks, award certificate, or promotion..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
