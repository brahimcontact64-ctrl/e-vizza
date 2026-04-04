'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateVisaType, translateEntries } from '@/lib/visaTranslations';
import { supabase } from '@/lib/supabase';
import { Clock, Search, MapPin } from 'lucide-react';

interface Visa {
  id: string;
  country_name: string;
  country_code: string;
  visa_type: string;
  processing_time: string;
  total_price: number;
  stay_duration: string;
  validity: string;
  entries: string;
  is_active: boolean;
  is_popular: boolean;
  image_url: string | null;
}

export default function DestinationsPage() {
  const { t, isRTL, language } = useLanguage();
  const [visas, setVisas] = useState<Visa[]>([]);
  const [filteredVisas, setFilteredVisas] = useState<Visa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVisas();
  }, []);

  useEffect(() => {
    filterVisas();
  }, [searchQuery, visas]);

  const fetchVisas = async () => {
    try {
      const { data, error } = await supabase
        .from('visas')
        .select('*')
        .eq('is_active', true)
        .order('country_name');

      if (error) throw error;

      if (data) {
        setVisas(data);
        setFilteredVisas(data);
      }
    } catch (error) {
      console.error('Error fetching visas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVisas = () => {
    if (!searchQuery.trim()) {
      setFilteredVisas(visas);
      return;
    }

    const filtered = visas.filter(visa =>
      visa.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visa.visa_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredVisas(filtered);
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
      'Azerbaijan': 'https://images.pexels.com/photos/19912690/pexels-photo-19912690.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Indonesia': 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Jordan': 'https://images.pexels.com/photos/13892508/pexels-photo-13892508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Turkey': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Qatar': 'https://images.pexels.com/photos/2245436/pexels-photo-2245436.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Singapore': 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Vietnam': 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Tanzania': 'https://images.pexels.com/photos/14678770/pexels-photo-14678770.jpeg?auto=compress&cs=tinysrgb&w=800',
    };
    return imageMap[countryName] || 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t.destinations.title}</h1>
          <p className="text-xl text-white/95 mb-8">
            {t.destinations.subtitle.replace('{count}', visas.length.toString())}
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
              <input
                type="text"
                placeholder={t.destinations.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-base border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredVisas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-600 text-lg">{t.destinations.noResults}</p>
            </div>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVisas.map((visa) => (
                <Link
                  key={visa.id}
                  href={`/destinations/${visa.id}`}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                    <Image
                      src={visa.image_url || getCountryImage(visa.country_name)}
                      alt={visa.country_name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute top-4 right-4 z-20 text-5xl">
                      {getCountryFlag(visa.country_code)}
                    </div>
                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="text-2xl font-bold text-white">
                        {visa.country_name}
                      </h3>
                      <p className="text-white/90 text-sm">{translateVisaType(visa.visa_type, language)}</p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-gray-100 gap-3">
                      <div className="flex items-center text-gray-600 gap-2">
                        <Clock size={18} className="text-teal-600" />
                        <span className="text-sm font-medium">
                          {visa.processing_time}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-teal-600">
                        {translateEntries(visa.entries, language)}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>{t.destinations.labels.validity}</span>
                        <span className="font-medium text-gray-900">{visa.validity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.destinations.labels.maxStay}</span>
                        <span className="font-medium text-gray-900">{visa.stay_duration}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-500 text-xs mb-2">{t.destinations.labels.price}</p>
                      <div className="flex flex-col gap-1">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {(visa.total_price * 260).toLocaleString()} {t.destinations.currency}
                        </span>
                        <span className="text-xs text-gray-500">
                          {t.destinations.currencyPrefix}{visa.total_price}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-semibold group-hover:bg-teal-700 transition-colors text-sm text-center">
                        {t.destinations.applyNow}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

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
              <p className="text-gray-400">{t.destinations.footer.rights.replace('{year}', new Date().getFullYear().toString())}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
