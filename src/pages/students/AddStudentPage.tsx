import React, { useState } from 'react';
import { UserPlus, Upload, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Select } from '../../components/ui';

export const AddStudentPage: React.FC = () => {
  const { addStudent, setCurrentRoute, academicYear } = useApp();
  const yearPrefix = academicYear ? academicYear.split('-')[0] : '2026';

  const [formData, setFormData] = useState({
    name: '',
    admissionNo: `ADM-${yearPrefix}-${Math.floor(100 + Math.random() * 900)}`,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '2015-06-15',
    className: 'Class 5',
    section: 'A',
    rollNo: '25',
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
    attendanceRate: 100
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.parentName) {
      alert('Please fill out student and guardian names.');
      return;
    }
    addStudent(formData);
    setCurrentRoute('students/student-list');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentRoute('students/student-list')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Student Admission Form</h2>
            <p className="text-xs text-slate-500">Enter candidate credentials for new academic enrollment</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Section 1: Academic & Basic Info */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Academic & Identification Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Advait Nair"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Admission Number</label>
              <input
                type="text"
                readOnly
                value={formData.admissionNo}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600"
              />
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

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <Select
              label="Class"
              value={formData.className}
              onChange={(v) => setFormData({ ...formData, className: v })}
              className="w-full"
              options={[
                { value: 'Nursery', label: 'Nursery' },
                { value: 'LKG', label: 'LKG' },
                { value: 'UKG', label: 'UKG' },
                { value: 'Class 1', label: 'Class 1' },
                { value: 'Class 2', label: 'Class 2' },
                { value: 'Class 3', label: 'Class 3' },
                { value: 'Class 4', label: 'Class 4' },
                { value: 'Class 5', label: 'Class 5' },
                { value: 'Class 6', label: 'Class 6' },
                { value: 'Class 7', label: 'Class 7' },
                { value: 'Class 8', label: 'Class 8' },
                { value: 'Class 9', label: 'Class 9' },
                { value: 'Class 10', label: 'Class 10' },
              ]}
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
          </div>
        </div>

        {/* Section 2: Guardian Info */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Parent & Guardian Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Manoj Nair"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                placeholder="guardian@example.com"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Residential Address</label>
              <textarea
                rows={2}
                placeholder="Complete street address, city, pin code..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Fee & Medical */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Tuition Fee Structure & Medical Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Annual Fee (₹)</label>
              <input
                type="number"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(v) => setFormData({ ...formData, bloodGroup: v })}
              className="w-full"
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
              ]}
            />

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Emergency Contact</label>
              <input
                type="tel"
                placeholder="+91 98765 11111"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setCurrentRoute('students/student-list')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Complete Admission</span>
          </button>
        </div>
      </form>
    </div>
  );
};
