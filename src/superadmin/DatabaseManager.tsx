import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  FileJson,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getLocalStorageSize,
  exportFullDatabase,
  importFullDatabase,
  STORAGE_KEYS
} from '../data/localStorageManager';

export const DatabaseManager: React.FC = () => {
  const {
    students,
    setStudents,
    parents,
    setParents,
    classes,
    setClasses,
    pendingFees,
    setPendingFees,
    expenses,
    setExpenses,
    users,
    auditLogs,
    showToast,
    clearAllData,
    resetToDemoData
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmWipeModal, setConfirmWipeModal] = useState(false);

  const storageInfo = getLocalStorageSize();
  const maxEstimatedQuotaKb = 5120; // 5MB standard
  const percentageUsed = Math.min(100, Math.max(0.5, (storageInfo.sizeKb / maxEstimatedQuotaKb) * 100));

  // Export JSON Backup
  const handleExportJSON = () => {
    const jsonStr = exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex_school_local_db_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database Exported', 'Full local storage JSON database exported successfully.', 'success');
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const result = importFullDatabase(content);
      if (result.success) {
        showToast('Database Imported', 'Local storage updated from JSON file. Refreshing state...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        showToast('Import Failed', result.message, 'danger');
      }
    };
    reader.readAsText(file);
  };

  // Clean individual table
  const handleCleanTable = (tableName: string) => {
    switch (tableName) {
      case 'students':
        setStudents([]);
        localStorage.removeItem(STORAGE_KEYS.STUDENTS);
        break;
      case 'parents':
        setParents([]);
        localStorage.removeItem(STORAGE_KEYS.PARENTS);
        break;
      case 'classes':
        setClasses([]);
        localStorage.removeItem(STORAGE_KEYS.CLASSES);
        break;
      case 'pendingFees':
        setPendingFees([]);
        localStorage.removeItem(STORAGE_KEYS.PENDING_FEES);
        break;
      case 'expenses':
        setExpenses([]);
        localStorage.removeItem(STORAGE_KEYS.EXPENSES);
        break;
    }
    showToast('Table Cleared', `${tableName} records wiped from local storage.`, 'warning');
  };

  const tables = [
    { id: 'students', name: 'Students Directory', count: students.length, color: 'text-blue-600' },
    { id: 'parents', name: 'Parent / Guardians', count: parents.length, color: 'text-emerald-600' },
    { id: 'classes', name: 'Classes & Batches', count: classes.length, color: 'text-indigo-600' },
    { id: 'pendingFees', name: 'Pending Fee Vouchers', count: pendingFees.length, color: 'text-amber-600' },
    { id: 'expenses', name: 'Campus Expenses', count: expenses.length, color: 'text-rose-600' },
    { id: 'users', name: 'System User Accounts', count: users.length, color: 'text-slate-800' },
    { id: 'auditLogs', name: 'Audit Security Events', count: auditLogs.length, color: 'text-slate-600' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-slate-900">Local Database & Backup Suite</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browser Local Storage management, full database JSON export/import, clean wipes, and table diagnostics.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Database</span>
          </button>

          {import.meta.env.DEV && (
            <button
              onClick={() => setConfirmWipeModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clean Wipe All Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Health Metric Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Local Storage Allocation & Health</h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            {storageInfo.sizeKb} KB of ~{maxEstimatedQuotaKb} KB ({percentageUsed.toFixed(2)}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 transition-all duration-500"
            style={{ width: `${Math.max(2, percentageUsed)}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Storage Engine: HTML5 LocalStorage (Client-Side Persistence)</span>
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Speed In-Memory Sync
          </span>
        </div>
      </div>

      {/* Database Tables & Record Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Institutional Database Collections</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect record densities and selectively wipe or preserve individual table schemas.
            </p>
          </div>

          {import.meta.env.DEV && (
            <button
              onClick={resetToDemoData}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Sample Starter Records</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map(tbl => (
            <div
              key={tbl.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 block">{tbl.name}</span>
                <span className={`text-lg font-extrabold ${tbl.color}`}>
                  {tbl.count} <span className="text-xs text-slate-400 font-medium">records</span>
                </span>
              </div>

              {tbl.id !== 'users' && tbl.id !== 'auditLogs' && (
                <button
                  onClick={() => handleCleanTable(tbl.id)}
                  disabled={tbl.count === 0}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title={`Clear ${tbl.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* JSON Schema Explorer */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Live JSON Schema Inspector</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time Reactive State</span>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
          <pre>{exportFullDatabase()}</pre>
        </div>
      </div>

      {/* Confirmation Modal for Clean Wipe (dev only) */}
      {import.meta.env.DEV && confirmWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Confirm Complete Database Wipe?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will remove all dummy and local data from your browser's local storage. The system will start with 0 students, 0 fees, and 0 expenses.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
              You can re-populate sample starter records at any time using the "Load Sample Starter Records" button.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmWipeModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setConfirmWipeModal(false);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Yes, Clean Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
