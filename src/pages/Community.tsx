import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Reply, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type CommunityTab = 'forum' | 'events' | 'polls';

const FORUM_POSTS = [
  { id: 1, author: 'Ramesh Kumar', flat: 'Block-45', avatar: 'R', title: '🔍 Lost: Black labrador puppy named Tommy', body: 'Our black labrador puppy named Tommy went missing last night. Last seen near Block 20-25 area. If found please call: 9876543210. Reward offered!', category: 'lost_found', likes: 12, replies: 5, time: '2 hours ago', liked: false },
  { id: 2, author: 'Priya Verma', flat: 'Block-22', avatar: 'P', title: '💡 Recommendation: Excellent electrician in colony', body: 'Suresh bhai from Block-8 is an excellent electrician. Very affordable rates and reliable work. Contact: 9988776655. Highly recommended!', category: 'recommendations', likes: 8, replies: 3, time: '5 hours ago', liked: false },
  { id: 3, author: 'Amit Singh', flat: 'Block-10', avatar: 'A', title: '💬 Should we organize a cricket tournament this summer?', body: 'I think we should organize a colony-wide cricket tournament this summer. We have enough ground space near Block 1-5 area. Who is interested? Let\'s vote in the polls!', category: 'general', likes: 21, replies: 14, time: '1 day ago', liked: true },
  { id: 4, author: 'Sunita Gupta', flat: 'Block-8', avatar: 'S', title: '🚨 Alert: Unknown person seen roaming near Block 30-40', body: 'Residents near Block 30-40 please be alert. An unknown person was seen roaming at odd hours last night. Please inform security immediately if you see suspicious activity.', category: 'emergency', likes: 35, replies: 8, time: '2 days ago', liked: false },
];

const EVENTS = [
  { id: 1, title: 'Diwali Mela 2026', date: 'Nov 12, 2026', time: '6:00 PM - 10:00 PM', location: 'Central Park, Near Block 1', description: 'Join us for an amazing Diwali celebration with food stalls, games, cultural performances, and a grand fireworks show! This is our biggest community event of the year.', rsvp: 67, capacity: 200, registered: false },
  { id: 2, title: 'Annual Society Meeting', date: 'Apr 25, 2026', time: '7:00 PM - 9:00 PM', location: 'Community Hall, Block 1 GF', description: 'Annual general meeting to discuss budget allocations, new projects, and community rules for the year 2026-27. Attendance is requested from all block representatives.', rsvp: 32, capacity: 100, registered: true },
  { id: 3, title: 'Cleanliness Drive – Sunday', date: 'Apr 21, 2026', time: '7:00 AM - 10:00 AM', location: 'Meeting at Main Gate', description: 'Let\'s come together for a morning cleanliness drive. Bring gloves, brooms, and bags. RWA will provide cleaning supplies. Refreshments will be served after the drive.', rsvp: 45, capacity: 150, registered: false },
];

const POLLS = [
  { id: 1, question: 'Should we install gym equipment in the central park?', options: ['Yes, definitely!', 'No, not needed', 'Maybe later'], votes: [68, 22, 10], total: 47, ends: '5 days', voted: null as number | null },
  { id: 2, question: 'What should be our next community project?', options: ['CCTV upgrade', 'Playground renovation', 'Streetlight installation', 'Rainwater harvesting'], votes: [35, 25, 28, 12], total: 89, ends: '2 days', voted: null as number | null },
  { id: 3, question: 'Preferred time for the colony sports day?', options: ['Morning 7-11 AM', 'Evening 4-8 PM', 'All day Sunday'], votes: [45, 40, 15], total: 62, ends: '3 days', voted: null as number | null },
];

const categoryColors: Record<string, string> = {
  general: 'badge-blue',
  lost_found: 'badge-yellow',
  recommendations: 'badge-green',
  emergency: 'badge-red',
};

const categoryLabels: Record<string, string> = {
  general: '💬 General',
  lost_found: '🔍 Lost & Found',
  recommendations: '💡 Recommendation',
  emergency: '🚨 Emergency',
};

