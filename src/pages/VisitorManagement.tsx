import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Plus, X, CheckCircle, Key, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VISITOR_LOG = [
  { id: 1, name: 'Ramesh Kumar', purpose: 'Visiting family', type: 'visitor', status: 'arrived', time: '11:30 AM', otp: '482910', preApproved: true, host: 'Block-45' },
  { id: 2, name: 'Amazon Delivery Boy', purpose: 'Package delivery', type: 'delivery', status: 'arrived', time: '10:15 AM', courier: 'Amazon', preApproved: false },
  { id: 3, name: 'Swiggy Delivery', purpose: 'Food delivery', type: 'delivery', status: 'exited', time: '9:45 AM', courier: 'Swiggy', preApproved: false },
  { id: 4, name: 'Dr. Priya Sharma', purpose: 'Medical visit', type: 'visitor', status: 'exited', time: 'Yesterday 4 PM', otp: '771234', preApproved: true, host: 'Block-12' },
  { id: 5, name: 'Zomato Delivery', purpose: 'Food delivery', type: 'delivery', status: 'exited', time: 'Yesterday 1 PM', courier: 'Zomato', preApproved: false },
];

export function VisitorManagement() {
  const [activeTab, setActiveTab] = useState<'log' | 'pre-approve' | 'deliveries'>('log');
  const [showForm, setShowForm] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', date: '', time: '' });
  useAuth();
  const { showToast } = useToast();

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handlePreApprove = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = generateOTP();
    setGeneratedOTP(otp);
    showToast('success', 'Guest Pre-Approved!', `OTP ${otp} generated. Share with your guest.`);
  };

  const deliveries = VISITOR_LOG.filter(v => v.type === 'delivery');
  const visitors = VISITOR_LOG.filter(v => v.type === 'visitor');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Visitor & Gate Management</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Track visitors, pre-approve guests, manage deliveries</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Pre-Approve Guest
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{VISITOR_LOG.filter(v => v.status === 'arrived').length}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Currently Inside</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{deliveries.filter(d => d.status === 'arrived').length}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Pending Deliveries</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{visitors.filter(v => v.preApproved).length}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Pre-Approved</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[hsl(var(--border))] pb-2">
        {([
          { key: 'log', label: '📋 Gate Log' },
          { key: 'deliveries', label: '📦 Deliveries' },
          { key: 'pre-approve', label: '✅ Pre-Approved' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gate Log */}
      {activeTab === 'log' && (
        <div className="space-y-3">
          {VISITOR_LOG.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4 flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                entry.type === 'delivery' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {entry.type === 'delivery' ? '📦' : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{entry.name}</p>
                  {entry.preApproved && <span className="badge badge-green text-xs">Pre-approved</span>}
                  {entry.courier && <span className="badge badge-yellow text-xs">{entry.courier}</span>}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{entry.purpose} {entry.host && `· Host: ${entry.host}`}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`badge text-xs ${entry.status === 'arrived' ? 'badge-green' : 'badge-blue'}`}>
                  {entry.status === 'arrived' ? '🟢 Inside' : '✓ Exited'}
                </span>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{entry.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Deliveries */}
      {activeTab === 'deliveries' && (
        <div className="space-y-3">
          {deliveries.map(delivery => (
            <motion.div
              key={delivery.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card p-4 ${delivery.status === 'arrived' ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10' : ''}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">📦</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{delivery.courier} Delivery</p>
                    {delivery.status === 'arrived' && (
                      <span className="badge badge-yellow">Waiting at Gate</span>
                    )}
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Arrived: {delivery.time}</p>
                </div>
                {delivery.status === 'arrived' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => showToast('info', 'Notified!', 'Security has been asked to keep the package.')}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Hold Package
                    </button>
                    <button
                      onClick={() => showToast('success', 'Collected!', 'Package marked as collected.')}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Mark Collected
                    </button>
                  </div>
                )}
                {delivery.status === 'exited' && (
                  <CheckCircle size={20} className="text-green-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pre-Approved */}
      {activeTab === 'pre-approve' && (
        <div className="space-y-3">
          {visitors.filter(v => v.preApproved).map(visitor => (
            <motion.div
              key={visitor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">
                <UserCheck size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{visitor.name}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{visitor.purpose}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Key size={14} className="text-[hsl(var(--muted-foreground))]" />
                  <span className="font-mono font-bold text-sm">{visitor.otp}</span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{visitor.time}</p>
              </div>
            </motion.div>
          ))}
          <div className="card p-6 border-dashed text-center cursor-pointer hover:bg-[hsl(var(--muted))]/50 transition-colors" onClick={() => setShowForm(true)}>
            <Plus size={24} className="text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
            <p className="font-medium text-sm">Pre-Approve New Guest</p>
          </div>
        </div>
      )}

      {/* Pre-Approve Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="modal-overlay" onClick={() => { setShowForm(false); setGeneratedOTP(null); }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title">Pre-Approve Guest</h3>
                <button onClick={() => { setShowForm(false); setGeneratedOTP(null); }}><X size={20} /></button>
              </div>

              {!generatedOTP ? (
                <form onSubmit={handlePreApprove} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Guest Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Guest Phone (optional)</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765..." className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Purpose of Visit</label>
                    <input type="text" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} placeholder="e.g. Family visit, Repair work..." required className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Expected Date</label>
                      <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Expected Time</label>
                      <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full">Generate OTP & Pre-Approve</button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <p className="font-semibold text-lg mb-1">Guest Pre-Approved!</p>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">{form.name} is cleared for entry.</p>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Shield size={16} className="text-blue-500" />
                      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Entry OTP</p>
                    </div>
                    <p className="text-5xl font-bold tracking-widest text-blue-700 dark:text-blue-300">{generatedOTP}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Valid for 24 hours. Share with your guest.</p>
                  </div>
                  <button
                    onClick={() => { setShowForm(false); setGeneratedOTP(null); }}
                    className="btn-primary w-full mt-4"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
