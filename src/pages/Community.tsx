// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Reply, X, MessageCircle, Clock, Loader, Share2, Award, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

type CommunityTab = 'forum' | 'events' | 'polls';

interface Post {
  id: string;
  author_name: string;
  content: string;
  category: string;
  likes: number;
  created_at: string;
  user_id: string;
}

const EVENTS = [
  { id: 1, title: 'Diwali Mela 2026', date: 'Nov 12, 2026', time: '6:00 PM - 10:00 PM', location: 'Central Park, Near Block 1', description: 'Join us for an amazing Diwali celebration with food stalls, games, cultural performances, and a grand fireworks show! This is our biggest community event of the year.', rsvp: 67, capacity: 200, registered: false },
  { id: 2, title: 'Annual Society Meeting', date: 'Apr 25, 2026', time: '7:00 PM - 9:00 PM', location: 'Community Hall, Block 1 GF', description: 'Annual general meeting to discuss budget allocations, new projects, and community rules for the year 2026-27. Attendance is requested from all block representatives.', rsvp: 32, capacity: 100, registered: true },
  { id: 3, title: 'Cleanliness Drive – Sunday', date: 'Apr 21, 2026', time: '7:00 AM - 10:00 AM', location: 'Meeting at Main Gate', description: 'Let\'s come together for a morning cleanliness drive. Bring gloves, brooms, and bags. RWA will provide cleaning supplies. Refreshments will be served after the drive.', rsvp: 45, capacity: 150, registered: false },
];

const POLLS = [
  { id: 1, question: 'Should we install gym equipment in the central park?', options: ['Yes, definitely!', 'No, not needed', 'Maybe later'], votes: [68, 22, 10], total: 47, ends: '5 days', voted: null as number | null },
  { id: 2, question: 'What should be our next community project?', options: ['CCTV upgrade', 'Playground renovation', 'Streetlight installation', 'Rainwater harvesting'], votes: [35, 25, 28, 12], total: 89, ends: '2 days', voted: null as number | null },
];

