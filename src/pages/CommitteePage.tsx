import React, { useState } from 'react';
import { Users, Sparkles } from 'lucide-react';
import { LinkedInIcon } from '../components/BrandIcons';
import { useRealtimeCollection } from '../hooks/useRealtimeCollection';
import { safeUrl } from '../lib/security';
import { MemberModal } from '../components/MemberModal';
import type { CommitteeMember } from '../types/database';

export const CommitteePage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null);

  const { data: members, loading } = useRealtimeCollection<CommitteeMember>({
    table: 'committee',
    orderColumn: 'display_order',
    ascending: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Leadership &amp; Vision</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Executive Committee
        </h1>
        <p className="text-slate-300 text-sm">
          The student leaders and faculty mentors driving computational intelligence research, workshops, and chapter milestones at VVCE.
        </p>
      </div>

      {/* Committee Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white/5 border border-white/10 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No committee records</h3>
          <p className="text-slate-400 text-xs">
            Committee profiles will be populated shortly. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((m) => {
            const avatar = safeUrl(m.image_url) !== '#'
              ? safeUrl(m.image_url)
              : `https://i.pravatar.cc/300?u=${encodeURIComponent(m.name || 'member')}`;

            const linkedin = safeUrl(m.linkedin);

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="group flex flex-col items-center text-center p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/50 shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
              >
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md group-hover:bg-cyan-400/40 transition" />
                  <img
                    src={avatar}
                    alt={m.name}
                    className="relative w-28 h-28 rounded-full object-cover border-2 border-cyan-400 shadow-xl transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {m.name}
                </h3>
                <p className="text-xs font-semibold text-cyan-400 mt-1">{m.role}</p>

                <p className="text-slate-400 text-xs mt-3 line-clamp-3 leading-relaxed flex-1">
                  {m.bio || 'Core member dedicated to IEEE CIS VVCE student advancement.'}
                </p>

                <div className="mt-5 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] group-hover:text-cyan-300 transition">View Bio →</span>
                  {linkedin !== '#' && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition"
                      aria-label={`${m.name} LinkedIn`}
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Modal */}
      <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
};
