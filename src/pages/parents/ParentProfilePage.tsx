import React from 'react';
import { Users, Phone, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ParentProfilePage: React.FC = () => {
  const { parents, setCurrentRoute } = useApp();
  const parent = parents[0] || null;

  if (!parent) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">No Parent Profile Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            Guardian records are currently clean. You can add a student or guardian to generate detailed profiles.
          </p>
        </div>
        <button
          onClick={() => setCurrentRoute('students/add-student')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
        >
          Add New Student & Guardian
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {(parent.name || 'P').split(' ').map(n => n[0] || '').join('')}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{parent.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{parent.occupation} • Registered Guardian</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{parent.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{parent.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Linked Children Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
              Enrolled Children / Wards
            </h3>

            {(parent.children || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No children mapped yet.</p>
            ) : (
              parent.children.map(child => (
                <div key={child.studentId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{child.studentName}</h4>
                    <p className="text-xs text-slate-500">{child.className} - {child.section} • Roll #05</p>
                  </div>
                  <button
                    onClick={() => setCurrentRoute('students/student-profile')}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 cursor-pointer"
                  >
                    View Dossier
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Fee Ledger Summary</h3>
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Total Paid Till Date</span>
            <span className="text-xl font-bold">₹{(parent.totalPaid || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 text-rose-800 space-y-1">
            <span className="text-xs text-rose-500 font-medium block">Current Pending Dues</span>
            <span className="text-xl font-bold">₹{(parent.pendingDue || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
