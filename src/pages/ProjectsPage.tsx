import React, { useState, useMemo } from 'react';
import { Search, Code2, ExternalLink, Sparkles, FolderGit2 } from 'lucide-react';
import { GitHubIcon } from '../components/BrandIcons';
import { useRealtimeCollection } from '../hooks/useRealtimeCollection';
import { safeUrl } from '../lib/security';
import type { ProjectItem } from '../types/database';

export const ProjectsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: projects, loading } = useRealtimeCollection<ProjectItem>({
    table: 'projects',
    orderColumn: 'created_at',
    ascending: false,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Student Innovations</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          CIS Project Showcase
        </h1>
        <p className="text-slate-300 text-sm">
          Groundbreaking student initiatives spanning computer vision, natural language processing, edge intelligence, and robotics.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white/5 border border-white/10 p-8 space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No projects found</h3>
          <p className="text-slate-400 text-xs">
            No projects matched your search criteria. Check back soon for new student innovations!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const gh = safeUrl(p.github_url);
            const demo = safeUrl(p.demo_url);

            return (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center mb-4">
                  <Code2 className="w-5 h-5" />
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {p.title}
                </h3>

                <p className="mt-3 text-slate-300 text-sm leading-relaxed flex-1 line-clamp-4">
                  {p.description}
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                  {gh !== '#' && (
                    <a
                      href={gh}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                    >
                      <GitHubIcon className="w-3.5 h-3.5" />
                      <span>Code Repository</span>
                    </a>
                  )}

                  {demo !== '#' && (
                    <a
                      href={demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
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
