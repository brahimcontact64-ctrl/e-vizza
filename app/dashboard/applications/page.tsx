'use client';

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { Application } from '@/types/database'
import Container from '@/components/Container'
import StatusLabel from '@/components/StatusLabel'
import { FileText, ArrowRight, Plus } from 'lucide-react'

export default function ApplicationsPage() {

  const { session, loading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = useCallback(async () => {

    if (!session?.user) {
      setApplications([])
      setLoading(false)
      return
    }

    try {

      const { data, error } = await supabase
        .from('applications')
        .select('*, visa:visas(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) setApplications(data)

    } catch (error) {

      console.error('Error fetching applications:', error)

    } finally {

      setLoading(false)

    }

  }, [session])

  useEffect(() => {

    if (authLoading) return

    fetchApplications()

  }, [session, authLoading, fetchApplications])

  useEffect(() => {
    if (!session?.user) return

    const channel = supabase
      .channel(`realtime-apps-list-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          fetchApplications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, fetchApplications])

  if (loading) {

    return (

      <Container size="lg" className="py-10">

        <div className="animate-pulse space-y-4">

          <div className="h-8 w-1/3 rounded bg-[#E8F1EE]"></div>
          <div className="h-24 rounded-xl bg-[#E8F1EE]"></div>

        </div>

      </Container>

    )

  }

  return (

    <Container size="lg" className="py-10">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">

        <div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B3948]">
            {t.applications.title}
          </h1>

          <p className="mt-2 max-w-2xl leading-relaxed ui-muted">
            {t.dashboard.applications.subtitle}
          </p>

        </div>

        <Link
          href="/destinations"
          className="flex min-h-[52px] w-full transform-gpu items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-6 py-4 font-semibold text-white shadow-primary transition-all duration-200 motion-safe:hover:scale-105 hover:shadow-lg sm:w-auto"
        >
          <Plus size={18} />
          {t.dashboard.recentApplications.newApplication}
        </Link>

      </div>

      {applications.length === 0 ? (

        <div className="ui-card p-8 text-center sm:p-10">

          <div className="mx-auto mb-4 w-fit rounded-xl bg-[#E8FFF4] p-3">
            <FileText size={20} className="text-[#00B863]" />
          </div>

          <h3 className="mb-2 text-xl font-bold text-[#0B3948]">
            {t.applications.noApplications}
          </h3>

          <p className="mb-6 text-sm ui-muted">
            {t.applications.startJourney}
          </p>

          <Link
            href="/destinations"
            className="inline-flex min-h-[52px] transform-gpu items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-6 py-4 font-semibold text-white shadow-primary transition-all duration-200 motion-safe:hover:scale-105 hover:shadow-lg"
          >
            <Plus size={18} />
            {t.dashboard.applications.startApplication}
          </Link>

        </div>

      ) : (

        <div className="space-y-4 sm:space-y-6">

          {applications.map((app) => (

            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              className="ui-card ui-card-hover group block transform-gpu p-5 transition-all duration-200 motion-safe:hover:scale-[1.01] sm:p-6"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-4 min-w-0 flex-1">

                  {/* ICON */}

                  <div className="flex-shrink-0 rounded-lg bg-[#E8FFF4] p-2 transition-all duration-200 group-hover:bg-[#D6FFE9]">

                    <FileText size={18} className="text-[#00B863] transition-all duration-200 motion-safe:group-hover:scale-105" />

                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">

                    <h3 className="truncate text-xl font-bold text-[#0B3948]">

                      {app.visa?.country_name || t.dashboard.recentApplications.defaultTitle}

                    </h3>

                    <StatusLabel status={app.status} className="mt-3" />

                    {/* DETAILS */}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

                      <div className="space-y-1">

                        <span className="text-sm ui-muted">
                          {t.applications.visaType}
                        </span>

                        <p className="font-semibold text-[#0B3948]">
                          {app.visa?.visa_type}
                        </p>

                      </div>

                      <div className="space-y-1">

                        <span className="text-sm ui-muted">
                          {t.dashboard.applications.processingLabel}
                        </span>

                        <p className="font-semibold text-[#0B3948]">
                          {app.visa?.processing_time}
                        </p>

                      </div>

                      <div className="space-y-1">

                        <span className="text-sm ui-muted">
                          {t.applications.appliedOn}
                        </span>

                        <p className="font-semibold text-[#0B3948]">
                          {new Date(app.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>

                      </div>

                    </div>

                    {app.admin_notes && (

                      <div className="mt-4 rounded-xl bg-[#F1FFF8] p-3 text-sm text-[#00B863]">

                        <span className="font-semibold">
                          {t.dashboard.applications.adminNoteLabel}
                        </span>

                        {' '}
                        {app.admin_notes}

                      </div>

                    )}

                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="hidden flex-shrink-0 text-[#90A8AF] transition-all duration-200 motion-safe:group-hover:translate-x-0.5 sm:block"
                />

              </div>

            </Link>

          ))}

        </div>

      )}

    </Container>

  )

}
