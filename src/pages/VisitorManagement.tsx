import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Plus, X, CheckCircle, Shield, Clock, MapPin, Loader, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

interface Visitor {
  id: string;
  name: string;
  purpose: string;
  type: string;
  status: string;
  time: string;
  otp: string;
  is_pre_approved: boolean;
  host_name: string;
  flat_no: string;
  created_at: string;
}

export function VisitorManagement() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'pre-approve' | 'deliveries'>('log');
  const [showForm, setShowForm] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', date: '', time: '' });
  const { profile, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchVisitors();
    
    const channel = supabase
      .channel('visitors_changes')
      .on('postgres_changes', { event: '*', table: 'visitors', schema: 'public' }, () => {
        fetchVisitors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitors(data || []);
    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setFetching(false);
    }
  };

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handlePreApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const otp = generateOTP();
    
    try {
      const { error } = await supabase.from('visitors').insert({
        user_id: user.id,
        name: form.name,
        purpose: form.purpose,
        type: 'visitor',
        status: 'pending',
        otp: otp,
        is_pre_approved: true,
        host_name: profile?.full_name || user.user_metadata?.full_name || 'Resident',
        flat_no: profile?.flat_no || user.user_metadata?.flat_no || 'Unknown'
      });

      if (error) throw error;

      setGeneratedOTP(otp);
      showToast('success', 'Guest Pre-Approved!', `OTP ${otp} generated.`);
    } catch (err: any) {
      showToast('error', 'Failed to Pre-approve', err.message);
    } finally {
      setLoading(false);
    }
  };

  const deliveries = visitors.filter(v => v.type === 'delivery');
  const guestLog = visitors.filter(v => v.type === 'visitor');

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
          <h1 className="page-title">Visitor Management</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Gate security and guest access</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Pre-Approve Guest
        </button>
      </div>

      {/* Modern Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-black text-green-600 dark:text-green-400">{visitors.filter(v => v.status === 'arrived').length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] mt-1">Inside Colony</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
               <Shield size={20} />
            </div>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{deliveries.filter(d => d.status === 'pending').length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] mt-1">Pending Deliveries</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
               <Smartphone size={20} />
            </div>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{visitors.filter(v => v.is_pre_approved && v.status === 'pending').length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] mt-1">Expected Today</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
               <UserCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[hsl(var(--muted))]/50 rounded-2xl w-fit">
        {([
          { key: 'log', label: 'Gate Log' },
          { key: 'deliveries', label: 'Deliveries' },
          { key: 'pre-approve', label: 'Approved' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.key ? 'bg-[hsl(var(--card))] text-blue-600 shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Areas */}
      <div className="space-y-3">
        {activeTab === 'log' && (
          guestLog.length === 0 ? (
            <div className="card p-20 text-center border-dashed">
              <UserCheck size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold text-lg">Gate log is empty</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">All visitors will be tracked here.</p>
            </div>
          ) : (
            guestLog.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 flex items-center gap-5 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  {entry.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-sm">{entry.name}</p>
                    {entry.is_pre_approved && <span className="bg-green-100 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Pre-approved</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {entry.flat_no}</span>
                    <span className="flex items-center gap-1"><Shield size={10} /> {entry.purpose}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${entry.status === 'arrived' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    {entry.status === 'arrived' ? 'Inside' : entry.status === 'pending' ? 'Expected' : 'Exited'}
                  </span>
                  <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1.5 flex items-center justify-end gap-1">
                    <Clock size={10} /> {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))
          )
        )}

        {activeTab === 'deliveries' && (
          deliveries.length === 0 ? (
             <div className="card p-20 text-center border-dashed">
                <Smartphone size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold text-lg">No active deliveries</p>
             </div>
          ) : (
            deliveries.map(delivery => (
              <div key={delivery.id} className="card p-5 flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 text-2xl">📦</div>
                 <div className="flex-1">
                    <p className="font-black text-sm">{delivery.name}</p>
                    <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{delivery.purpose}</p>
                 </div>
                 <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase">Active</span>
              </div>
            ))
          )
        )}

        {activeTab === 'pre-approve' && (
          <div className="space-y-3">
            {visitors.filter(v => v.is_pre_approved && v.status === 'pending').map(visitor => (
              <div key={visitor.id} className="card p-5 flex items-center gap-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-blue-900/50 flex items-center justify-center text-blue-600 shadow-sm">
                   <UserCheck size={24} />
                </div>
                <div className="flex-1">
                   <p className="font-black text-sm">{visitor.name}</p>
                   <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">{visitor.purpose}</p>
                </div>
                <div className="text-right">
                   <div className="bg-white dark:bg-blue-900 px-3 py-1 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800">
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">Entry Code</p>
                      <p className="text-lg font-black font-mono tracking-widest text-blue-700 dark:text-blue-300">{visitor.otp}</p>
                   </div>
                </div>
              </div>
            ))}
            <div className="card p-10 border-dashed text-center cursor-pointer hover:bg-[hsl(var(--muted))]/50 transition-all group" onClick={() => setShowForm(true)}>
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} className="text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="font-black text-xs uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Pre-Approve Guest</p>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Approve Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowForm(false); setGeneratedOTP(null); }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black tracking-tight">Pre-Approve Guest</h3>
                <button onClick={() => { setShowForm(false); setGeneratedOTP(null); }} className="p-2 hover:bg-[hsl(var(--muted))] rounded-xl"><X size={20} /></button>
              </div>

              {!generatedOTP ? (
                <form onSubmit={handlePreApprove} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2">Guest Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Doe" required className="input-field bg-[hsl(var(--muted))]/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2">Purpose of Visit</label>
                    <select value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className="input-field bg-[hsl(var(--muted))]/30">
                       <option value="Personal Visit">Personal Visit</option>
                       <option value="Delivery">Delivery</option>
                       <option value="Maintenance / Repair">Maintenance / Repair</option>
                       <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2">Visit Date</label>
                      <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required className="input-field bg-[hsl(var(--muted))]/30" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2">Visit Time</label>
                      <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="input-field bg-[hsl(var(--muted))]/30" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">
                    {loading ? <Loader className="animate-spin mx-auto" size={18} /> : 'Generate Secure Code'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={40} />
                  </div>
                  <p className="font-black text-2xl mb-1 tracking-tight">Success!</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-bold uppercase mb-8">Guest is Pre-Approved</p>
                  
                  <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Shield size={100} />
                    </div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mb-3">Security Entry Code</p>
                    <p className="text-6xl font-black tracking-[0.2em] text-white drop-shadow-lg">{generatedOTP}</p>
                    <p className="text-[10px] font-bold text-blue-100 mt-6 bg-white/10 py-2 px-4 rounded-full inline-block">Valid for 24 hours</p>
                  </div>
                  
                  <button
                    onClick={() => { setShowForm(false); setGeneratedOTP(null); }}
                    className="btn-primary w-full mt-8 py-4 font-black text-xs uppercase tracking-widest"
                  >
                    Done & Close
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
