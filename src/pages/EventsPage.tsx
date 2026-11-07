import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, Sparkles } from 'lucide-react';
import { useRealtimeCollection } from '../lib/hooks';
import { EventCard } from '../components/EventCard';
import { ImageModal } from '../components/ImageModal';
import type { EventItem } from '../lib/types';

export const EventsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<'all' | 'upcoming' | 'stop' | 'completed'>('all');
  const [modalImg, setModalImg] = useState<string | null>(null);

  const { data: events, loading } = useRealtimeCollection<EventItem>({
    table: 'events',
    orderColumn: 'event_date',
    ascending: true,
  });

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const stage = evt.lifecycle_stage || 'upcoming';
      if (filterStage !== 'all' && stage !== filterStage) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        (evt.description && evt.description.toLowerCase().includes(q)) ||
        (evt.venue && evt.venue.toLowerCase().includes(q))
      );
    });
  }, [events, filterStage, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>IEEE CIS Events &amp; Workshops</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Chapter Events &amp; Contests
        </h1>
        <p className="text-slate-300 text-sm">
          Participate in hackathons, algorithm challenges, and expert-led masterclasses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-xl bg-white/5 border border-white/15 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1 hidden lg:block" />
          {(['all', 'upcoming', 'stop', 'completed'] as const).map((stage) => {
            const labels = {
              all: 'All',
              upcoming: 'Upcoming',
              stop: 'Closed',
              completed: 'Completed',
            };
            return (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStage === stage
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {labels[stage]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white/5 border border-white/10 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No events found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Try adjusting your search criteria or filter stage to view other chapter events.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onImageClick={(url) => setModalImg(url)} />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
};
