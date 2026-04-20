// @ts-nocheck
import { motion } from 'framer-motion';
import { ShieldAlert, Phone, Truck, Shield, Flame, Activity, Clock, MapPin, User, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMERGENCY_SERVICES = [
  { name: 'Ambulance', number: '108', icon: <Truck className="text-red-500" />, desc: 'Medical Emergencies' },
  { name: 'Police', number: '100', icon: <Shield className="text-blue-500" />, desc: 'Security & Crime' },
  { name: 'Fire Brigade', number: '101', icon: <Flame className="text-orange-500" />, desc: 'Fire Emergencies' },
  { name: 'Nearby Hospital', number: '0522-1234567', icon: <Activity className="text-green-500" />, desc: 'General Hospital' },
  { name: 'Security Gate', number: '9000011111', icon: <ShieldAlert className="text-indigo-500" />, desc: 'Main Gate Guard' },
];

const SOS_LOGS = [
  { date: '20-04-2026', time: '10:15 AM', name: 'Rahul Sharma', type: 'Medical', status: 'Resolved' },
  { date: '20-04-2026', time: '02:40 PM', name: 'Neha Gupta', type: 'Emergency', status: 'Pending' },
  { date: '19-04-2026', time: '08:30 PM', name: 'Priya Verma', type: 'Security Alert', status: 'Resolved' },
];

const SAMPLE_RESIDENTS = [
  { name: 'Rahul Sharma', flat: 'A-101', phone: '9876543210', blood: 'B+', notes: 'Asthma Patient' },
  { name: 'Priya Verma', flat: 'B-203', phone: '8765432109', blood: 'O+', notes: 'Senior Citizen Home' },
  { name: 'Amit Singh', flat: 'C-305', phone: '7654321098', blood: 'A+', notes: '—' },
  { name: 'Neha Gupta', flat: 'A-402', phone: '6543210987', blood: 'AB+', notes: 'Pregnant' },
  { name: 'Rohan Das', flat: 'D-110', phone: '9123456789', blood: 'O-', notes: 'Diabetic' },
];

export function Emergency() {
  const { profile, user } = useAuth();

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <ShieldAlert size={32} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">SOS Emergency Hub</h1>
              <p className="text-red-100 font-medium">Immediate help for Sharda Nagar residents</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
             <button className="px-6 py-3 bg-white text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
               Activate SOS Alert
             </button>
             <div className="px-4 py-3 bg-red-800/30 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
               <MapPin size={16} />
               <span className="text-xs font-bold">Location: Sector 12, Green Valley Residency</span>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Services */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h3 className="section-title mb-4 flex items-center gap-2"><Phone size={18} /> Quick Dial Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EMERGENCY_SERVICES.map((service, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  className="card p-5 flex items-center justify-between group cursor-pointer hover:border-red-500/50 transition-all"
                  onClick={() => handleCall(service.number)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">{service.name}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold uppercase">{service.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-red-600 dark:text-red-400">{service.number}</p>
                    <p className="text-[9px] font-black text-blue-500 uppercase">Click to call</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="section-title mb-4 flex items-center gap-2"><Clock size={18} /> Recent Alert Logs</h3>
            <div className="card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[hsl(var(--muted))]/50 text-[10px] uppercase font-black text-[hsl(var(--muted-foreground))]">
                  <tr>
                    <th className="px-6 py-4">Resident</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]/50">
                  {SOS_LOGS.map((log, i) => (
                    <tr key={i} className="hover:bg-[hsl(var(--muted))]/20 transition-colors">
                      <td className="px-6 py-4 font-bold">{log.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-[10px] font-black rounded-lg uppercase">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">{log.date} | {log.time}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase ${log.status === 'Resolved' ? 'text-green-500' : 'text-amber-500'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Your Info & Residents */}
        <div className="space-y-6">
          <section>
            <h3 className="section-title mb-4 flex items-center gap-2"><User size={18} /> My Emergency Info</h3>
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-800">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                    {profile?.full_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase">{profile?.full_name || 'Resident Name'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Flat: {profile?.flat_no || 'Not Set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-[hsl(var(--card))] rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                    <p className="text-[9px] font-black uppercase text-blue-500 mb-1 flex items-center gap-1">
                      <Heart size={10} /> Blood Group
                    </p>
                    <p className="text-lg font-black text-red-600">B+</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[hsl(var(--card))] rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                    <p className="text-[9px] font-black uppercase text-blue-500 mb-1 flex items-center gap-1">
                      <Phone size={10} /> SOS Contact
                    </p>
                    <p className="text-sm font-black">9123456780</p>
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-[hsl(var(--card))] rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                  <p className="text-[9px] font-black uppercase text-blue-500 mb-1">Medical Notes</p>
                  <p className="text-xs font-bold leading-relaxed">Asthma Patient. Keeps inhaler in bedside drawer.</p>
                </div>
                <button className="w-full btn-secondary text-xs font-bold py-2.5">Update Info</button>
              </div>
            </div>
          </section>

          <section>
            <h3 className="section-title mb-4">👥 High-Priority List</h3>
            <div className="space-y-3">
              {SAMPLE_RESIDENTS.map((r, i) => (
                <div key={i} className="card p-3 flex items-center justify-between gap-3 hover:bg-[hsl(var(--muted))]/10 transition-all border-l-4 border-l-red-500">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase truncate">{r.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 rounded uppercase">{r.flat}</span>
                      <span className="text-[9px] font-black text-red-600 uppercase">{r.blood}</span>
                    </div>
                  </div>
                  <button onClick={() => handleCall(r.phone)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    <Phone size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
