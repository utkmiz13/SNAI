import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  flat_no: string;
  phone: string;
  role: 'resident' | 'admin' | 'leader';
  avatar_url?: string;
  family_members?: number;
  created_at: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  category: 'urgent' | 'general' | 'event' | 'maintenance';
  created_by: string;
  created_at: string;
  author_name?: string;
};

export type Complaint = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'water' | 'electricity' | 'security' | 'maintenance' | 'other';
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  author_name?: string;
};

export type Payment = {
  id: string;
  user_id: string;
  amount: number;
  month: string;
  year: number;
  status: 'paid' | 'pending' | 'overdue';
  paid_at?: string;
  created_at: string;
};

export type Visitor = {
  id: string;
  host_user_id: string;
  visitor_name: string;
  purpose: string;
  entry_time?: string;
  exit_time?: string;
  otp?: string;
  pre_approved: boolean;
  status: 'pending' | 'arrived' | 'exited';
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  rsvp_count?: number;
  created_by: string;
  created_at: string;
};

export type Poll = {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  created_by: string;
  ends_at: string;
  created_at: string;
};

export type ForumPost = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: 'general' | 'lost_found' | 'recommendations' | 'emergency';
  likes: number;
  replies_count: number;
  created_at: string;
  author_name?: string;
};

export type Delivery = {
  id: string;
  user_id: string;
  courier: string;
  description: string;
  status: 'arrived' | 'picked_up';
  arrived_at: string;
  picked_up_at?: string;
};
