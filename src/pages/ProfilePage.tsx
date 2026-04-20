// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Phone, Home, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

export function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    flat_no: '',
    family_members: 1,
  });

  // Sync form when profile data arrives
  useEffect(() => {
    if (profile && !editing) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        flat_no: profile.flat_no || '',
        family_members: profile.family_members || 1,
      });
    }
  }, [profile, editing]);

  const handleSave = async () => {
    const userId = profile?.id || user?.id;
    if (!userId) {
      showToast('error', 'Auth Error', 'You must be logged in to save details.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: profile?.username || user?.user_metadata?.username || user?.email?.split('@')?.[0] || 'user',
          full_name: form.full_name,
          phone: form.phone,
          flat_no: form.flat_no,
          family_members: parseInt(form.family_members) || 1,
          role: profile?.role || 'resident',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      showToast('success', 'Profile Saved!', 'Your details are now securely stored.');
      setEditing(false);
      if (refreshProfile) refreshProfile();
    } catch (err: any) {
      console.error('Save error:', err);
      showToast('error', 'Save Failed', err.message);
    }
  };

  const initials = profile?.full_name 
    ? profile.full_name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : (profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U');

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <h1 className="page-title text-center sm:text-left">My Profile</h1>

      {/* Header Card */}
      <div className="card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="relative z-10 pt-4">
          <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white dark:border-gray-900 shadow-xl text-blue-600">
            {initials}
          </div>
          <h2 className="text-2xl font-bold">{profile?.full_name || 'Resident'}</h2>
          <p className="text-[hsl(var(--muted-foreground))]">@{profile?.username || user?.user_metadata?.username || 'user'}</p>
        </div>
      </div>

      {/* Details Card */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="section-title">Account Details</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-xs">
              <Edit2 size={12} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-xs">
                <Save size={12} /> Save
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs">
                <X size={12} /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Full Name', icon: <User size={16} />, field: 'full_name' },
            { label: 'Phone Number', icon: <Phone size={16} />, field: 'phone' },
            { label: 'Flat Number', icon: <Home size={16} />, field: 'flat_no' },
          ].map((item) => (
            <div key={item.field}>
              <label className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-2">
                {item.icon} {item.label}
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form[item.field]}
                  onChange={(e) => setForm({ ...form, [item.field]: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="bg-[hsl(var(--muted))]/50 p-3 rounded-xl font-medium">
                  {form[item.field] || <span className="opacity-50 italic">Not set</span>}
                </p>
              )}
            </div>
          ))}
          
          <div>
            <label className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-2">
              Family Members
            </label>
            {editing ? (
              <input
                type="number"
                value={form.family_members}
                onChange={(e) => setForm({ ...form, family_members: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="bg-[hsl(var(--muted))]/50 p-3 rounded-xl font-medium">
                {form.family_members} Members
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        Member Since: <span className="font-bold text-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Joining now...'}</span>
      </div>
    </div>
  );
}
