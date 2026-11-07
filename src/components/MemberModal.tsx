import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { LinkedInIcon } from './BrandIcons';
import type { CommitteeMember } from '../lib/types';
import { safeUrl } from '../lib/security';

interface MemberModalProps {
  member: CommitteeMember | null;
  onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ member, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (member) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [member, onClose]);

  if (!member) return null;

  const validImg = safeUrl(member.image_url) !== '#'
    ? safeUrl(member.image_url)
    : `https://i.pravatar.cc/300?u=${encodeURIComponent(member.name || 'member')}`;

  const validLinkedin = safeUrl(member.linkedin);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-3xl bg-slate-900/90 border border-white/20 p-8 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close member modal"
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <img
            src={validImg}
            alt={member.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-cyan-400 shadow-xl mb-4"
            loading="lazy"
          />
          <h3 className="text-2xl font-bold text-white">{member.name}</h3>
          <p className="text-cyan-400 font-medium text-sm mt-1">{member.role}</p>

          <p className="mt-4 text-slate-300 text-sm leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto px-2">
            {member.bio || 'Core committee member actively contributing to IEEE CIS VVCE chapter growth, tech workshops, and student mentorship.'}
          </p>

          {validLinkedin !== '#' && (
            <a
              href={validLinkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all hover:scale-105"
            >
              <LinkedInIcon className="w-4 h-4" />
              <span>Connect on LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
