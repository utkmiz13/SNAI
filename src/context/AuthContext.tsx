// @ts-nocheck
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string, fullName: string, flatNo: string, phone: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loginAsGuest: () => void;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const loginAsGuest = useCallback(() => {
    const mockUser = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@example.com' };
    const mockProfile: Profile = {
      id: '00000000-0000-0000-0000-000000000000',
      username: 'guest_user',
      full_name: 'Guest Resident',
      flat_no: 'Block-G',
      phone: '9999999999',
      role: 'admin', // Make them admin so they can test everything
      created_at: new Date().toISOString()
    };
    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem('isGuest', 'true');
  }, []);

  useEffect(() => {
    if (localStorage.getItem('isGuest')) {
      loginAsGuest();
      setLoading(false);
      return;
    }

    let mounted = true;

    // Safety timeout: if Supabase doesn't respond in 2.5 seconds, show the app anyway
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth session timeout: Switching to offline-first mode');
        setLoading(false);
      }
    }, 2500);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch profile without awaiting to avoid blocking navigation/state updates
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile, loginAsGuest]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.session?.user) {
      setUser(data.session.user);
      await fetchProfile(data.session.user.id);
    }
    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    username: string, 
    fullName: string, 
    flatNo: string, 
    phone: string
  ) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { username, full_name: fullName, flat_no: flatNo, phone }
      }
    });

    if (!error && data.user) {
      // Create profile record
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        full_name: fullName,
        flat_no: flatNo,
        phone,
        role: 'resident',
        created_at: new Date().toISOString(),
      });
      
      if (data.session?.user) {
        setUser(data.session.user);
        await fetchProfile(data.user.id);
      }
    }

    return { error };
  };

  const signOut = useCallback(async () => {
    // 1. Clear local guest storage immediately
    localStorage.removeItem('isGuest');
    
    // 2. Clear Auth state
    setUser(null);
    setProfile(null);
    
    // 3. Try to sign out from Supabase (fails gracefully)
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      // 4. Force jump to login page
      window.location.href = '/auth';
    }
  }, []);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'leader';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, loginAsGuest, refreshProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
