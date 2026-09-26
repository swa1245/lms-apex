import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  Download,
  IndianRupee,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FeeCollectionModal } from '../../components/modals/FeeCollectionModal';
import { Button, EmptyState, Modal, PageHeader } from '../../components/ui';

const emptyFeeStructureForm = {
  grade: '',
  tuition: '',
  lab: '',
  sports: '',
  library: '',
  exam: '',
};

export const FeeStructurePage: React.FC = () => {
  const { academicYear, feeStructures, addFeeStructure, deleteFeeStructure, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyFeeStructureForm);

  const field =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  const computedTotal =
    Number(form.tuition || 0) +
    Number(form.lab || 0) +
    Number(form.sports || 0) +
    Number(form.library || 0) +
    Number(form.exam || 0);

  const handleOpen = () => {
    setForm(emptyFeeStructureForm);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade.trim()) {
      showToast('Validation', 'Academic level / grade is required.', 'warning');
      return;
    }
    if (!form.tuition || Number(form.tuition) < 0) {
      showToast('Validation', 'Enter a valid tuition fee.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await addFeeStructure({
        grade: form.grade.trim(),
        tuition: Number(form.tuition || 0),
        lab: Number(form.lab || 0),
        sports: Number(form.sports || 0),
        library: Number(form.library || 0),
        exam: Number(form.exam || 0),
        total: computedTotal,
        academicYear: academicYear || '2026-2027',
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cms-page space-y-5">
      <PageHeader
        eyebrow="Fees"
        title={`Fee Structure (${academicYear || '2026-2027'})`}
        description="Add academic levels and fee heads — saved to your account"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpen}>
            Add Fee Structure
          </Button>
        }
      />

      {feeStructures.length === 0 ? (
        <EmptyState
          icon={<IndianRupee className="h-7 w-7" />}
          title="No fee structures yet"
          description="Create your first academic fee row with tuition and other heads."
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpen}>
              Add Fee Structure
            </Button>
          }
        />
      ) : (
        <div className="cms-panel overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider dark:bg-slate-900/50 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Academic Level</th>
                <th className="py-3.5 px-3">Tuition</th>
                <th className="py-3.5 px-3">Lab / IT</th>
                <th className="py-3.5 px-3">Sports</th>
                <th className="py-3.5 px-3">Library</th>
                <th className="py-3.5 px-3">Exam</th>
                <th className="py-3.5 px-3 text-right">Annual Total</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {feeStructures.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                    {f.grade}
                    {f.academicYear ? (
                      <span className="mt-0.5 block text-[10px] font-medium text-slate-400">{f.academicYear}</span>
                    ) : null}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">₹{f.tuition.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 text-slate-600">₹{f.lab.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 text-slate-600">₹{f.sports.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 text-slate-600">₹{f.library.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 text-slate-600">₹{f.exam.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-blue-600">
                    ₹{f.total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => void deleteFeeStructure(f.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 dark:border-slate-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        size="lg"
        title="Add fee structure"
        description={`Session ${academicYear || '2026-2027'}`}
        icon={<IndianRupee className="h-5 w-5" />}
        footer={
          <>
            <Button type="button" variant="secondary" disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="fee-structure-form" loading={saving}>
              Save structure
            </Button>
          </>
        }
      >
        <form id="fee-structure-form" onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="cms-label">Academic level</label>
            <input
              className={field}
              value={form.grade}
              onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
              placeholder="e.g. Primary (Class 1 - 5)"
              autoFocus
            />
          </div>
          {(
            [
              ['tuition', 'Tuition fee'],
              ['lab', 'Lab / IT'],
              ['sports', 'Sports'],
              ['library', 'Library'],
              ['exam', 'Exam fee'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="cms-label">{label}</label>
              <input
                type="number"
                min="0"
                className={field}
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder="0"
              />
            </div>
          ))}
          <div className="sm:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-950/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Annual total</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              ₹{computedTotal.toLocaleString('en-IN')}
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const StudentFeesPage: React.FC = () => {
  const { students, setSelectedStudentId, setCurrentRoute } = useApp();
  const [search, setSearch] = useState('');
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState<(typeof students)[number] | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Student Fee Records"
        description="Individual accounts, paid amount, and balance due"
      />

      <div className="cms-panel p-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, adm no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="cms-panel overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-3">Class</th>
              <th className="py-3.5 px-3">Total Annual Fee</th>
              <th className="py-3.5 px-3">Paid Amount</th>
              <th className="py-3.5 px-3">Balance Due</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => {
              const due = s.totalFee - s.paidFee;
              return (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setCurrentRoute('students/student-profile');
                      }}
                    >
                      {s.name}
                    </span>
                    <span className="block text-[10px] font-normal text-slate-400">{s.admissionNo}</span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-600">{s.className}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">₹{s.totalFee.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">₹{s.paidFee.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-bold text-rose-600">₹{due.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        s.feeStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.feeStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {s.feeStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {due > 0 ? (
                      <button
                        onClick={() => {
                          setTargetStudent(s);
                          setFeeModalOpen(true);
                        }}
                        className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                      >
                        Collect Fee
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600">Cleared</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {feeModalOpen && targetStudent && (
        <FeeCollectionModal
          isOpen={feeModalOpen}
          onClose={() => setFeeModalOpen(false)}
          defaultStudentName={targetStudent.name}
          defaultAmount={targetStudent.totalFee - targetStudent.paidFee}
        />
      )}
    </div>
  );
};

export const FeeCollectionPage: React.FC = () => {
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const { recentReceipts, stats } = useApp();

  const recentPayments = recentReceipts.slice(0, 8);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fee Collection"
        description="Select a student, enter amount paid (full or partial), and save to backend"
        actions={
          <Button leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => setFeeModalOpen(true)}>
            Collect Fee
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="cms-panel space-y-4 p-5 sm:p-6 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-800">Recent collections</h3>
          {recentPayments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-xs text-slate-400">
              No transactions yet. Use Collect Fee to record a payment.
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {c.studentName} · ₹{Number(c.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {c.receiptNo} · {c.mode} · {c.date}
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                    {c.status || 'COLLECTED'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cms-panel space-y-4 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-800">Summary</h3>
          <div className="rounded-xl bg-blue-50 p-3.5 text-blue-800">
            <span className="block text-xs font-medium text-slate-500">Total collected</span>
            <span className="text-lg font-bold">₹{stats.totalFeeCollection.toLocaleString('en-IN')}</span>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-800">
            <span className="block text-xs font-medium text-slate-500">Outstanding</span>
            <span className="text-lg font-bold">₹{stats.pendingFees.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <FeeCollectionModal
        isOpen={feeModalOpen}
        onClose={() => setFeeModalOpen(false)}
        defaultStudentName=""
        defaultAmount={0}
      />
    </div>
  );
};

/** Pending + Partial dues in one list (no reminders). */
export const PendingFeesPage: React.FC = () => {
  const { students } = useApp();
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<{
    id: string;
    studentName: string;
    className: string;
    totalDue: number;
    paidFee: number;
    totalFee: number;
    contact: string;
    status: 'Pending' | 'Partial' | 'Overdue';
  } | null>(null);

  const duesList = useMemo(() => {
    return students
      .filter((s) => s.totalFee > s.paidFee)
      .map((s) => {
        const due = s.totalFee - s.paidFee;
        const status: 'Pending' | 'Partial' | 'Overdue' =
          s.paidFee > 0 ? 'Partial' : due > 20000 ? 'Overdue' : 'Pending';
        return {
          id: s.id,
          studentName: s.name,
          className: `${s.className} ${s.section}`.trim(),
          totalDue: due,
          paidFee: s.paidFee,
          totalFee: s.totalFee,
          contact: s.parentPhone || '—',
          status,
        };
      });
  }, [students]);

  return (
    <div className="cms-page space-y-5">
      <PageHeader
        title="Pending & Partial Payments"
        description="Students with outstanding balance — pending or partially paid"
      />

      <div className="cms-panel overflow-hidden">
        {duesList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No pending or partial dues. All enrolled students are cleared.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-3">Class</th>
                <th className="py-3.5 px-3">Total Fee</th>
                <th className="py-3.5 px-3">Paid</th>
                <th className="py-3.5 px-3">Balance Due</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {duesList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.studentName}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-600">{item.className}</td>
                  <td className="py-3.5 px-3 text-slate-700">₹{item.totalFee.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">
                    ₹{item.paidFee.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-rose-600">
                    ₹{item.totalDue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-600">{item.contact}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        item.status === 'Overdue'
                          ? 'border-rose-200 bg-rose-100 text-rose-700'
                          : item.status === 'Partial'
                            ? 'border-amber-200 bg-amber-100 text-amber-700'
                            : 'border-blue-200 bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveItem(item);
                        setFeeModalOpen(true);
                      }}
                      className="cursor-pointer rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white"
                    >
                      Collect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {feeModalOpen && activeItem && (
        <FeeCollectionModal
          isOpen={feeModalOpen}
          onClose={() => setFeeModalOpen(false)}
          defaultStudentName={activeItem.studentName}
          defaultAmount={activeItem.totalDue}
        />
      )}
    </div>
  );
};

/** Payment history and receipts combined. */
export const PaymentHistoryPage: React.FC = () => {
  const { recentReceipts, activities, showToast } = useApp();

  const rows = useMemo(() => {
    if (recentReceipts.length > 0) {
      return recentReceipts.map((r) => ({
        id: r.id,
        receiptNo: r.receiptNo,
        studentName: r.studentName,
        className: r.className,
        amount: r.amount,
        mode: r.mode,
        date: r.date,
        status: r.status || 'Completed',
      }));
    }

    return activities
      .filter((a) => a.type === 'fee')
      .map((a) => ({
        id: a.id,
        receiptNo: a.id,
        studentName: a.description,
        className: '—',
        amount: 0,
        mode: '—',
        date: a.timestamp,
        status: 'Completed',
      }));
  }, [recentReceipts, activities]);

  return (
    <div className="cms-page space-y-5">
      <PageHeader
        title="Payment History & Receipts"
        description="All fee transactions and generated receipts in one list"
      />

      <div className="cms-panel overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No payments or receipts yet. Collections will appear here.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Receipt No</th>
                <th className="py-3.5 px-3">Student / Description</th>
                <th className="py-3.5 px-3">Class</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Mode</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{row.receiptNo}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-800">{row.studentName}</td>
                  <td className="py-3.5 px-3 text-slate-600">{row.className}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">
                    {row.amount > 0 ? `₹${row.amount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{row.mode}</td>
                  <td className="py-3.5 px-3 text-slate-500">{row.date}</td>
                  <td className="py-3.5 px-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          showToast('Download', `Preparing receipt ${row.receiptNo}…`, 'info')
                        }
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 font-bold text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </div>
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

// Legacy route aliases
export const PartialPaymentsPage = PendingFeesPage;
export const ReceiptsPage = PaymentHistoryPage;
