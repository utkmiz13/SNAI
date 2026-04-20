// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Validate that the key looks like a Supabase JWT (starts with eyJ and has dots)
const isValidKey = supabaseUrl.startsWith('https://') && 
                   supabaseAnonKey.startsWith('eyJ') && 
                   supabaseAnonKey.includes('.');

let supabaseClient: any;

if (isValidKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.info('✅ Supabase connected successfully.');
  } catch (e) {
    console.error('Supabase initialization failed:', e);
    supabaseClient = null;
  }
} else {
  console.warn('⚠️ Supabase credentials are missing or invalid. Running in offline/demo mode.');
  supabaseClient = null;
}

// ---------------------------------------------------------------------------
// Fully-functional mock query builder – supports all chained calls used in
// the codebase: select, insert, update, delete, eq, order, limit, single
// ---------------------------------------------------------------------------
function makeMockQueryBuilder(result: any = null, errorMsg: string | null = null) {
  const mockError = errorMsg ? { message: errorMsg, code: 'MOCK' } : null;
  const mockData = result;

  // Every terminal-like call resolves to the same shape
  const resolved = Promise.resolve({ data: mockData, error: mockError });

  const builder: any = {
    select: (_cols?: string) => makeMockQueryBuilder(mockData, errorMsg),
    insert: (_row: any) => makeMockQueryBuilder(mockData, errorMsg),
    upsert: (_row: any) => makeMockQueryBuilder(mockData, errorMsg),
    update: (_row: any) => makeMockQueryBuilder(mockData, errorMsg),
    delete: () => makeMockQueryBuilder(mockData, errorMsg),
    eq: (_col: string, _val: any) => makeMockQueryBuilder(mockData, errorMsg),
    neq: (_col: string, _val: any) => makeMockQueryBuilder(mockData, errorMsg),
    order: (_col: string, _opts?: any) => makeMockQueryBuilder(mockData, errorMsg),
    limit: (_n: number) => makeMockQueryBuilder(mockData, errorMsg),
    single: () => resolved,
    maybeSingle: () => resolved,
    // Make the builder itself thenable so await works
    then: (resolve: any, reject: any) => resolved.then(resolve, reject),
  };

  return builder;
}

// Mock channel for real-time subscriptions
function makeMockChannel() {
  return {
    on: (_event: string, _filter: any, _cb: any) => makeMockChannel(),
    subscribe: (_cb?: any) => ({ unsubscribe: () => {} }),
  };
}

// The offline/demo mock Supabase client
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { session: null, user: null }, error: { message: 'Offline mode – Supabase not connected. Please check your API key.' } }),
    signUp: async () => ({ data: { session: null, user: null }, error: { message: 'Offline mode – Supabase not connected.' } }),
    signOut: async () => ({ error: null }),
  },
  from: (_table: string) => makeMockQueryBuilder([], null),
  channel: (_name: string) => makeMockChannel(),
  removeChannel: (_ch: any) => {},
  storage: {
    from: (_bucket: string) => ({
      upload: async () => ({ data: null, error: { message: 'Storage unavailable in offline mode.' } }),
      getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
    }),
  },
};

export const supabase: any = supabaseClient || mockSupabase;

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------
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
