'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import Container from '@/components/Container'
import { CheckCircle } from 'lucide-react'

export default function AppointmentSuccessPage() {

const params = useSearchParams()
const { t } = useLanguage()

const status = params.get('status')
const queue = params.get('queue')

const isPriority = status === 'priority_request'

return (

	<div className="min-h-screen bg-background">
		<Navbar />

		<Container size="md" className="py-16">
			<Card padding="lg" className="text-center">
				<div className="mb-6 flex justify-center">
					<div className="rounded-full bg-[#E8FFF4] p-4">
						<CheckCircle className="text-[#00B863]" size={60} />
					</div>
				</div>

				<h1 className="mb-3 text-2xl font-bold text-[#0B3948] sm:text-3xl">
					{t.appointments.success.title}
				</h1>

				<p className="mb-8 ui-muted">{t.appointments.success.message}</p>

				<div className="mb-8 rounded-2xl border border-[#BFEFD8] bg-[#F1FFF8] p-6">
					<div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2">
						<div>
							<p className="text-sm ui-muted">{t.appointments.success.statusLabel}</p>
							<p className="mt-1 text-lg font-semibold text-[#00B863]">
								{isPriority ? t.appointments.success.priorityStatus : t.appointments.success.waitingStatus}
							</p>
						</div>

						<div>
							<p className="text-sm ui-muted">{t.appointments.success.queueLabel}</p>
							<p className="mt-1 text-2xl font-bold text-[#0B3948]">#{queue || '—'}</p>
						</div>
					</div>
				</div>

				<div className="mb-8 rounded-2xl border border-[#DDEAE5] bg-[#F7FBFA] p-6 text-sm text-[#355865]">
					<p className="mb-2">{t.appointments.success.infoText1}</p>
					<p>{t.appointments.success.infoText2}</p>
				</div>

				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Link
						href="/dashboard/appointments"
						className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-6 font-semibold text-white"
					>
						{t.appointments.success.trackButton}
					</Link>

					<Link
						href="/"
						className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#DDEAE5] px-6 font-semibold text-[#355865] transition hover:bg-[#F1F7F5]"
					>
						{t.appointments.success.homeButton}
					</Link>
				</div>
			</Card>
		</Container>
	</div>
)

}