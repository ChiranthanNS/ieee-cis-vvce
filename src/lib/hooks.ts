import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { RealtimePostgresChangesPayload, User, Session } from '@supabase/supabase-js';

// ==========================================
// 1. REALTIME COLLECTION HOOK (Auto-Sync)
// ==========================================
interface UseRealtimeCollectionOptions<T extends { [key: string]: any }> {
  table: string;
  select?: string;
  orderColumn?: string;
  ascending?: boolean;
  filter?: (query: any) => any;
  onRealtimeChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtimeCollection<T extends { [key: string]: any } & { id?: number | string }>({
  table,
  select = '*',
  orderColumn,
  ascending = false,
  filter,
  onRealtimeChange,
}: UseRealtimeCollectionOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      let query: any = supabase.from(table).select(select);
      if (filter) {
        query = filter(query);
      }
      if (orderColumn) {
        query = query.order(orderColumn, { ascending });
      }

      const res = await query;
      if (res.error) throw res.error;
      setData(((res.data as unknown) as T[]) || []);
      setError(null);
    } catch (err: any) {
      console.error(`Error fetching table "${table}":`, err.message || err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [table, select, orderColumn, ascending]);

  useEffect(() => {
    fetchData();

    // Subscribe to Postgres Changes via Supabase Realtime
    const channelName = `${table}-realtime-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (onRealtimeChange) {
            onRealtimeChange(payload);
          }

          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as T;
            setData((prev) => {
              if (newRecord.id && prev.some((item) => item.id === newRecord.id)) {
                return prev;
              }
              return ascending ? [...prev, newRecord] : [newRecord, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedRecord = payload.new as T;
            setData((prev) =>
              prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
            );
          } else if (payload.eventType === 'DELETE') {
            const oldRecord = payload.old as Partial<T>;
            setData((prev) => prev.filter((item) => item.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, fetchData, ascending, onRealtimeChange]);

  return { data, loading, error, refetch: fetchData, setData };
}

// ==========================================
// 2. REALTIME STATS HOOK (Live Metrics)
// ==========================================
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

// ==========================================
// 3. ADMIN AUTH HOOK (Session Management)
// ==========================================
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, signOut, isAuthenticated: !!user };
}

