// @ts-nocheck
// @ts-nocheck
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Moon, Sun, Home, Bot, Image as ImageIcon, Settings, Bell, 
  ShieldAlert, Menu, X, ChevronDown, LogOut, User,
  Megaphone, Wrench, ShoppingBag, 
  FileText, UserCheck, MessageSquare, Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string;
  user_id?: string;
  created_at: string;
}

const navItems = [
  { path: '/', icon: <Home size={18} />, label: 'Dashboard' },
  { path: '/notices', icon: <Megaphone size={18} />, label: 'Notices' },
  { path: '/complaints', icon: <Wrench size={18} />, label: 'Complaints' },
  { path: '/visitors', icon: <UserCheck size={18} />, label: 'Visitors' },
  { path: '/community', icon: <MessageSquare size={18} />, label: 'Community' },
  { path: '/services', icon: <ShoppingBag size={18} />, label: 'Services' },
  { path: '/documents', icon: <FileText size={18} />, label: 'Documents' },
  { path: '/ai', icon: <Bot size={18} />, label: 'AI Assistant' },
  { path: '/gallery', icon: <ImageIcon size={18} />, label: 'Gallery' },
];

const adminNavItems = [
  { path: '/admin', icon: <Settings size={18} />, label: 'Admin Panel' },
];

export function Layout() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { profile, user, signOut, isAdmin } = useAuth();
  const { showToast } = useToast();
  
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Resident';
  const displayUsername = profile?.username || user?.user_metadata?.username || 'User';
  const displayFlat = profile?.flat_no || user?.user_metadata?.flat_no;
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to notifications
      const channel = supabase
        .channel('public_notifications')
        .on('postgres_changes' as any, { event: 'INSERT', table: 'notifications', schema: 'public' }, (payload: any) => {
          const newNotif = payload.new as Notification;
          if (!newNotif.user_id || newNotif.user_id === user.id) {
            setNotifications(prev => [newNotif, ...prev]);
            showToast('info', newNotif.title, newNotif.message);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user || user.id.startsWith('00000000')) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSOS = () => {
    alert('🚨 EMERGENCY SOS SENT!\n\nAlerted:\n• Society Security\n• Colony Leader\n• Nearest Help\n\nHelp is on the way!');
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors duration-300 flex flex-col">
      
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 w-full glass border-b border-[hsl(var(--border))] shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                S
              </div>
              <div className="hidden sm:block">
                <p className="font-black text-sm tracking-tight leading-tight uppercase">Sharda Nagar</p>
                <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] leading-tight tracking-[0.1em] uppercase">Vistar SuperApp</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {allNavItems.slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive(item.path)
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => { setNotifMenuOpen(!notifMenuOpen); setProfileMenuOpen(false); }}
                  className={`relative p-2.5 rounded-2xl transition-all ${notifMenuOpen ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-[hsl(var(--muted))]'}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[hsl(var(--background))] animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 card shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                        <h4 className="font-bold text-sm">Notifications</h4>
                        <span className="text-[10px] font-black uppercase text-blue-500">{unreadCount} New</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <Bell size={32} className="mx-auto mb-3 opacity-10" />
                            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">All caught up!</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => { if (!n.is_read) markAsRead(n.id); if (n.link) navigate(n.link); setNotifMenuOpen(false); }}
                              className={`p-4 border-b border-[hsl(var(--border))]/50 cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors ${!n.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                              <div className="flex justify-between gap-2">
                                <p className={`text-sm ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                                {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-2 flex items-center gap-1 uppercase font-bold tracking-wider">
                                <Clock size={8} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-2 bg-[hsl(var(--muted))]/30 text-center">
                           <button className="text-[10px] font-bold text-blue-500 uppercase hover:underline">Clear All</button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile menu */}
              <div className="relative">
                <button
                  onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifMenuOpen(false); }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-[hsl(var(--muted))] transition-colors border border-transparent hover:border-[hsl(var(--border))]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-blue-500/20">
                    {displayName[0] || 'U'}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-xs font-black truncate max-w-[100px]">{displayUsername}</span>
                    <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{isAdmin ? 'Admin' : 'Resident'}</span>
                  </div>
                  <ChevronDown size={14} className={`text-[hsl(var(--muted-foreground))] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-64 card shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <p className="font-black text-sm">{displayName}</p>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">@{displayUsername}</p>
                        <div className="flex items-center gap-2 mt-3 p-2 bg-white/10 rounded-xl backdrop-blur-md">
                          <Home size={14} className="text-blue-200" />
                          <p className="text-[10px] font-bold">{displayFlat || 'Sharda Nagar Vistar'}</p>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all"
                        >
                          <User size={16} className="text-blue-500" /> My Profile
                        </Link>
                        <button
                          onClick={() => { toggleDarkMode(); setProfileMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all w-full text-left"
                        >
                          {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-blue-500" />}
                          {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <div className="h-px bg-[hsl(var(--border))]/50 my-1 mx-2" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all w-full text-left"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-2xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] shadow-inner overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 p-4">
                {allNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl text-[10px] font-bold transition-all ${
                      isActive(item.path)
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="p-4 pt-0">
                <button 
                  onClick={() => { handleSOS(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500 text-white font-black text-xs shadow-lg shadow-red-500/30 uppercase tracking-widest"
                >
                  <ShieldAlert size={18} /> Send SOS Emergency
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-2 sticky top-24 self-start">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 translate-x-1'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:translate-x-1'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-[hsl(var(--border))]/50">
               <button 
                onClick={handleSOS}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <ShieldAlert size={18} />
                <span>Emergency SOS</span>
              </button>
            </div>
          </aside>

          {/* Page Content */}
          <div className="lg:col-span-9 xl:col-span-10">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar (Alternative Nav) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
        <div className="glass shadow-2xl rounded-3xl border border-white/20 dark:border-white/5 p-2 flex items-center justify-around">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded-2xl transition-all ${
                isActive(item.path) ? 'bg-blue-500 text-white' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              {item.icon}
            </Link>
          ))}
          <button onClick={() => setMobileMenuOpen(true)} className="p-3 text-[hsl(var(--muted-foreground))]">
            <Menu size={18} />
          </button>
        </div>
      </div>

      <footer className="mt-auto border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Sharda Nagar Vistar Resident Welfare Association</p>
            <div className="flex items-center gap-6">
              <Link to="/profile" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
              <Link to="/community" className="hover:text-blue-500 transition-colors">Colony Bylaws</Link>
              <span className="text-foreground">Made with ❤️ by Utkarsh</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Click outside to close */}
      {(profileMenuOpen || notifMenuOpen) && (
        <div className="fixed inset-0 z-30" onClick={() => { setProfileMenuOpen(false); setNotifMenuOpen(false); }} />
      )}

    </div>
  );
}
