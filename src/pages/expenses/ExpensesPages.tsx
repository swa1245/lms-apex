import React, { useState } from 'react';
import {
  Plus,
  Receipt,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, EmptyState, PageHeader, Select } from '../../components/ui';
import { AddExpenseModal } from '../../components/modals/AddExpenseModal';

export const ExpenseListPage: React.FC = () => {
  const { expenses, showToast } = useApp();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = categoryFilter === 'All' ? expenses : expenses.filter(e => e.category === categoryFilter);
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Group categories dynamically
  const categoryCounts = expenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => Number(b[1]) - Number(a[1]));
  const highestCategory = sortedCategories[0]?.[0] ?? 'None';

  const pendingCount = expenses.filter(e => e.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Expenses & Disbursals"
        description="Track vendor bills, utility bills, facility upkeep, staff payroll, and laboratory expenses"
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
            Record New Expense
          </Button>
        }
      />

      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cms-panel p-4">
          <span className="text-slate-400 text-xs font-medium block">Total Disbursed Expenses</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">
            ₹{totalSpent.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">Live operational ledger</span>
        </div>
        <div className="cms-panel p-4">
          <span className="text-slate-400 text-xs font-medium block">Highest Expenditure Head</span>
          <span className="text-xl font-extrabold text-blue-600 mt-1 block truncate">
            {highestCategory}
          </span>
          <span className="text-[10px] text-slate-400">Calculated from logged vouchers</span>
        </div>
        <div className="cms-panel p-4">
          <span className="text-slate-400 text-xs font-medium block">Pending Invoices</span>
          <span className="text-xl font-extrabold text-amber-600 mt-1 block">
            {pendingCount > 0 ? `${pendingCount} Invoices Due` : '0 Invoices Due'}
          </span>
          <span className="text-[10px] text-slate-400">Awaiting clearance</span>
        </div>
      </div>

      <div className="cms-panel overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-7 h-7" />}
            title="No Expense Vouchers Recorded"
            description="Add live vouchers for bills, payroll, or equipment purchases."
            action={
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
                Record First Expense
              </Button>
            }
          />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Title & Description</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Vendor / Entity</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Payment Mode</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{e.title}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-medium">{e.vendor || 'Direct'}</td>
                  <td className="py-3.5 px-3 text-slate-500">{e.date}</td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">{e.paymentMode}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900 dark:text-white">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    }`}>
                      {e.status}
                    </span>
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

export const AddExpensePage: React.FC = () => {
  const { addExpense, setCurrentRoute, showToast } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    vendor: '',
    paymentMode: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'Cheque' | 'UPI',
    date: new Date().toISOString().split('T')[0],
    status: 'Paid' as 'Paid' | 'Pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) {
      showToast('Validation Error', 'Title and valid amount are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const expensePayload = {
      title: formData.title.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      vendor: formData.vendor.trim(),
      paidTo: formData.vendor.trim() || 'Direct',
      paymentMode: formData.paymentMode,
      date: formData.date || new Date().toISOString().slice(0, 10),
      status: formData.status,
      receiptNo: `RCP-${Date.now()}`,
    };

    addExpense(expensePayload);

    showToast('Expense Recorded', `Disbursal of ₹${Number(formData.amount).toLocaleString()} saved successfully.`, 'success');
    setCurrentRoute('expenses/expense-list');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="cms-panel p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Record Institutional Expense</h2>
        <p className="text-xs text-slate-500">Log voucher details, invoice amount, and supplier information</p>
      </div>

      <form onSubmit={handleSubmit} className="cms-panel p-5 sm:p-6 space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Expense Title / Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Physics Laboratory Glassware Purchase"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Expense Category"
            value={formData.category}
            onChange={(v) => setFormData({ ...formData, category: v })}
            className="w-full"
            options={[
              { value: 'Utilities', label: 'Utilities & Electricity' },
              { value: 'Salaries', label: 'Staff Payroll' },
              { value: 'Maintenance', label: 'Campus Maintenance' },
              { value: 'Lab & Sports', label: 'Lab & Sports Supplies' },
              { value: 'Events', label: 'School Events & Sports Day' },
              { value: 'Stationery', label: 'Printing & Exam Papers' },
            ]}
          />

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Disbursed Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 15000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Vendor / Payee
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Scientific Supplies"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
            />
          </div>

          <Select
            label="Payment Mode"
            value={formData.paymentMode}
            onChange={(v) => setFormData({ ...formData, paymentMode: v as 'Bank Transfer' | 'Cash' | 'Cheque' | 'UPI' })}
            className="w-full"
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)' },
              { value: 'UPI', label: 'UPI / Merchant' },
              { value: 'Cheque', label: 'Cheque Payment' },
              { value: 'Cash', label: 'Petty Cash' },
            ]}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setCurrentRoute('expenses/expense-list')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export const VendorPaymentsPage: React.FC = () => {
  const { expenses } = useApp();

  // Extract vendors dynamically from live expenses
  const vendorMap: Record<string, { service: string; totalPaid: number; pendingDue: number }> = {};

  expenses.forEach(e => {
    const vendorName = e.vendor?.trim() || 'General Vendor';
    if (!vendorMap[vendorName]) {
      vendorMap[vendorName] = { service: e.category || 'Supplies', totalPaid: 0, pendingDue: 0 };
    }
    if (e.status === 'Pending') {
      vendorMap[vendorName].pendingDue += Number(e.amount) || 0;
    } else {
      vendorMap[vendorName].totalPaid += Number(e.amount) || 0;
    }
  });

  const vendorList = Object.entries(vendorMap).map(([name, data]) => ({
    name,
    service: data.service,
    totalPaid: data.totalPaid,
    due: data.pendingDue,
    status: data.pendingDue > 0 ? 'Payment Pending' : 'Cleared'
  }));

  return (
    <div className="space-y-6">
      <div className="cms-panel p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Vendor & Partner Invoices</h2>
        <p className="text-xs text-slate-500">Corporate suppliers, service contracts, and payment settlement ledger</p>
      </div>

      <div className="cms-panel overflow-hidden">
        {vendorList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No vendor transactions logged. As new operational expenses are registered with vendor names, they will appear here.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Vendor Partner</th>
                <th className="py-3.5 px-3">Service Scope</th>
                <th className="py-3.5 px-3">Total Paid</th>
                <th className="py-3.5 px-3">Outstanding Due</th>
                <th className="py-3.5 px-4 text-right">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vendorList.map(v => (
                <tr key={v.name} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{v.name}</td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">{v.service}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    ₹{v.totalPaid.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                    {v.due > 0 ? `₹${v.due.toLocaleString('en-IN')}` : 'Nil'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'Cleared'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    }`}>
                      {v.status}
                    </span>
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
