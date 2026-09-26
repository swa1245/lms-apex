import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, Modal, Select } from '../ui';

type AddExpenseModalProps = {
  open: boolean;
  onClose: () => void;
};

const emptyForm = {
  title: '',
  category: 'Utilities',
  amount: '',
  vendor: '',
  paymentMode: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'Cheque' | 'UPI',
  date: new Date().toISOString().split('T')[0],
  status: 'Paid' as 'Paid' | 'Pending',
};

export function AddExpenseModal({ open, onClose }: AddExpenseModalProps) {
  const { addExpense, showToast } = useApp();
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    }
  }, [open]);

  const field =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) {
      showToast('Validation Error', 'Title and valid amount are required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await addExpense({
        title: formData.title.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        vendor: formData.vendor.trim(),
        paidTo: formData.vendor.trim() || 'Direct',
        paymentMode: formData.paymentMode,
        date: formData.date || new Date().toISOString().slice(0, 10),
        status: formData.status,
        receiptNo: `RCP-${Date.now()}`,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Record Expense"
      description="Log vendor bill, payroll, or campus disbursal"
      icon={<Wallet className="h-5 w-5" />}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-expense-modal-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save Expense'}
          </Button>
        </>
      }
    >
      <form id="add-expense-modal-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="cms-label">Title / description *</label>
          <input
            required
            className={field}
            placeholder="e.g. Physics lab glassware"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Category"
            value={formData.category}
            onChange={(v) => setFormData({ ...formData, category: v })}
            className="w-full"
            options={[
              { value: 'Utilities', label: 'Utilities & Electricity' },
              { value: 'Salaries', label: 'Staff Payroll' },
              { value: 'Maintenance', label: 'Campus Maintenance' },
              { value: 'Lab & Sports', label: 'Lab & Sports Supplies' },
              { value: 'Events', label: 'School Events' },
              { value: 'Stationery', label: 'Printing & Stationery' },
            ]}
          />
          <div>
            <label className="cms-label">Amount (₹) *</label>
            <input
              required
              type="number"
              min="1"
              className={field}
              placeholder="15000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="cms-label">Vendor / payee</label>
            <input
              className={field}
              placeholder="Supplier name"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
          </div>
          <Select
            label="Payment mode"
            value={formData.paymentMode}
            onChange={(v) => setFormData({ ...formData, paymentMode: v as typeof formData.paymentMode })}
            className="w-full"
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'Cash', label: 'Cash' },
            ]}
          />
          <div>
            <label className="cms-label">Date</label>
            <input
              type="date"
              className={field}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <Select
            label="Status"
            value={formData.status}
            onChange={(v) => setFormData({ ...formData, status: v as 'Paid' | 'Pending' })}
            className="w-full"
            options={[
              { value: 'Paid', label: 'Paid' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}