export function Community() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('forum');
  const [polls, setPolls] = useState(POLLS);
  const [posts, setPosts] = useState(FORUM_POSTS);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', category: 'general' });
  const { profile } = useAuth();
  const { showToast } = useToast();

  const handleVote = (pollId: number, optionIndex: number) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId || p.voted !== null) return p;
      const newVotes = [...p.votes];
      newVotes[optionIndex]++;
      return { ...p, votes: newVotes, total: p.total + 1, voted: optionIndex };
    }));
    showToast('success', 'Vote Recorded!', 'Your vote has been counted.');
  };

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked };
    }));
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const post = {
      id: Date.now(),
      author: profile?.full_name || profile?.username || 'Resident',
      flat: profile?.flat_no || '',
      avatar: profile?.username?.[0]?.toUpperCase() || 'R',
      title: newPost.title,
      body: newPost.body,
      category: newPost.category,
      likes: 0,
      replies: 0,
      time: 'Just now',
      liked: false
    };

    setPosts([post, ...posts]);
    showToast('success', 'Post Published!', 'Your post is now visible to all residents.');
    setShowPostForm(false);
    setNewPost({ title: '', body: '', category: 'general' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Community</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Forum, events, polls — stay connected</p>
        </div>
        {activeTab === 'forum' && (
          <button onClick={() => setShowPostForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Post
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'forum', label: '💬 Forum' },
          { key: 'events', label: '🎉 Events' },
          { key: 'polls', label: '📊 Polls' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forum */}
      {activeTab === 'forum' && (
        <div className="space-y-4">
          {posts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{post.author}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{post.flat}</span>
                    <span className={`badge text-xs ${categoryColors[post.category]}`}>{categoryLabels[post.category]}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{post.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{post.body}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))] hover:text-red-500'}`}
                    >
                      <Heart size={15} fill={post.liked ? 'currentColor' : 'none'} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                      <Reply size={15} /> {post.replies}
                    </button>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">{post.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {EVENTS.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card overflow-hidden"
            >
              <div className={`h-2 ${i === 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : i === 1 ? 'bg-gradient-to-r from-teal-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`} />
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  {event.registered && <span className="badge badge-green">✓ Registered</span>}
                </div>
                <div className="space-y-1.5 text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  <p>📅 {event.date}</p>
                  <p>🕐 {event.time}</p>
                  <p>📍 {event.location}</p>
                </div>
                <p className="text-sm line-clamp-2 mb-4">{event.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full w-32 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(event.rsvp / event.capacity) * 100}%` }} />
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1">
                      <Users size={11} /> {event.rsvp}/{event.capacity} RSVPs
                    </p>
                  </div>
                  <button
                    onClick={() => showToast('success', 'RSVP Confirmed!', `You're registered for ${event.title}`)}
                    className={event.registered ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
                  >
                    {event.registered ? 'Attending ✓' : 'RSVP Now →'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Polls */}
      {activeTab === 'polls' && (
        <div className="space-y-5">
          {polls.map((poll, i) => {
            const maxVotes = Math.max(...poll.votes);
            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold flex-1 pr-4">{poll.question}</h3>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{poll.total} votes</p>
                    <p className="text-xs text-red-500 font-medium">⏰ {poll.ends} left</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {poll.options.map((option, idx) => {
                    const pct = poll.total > 0 ? Math.round((poll.votes[idx] / poll.total) * 100) : 0;
                    const isWinner = poll.votes[idx] === maxVotes && poll.voted !== null;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleVote(poll.id, idx)}
                        disabled={poll.voted !== null}
                        className={`w-full text-left rounded-xl overflow-hidden transition-all ${
                          poll.voted === idx ? 'ring-2 ring-[hsl(var(--primary))]' : ''
                        } ${poll.voted !== null ? 'cursor-default' : 'hover:shadow-sm'}`}
                      >
                        <div className="p-3 border border-[hsl(var(--border))] rounded-xl relative overflow-hidden">
                          {poll.voted !== null && (
                            <div
                              className={`absolute inset-0 ${isWinner ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-[hsl(var(--muted))]/50'} rounded-xl`}
                              style={{ width: `${pct}%` }}
                            />
                          )}
                          <div className="relative flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {poll.voted === idx && <span className="text-[hsl(var(--primary))] font-bold">✓</span>}
                              <span className="text-sm font-medium">{option}</span>
                            </div>
                            {poll.voted !== null && (
                              <span className={`text-sm font-bold ${isWinner ? 'text-blue-600 dark:text-blue-400' : ''}`}>{pct}%</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {poll.voted === null && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3 text-center">Click an option to vote</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Post Modal */}
      <AnimatePresence>
        {showPostForm && (
          <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title">New Forum Post</h3>
                <button onClick={() => setShowPostForm(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))} className="input-field">
                    <option value="general">💬 General</option>
                    <option value="lost_found">🔍 Lost & Found</option>
                    <option value="recommendations">💡 Recommendation</option>
                    <option value="emergency">🚨 Emergency Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input type="text" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="Post title..." required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Content</label>
                  <textarea value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))} placeholder="Share with the community..." rows={4} required className="input-field resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">Publish Post</button>
                  <button type="button" onClick={() => setShowPostForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
