import { useState } from 'react';
import { Upload, Download, Plus, History, Zap, Sparkles, Shield } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useDataStore } from '@/store/dataStore';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ImportTab } from '@/pages/admin/ImportTab';
import { ExportTab } from '@/pages/admin/ExportTab';
import { CreateTab } from '@/pages/admin/CreateTab';
import { BulkActionsTab } from '@/pages/admin/BulkActionsTab';
import { AuditLogTab } from '@/pages/admin/AuditLogTab';
import { AISettingsTab } from '@/pages/admin/AISettingsTab';

export function AdminPage() {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'create' | 'bulk' | 'audit' | 'ai'>(
    'import',
  );
  // Subscribe so tab content re-renders on data changes
  const refresh = useDataStore(s => s.version);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto mb-3 text-line-strong" size={48} />
          <p className="text-ink-2 font-medium">Admin access required</p>
          <p className="text-xs text-ink-4 mt-1">Sign in as an administrator to access this page</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'import' as const, label: 'Import Data', icon: Upload },
    { id: 'export' as const, label: 'Export Data', icon: Download },
    { id: 'create' as const, label: 'Create Records', icon: Plus },
    { id: 'bulk' as const, label: 'Bulk Actions', icon: Zap },
    { id: 'audit' as const, label: 'Audit Log', icon: History },
    { id: 'ai' as const, label: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3.5">
          <span className="w-1 h-9 rounded-full shrink-0 mt-0.5 bg-gold-500" aria-hidden />
          <div>
            <h1 className="text-xl font-bold text-ink">Settings &amp; Data</h1>
            <p className="text-sm text-ink-3 mt-0.5">
              Manage the underlying data, rules, and the AI assistant.
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
          Administrator Session
        </span>
      </div>

      <ModuleIntro />

      {/* Tab bar */}
      <div className="border-b border-line">
        <nav className="flex gap-0.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-ink-3 hover:text-ink-2 hover:border-line-strong'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div key={refresh}>
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'create' && <CreateTab />}
        {activeTab === 'bulk' && <BulkActionsTab />}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'ai' && <AISettingsTab />}
      </div>
    </div>
  );
}
