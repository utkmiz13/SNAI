// @ts-nocheck
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Phone, Home, Mail, Users, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

export function ProfilePage() {
  try {
    const { profile, refreshProfile } = useAuth();
    const { showToast } = useToast();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      flat_no: profile?.flat_no || '',
      family_members: profile?.family_members || 1,
    });

    // Sync form with profile data when it loads or changes
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
      if (!profile?.id) return;
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: form.full_name,
            phone: form.phone,
            flat_no: form.flat_no,
            family_members: parseInt(form.family_members.toString()) || 0,
          })
          .eq('id', profile.id);

        if (error) throw error;
        
        showToast('success', 'Profile Updated!', 'Your information has been saved.');
        setEditing(false);
        refreshProfile();
      } catch (err) {
        console.error('Error updating profile:', err);
        showToast('error', 'Update Failed', 'Could not save details.');
      }
    };

    const initials = (profile?.full_name || 'Resident').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your personal information</p>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="relative z-10 pt-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 ring-4 ring-white dark:ring-gray-900 shadow-xl">
                {initials}
              </div>
            </div>
            <h2 className="text-2xl font-bold">{profile?.full_name || 'Resident'}</h2>
            <p className="text-[hsl(var(--muted-foreground))]">@{profile?.username || 'user'}</p>
          </div>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="section-title">Personal Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
                  <Save size={14} /> Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: 'Full Name', icon: <User size={16} />, field: 'full_name', value: form.full_name },
              { label: 'Phone Number', icon: <Phone size={16} />, field: 'phone', value: form.phone },
              { label: 'Block / Flat Number', icon: <Home size={16} />, field: 'flat_no', value: form.flat_no },
              { label: 'Family Members', icon: <Users size={16} />, field: 'family_members', value: form.family_members },
            ].map(field => (
              <div key={field.field}>
                <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2 flex items-center gap-1.5">
                  {field.icon} {field.label}
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => setForm(p => ({ ...p, [field.field]: e.target.value }))}
                    className="input-field"
                  />
                ) : (
                  <p className="font-medium py-2.5 px-4 bg-[hsl(var(--muted))]/50 rounded-xl">
                    {field.value || <span className="text-[hsl(var(--muted-foreground))]">Not set</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] pb-4">
          <p>Joined Colony: <span className="font-semibold text-[hsl(var(--foreground))]">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active Member'}</span></p>
        </div>
      </div>
    );
  } catch (e: any) {
    console.error('ProfilePage crash:', e);
    return (
      <div className="p-8 text-center card bg-red-50 dark:bg-red-900/10 border-red-200 m-6">
        <h2 className="text-xl font-bold text-red-600 mb-2">Technical Error Detected</h2>
        <p className="text-sm text-red-500 mb-4 font-mono bg-white p-3 rounded-lg border border-red-100">
          {e.message || 'Unknown Error'}
        </p>
        <button onClick={() => window.location.reload()} className="btn-primary bg-red-600 hover:bg-red-700">Reload App</button>
      </div>
    );
  }
}
