import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  Building,
  ArrowRight,
  Code
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LOCAL_DEMO_PASSWORD, LOCAL_ONLY, setLocalPassword } from '../config/localMode';
import { UserAccount, UserRole } from '../types';
import { Select } from '../components/ui';

export const UserRolesManagement: React.FC = () => {
  const { users, inviteStaffUser, setUsers, setActiveUserRole, showToast, institutionConfig } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    department: string;
    assignedBranch: string;
    status: 'Active' | 'Suspended';
  }>({
    name: '',
    email: '',
    role: 'teacher',
    phone: '',
    department: 'Academics',
    assignedBranch: institutionConfig.branches[0]?.name || 'Main Campus',
    status: 'Active'
  });

  // Filter out the external App Developer / Super Admin from this school staff directory
  const filteredUsers = users.filter(user => {
    if (user.role === 'superadmin') return false;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'teacher',
      phone: '',
      department: 'Academics',
      assignedBranch: institutionConfig.branches[0]?.name || 'Main Campus',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      department: user.department || 'General',
      assignedBranch: user.assignedBranch || institutionConfig.branches[0]?.name || 'Main Campus',
      status: user.status === 'Suspended' ? 'Suspended' : 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Missing Fields', 'Name and Email are required.', 'warning');
      return;
    }

    try {
      if (editingUser) {
        if (!LOCAL_ONLY && /^[0-9a-f-]{36}$/i.test(editingUser.id)) {
          const { backendClient } = await import('../api/backendClient');
          const saved = await backendClient.updateStaffUser(editingUser.id, {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            phone: formData.phone,
            department: formData.department,
            assigned_branch: formData.assignedBranch,
            status: formData.status,
          });
          setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? saved : u)));
        } else {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
          );
        }
        showToast('User Updated', `${formData.name}'s account details saved.`, 'success');
      } else {
        const invited = await inviteStaffUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          assignedBranch: formData.assignedBranch,
        });
        if (invited.temporaryPassword) {
          const text = `Email: ${invited.staff.email}\nPassword: ${invited.temporaryPassword}`;
          try {
            await navigator.clipboard.writeText(text);
            showToast(
              'Staff created — credentials copied',
              'Share the password with the staff member manually.',
              'success',
            );
          } catch {
            showToast(
              'Staff created',
              `Password: ${invited.temporaryPassword} — share manually.`,
              'info',
            );
          }
        }
      }
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      showToast('User Save Failed', err instanceof Error ? err.message : 'Could not save user.', 'danger');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, status: nextStatus as 'Active' | 'Suspended' } : u))
    );
    if (/^[0-9a-f-]{36}$/i.test(id) && !LOCAL_ONLY) {
      try {
        const { backendClient } = await import('../api/backendClient');
        await backendClient.updateStaffUser(id, { status: nextStatus });
      } catch {
        // local already updated
      }
    }
    showToast('Status Updated', `User account set to ${nextStatus}.`, 'info');
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (users.length <= 1) {
      showToast('Action Forbidden', 'Cannot delete the only administrative account.', 'danger');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    if (/^[0-9a-f-]{36}$/i.test(id) && !LOCAL_ONLY) {
      try {
        const { backendClient } = await import('../api/backendClient');
        await backendClient.deleteStaffUser(id);
      } catch {
        // local already updated
      }
    }
    showToast('User Deleted', `${name}'s account has been removed.`, 'warning');
  };

  const handleResetPassword = async (_name: string, email: string) => {
    if (LOCAL_ONLY) {
      setLocalPassword(email, LOCAL_DEMO_PASSWORD);
      showToast('Password reset', `Local password for ${email} is ${LOCAL_DEMO_PASSWORD}.`, 'success');
      return;
    }
    try {
      const { backendClient } = await import('../api/backendClient');
      const result = await backendClient.resetStaffPassword(email);
      if (result.recoveryLink) {
        try {
          await navigator.clipboard.writeText(result.recoveryLink);
          showToast(
            'Reset link copied',
            `Recovery link for ${email} copied — share it manually.`,
            'success',
          );
        } catch {
          showToast(
            'Reset link ready',
            result.recoveryLink,
            'info',
          );
        }
      } else {
        showToast('Password reset initiated', `Password reset initiated for ${email}`, 'success');
      }
    } catch (err: unknown) {
      showToast(
        'Password reset failed',
        err instanceof Error ? err.message : `Could not initiate password reset for ${email}.`,
        'danger',
      );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
      case 'principal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accountant':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'teacher':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'parent':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'student':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900">User & Staff Account Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision staff accounts, configure role memberships, toggle security states, and manage school access.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Developer Root Separation Card */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Code className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-100 flex items-center gap-2">
              <span>App Developer / Root Superadmin Architecture</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">ROOT ISOLATED</span>
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Superadmin operates at the developer infrastructure level with complete omni-access across all tables and bypass rules, kept separate from this school staff directory.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {['All', 'admin', 'principal', 'accountant', 'teacher', 'parent'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {r === 'admin' ? 'School Admin' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            System Accounts ({filteredUsers.length} Users)
          </h2>
          <span className="text-xs text-slate-500">Stored in Local Database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 pl-4">User Profile</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Department & Branch</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Last Active</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">{user.name}</span>
                        <span className="text-slate-400 text-[11px]">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] border uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600">
                    <div className="font-medium text-slate-800">{user.department || 'Academics'}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.assignedBranch || 'Main Campus'}</div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 font-medium">
                    {user.phone || '—'}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      user.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                    {user.lastLogin || 'Recent'}
                  </td>

                  <td className="py-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {import.meta.env.DEV && (
                        <button
                          onClick={() => {
                            setActiveUserRole(user.role);
                            showToast(`Simulating ${user.name}`, `Active view switched to ${user.role}.`, 'info');
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Impersonate role view"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>View As</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleResetPassword(user.name, user.email)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Send Password Reset"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          user.status === 'Active'
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-amber-600 hover:bg-amber-50'
                        }`}
                        title={user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {user.status === 'Active' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? 'Edit User Account' : 'Provision New Institutional User'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    placeholder="e.g. Dr. Ramesh Gupta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    placeholder="user@apexschool.edu"
                  />
                </div>

                <Select
                  label="Assigned Role"
                  value={formData.role}
                  onChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                  className="w-full"
                  options={[
                    { value: 'admin', label: 'School Administrator' },
                    { value: 'principal', label: 'Principal / Academic Admin' },
                    { value: 'accountant', label: 'Accountant / Finance' },
                    { value: 'teacher', label: 'Teacher / Faculty' },
                    { value: 'parent', label: 'Parent Guardian' },
                    { value: 'student', label: 'Enrolled Student' },
                  ]}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    placeholder="e.g. Science & Tech"
                  />
                </div>

                <Select
                  label="Campus Branch"
                  value={formData.assignedBranch}
                  onChange={(v) => setFormData({ ...formData, assignedBranch: v })}
                  className="w-full"
                  options={institutionConfig.branches.map(b => ({
                    value: b.name,
                    label: b.name,
                  }))}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
