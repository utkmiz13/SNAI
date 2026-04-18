import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, ChevronLeft, ChevronRight, Upload, Camera } from 'lucide-react';

type GalleryItem = { id: number; title: string; category: string; color: string; emoji: string; date: string; imageUrl?: string };

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, title: 'Diwali Celebration 2025', category: 'events', color: 'from-orange-400 to-red-500', emoji: '🪔', date: 'Nov 2025' },
  { id: 2, title: 'Independence Day Flag Hoisting', category: 'events', color: 'from-green-400 to-teal-500', emoji: '🇮🇳', date: 'Aug 2025' },
  { id: 3, title: 'Colony Park - Central Garden', category: 'colony', color: 'from-green-500 to-emerald-600', emoji: '🌿', date: 'Mar 2025' },
  { id: 4, title: 'Children\'s Day Sports Event', category: 'events', color: 'from-blue-400 to-indigo-500', emoji: '⚽', date: 'Nov 2025' },
  { id: 5, title: 'New Year 2026 Party', category: 'events', color: 'from-purple-400 to-pink-500', emoji: '🎉', date: 'Jan 2026' },
  { id: 6, title: 'Monthly Society Meeting', category: 'meetings', color: 'from-slate-400 to-slate-600', emoji: '🤝', date: 'Mar 2026' },
  { id: 7, title: 'Holi Celebrations 2026', category: 'events', color: 'from-pink-400 to-rose-500', emoji: '🎨', date: 'Mar 2026' },
  { id: 8, title: 'Colony Main Entrance', category: 'colony', color: 'from-amber-400 to-orange-500', emoji: '🏛️', date: 'Jan 2026' },
  { id: 9, title: 'Community Garden Renovation', category: 'colony', color: 'from-lime-400 to-green-500', emoji: '🌻', date: 'Feb 2026' },
];

type Category = 'all' | 'events' | 'colony' | 'meetings';

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [items, setItems] = useState(GALLERY_ITEMS);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', category: 'events' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = activeCategory === 'all' ? items : items.filter(g => g.category === activeCategory);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const prev = () => setSelectedIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const next = () => setSelectedIndex(i => i !== null ? (i + 1) % filtered.length : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.title) return;
    
    const newItem = {
      id: Date.now(),
      title: uploadData.title,
      category: uploadData.category,
      color: 'from-blue-500 to-indigo-600',
      emoji: '📸',
      date: 'Just now',
      imageUrl: previewUrl || undefined
    };
    
    setItems([newItem, ...items]);
    setShowUpload(false);
    setUploadData({ title: '', category: 'events' });
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Colony Gallery</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Events, celebrations, and colony memories</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <Upload size={16} /> Upload Photo
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'events', 'colony', 'meetings'] as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              activeCategory === cat
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            {cat === 'all' ? '🖼️ All' : cat === 'events' ? '🎉 Events' : cat === 'colony' ? '🏘️ Colony' : '🤝 Meetings'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence>
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => openLightbox(index)}
              className="group cursor-pointer"
            >
              <div className={`aspect-square rounded-2xl bg-gradient-to-br ${item.color} flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-lg transition-all`}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{item.emoji}</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end">
                  <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform w-full">
                    <p className="text-white text-xs font-semibold line-clamp-2">{item.title}</p>
                    <p className="text-white/70 text-xs">{item.date}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Image size={48} className="text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <p className="font-semibold">No photos in this category</p>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={closeLightbox}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={closeLightbox} className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"><X size={24} /></button>
              <div className={`aspect-video rounded-2xl bg-gradient-to-br ${filtered[selectedIndex].color} flex items-center justify-center overflow-hidden`}>
                {filtered[selectedIndex].imageUrl ? (
                  <img src={filtered[selectedIndex].imageUrl} alt={filtered[selectedIndex].title} className="w-full h-full object-contain bg-black/50" />
                ) : (
                  <span className="text-8xl">{filtered[selectedIndex].emoji}</span>
                )}
              </div>
              <div className="text-center mt-4">
                <p className="text-white font-bold text-lg">{filtered[selectedIndex].title}</p>
                <p className="text-gray-400 text-sm">{filtered[selectedIndex].date}</p>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={prev} className="text-white bg-white/10 hover:bg-white/20 p-3 rounded-full"><ChevronLeft size={20} /></button>
                <span className="text-white text-sm self-center">{selectedIndex + 1} / {filtered.length}</span>
                <button onClick={next} className="text-white bg-white/10 hover:bg-white/20 p-3 rounded-full"><ChevronRight size={20} /></button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="modal-overlay" onClick={() => setShowUpload(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title">Upload to Gallery</h3>
                <button onClick={() => setShowUpload(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-2xl p-6 text-center cursor-pointer hover:bg-[hsl(var(--muted))]/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-40 mx-auto object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center text-[hsl(var(--muted-foreground))]">
                      <Camera size={32} className="mb-2" />
                      <p className="font-medium text-sm text-[hsl(var(--foreground))]">Click to select photo/video</p>
                      <p className="text-xs mt-1">JPG, PNG, MP4 up to 50MB</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Title / Description</label>
                  <input type="text" value={uploadData.title} onChange={e => setUploadData(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Diwali Night 2026" required className="input-field" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category Album</label>
                  <select value={uploadData.category} onChange={e => setUploadData(p => ({ ...p, category: e.target.value }))} className="input-field">
                    <option value="events">🎉 Events & Parties</option>
                    <option value="colony">🏘️ Colony & Architecture</option>
                    <option value="meetings">🤝 Meetings & Gatherings</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={!uploadData.title || !previewUrl} className="btn-primary flex-1 disabled:opacity-50">Upload to Gallery</button>
                  <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
