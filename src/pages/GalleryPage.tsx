import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { safeUrl } from '../lib/security';
import { ImageModal } from '../components/ImageModal';

const fallbackImages = [
  {
    url: 'https://assets.allegiance-educare.com/colleges/1524308583DJI_0170_1024.JPG',
    title: 'VVCE Lush Campus Mysuru',
  },
  {
    url: 'https://vvce.ac.in/wp-content/uploads/2025/11/AIoT-2.jpg',
    title: 'AIoT & Robotics Hands-on Lab',
  },
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
    title: 'Student Chapter Hackathon Sprint',
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
    title: 'CodeSprint Competitive Coding Arena',
  },
  {
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
    title: 'Research Paper Presentation Day',
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    title: 'AI Masterclass & Leadership Session',
  },
];

export const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<{ url: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorageImages = async () => {
      try {
        const { data, error } = await supabase.storage.from('gallery').list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (!error && data && data.length > 0) {
          const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];
          const validFiles = data.filter((f) => {
            const ext = f.name.split('.').pop()?.toLowerCase() || '';
            return imageExts.includes(ext) && !f.name.startsWith('.');
          });

          if (validFiles.length > 0) {
            const bucketImages = validFiles.map((f) => {
              const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(f.name);
              return {
                url: safeUrl(urlData.publicUrl),
                title: f.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''),
              };
            });
            setImages(bucketImages.filter((img) => img.url !== '#'));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load gallery bucket:', err);
      }

      // Default fallback images
      setImages(fallbackImages);
      setLoading(false);
    };

    fetchStorageImages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Moments &amp; Memories</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Event Photo Gallery
        </h1>
        <p className="text-slate-300 text-sm">
          A visual chronicle of hackathons, symposiums, guest talks, and chapter activities at VVCE.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setModalImg(img.url)}
              className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden cursor-zoom-in border border-white/15 bg-slate-900 shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-cyan-500/20"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white capitalize">{img.title}</h4>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
};
