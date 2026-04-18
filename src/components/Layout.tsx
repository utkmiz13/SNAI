import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Moon, Sun, Home, Bot, Image as ImageIcon, Settings, Bell, 
  ShieldAlert, Menu, X, ChevronDown, LogOut, User,
  Megaphone, Wrench, ShoppingBag, 
  FileText, UserCheck, MessageSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sosPressed, setSosPressed] = useState(false);

  const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSOS = () => {
    setSosPressed(true);
    setTimeout(() => setSosPressed(false), 2000);
    alert('🚨 EMERGENCY SOS SENT!\n\nAlerted:\n• Society Security: +91-XXXXX\n• Colony Leader\n• Nearest Hospital\n\nHelp is on the way!');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors duration-300">
      
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 w-full glass border-b border-[hsl(var(--border))] shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                S
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-base leading-tight">Sharda Nagar Vistar</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-tight">Community SuperApp</p>
              </div>
            </Link>

            {/* Desktop Nav - main items only (horizontal scroll) */}
            <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto max-w-2xl">
              {allNavItems.slice(0, 6).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* More dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-all"
                >
                  More <ChevronDown size={14} />
                </button>
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors">
                <Bell size={20} />
                <span className="notif-dot"></span>
              </button>

              {/* Dark mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* SOS */}
              <button
                onClick={handleSOS}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                  sosPressed 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                }`}
              >
                <ShieldAlert size={16} />
                SOS
              </button>

              {/* Profile menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.[0] || profile?.username?.[0] || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                    {profile?.username || 'User'}
                  </span>
                  <ChevronDown size={14} className="text-[hsl(var(--muted-foreground))]" />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 card shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-[hsl(var(--border))]">
                        <p className="font-semibold text-sm">{profile?.full_name || 'Resident'}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">@{profile?.username}</p>
                        {profile?.flat_no && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Flat: {profile.flat_no}</p>
                        )}
                        {isAdmin && (
                          <span className="badge badge-blue mt-1">Admin</span>
                        )}
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[hsl(var(--muted))] text-sm transition-colors"
                        >
                          <User size={16} /> My Profile
                        </Link>
                        <button
                          onClick={() => { toggleDarkMode(); setProfileMenuOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[hsl(var(--muted))] text-sm transition-colors w-full text-left"
                        >
                          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                          {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm transition-colors w-full text-left"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <div className="grid grid-cols-3 gap-1 p-3">
                {allNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => { handleSOS(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                >
                  <ShieldAlert size={18} />
                  <span>SOS</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SECONDARY NAV for more items (desktop) */}
      <div className="hidden xl:block sticky top-16 z-30 glass border-b border-[hsl(var(--border))]">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center gap-1 py-1">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Click outside handler */}
      {profileMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] mt-auto">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <p>© {new Date().getFullYear()} Sharda Nagar Vistar RWA – Piyush Saxena Road, Bijnor, UP 226014</p>
            <p>Made by Utkarsh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
