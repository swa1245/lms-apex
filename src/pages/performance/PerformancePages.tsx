import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, EmptyState, Modal, PageHeader, Select } from '../../components/ui';
import type { AssignmentItem, QuizItem, QuizQuestion, Student } from '../../types';

const CLASS_LEVELS = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const field =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20';

function audienceLabel(item: AssignmentItem) {
  if (item.audience === 'students') return `${item.studentIds.length} selected student${item.studentIds.length === 1 ? '' : 's'}`;
  return item.section && item.section !== 'All' ? `${item.className} · Section ${item.section}` : `${item.className} · All sections`;
}

export function AssignmentsPage() {
  const {
    students,
    assignments,
    submissions,
    addAssignment,
    deleteAssignment,
    gradeSubmission,
    currentUser,
    showToast,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(assignments[0]?.id ?? null);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('10');
  const [audience, setAudience] = useState<'class' | 'students'>('class');
  const [className, setClassName] = useState('Class 5');
  const [section, setSection] = useState('All');
  const [picked, setPicked] = useState<string[]>([]);
  const [gradeDraft, setGradeDraft] = useState<Record<string, { marks: string; feedback: string }>>({});

  useEffect(() => {
    if (!assignments.some((item) => item.id === activeId)) {
      setActiveId(assignments[0]?.id ?? null);
    }
  }, [assignments, activeId]);

  const classOptions = useMemo(() => {
    const extra = students.map((student) => student.className).filter(Boolean);
    return Array.from(new Set([...CLASS_LEVELS, ...extra]));
  }, [students]);

  const active = assignments.find((item) => item.id === activeId) ?? null;
  const activeSubs = submissions.filter((item) => item.assignmentId === active?.id);

  const toggleStudent = (id: string) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !question.trim() || !dueDate) {
      showToast('Missing details', 'Title, question, and due date are required.', 'warning');
      return;
    }
    if (audience === 'students' && picked.length === 0) {
      showToast('Pick students', 'Choose at least one student, or switch to the whole class.', 'warning');
      return;
    }
    addAssignment({
      title: title.trim(),
      question: question.trim(),
      dueDate,
      maxMarks: Math.max(1, Number(maxMarks) || 10),
      audience,
      className: audience === 'class' ? className : 'Selected',
      section: audience === 'class' ? section : 'All',
      studentIds: audience === 'students' ? picked : [],
      createdBy: currentUser?.name || 'Teacher',
    });
    setOpen(false);
    setTitle('');
    setQuestion('');
    setPicked([]);
  };

  const saveGrade = (id: string, max: number) => {
    const draft = gradeDraft[id];
    const marks = Number(draft?.marks);
    if (!Number.isFinite(marks) || marks < 0 || marks > max) {
      showToast('Check the marks', `Enter a number from 0 to ${max}.`, 'warning');
      return;
    }
    gradeSubmission(id, marks, draft?.feedback?.trim() || '', currentUser?.name || 'Teacher');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student performance"
        title="Assignments"
        description="Give one task to a whole class, or a different task to chosen students. Students upload a PDF. You enter the grade."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            New assignment
          </Button>
        }
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="No assignments yet"
          description="Create the first task. Students will see it after they sign in."
          action={<Button onClick={() => setOpen(true)}>New assignment</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="cms-panel divide-y divide-slate-100 overflow-hidden">
            {assignments.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`w-full px-4 py-3 text-left ${activeId === item.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                <p className="mt-1 text-[11px] text-slate-500">{audienceLabel(item)} · Due {item.dueDate}</p>
              </button>
            ))}
          </div>

          {active ? (
            <div className="cms-panel space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{active.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {audienceLabel(active)} · {active.maxMarks} marks · by {active.createdBy}
                  </p>
                </div>
                <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => deleteAssignment(active.id)}>
                  Delete
                </Button>
              </div>
              <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">{active.question}</p>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Answers</h4>
                {activeSubs.length === 0 ? (
                  <p className="text-xs text-slate-500">No PDF submitted yet.</p>
                ) : (
                  activeSubs.map((sub) => (
                    <div key={sub.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800">{sub.studentName}</p>
                        <a href={sub.fileData} download={sub.fileName} className="text-[11px] font-bold text-blue-600">
                          {sub.fileName}
                        </a>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[100px_1fr_auto]">
                        <input
                          type="number"
                          min={0}
                          max={active.maxMarks}
                          placeholder={`0–${active.maxMarks}`}
                          value={gradeDraft[sub.id]?.marks ?? (sub.marks ?? '')}
                          onChange={(event) =>
                            setGradeDraft((prev) => ({
                              ...prev,
                              [sub.id]: { marks: event.target.value, feedback: prev[sub.id]?.feedback ?? sub.feedback },
                            }))
                          }
                          className={field}
                        />
                        <input
                          placeholder="Feedback for the student"
                          value={gradeDraft[sub.id]?.feedback ?? sub.feedback}
                          onChange={(event) =>
                            setGradeDraft((prev) => ({
                              ...prev,
                              [sub.id]: { marks: prev[sub.id]?.marks ?? String(sub.marks ?? ''), feedback: event.target.value },
                            }))
                          }
                          className={field}
                        />
                        <Button size="sm" onClick={() => saveGrade(sub.id, active.maxMarks)}>
                          Save grade
                        </Button>
                      </div>
                      {sub.marks != null ? (
                        <p className="text-[11px] font-semibold text-emerald-700">Graded {sub.marks}/{active.maxMarks}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New assignment"
        description="One task for the class, or different students one by one"
        size="lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="assignment-form">Save assignment</Button>
          </>
        }
      >
        <form id="assignment-form" onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="cms-label">Title</label>
            <input required className={field} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Chapter 4 worksheet" />
          </div>
          <div>
            <label className="cms-label">Question</label>
            <textarea required rows={4} className={field} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Write the question students will answer in their PDF." />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="cms-label">Due date</label>
              <input required type="date" className={field} value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
            <div>
              <label className="cms-label">Max marks</label>
              <input required type="number" min={1} className={field} value={maxMarks} onChange={(event) => setMaxMarks(event.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setAudience('class')} className={`rounded-xl px-3 py-2 text-xs font-bold ${audience === 'class' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Whole class</button>
            <button type="button" onClick={() => setAudience('students')} className={`rounded-xl px-3 py-2 text-xs font-bold ${audience === 'students' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Chosen students</button>
          </div>
          {audience === 'class' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select label="Class" value={className} onChange={setClassName} options={classOptions.map((item) => ({ value: item, label: item }))} />
              <Select
                label="Section"
                value={section}
                onChange={setSection}
                options={[
                  { value: 'All', label: 'All sections' },
                  { value: 'A', label: 'Section A' },
                  { value: 'B', label: 'Section B' },
                  { value: 'C', label: 'Section C' },
                ]}
              />
            </div>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
              {students.length === 0 ? <p className="p-2 text-xs text-slate-500">Admit students first.</p> : null}
              {students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                  <input type="checkbox" checked={picked.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                  <span className="font-semibold text-slate-800">{student.name}</span>
                  <span className="text-slate-400">{student.className} {student.section}</span>
                </label>
              ))}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

const emptyQuestion = (): QuizQuestion => ({
  id: `q-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  prompt: '',
  options: ['', '', '', ''],
  correctIndex: 0,
});

export function QuizzesPage() {
  const { students, quizzes, quizAttempts, addQuiz, deleteQuiz, currentUser, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(quizzes[0]?.id ?? null);
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Class 5');
  const [section, setSection] = useState('All');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);

  useEffect(() => {
    if (!quizzes.some((item) => item.id === activeId)) {
      setActiveId(quizzes[0]?.id ?? null);
    }
  }, [quizzes, activeId]);

  const classOptions = useMemo(() => {
    const extra = students.map((student) => student.className).filter(Boolean);
    return Array.from(new Set([...CLASS_LEVELS, ...extra]));
  }, [students]);

  const active = quizzes.find((item) => item.id === activeId) ?? null;
  const attempts = quizAttempts.filter((item) => item.quizId === active?.id);

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const clean = questions
      .map((question) => ({
        ...question,
        prompt: question.prompt.trim(),
        options: question.options.map((option) => option.trim()),
      }))
      .filter((question) => question.prompt && question.options.every(Boolean));
    if (!title.trim() || !dueDate || clean.length === 0) {
      showToast('Quiz incomplete', 'Add a title, due date, and at least one question with four options.', 'warning');
      return;
    }
    addQuiz({
      title: title.trim(),
      className,
      section,
      dueDate,
      questions: clean,
      createdBy: currentUser?.name || 'Teacher',
    });
    setOpen(false);
    setTitle('');
    setQuestions([emptyQuestion()]);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student performance"
        title="Quizzes"
        description="Set a quiz for one class. Students answer from their login. The score is counted from the correct options."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>New quiz</Button>}
      />

      {quizzes.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="No quizzes yet"
          description="A quiz is for one class. Students take it once from their portal."
          action={<Button onClick={() => setOpen(true)}>New quiz</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="cms-panel divide-y divide-slate-100 overflow-hidden">
            {quizzes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`w-full px-4 py-3 text-left ${activeId === item.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {item.className}{item.section !== 'All' ? ` · ${item.section}` : ''} · {item.questions.length} questions
                </p>
              </button>
            ))}
          </div>
          {active ? (
            <div className="cms-panel space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{active.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-500">Due {active.dueDate} · by {active.createdBy}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => deleteQuiz(active.id)}>Delete</Button>
              </div>
              <ol className="space-y-2 text-xs text-slate-700">
                {active.questions.map((question, index) => (
                  <li key={question.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-bold">{index + 1}. {question.prompt}</p>
                    <p className="mt-1 text-slate-500">Correct: {question.options[question.correctIndex]}</p>
                  </li>
                ))}
              </ol>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Results</h4>
                {attempts.length === 0 ? <p className="mt-2 text-xs text-slate-500">No one has submitted yet.</p> : (
                  <div className="mt-2 divide-y divide-slate-100">
                    {attempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between py-2 text-xs">
                        <span className="font-semibold text-slate-800">{attempt.studentName}</span>
                        <span className="font-bold text-blue-700">{attempt.score}/{active.questions.length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New quiz"
        description="Students in this class will see the quiz after they sign in"
        size="xl"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="quiz-form">Save quiz</Button>
          </>
        }
      >
        <form id="quiz-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="cms-label">Title</label>
              <input required className={field} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Science quiz 1" />
            </div>
            <Select label="Class" value={className} onChange={setClassName} options={classOptions.map((item) => ({ value: item, label: item }))} />
            <Select
              label="Section"
              value={section}
              onChange={setSection}
              options={[
                { value: 'All', label: 'All sections' },
                { value: 'A', label: 'Section A' },
                { value: 'B', label: 'Section B' },
                { value: 'C', label: 'Section C' },
              ]}
            />
            <div>
              <label className="cms-label">Due date</label>
              <input required type="date" className={field} value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
          </div>
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-2 rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">Question {index + 1}</p>
                {questions.length > 1 ? (
                  <button type="button" className="text-[11px] font-bold text-rose-600" onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== question.id))}>Remove</button>
                ) : null}
              </div>
              <input
                className={field}
                placeholder="Question"
                value={question.prompt}
                onChange={(event) => setQuestions((prev) => prev.map((item) => item.id === question.id ? { ...item, prompt: event.target.value } : item))}
              />
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctIndex === optionIndex}
                    onChange={() => setQuestions((prev) => prev.map((item) => item.id === question.id ? { ...item, correctIndex: optionIndex } : item))}
                  />
                  <input
                    className={field}
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(event) => setQuestions((prev) => prev.map((item) => {
                      if (item.id !== question.id) return item;
                      const options = [...item.options];
                      options[optionIndex] = event.target.value;
                      return { ...item, options };
                    }))}
                  />
                </label>
              ))}
              <p className="text-[11px] text-slate-400">Select the radio button next to the correct option.</p>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}>Add question</Button>
        </form>
      </Modal>
    </div>
  );
}

function assignmentForStudent(item: AssignmentItem, student: Student) {
  if (item.audience === 'students') return item.studentIds.includes(student.id);
  if (item.className !== student.className) return false;
  return !item.section || item.section === 'All' || item.section === student.section;
}

function quizForStudent(item: QuizItem, student: Student) {
  if (item.className !== student.className) return false;
  return !item.section || item.section === 'All' || item.section === student.section;
}

export function StudentResultsPage() {
  const { students, assignments, submissions, quizzes, quizAttempts } = useApp();
  const [selectedId, setSelectedId] = useState(students[0]?.id || '');

  useEffect(() => {
    if (!students.some((student) => student.id === selectedId)) {
      setSelectedId(students[0]?.id || '');
    }
  }, [students, selectedId]);

  const rows = useMemo(() => students.map((student) => {
    const graded = assignments.flatMap((item) => {
      if (!assignmentForStudent(item, student)) return [];
      const submission = submissions.find((sub) => sub.assignmentId === item.id && sub.studentId === student.id);
      if (!submission || submission.marks == null) return [];
      return [{ id: item.id, title: item.title, marks: submission.marks, max: item.maxMarks, feedback: submission.feedback }];
    });
    const quizResults = quizzes.flatMap((quiz) => {
      if (!quizForStudent(quiz, student)) return [];
      const attempt = quizAttempts.find((item) => item.quizId === quiz.id && item.studentId === student.id);
      if (!attempt) return [];
      return [{ id: quiz.id, title: quiz.title, score: attempt.score, total: quiz.questions.length }];
    });
    const percents = [
      ...graded.filter((item) => item.max > 0).map((item) => (item.marks / item.max) * 100),
      ...quizResults.filter((item) => item.total > 0).map((item) => (item.score / item.total) * 100),
    ];
    const average = percents.length === 0 ? null : Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length);
    return { student, graded, quizResults, average };
  }), [assignments, quizAttempts, quizzes, students, submissions]);

  const active = rows.find((row) => row.student.id === selectedId) ?? rows[0] ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Student performance"
        title="Results"
        description="See each student’s assignment grades and quiz scores. This is the same performance the student sees after they sign in."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="No students yet"
          description="Admit a student first. Their grades will appear here after you mark an assignment or they submit a quiz."
        />
      ) : (
        <div className="space-y-4">
          {active ? (
            <>
              <div className="cms-panel flex flex-wrap items-end justify-between gap-4 p-5">
                <div className="w-full max-w-sm">
                  <Select
                    label="Student"
                    value={active.student.id}
                    onChange={setSelectedId}
                    options={rows.map((row) => ({
                      value: row.student.id,
                      label: row.student.name,
                      hint: `${row.student.className} · ${row.student.section}${row.average == null ? '' : ` · ${row.average}%`}`,
                    }))}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900">{active.student.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {active.student.className} · Section {active.student.section} · Roll {active.student.rollNo || '—'} · {active.student.admissionNo}
                  </p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-blue-500">Average</p>
                  <p className="text-2xl font-extrabold text-blue-800">{active.average == null ? '—' : `${active.average}%`}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="cms-panel p-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Assignments</p>
                  {active.graded.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">No graded assignment yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {active.graded.map((item) => {
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
                <div className="cms-panel p-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Quizzes</p>
                  {active.quizResults.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">No quiz submitted yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {active.quizResults.map((item) => {
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
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
