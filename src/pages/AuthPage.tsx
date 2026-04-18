// @ts-nocheck
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, MapPin, Building, Phone, User, Mail, Lock, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { signIn, signUp, loginAsGuest } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    flatNo: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(form.email, form.password);
        if (error) {
          showToast('error', 'Login Failed', error.message);
        } else {
          showToast('success', 'Welcome back!', 'You are now logged in.');
          navigate('/');
        }
      } else {
        if (!form.username.trim() || !form.fullName.trim() || !form.flatNo.trim()) {
          showToast('error', 'Missing Information', 'Please fill all required fields.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(form.email, form.password, form.username, form.fullName, form.flatNo, form.phone);
        if (error) {
          showToast('error', 'Sign Up Failed', error.message);
        } else {
          showToast('success', 'Account Created!', 'Welcome to Sharda Nagar Vistar community.');
          navigate('/');
        }
      }
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl mb-4 border border-white/30">
              S
            </div>
            <h1 className="text-4xl font-bold mb-2">Sharda Nagar Vistar</h1>
            <p className="text-blue-100 text-lg">Your Community. Simplified.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <MapPin size={20} className="text-blue-200 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sharda Nagar Vistar Colony</p>
                <p className="text-blue-200 text-sm">Piyush Saxena Road, Bijnor, Uttar Pradesh 226014</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Building size={16} />, text: 'Notice Board' },
                { icon: <Users size={16} />, text: 'Community Forum' },
                { icon: <Phone size={16} />, text: 'AI Assistant' },
                { icon: <MapPin size={16} />, text: 'Visitor Management' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-white/10 rounded-xl text-sm border border-white/20">
                  <span className="text-blue-200">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <p className="text-blue-200 text-sm">
              🏡 Manage your community, pay dues, raise complaints, and stay connected — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3">S</div>
            <h2 className="text-2xl font-bold">Sharda Nagar Vistar</h2>
            <p className="text-[hsl(var(--muted-foreground))]">Community SuperApp</p>
          </div>

          <div className="card p-8">
            {/* Mode Tabs */}
            <div className="flex bg-[hsl(var(--muted))] rounded-xl p-1 mb-6">
              {(['login', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    mode === m 
                      ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm' 
                      : 'text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Username <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="text"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          placeholder="your_username"
                          required
                          pattern="[a-zA-Z0-9_]+"
                          className="input-field pl-10"
                        />
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Only letters, numbers, underscores. This is your unique ID.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Your Full Name"
                          required
                          className="input-field pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Flat / Block No. <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                          <input
                            type="text"
                            name="flatNo"
                            value={form.flatNo}
                            onChange={handleChange}
                            placeholder="e.g. Block-45"
                            required
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Phone</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+91 98765..."
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="input-field pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Your account will be for <strong>Sharda Nagar Vistar Colony</strong> residents only. 
                      Please provide your correct flat/block number.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign In to Community' : 'Join the Community'
                  )}
                </button>

                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                  {mode === 'login' ? "Don't have an account? " : "Already a member? "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-[hsl(var(--primary))] font-medium hover:underline"
                  >
                    {mode === 'login' ? 'Create Account' : 'Sign In'}
                  </button>
                </p>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[hsl(var(--border))]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast('info', 'Demo Mode', 'Logging in as Guest Admin');
                    loginAsGuest();
                    navigate('/');
                  }}
                  className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  <User size={16} /> Enter as Guest (Demo)
                </button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
