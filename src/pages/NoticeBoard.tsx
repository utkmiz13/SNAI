import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Plus, Clock, Megaphone, AlertTriangle, Calendar, Info, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type Category = 'all' | 'urgent' | 'general' | 'event' | 'maintenance';

const notices = [
  { id: 1, title: 'Water Supply Interruption', body: 'Water supply will be interrupted tomorrow (18th April) from 10:00 AM to 2:00 PM for routine pipeline maintenance. Please store water accordingly. We apologize for the inconvenience.', category: 'urgent', author: 'RWA Secretary', time: '2 hours ago', pinned: true },
  { id: 2, title: 'Diwali Celebration Meeting', body: 'All residents are warmly invited to attend the Diwali celebration planning meeting at the Community Hall on 20th April at 7:00 PM. Refreshments will be provided. Your suggestions are welcome!', category: 'event', author: 'Community Leader', time: '5 hours ago', pinned: false },
  { id: 3, title: 'Security Guard Updated Duty Schedule', body: 'The new security guard duty schedule is effective from 20th April 2026. Gate timings and contact numbers have been updated. Please cooperate with the guards and always carry your resident ID.', category: 'general', author: 'Security Committee', time: '1 day ago', pinned: false },
  { id: 4, title: 'Society Maintenance Fee – April 2026', body: 'This is a reminder that the monthly maintenance fee of ₹1,250 is due for April 2026. Please pay by 25th April to avoid a late fee. UPI payments are accepted through the app.', category: 'maintenance', author: 'Treasurer', time: '2 days ago', pinned: false },
  { id: 5, title: 'Cleanliness Drive – Sunday 21st April', body: 'The Sharda Nagar Vistar cleanliness drive is scheduled for Sunday, 21st April from 7:00 AM. All residents are encouraged to participate. Bring gloves and cleaning material. Together we can make our colony beautiful!', category: 'event', author: 'RWA President', time: '3 days ago', pinned: false },
  { id: 6, title: 'New Parking Rules Effective Immediately', body: 'As per the RWA meeting decision, all vehicles must be parked in designated spots only. Unauthorized parking in common areas will result in a ₹500 fine. Please cooperate.', category: 'general', author: 'RWA Committee', time: '4 days ago', pinned: false },
];

const categoryConfig: Record<string, { label: string; icon: any; color: string; border: string; bg: string }> = {
  urgent: { label: 'Urgent', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', border: 'border-l-4 border-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
  general: { label: 'General', icon: Info, color: 'text-blue-600 dark:text-blue-400', border: 'border-l-4 border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
  event: { label: 'Event', icon: Calendar, color: 'text-purple-600 dark:text-purple-400', border: 'border-l-4 border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
  maintenance: { label: 'Maintenance', icon: Info, color: 'text-amber-600 dark:text-amber-400', border: 'border-l-4 border-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
};

export function NoticeBoard() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const filtered = activeCategory === 'all' ? notices : notices.filter(n => n.category === activeCategory);
  const pinned = filtered.filter(n => n.pinned);
  const regular = filtered.filter(n => !n.pinned);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Stay updated with colony announcements</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-[hsl(var(--muted-foreground))]" />
        {(['all', 'urgent', 'general', 'event', 'maintenance'] as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              activeCategory === cat
                ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            {cat === 'all' ? '📋 All' : cat === 'urgent' ? '🚨 Urgent' : cat === 'event' ? '🎉 Events' : cat === 'maintenance' ? '🔧 Maintenance' : 'ℹ️ General'}
          </button>
        ))}
      </div>

      {/* Pinned notices */}
      {pinned.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            📌 Pinned
          </p>
          <div className="space-y-3">
            {pinned.map(notice => <NoticeCard key={notice.id} notice={notice} expandedId={expandedId} setExpandedId={setExpandedId} />)}
          </div>
        </div>
      )}

      {/* Regular notices */}
      <div>
        {pinned.length > 0 && <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">All Notices</p>}
        {regular.length === 0 && pinned.length === 0 ? (
          <div className="card p-12 text-center">
            <Megaphone size={48} className="text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
            <p className="font-semibold text-lg mb-1">No notices found</p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">No {activeCategory} notices at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regular.map(notice => <NoticeCard key={notice.id} notice={notice} expandedId={expandedId} setExpandedId={setExpandedId} />)}
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">Post New Notice</h3>
              <button onClick={() => setShowAddForm(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input type="text" placeholder="Notice title..." className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select className="input-field">
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="event">Event</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <textarea placeholder="Write notice details..." rows={4} className="input-field resize-none" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { showToast('success', 'Notice Posted!', 'Your notice has been published.'); setShowAddForm(false); }}
                  className="btn-primary flex-1"
                >
                  Publish Notice
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function NoticeCard({ notice, expandedId, setExpandedId }: { notice: any; expandedId: number | null; setExpandedId: (id: number | null) => void }) {
  const cfg = categoryConfig[notice.category] || categoryConfig.general;
  const Icon = cfg.icon;
  const isExpanded = expandedId === notice.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${cfg.border} ${cfg.bg} overflow-hidden cursor-pointer hover:shadow-md transition-all`}
      onClick={() => setExpandedId(isExpanded ? null : notice.id)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.color} flex-shrink-0 mt-0.5`}>
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{notice.title}</p>
                {notice.pinned && <span className="badge badge-blue text-xs">📌 Pinned</span>}
                <span className={`badge text-xs ${
                  notice.category === 'urgent' ? 'badge-red' :
                  notice.category === 'event' ? 'badge-purple' :
                  notice.category === 'maintenance' ? 'badge-yellow' : 'badge-blue'
                }`}>{cfg.label}</span>
              </div>
              <p className={`text-xs mt-1 text-[hsl(var(--muted-foreground))] ${isExpanded ? '' : 'line-clamp-1'}`}>
                {notice.body}
              </p>
            </div>
          </div>
          <ChevronDown size={16} className={`text-[hsl(var(--muted-foreground))] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]/50 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>By: <strong>{notice.author}</strong></span>
            <span className="flex items-center gap-1"><Clock size={10} /> {notice.time}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
