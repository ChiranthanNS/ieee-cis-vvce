import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { useRealtimeCollection } from '../lib/hooks';
import { safeUrl } from '../lib/security';
import type { ResourceItem } from '../lib/types';

export const ResourcesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');

  const { data: resources, loading } = useRealtimeCollection<ResourceItem>({
    table: 'resources',
    orderColumn: 'created_at',
    ascending: false,
  });

  const types = useMemo(() => {
    const list = new Set<string>();
    resources.forEach((r) => {
      if (r.type) list.add(r.type);
    });
    return ['All', ...Array.from(list)];
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (activeType !== 'All' && r.type !== activeType) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.type && r.type.toLowerCase().includes(q))
      );
    });
  }, [resources, activeType, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Curated Learning Hub</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          AI &amp; ML Resources
        </h1>
        <p className="text-slate-300 text-sm">
          Recommended toolkits, frameworks, online tutorials, and foundational materials curated by chapter mentors.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-xl bg-white/5 border border-white/15 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeType === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white/5 border border-white/10 p-8 space-y-3">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No resources found</h3>
          <p className="text-slate-400 text-xs">
            No resources matched your filter. Check back as new tools and guides are continuously added!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => {
            const url = safeUrl(r.url);

            return (
              <div
                key={r.id}
                className="flex flex-col justify-between rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-medium">
                      {r.type || 'Resource'}
                    </span>
                    <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {r.title}
                  </h3>

                  <p className="mt-2 text-slate-300 text-xs leading-relaxed line-clamp-3">
                    {r.description || 'Essential resource recommended for deep dives and practical experiments.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                  {url !== '#' ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition hover:scale-105"
                    >
                      <span>Access Resource</span>
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
