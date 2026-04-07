'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Application, VisaAppointment } from '@/types/database';
import Container from '@/components/Container';
import StatusLabel from '@/components/StatusLabel';
import { FileText, Calendar, ArrowRight, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [applications, setApplications] = useState<Application[]>([]);
  const [appointments, setAppointments] = useState<VisaAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session?.user) {
      setApplications([]);
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      const [apps, appts] = await Promise.all([
        supabase
          .from('applications')
          .select('*,visa:visas(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3),

        supabase
          .from('visa_appointments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      if (apps.data) setApplications(apps.data);
      if (appts.data) setAppointments(appts.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [session, authLoading, fetchData]);

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel(`realtime-apps-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visa_appointments',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchData]);

  const getFlag = (country?: string) => {
    const flags: Record<string, string> = {
      Azerbaijan: '🇦🇿',
      France: '🇫🇷',
      Turkey: '🇹🇷',
      Portugal: '🇵🇹',
    };

    if (!country) return '🌍';
    return flags[country] || '🌍';
  };

  if (loading) {
    return (
      <Container className="py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-20 rounded-2xl bg-[#E8F1EE]" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-60 rounded-2xl bg-[#E8F1EE]" />
            <div className="h-60 rounded-2xl bg-[#E8F1EE]" />
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 pb-32">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#0B3948] sm:text-4xl">
          {t.dashboard.home.welcome.replace('{name}', profile?.full_name || session?.user.email || '')}
        </h1>
        <p className="mt-1 ui-muted">{t.dashboard.home.subtitle}</p>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <Link
          href="/destinations"
          className="ui-card ui-card-hover min-h-[170px] bg-gradient-to-r from-[#00D474] to-[#00B863] p-5 text-white sm:p-6"
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t.dashboard.home.applyVisa}</h3>
              <p className="text-sm text-white/80">{t.dashboard.home.applyDescription}</p>
            </div>
            <Plus size={32} />
          </div>
        </Link>

        <Link href="/appointments/book" className="ui-card ui-card-hover min-h-[170px] p-5 sm:p-6">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0B3948]">{t.dashboard.home.bookAppointment}</h3>
              <p className="text-sm ui-muted">{t.dashboard.home.bookDescription}</p>
            </div>
            <Calendar size={32} className="text-[#5F7B84]" />
          </div>
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0B3948]">
              <FileText size={18} className="text-[#00B863]" />
              {t.dashboard.recentApplications.title}
            </h2>
            <Link href="/dashboard/applications" className="flex items-center gap-1 text-sm text-[#00B863]">
              {t.dashboard.recentApplications.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ui-card min-h-[220px] divide-y p-0">
            {applications.length === 0 ? (
              <div className="p-10 text-center">
                <FileText size={40} className="mx-auto mb-3 text-[#A8BDC3]" />
                <h3 className="font-semibold text-[#0B3948]">{t.dashboard.recentApplications.empty}</h3>
                <p className="mt-1 text-sm ui-muted">{t.dashboard.recentApplications.startFirst}</p>
              </div>
            ) : (
              applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="block rounded-3xl px-4 py-5 transition-all hover:bg-[#F1F7F5] hover:scale-[1.01] sm:px-6 sm:py-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[#E8FFF4] p-2">
                        <FileText size={18} className="text-[#00B863]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlag(app.visa?.country_name)}</span>
                          <h3 className="font-semibold text-[#0B3948]">
                            {app.visa?.country_name || t.dashboard.recentApplications.defaultTitle}
                          </h3>
                        </div>

                        <p className="text-sm ui-muted">{app.visa?.visa_type}</p>
                        <p className="mt-1 text-xs text-[#7C969F]">
                          {t.dashboard.recentApplications.submitted.replace(
                            '{date}',
                            new Date(app.created_at).toLocaleDateString()
                          )}
                        </p>
                      </div>
                    </div>

                    <StatusLabel status={app.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0B3948]">
              <Calendar size={18} className="text-[#00B863]" />
              {t.dashboard.recentAppointments.title}
            </h2>
            <Link href="/dashboard/appointments" className="flex items-center gap-1 text-sm text-[#00B863]">
              {t.dashboard.recentAppointments.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ui-card min-h-[220px] divide-y p-0">
            {appointments.length === 0 ? (
              <div className="p-10 text-center">
                <Calendar size={40} className="mx-auto mb-3 text-[#A8BDC3]" />
                <h3 className="font-semibold text-[#0B3948]">{t.dashboard.recentAppointments.empty}</h3>
              </div>
            ) : (
              appointments.map((appt) => (
                <Link
                  key={appt.id}
                  href={`/dashboard/appointments/${appt.id}`}
                  className="block rounded-3xl px-4 py-5 transition-all hover:bg-[#F1F7F5] hover:scale-[1.01] sm:px-6 sm:py-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[#E8FFF4] p-2">
                        <Calendar size={18} className="text-[#00B863]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlag(appt.country)}</span>
                          <h3 className="font-semibold text-[#0B3948]">
                            {appt.country || t.dashboard.recentAppointments.defaultTitle}
                          </h3>
                        </div>

                        <p className="text-sm ui-muted">{appt.visa_type}</p>
                        <p className="mt-1 text-xs text-[#7C969F]">{appt.appointment_month}</p>
                      </div>
                    </div>

                    <StatusLabel status={appt.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Persistent Apply CTA — always visible, clears the floating WhatsApp button */}
      <div className="mt-10">
        <Link
          href="/destinations"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] py-4 text-base font-semibold text-white shadow-lg shadow-[#00D474]/30 transition-all hover:opacity-90 hover:scale-[1.01] active:scale-100"
        >
          <Plus size={20} />
          {t.dashboard.home.applyVisa}
        </Link>
      </div>
    </Container>
  );
}
