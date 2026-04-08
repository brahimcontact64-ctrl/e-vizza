'use client';

import { useEffect, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeSubscriptionOptions<Row extends object> {
  schema?: string;
  filter?: string;
  enabled?: boolean;
  channelName?: string;
  onInsert?: (row: Row) => void;
  onUpdate?: (row: Row, previousRow: Row) => void;
  onDelete?: (row: Row) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<Row>) => void;
}

export function useRealtimeSubscription<Row extends object>(
  table: string,
  options: UseRealtimeSubscriptionOptions<Row> = {}
) {
  const {
    schema = 'public',
    filter,
    enabled = true,
    channelName,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
  } = options;

  const callbacksRef = useRef({
    onInsert,
    onUpdate,
    onDelete,
    onChange,
  });

  useEffect(() => {
    callbacksRef.current = {
      onInsert,
      onUpdate,
      onDelete,
      onChange,
    };
  }, [onInsert, onUpdate, onDelete, onChange]);

  useEffect(() => {
    if (!enabled) return;

    const resolvedChannelName =
      channelName ?? `realtime-${table}-${filter ?? 'all'}-${Math.random().toString(36).slice(2, 8)}`;

    const channel: RealtimeChannel = supabase
      .channel(resolvedChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<Row>) => {
          callbacksRef.current.onChange?.(payload);

          const eventType = payload.eventType as RealtimeEvent;

          if (eventType === 'INSERT') {
            callbacksRef.current.onInsert?.(payload.new as Row);
          }

          if (eventType === 'UPDATE') {
            callbacksRef.current.onUpdate?.(payload.new as Row, payload.old as Row);
          }

          if (eventType === 'DELETE') {
            callbacksRef.current.onDelete?.(payload.old as Row);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, enabled, filter, schema, table]);
}
