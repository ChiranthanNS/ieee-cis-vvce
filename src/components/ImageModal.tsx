import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { safeUrl } from '../lib/security';

interface ImageModalProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ src, alt = 'Preview Image', onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (src) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [src, onClose]);

  if (!src) return null;
  const validatedSrc = safeUrl(src);
  if (validatedSrc === '#') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close image modal"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={validatedSrc}
          alt={alt}
          className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
          loading="lazy"
        />
      </div>
    </div>
  );
};
