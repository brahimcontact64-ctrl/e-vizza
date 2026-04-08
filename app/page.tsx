'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Visa } from '@/types/database';
import Navbar from '@/components/Navbar';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useStats } from '@/hooks/useStats';
import {
  ArrowRight,
  Clock,
  Shield,
  Headphones,
  Calendar,
  CheckCircle,
  Star,
  ChevronDown,
  X,
  Check,
  Plane,
  FileText,
  Sparkles,
  Users,
  Globe2,
  Zap,
  Quote,
  TrendingUp,
  Award,
  Lightbulb,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { stats, loading: statsLoading } = useStats();
  const [visas, setVisas] = useState<Visa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNationality, setSelectedNationality] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedVisa, setSelectedVisa] = useState<Visa | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      const { data } = await supabase
        .from('visas')
        .select('*')
        .eq('is_active', true)
        .order('country_name')
        .limit(6);
      if (data) setVisas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getCountryImageByName = (countryName: string): string => {
    const imageMap: { [key: string]: string } = {
      Azerbaijan: 'https://images.pexels.com/photos/19912690/pexels-photo-19912690.jpeg?auto=compress&cs=tinysrgb&w=800',
      Indonesia: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
      Jordan: 'https://images.pexels.com/photos/13892508/pexels-photo-13892508.jpeg?auto=compress&cs=tinysrgb&w=800',
      Turkey: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800',
      UAE: 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Saudi Arabia': 'https://images.pexels.com/photos/9215085/pexels-photo-9215085.jpeg?auto=compress&cs=tinysrgb&w=800',
      France: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800',
      Portugal: 'https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=800',
      China: 'https://images.pexels.com/photos/3796810/pexels-photo-3796810.jpeg?auto=compress&cs=tinysrgb&w=800',
    };

    return (
      imageMap[countryName] ||
      'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800'
    );
  };

  const countryOptions = useMemo(
    () => Array.from(new Set(visas.map((visa) => visa.country_name))).sort((a, b) => a.localeCompare(b)),
    [visas]
  );

  useEffect(() => {
    if (!selectedNationality && countryOptions.length > 0) {
      setSelectedNationality(countryOptions[0]);
    }
  }, [countryOptions, selectedNationality]);

  useEffect(() => {
    if (visas.length === 0) return;

    const savedVisaId = typeof window !== 'undefined' ? localStorage.getItem('selectedVisaId') : null;

    let nextVisa = selectedVisa ? visas.find((visa) => visa.id === selectedVisa.id) ?? null : null;

    if (!nextVisa && savedVisaId) {
      nextVisa = visas.find((visa) => String(visa.id) === savedVisaId) ?? null;
    }

    if (!nextVisa && selectedDestination) {
      nextVisa = visas.find((visa) => visa.country_name === selectedDestination) ?? null;
    }

    if (!nextVisa) {
      nextVisa = visas[0];
    }

    if (!selectedVisa || nextVisa.id !== selectedVisa.id) {
      setSelectedVisa(nextVisa);
    }

    if (selectedDestination !== nextVisa.country_name) {
      setSelectedDestination(nextVisa.country_name);
    }
  }, [selectedDestination, selectedVisa, visas]);

  useEffect(() => {
    if (!selectedDestination || visas.length === 0) {
      return;
    }

    const visaMatch = visas.find((visa) => visa.country_name === selectedDestination) ?? null;
    if (visaMatch && (!selectedVisa || selectedVisa.id !== visaMatch.id)) {
      setSelectedVisa(visaMatch);
    }
  }, [selectedDestination, selectedVisa, visas]);

  useEffect(() => {
    if (!selectedVisa || typeof window === 'undefined') return;
    localStorage.setItem('selectedVisaId', String(selectedVisa.id));
  }, [selectedVisa]);

  const displayVisa = selectedVisa ?? visas[0] ?? null;
  const displayDestination = displayVisa?.country_name ?? selectedDestination;

  const flagByCountry = (country: string) => {
    const map: Record<string, string> = {
      Algeria: '🇩🇿',
      Azerbaijan: '🇦🇿',
      Indonesia: '🇮🇩',
      Jordan: '🇯🇴',
      Turkey: '🇹🇷',
      UAE: '🇦🇪',
      'Saudi Arabia': '🇸🇦',
      France: '🇫🇷',
      Portugal: '🇵🇹',
      China: '🇨🇳',
    };
    return map[country] || '🌍';
  };

  const compactNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCompactCount = (value: number) => compactNumberFormatter.format(value).toUpperCase();

  return (
    <div className="min-h-screen bg-white antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7FBFA] via-white to-white pt-12 sm:pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-[#00D474]/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#00D474]/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <AnimateOnScroll className={`mb-6 ${isRTL ? 'text-right' : 'text-center'}`}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00D474]/20 bg-[#00D474]/10 px-4 py-2 text-xs font-semibold text-[#0B3948] sm:text-sm">
              <Sparkles size={14} className="text-[#00D474]" />
              <span>{t.home.features.subtitle}</span>
            </div>
            <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-black leading-tight tracking-tight text-[#0B3948] sm:text-6xl md:text-7xl">
              {t.home.hero.title}
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-[#6B7C85] sm:text-xl">
              {t.home.hero.subtitle}
            </p>
          </AnimateOnScroll>

          {/* Visa Finder Form */}
          <AnimateOnScroll delay={1} className="w-full max-w-2xl">
            <div className="rounded-[32px] border border-[#DDEAE5] bg-white p-6 shadow-lg shadow-black/5 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                {/* From Field - Algeria Only */}
                <div className="relative">
                  <label className={`mb-3 block text-xs font-bold tracking-wider text-[#0B3948] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t.home.card.startingFrom}
                  </label>
                  <div className="h-14 w-full rounded-[24px] border border-[#DDEAE5] bg-[#F7FBFA] px-4 text-sm font-semibold text-[#0B3948] flex items-center gap-2.5 cursor-not-allowed">
                    <span className="text-lg leading-none">🇩🇿</span>
                    <span>{t.home.form.originCountry}</span>
                  </div>
                </div>

                {/* Destination Field */}
                <div className="relative">
                  <label className={`mb-3 block text-xs font-bold tracking-wider text-[#0B3948] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t.home.destinations.title}
                  </label>
                  <div className="relative">
                    <span className={`pointer-events-none absolute inset-y-0 flex items-center text-lg ${isRTL ? 'right-4' : 'left-4'}`}>
                      {flagByCountry(displayDestination)}
                    </span>
                    <select
                      value={displayDestination}
                      onChange={(e) => {
                        const destination = e.target.value;
                        setSelectedDestination(destination);
                        const visaMatch = visas.find((visa) => visa.country_name === destination) ?? null;
                        setSelectedVisa(visaMatch);
                      }}
                      className={`h-14 w-full appearance-none rounded-[24px] border border-[#DDEAE5] bg-white text-sm font-semibold text-[#0B3948] outline-none transition-all duration-200 hover:border-[#00D474] focus:border-[#00D474] focus:ring-2 focus:ring-[#00D474]/20 ${isRTL ? 'pr-14 pl-10 text-right' : 'pl-14 pr-10 text-left'}`}
                    >
                      {countryOptions.map((country) => (
                        <option key={`destination-${country}`} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className={`pointer-events-none absolute inset-y-0 my-auto text-[#6B7C85] ${isRTL ? 'left-3' : 'right-3'}`} />
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!displayVisa) return;
                      router.push(`/apply/new?visa_id=${displayVisa.id}`);
                    }}
                    disabled={!displayVisa}
                    className="inline-flex h-14 items-center justify-center gap-2.5 rounded-[24px] bg-gradient-to-r from-[#00D474] to-[#00D474]/80 px-6 text-sm font-bold text-white shadow-lg shadow-[#00D474]/30 transition-all duration-200 hover:shadow-xl hover:shadow-[#00D474]/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                  >
                    {t.home.hero.cta}
                    <ArrowRight size={18} className={`${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 border-t border-[#DDEAE5] pt-6 text-center text-xs text-[#6B7C85] sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-[#00D474]" />
                  {t.home.features.secure.title}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <Clock size={16} className="text-[#00D474]" />
                  {t.home.features.fast.title}
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5">
                  <Headphones size={16} className="text-[#00D474]" />
                  {t.home.features.expert.title}
                </span>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={2} className="mt-12 w-full">
            <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[28px] shadow-xl shadow-[#0B3948]/10">
              <Image
                src="/images/hero-travel.png"
                alt="Traveler sitting on a suitcase with passport and phone"
                width={900}
                height={700}
                className="h-auto w-full animate-[float_6s_ease-in-out_infinite]"
              />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-[#DDEAE5] bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <AnimateOnScroll className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {[
              { icon: <Globe2 size={28} />, key: 'visas', label: t.home.destinations.title },
              { icon: <Users size={28} />, key: 'users', label: t.home.footer.partner },
              { icon: <Zap size={28} />, key: 'processingTime', label: t.home.features.fast.title },
              { icon: <TrendingUp size={28} />, key: 'successRate', label: t.home.card.verified },
            ].map((item, idx) => (
              <div key={idx} className="group rounded-[24px] border border-[#DDEAE5] bg-gradient-to-br from-white to-[#F7FBFA] p-5 text-center transition-all duration-200 hover:border-[#00D474] hover:shadow-lg hover:shadow-[#00D474]/10 sm:p-6">
                <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00D474]/10 text-[#00D474] transition-all duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                <p className="text-3xl font-black tracking-tight text-[#0B3948] sm:text-4xl">
                  {statsLoading ? (
                    <span className="mx-auto block h-9 w-20 animate-pulse rounded-xl bg-[#E8F1EE]" />
                  ) : item.key === 'visas' ? (
                    <>
                      +
                      <AnimatedCounter value={stats.visas} formatter={formatCompactCount} />
                    </>
                  ) : item.key === 'users' ? (
                    <>
                      +
                      <AnimatedCounter value={stats.users} formatter={formatCompactCount} />
                    </>
                  ) : item.key === 'successRate' ? (
                    <>
                      <AnimatedCounter value={stats.successRate} />%
                    </>
                  ) : (
                    stats.processingTime
                  )}
                </p>
                <p className="mt-2 text-xs font-medium text-[#6B7C85] uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </AnimateOnScroll>
        </div>
      </section>

      {/* Why Choose e-Vizza */}
      <section className="bg-gradient-to-br from-white via-[#F7FBFA] to-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black leading-tight text-[#0B3948] sm:text-5xl">
              {t.home.features.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6B7C85]">
              {t.home.features.subtitle}
            </p>
          </AnimateOnScroll>

          <div className="grid gap-8 md:grid-cols-2">
            <AnimateOnScroll delay={1}>
              <div className="rounded-[32px] border border-[#DDEAE5] bg-gradient-to-br from-white to-[#F7FBFA] p-9 sm:p-10">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-red-50">
                    <X size={18} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B3948]">{t.home.whyUs.withoutTitle}</h3>
                </div>
                <ul className="space-y-4">
                  {t.home.whyUs.withoutList.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <X size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
                      <span className="text-sm leading-relaxed text-[#6B7C85]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={2}>
              <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#00D474] via-[#00D474] to-[#00C465] p-9 text-white shadow-xl shadow-[#00D474]/20 sm:p-10">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
                <div className="relative z-10">
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-white/20">
                      <Check size={18} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold">{t.home.whyUs.withTitle}</h3>
                  </div>
                  <ul className="space-y-4">
                    {t.home.whyUs.withList.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3.5">
                        <Check size={16} className="mt-0.5 flex-shrink-0 text-white/80" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll className="mb-16 text-center">
            <h2 className="text-4xl font-black text-[#0B3948] sm:text-5xl">
              {t.home.process.title}
            </h2>
          </AnimateOnScroll>

          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute left-[10%] right-[10%] top-1/3 hidden h-1 bg-gradient-to-r from-[#DDEAE5] via-[#00D474] to-[#DDEAE5] md:block" />
            
            {[
              { icon: Lightbulb, title: t.home.process.step1Title, desc: t.home.process.step1Desc },
              { icon: FileText, title: t.home.process.step2Title, desc: t.home.process.step2Desc },
              { icon: CheckCircle, title: t.home.process.step3Title, desc: t.home.process.step3Desc },
            ].map((item, idx) => (
              <AnimateOnScroll key={idx} delay={(idx + 1) as 1 | 2 | 3} className="relative z-10">
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#00D474] to-[#00D474]/80 text-white shadow-lg shadow-[#00D474]/30">
                    <item.icon size={28} />
                  </div>
                  <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#00D474]">
                    {t.home.process.stepPrefix} {idx + 1}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#0B3948]">{item.title}</h3>
                  <p className="text-sm text-[#6B7C85]">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-gradient-to-br from-[#F7FBFA] to-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <AnimateOnScroll className="mb-12 flex flex-col gap-4 sm:gap-6">
            <div>
              <h2 className="mb-3 text-4xl font-black text-[#0B3948] sm:text-5xl">
                {t.home.destinations.title}
              </h2>
              <p className="max-w-2xl text-lg text-[#6B7C85]">
                {t.home.destinations.description}
              </p>
            </div>
            <div>
              <Link href="/destinations" className="group inline-flex items-center gap-2 text-sm font-bold text-[#00D474] transition-all duration-200 hover:translate-x-1">
                {t.home.destinations.viewAll}
                <ArrowRight size={16} className={`${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </AnimateOnScroll>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-80 rounded-[28px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visas.map((visa, idx) => (
                <AnimateOnScroll key={visa.id} delay={(Math.min(idx + 1, 5) as 1 | 2 | 3 | 4 | 5)}>
                  <Link
                    href={`/destinations/${visa.id}`}
                    className="group overflow-hidden rounded-[28px] border border-[#DDEAE5] bg-white transition-all duration-300 hover:border-[#00D474] hover:shadow-xl hover:shadow-[#00D474]/10"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <Image
                        src={visa.image_url || getCountryImageByName(visa.country_name)}
                        alt={visa.country_name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="text-xl font-bold text-white">{visa.country_name}</h3>
                        <p className="text-xs text-white/85">{visa.visa_type}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7C85]">
                          <Clock size={14} className="text-[#00D474]" />
                          {visa.processing_time}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#00D474]/10 px-2.5 py-1 text-xs font-bold text-[#00D474]">
                          <CheckCircle size={12} />
                          {t.home.card.verified}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#6B7C85]">
                            {t.home.card.startingFrom}
                          </p>
                          <p className="text-2xl font-black text-[#0B3948]">
                            {(visa.total_price * 260).toLocaleString()} <span className="text-sm font-semibold text-[#6B7C85]">{t.home.card.currency}</span>
                          </p>
                          <p className="text-xs text-[#6B7C85]">{t.home.card.priceApproxPrefix}{visa.total_price}</p>
                        </div>
                        <button className="rounded-[20px] bg-[#00D474] px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-[#00C465] hover:shadow-lg hover:shadow-[#00D474]/30">
                          {t.home.card.applyNow}
                        </button>
                      </div>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="mb-3 text-4xl font-black text-[#0B3948] sm:text-5xl">
              {t.home.testimonials.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6B7C85]">
              {t.home.testimonials.subtitle}
            </p>
          </AnimateOnScroll>

          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item, idx) => (
              <AnimateOnScroll key={item} delay={(idx + 1) as 1 | 2 | 3}>
                <div className="rounded-[24px] border border-[#DDEAE5] bg-gradient-to-br from-white to-[#F7FBFA] p-7 sm:p-8">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-[#6B7C85]">
                    &ldquo;{t.home.features.subtitle}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t border-[#DDEAE5] pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00D474] to-[#00D474]/80 text-xs font-bold text-white">
                      {item}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0B3948]">{t.home.testimonials.verifiedCustomer}</p>
                      <p className="text-xs text-[#6B7C85]">{t.home.testimonials.travelerLabel}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Embassy Appointments CTA */}
      <section className="bg-gradient-to-br from-white to-[#F7FBFA] px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll className="overflow-hidden rounded-[40px] bg-gradient-to-br from-[#00D474] via-[#00D474] to-[#00C465] shadow-xl shadow-[#00D474]/20">
            <div className="flex flex-col items-center gap-8 p-10 text-center text-white sm:p-16 md:flex-row md:gap-12 md:text-left">
              <div className="flex-1">
                <span className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
                  {t.home.embassy.label}
                </span>
                <h2 className="mb-4 text-3xl font-black leading-tight sm:text-4xl">
                  {t.home.appointments.title}
                </h2>
                <p className="mb-8 text-base leading-relaxed text-white/90">
                  {t.home.appointments.description}
                </p>
                <Link
                  href="/appointments/book"
                  className="inline-flex items-center gap-2.5 rounded-[24px] bg-white px-7 py-3.5 text-sm font-bold text-[#00D474] transition-all duration-200 hover:shadow-lg hover:shadow-black/20 active:scale-95"
                >
                  <Calendar size={18} />
                  {t.home.embassy.cta}
                </Link>
              </div>
              <div className="relative hidden h-64 w-full flex-1 overflow-hidden rounded-[32px] md:block">
                <Image
                  src="https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt={t.home.destinations.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Features Detailed */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <AnimateOnScroll className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-[#0B3948] sm:text-5xl">
              {t.home.features.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6B7C85]">
              {t.home.features.detailsSubtitle}
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Clock, title: t.home.features.fast.title, desc: t.home.features.fast.description },
              { icon: Headphones, title: t.home.features.expert.title, desc: t.home.features.expert.description },
              { icon: Shield, title: t.home.features.secure.title, desc: t.home.features.secure.description },
            ].map((item, idx) => (
              <AnimateOnScroll key={item.title} delay={(idx + 1) as 1 | 2 | 3}>
                <div className="group rounded-[28px] border border-[#DDEAE5] bg-gradient-to-br from-white to-[#F7FBFA] p-8 transition-all duration-300 hover:border-[#00D474] hover:shadow-xl hover:shadow-[#00D474]/10">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#00D474]/10 text-[#00D474] transition-all duration-300 group-hover:scale-110">
                    <item.icon size={32} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[#0B3948]">{item.title}</h3>
                  <p className="leading-relaxed text-[#6B7C85]">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B3948] to-[#0B3948]/90 px-4 py-20 text-white sm:px-6 sm:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-[#00D474]/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#00D474]/5 blur-3xl" />
        </div>
        <AnimateOnScroll className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 mx-auto">
            <Sparkles size={32} className="text-[#00D474]" />
          </div>
          <h2 className="mb-6 text-4xl font-black leading-tight sm:text-5xl">
            {t.home.finalCta.title}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-white/80">
            {t.home.finalCta.subtitle}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-[#00D474] px-8 py-4 text-sm font-bold text-[#0B3948] transition-all duration-200 hover:shadow-lg hover:shadow-[#00D474]/40 active:scale-95"
            >
              {t.home.hero.cta}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/appointments/book"
              className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
            >
              <Calendar size={18} />
              {t.home.embassy.cta}
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B3948] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <AnimateOnScroll>
            <div className={`flex flex-col items-start justify-between gap-8 ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
              <div>
                <Link href="/" className="mb-4 inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#00D474] to-[#00D474]/80 shadow-lg shadow-[#00D474]/30">
                    <span className="text-base font-black text-white">eV</span>
                  </div>
                  <span className="text-2xl font-black">e-Vizza</span>
                </Link>
                <p className="max-w-xs text-sm text-white/60">{t.home.footer.partner}</p>
              </div>

              <div className="flex gap-8 md:gap-16">
                <div>
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">{t.home.footer.sections.company}</h4>
                  <ul className="space-y-2.5 text-sm text-white/80">
                    <li>
                      <Link href="/" className="transition-colors hover:text-[#00D474]">
                        {t.home.footer.sections.home}
                      </Link>
                    </li>
                    <li>
                      <Link href="/destinations" className="transition-colors hover:text-[#00D474]">
                        {t.home.destinations.title}
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">{t.home.footer.sections.services}</h4>
                  <ul className="space-y-2.5 text-sm text-white/80">
                    <li>
                      <Link href="/appointments/book" className="transition-colors hover:text-[#00D474]">
                        {t.home.embassy.label}
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/login" className="transition-colors hover:text-[#00D474]">
                        {t.navbar.login}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/60">
              <p>{t.home.footer.rights.replace('{year}', currentYear.toString())}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </footer>
    </div>
  );
}
