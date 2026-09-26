import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Globe,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditLogEntry } from '../types';
import { Select } from '../components/ui';

export const AuditSecurityLogs: React.FC = () => {
  const { auditLogs, setAuditLogs, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;

    return matchesSearch && matchesStatus && matchesModule;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Actor,Role,Email,Action,Module,IP Address,Status,Details\n';
    const rows = auditLogs
      .map(
        l =>
          `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.actorEmail}","${l.action}","${l.module}","${l.ipAddress}","${l.status}","${l.details.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Logs Exported', 'Audit trail exported in CSV spreadsheet format.', 'success');
  };

  const handleClearLogs = () => {
    setAuditLogs([
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        actorName: 'Super Administrator',
        actorRole: 'superadmin',
        actorEmail: 'superadmin@apexschool.edu',
        action: 'Audit History Reset',
        module: 'Audit & Security',
        ipAddress: '127.0.0.1',
        status: 'Warning',
        details: 'Audit history purged by Super Administrator.'
      }
    ]);
    showToast('Audit Log Cleared', 'Historical audit trail has been purged.', 'warning');
  };

  const getStatusBadge = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Critical':
      case 'Failed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
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
            <ShieldCheck className="w-6 h-6 text-slate-800" />
            <h1 className="text-2xl font-extrabold text-slate-900">Institutional Security & Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chronological ledger of system logins, data mutations, administrative bypasses, and financial actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, actor, details, IP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              size="sm"
              className="w-36"
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Success', label: 'Success' },
                { value: 'Warning', label: 'Warning' },
                { value: 'Failed', label: 'Failed' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Recorded Events ({filteredLogs.length} Events)
          </h2>
          <span className="text-xs text-slate-400">Live Timestamp Synchronization</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 pl-4">Timestamp & Event</th>
                <th className="py-3.5 px-3">Actor & Role</th>
                <th className="py-3.5 px-3">Subsystem</th>
                <th className="py-3.5 px-3">IP / Host</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pr-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-4">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{log.action}</span>
                        <span className="text-slate-400 text-[11px] font-mono">{log.timestamp}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-800">{log.actorName}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">{log.actorRole}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {log.module}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                    {log.ipAddress}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </td>

                  <td className="py-3.5 pr-4 text-slate-600 max-w-xs text-[11px] truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
