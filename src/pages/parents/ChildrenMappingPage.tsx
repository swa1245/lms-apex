import React from 'react';
import { Users, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ChildrenMappingPage: React.FC = () => {
  const { parents, setCurrentRoute, setSelectedStudentId } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800">Family & Sibling Clusters</h2>
        <p className="text-xs text-slate-500">Mapping family relationships and multiple siblings enrolled under single guardian accounts</p>
      </div>

      {parents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Family Clusters Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Guardian records are currently clean. Add students and parents to map sibling relationships.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parents.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{p.name}</h3>
                  <p className="text-[11px] text-slate-400">{p.phone} • {p.address}</p>
                </div>
                <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  {(p.children || []).length} {(p.children || []).length > 1 ? 'Children' : 'Child'}
                </span>
              </div>

              <div className="space-y-2">
                {(p.children || []).map(child => (
                  <div
                    key={child.studentId}
                    onClick={() => {
                      setSelectedStudentId(child.studentId);
                      setCurrentRoute('students/student-profile');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 cursor-pointer border border-slate-100 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{child.studentName}</p>
                        <p className="text-[10px] text-slate-400">{child.className} - {child.section}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ParentPaymentHistoryPage: React.FC = () => {
  const { parents } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800">Guardian Fee Payment History</h2>
        <p className="text-xs text-slate-500">Historical fee clearance summaries aggregated by parent accounts</p>
      </div>

      {parents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Guardian Payment Logs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Fee transactions will automatically compile into guardian ledger overviews here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Guardian Name</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Wards</th>
                <th className="py-3.5 px-3">Total Paid</th>
                <th className="py-3.5 px-3">Pending Balance</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parents.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{p.name}</td>
                  <td className="py-3.5 px-3 text-slate-600">{p.phone}</td>
                  <td className="py-3.5 px-3">
                    {(p.children || []).map(c => (
                      <span key={c.studentId} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold mr-1">
                        {c.studentName}
                      </span>
                    ))}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">₹{(p.totalPaid || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-bold text-rose-600">₹{(p.pendingDue || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      (p.pendingDue || 0) === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {(p.pendingDue || 0) === 0 ? 'CLEARED' : 'PARTIAL DUE'}
                    </span>
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
