'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Container from '@/components/Container';
import Section from '@/components/Section';
import Badge from '@/components/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateVisaType, translateEntries } from '@/lib/visaTranslations';
import { supabase } from '@/lib/supabase';
import { Clock, Search } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-br from-[#0B3948] to-[#0E5167] px-4 py-20 text-white">
        <Container>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t.destinations.title}</h1>
          <p className="text-xl text-white/95 mb-8">
            {t.destinations.subtitle.replace('{count}', visas.length.toString())}
          </p>
        </Container>
      </section>

      <Section className="py-12">
        <div>
          <Card className="mb-8" padding="md">
            <div className="relative w-full">
              <div
                className={`pointer-events-none absolute inset-y-0 flex items-center ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'}`}
              >
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t.destinations.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl border border-gray-200 bg-white py-3 text-base leading-normal text-[#0B3948] placeholder-[#7C969F] focus:outline-none focus:ring-2 focus:ring-green-400 ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`}
              />
            </div>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-[#E8F1EE]" />
              ))}
            </div>
          ) : filteredVisas.length === 0 ? (
            <Card className="text-center" padding="lg">
              <p className="text-lg ui-muted">{t.destinations.noResults}</p>
            </Card>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVisas.map((visa) => (
                <Link
                  key={visa.id}
                  href={`/destinations/${visa.id}`}
                  className="ui-card ui-card-hover group overflow-hidden p-0"
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
                    <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[#E4EFEB] pb-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-[#5F7B84]">
                        <Clock size={18} className="text-[#00B863]" />
                        <span className="text-sm font-medium">
                          {visa.processing_time}
                        </span>
                      </div>
                      <Badge tone="primary" className="text-sm">{translateEntries(visa.entries, language)}</Badge>
                    </div>

                    <div className="mb-4 space-y-3 text-sm text-[#5F7B84]">
                      <div className="flex justify-between">
                        <span>{t.destinations.labels.validity}</span>
                        <span className="font-medium text-[#0B3948]">{visa.validity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.destinations.labels.maxStay}</span>
                        <span className="font-medium text-[#0B3948]">{visa.stay_duration}</span>
                      </div>
                    </div>

                    <div className="border-t border-[#E4EFEB] pt-4">
                      <p className="mb-2 text-xs text-[#6D8790]">{t.destinations.labels.price}</p>
                      <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold text-[#0B3948] sm:text-3xl">
                          {(visa.total_price * 260).toLocaleString()} {t.destinations.currency}
                        </span>
                        <span className="text-xs text-[#6D8790]">
                          {t.destinations.currencyPrefix}{visa.total_price}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-6 py-3 text-center text-sm font-semibold text-white">
                        {t.destinations.applyNow}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>

      <footer className="mt-16 bg-[#0B3948] px-4 py-16 text-white">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D474] to-[#00B863]">
                <span className="text-white font-bold text-2xl">eV</span>
              </div>
              <span className="text-3xl font-bold">e-Vizza</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/70">{t.destinations.footer.rights.replace('{year}', new Date().getFullYear().toString())}</p>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
