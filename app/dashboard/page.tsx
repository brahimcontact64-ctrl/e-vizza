'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { Application, VisaAppointment } from '@/types/database'
import { FileText, Calendar, ArrowRight, Plus } from 'lucide-react'

export default function DashboardPage(){

const { session, profile } = useAuth()
const { t, isRTL } = useLanguage()

const [applications,setApplications] = useState<Application[]>([])
const [appointments,setAppointments] = useState<VisaAppointment[]>([])
const [loading,setLoading] = useState(true)

useEffect(()=>{
if(session?.user){
fetchData()
}
},[session])

const fetchData = async ()=>{

try{

const [apps,appts] = await Promise.all([

supabase
.from('applications')
.select('*,visa:visas(*)')
.eq('user_id',session!.user.id)
.order('created_at',{ascending:false})
.limit(3),

supabase
.from('visa_appointments')
.select('*')
.eq('user_id',session!.user.id)
.order('created_at',{ascending:false})
.limit(3)

])

if(apps.data) setApplications(apps.data)
if(appts.data) setAppointments(appts.data)

}catch(err){

console.error(err)

}finally{

setLoading(false)

}

}

const getStatusColor = (status:string)=>{

const map:Record<string,string>={

submitted:"bg-blue-50 text-blue-700 border-blue-200",

reviewing:"bg-yellow-50 text-yellow-700 border-yellow-200",

approved:"bg-green-50 text-green-700 border-green-200",

rejected:"bg-red-50 text-red-700 border-red-200",

pending:"bg-orange-50 text-orange-700 border-orange-200",

confirmed:"bg-green-50 text-green-700 border-green-200"

}

return map[status] || "bg-gray-50 text-gray-700 border-gray-200"

}

const getFlag=(country?:string)=>{

const flags:Record<string,string>={

Azerbaijan:"🇦🇿",
France:"🇫🇷",
Turkey:"🇹🇷",
Portugal:"🇵🇹"

}

if(!country) return "🌍"

return flags[country] || "🌍"

}

if(loading){

return(

<div className="max-w-7xl mx-auto py-10 px-6">

<div className="animate-pulse space-y-6">

<div className="h-20 bg-gray-200 rounded-xl"></div>

<div className="grid md:grid-cols-2 gap-6">

<div className="h-60 bg-gray-200 rounded-xl"></div>
<div className="h-60 bg-gray-200 rounded-xl"></div>

</div>

</div>

</div>

)

}

return(

<div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">

{/* Header */}

<div className="mb-10">

<h1 className="text-3xl sm:text-4xl font-bold text-gray-900">

Welcome back, {profile?.full_name || session?.user.email}

</h1>

<p className="text-gray-500 mt-1">

Manage your visa applications and appointments

</p>

</div>

{/* Quick actions */}

<div className="grid md:grid-cols-2 gap-6 mb-10">

<Link
href="/apply/new"
className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 sm:p-6 rounded-3xl min-h-[170px] shadow hover:scale-[1.02] transition"
>

<div className="flex flex-col justify-between h-full">

<div>

<h3 className="text-lg font-semibold">
{t?.dashboard?.home?.applyVisa || 'Apply Visa'}
</h3>

<p className="text-white/80 text-sm">
{t?.dashboard?.home?.applyDescription || 'Start a new visa application'}
</p>

</div>

<Plus size={32}/>

</div>

</Link>

<Link
href="/appointments/book"
className="bg-white border border-gray-200 p-5 sm:p-6 rounded-3xl min-h-[170px] shadow-sm hover:shadow-md transition"
>

<div className="flex flex-col justify-between h-full">

<div>

<h3 className="text-lg font-semibold text-gray-900">
{t.dashboard.home.bookAppointment}
</h3>

<p className="text-gray-500 text-sm">
{t.dashboard.home.bookDescription}
</p>

</div>

<Calendar size={32} className="text-gray-600"/>

</div>

</Link>

</div>

{/* Content */}

<div className="grid lg:grid-cols-2 gap-10">

{/* Applications */}

<div>

<div className="flex justify-between items-center mb-5">

<h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">

<FileText size={18} className="text-emerald-600"/>

{t.dashboard.recentApplications.title}

</h2>

<Link
href="/dashboard/applications"
className="text-sm text-emerald-600 flex items-center gap-1"
>

{t.dashboard.recentApplications.viewAll}

<ArrowRight size={16}/>

</Link>

</div>

<div className="bg-white border rounded-xl shadow-sm divide-y min-h-[220px]">

{applications.length === 0 ?(

<div className="p-10 text-center">

<FileText size={40} className="mx-auto text-gray-300 mb-3"/>

<h3 className="font-semibold text-gray-900">
{t.dashboard.recentApplications.empty}
</h3>

<p className="text-gray-500 text-sm mt-1">
{t.dashboard.recentApplications.startFirst}
</p>

</div>

):(applications.map(app=>(

<Link
key={app.id}
href={`/dashboard/applications/${app.id}`}
className="block px-4 sm:px-6 py-5 sm:py-6 hover:bg-gray-50 hover:scale-[1.01] transition-all rounded-3xl"
>

<div className="flex items-center justify-between">

<div className="flex items-start gap-3">

<div className="bg-emerald-100 p-2 rounded-lg">
<FileText size={18} className="text-emerald-600"/>
</div>

<div>

<div className="flex items-center gap-2">

<span className="text-lg">
{getFlag(app.visa?.country_name)}
</span>

<h3 className="font-semibold text-gray-900">
{app.visa?.country_name || t.dashboard.recentApplications.defaultTitle}
</h3>

</div>

<p className="text-sm text-gray-500">
{app.visa?.visa_type}
</p>

<p className="text-xs text-gray-400 mt-1">
{(t?.dashboard?.recentApplications?.submitted || 'Submitted {date}').replace('{date}', new Date(app.created_at).toLocaleDateString())}
</p>

</div>

</div>

<span
className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}
>

{app.status}

</span>

</div>

</Link>

)))}

</div>

</div>

{/* Appointments */}

<div>

<div className="flex justify-between items-center mb-5">

<h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">

<Calendar size={18} className="text-blue-600"/>

{t.dashboard.recentAppointments.title}

</h2>

<Link
href="/dashboard/appointments"
className="text-sm text-blue-600 flex items-center gap-1"
>

{t.dashboard.recentAppointments.viewAll}

<ArrowRight size={16}/>

</Link>

</div>

<div className="bg-white border rounded-xl shadow-sm divide-y min-h-[220px]">

{appointments.length === 0 ?(

<div className="p-10 text-center">

<Calendar size={40} className="mx-auto text-gray-300 mb-3"/>

<h3 className="font-semibold text-gray-900">
{t.dashboard.recentAppointments.empty}
</h3>

</div>

):(appointments.map(appt=>(

<Link
key={appt.id}
href={`/dashboard/appointments/${appt.id}`}
className="block px-4 sm:px-6 py-5 sm:py-6 hover:bg-gray-50 hover:scale-[1.01] transition-all rounded-3xl"
>

<div className="flex items-center justify-between">

<div className="flex items-start gap-3">

<div className="bg-blue-100 p-2 rounded-lg">
<Calendar size={18} className="text-blue-600"/>
</div>

<div>

<div className="flex items-center gap-2">

<span className="text-lg">
{getFlag(appt.country)}
</span>

<h3 className="font-semibold text-gray-900">
{appt.country || t.dashboard.recentAppointments.defaultTitle}
</h3>

</div>

<p className="text-sm text-gray-500">
{appt.visa_type}
</p>

<p className="text-xs text-gray-400 mt-1">
{appt.appointment_month}
</p>

</div>

</div>

<span
className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appt.status)}`}
>

{appt.status}

</span>

</div>

</Link>

)))}

</div>

</div>

</div>

</div>

)

}