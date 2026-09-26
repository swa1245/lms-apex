import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState, PageHeader } from '../../components/ui';

export const ParentsListPage: React.FC = () => {
  const { parents } = useApp();
  const [search, setSearch] = useState('');

  const filtered = parents.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.children.some(c => c.studentName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parents & Guardians Directory"
        description="Comprehensive guardian records, linked students, and dues summary"
      />

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
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No parents or guardians found"
          description="Parent records will appear here after registration or when linked to students."
        />
      ) : (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Guardian Name</th>
              <th className="py-3.5 px-3">Occupation</th>
              <th className="py-3.5 px-3">Phone & Email</th>
              <th className="py-3.5 px-3">Children / Wards</th>
              <th className="py-3.5 px-3">Total Paid</th>
              <th className="py-3.5 px-3">Pending Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(parent => (
              <tr key={parent.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {parent.name[0]}
                    </div>
                    <span>{parent.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-slate-600 font-medium">{parent.occupation}</td>
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-slate-800">{parent.phone}</div>
                  <div className="text-[11px] text-slate-400">{parent.email}</div>
                </td>
                <td className="py-3.5 px-3">
                  {parent.children.map(c => (
                    <span key={c.studentId} className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px] mr-1">
                      {c.studentName} ({c.className})
                    </span>
                  ))}
                </td>
                <td className="py-3.5 px-3 font-bold text-emerald-600">₹{parent.totalPaid.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-3">
                  {parent.pendingDue > 0 ? (
                    <span className="font-bold text-rose-600">₹{parent.pendingDue.toLocaleString('en-IN')}</span>
                  ) : (
                    <span className="text-emerald-700 font-bold text-[11px]">Nil</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};
