import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_STATS = {
  visas: 200,
  users: 50000,
  successRate: 98,
  processingTime: '24h',
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase server environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const [visasRes, usersRes, totalAppsRes, approvedAppsRes] = await Promise.all([
      supabaseAdmin
        .from('visas')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
    ]);

    const visas = visasRes.count ?? FALLBACK_STATS.visas;
    const users = usersRes.count ?? FALLBACK_STATS.users;
    const totalApplications = totalAppsRes.count ?? 0;
    const approvedApplications = approvedAppsRes.count ?? 0;

    const successRate =
      totalApplications > 0
        ? Math.round((approvedApplications / totalApplications) * 100)
        : FALLBACK_STATS.successRate;

    return NextResponse.json({
      visas,
      users,
      successRate,
      processingTime: FALLBACK_STATS.processingTime,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(FALLBACK_STATS);
  }
}
