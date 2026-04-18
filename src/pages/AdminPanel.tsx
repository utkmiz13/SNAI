import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, AlertTriangle, Plus, X, Bell, BarChart2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


type AdminTab = 'overview' | 'residents' | 'complaints' | 'notices' | 'analytics';

const RESIDENTS = [
  { id: 1, name: 'Ramesh Kumar', username: 'ramesh_k', flat: 'Block-45 GF', phone: '9876543210', role: 'resident', status: 'active', due: 2500 },
  { id: 2, name: 'Priya Verma', username: 'priya_v', flat: 'Block-22', phone: '9876500001', role: 'resident', status: 'active', due: 1250 },
  { id: 3, name: 'Amit Singh', username: 'amit_s', flat: 'Block-10', phone: '9812345678', role: 'resident', status: 'active', due: 0 },
  { id: 4, name: 'Sunita Gupta', username: 'sunita_g', flat: 'Block-8', phone: '9765432109', role: 'resident', status: 'active', due: 3750 },
  { id: 5, name: 'Mohan Sahu', username: 'mohan_s', flat: 'Block-39 GF', phone: '9654321098', role: 'resident', status: 'active', due: 0 },
  { id: 6, name: 'Vijay Mishra', username: 'vijay_m', flat: 'Block-20 GF', phone: '9543210987', role: 'admin', status: 'active', due: 0 },
];

