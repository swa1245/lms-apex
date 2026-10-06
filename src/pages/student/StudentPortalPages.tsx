import { useMemo, useState } from 'react';
import { BookOpen, CalendarX, ClipboardList, UserRound, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, PageHeader } from '../../components/ui';
import type { AssignmentItem, QuizItem, Student } from '../../types';

function useMyStudent(): Student | null {
  const { currentUser, users, students } = useApp();
  return useMemo(() => {
    if (!currentUser) return null;
    const account = users.find((user) => user.email.toLowerCase() === currentUser.email.toLowerCase());
    return (
      students.find((student) => student.id === (currentUser.studentId || account?.studentId)) ||
      students.find((student) => student.loginEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
      null
    );
  }, [currentUser, students, users]);
}

function assignmentFor(item: AssignmentItem, student: Student) {
  if (item.audience === 'students') return item.studentIds.includes(student.id);
  if (item.className !== student.className) return false;
  return !item.section || item.section === 'All' || item.section === student.section;
}

function quizFor(item: QuizItem, student: Student) {
  if (item.className !== student.className) return false;
  return !item.section || item.section === 'All' || item.section === student.section;
}

function MissingProfile() {
  return (
    <div className="cms-panel p-8 text-center">
      <h2 className="text-sm font-bold text-slate-800">This login is not linked to a student</h2>
      <p className="mt-2 text-xs text-slate-500">Ask the school office to create your student login again from the student list.</p>
    </div>
  );
}

export function StudentHomePage() {
  const student = useMyStudent();
  const { assignments, submissions, quizzes, quizAttempts, attendanceRecords, setCurrentRoute } = useApp();
  if (!student) return <MissingProfile />;

  const mine = assignments.filter((item) => assignmentFor(item, student));
  const pending = mine.filter((item) => !submissions.some((sub) => sub.assignmentId === item.id && sub.studentId === student.id));
  const myQuizzes = quizzes.filter((item) => quizFor(item, student));
  const openQuizzes = myQuizzes.filter((item) => !quizAttempts.some((attempt) => attempt.quizId === item.id && attempt.studentId === student.id));
  const thisMonth = new Date().toISOString().slice(0, 7);
  const absentsThisMonth = attendanceRecords.filter(
    (row) => row.studentId === student.id && row.status === 'Absent' && row.attendanceDate.startsWith(thisMonth),
  ).length;
  const graded = mine.flatMap((item) => {
    const submission = submissions.find((sub) => sub.assignmentId === item.id && sub.studentId === student.id);
    if (!submission || submission.marks == null) return [];
    return [{ id: item.id, title: item.title, marks: submission.marks, max: item.maxMarks, feedback: submission.feedback }];
  });
  const quizResults = myQuizzes.flatMap((quiz) => {
    const attempt = quizAttempts.find((item) => item.quizId === quiz.id && item.studentId === student.id);
    if (!attempt) return [];
    return [{ id: quiz.id, title: quiz.title, score: attempt.score, total: quiz.questions.length }];
  });
  const percents = [
    ...graded.filter((item) => item.max > 0).map((item) => (item.marks / item.max) * 100),
    ...quizResults.filter((item) => item.total > 0).map((item) => (item.score / item.total) * 100),
  ];
  const average = percents.length === 0 ? null : Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length);
  const feePercent = student.totalFee > 0 ? Math.min(100, Math.round((student.paidFee / student.totalFee) * 100)) : 0;
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const letters = student.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'S';
  const photo = student.avatar?.startsWith('http') || student.avatar?.startsWith('data:') ? student.avatar : '';

  return (
    <div className="space-y-5">
      <section className="rounded-[1.4rem] bg-gradient-to-br from-slate-950 via-blue-900 to-sky-600 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {photo ? (
              <img src={photo} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/40" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-xl font-extrabold ring-2 ring-white/30">{letters}</div>
            )}
            <div>
              <p className="text-xs font-semibold text-sky-100">{hello}</p>
              <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white">{student.name}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[`${student.className} · ${student.section}`, `Roll ${student.rollNo || '—'}`, student.admissionNo].map((chip) => (
                  <span key={chip} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">{chip}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div
              className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full"
              style={{ background: `conic-gradient(#ffffff ${average ?? 0}%, rgba(255,255,255,0.22) 0)` }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-950 text-sm font-extrabold">
                {average == null ? '—' : `${average}%`}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-100">My average</p>
              <p className="text-sm font-semibold text-white">{average == null ? 'No graded work yet' : 'Across grades and quizzes'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button type="button" onClick={() => setCurrentRoute('student/assignments')} className="cms-panel cms-panel-hover p-5 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><ClipboardList size={18} /></span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Assignments</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{pending.length}</p>
          <p className="text-xs text-slate-500">waiting for your PDF</p>
        </button>
        <button type="button" onClick={() => setCurrentRoute('student/quizzes')} className="cms-panel cms-panel-hover p-5 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><BookOpen size={18} /></span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Quizzes</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{openQuizzes.length}</p>
          <p className="text-xs text-slate-500">not taken yet</p>
        </button>
        <button type="button" onClick={() => setCurrentRoute('student/attendance')} className="cms-panel cms-panel-hover p-5 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600"><CalendarX size={18} /></span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Absents this month</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{absentsThisMonth}</p>
          <p className="text-xs text-slate-500">open the calendar to see each day</p>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="cms-panel flex items-center gap-3 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><UserRound size={18} /></span>
          <div className="min-w-0 text-xs">
            <p className="font-bold uppercase tracking-wide text-slate-400">Parent / guardian</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-800">{student.parentName || '—'}</p>
            <p className="text-slate-500">{student.parentPhone || 'No phone saved'}</p>
          </div>
        </div>
        <div className="cms-panel p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet size={18} /></span>
            <div className="min-w-0 flex-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold uppercase tracking-wide text-slate-400">Fee status</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{student.feeStatus}</span>
              </div>
              <p className="mt-1 font-bold text-slate-800">₹{student.paidFee.toLocaleString('en-IN')} of ₹{student.totalFee.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${feePercent}%` }} />
          </div>
        </div>
      </div>

      <section className="cms-panel space-y-4 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">My performance</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">Grades and quiz scores</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Assignments</p>
            {graded.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">Graded assignment marks will show here.</p>
            ) : (
              <ul className="space-y-2">
                {graded.map((item) => {
                  const percent = item.max > 0 ? Math.round((item.marks / item.max) * 100) : 0;
                  return (
                    <li key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <p className="font-extrabold text-emerald-700">{item.marks}/{item.max}</p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                      {item.feedback ? <p className="mt-2 text-slate-500">{item.feedback}</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Quizzes</p>
            {quizResults.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">Quiz scores will show here after you submit.</p>
            ) : (
              <ul className="space-y-2">
                {quizResults.map((item) => {
                  const percent = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;
                  return (
                    <li key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <p className="font-extrabold text-blue-700">{item.score}/{item.total}</p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function StudentAssignmentsPage() {
  const student = useMyStudent();
  const { assignments, submissions, submitAssignment, showToast } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  if (!student) return <MissingProfile />;

  const mine = assignments.filter((item) => assignmentFor(item, student));

  const onFile = async (assignmentId: string, file: File | undefined) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      showToast('PDF only', 'Upload the answer as a PDF file.', 'warning');
      return;
    }
    if (file.size > 1_200_000) {
      showToast('File too large', 'Keep the PDF under 1.2 MB.', 'warning');
      return;
    }
    setBusyId(assignmentId);
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read the file.'));
        reader.readAsDataURL(file);
      });
      submitAssignment({
        assignmentId,
        studentId: student.id,
        studentName: student.name,
        fileName: file.name,
        fileData,
      });
    } catch (error) {
      showToast('Upload failed', error instanceof Error ? error.message : 'Could not read the PDF.', 'danger');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student portal"
        title="My assignments"
        description="Read the question, then upload your answer as a PDF. Your teacher enters the grade."
      />
      {mine.length === 0 ? (
        <div className="cms-panel p-8 text-center text-xs text-slate-500">No assignment has been given to you yet.</div>
      ) : (
        mine.map((item) => {
          const submission = submissions.find((sub) => sub.assignmentId === item.id && sub.studentId === student.id);
          return (
            <article key={item.id} className="cms-panel space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <span className="text-[11px] font-semibold text-slate-500">Due {item.dueDate} · {item.maxMarks} marks</span>
              </div>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{item.question}</p>
              {submission ? (
                <div className="rounded-xl bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-800">Submitted · {submission.fileName}</p>
                  {submission.marks == null ? (
                    <p className="mt-1 text-slate-500">Waiting for the teacher to grade this PDF. You can upload a new file until it is graded.</p>
                  ) : (
                    <p className="mt-1 font-bold text-emerald-700">Grade {submission.marks}/{item.maxMarks}{submission.feedback ? ` · ${submission.feedback}` : ''}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No answer uploaded yet.</p>
              )}
              {submission?.marks == null ? (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">
                  {busyId === item.id ? 'Reading PDF…' : 'Upload PDF answer'}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      void onFile(item.id, event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </label>
              ) : null}
            </article>
          );
        })
      )}
    </div>
  );
}

export function StudentQuizzesPage() {
  const student = useMyStudent();
  const { quizzes, quizAttempts, submitQuiz } = useApp();
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  if (!student) return <MissingProfile />;

  const mine = quizzes.filter((item) => quizFor(item, student));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student portal"
        title="Quizzes"
        description="Quizzes set for your class. You can submit each quiz once."
      />
      {mine.length === 0 ? (
        <div className="cms-panel p-8 text-center text-xs text-slate-500">No quiz for your class yet.</div>
      ) : (
        mine.map((quiz) => {
          const attempt = quizAttempts.find((item) => item.quizId === quiz.id && item.studentId === student.id);
          const draft = answers[quiz.id] || quiz.questions.map(() => -1);
          return (
            <article key={quiz.id} className="cms-panel space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{quiz.title}</h3>
                <span className="text-[11px] text-slate-500">Due {quiz.dueDate}</span>
              </div>
              {attempt ? (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                  Submitted. Score {attempt.score}/{quiz.questions.length}.
                </p>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (draft.some((value) => value < 0)) return;
                    const score = quiz.questions.reduce((sum, question, index) => sum + (draft[index] === question.correctIndex ? 1 : 0), 0);
                    submitQuiz({ quizId: quiz.id, studentId: student.id, studentName: student.name, answers: draft, score });
                  }}
                >
                  {quiz.questions.map((question, index) => (
                    <fieldset key={question.id} className="space-y-2">
                      <legend className="text-xs font-bold text-slate-800">{index + 1}. {question.prompt}</legend>
                      {question.options.map((option, optionIndex) => (
                        <label key={option} className="flex items-center gap-2 text-xs text-slate-700">
                          <input
                            type="radio"
                            name={`${quiz.id}-${question.id}`}
                            required
                            checked={draft[index] === optionIndex}
                            onChange={() => setAnswers((prev) => {
                              const next = [...(prev[quiz.id] || quiz.questions.map(() => -1))];
                              next[index] = optionIndex;
                              return { ...prev, [quiz.id]: next };
                            })}
                          />
                          {option}
                        </label>
                      ))}
                    </fieldset>
                  ))}
                  <Button type="submit">Submit quiz</Button>
                </form>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayTone(status: string | undefined, isSunday: boolean) {
  if (!status && isSunday) return 'bg-slate-100 text-slate-400 border-slate-200';
  if (!status) return 'bg-white text-slate-400 border-slate-200';
  if (status === 'Absent') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (status === 'Leave') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'Half Day') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

export function StudentAttendancePortalPage() {
  const student = useMyStudent();
  const { attendanceRecords } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const monthRecords = useMemo(
    () => attendanceRecords.filter(
      (row) => row.studentId === student?.id && row.attendanceDate.startsWith(selectedMonth),
    ),
    [attendanceRecords, selectedMonth, student?.id],
  );
  const recordByDate = useMemo(
    () => new Map(monthRecords.map((row) => [row.attendanceDate.slice(0, 10), row.status])),
    [monthRecords],
  );
  const calendar = useMemo(() => {
    const [year = new Date().getFullYear(), month = new Date().getMonth() + 1] = selectedMonth.split('-').map(Number);
    const count = new Date(year, month, 0).getDate();
    const leading = new Date(year, month - 1, 1).getDay();
    const cells: Array<{ key: string; day?: number; status?: string; isSunday?: boolean }> = Array.from(
      { length: leading },
      (_, index) => ({ key: `blank-${index}` }),
    );
    for (let day = 1; day <= count; day += 1) {
      const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      cells.push({
        key: date,
        day,
        status: recordByDate.get(date),
        isSunday: new Date(year, month - 1, day).getDay() === 0,
      });
    }
    return cells;
  }, [recordByDate, selectedMonth]);

  if (!student) return <MissingProfile />;

  const absent = monthRecords.filter((row) => row.status === 'Absent').length;
  const present = monthRecords.filter((row) => row.status === 'Present').length;
  const leave = monthRecords.filter((row) => row.status === 'Leave').length;
  const halfDay = monthRecords.filter((row) => row.status === 'Half Day').length;
  const marked = monthRecords.length;
  const monthLabel = new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student portal"
        title="My attendance"
        description="Each day shows whether the teacher has marked you, and how many absents you have this month."
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-rose-500">Absent</p>
            <p className="mt-1 text-2xl font-extrabold text-rose-700">{absent}</p>
          </div>
          <div className="cms-panel px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Present</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{present}</p>
          </div>
          <div className="cms-panel px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Leave</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{leave}</p>
          </div>
          <div className="cms-panel px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Marked days</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{marked}</p>
          </div>
        </div>
        <div>
          <label className="cms-label" htmlFor="student-attendance-month">Month</label>
          <input
            id="student-attendance-month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
          />
        </div>
      </div>
      <div className="cms-panel space-y-4 p-5">
        <h3 className="text-sm font-bold text-slate-800">{monthLabel}</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {WEEKDAYS.map((label) => <div key={label}>{label}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendar.map((cell) => (
            cell.day == null ? <div key={cell.key} /> : (
              <div key={cell.key} className={`min-h-[72px] rounded-xl border p-2 text-left ${dayTone(cell.status, Boolean(cell.isSunday))}`}>
                <span className="block text-sm font-bold">{cell.day}</span>
                <span className="mt-1 block text-[10px] font-semibold leading-tight">
                  {cell.status || (cell.isSunday ? 'Sunday' : 'Not marked')}
                </span>
              </div>
            )
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-emerald-500" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-rose-500" /> Absent</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-amber-500" /> Leave</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-indigo-500" /> Half Day{halfDay ? ` (${halfDay})` : ''}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-slate-300" /> Not marked</span>
        </div>
      </div>
    </div>
  );
}
