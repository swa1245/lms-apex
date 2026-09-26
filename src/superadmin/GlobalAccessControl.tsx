import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  Download,
  Key,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RolePermissionMatrix, SystemFeatureToggle } from '../types';

export const GlobalAccessControl: React.FC = () => {
  const {
    permissionMatrix,
    setPermissionMatrix,
    featureToggles,
    setFeatureToggles,
    showToast
  } = useApp();

  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  const activeRoleConfig = permissionMatrix[selectedRoleIndex] ?? permissionMatrix[0];

  const handleTogglePermission = (moduleIndex: number, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canExport') => {
    const currentRole = permissionMatrix[selectedRoleIndex];
    if (!currentRole || currentRole.role === 'superadmin') {
      showToast('Super Admin is Immutable', 'Super Administrator inherently possesses all permissions.', 'info');
      return;
    }

    setPermissionMatrix(prev => {
      const updated = [...prev];
      const existingRole = updated[selectedRoleIndex];
      if (!existingRole) {
        return prev;
      }

      const targetRole: RolePermissionMatrix = {
        ...existingRole,
        permissions: [...existingRole.permissions],
      };
      const existingModule = targetRole.permissions[moduleIndex];
      if (!existingModule) {
        return prev;
      }

      const targetModule = { ...existingModule, [field]: !existingModule[field] };
      targetRole.permissions[moduleIndex] = targetModule;
      updated[selectedRoleIndex] = targetRole;
      return updated;
    });

    showToast('Permission Updated', 'Role access policy updated in local storage.', 'success');
  };

  const handleToggleFeature = (featureId: string) => {
    setFeatureToggles(prev =>
      prev.map(f => (f.id === featureId ? { ...f, enabled: !f.enabled } : f))
    );
    showToast('Feature Flag Toggled', 'System feature availability updated.', 'info');
  };

  if (!activeRoleConfig) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-sm text-slate-500">
        Permission matrix is not configured yet.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-extrabold text-slate-900">Global Access & Permission Control</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure Role-Based Access Control (RBAC) matrix and institutional feature toggles.
          </p>
        </div>

        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 self-start sm:self-auto flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Root Permission Engine Active</span>
        </span>
      </div>

      {/* Role Selector Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap gap-1.5">
        {permissionMatrix.map((item, idx) => (
          <button
            key={item.role}
            onClick={() => setSelectedRoleIndex(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedRoleIndex === idx
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{item.label}</span>
            {item.role === 'superadmin' && (
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">ROOT</span>
            )}
          </button>
        ))}
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{activeRoleConfig.label} Privileges</h2>
              <span className="text-xs text-slate-500">• {activeRoleConfig.description}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Toggle granular permissions for each operational subsystem.</p>
          </div>

          {activeRoleConfig.role === 'superadmin' ? (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Full Master Unrestricted Access
            </span>
          ) : (
            <span className="text-xs text-slate-500">Changes persist in local storage</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 pl-5">Subsystem Module</th>
                <th className="py-3.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </div>
                </th>
                <th className="py-3.5 pr-5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeRoleConfig.permissions.map((perm, pIdx) => {
                const isSuper = activeRoleConfig.role === 'superadmin';
                return (
                  <tr key={perm.module} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-5 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{perm.module}</span>
                        {perm.isRestricted && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Restricted
                          </span>
                        )}
                      </div>
                    </td>

                    {/* View */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        disabled={isSuper}
                        onClick={() => handleTogglePermission(pIdx, 'canView')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                          perm.canView
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Create */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        disabled={isSuper}
                        onClick={() => handleTogglePermission(pIdx, 'canCreate')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                          perm.canCreate
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Edit */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        disabled={isSuper}
                        onClick={() => handleTogglePermission(pIdx, 'canEdit')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                          perm.canEdit
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        disabled={isSuper}
                        onClick={() => handleTogglePermission(pIdx, 'canDelete')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                          perm.canDelete
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Export */}
                    <td className="py-3.5 pr-5 text-center">
                      <button
                        disabled={isSuper}
                        onClick={() => handleTogglePermission(pIdx, 'canExport')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                          perm.canExport
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Feature Toggles & Capabilities */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Institutional Feature Toggles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enable or restrict operational features across the entire school management platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featureToggles.map(feat => (
            <div
              key={feat.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                feat.enabled ? 'bg-indigo-50/30 border-indigo-200' : 'bg-slate-50/60 border-slate-200 opacity-80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{feat.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {feat.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{feat.description}</p>
              </div>

              <button
                onClick={() => handleToggleFeature(feat.id)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                  feat.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                    feat.enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
