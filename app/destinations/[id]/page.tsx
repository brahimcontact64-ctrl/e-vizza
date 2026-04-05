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
import Container from '@/components/Container';
import Card from '@/components/Card';
import Button from '@/components/Button';
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 rounded-3xl bg-[#E8F1EE]"></div>
            <div className="h-64 rounded-3xl bg-[#E8F1EE]"></div>
          </div>
        </Container>
      </div>
    );
  }

  if (!visa) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="py-12">
          <Card className="text-center" padding="lg">
            <p className="mb-6 text-lg ui-muted">{t.visaDetail.notFound}</p>
            <Link href="/destinations" className="font-semibold text-[#00B863] hover:underline">
              {t.visaDetail.backToDestinations}
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/destinations" className="mb-6 inline-flex items-center text-base text-white hover:underline sm:text-lg">
              <ArrowLeft size={20} className={`mr-2 ${isRTL ? 'rotate-180' : ''}`} />
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

      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <h2 className="mb-6 text-3xl font-bold text-[#0B3948] sm:text-4xl">{t.visaDetail.info.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4 items-start">
                  <Clock size={24} className="mt-1 text-[#00B863]" />
                  <div>
                    <p className="mb-1 text-sm ui-muted">{t.visaDetail.info.processingTime}</p>
                    <p className="text-lg font-semibold text-[#0B3948]">{visa.processing_time}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Calendar size={24} className="mt-1 text-[#00B863]" />
                  <div>
                    <p className="mb-1 text-sm ui-muted">{t.visaDetail.info.validity}</p>
                    <p className="text-lg font-semibold text-[#0B3948]">{visa.validity}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Clock size={24} className="mt-1 text-[#00B863]" />
                  <div>
                    <p className="mb-1 text-sm ui-muted">{t.visaDetail.info.stayDuration}</p>
                    <p className="text-lg font-semibold text-[#0B3948]">{visa.stay_duration}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <FileText size={24} className="mt-1 text-[#00B863]" />
                  <div>
                    <p className="mb-1 text-sm ui-muted">{t.visaDetail.info.entries}</p>
                    <p className="text-lg font-semibold text-[#0B3948]">{translateEntries(visa.entries, language)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {visa.description && (
              <Card>
                <h2 className="mb-6 text-3xl font-bold text-[#0B3948] sm:text-4xl">{t.visaDetail.description}</h2>
                <p className="text-lg leading-relaxed text-[#355865]">{translateDescription(visa.description, language)}</p>
              </Card>
            )}

            <Card>
              <h2 className="mb-6 text-3xl font-bold text-[#0B3948] sm:text-4xl">{t.visaDetail.requiredDocuments}</h2>
              <ul className="space-y-4">
                {visa.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle size={24} className="mr-3 mt-0.5 flex-shrink-0 text-[#00B863]" />
                    <span className="text-lg text-[#355865]">{translateRequirement(req, language)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24" padding="md">
              <div className="mb-8">
                <p className="mb-2 text-sm ui-muted">{t.visaDetail.pricing.totalPrice}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">

  {/* Price in DZD */}
  <span className="text-5xl font-bold text-[#0B3948]">
    {(visa.total_price * 260).toLocaleString()} {t.visaDetail.pricing.currency}
  </span>

  {/* Price in EUR (small) */}
  <span className="mt-1 text-sm text-[#6D8790]">
    {t.visaDetail.pricing.currencyPrefix}{visa.total_price}
  </span>

</div>
                </div>
                <div className="mt-4 space-y-2 border-t border-[#E4EFEB] pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="ui-muted">{t.visaDetail.pricing.governmentFee}</span>
                   <span className="font-medium text-[#0B3948]">
  {(visa.government_fee * 260).toLocaleString()} {t.visaDetail.pricing.currency}
</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="ui-muted">{t.visaDetail.pricing.serviceFee}</span>
                 <span className="font-medium text-[#0B3948]">
  {(visa.service_fee * 260).toLocaleString()} {t.visaDetail.pricing.currency}
</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleApply} size="lg" fullWidth>
                {t.visaDetail.applyNow}
              </Button>

              {!session && (
                <p className="mt-4 text-center text-sm ui-muted">
                  {t.visaDetail.signInMessage}
                </p>
              )}

              <div className="mt-8 border-t border-[#E4EFEB] pt-8">
                <h3 className="mb-4 font-bold text-[#0B3948]">{t.visaDetail.help.title}</h3>
                <p className="mb-4 text-sm ui-muted">
                  {t.visaDetail.help.description}
                </p>
                <Link
                  href="/appointments/book"
                  className="block w-full rounded-2xl border border-[#00D474] py-3 text-center font-semibold text-[#00B863] transition hover:bg-[#E8FFF4]"
                >
                  {t.visaDetail.help.bookConsultation}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>

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

