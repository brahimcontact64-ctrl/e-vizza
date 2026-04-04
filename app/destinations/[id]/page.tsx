'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateEntries, translateDescription, translateRequirement } from '@/lib/visaTranslations';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Clock, FileText, Calendar, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react';

interface Visa {
  id: string;
  country_name: string;
  country_code: string;
  visa_type: string;
  processing_time: string;
  total_price: number;
  government_fee: number;
  service_fee: number;
  stay_duration: string;
  validity: string;
  entries: string;
  requirements: string[];
  description: string | null;
  image_url: string | null;
}

export default function VisaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [visa, setVisa] = useState<Visa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVisa();
    }
  }, [params.id]);

  const fetchVisa = async () => {
    try {
      const { data, error } = await supabase
        .from('visas')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setVisa(data);
    } catch (error) {
      console.error('Error fetching visa:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryFlag = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getCountryImage = (countryName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Azerbaijan': 'https://images.pexels.com/photos/19912690/pexels-photo-19912690.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'Indonesia': 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'Jordan': 'https://images.pexels.com/photos/13892508/pexels-photo-13892508.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'Turkey': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'Qatar': 'https://images.pexels.com/photos/2245436/pexels-photo-2245436.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'Singapore': 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'Vietnam': 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'Tanzania': 'https://images.pexels.com/photos/14678770/pexels-photo-14678770.jpeg?auto=compress&cs=tinysrgb&w=1200',
    };
    return imageMap[countryName] || 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1200';
  };

  const handleApply = () => {
    if (!session) {
      router.push(`/auth/login?redirect=/apply/new?visa_id=${params.id}`);
    } else {
      router.push(`/apply/new?visa_id=${params.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!visa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">{t.visaDetail.notFound}</p>
            <Link href="/destinations" className="text-teal-600 hover:underline font-semibold">
              {t.visaDetail.backToDestinations}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative h-80 sm:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>
        <Image
          src={visa.image_url || getCountryImage(visa.country_name)}
          alt={visa.country_name}
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-10 sm:pb-12 w-full">
            <Link href="/destinations" className="inline-flex items-center text-white mb-6 hover:underline text-base sm:text-lg">
              <ArrowLeft size={20} className="mr-2" />
              {t.visaDetail.backToDestinations}
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <span className="text-6xl sm:text-7xl">{getCountryFlag(visa.country_code)}</span>
              <div>
                <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight">{visa.country_name}</h1>
                <p className="text-lg sm:text-2xl text-white/95 mt-3">{visa.visa_type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t.visaDetail.info.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4 items-start">
                  <Clock size={24} className="text-teal-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t.visaDetail.info.processingTime}</p>
                    <p className="text-lg font-semibold text-gray-900">{visa.processing_time}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Calendar size={24} className="text-teal-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t.visaDetail.info.validity}</p>
                    <p className="text-lg font-semibold text-gray-900">{visa.validity}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Clock size={24} className="text-teal-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t.visaDetail.info.stayDuration}</p>
                    <p className="text-lg font-semibold text-gray-900">{visa.stay_duration}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <FileText size={24} className="text-teal-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t.visaDetail.info.entries}</p>
                    <p className="text-lg font-semibold text-gray-900">{translateEntries(visa.entries, language)}</p>
                  </div>
                </div>
              </div>
            </div>

            {visa.description && (
              <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t.visaDetail.description}</h2>
                <p className="text-gray-700 text-lg leading-relaxed">{translateDescription(visa.description, language)}</p>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t.visaDetail.requiredDocuments}</h2>
              <ul className="space-y-4">
                {visa.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle size={24} className="text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{translateRequirement(req, language)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-100 lg:sticky lg:top-24">
              <div className="mb-8">
                <p className="text-gray-600 text-sm mb-2">{t.visaDetail.pricing.totalPrice}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">

  {/* Price in DZD */}
  <span className="text-5xl font-bold text-gray-900">
    {(visa.total_price * 260).toLocaleString()} {t.visaDetail.pricing.currency}
  </span>

  {/* Price in EUR (small) */}
  <span className="text-sm text-gray-500 mt-1">
    {t.visaDetail.pricing.currencyPrefix}{visa.total_price}
  </span>

</div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t.visaDetail.pricing.governmentFee}</span>
                   <span className="font-medium text-gray-900">
  {(visa.government_fee * 260).toLocaleString()} {t.visaDetail.pricing.currency}
</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t.visaDetail.pricing.serviceFee}</span>
                 <span className="font-medium text-gray-900">
  {(visa.service_fee * 260).toLocaleString()} {t.visaDetail.pricing.currency}
</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApply}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-4 rounded-2xl text-lg font-bold hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                {t.visaDetail.applyNow}
              </button>

              {!session && (
                <p className="text-center text-sm text-gray-600 mt-4">
                  {t.visaDetail.signInMessage}
                </p>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t.visaDetail.help.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t.visaDetail.help.description}
                </p>
                <Link
                  href="/appointments/book"
                  className="block w-full border-2 border-teal-600 text-teal-600 py-3 rounded-lg text-center font-semibold hover:bg-teal-50 transition"
                >
                  {t.visaDetail.help.bookConsultation}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">eV</span>
              </div>
              <span className="text-3xl font-bold">e-Vizza</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© {new Date().getFullYear()} e-Vizza. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

