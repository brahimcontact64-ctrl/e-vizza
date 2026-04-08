'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { Upload, CheckCircle } from 'lucide-react'

const COUNTRIES = ['China', 'Portugal', 'Turkey', 'France', 'Saudi Arabia']

const VISA_TYPES = [
  'Tourism',
  'Business',
  'Study',
  'Work',
  'Medical',
  'Transit',
  'Family Visit',
]

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

/* ---------- REGISTRATION WINDOW ---------- */

const isRegistrationOpen = () => {
  const today = new Date().getDate()
  return today >= 1 && today <= 15
}

const getNextOpeningDate = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

/* ---------- MONTHS ---------- */

const generateMonths = () => {
  const arr: string[] = []
  const now = new Date()

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    arr.push(d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
  }

  return arr
}

type QuotaInfo = {
  priority_slots_used: number
  priority_slots_remaining: number
  waiting_list_used: number
  waiting_list_remaining: number
  total_requests: number
  total_remaining: number
}

export default function BookAppointmentPage() {

  const router = useRouter()
  const { session, loading: authLoading } = useAuth()
  const { t } = useLanguage()

  const months = useMemo(() => generateMonths(), [])

  const [country, setCountry] = useState<string>('')
  const [visaType, setVisaType] = useState<string>('')
  const [month, setMonth] = useState<string>('')
  const [passport, setPassport] = useState<File | null>(null)

  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null)

  const [loading, setLoading] = useState(false)
  const [quotaLoading, setQuotaLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
const [passportValid, setPassportValid] = useState<boolean | null>(null)

  /* ---------- COUNTDOWN ---------- */

  const [countdown, setCountdown] = useState('')

  useEffect(() => {

    if (isRegistrationOpen()) return

    const interval = setInterval(() => {

      const now = new Date()
      const next = getNextOpeningDate()

      const diff = next.getTime() - now.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)

      setCountdown(`${days}d ${hours}h ${minutes}m`)

    }, 1000)

    return () => clearInterval(interval)

  }, [t])

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/auth/login?redirect=/appointments/book')
    }
  }, [session, authLoading, router])

  const parseSelectedMonth = useCallback((selectedMonth: string) => {
    const [monthName, yearStr] = selectedMonth.split(' ')
    const parsedMonth = MONTH_NAMES.indexOf(monthName) + 1
    const parsedYear = parseInt(yearStr, 10)

    if (!parsedMonth || Number.isNaN(parsedYear)) {
      throw new Error(t.appointments.book.errors.invalidMonth)
    }

    return { parsedMonth, parsedYear }
  }, [])

 const uploadPassport = async () => {

  if (!passport || !session?.user) return null

  const ext = passport.name.split('.').pop() || 'pdf'
  const name = `${Date.now()}.${ext}`
  const path = `appointments/${session.user.id}/${name}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, passport)

  if (uploadError) throw uploadError

  return path
}
    /* ---------- VERIFY PASSPORT ---------- */

const verifyPassport = async (file: File) => {

  try {

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(
      'https://rvsaxetlfqfzkqsevgbt.supabase.co/functions/v1/verify-passport',
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await res.json()

    if (!res.ok) throw new Error(data.error || t.appointments.book.errors.verificationFailed)

    return data

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : t.appointments.book.errors.verificationFailed
    throw new Error(message)

  }

}
  
  const fetchQuota = useCallback(async () => {
    if (!country || !month) {
      setQuotaInfo(null)
      return
    }

    try {
      setQuotaLoading(true)

      const { parsedMonth, parsedYear } = parseSelectedMonth(month)

      const { data, error: countError } = await supabase
        .from('visa_appointments')
        .select('id,status', { count: 'exact' })
        .eq('country', country)
        .eq('month', parsedMonth)
        .eq('year', parsedYear)

      if (countError) throw countError

      const rows = data || []

      const priorityUsed = rows.filter(
        (row) => row.status === 'priority_request'
      ).length

      const waitingUsed = rows.filter(
        (row) => row.status === 'waiting_list'
      ).length

      const total = rows.length

      setQuotaInfo({
        priority_slots_used: priorityUsed,
        priority_slots_remaining: Math.max(0, 5 - priorityUsed),
        waiting_list_used: waitingUsed,
        waiting_list_remaining: Math.max(0, 10 - waitingUsed),
        total_requests: total,
        total_remaining: Math.max(0, 15 - total),
      })
    } catch (e) {
      console.error('Error fetching quota:', e)
      setQuotaInfo(null)
    } finally {
      setQuotaLoading(false)
    }
  }, [country, month, parseSelectedMonth])

  useEffect(() => {
    fetchQuota()

    const interval = setInterval(() => {
      fetchQuota()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchQuota])

  useEffect(() => {
    if (authLoading || !session?.user) return

    const channel = supabase
      .channel(`realtime-appointments-quota-${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visa_appointments' },
        () => {
          fetchQuota()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, authLoading, fetchQuota])

  const submit = async () => {
    if (!session?.user) {
      alert(t.appointments.book.errors.sessionExpired)
      router.push('/auth/login?redirect=/appointments/book')
      return
    }

    if (!country || !visaType || !month || !passport) {
      setError(t.appointments.book.errors.fillAllFields)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: windowData, error: windowError } = await supabase.rpc(
        'check_registration_window'
      )

      if (windowError) throw windowError

      if (!windowData) {
        alert(t.appointments.book.errors.registrationClosed)
        return
      }

      const { parsedMonth, parsedYear } = parseSelectedMonth(month)

      const { data: existingRows, error: existingError } = await supabase
        .from('visa_appointments')
        .select('id,status')
        .eq('country', country)
        .eq('month', parsedMonth)
        .eq('year', parsedYear)

      if (existingError) throw existingError

      const existing = existingRows || []
      const total = existing.length

      if (total >= 15) {
        alert(t.appointments.book.errors.slotsFull.replace('{country}', country).replace('{month}', month))
        await fetchQuota()
        return
      }

      let status = 'priority_request'
      const queuePosition = total + 1

      if (total >= 5) {
        status = 'waiting_list'
      }

     /* ---------- VERIFY PASSPORT FIRST ---------- */

const verification = await verifyPassport(passport)

if (!verification.valid) {
  setError(t.appointments.book.errors.invalidPassport)
  setLoading(false)
  return
}

/* ---------- THEN UPLOAD ---------- */

const file = await uploadPassport()

      if (!file) {
        throw new Error(t.appointments.book.errors.uploadFailed)
      }

      const { error: insertError } = await supabase.from('visa_appointments').insert({
        user_id: session.user.id,
        country,
        visa_type: visaType,
        appointment_month: month,
        month: parsedMonth,
        year: parsedYear,
        queue_position: queuePosition,
        passport_file: file,
        status,
        registration_date: new Date().toISOString().split('T')[0],
      })

      if (insertError) throw insertError

  router.refresh()
      router.push(`/appointments/success?status=${status}&queue=${queuePosition}`)
      
    } catch (error: unknown) {
      console.error(error)
      const message = error instanceof Error ? error.message : t.appointments.book.errors.fillAllFields
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00B863] border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!session) return null

  /* ---------- CLOSED PAGE ---------- */

  if (!isRegistrationOpen()) {
    return (
      <div className="min-h-screen bg-background">

        <Navbar />

        <div className="flex items-center justify-center h-[70vh] px-6">

          <div className="ui-card max-w-lg p-10 text-center">

            <h1 className="mb-4 text-3xl font-bold text-[#0B3948]">
              {t.appointments.book.closedTitle}
            </h1>

            <p className="mb-6 ui-muted">
              {t.appointments.book.closedMessage}
            </p>

            <p className="text-[#355865]">
              {t.appointments.book.nextOpening}
            </p>

            <div className="mt-3 text-4xl font-bold text-[#00B863]">
              {countdown}
            </div>

          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="bg-gradient-to-r from-[#0B3948] to-[#0E5167] py-12 text-white sm:py-14">
        <Container size="md">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t.appointments.book.title}
          </h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">
            {t.appointments.book.subtitle}
          </p>
        </Container>
      </div>
 <Container size="md" className="py-8 sm:py-12">
        <Card className="space-y-8" padding="md">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <h2 className="mb-2 text-lg font-bold text-[#0B3948]">{t.appointments.book.countryLabel}</h2>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="ui-input text-base font-medium"
            >
              <option value="">{t.appointments.book.countryPlaceholder}</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold text-[#0B3948]">{t.appointments.book.visaTypeLabel}</h2>

            <select
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              className="ui-input text-base font-medium"
            >
              <option value="">{t.appointments.book.visaTypePlaceholder}</option>
              {VISA_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold text-[#0B3948]">
              {t.appointments.book.monthLabel}
            </h2>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="ui-input text-base font-medium"
            >
              <option value="">{t.appointments.book.monthPlaceholder}</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[#BFEFD8] bg-[#F1FFF8] p-4">
            <h3 className="mb-2 text-lg font-bold text-[#00B863]">
              {t.appointments.book.remainingSlots.replace('{country}', country ? `for ${country}` : '')}
            </h3>

            {!country || !month ? (
              <p className="text-sm text-[#355865]">
                {t.appointments.book.selectToViewSlots}
              </p>
            ) : quotaLoading ? (
              <p className="text-sm text-[#355865]">{t.appointments.book.loadingSlots}</p>
            ) : quotaInfo ? (
              <div className="space-y-1 text-sm text-[#355865]">
                <p>
                  {t.appointments.book.quotaLabels.priorityUsed.replace('{used}', quotaInfo.priority_slots_used.toString())}
                </p>
                <p>
                  {t.appointments.book.quotaLabels.priorityRemaining.replace('{remaining}', quotaInfo.priority_slots_remaining.toString())}
                </p>
                <p>
                  {t.appointments.book.quotaLabels.waitingUsed.replace('{used}', quotaInfo.waiting_list_used.toString())}
                </p>
                <p>
                  {t.appointments.book.quotaLabels.waitingRemaining.replace('{remaining}', quotaInfo.waiting_list_remaining.toString())}
                </p>
                <p>
                  {t.appointments.book.quotaLabels.totalRequests.replace('{total}', quotaInfo.total_requests.toString())}
                </p>
                <p>
                  {t.appointments.book.quotaLabels.totalRemaining.replace('{remaining}', quotaInfo.total_remaining.toString())}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#355865]">
                {t.appointments.book.unableLoadSlots}
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold text-[#0B3948]">
              {t.appointments.book.passportLabel}
            </h2>

            <label className="block cursor-pointer">
              <div className="rounded-2xl border-2 border-dashed border-[#DDEAE5] p-6 text-center transition hover:border-[#00D474] sm:p-10">
                {passport ? (
                  <div>
                    <CheckCircle
                      className="mx-auto mb-3 text-[#00B863]"
                      size={40}
                    />
                    <p className="break-all text-sm font-semibold text-[#0B3948] sm:text-base">
                      {passport.name}
                    </p>
                    <p className="mt-1 text-xs text-[#6D8790]">
                      {(passport.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-3 text-[#90A8AF]" size={40} />
                    <p className="font-medium text-[#355865]">{t.appointments.book.passportUpload}</p>
                    <p className="text-sm text-[#6D8790]">{t.appointments.book.passportFormat}</p>
                  </div>
                )}
              </div>

             <input
  type="file"
  accept="image/*,application/pdf"
  className="hidden"
  onChange={async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPassport(file)
    setPassportValid(null)
    setVerifying(true)
    setError('')

    try {
      const res = await verifyPassport(file)

      if (res.valid) {
        setPassportValid(true)
      } else {
        setPassportValid(false)
        setError(t.appointments.book.errors.invalidPassport)
      }
    } catch {
      setPassportValid(false)
      setError(t.appointments.book.errors.verificationFailed)
    } finally {
      setVerifying(false)
    }
  }}
/>
            </label>
            {verifying && (
  <p className="mt-3 text-sm text-[#0E7490]">
    {t.appointments.book.verification.verifying}
  </p>
)}

{passportValid === true && (
  <p className="mt-3 text-sm font-semibold text-[#00B863]">
    {t.appointments.book.verification.verified}
  </p>
)}

{passportValid === false && (
  <p className="mt-3 text-sm font-semibold text-red-600">
    {t.appointments.book.verification.invalid}
  </p>
)}
          </div>

          <Button
            onClick={submit}
            disabled={loading || verifying || passportValid === false}
            fullWidth
            size="lg"
          >
            {loading ? t.appointments.book.buttons.submitting : t.appointments.book.buttons.submit}
          </Button>
        </Card>
      </Container>
    </div>
  )
}