'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Visa } from '@/types/database';
import Navbar from '@/components/Navbar';
import { ArrowRight, Clock, Shield, Headphones, Calendar, CircleCheck as CheckCircle } from 'lucide-react';

export default function HomePage() {
  const { t, isRTL } = useLanguage();
  const [visas, setVisas] = useState<Visa[]>([]);
  const [loading, setLoading] = useState(true);
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

      if (data) {
        setVisas(data);
      }
    } catch (error) {
      console.error('Error fetching visas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryImage = (countryName: string): string => {
    const normalized = countryName.toLowerCase().replace(/\s+/g, '-');
    return `https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800`;
  };

  const getCountryImageByName = (countryName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Azerbaijan': 'https://images.pexels.com/photos/19912690/pexels-photo-19912690.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Indonesia': 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Jordan': 'https://images.pexels.com/photos/13892508/pexels-photo-13892508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Turkey': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800',
      'UAE': 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Saudi Arabia': 'https://images.pexels.com/photos/9215085/pexels-photo-9215085.jpeg?auto=compress&cs=tinysrgb&w=800',
      'France': 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Portugal': 'https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=800',
      'China': 'https://images.pexels.com/photos/3796810/pexels-photo-3796810.jpeg?auto=compress&cs=tinysrgb&w=800',
    };
    return imageMap[countryName] || 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {t.home.hero.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 text-white/95 max-w-3xl mx-auto leading-relaxed">
            {t.home.hero.subtitle}
          </p>
        <Link
  href="/destinations"
  className="inline-flex items-center bg-white text-teal-700 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-200"
>
  {t.home.hero.cta}
  <ArrowRight size={24} className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
</Link>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {t.home.destinations.title}
              </h2>
              <p className="text-gray-600 text-lg">{t.home.destinations.description}</p>
            </div>
            <Link href="/destinations" className="flex items-center text-teal-600 hover:text-teal-700 font-semibold text-lg group">
              {t.home.destinations.viewAll}
              <ArrowRight size={20} className={`ml-2 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visas.map((visa) => (
                <Link
                  key={visa.id}
                  href={`/destinations/${visa.id}`}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                    <Image
                      src={visa.image_url || getCountryImageByName(visa.country_name)}
                      alt={visa.country_name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {visa.country_name}
                      </h3>
                      <p className="text-white/90 text-sm font-medium">{visa.visa_type}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock size={18} className="mr-2 text-teal-600" />
                        <span className="text-sm font-medium">{visa.processing_time}</span>
                      </div>
                      <div className="flex items-center text-teal-600">
                        <CheckCircle size={18} className="mr-1" />
                        <span className="text-xs font-semibold">{t.home.card.verified}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">{t.home.card.startingFrom}</p>
                       <div className="flex flex-col">

  {/* السعر بالدينار (كبير) */}
  <span className="text-3xl font-bold text-gray-900">
    {(visa.total_price * 260).toLocaleString()} {t.home.card.currency}
  </span>

  {/* السعر بالدولار (صغير) */}
  <span className="text-xs text-gray-500">
    {t.home.card.priceApproxPrefix}{visa.total_price}
  </span>

</div>
                      </div>
                      <div className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-semibold group-hover:bg-teal-700 transition-colors text-center">
                        {t.home.card.applyNow}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-teal-600 to-emerald-700 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 md:p-16 text-white border border-white/20">
            <div className="max-w-3xl">
              <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                {t.home.embassy.label}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t.home.appointments.title}
              </h2>
              <p className="text-xl mb-8 text-white/95 leading-relaxed">
                {t.home.appointments.description}
              </p>
              <Link
                href="/appointments/book"
                className="inline-flex items-center bg-white text-teal-700 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Calendar size={24} className="mr-3" />
                {t.home.embassy.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.home.features.title}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t.home.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.home.features.fast.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">{t.home.features.fast.description}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones size={40} className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {t.home.features.expert.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">{t.home.features.expert.description}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={40} className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {t.home.features.secure.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">{t.home.features.secure.description}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">eV</span>
              </div>
              <span className="text-3xl font-bold">e-Vizza</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-lg">{t.home.footer.rights.replace('{year}', currentYear.toString())}</p>
              <p className="text-gray-500 text-sm mt-2">{t.home.footer.partner}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
