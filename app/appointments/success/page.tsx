'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import Navbar from '@/components/Navbar'
import { CheckCircle } from 'lucide-react'

export default function AppointmentSuccessPage() {

const params = useSearchParams()
const { t, isRTL } = useLanguage()

const status = params.get('status')
const queue = params.get('queue')

const isPriority = status === 'priority_request'

return (

<div className="min-h-screen bg-gray-100">

<Navbar/>

<div className="max-w-4xl mx-auto px-4 py-16">

<div className="bg-white shadow-xl rounded-2xl p-8 sm:p-12 text-center">

{/* ICON */}

<div className="flex justify-center mb-6">

<div className="bg-emerald-100 p-4 rounded-full">

<CheckCircle
className="text-emerald-600"
size={60}
/>

</div>

</div>

{/* TITLE */}

<h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">

{t.appointments.success.title}

</h1>

<p className="text-gray-600 mb-8">

{t.appointments.success.message}

</p>

{/* STATUS BOX */}

<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">

<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">

<div>

<p className="text-sm text-gray-600">
{t.appointments.success.statusLabel}
</p>

<p className="text-lg font-semibold text-emerald-700 mt-1">

{isPriority ? t.appointments.success.priorityStatus : t.appointments.success.waitingStatus}

</p>

</div>

<div>

<p className="text-sm text-gray-600">
{t.appointments.success.queueLabel}
</p>

<p className="text-2xl font-bold text-gray-900 mt-1">
#{queue || '—'}
</p>

</div>

</div>

</div>

{/* INFO */}

<div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-sm text-gray-700">

<p className="mb-2">
{t.appointments.success.infoText1}
</p>

<p>
{t.appointments.success.infoText2}
</p>

</div>

{/* BUTTONS */}

<div className="flex flex-col sm:flex-row gap-4 justify-center">

<Link
href="/dashboard/appointments"
className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
>

{t.appointments.success.trackButton}

</Link>

<Link
href="/"
className="border border-gray-300 px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
>

{t.appointments.success.homeButton}

</Link>

</div>

</div>

</div>

</div>

)

}