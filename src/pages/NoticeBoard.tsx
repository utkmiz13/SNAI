// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Megaphone, AlertTriangle, Calendar, Info, X, ChevronDown, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

type Category = 'all' | 'urgent' | 'general' | 'event' | 'maintenance';

interface Notice {
  id: string;
  title: string;
  body: string;
  category: string;
  author_name: string;
  is_pinned: boolean;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; icon: any; color: string; border: string; bg: string }> = {
  urgent: { label: 'Urgent', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', border: 'border-l-4 border-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
  general: { label: 'General', icon: Info, color: 'text-blue-600 dark:text-blue-400', border: 'border-l-4 border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
  event: { label: 'Event', icon: Calendar, color: 'text-purple-600 dark:text-purple-400', border: 'border-l-4 border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
  maintenance: { label: 'Maintenance', icon: Info, color: 'text-amber-600 dark:text-amber-400', border: 'border-l-4 border-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
};

export function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ title: '', body: '', category: 'general', is_pinned: false });
  const { isAdmin, profile, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotices();
    
    // Subscribe to changes
    const channel = supabase
      .channel('notices_changes')
      .on('postgres_changes', { event: '*', table: 'notices', schema: 'public' }, () => {
        fetchNotices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err: any) {
      console.error('Error fetching notices:', err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('notices').insert({
        title: form.title,
        body: form.body,
        category: form.category,
        is_pinned: form.is_pinned,
        author_name: profile?.full_name || user?.user_metadata?.full_name || 'Admin'
      });

      if (error) throw error;

      showToast('success', 'Notice Posted!', 'Your notice has been published to all residents.');
      setShowAddForm(false);
      setForm({ title: '', body: '', category: 'general', is_pinned: false });
    } catch (err: any) {
      showToast('error', 'Post Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === 'all' ? notices : notices.filter(n => n.category === activeCategory);
  const pinned = filtered.filter(n => n.is_pinned);
  const regular = filtered.filter(n => !n.is_pinned);

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
          <h1 className="page-title">Notice Board</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Stay updated with colony announcements</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap bg-[hsl(var(--muted))]/50 p-1 rounded-2xl w-fit">
        {(['all', 'urgent', 'general', 'event', 'maintenance'] as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeCategory === cat
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {cat === 'all' ? '📋 All' : cat === 'urgent' ? '🚨 Urgent' : cat === 'event' ? '🎉 Events' : cat === 'maintenance' ? '🔧 Maint.' : 'ℹ️ General'}
          </button>
        ))}
      </div>

      {/* Pinned notices */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em] ml-1">
            📌 Pinned Announcements
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinned.map(notice => <NoticeCard key={notice.id} notice={notice} expandedId={expandedId} setExpandedId={setExpandedId} />)}
          </div>
        </div>
      )}

      {/* Regular notices */}
      <div className="space-y-3">
        {pinned.length > 0 && <p className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em] ml-1">Recent Notices</p>}
        {regular.length === 0 && pinned.length === 0 ? (
          <div className="card p-16 text-center border-dashed">
            <Megaphone size={48} className="text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg mb-1">Quiet on the board</p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">No {activeCategory} notices have been posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regular.map(notice => <NoticeCard key={notice.id} notice={notice} expandedId={expandedId} setExpandedId={setExpandedId} />)}
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-6 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Post New Notice</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Title</label>
                  <input 
                    type="text" 
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Brief and catchy title..." 
                    required
                    className="input-field" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Category</label>
                    <select 
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="input-field"
                    >
                      <option value="general">ℹ️ General</option>
                      <option value="urgent">🚨 Urgent</option>
                      <option value="event">🎉 Event</option>
                      <option value="maintenance">🔧 Maintenance</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={form.is_pinned}
                        onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))}
                        className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-offset-0 focus:ring-0" 
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Pin to Top</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Detailed Message</label>
                  <textarea 
                    value={form.body}
                    onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                    placeholder="Provide all relevant details here..." 
                    rows={5} 
                    required
                    className="input-field resize-none" 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 font-bold">
                    {loading ? 'Publishing...' : 'Publish Notice'}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary px-6">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoticeCard({ notice, expandedId, setExpandedId }: { notice: any; expandedId: string | null; setExpandedId: (id: string | null) => void }) {
  const cfg = categoryConfig[notice.category] || categoryConfig.general;
  const Icon = cfg.icon;
  const isExpanded = expandedId === notice.id;
  const dateStr = new Date(notice.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${cfg.border} ${cfg.bg} overflow-hidden cursor-pointer hover:shadow-md transition-all h-fit`}
      onClick={() => setExpandedId(isExpanded ? null : notice.id)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`p-2.5 rounded-2xl ${cfg.bg} ${cfg.color} flex-shrink-0 mt-0.5 border border-white/20 dark:border-white/5`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-bold text-base tracking-tight leading-tight">{notice.title}</p>
                {notice.is_pinned && <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Pinned</span>}
              </div>
              <p className={`text-xs text-[hsl(var(--muted-foreground))] leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                {notice.body}
              </p>
            </div>
          </div>
          <ChevronDown size={18} className={`text-[hsl(var(--muted-foreground))] flex-shrink-0 transition-transform mt-1 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-[hsl(var(--border))]/30 flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))] opacity-50">Published By</span>
                <span className="text-xs font-bold">{notice.author_name}</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))] opacity-50 text-right">Date</span>
                <span className="text-xs font-medium flex items-center gap-1"><Calendar size={10} /> {dateStr}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
