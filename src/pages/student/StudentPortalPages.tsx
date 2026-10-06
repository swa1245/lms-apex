import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, PageHeader } from '../../components/ui';
import type { AssignmentItem, QuizItem, Student } from '../../types';

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';

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
  const marks = attendanceRecords.filter((row) => row.studentId === student.id);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student portal"
        title={student.name}
        description={`${student.className} · Section ${student.section} · Roll ${student.rollNo || '—'} · ${student.admissionNo}`}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button type="button" onClick={() => setCurrentRoute('student/assignments')} className="cms-panel p-5 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Assignments</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{pending.length}</p>
          <p className="text-xs text-slate-500">waiting for your PDF</p>
        </button>
        <button type="button" onClick={() => setCurrentRoute('student/quizzes')} className="cms-panel p-5 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Quizzes</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{openQuizzes.length}</p>
          <p className="text-xs text-slate-500">not taken yet</p>
        </button>
        <button type="button" onClick={() => setCurrentRoute('student/attendance')} className="cms-panel p-5 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Attendance marks</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{marks.length}</p>
          <p className="text-xs text-slate-500">days your teacher has saved</p>
        </button>
      </div>
      <div className="cms-panel grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 text-xs">
        <div>
          <p className="text-slate-400">Parent / guardian</p>
          <p className="mt-1 font-bold text-slate-800">{student.parentName || '—'}</p>
          <p className="text-slate-500">{student.parentPhone}</p>
        </div>
        <div>
          <p className="text-slate-400">Fee status</p>
          <p className="mt-1 font-bold text-slate-800">{student.feeStatus}</p>
          <p className="text-slate-500">Paid ₹{student.paidFee.toLocaleString('en-IN')} of ₹{student.totalFee.toLocaleString('en-IN')}</p>
        </div>
      </div>
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

export function StudentAttendancePortalPage() {
  const student = useMyStudent();
  const { attendanceRecords, attendanceRequests, requestAttendance } = useApp();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('Please mark me present.');
  if (!student) return <MissingProfile />;

  const rows = attendanceRecords
    .filter((row) => row.studentId === student.id)
    .slice()
    .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
  const mine = attendanceRequests.filter((item) => item.studentId === student.id);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student portal"
        title="My attendance"
        description="You can see the days your teacher has marked. A request from here does not mark you present."
      />
      <form
        className="cms-panel space-y-3 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          requestAttendance({
            studentId: student.id,
            studentName: student.name,
            className: student.className,
            section: student.section,
            date,
            note: note.trim() || 'Please mark me present.',
          });
        }}
      >
        <h3 className="text-sm font-bold text-slate-900">Ask the teacher to mark a day</h3>
        <p className="text-xs text-slate-500">This only sends a note. The teacher marks Present, Absent, Leave, or Half Day on the school register.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <div>
            <label className="cms-label">Date</label>
            <input type="date" required className={field} value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div>
            <label className="cms-label">Note</label>
            <input className={field} value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <Button type="submit">Send request</Button>
        </div>
      </form>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="cms-panel overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold text-slate-700">Marked by teacher</div>
          {rows.length === 0 ? <p className="p-4 text-xs text-slate-500">No attendance saved for you yet.</p> : (
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{row.attendanceDate.slice(0, 10)}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="cms-panel overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold text-slate-700">Your requests</div>
          {mine.length === 0 ? <p className="p-4 text-xs text-slate-500">No requests sent.</p> : (
            <ul className="divide-y divide-slate-100">
              {mine.map((item) => (
                <li key={item.id} className="px-4 py-3 text-xs">
                  <p className="font-bold text-slate-800">{item.date} · {item.status}</p>
                  <p className="text-slate-500">{item.note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
