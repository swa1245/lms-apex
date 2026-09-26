import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, Plus, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ParentDetailsPage: React.FC = () => {
  const { parents, showToast, setCurrentRoute } = useApp();
  const [search, setSearch] = useState('');

  const filtered = parents.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.children.some(c => c.studentName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Parent & Guardian Details</h2>
          <p className="text-xs text-slate-500">Contact information and ward mapping for enrolled families</p>
        </div>
        <button
          onClick={() => showToast('Add Parent Form', 'Please navigate to Add Student or Parent Directory to register new guardians.', 'info')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guardian</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search parent name, phone, student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Parent Guardians Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? `No guardian records match "${search}". Try another search term.` : 'Guardian records are currently clean. Add students or guardians to view listings.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(parent => (
            <div key={parent.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center">
                  {(parent.name || 'P').split(' ').map(n => n[0] || '').join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{parent.name}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{parent.occupation}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{parent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{parent.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">{parent.address}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Linked Wards / Students
                </span>
                <div className="space-y-1">
                  {(parent.children || []).map((child, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentRoute('students/student-list')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-700">{child.studentName}</span>
                      <span className="text-[11px] font-semibold text-blue-600">{child.className}-{child.section}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
