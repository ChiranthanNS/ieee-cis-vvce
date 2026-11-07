import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, Code2, ArrowRight, BellRing, Sparkles, Award, Cpu, Globe } from 'lucide-react';
import { useRealtimeStats } from '../lib/hooks';
import { useRealtimeCollection } from '../lib/hooks';
import { StatCard } from '../components/StatCard';
import { EventCard } from '../components/EventCard';
import { ImageModal } from '../components/ImageModal';
import type { EventItem, UpdateItem } from '../lib/types';

export const HomePage: React.FC = () => {
  const { stats } = useRealtimeStats();
  const [modalImg, setModalImg] = useState<string | null>(null);

  // Live real-time updates feed
  const { data: updates, loading: updatesLoading } = useRealtimeCollection<UpdateItem>({
    table: 'updates',
    orderColumn: 'created_at',
    ascending: false,
  });

  // Live events (for featured section)
  const { data: events, loading: eventsLoading } = useRealtimeCollection<EventItem>({
    table: 'events',
    orderColumn: 'event_date',
    ascending: true,
  });

  const upcomingEvents = events.filter((e) => (e.lifecycle_stage || 'upcoming') === 'upcoming').slice(0, 3);

  return (
    <div className="space-y-24 py-8">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Advancing Computational Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              IEEE Computational Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">Society</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
              Vidya Vardhaka College of Engineering Student Chapter. Fostering research, innovation, hands-on engineering, and algorithmic excellence across Artificial Intelligence, Neural Networks, Machine Learning &amp; Evolutionary Systems.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all hover:scale-105 text-sm"
              >
                <span>Student Projects</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-indigo-500/30 rounded-3xl blur-2xl -z-10" />
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=80"
                alt="AI Illustration"
                className="w-full h-80 sm:h-96 object-cover rounded-3xl border border-white/20 shadow-2xl transition duration-500 hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute -bottom-5 -left-5 bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">IEEE VVCE STB</p>
                  <p className="text-sm font-bold text-white">Active Student Chapter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE STATS COUNTER STRIP */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total Events"
            value={stats.events}
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard
            label="Active Participants"
            value={stats.participants}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            label="Learning Resources"
            value={stats.resources}
            icon={<BookOpen className="w-6 h-6" />}
          />
          <StatCard
            label="Featured Projects"
            value={stats.projects}
            icon={<Code2 className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* LIVE CHAPTER UPDATES FEED */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Live Announcements</h2>
              <p className="text-xs text-slate-400">Real-time alerts broadcast from the chapter admin console</p>
            </div>
          </div>
        </div>

        {updatesLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          </div>
        ) : updates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-slate-400 text-sm">
            No chapter announcements at this moment. Stay tuned for upcoming hackathons and workshop notices!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {updates.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl p-6 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/40 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-medium">Notice</span>
                  <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed line-clamp-3">
                  {item.content || item.description || ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED UPCOMING EVENTS */}
      {upcomingEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
              <p className="text-xs text-slate-400">Register and participate in chapter competitions and bootcamps</p>
            </div>
            <Link to="/events" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} onImageClick={(url) => setModalImg(url)} />
            ))}
          </div>
        </section>
      )}

      {/* ABOUT VVCE & IEEE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl p-8 backdrop-blur-xl bg-white/5 border border-white/15 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 border border-cyan-500/20">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">About VVCE</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Vidyavardhaka College of Engineering (VVCE), Mysuru, is a premier autonomous institution renowned for academic excellence, state-of-the-art incubation centers, and innovative technical programs. VVCE actively fosters global chapter collaborations and entrepreneurship.
            </p>
          </div>

          <div className="rounded-3xl p-8 backdrop-blur-xl bg-white/5 border border-white/15 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-300 border border-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">About IEEE CIS</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              The IEEE Computational Intelligence Society (CIS) focuses on the theory, design, application, and development of biologically and linguistically motivated computational paradigms, emphasizing neural networks, evolutionary algorithms, fuzzy systems, and hybrid intelligent systems.
            </p>
          </div>
        </div>
      </section>

      {/* CHAPTER PILLARS / GOALS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">Strategic Chapter Pillars</h2>
          <p className="text-slate-400 text-sm mt-3">Empowering engineering students with end-to-end technical mastery</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-2xl p-7 backdrop-blur-xl bg-white/5 border border-white/15 text-center space-y-3 hover:border-cyan-400/40 transition">
            <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-300">
              <Code2 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">Technical Excellence</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hands-on coding sprints, deep-learning bootcamps, and competitive hackathons solving real-world challenges.
            </p>
          </div>

          <div className="rounded-2xl p-7 backdrop-blur-xl bg-white/5 border border-white/15 text-center space-y-3 hover:border-cyan-400/40 transition">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">Research &amp; Innovation</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mentorship for authoring IEEE research publications, patent drafting, and interdisciplinary AI projects.
            </p>
          </div>

          <div className="rounded-2xl p-7 backdrop-blur-xl bg-white/5 border border-white/15 text-center space-y-3 hover:border-cyan-400/40 transition">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-300">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">Industry Readiness</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Direct interaction with distinguished AI practitioners, alumni networking, and career mentorship sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
};
