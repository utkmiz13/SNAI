// @ts-nocheck
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Lock, Calendar } from 'lucide-react';

const DOCUMENTS = [
  { id: 1, name: 'Society Rules & Regulations 2026', type: 'PDF', size: '245 KB', date: 'Jan 1, 2026', category: 'rules', restricted: false, description: 'Complete rulebook for Sharda Nagar Vistar RWA covering all community guidelines.' },
  { id: 2, name: 'Meeting Minutes – April 2026', type: 'PDF', size: '82 KB', date: 'Apr 5, 2026', category: 'minutes', restricted: false, description: 'Minutes from the April general body meeting. Covers budget approvals and maintenance updates.' },
  { id: 3, name: 'Meeting Minutes – March 2026', type: 'PDF', size: '78 KB', date: 'Mar 8, 2026', category: 'minutes', restricted: false, description: 'Minutes from the March meeting covering security improvements and cleanliness drive.' },
  { id: 4, name: 'Maintenance Bill – April 2026', type: 'PDF', size: '38 KB', date: 'Apr 1, 2026', category: 'bills', restricted: false, description: 'Monthly maintenance bill breakdown with itemized expenses for April 2026.' },
  { id: 5, name: 'Annual Budget 2026-27', type: 'PDF', size: '320 KB', date: 'Mar 15, 2026', category: 'budget', restricted: false, description: 'Approved annual budget for financial year 2026-27 with allocation details.' },
  { id: 6, name: 'RWA Registration Certificate', type: 'PDF', size: '1.2 MB', date: 'Jan 10, 2023', category: 'legal', restricted: false, description: 'Official RWA registration certificate from Lucknow Development Authority.' },
  { id: 7, name: 'Audit Report 2025-26', type: 'PDF', size: '512 KB', date: 'Feb 28, 2026', category: 'audit', restricted: true, description: 'Annual financial audit report. Available to RWA members only.' },
  { id: 8, name: 'Emergency Contact Directory', type: 'PDF', size: '64 KB', date: 'Apr 10, 2026', category: 'directory', restricted: false, description: 'Updated emergency contacts directory for all blocks and key personnel.' },
];

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  rules: { label: 'Rules', icon: '📋', color: 'badge-blue' },
  minutes: { label: 'Minutes', icon: '📝', color: 'badge-purple' },
  bills: { label: 'Bills', icon: '💰', color: 'badge-yellow' },
  budget: { label: 'Budget', icon: '📊', color: 'badge-green' },
  legal: { label: 'Legal', icon: '⚖️', color: 'badge-red' },
  audit: { label: 'Audit', icon: '🔍', color: 'badge-yellow' },
  directory: { label: 'Directory', icon: '📞', color: 'badge-blue' },
};

export function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Documents & Records</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Society rules, meeting minutes, bills, and official documents</p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {['all', ...Object.keys(categoryConfig)].map(cat => (
          <span key={cat} className="px-3 py-1 bg-[hsl(var(--muted))] rounded-full text-xs font-medium capitalize cursor-pointer hover:bg-[hsl(var(--border))] transition-colors">
            {cat === 'all' ? '📂 All' : `${categoryConfig[cat]?.icon} ${categoryConfig[cat]?.label}`}
          </span>
        ))}
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENTS.map((doc, i) => {
          const cfg = categoryConfig[doc.category];
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  {doc.restricted ? <Lock size={20} className="text-red-500" /> : <FileText size={20} className="text-red-600 dark:text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{doc.name}</h3>
                    {doc.restricted && <span className="badge badge-red text-xs">🔒 Restricted</span>}
                    {cfg && <span className={`badge ${cfg.color} text-xs`}>{cfg.icon} {cfg.label}</span>}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 line-clamp-2">{doc.description}</p>
                  <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {doc.date}</span>
                    <span>{doc.type} · {doc.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className="flex items-center gap-1.5 flex-1 py-2 bg-[hsl(var(--muted))]/60 hover:bg-[hsl(var(--muted))] rounded-xl text-xs font-medium justify-center transition-colors"
                  onClick={() => !doc.restricted && alert('Viewing document: ' + doc.name)}
                >
                  <Eye size={13} /> View
                </button>
                <button
                  disabled={doc.restricted}
                  className={`flex items-center gap-1.5 flex-1 py-2 rounded-xl text-xs font-medium justify-center transition-all ${
                    doc.restricted 
                      ? 'bg-[hsl(var(--muted))]/30 text-[hsl(var(--muted-foreground))]/50 cursor-not-allowed' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  }`}
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upload section (Admin) */}
      <div className="card p-6 border-dashed text-center">
        <FileText size={32} className="text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
        <p className="font-semibold mb-1">Upload Document</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Admin only. Add meeting minutes, bills, or official notices.</p>
        <button className="btn-secondary text-sm">Select File to Upload</button>
      </div>
    </div>
  );
}
