import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { safeUrl } from '../lib/security';
import { ImageModal } from '../components/ImageModal';
import type { EventItem } from '../types/database';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setEvent(data as EventItem);
      }
      setLoading(false);
    };

    fetchDetail();

    // Subscribe to realtime updates for this specific event
    const channel = supabase
      .channel(`event-detail-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `id=eq.${id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setEvent(null);
          } else if (payload.new) {
            setEvent(payload.new as EventItem);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="h-96 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-slate-400 text-sm">
          The requested event could not be found or has been removed.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>
    );
  }

  const poster = safeUrl(event.poster_url);
  const stage = event.lifecycle_stage || 'upcoming';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>

      {/* Main Event Card */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Poster */}
        {poster !== '#' && (
          <div
            className="overflow-hidden rounded-2xl cursor-zoom-in group max-h-[460px] bg-slate-900 border border-white/10"
            onClick={() => setModalImg(poster)}
          >
            <img
              src={poster}
              alt={event.title}
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Title & Stage badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {event.title}
          </h1>
          <div>
            {stage === 'upcoming' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Registration Open</span>
              </span>
            ) : stage === 'stop' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                Registration Closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Event Completed</span>
              </span>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 text-sm">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Date</span>
            </div>
            <p className="font-semibold text-white">{event.event_date || 'TBA'}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Venue</span>
            </div>
            <p className="font-semibold text-white">{event.venue || 'VVCE Campus'}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mode</span>
            </div>
            <p className="font-semibold text-white">
              {event.event_mode === 'team'
                ? `Team (${event.team_size || 2}-${event.team_size || 4})`
                : 'Individual'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
              <span>Registration Fee</span>
            </div>
            <p className="font-semibold text-white">
              {event.registration_fee && event.registration_fee > 0
                ? `₹${event.registration_fee}`
                : 'Free'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">Event Overview</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* Call to action */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official IEEE CIS VVCE Verified Event</span>
          </div>

          <div>
            {stage === 'upcoming' ? (
              <Link
                to={`/register?event=${event.id}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <span>Register for Event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : stage === 'stop' ? (
              <div className="px-6 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                Registrations have been closed by organizers
              </div>
            ) : (
              <div className="px-6 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                This event has successfully concluded
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
};
