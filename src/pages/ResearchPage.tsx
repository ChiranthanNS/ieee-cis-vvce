import React, { useState, useMemo } from 'react';
import { Search, FileText, ExternalLink, Sparkles, User, BookOpen } from 'lucide-react';
import { useRealtimeCollection } from '../lib/hooks';
import { safeUrl } from '../lib/security';
import type { PaperItem } from '../lib/types';

export const ResearchPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: papers, loading } = useRealtimeCollection<PaperItem>({
    table: 'papers',
    orderColumn: 'created_at',
    ascending: false,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return papers;
    const q = search.toLowerCase();
    return papers.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        (p.summary && p.summary.toLowerCase().includes(q))
    );
  }, [papers, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Publications &amp; Literature</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Research &amp; Papers
        </h1>
        <p className="text-slate-300 text-sm">
          Seminal research papers, faculty contributions, and student literature reviews across AI, deep learning, and computational intelligence.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search papers by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white/5 border border-white/10 p-8 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No papers found</h3>
          <p className="text-slate-400 text-xs">
            No research papers matched your search query. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((paper, idx) => {
            const link = safeUrl(paper.link);

            return (
              <div
                key={paper.id || idx}
                className="flex flex-col rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/40 p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{paper.author}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {paper.title}
                </h3>

                <p className="mt-3 text-slate-300 text-sm leading-relaxed flex-1">
                  {paper.summary}
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                  {link !== '#' ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                    >
                      <span>Read Publication</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">Internal Reference</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
