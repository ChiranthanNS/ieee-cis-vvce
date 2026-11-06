import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, Image as ImageIcon } from 'lucide-react';
import type { EventItem } from '../types/database';
import { safeUrl } from '../lib/security';

interface EventCardProps {
  event: EventItem;
  onImageClick?: (url: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onImageClick }) => {
  const poster = safeUrl(event.poster_url);
  const stage = event.lifecycle_stage || 'upcoming';

  return (
    <div className="flex flex-col rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 group">
      {/* Poster Image */}
      {poster !== '#' ? (
        <div
          className="relative overflow-hidden rounded-xl mb-5 h-48 bg-slate-900 cursor-zoom-in"
          onClick={() => onImageClick && onImageClick(poster)}
        >
          <img
            src={poster}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl mb-5 h-40 bg-slate-900/50 border border-white/5 text-slate-600">
          <ImageIcon className="w-10 h-10 stroke-1 text-slate-500" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
        <Link to={`/events/${event.id}`} className="hover:underline">
          {event.title}
        </Link>
      </h3>

      {/* Meta tags */}
      <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{event.event_date || 'TBA'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{event.venue || 'VVCE Campus'}</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-slate-300 text-sm leading-relaxed flex-1 line-clamp-3">
        {event.description}
      </p>

      {/* Badges */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs font-medium">
            <Users className="w-3 h-3" />
            {event.event_mode === 'team'
              ? `Team (${event.team_size || 2}-${event.team_size || 4})`
              : 'Individual'}
          </span>
          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-indigo-400/15 border border-indigo-400/30 text-indigo-300 text-xs font-medium">
            {event.registration_fee && event.registration_fee > 0 ? (
              <>
                <IndianRupee className="w-3 h-3" />
                <span>{event.registration_fee}</span>
              </>
            ) : (
              'Free'
            )}
          </span>
        </div>

        {/* Action Button */}
        <div>
          {stage === 'upcoming' ? (
            <Link
              to={`/events/${event.id}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Details &amp; Register →
            </Link>
          ) : stage === 'stop' ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
              Closed
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
