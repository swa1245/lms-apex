import { useEffect, useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, Modal, Select } from '../ui';

type AddStudentModalProps = {
  open: boolean;
  onClose: () => void;
};

function buildInitial(yearPrefix: string) {
  return {
    name: '',
    admissionNo: `ADM-${yearPrefix}-${Math.floor(100 + Math.random() * 900)}`,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '',
    className: 'Class 5',
    section: 'A',
    rollNo: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    bloodGroup: 'B+',
    emergencyContact: '',
    totalFee: 45000,
    paidFee: 0,
    feeStatus: 'Pending' as 'Paid' | 'Partial' | 'Pending',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
    admissionDate: new Date().toISOString().slice(0, 10),
    attendanceRate: 100,
  };
}

export function AddStudentModal({ open, onClose }: AddStudentModalProps) {
  const { addStudent, academicYear, showToast } = useApp();
  const yearPrefix = (academicYear ? academicYear.split('-')[0] : '2026') || '2026';
  const [formData, setFormData] = useState(() => buildInitial(yearPrefix));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setFormData(buildInitial(yearPrefix));
  }, [open, yearPrefix]);

  const field =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  const classOptions = useMemo(
    () =>
      [
        'Nursery', 'LKG', 'UKG',
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      ].map((v) => ({ value: v, label: v })),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.parentName.trim()) {
      showToast('Missing details', 'Student name and guardian name are required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await addStudent({
        ...formData,
        name: formData.name.trim(),
        parentName: formData.parentName.trim(),
        rollNo: formData.rollNo || '—',
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
      size="xl"
      title="Admit New Student"
      description="Quick enrollment — academic details, guardian contact, and fee baseline"
      icon={<UserPlus className="h-5 w-5" />}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-student-modal-form" disabled={saving}>
            {saving ? 'Saving…' : 'Admit Student'}
          </Button>
        </>
      }
    >
      <form id="add-student-modal-form" onSubmit={handleSubmit} className="space-y-5">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Student</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="cms-label">Full name *</label>
              <input
                required
                className={field}
                placeholder="e.g. Advait Nair"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="cms-label">Admission no.</label>
              <input readOnly className={`${field} font-mono text-slate-500`} value={formData.admissionNo} />
            </div>
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(v) => setFormData({ ...formData, gender: v as 'Male' | 'Female' | 'Other' })}
              className="w-full"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              label="Class"
              value={formData.className}
              onChange={(v) => setFormData({ ...formData, className: v })}
              className="w-full"
              options={classOptions}
            />
            <Select
              label="Section"
              value={formData.section}
              onChange={(v) => setFormData({ ...formData, section: v })}
              className="w-full"
              options={[
                { value: 'A', label: 'Section A' },
                { value: 'B', label: 'Section B' },
                { value: 'C', label: 'Section C' },
              ]}
            />
            <div>
              <label className="cms-label">Roll no.</label>
              <input
                className={field}
                placeholder="e.g. 25"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
              />
            </div>
            <div>
              <label className="cms-label">Date of birth</label>
              <input
                type="date"
                className={field}
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Guardian</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="cms-label">Parent / guardian *</label>
              <input
                required
                className={field}
                placeholder="e.g. Manoj Nair"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>
            <div>
              <label className="cms-label">Phone *</label>
              <input
                required
                type="tel"
                className={field}
                placeholder="+91 98765 00000"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="cms-label">Email</label>
              <input
                type="email"
                className={field}
                placeholder="guardian@example.com"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="cms-label">Address</label>
              <textarea
                rows={2}
                className={field}
                placeholder="Street, city, pin code"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Fee baseline</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="cms-label">Annual fee (₹)</label>
              <input
                type="number"
                className={field}
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="cms-label">Blood group</label>
              <input
                className={field}
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              />
            </div>
            <div>
              <label className="cms-label">Emergency contact</label>
              <input
                className={field}
                placeholder="Alternate phone"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
          </div>
        </section>
      </form>
    </Modal>
  );
}
