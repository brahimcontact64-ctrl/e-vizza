'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { VisaAppointment } from '@/types/database'
import { Calendar, ArrowRight, Plus } from 'lucide-react'

export default function AppointmentsPage() {

  const { session } = useAuth()
  const { t } = useLanguage()

  const [appointments, setAppointments] = useState<VisaAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchAppointments()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchAppointments = async () => {

    if (!session?.user) return

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

  }

  const getStatusColor = (status: string) => {

    const colors: Record<string, string> = {

      pending: 'bg-yellow-100 text-yellow-700',
      waiting: 'bg-yellow-100 text-yellow-700',
      waiting_list: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-yellow-100 text-yellow-700',
      submitted: 'bg-green-100 text-green-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-red-100 text-red-700',

    }

    return colors[status] || 'bg-gray-100 text-gray-700'

  }

  const getStatusLabel = (status: string) => {

    const labels: Record<string, string> = {
      pending: 'Pending',
      waiting: 'Waiting',
      waiting_list: 'Waiting List',
      reviewing: 'Reviewing',
      submitted: 'Submitted',
      confirmed: 'Confirmed',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    }

    return labels[status] || status.replace(/_/g, ' ')

  }

  if (loading) {

    return (

      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">

        <div className="animate-pulse space-y-4">

          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>

        </div>

      </div>

    )

  }

  return (

    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">

        <div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t.appointments.title}
          </h1>

          <p className="text-gray-500 mt-2 leading-relaxed max-w-2xl">
            {t?.dashboard?.appointments?.subtitle || 'Manage your embassy appointments'}
          </p>

        </div>

        <Link
          href="/appointments/book"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 min-h-[52px] rounded-xl font-semibold shadow-md hover:shadow-lg motion-safe:hover:scale-105 transition-all duration-200 w-full sm:w-auto transform-gpu"
        >
          <Plus size={18} />
          {t.appointments.bookNow}
        </Link>

      </div>

      {appointments.length === 0 ? (

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-md">

          <div className="mx-auto mb-4 w-fit bg-teal-100 p-3 rounded-xl">
            <Calendar size={20} className="text-teal-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t.appointments.noAppointments}
          </h3>

          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {t.appointments.bookFirst}
          </p>

          <Link
            href="/appointments/book"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 min-h-[52px] rounded-xl font-semibold shadow-md hover:shadow-lg motion-safe:hover:scale-105 transition-all duration-200 transform-gpu"
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
              className="group block bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg motion-safe:hover:scale-[1.01] transition-all duration-200 transform-gpu"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-4 min-w-0 flex-1">

                  {/* ICON */}

                  <div className="bg-teal-100 p-2 rounded-lg flex-shrink-0 transition-all duration-200 group-hover:bg-teal-200">

                    <Calendar size={18} className="text-teal-600 transition-all duration-200 motion-safe:group-hover:scale-105" />

                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">

                    <h3 className="text-xl font-bold text-gray-900 truncate">

                      {appointment.country}

                    </h3>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold w-fit mt-3 ${getStatusColor(appointment.status)}`}
                    >

                      {getStatusLabel(appointment.status)}

                    </span>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

                      <div className="space-y-1">
                        <p className="text-gray-500 text-sm">{t.appointments.type}</p>
                        <p className="text-gray-900 font-semibold">{appointment.visa_type}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-gray-500 text-sm">{t.appointments.month}</p>
                        <p className="text-gray-900 font-semibold">{appointment.appointment_month}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-gray-500 text-sm">Requested</p>
                        <p className="text-gray-900 font-semibold">
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
                  className="text-gray-400 hidden sm:block flex-shrink-0 transition-all duration-200 motion-safe:group-hover:translate-x-0.5"
                />

              </div>

            </Link>

          ))}

        </div>

      )}

    </div>

  )

}
