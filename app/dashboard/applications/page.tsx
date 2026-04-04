'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { Application } from '@/types/database'
import { FileText, ArrowRight, Plus } from 'lucide-react'

export default function ApplicationsPage() {

  const { session, loading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (authLoading) return

    if (!session?.user) {
      setLoading(false)
      return
    }

    fetchApplications()

  }, [session, authLoading])

  const fetchApplications = async () => {

    if (!session?.user) return

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

  }

  const getStatusColor = (status: string) => {

    const colors: Record<string, string> = {

      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-green-100 text-green-700',
      reviewing: 'bg-yellow-100 text-yellow-700',
      sent_to_freelancer: 'bg-purple-100 text-purple-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      waiting_list: 'bg-yellow-100 text-yellow-700',

    }

    return colors[status] || 'bg-gray-100 text-gray-700'

  }

  const getStatusLabel = (status: string) => {

    const labels: Record<string, string> = {
      submitted: 'Submitted',
      reviewing: 'Reviewing',
      rejected: 'Rejected',
      approved: 'Approved',
      waiting_list: 'Waiting List',
      sent_to_freelancer: 'Sent to Freelancer',
      draft: 'Draft',
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
            {t.applications.title}
          </h1>

          <p className="text-gray-500 mt-2 leading-relaxed max-w-2xl">
            {t?.dashboard?.applications?.subtitle || 'Applications'}
          </p>

        </div>

        <Link
          href="/destinations"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 min-h-[52px] rounded-xl font-semibold shadow-md hover:shadow-lg motion-safe:hover:scale-105 transition-all duration-200 w-full sm:w-auto transform-gpu"
        >
          <Plus size={18} />
          {t.dashboard.recentApplications.newApplication}
        </Link>

      </div>

      {applications.length === 0 ? (

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-md">

          <div className="mx-auto mb-4 w-fit bg-teal-100 p-3 rounded-xl">
            <FileText size={20} className="text-teal-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t.applications.noApplications}
          </h3>

          <p className="text-gray-500 text-sm mb-6">
            {t.applications.startJourney}
          </p>

          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 min-h-[52px] rounded-xl font-semibold shadow-md hover:shadow-lg motion-safe:hover:scale-105 transition-all duration-200 transform-gpu"
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
              className="group block bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg motion-safe:hover:scale-[1.01] transition-all duration-200 transform-gpu"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-4 min-w-0 flex-1">

                  {/* ICON */}

                  <div className="bg-teal-100 p-2 rounded-lg flex-shrink-0 transition-all duration-200 group-hover:bg-teal-200">

                    <FileText size={18} className="text-teal-600 transition-all duration-200 motion-safe:group-hover:scale-105" />

                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">

                    <h3 className="text-xl font-bold text-gray-900 truncate">

                      {app.visa?.country_name || t.dashboard.recentApplications.defaultTitle}

                    </h3>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold w-fit mt-3 ${getStatusColor(app.status)}`}
                    >

                      {getStatusLabel(app.status)}

                    </span>

                    {/* DETAILS */}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

                      <div className="space-y-1">

                        <span className="text-gray-500 text-sm">
                          {t.applications.visaType}
                        </span>

                        <p className="text-gray-900 font-semibold">
                          {app.visa?.visa_type}
                        </p>

                      </div>

                      <div className="space-y-1">

                        <span className="text-gray-500 text-sm">
                          {t.dashboard.applications.processingLabel}
                        </span>

                        <p className="text-gray-900 font-semibold">
                          {app.visa?.processing_time}
                        </p>

                      </div>

                      <div className="space-y-1">

                        <span className="text-gray-500 text-sm">
                          {t.applications.appliedOn}
                        </span>

                        <p className="text-gray-900 font-semibold">
                          {new Date(app.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>

                      </div>

                    </div>

                    {app.admin_notes && (

                      <div className="mt-4 bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl">

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
