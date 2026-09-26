import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Printer, CreditCard, IndianRupee, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, Modal, Select } from '../ui';

interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentName?: string;
  defaultAmount?: number;
}

export const FeeCollectionModal: React.FC<FeeModalProps> = ({
  isOpen,
  onClose,
  defaultStudentName = '',
  defaultAmount = 0,
}) => {
  const { recordFeePayment, students, academicYear, institutionConfig, showToast } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [feeCategory, setFeeCategory] = useState('Tuition & Term Fee');
  const [paymentMode, setPaymentMode] = useState('UPI / Online');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [students, selectedStudentId],
  );

  const totalFee = Number(selectedStudent?.totalFee || 0);
  const alreadyPaid = Number(selectedStudent?.paidFee || 0);
  const feesToCollect = Math.max(0, totalFee - alreadyPaid);
  const payingNow = Number(amount) || 0;
  const remainingAfterPay = Math.max(0, feesToCollect - payingNow);

  useEffect(() => {
    if (!isOpen) return;

    const matched =
      students.find((s) => s.name === defaultStudentName) ||
      students.find((s) => (s.totalFee || 0) > (s.paidFee || 0)) ||
      students[0] ||
      null;

    const due = matched
      ? Math.max(0, Number(matched.totalFee || 0) - Number(matched.paidFee || 0))
      : 0;
    const preset = defaultAmount > 0 ? Math.min(defaultAmount, due || defaultAmount) : due;

    setSelectedStudentId(matched?.id || '');
    setAmount(preset > 0 ? String(preset) : '');
    setFeeCategory('Tuition & Term Fee');
    setPaymentMode('UPI / Online');
    setRemarks('');
    setSaving(false);
    setReceiptGenerated(false);
    setReceiptNumber('');
    setPaidAmount(0);
    // Reset only when opening — not on every students refresh mid-edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultStudentName, defaultAmount]);

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const target = students.find((s) => s.id === id);
    if (!target) return;
    const due = Math.max(0, Number(target.totalFee || 0) - Number(target.paidFee || 0));
    setAmount(due > 0 ? String(due) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Select Student', 'Choose which student this payment is for.', 'warning');
      return;
    }

    const payAmount = Number(amount);
    if (!Number.isFinite(payAmount) || payAmount <= 0) {
      showToast('Invalid Amount', 'Enter how much is being paid now.', 'warning');
      return;
    }
    if (feesToCollect > 0 && payAmount > feesToCollect) {
      showToast(
        'Amount Too High',
        `Fees to be collected is only ₹${feesToCollect.toLocaleString('en-IN')}.`,
        'warning',
      );
      return;
    }

    const recNo = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setSaving(true);
    try {
      await recordFeePayment({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        className: `${selectedStudent.className || ''} ${selectedStudent.section || ''}`.trim(),
        amount: payAmount,
        mode: paymentMode,
        receiptNo: recNo,
        notes: [feeCategory, remarks.trim()].filter(Boolean).join(' · '),
      });
      setReceiptNumber(recNo);
      setPaidAmount(payAmount);
      setReceiptGenerated(true);
    } catch {
      // toast handled in recordFeePayment
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white';
  const fieldReadonly =
    'w-full rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-bold text-rose-700 outline-none dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300';

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        if (!saving) onClose();
      }}
      size="md"
      title={receiptGenerated ? 'Fee payment receipt' : 'Collect student fee'}
      description={
        receiptGenerated
          ? 'Payment recorded successfully'
          : 'Remaining fees update after each payment for the same student'
      }
      icon={receiptGenerated ? <CheckCircle className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
      footer={
        receiptGenerated ? (
          <>
            <Button type="button" variant="secondary" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Print
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="secondary" disabled={saving} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="fee-collect-form" loading={saving} leftIcon={<IndianRupee className="h-4 w-4" />}>
              Collect & Issue Receipt
            </Button>
          </>
        )
      }
    >
      {!receiptGenerated ? (
        <form id="fee-collect-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cms-label">Student</label>
            {students.length > 0 ? (
              <Select
                value={selectedStudentId}
                onChange={handleStudentSelect}
                className="w-full"
                leftIcon={<User className="h-4 w-4" />}
                placeholder="Select student…"
                options={students.map((s) => {
                  const due = Math.max(0, Number(s.totalFee || 0) - Number(s.paidFee || 0));
                  return {
                    value: s.id,
                    label: `${s.name} · ${s.className || 'Class'}-${s.section || 'A'}`,
                    hint: due > 0 ? `To collect ₹${due.toLocaleString('en-IN')}` : 'Cleared',
                  };
                })}
              />
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                No students enrolled yet. Add a student before collecting fees.
              </div>
            )}
          </div>

          {selectedStudent ? (
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-[11px] sm:grid-cols-3">
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-400">Total annual fee</p>
                <p className="mt-0.5 font-bold text-slate-800">₹{totalFee.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-400">Already paid</p>
                <p className="mt-0.5 font-bold text-emerald-600">₹{alreadyPaid.toLocaleString('en-IN')}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-bold uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-0.5 font-bold text-slate-800">
                  {feesToCollect <= 0 ? 'Cleared' : alreadyPaid > 0 ? 'Partial' : 'Pending'}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="cms-label">Fees to be collected (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-rose-400">₹</span>
                <input
                  type="text"
                  readOnly
                  value={selectedStudent ? feesToCollect.toLocaleString('en-IN') : '—'}
                  className={`${fieldReadonly} pl-7`}
                  aria-label="Fees to be collected"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Remaining for this student. Example: 45,000 − 10,000 paid = 35,000 next time.
              </p>
            </div>

            <div>
              <label className="cms-label">Amount paying now (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-slate-400">₹</span>
                <input
                  type="number"
                  min="1"
                  max={feesToCollect > 0 ? feesToCollect : undefined}
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className={`${field} pl-7`}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                {payingNow > 0 && selectedStudent
                  ? `After this payment, next due will be ₹${remainingAfterPay.toLocaleString('en-IN')}.`
                  : 'Enter partial or full amount being paid today.'}
              </p>
            </div>
          </div>

          <Select
            label="Payment mode"
            value={paymentMode}
            onChange={setPaymentMode}
            className="w-full"
            options={[
              { value: 'UPI / Online', label: 'UPI / QR Code' },
              { value: 'Net Banking', label: 'Net Banking' },
              { value: 'Credit / Debit Card', label: 'Credit / Debit Card' },
              { value: 'Cash', label: 'Cash at Counter' },
              { value: 'Cheque / DD', label: 'Cheque / Demand Draft' },
            ]}
          />

          <Select
            label="Fee head"
            value={feeCategory}
            onChange={setFeeCategory}
            className="w-full"
            options={[
              { value: 'Tuition & Term Fee', label: 'Tuition & Term Fee' },
              { value: 'Annual Charges', label: 'Annual Registration & Library' },
              { value: 'Exam & Lab Fee', label: 'Exam & Laboratory Fee' },
              { value: 'Transport Fee', label: 'School Transport Bus Fee' },
            ]}
          />

          <div>
            <label className="cms-label">Remarks (optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Installment note / reference"
              className={field}
            />
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            <div className="border-b border-slate-200 pb-2 text-center dark:border-slate-700">
              <p className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {institutionConfig?.schoolName || 'Campus LMS'}
              </p>
              <p className="text-[11px] text-slate-500">Official Fee Receipt · Academic {academicYear}</p>
            </div>

            <div className="flex justify-between text-[11px]">
              <span>
                Receipt No: <strong className="text-slate-900 dark:text-white">{receiptNumber}</strong>
              </span>
              <span>
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="block text-slate-400">Student</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedStudent?.name}</span>
              </div>
              <div>
                <span className="block text-slate-400">Payment mode</span>
                <span className="font-bold text-slate-900 dark:text-white">{paymentMode}</span>
              </div>
              <div>
                <span className="block text-slate-400">Fee head</span>
                <span>{feeCategory}</span>
              </div>
              <div>
                <span className="block text-slate-400">Status</span>
                <span className="font-bold text-emerald-600">SUCCESS</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-sans dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-600">Amount paid now</span>
              <span className="text-lg font-bold text-blue-600">₹{paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between font-sans text-xs">
              <span className="font-semibold text-slate-500">Fees still to collect</span>
              <span className="font-bold text-rose-600">
                ₹{Math.max(0, feesToCollect - paidAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 pt-1 text-[10px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Digitally authenticated
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
