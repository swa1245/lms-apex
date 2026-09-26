import React, { useState } from 'react';
import {
  ShieldAlert,
  FolderLock,
  Database,
  Sliders,
  Users,
  Building2,
  FileCheck2,
  Activity,
  ArrowLeft,
  LayoutDashboard,
  Download,
  HardDrive
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportFullDatabase, getLocalStorageSize } from '../data/localStorageManager';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { MasterAccessFolder } from './MasterAccessFolder';
import { DatabaseManager } from './DatabaseManager';
import { GlobalAccessControl } from './GlobalAccessControl';
import { UserRolesManagement } from './UserRolesManagement';
import { InstitutionMasterSetup } from './InstitutionMasterSetup';
import { AuditSecurityLogs } from './AuditSecurityLogs';
import { SystemHealthPage } from './SystemHealthPage';

export type SuperAdminTab =
  | 'master-access'
  | 'dashboard'
  | 'database'
  | 'permissions'
  | 'users'
  | 'institution'
  | 'audit'
  | 'health';

interface SuperAdminAppProps {
  initialTab?: SuperAdminTab;
  onExit?: () => void;
}

export const SuperAdminApp: React.FC<SuperAdminAppProps> = ({ initialTab = 'master-access', onExit }) => {
  const { setCurrentRoute, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<SuperAdminTab>(initialTab);

  const storage = getLocalStorageSize();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      setCurrentRoute('dashboard');
    }
    showToast('School Portal', 'Returned to Class Management System dashboard.', 'info');
  };

  const handleDownloadBackup = () => {
    exportFullDatabase();
    showToast('Full Backup Downloaded', 'All database tables downloaded as JSON.', 'success');
  };

  const tabs: { id: SuperAdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'master-access', label: 'Omni-Access Hub', icon: FolderLock },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'database', label: 'Database Manager', icon: Database },
    { id: 'permissions', label: 'Global Permissions', icon: Sliders },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'institution', label: 'Institution Setup', icon: Building2 },
    { id: 'audit', label: 'Security & Audit', icon: FileCheck2 },
    { id: 'health', label: 'System Health', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Individual Super Admin Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Branding & Root Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 p-0.5 shadow-lg shadow-rose-950/50 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-white">Super Admin Portal</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ISOLATED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Independent Root & Developer Management Engine</p>
              </div>
            </div>

            {/* Right: Diagnostics & Exit Action */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300 font-medium">DB: {storage.sizeKb.toFixed(1)} KB</span>
              </div>

              <button
                onClick={handleDownloadBackup}
                title="Download JSON Snapshot of All Data"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Backup JSON</span>
              </button>

              <button
                onClick={handleExit}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-950/30 transition-all hover:scale-105 cursor-pointer"
                id="exit-to-school-portal-btn"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit to School Portal</span>
              </button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-800/60 -mx-2 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'master-access' && <MasterAccessFolder />}
        {activeTab === 'dashboard' && <SuperAdminDashboard />}
        {activeTab === 'database' && <DatabaseManager />}
        {activeTab === 'permissions' && <GlobalAccessControl />}
        {activeTab === 'users' && <UserRolesManagement />}
        {activeTab === 'institution' && <InstitutionMasterSetup />}
        {activeTab === 'audit' && <AuditSecurityLogs />}
        {activeTab === 'health' && <SystemHealthPage />}
      </main>

      {/* Individual Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>Super Admin Module • Isolated Individual Folder `/src/superadmin/` • Class Management System Engine</p>
      </footer>
    </div>
  );
};
