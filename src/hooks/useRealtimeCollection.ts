import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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
