'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type HomepageStats = {
  visas: number;
  users: number;
  successRate: number;
  processingTime: string;
};

const FALLBACK_STATS: HomepageStats = {
  visas: 200,
  users: 50000,
  successRate: 98,
  processingTime: '24h',
};

export function useStats() {
  const [stats, setStats] = useState<HomepageStats>(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as HomepageStats;
      setStats({
        visas: data.visas ?? FALLBACK_STATS.visas,
        users: data.users ?? FALLBACK_STATS.users,
        successRate: data.successRate ?? FALLBACK_STATS.successRate,
        processingTime: data.processingTime ?? FALLBACK_STATS.processingTime,
      });
    } catch {
      // silent by requirement
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const intervalId = window.setInterval(() => {
      fetchStats();
    }, 10000);

    const channel = supabase
      .channel('stats-ui')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visas' }, fetchStats)
      .subscribe();

    return () => {
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}
