'use client';

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { VisaAppointment } from '@/types/database'
import Container from '@/components/Container'
import StatusLabel from '@/components/StatusLabel'
import { Calendar, ArrowRight, Plus } from 'lucide-react'

export default function AppointmentsPage() {

  const { session, loading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [appointments, setAppointments] = useState<VisaAppointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = useCallback(async () => {

    if (!session?.user) {
      setAppointments([])
      setLoading(false)
      return
    }

    try {

      const { data, error } = await supabase
        .from('visa_appointments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) setAppointments(data)

    } catch (error) {

      console.error('Error fetching appointments:', error)

    } finally {

      setLoading(false)

    }

  }, [session])

  useEffect(() => {
    if (authLoading) return

    if (!session?.user) {
      setLoading(false)
      return
    }

    fetchAppointments()
  }, [session, authLoading, fetchAppointments])

  useEffect(() => {
    if (authLoading || !session?.user) return

    const channel = supabase
      .channel(`realtime-appointments-list-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visa_appointments',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, authLoading, fetchAppointments])

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
            {t.appointments.title}
          </h1>

          <p className="mt-2 max-w-2xl leading-relaxed ui-muted">
            {t.dashboard.appointments.subtitle}
          </p>

        </div>

        <Link
          href="/appointments/book"
          className="flex min-h-[52px] w-full transform-gpu items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-6 py-4 font-semibold text-white shadow-primary transition-all duration-200 motion-safe:hover:scale-105 hover:shadow-lg sm:w-auto"
        >
          <Plus size={18} />
          {t.appointments.bookNow}
        </Link>

      </div>

      {appointments.length === 0 ? (

        <div className="ui-card p-8 text-center shadow-md sm:p-10">

          <div className="mx-auto mb-4 w-fit rounded-xl bg-[#E8FFF4] p-3">
            <Calendar size={20} className="text-[#00B863]" />
          </div>

          <h3 className="mb-2 text-xl font-bold text-[#0B3948]">
            {t.appointments.noAppointments}
          </h3>

          <p className="mb-6 text-sm leading-relaxed ui-muted">
            {t.appointments.bookFirst}
          </p>

          <Link
            href="/appointments/book"
            className="inline-flex min-h-[52px] transform-gpu items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-6 py-4 font-semibold text-white shadow-primary transition-all duration-200 motion-safe:hover:scale-105 hover:shadow-lg"
          >
            <Plus size={18} />
            {t.appointments.bookNow}
          </Link>

        </div>

      ) : (

        <div className="space-y-4 sm:space-y-6">

          {appointments.map((appointment) => (

            <Link
              key={appointment.id}
              href={`/dashboard/appointments/${appointment.id}`}
              className="ui-card ui-card-hover group block transform-gpu p-5 transition-all duration-200 motion-safe:hover:scale-[1.01] sm:p-6"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-4 min-w-0 flex-1">

                  {/* ICON */}

                  <div className="flex-shrink-0 rounded-lg bg-[#E8FFF4] p-2 transition-all duration-200 group-hover:bg-[#D6FFE9]">

                    <Calendar size={18} className="text-[#00B863] transition-all duration-200 motion-safe:group-hover:scale-105" />

                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">

                    <h3 className="truncate text-xl font-bold text-[#0B3948]">

                      {appointment.country}

                    </h3>

                    <StatusLabel status={appointment.status} className="mt-3" />

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

                      <div className="space-y-1">
                        <p className="text-sm ui-muted">{t.appointments.type}</p>
                        <p className="font-semibold text-[#0B3948]">{appointment.visa_type}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm ui-muted">{t.appointments.month}</p>
                        <p className="font-semibold text-[#0B3948]">{appointment.appointment_month}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm ui-muted">{t.dashboard.recentAppointments.requested}</p>
                        <p className="font-semibold text-[#0B3948]">
                          {new Date(appointment.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                    </div>

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
