import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ChapterStats {
  events: number;
  participants: number;
  resources: number;
  projects: number;
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<ChapterStats>({
    events: 0,
    participants: 0,
    resources: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [eventsRes, regRes, resourcesRes, projectsRes] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.rpc('get_registration_count'),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
      ]);

      let regCount = 0;
      if (regRes.data != null && !regRes.error) {
        regCount = Number(regRes.data);
      } else {
        // Fallback: direct count if rpc has issue
        const fallback = await supabase.from('registrations').select('*', { count: 'exact', head: true });
        regCount = fallback.count ?? 0;
      }

      setStats({
        events: eventsRes.count ?? 0,
        participants: regCount,
        resources: resourcesRes.count ?? 0,
        projects: projectsRes.count ?? 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Multi-table realtime channel
    const channel = supabase
      .channel('chapter-stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