const STATS = [
  { label: 'Total Residents', value: '124', icon: <Users size={20} />, color: 'from-blue-500 to-blue-600', change: '+3 this month' },
  { label: 'Open Complaints', value: '5', icon: <AlertTriangle size={20} />, color: 'from-amber-500 to-amber-600', change: '2 urgent' },
  { label: 'Resolved This Month', value: '18', icon: <CheckCircle size={20} />, color: 'from-green-500 to-green-600', change: '↑ 20%' },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [showAddResident, setShowAddResident] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const { isAdmin, profile } = useAuth();
  const { showToast } = useToast();

  if (!isAdmin) {
    return (
      <div className="card p-12 text-center">
        <Shield size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-[hsl(var(--muted-foreground))]">You need admin privileges to access this panel. Contact your RWA administrator.</p>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'residents', label: '👥 Residents' },
    { key: 'complaints', label: '🔧 Complaints' },
    { key: 'notices', label: '📢 Notices' },
    { key: 'analytics', label: '📈 Analytics' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="text-[hsl(var(--muted-foreground))]">RWA Management Dashboard — logged in as <strong>{profile?.username}</strong></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddNotice(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Bell size={16} /> Post Notice
          </button>
          <button onClick={() => setShowAddResident(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Resident
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="card p-5 flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center flex-shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{stat.label}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{stat.change}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            


            {/* Complaint Overview */}
            <div className="card p-6">
              <h3 className="section-title mb-4 flex items-center gap-2"><AlertTriangle size={18} /> Complaint Status</h3>
              <div className="space-y-3">
                {[
                  { label: '💧 Water Leakage – Block 45', status: 'In Progress', priority: 'high', assigned: 'Plumber Team' },
                  { label: '⚡ Street Light – Block 20', status: 'Pending', priority: 'medium', assigned: 'Unassigned' },
                  { label: '🔒 Security Gap – Night', status: 'Pending', priority: 'high', assigned: 'Unassigned' },
                  { label: '🔧 Playground – Block 8', status: 'Resolved', priority: 'low', assigned: 'Maintenance' },
                  { label: '🗑️ Garbage – Block 30-40', status: 'Resolved', priority: 'medium', assigned: 'Municipal' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[hsl(var(--muted))]/40 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{c.assigned}</p>
                    </div>
                    <span className={`badge text-xs ${
                      c.status === 'Resolved' ? 'badge-green' : c.status === 'In Progress' ? 'badge-blue' : 'badge-yellow'
                    }`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* RESIDENTS */}
      {activeTab === 'residents' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
          <div className="p-5 border-b border-[hsl(var(--border))] flex justify-between items-center">
            <h3 className="section-title">Resident Directory</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Search resident..." className="input-field text-sm py-1.5 w-48" />
              <button onClick={() => setShowAddResident(true)} className="btn-primary text-sm flex items-center gap-1.5">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/50 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Username</th>
                  <th className="px-5 py-3 text-left">Block/Flat</th>
                  <th className="px-5 py-3 text-left">Phone</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {RESIDENTS.map(r => (
                  <tr key={r.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted))]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {r.name[0]}
                        </div>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[hsl(var(--muted-foreground))]">@{r.username}</td>
                    <td className="px-5 py-4">{r.flat}</td>
                    <td className="px-5 py-4">{r.phone}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${r.role === 'admin' ? 'badge-purple' : 'badge-blue'} capitalize`}>{r.role}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => showToast('info', 'Edit Mode', `Editing ${r.name}`)} className="text-xs text-[hsl(var(--primary))] hover:underline">Edit</button>
                        <button onClick={() => showToast('warning', 'Remove Resident', `Confirm removal of ${r.name}?`)} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* COMPLAINTS */}
      {activeTab === 'complaints' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="card p-4"><p className="text-2xl font-bold text-yellow-600">3</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Pending</p></div>
            <div className="card p-4"><p className="text-2xl font-bold text-blue-600">2</p><p className="text-xs text-[hsl(var(--muted-foreground))]">In Progress</p></div>
            <div className="card p-4"><p className="text-2xl font-bold text-green-600">18</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Resolved</p></div>
          </div>
          {[
            { title: '💧 Water Leakage – Block 45', reporter: 'Ramesh Kumar', status: 'in_progress', priority: '🔴 High', age: '2 days' },
            { title: '⚡ Street Light Out – Block 20', reporter: 'Priya Verma', status: 'pending', priority: '🟡 Medium', age: '3 days' },
            { title: '🔒 Security Guard Absent', reporter: 'Amit Singh', status: 'pending', priority: '🔴 High', age: '5 days' },
          ].map((c, i) => (
            <div key={i} className="card p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{c.title}</p>
                <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  <span>By: {c.reporter}</span>
                  <span>{c.priority}</span>
                  <span>Age: {c.age}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge text-xs ${c.status === 'in_progress' ? 'badge-blue' : 'badge-yellow'}`}>
                  {c.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </span>
                <button onClick={() => showToast('success', 'Complaint Resolved!', c.title)} className="btn-primary text-xs py-1 px-3">
                  Resolve ✓
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* NOTICES */}
      {activeTab === 'notices' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddNotice(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Post New Notice
            </button>
          </div>
          {[
            { title: 'Water Supply Interruption', category: 'urgent', author: 'RWA Secretary', time: '2 hours ago', views: 82 },
            { title: 'Diwali Celebration Planning', category: 'event', author: 'Community Leader', time: '5 hours ago', views: 65 },
            { title: 'Maintenance Fee Reminder', category: 'maintenance', author: 'Treasurer', time: '2 days ago', views: 124 },
          ].map((n, i) => (
            <div key={i} className="card p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{n.title}</p>
                  <span className={`badge text-xs ${n.category === 'urgent' ? 'badge-red' : n.category === 'event' ? 'badge-purple' : 'badge-yellow'}`}>
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">By {n.author} · {n.time} · 👁️ {n.views} views</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                <button onClick={() => showToast('info', 'Deleted', n.title)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ANALYTICS */}
      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="section-title mb-4 flex items-center gap-2"><BarChart2 size={18} /> Complaint Trends (Last 6 Months)</h3>
              <div className="space-y-3">
                {[
                  { month: 'Nov', count: 8 }, { month: 'Dec', count: 5 },
                  { month: 'Jan', count: 12 }, { month: 'Feb', count: 7 },
                  { month: 'Mar', count: 10 }, { month: 'Apr', count: 5 },
                ].map(d => (
                  <div key={d.month} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-8 text-[hsl(var(--muted-foreground))]">{d.month}</span>
                    <div className="flex-1 h-5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${(d.count / 12) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold w-4">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
            

          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">🔧 Complaint Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {[
                { cat: '💧 Water', count: 8, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
                { cat: '⚡ Electricity', count: 6, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
                { cat: '🔒 Security', count: 4, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
                { cat: '🔧 Maintenance', count: 12, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
                { cat: '📝 Other', count: 3, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400' },
              ].map((c, i) => (
                <div key={i} className={`p-4 rounded-xl ${c.color}`}>
                  <p className="text-2xl font-bold">{c.count}</p>
                  <p className="text-xs font-medium mt-1">{c.cat}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Resident Modal */}
      {showAddResident && (
        <div className="modal-overlay" onClick={() => setShowAddResident(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">Add New Resident</h3>
              <button onClick={() => setShowAddResident(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="input-field" />
              <input type="text" placeholder="Username" className="input-field" />
              <input type="text" placeholder="Block/Flat Number" className="input-field" />
              <input type="tel" placeholder="Phone Number" className="input-field" />
              <input type="email" placeholder="Email Address" className="input-field" />
              <select className="input-field">
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => { showToast('success', 'Resident Added!', 'Welcome email sent.'); setShowAddResident(false); }} className="btn-primary flex-1">
                  Add Resident
                </button>
                <button onClick={() => setShowAddResident(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Post Notice Modal */}
      {showAddNotice && (
        <div className="modal-overlay" onClick={() => setShowAddNotice(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">Post Notice</h3>
              <button onClick={() => setShowAddNotice(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Notice title" className="input-field" />
              <select className="input-field">
                <option>Urgent</option>
                <option>General</option>
                <option>Event</option>
                <option>Maintenance</option>
              </select>
              <textarea placeholder="Notice details..." rows={4} className="input-field resize-none" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Pin this notice (show at top)</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => { showToast('success', 'Notice Posted!', 'All residents will be notified.'); setShowAddNotice(false); }} className="btn-primary flex-1">
                  Publish Notice
                </button>
                <button onClick={() => setShowAddNotice(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
