import { motion } from 'framer-motion';
import { Bell, Wrench, Vote, CalendarDays, MapPin, UserCheck, Package, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

const quickStats = [
  { label: 'Open Complaints', value: '2', color: 'from-amber-500 to-orange-600', icon: <Wrench size={20} />, link: '/complaints' },
  { label: 'New Notices', value: '3', color: 'from-blue-500 to-indigo-600', icon: <Bell size={20} />, link: '/notices' },
  { label: 'Upcoming Events', value: '2', color: 'from-purple-500 to-violet-600', icon: <CalendarDays size={20} />, link: '/community' },
];

const recentNotices = [
  { id: 1, title: 'Water Supply Interruption', body: 'Water will be cut tomorrow from 10 AM – 2 PM for pipe maintenance.', category: 'urgent', time: '2 hours ago' },
  { id: 2, title: 'Diwali Celebration Planning Meeting', body: 'All residents are invited to join the planning session at the clubhouse at 7 PM.', category: 'event', time: '5 hours ago' },
  { id: 3, title: 'Security Guard Rotation Update', body: 'New guard schedule effective from 20th April. Please check the notice board.', category: 'general', time: '1 day ago' },
];

const categoryColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800',
  event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-800',
  general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-800',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-800',
};

const recentComplaints = [
  { id: 1, title: 'Plumbing Issue in Block 45', status: 'in_progress', time: '2 days ago' },
  { id: 2, title: 'Street Light Out – Near Block 20', status: 'pending', time: '3 days ago' },
];

const statusBadge: Record<string, string> = {
  pending: 'badge-yellow',
  in_progress: 'badge-blue',
  resolved: 'badge-green',
};
const statusLabel: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export function Home() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #7c3aed 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">👋 Welcome back,</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {profile?.full_name || profile?.username || 'Resident'}
            </h1>
            <p className="text-blue-200 flex items-center gap-1.5 mt-1">
              <MapPin size={14} />
              {profile?.flat_no ? `${profile.flat_no}, ` : ''}Sharda Nagar Vistar, Bijnor
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/complaints" className="px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all">
              + New Complaint
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickStats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Link
              to={stat.link}
              className="card p-5 flex items-center gap-3 hover:shadow-md transition-all group cursor-pointer block"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{stat.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Notice Board */}
        <motion.div variants={itemVariants} className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <Bell size={18} />
              </div>
              <h2 className="section-title">Recent Notices</h2>
            </div>
            <Link to="/notices" className="text-sm text-[hsl(var(--primary))] hover:underline font-medium">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentNotices.map(notice => (
              <div key={notice.id} className={`p-3.5 rounded-xl border ${categoryColors[notice.category]} transition-all hover:shadow-sm`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-sm">{notice.title}</p>
                    <p className="text-xs mt-0.5 opacity-80 line-clamp-1">{notice.body}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs opacity-70 whitespace-nowrap flex-shrink-0">
                    <Clock size={10} /> {notice.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Complaints Quick View */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <Wrench size={18} />
              </div>
              <h2 className="section-title">Complaints</h2>
            </div>
            <Link to="/complaints" className="text-sm text-[hsl(var(--primary))] hover:underline font-medium">All →</Link>
          </div>
          <div className="space-y-3">
            {recentComplaints.map(c => (
              <div key={c.id} className="p-3 bg-[hsl(var(--muted))]/50 rounded-xl">
                <p className="font-medium text-sm">{c.title}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`badge text-xs ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{c.time}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/complaints" className="btn-primary w-full mt-4 text-center block">+ Raise Complaint</Link>
        </motion.div>


        {/* Visitor Quick View */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl">
                <UserCheck size={18} />
              </div>
              <h2 className="section-title">Visitor Gate</h2>
            </div>
            <Link to="/visitors" className="text-sm text-[hsl(var(--primary))] hover:underline font-medium">Manage →</Link>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <UserCheck size={16} className="text-green-600 dark:text-green-400" />
              <span className="font-medium">Ramesh Kumar</span>
              <span className="ml-auto text-green-600 dark:text-green-400 text-xs">Arrived 11:30 AM</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Package size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="font-medium">Amazon Package</span>
              <span className="ml-auto text-amber-600 dark:text-amber-400 text-xs">Waiting at gate</span>
            </div>
          </div>
          <Link to="/visitors" className="btn-secondary w-full mt-4 text-center block">Pre-Approve Guest</Link>
        </motion.div>

        {/* Community Polls */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <Vote size={18} />
              </div>
              <h2 className="section-title">Active Poll</h2>
            </div>
            <Link to="/community" className="text-sm text-[hsl(var(--primary))] hover:underline font-medium">Forum →</Link>
          </div>
          <div className="p-4 bg-[hsl(var(--muted))]/50 rounded-2xl">
            <p className="font-semibold text-sm mb-3">Should we add a gym equipment set in the park?</p>
            <div className="space-y-2">
              {[
                { label: 'Yes, definitely!', pct: 68 },
                { label: 'No, not needed', pct: 22 },
                { label: 'Maybe later', pct: 10 },
              ].map((opt, i) => (
                <button key={i} className="w-full text-left group">
                  <div className="flex justify-between text-xs font-medium mb-0.5">
                    <span>{opt.label}</span>
                    <span>{opt.pct}%</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--border))] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${opt.pct}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">47 votes · 5 days left</p>
          </div>
        </motion.div>

        {/* Map & Location */}
        <motion.div variants={itemVariants} className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl">
                <MapPin size={18} />
              </div>
              <h2 className="section-title">Colony Location</h2>
            </div>
            <a
              href="https://share.google/Igs5k6C0Oz4usCdv2"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              Open in Maps →
            </a>
          </div>
          <div className="map-container">
            <iframe
              src="https://maps.google.com/maps?q=Sharda+Nagar+Vistar,+Piyush+Saxena+Road,+Bijnor,+Uttar+Pradesh+226014&output=embed&z=15"
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Sharda Nagar Vistar Location"
            />
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 flex items-center gap-1">
            <MapPin size={14} /> Sharda Nagar Vistar Colony, Piyush Saxena Road, Bijnor, Uttar Pradesh 226014
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}