const categoryColors: Record<string, string> = {
  general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  lost_found: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  recommendations: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const categoryLabels: Record<string, string> = {
  general: '💬 General',
  lost_found: '🔍 Lost & Found',
  recommendations: '💡 Recommendation',
  emergency: '🚨 Emergency',
};

export function Community() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('forum');
  const [posts, setPosts] = useState<Post[]>([]);
  const [polls] = useState(POLLS);
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ content: '', category: 'general' });
  const { profile, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
    
    const channel = supabase
      .channel('community_posts_changes')
      .on('postgres_changes', { event: '*', table: 'community_posts', schema: 'public' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setFetching(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        author_name: profile?.full_name || user.user_metadata?.full_name || 'Resident',
        content: form.content,
        category: form.category,
        likes: 0
      });

      if (error) throw error;

      showToast('success', 'Post Published!', 'Your thoughts have been shared with the colony.');
      setShowPostForm(false);
      setForm({ content: '', category: 'general' });
    } catch (err: any) {
      showToast('error', 'Post Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId);

      if (error) throw error;
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Colony Community</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Talk, vote, and attend events together</p>
        </div>
        {activeTab === 'forum' && (
          <button onClick={() => setShowPostForm(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Create Post
          </button>
        )}
      </div>

      {/* Modern Tabs */}
      <div className="flex p-1.5 bg-[hsl(var(--muted))]/50 rounded-2xl w-fit gap-1">
        {([
          { key: 'forum', label: 'Forum', icon: <MessageCircle size={16} /> },
          { key: 'events', label: 'Events', icon: <Calendar size={16} /> },
          { key: 'polls', label: 'Polls', icon: <Award size={16} /> },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.key
                ? 'bg-[hsl(var(--card))] text-blue-600 shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'forum' && (
          <motion.div
            key="forum"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {posts.length === 0 ? (
              <div className="card p-20 text-center border-dashed">
                 <MessageCircle size={48} className="mx-auto mb-4 opacity-10" />
                 <p className="font-bold text-lg">No posts yet</p>
                 <p className="text-sm text-[hsl(var(--muted-foreground))]">Start the conversation in Sharda Nagar!</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="card p-6 hover:shadow-xl transition-all border-b-4 border-b-blue-500/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg flex-shrink-0">
                      {post.author_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm">{post.author_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${categoryColors[post.category] || categoryColors.general}`}>
                            {categoryLabels[post.category] || '💬 General'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                          <Clock size={10} /> {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                      <div className="flex items-center gap-6 pt-4 border-t border-[hsl(var(--border))]/30">
                        <button 
                          onClick={() => handleLike(post.id, post.likes)}
                          className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors group"
                        >
                          <Heart size={16} className="group-hover:fill-red-500 group-hover:scale-110 transition-all" />
                          {post.likes || 0}
                        </button>
                        <button className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-blue-500 transition-colors">
                          <Reply size={16} /> Reply
                        </button>
                        <button className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-green-500 transition-colors">
                          <Share2 size={16} /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {EVENTS.map((event, i) => (
              <div key={event.id} className="card overflow-hidden group">
                <div className={`h-1.5 ${i % 3 === 0 ? 'bg-blue-500' : i % 3 === 1 ? 'bg-purple-500' : 'bg-orange-500'}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-lg">{event.title}</h3>
                    {event.registered && <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Attending</span>}
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" /> {event.date} • {event.time}
                    </p>
                    <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                      <MapPin size={14} className="text-red-500" /> {event.location}
                    </p>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-6">{event.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[hsl(var(--border))]/50">
                    <div className="flex -space-x-2">
                       {[...Array(4)].map((_, i) => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--muted))] text-[8px] flex items-center justify-center font-bold">
                           {String.fromCharCode(65 + i)}
                         </div>
                       ))}
                       <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--muted))] text-[8px] flex items-center justify-center font-bold">+{event.rsvp}</div>
                    </div>
                    <button 
                      onClick={() => showToast('success', 'RSVP Sent', 'We have noted your interest!')}
                      className="btn-primary py-2 px-6 text-xs font-bold rounded-xl"
                    >
                      Interested
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'polls' && (
          <motion.div
            key="polls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {polls.map(poll => (
              <div key={poll.id} className="card p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-black max-w-lg">{poll.question}</h3>
                  <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">Ends in {poll.ends}</span>
                </div>
                <div className="space-y-3">
                  {poll.options.map((opt, i) => {
                    const pct = Math.round((poll.votes[i] / poll.total) * 100);
                    return (
                      <button 
                        key={i} 
                        onClick={() => showToast('info', 'Poll', 'This is a demo poll.')}
                        className="w-full relative p-4 rounded-2xl border border-[hsl(var(--border))] hover:border-blue-500 transition-all text-left group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: `${pct}%` }} />
                        <div className="relative flex justify-between items-center">
                          <span className="text-sm font-bold">{opt}</span>
                          <span className="text-xs font-black text-blue-500">{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-6 uppercase tracking-widest text-center">Total Votes: {poll.total}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <AnimatePresence>
        {showPostForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPostForm(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="card p-8 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black tracking-tight">Community Forum</h3>
                <button onClick={() => setShowPostForm(false)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handlePostSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2">Select Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['general', 'lost_found', 'recommendations', 'emergency'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, category: cat }))}
                        className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                          form.category === cat ? 'bg-blue-500 text-white border-blue-500' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-blue-300'
                        }`}
                      >
                        {categoryLabels[cat].split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2">Your Message</label>
                  <textarea 
                    value={form.content} 
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))} 
                    placeholder="What's happening in Sharda Nagar Vistar?" 
                    rows={5} 
                    required 
                    className="input-field resize-none bg-[hsl(var(--muted))]/30" 
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">
                    {loading ? <Loader className="animate-spin mx-auto" size={18} /> : 'Publish to Colony'}
                  </button>
                  <button type="button" onClick={() => setShowPostForm(false)} className="btn-secondary px-8 font-black text-xs uppercase">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
