import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, CheckCircle, AlertCircle, Loader, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type Status = 'all' | 'pending' | 'in_progress' | 'resolved';
type ComplaintCategory = 'water' | 'electricity' | 'security' | 'maintenance' | 'other';

const SAMPLE_COMPLAINTS = [
  { id: 1, title: 'Water Leakage in Block 45 Ground Floor', description: 'There is a continuous water leakage near the main pipeline in Block 45 ground floor. Water is pooling on the road and causing inconvenience.', category: 'water', status: 'in_progress', author: 'Ramesh Kumar', flat: 'Block-45 GF', time: '2 days ago', ticket: '#1042' },
  { id: 2, title: 'Street Light Out Near Block 20', description: 'The street light near Block 20 (near Mishra Provisional Store) has been out for 4 days. The area is very dark at night and unsafe for residents.', category: 'electricity', status: 'pending', author: 'Priya Verma', flat: 'Block-22', time: '3 days ago', ticket: '#1041' },
  { id: 3, title: 'Security Guard Absent at Night Gate', description: 'The security guard at the night gate (12 AM - 6 AM) has been absent for the last 3 nights. This is a serious security concern.', category: 'security', status: 'pending', author: 'Amit Mishra', flat: 'Block-10', time: '5 days ago', ticket: '#1040' },
  { id: 4, title: 'Broken Playground Equipment', description: 'The swing in the children\'s park near Block 6 is broken and rusty. Kids were hurt last week. Needs immediate repair.', category: 'maintenance', status: 'resolved', author: 'Sunita Gupta', flat: 'Block-8', time: '1 week ago', ticket: '#1039' },
  { id: 5, title: 'Garbage Not Collected for 3 Days', description: 'The garbage truck has not come to our section (Blocks 30-40) for 3 days. The waste is piling up and smelling badly.', category: 'other', status: 'resolved', author: 'Mohan Sahu', flat: 'Block-39 GF', time: '2 weeks ago', ticket: '#1038' },
];

const statusConfig = {
  pending: { label: 'Pending', icon: <AlertCircle size={14} />, color: 'badge-yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' },
  in_progress: { label: 'In Progress', icon: <Loader size={14} className="animate-spin" />, color: 'badge-blue', bgColor: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
  resolved: { label: 'Resolved', icon: <CheckCircle size={14} />, color: 'badge-green', bgColor: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
};

const categoryEmojis: Record<string, string> = {
  water: '💧', electricity: '⚡', security: '🔒', maintenance: '🔧', other: '📝'
};

export function Complaints() {
  const [activeStatus, setActiveStatus] = useState<Status>('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'water' as ComplaintCategory });
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { showToast } = useToast();

  const filtered = activeStatus === 'all' ? SAMPLE_COMPLAINTS : SAMPLE_COMPLAINTS.filter(c => c.status === activeStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    showToast('success', 'Complaint Raised!', `Ticket ${Date.now().toString().slice(-4)} created. We will address it soon.`);
    setShowForm(false);
    setForm({ title: '', description: '', category: 'water' });
    setLoading(false);
  };

  const counts = {
    all: SAMPLE_COMPLAINTS.length,
    pending: SAMPLE_COMPLAINTS.filter(c => c.status === 'pending').length,
    in_progress: SAMPLE_COMPLAINTS.filter(c => c.status === 'in_progress').length,
    resolved: SAMPLE_COMPLAINTS.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Raise and track colony issues</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Raise Complaint
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {(['all', 'pending', 'in_progress', 'resolved'] as Status[]).map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`card p-3 text-center transition-all hover:shadow-md ${activeStatus === s ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}
          >
            <p className="text-2xl font-bold">{counts[s]}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{s.replace('_', ' ')}</p>
          </button>
        ))}
      </div>

      {/* Complaints list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(complaint => {
            const cfg = statusConfig[complaint.status as keyof typeof statusConfig];
            const isExpanded = expandedId === complaint.id;
            return (
              <motion.div
                key={complaint.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`card border p-4 cursor-pointer hover:shadow-md transition-all ${cfg.bgColor}`}
                onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl flex-shrink-0">{categoryEmojis[complaint.category]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{complaint.title}</p>
                        <span className={`badge ${cfg.color} text-xs flex items-center gap-1`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{complaint.ticket}</span>
                      </div>
                      <p className={`text-xs text-[hsl(var(--muted-foreground))] ${isExpanded ? '' : 'line-clamp-1'}`}>
                        {complaint.description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-[hsl(var(--muted-foreground))] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-[hsl(var(--border))]/50"
                    >
                      <div className="flex flex-wrap gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                        <span>👤 <strong>{complaint.author}</strong></span>
                        <span>🏠 {complaint.flat}</span>
                        <span><Clock size={10} className="inline" /> {complaint.time}</span>
                        <span className="capitalize">📂 {complaint.category}</span>
                      </div>
                      {complaint.status !== 'resolved' && (
                        <div className="mt-3 flex gap-2">
                          <button className="btn-secondary text-xs py-1.5 px-3">Mark In Progress</button>
                          <button className="btn-primary text-xs py-1.5 px-3">Mark Resolved ✓</button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <p className="font-semibold text-lg">All Clear!</p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">No {activeStatus.replace('_', ' ')} complaints.</p>
          </div>
        )}
      </div>

      {/* Raise Complaint Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="section-title">Raise New Complaint</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Logged as: {profile?.username}</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value as ComplaintCategory }))}
                    className="input-field"
                  >
                    {['water', 'electricity', 'security', 'maintenance', 'other'].map(c => (
                      <option key={c} value={c}>{categoryEmojis[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Brief complaint title..."
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the issue in detail — location, time, impact..."
                    rows={4}
                    required
                    className="input-field resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
