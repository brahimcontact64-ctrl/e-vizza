'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export type HomepageStats = {
  visas: number;
  users: number;
  successRate: number;
  processingTime: string;
};

type StatsApiResponse = HomepageStats & {
  totalApplications?: number;
  approvedApplications?: number;
};

type ApplicationRealtimeRow = {
  status?: string;
};

type VisaRealtimeRow = {
  is_active?: boolean;
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
  const totalApplicationsRef = useRef(0);
  const approvedApplicationsRef = useRef(0);

  const applyApplicationTotals = useCallback((totalApplications: number, approvedApplications: number) => {
    totalApplicationsRef.current = Math.max(0, totalApplications);
    approvedApplicationsRef.current = Math.max(0, approvedApplications);

    const successRate =
      totalApplicationsRef.current > 0
        ? Math.round((approvedApplicationsRef.current / totalApplicationsRef.current) * 100)
        : FALLBACK_STATS.successRate;

    setStats((previous) => ({
      ...previous,
      successRate,
    }));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as StatsApiResponse;

      const totalApplications = data.totalApplications ?? 0;
      const approvedApplications = data.approvedApplications ?? 0;

      totalApplicationsRef.current = totalApplications;
      approvedApplicationsRef.current = approvedApplications;

      setStats({
        visas: data.visas ?? FALLBACK_STATS.visas,
        users: data.users ?? FALLBACK_STATS.users,
        successRate:
          totalApplications > 0
            ? Math.round((approvedApplications / totalApplications) * 100)
            : (data.successRate ?? FALLBACK_STATS.successRate),
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
  }, [fetchStats]);

  useRealtimeSubscription<ApplicationRealtimeRow>('applications', {
    onInsert: (row) => {
      const totalApplications = totalApplicationsRef.current + 1;
      const approvedApplications = approvedApplicationsRef.current + (row.status === 'approved' ? 1 : 0);
      applyApplicationTotals(totalApplications, approvedApplications);
    },
    onUpdate: (row, previousRow) => {
      const wasApproved = previousRow.status === 'approved';
      const isApproved = row.status === 'approved';

      if (wasApproved === isApproved) {
        return;
      }

      const approvedApplications = approvedApplicationsRef.current + (isApproved ? 1 : -1);
      applyApplicationTotals(totalApplicationsRef.current, approvedApplications);
    },
    onDelete: (row) => {
      const totalApplications = totalApplicationsRef.current - 1;
      const approvedApplications = approvedApplicationsRef.current - (row.status === 'approved' ? 1 : 0);
      applyApplicationTotals(totalApplications, approvedApplications);
    },
  });

  useRealtimeSubscription('profiles', {
    onInsert: () => {
      setStats((previous) => ({
        ...previous,
        users: previous.users + 1,
      }));
    },
    onDelete: () => {
      setStats((previous) => ({
        ...previous,
        users: Math.max(0, previous.users - 1),
      }));
    },
  });

  useRealtimeSubscription<VisaRealtimeRow>('visas', {
    onInsert: (row) => {
      if (!row.is_active) return;

      setStats((previous) => ({
        ...previous,
        visas: previous.visas + 1,
      }));
    },
    onUpdate: (row, previousRow) => {
      const wasActive = Boolean(previousRow.is_active);
      const isActive = Boolean(row.is_active);

      if (wasActive === isActive) return;

      setStats((previous) => ({
        ...previous,
        visas: Math.max(0, previous.visas + (isActive ? 1 : -1)),
      }));
    },
    onDelete: (row) => {
      if (!row.is_active) return;

      setStats((previous) => ({
        ...previous,
        visas: Math.max(0, previous.visas - 1),
      }));
    },
  });

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}
