import React, { useState } from 'react';
import {
  Building2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstitutionConfig } from '../types';
import { Select } from '../components/ui';

export const InstitutionMasterSetup: React.FC = () => {
  const { institutionConfig, setInstitutionConfig, showToast } = useApp();

  const [formData, setFormData] = useState<InstitutionConfig>(institutionConfig);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    city: '',
    principalName: ''
  });
  const [showAddBranch, setShowAddBranch] = useState(false);

  const handleSaveMaster = (e: React.FormEvent) => {
    e.preventDefault();
    setInstitutionConfig(formData);
    showToast('Institution Master Updated', 'School configuration has been saved and synced to the backend.', 'success');
  };

  const handleAddBranch = () => {
    if (!newBranch.name.trim() || !newBranch.code.trim()) {
      showToast('Missing Details', 'Branch name and code are required.', 'warning');
      return;
    }

    const branchObj = {
      id: `br-${Date.now()}`,
      name: newBranch.name,
      code: newBranch.code,
      city: newBranch.city || 'Delhi NCR',
      principalName: newBranch.principalName || 'Head of Branch',
      isMain: false
    };

    setFormData(prev => ({
      ...prev,
      branches: [...prev.branches, branchObj]
    }));

    setNewBranch({ name: '', code: '', city: '', principalName: '' });
    setShowAddBranch(false);
    showToast('Branch Added', `${branchObj.name} registered under institution hierarchy.`, 'success');
  };

  const handleRemoveBranch = (id: string, name: string) => {
    if (formData.branches.length <= 1) {
      showToast('Action Disallowed', 'At least one main campus branch must exist.', 'danger');
      return;
    }
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.filter(b => b.id !== id)
    }));
    showToast('Branch Removed', `${name} has been detached.`, 'warning');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900">Institution Master Configuration</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global school identity, CBSE/State affiliation codes, multi-campus hierarchy, and localized currency rules.
          </p>
        </div>

        <button
          onClick={handleSaveMaster}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Master Profile</span>
        </button>
      </div>

      <form onSubmit={handleSaveMaster} className="space-y-6">
        {/* Basic Institution Identity */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Official Institutional Identity</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              CBSE Recognized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution Legal Name *</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institution Unique Code</label>
              <input
                type="text"
                value={formData.schoolCode}
                onChange={e => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Affiliation / Registration No.</label>
              <input
                type="text"
                value={formData.affiliationNo}
                onChange={e => setFormData({ ...formData, affiliationNo: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Education Board</label>
              <input
                type="text"
                value={formData.board}
                onChange={e => setFormData({ ...formData, board: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Official Communication & Headquarter Address</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Central Admin Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Helpdesk Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alternate / Emergency Hotline</label>
              <input
                type="text"
                value={formData.alternatePhone}
                onChange={e => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Complete Postal Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Multi-Campus Branches Hierarchy */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Multi-Campus Branches Hierarchy</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage centralized operations across primary and satellite campuses.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddBranch(!showAddBranch)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Branch</span>
            </button>
          </div>

          {showAddBranch && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Register New Satellite Campus Branch</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Branch Name (e.g. Apex South Campus)"
                  value={newBranch.name}
                  onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="Branch Code (e.g. AIPS-SOU)"
                  value={newBranch.code}
                  onChange={e => setNewBranch({ ...newBranch, code: e.target.value })}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase"
                />
                <input
                  type="text"
                  placeholder="City / Region"
                  value={newBranch.city}
                  onChange={e => setNewBranch({ ...newBranch, city: e.target.value })}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="Branch Principal / Head"
                  value={newBranch.principalName}
                  onChange={e => setNewBranch({ ...newBranch, principalName: e.target.value })}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranch(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Confirm Branch
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.branches.map(branch => (
              <div
                key={branch.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{branch.name}</span>
                    {branch.isMain && (
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        MAIN CAMPUS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Code: <span className="font-mono font-bold text-slate-700">{branch.code}</span> • City: {branch.city}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Head: {branch.principalName}</p>
                </div>

                {!branch.isMain && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBranch(branch.id, branch.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Currency, Timezone & Fiscal Year */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Fiscal Year, Currency & Localization</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Active Academic Year"
              value={formData.academicYear}
              onChange={(v) => setFormData({ ...formData, academicYear: v })}
              className="w-full"
              options={[
                { value: '2026-2027', label: '2026–2027 (Active)' },
                { value: '2027-2028', label: '2027–2028' },
                { value: '2028-2029', label: '2028–2029' },
              ]}
            />

            <Select
              label="System Currency"
              value={formData.currency}
              onChange={(v) => setFormData({
                ...formData,
                currency: v,
                currencySymbol: v === 'INR' ? '₹' : '$',
              })}
              className="w-full"
              options={[
                { value: 'INR', label: 'Indian Rupee (INR - ₹)' },
                { value: 'USD', label: 'US Dollar (USD - $)' },
                { value: 'GBP', label: 'British Pound (GBP - £)' },
                { value: 'EUR', label: 'Euro (EUR - €)' },
                { value: 'AED', label: 'UAE Dirham (AED - د.إ)' },
              ]}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN / Tax ID</label>
              <input
                type="text"
                value={formData.taxRegistrationNo}
                onChange={e => setFormData({ ...formData, taxRegistrationNo: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Apply Master Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
