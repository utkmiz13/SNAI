// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle, AlertCircle, Loader, ChevronDown, MessageSquare, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

type Status = 'all' | 'pending' | 'in_progress' | 'resolved';
type ComplaintCategory = 'water' | 'electricity' | 'security' | 'maintenance' | 'other';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  author_name: string;
  flat_no: string;
  ticket_no: string;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pending', icon: <AlertCircle size={14} />, color: 'badge-yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' },
  in_progress: { label: 'In Progress', icon: <Loader size={14} className="animate-spin" />, color: 'badge-blue', bgColor: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
  resolved: { label: 'Resolved', icon: <CheckCircle size={14} />, color: 'badge-green', bgColor: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
};

const categoryEmojis: Record<string, string> = {
  water: '💧', electricity: '⚡', security: '🔒', maintenance: '🔧', other: '📝'
};

// Seed demo complaints shown in offline/demo mode
const DEMO_COMPLAINTS: Complaint[] = [
  { id: '1', title: 'Street light broken near Gate 2', description: 'The street light near Gate 2 has been non-functional for 3 days. It creates safety issues at night.', category: 'electricity', status: 'in_progress', author_name: 'Ramesh Sharma', flat_no: 'Block-5, Flat-12', ticket_no: '#1042', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '2', title: 'Water supply irregular in Block 3', description: 'Water supply is coming for only 30 minutes in the morning. The timing is also not fixed.', category: 'water', status: 'pending', author_name: 'Priya Verma', flat_no: 'Block-3, Flat-7', ticket_no: '#1043', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'Garbage not collected for 2 days', description: 'The garbage van has not visited our block for 2 days. There is a bad smell in the area.', category: 'maintenance', status: 'resolved', author_name: 'Suresh Gupta', flat_no: 'Block-8, Flat-3', ticket_no: '#1044', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
];

export function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeStatus, setActiveStatus] = useState<Status>('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'water' as ComplaintCategory });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { profile, user, isAdmin } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchComplaints();

    let channel: any = null;
    try {
      channel = supabase
        .channel('complaints_changes')
        .on('postgres_changes', { event: '*', table: 'complaints', schema: 'public' }, () => {
          fetchComplaints();
        })
        .subscribe();
    } catch (e) {
      console.warn('Real-time subscription failed:', e);
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch (_) {}
      }
    };
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Complaints fetch error (showing demo data):', error.message);
        setIsOffline(true);
        setComplaints(DEMO_COMPLAINTS);
      } else {
        setIsOffline(false);
        setComplaints(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching complaints:', err.message);
      setIsOffline(true);
      setComplaints(DEMO_COMPLAINTS);
    } finally {
      setFetching(false);
    }
  };

  const filtered = activeStatus === 'all'
    ? complaints
    : complaints.filter(c => c.status === activeStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('error', 'Not Logged In', 'You must be logged in to raise a complaint.');
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      showToast('warning', 'Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const ticketNo = `#${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (isOffline) {
        // Demo mode: add locally
        const newComplaint: Complaint = {
          id: Date.now().toString(),
          user_id: user.id,
          title: form.title,
          description: form.description,
          category: form.category,
          author_name: profile?.full_name || user.user_metadata?.full_name || 'Resident',
          flat_no: profile?.flat_no || user.user_metadata?.flat_no || 'Unknown',
          ticket_no: ticketNo,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        setComplaints(prev => [newComplaint, ...prev]);
        showToast('success', 'Complaint Raised! (Demo)', `Ticket ${ticketNo} created locally. Connect Supabase to persist.`);
        setShowForm(false);
        setForm({ title: '', description: '', category: 'water' });
        return;
      }

      const { error } = await supabase.from('complaints').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        author_name: profile?.full_name || user.user_metadata?.full_name || 'Resident',
        flat_no: profile?.flat_no || user.user_metadata?.flat_no || 'Unknown',
        ticket_no: ticketNo,
        status: 'pending'
      });

      if (error) throw error;

      showToast('success', 'Complaint Raised!', `Ticket ${ticketNo} created. The RWA will address it soon.`);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'water' });
    } catch (err: any) {
      showToast('error', 'Failed to Submit', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));

    if (isOffline) {
      showToast('success', 'Status Updated (Demo)', `Complaint marked as ${newStatus.replace('_', ' ')}.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      showToast('success', 'Status Updated', `Complaint marked as ${newStatus.replace('_', ' ')}.`);
    } catch (err: any) {
      // Revert on error
      fetchComplaints();
      showToast('error', 'Update Failed', err.message);
    }
  };

  const counts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Community Complaints</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Shared tracking of colony issues</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Raise Complaint
        </button>
      </div>

      {/* Offline notice */}
      {isOffline && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <WifiOff size={16} className="flex-shrink-0" />
          <span><strong>Demo Mode:</strong> Showing sample data. Connect a valid Supabase key to persist real complaints.</span>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['all', 'pending', 'in_progress', 'resolved'] as Status[]).map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`card p-4 text-center transition-all hover:translate-y-[-2px] ${activeStatus === s ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
          >
            <p className={`text-2xl font-bold ${activeStatus === s ? 'text-blue-600 dark:text-blue-400' : ''}`}>{counts[s]}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize font-medium">{s.replace('_', ' ')}</p>
          </button>
        ))}
      </div>

      {/* Complaints list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(complaint => {
            const cfg = statusConfig[complaint.status as keyof typeof statusConfig] || statusConfig.pending;
            const isExpanded = expandedId === complaint.id;
            const timeAgo = new Date(complaint.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });

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
                    <span className="text-2xl flex-shrink-0">{categoryEmojis[complaint.category] || '📝'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{complaint.title}</p>
                        <span className={`badge ${cfg.color} text-[10px] px-2 py-0.5 flex items-center gap-1 uppercase font-bold tracking-wider`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">
                          {complaint.ticket_no}
                        </span>
                      </div>
                      <p className={`text-xs text-[hsl(var(--muted-foreground))] leading-relaxed ${isExpanded ? '' : 'line-clamp-1'}`}>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-[hsl(var(--muted-foreground))]">
                        <div className="flex flex-col gap-0.5">
                          <span className="uppercase font-bold opacity-50">Reported By</span>
                          <span className="text-foreground font-medium">{complaint.author_name}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="uppercase font-bold opacity-50">Location</span>
                          <span className="text-foreground font-medium">{complaint.flat_no}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="uppercase font-bold opacity-50">Reported At</span>
                          <span className="text-foreground font-medium">{timeAgo}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="uppercase font-bold opacity-50">Category</span>
                          <span className="text-foreground font-medium capitalize">{complaint.category}</span>
                        </div>
                      </div>

                      {isAdmin && complaint.status !== 'resolved' && (
                        <div className="mt-4 flex gap-2 border-t border-[hsl(var(--border))]/30 pt-4">
                          {complaint.status === 'pending' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(complaint.id, 'in_progress'); }}
                              className="btn-secondary text-[10px] py-1.5 px-3 bg-blue-100 text-blue-700 border-blue-200"
                            >
                              Start Working
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(complaint.id, 'resolved'); }}
                            className="btn-primary text-[10px] py-1.5 px-3 bg-green-600 hover:bg-green-700"
                          >
                            Mark Resolved ✓
                          </button>
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
          <div className="card p-16 text-center bg-gradient-to-b from-transparent to-[hsl(var(--muted))]/20">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <p className="font-bold text-xl mb-1">All Clear!</p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm max-w-xs mx-auto">No {activeStatus.replace('_', ' ')} complaints found. Our colony is running smoothly!</p>
          </div>
        )}
      </div>

      {/* Raise Complaint Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="card p-6 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">Raise New Complaint</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Visible to all residents & management</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value as ComplaintCategory }))}
                      className="input-field text-sm"
                    >
                      {['water', 'electricity', 'security', 'maintenance', 'other'].map(c => (
                        <option key={c} value={c}>{categoryEmojis[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Your Identity</label>
                    <div className="input-field text-sm bg-[hsl(var(--muted))] flex items-center gap-2 opacity-70 cursor-not-allowed">
                      <MessageSquare size={14} /> {profile?.full_name || user?.user_metadata?.full_name || 'Guest Resident'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Street light broken near Block 4"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Detailed Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Provide specific details about the issue..."
                    rows={4}
                    required
                    className="input-field resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 font-bold">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader size={16} className="animate-spin" /> Submitting...
                      </span>
                    ) : 'Submit Complaint'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
