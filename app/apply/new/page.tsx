'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Upload, FileText, CircleCheck as CheckCircle, Loader as Loader2, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Container from '@/components/Container';

interface Visa {
  id: string;
  country_name: string;
  country_code: string;
  visa_type: string;
  processing_time: string;
  total_price: number;
  government_fee: number;
  service_fee: number;
  requirements: string[] | null;
}

interface UploadedDocument {
  type: string;
  file: File;
  preview?: string;
}

const isPassportExpiryValid = (expiryDate?: string | null): boolean => {
  if (!expiryDate) return false;

  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return false;

  const minExpiryDate = new Date();
  minExpiryDate.setMonth(minExpiryDate.getMonth() + 6);

  return expiry >= minExpiryDate;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function ApplyNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const visaId = searchParams.get('visa_id');
  const { session, loading: authLoading } = useAuth();
  const { t, isRTL } = useLanguage();

  const [step, setStep] = useState(1);
  const [visa, setVisa] = useState<Visa | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [passportValid, setPassportValid] = useState<boolean | null>(null);
  const [passportVaultData, setPassportVaultData] = useState<{
    passport_number?: string;
    expiry_date?: string;
  } | null>(null);
  const [passportLoaded, setPassportLoaded] = useState(false);
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');

  useEffect(() => {
    if (!authLoading && !session) {
     router.push(`/auth/login?redirect=${encodeURIComponent(`/apply/new?visa_id=${visaId}`)}`);
    }
  }, [session, authLoading, router, visaId]);

  useEffect(() => {
    if (visaId) {
      fetchVisa();
    }
  }, [visaId]);

  useEffect(() => {
    const fetchPassport = async () => {
      if (!session?.user) {
        setPassportValid(false);
        setPassportVaultData(null);
        setPassportLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from('passport_vault')
        .select('passport_number, expiry_date')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Passport fetch error:', error);
        setPassportValid(false);
        setPassportVaultData(null);
        setPassportLoaded(true);
        return;
      }

      if (!data) {
        setPassportValid(false);
        setPassportVaultData(null);
        setPassportLoaded(true);
        return;
      }

      setPassportVaultData(data);
      setPassportValid(isPassportExpiryValid(data.expiry_date));
      setPassportLoaded(true);
    };

    fetchPassport();
  }, [session]);

  const fetchVisa = async () => {
    if (!visaId) return;

    const { data, error } = await supabase
      .from('visas')
      .select('*')
      .eq('id', visaId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching visa:', error);
      router.push('/destinations');
      return;
    }

    if (data) {
      setVisa(data);
    } else {
      router.push('/destinations');
    }
  };

const getCountryFlag = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

const verifyPassport = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      'https://rvsaxetlfqfzkqsevgbt.supabase.co/functions/v1/verify-passport',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || t.apply.errors.verificationFailed);

    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, t.apply.errors.verificationFailed));
  }
};

const handleFileUpload = async (type: string, file: File) => {
  const hasValidPassport = passportValid === true;

  if (file.size > 10 * 1024 * 1024) {
    alert(t.apply.documents.fileSizeLimit);
    return;
  }

  if (type.toLowerCase().includes('passport') && hasValidPassport) {
    alert('Passport already exists in your account');
    return;
  }

  if (type.toLowerCase().includes('passport')) {
    setVerifying(true);
    setPassportValid(null);

    try {
      const res = await verifyPassport(file);

      if (!res.isPassport || !isPassportExpiryValid(res.expiry_date)) {
        setPassportValid(false);
        alert(t.apply.documents.invalid);
        setVerifying(false);
        return;
      }

      setPassportValid(true);

      if (session?.user?.id) {
        const { error: upsertPassportError } = await supabase
          .from('passport_vault')
          .upsert({
            user_id: session.user.id,
            passport_number: res.passport_number,
            expiry_date: res.expiry_date,
            updated_at: new Date().toISOString(),
          });

        if (upsertPassportError) {
          throw upsertPassportError;
        }

        setPassportVaultData({
          passport_number: res.passport_number,
          expiry_date: res.expiry_date,
        });
      }

      setVerifying(false);
      return;
    } catch (error: unknown) {
      console.error('Passport upload/verify error:', error);
      setPassportValid(false);
      alert(t.apply.errors.verificationFailed);
      setVerifying(false);
      return;
    }
  }

  const preview = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : undefined;

    setDocuments(prev => [
      ...prev.filter(d => d.type !== type),
      { type, file, preview }
    ]);
  };

 const uploadDocumentToStorage = async (
  file: File,
  applicationId: string,
  type: string,
  userId: string
) => {
    if (!session?.user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${applicationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return { filePath, fileUrl: publicUrl };
  };

  const handleSubmit = async () => {
    const currentUser = session?.user;

    if (!currentUser) {
      alert(t.apply.errors.sessionExpired);
      router.push(`/auth/login?redirect=${encodeURIComponent(`/apply/new?visa_id=${visaId}`)}`);
      return;
    }

    const userId = currentUser.id;

    const { data: passportData, error: passportError } = await supabase
      .from('passport_vault')
      .select('passport_number, expiry_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (passportError) {
      console.error('Passport vault read error:', passportError);
      alert(t.apply.errors.submitFailed);
      return;
    }

    const hasValidPassport = Boolean(
      passportData && isPassportExpiryValid(passportData.expiry_date)
    );

    if (!hasValidPassport) {
      alert(t.apply.documents.invalid);
      return;
    }

    if (!visa) {
      alert(t.apply.errors.visaNotFound);
      return;
    }

    if (!entryDate || !exitDate) {
      alert(t.apply.errors.selectTravelDates);
      return;
    }

    const requiredDocs = visa.requirements || [];

    const nonPassportDocs = requiredDocs.filter(
      r => !r.toLowerCase().includes('passport')
    );

    const uploadedNonPassportDocs = documents.filter(
      d => !d.type.toLowerCase().includes('passport')
    );

    const missingNonPassportDocs = nonPassportDocs.filter(
      requiredDoc => !uploadedNonPassportDocs.some(uploadedDoc => uploadedDoc.type === requiredDoc)
    );

    if (missingNonPassportDocs.length > 0) {
      alert(t.apply.errors.uploadRequiredDocuments);
      return;
    }

    setLoading(true);
    try {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          visa_id: visa.id,
          status: 'submitted',
          planned_entry_date: entryDate,
          planned_exit_date: exitDate,
        })
        .select()
        .single();

      if (appError) {
        console.error('Application insert error:', appError);
        throw appError;
      }

      const { error: passportDocError } = await supabase
        .from('documents')
        .insert({
          application_id: application.id,
          user_id: userId,
          type: 'passport',
          file_url: 'vault://passport',
          file_name: 'passport_auto',
          file_size: 0,
          file_type: 'image',
          source_type: 'vault',
        });

      if (passportDocError) {
        console.error('Auto passport error:', passportDocError);
        throw passportDocError;
      }

     for (const doc of documents.filter(d => !d.type.toLowerCase().includes('passport'))){
       const uploadResult = await uploadDocumentToStorage(
  doc.file,
  application.id,
  doc.type,
  userId
);

        if (uploadResult) {
          const { error: docError } = await supabase
            .from('documents')
            .insert({
              application_id: application.id,
              user_id: userId,
              type: doc.type,
              file_url: uploadResult.fileUrl,
              file_name: doc.file.name,
              file_size: doc.file.size,
              file_type: doc.file.type.startsWith('image/') ? 'image' : 'pdf',
              source_type: 'upload',
            });

          if (docError) {
            console.error('Document insert error:', docError);
            throw docError;
          }
        }
      }

     router.replace('/dashboard/applications?success=true');
    } catch (error: unknown) {
      console.error('Error submitting application:', error);
      alert(t.apply.errors.submitFailed);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[#00B863]" size={48} />
      </div>
    );
  }

  if (!passportLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[#00B863]" size={48} />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const requiredDocs = visa?.requirements || [];
  const requiredNonPassportDocs = requiredDocs.filter(
    requirement => !requirement.toLowerCase().includes('passport')
  );
  const missingRequiredNonPassportDocs = requiredNonPassportDocs.filter(
    requirement => !documents.some(document => document.type === requirement)
  );
  const hasPassportInVault = passportVaultData !== null;
  const hasValidPassport = passportValid === true;
  const canContinueToReview = hasValidPassport && missingRequiredNonPassportDocs.length === 0 && !verifying;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container size="md" className="py-8">
        <button
          onClick={() => step === 1 ? router.push(`/destinations/${visa.id}`) : setStep(step - 1)}
          className="mb-6 flex items-center text-[#5F7B84] transition hover:text-[#00B863]"
        >
          <ArrowLeft size={20} className={`mr-2 ${isRTL ? 'rotate-180' : ''}`} />
          {t.apply.navigation.back}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">{getCountryFlag(visa.country_code)}</span>
            <div>
              <h1 className="text-4xl font-bold text-[#0B3948]">{t.apply.title}</h1>
              <p className="mt-1 text-xl text-[#5F7B84]">{visa.country_name} - {visa.visa_type}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  s <= step ? 'bg-[#00B863] text-white' : 'bg-[#E4EFEB] text-[#7C969F]'
                }`}>
                  {s < step ? <CheckCircle size={20} /> : s}
                </div>
                {s < 3 && <div className={`w-20 h-1 transition ${s < step ? 'bg-[#00B863]' : 'bg-[#E4EFEB]'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-sm font-medium">
            <span className={step >= 1 ? 'text-[#00B863]' : 'text-[#7C969F]'}>{t.apply.steps.step1}</span>
            <span className={step >= 2 ? 'text-[#00B863]' : 'text-[#7C969F]'}>{t.apply.steps.step2}</span>
            <span className={step >= 3 ? 'text-[#00B863]' : 'text-[#7C969F]'}>{t.apply.steps.step3}</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <h2 className="mb-6 text-2xl font-bold text-[#0B3948]">{t.apply.travelDates.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#355865]">
                  <Calendar size={16} className="inline mr-2" />
                  {t.apply.travelDates.entryLabel}
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="ui-input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#355865]">
                  <Calendar size={16} className="inline mr-2" />
                  {t.apply.travelDates.exitLabel}
                </label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  min={entryDate || new Date().toISOString().split('T')[0]}
                  className="ui-input"
                  required
                />
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-[#BFEFD8] bg-[#F1FFF8] p-4">
              <p className="text-sm text-[#0E5167]">
                <strong>{t.apply.travelDates.note}</strong> {t.apply.travelDates.noteText.replace('{processing_time}', visa.processing_time)}
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!entryDate || !exitDate}
              fullWidth
              size="lg"
            >
              {t.apply.travelDates.continueButton}
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h2 className="mb-2 text-2xl font-bold text-[#0B3948]">{t.apply.documents.title}</h2>
            {hasValidPassport && (
 <div className="bg-green-100 border border-green-400 p-3 rounded mb-4 text-green-800 font-medium">
  {t.apply.documents.passportSaved}
</div>
)}
            {hasPassportInVault && !hasValidPassport && (
              <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
                {t.apply.documents.invalid}
              </div>
            )}
           <p className="mb-6 text-[#355865]">
  {hasValidPassport
    ? t.apply.documents.passportSavedDesc
    : t.apply.documents.defaultDesc}
</p>

            <div className="space-y-4 mb-8">
              {visa.requirements?.map((docType, index) => {

 
  const isPassportType = docType.toLowerCase().includes('passport');
  const isAutoPassport = isPassportType && hasValidPassport && hasPassportInVault;

  const uploadedDoc = documents.find(d => d.type === docType);
                return (
                  <div key={index} className="rounded-2xl border border-[#DDEAE5] p-4 transition hover:border-[#00D474]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText size={20} className="mr-3 text-[#00B863]" />
                        <span className="font-medium text-[#0B3948]">{docType}</span>
                      </div>
      {isAutoPassport ? (
  <div className="flex items-center gap-2">
    <CheckCircle size={20} className="text-green-500" />
    <span className="text-sm text-green-600">
      {t.apply.documents.passportSaved}
    </span>
  </div>
) : uploadedDoc ? (
  <div className="flex items-center gap-2">
    <CheckCircle size={20} className="text-green-500" />
    <button
      onClick={() => setDocuments(prev => prev.filter(d => d.type !== docType))}
      className="text-sm text-red-600 hover:text-red-700"
    >
      {t.apply.documents.removeButton}
    </button>
  
                        </div>
                      ) : (
                        <label className="flex cursor-pointer items-center rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-4 py-2 text-white transition">
                          <Upload size={16} className="mr-2" />
                          {t.apply.documents.uploadButton}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(docType, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
            {(uploadedDoc || isAutoPassport) && (
  <div className="ml-8 mt-2 text-sm text-[#5F7B84]">
    
    {isAutoPassport ? (
      <p className="text-green-600">
        {t.apply.documents.passportVaultMsg}
      </p>
    ) : (
      <>
        {verifying && isPassportType && (
          <p className="text-blue-600">
            {t.apply.documents.verifying}
          </p>
        )}

        {passportValid === true && isPassportType && (
          <p className="text-green-600">
            {t.apply.documents.verified}
          </p>
        )}

        {passportValid === false && isPassportType && (
          <p className="text-red-600">
            {t.apply.documents.invalid}
          </p>
        )}

        <span>
          {uploadedDoc?.file?.name}
          {uploadedDoc?.file && (
            <> ({Math.round(uploadedDoc.file.size / 1024)} KB)</>
          )}
        </span>
      </>
    )}
    
  </div>

                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="secondary"
                className="flex-1"
              >
                {t.apply.documents.backButton}
              </Button>
              <Button
               onClick={() => setStep(3)}
                disabled={!canContinueToReview}
                className="flex-1"
              >
                {t.apply.documents.continueButton}
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h2 className="mb-6 text-2xl font-bold text-[#0B3948]">{t.apply.review.title}</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-[#5F7B84]">{t.apply.review.destination}</span>
                <span className="font-semibold text-[#0B3948]">{visa.country_name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-[#5F7B84]">{t.apply.review.visaType}</span>
                <span className="font-semibold text-[#0B3948]">{visa.visa_type}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-[#5F7B84]">{t.apply.review.processingTime}</span>
                <span className="font-semibold text-[#0B3948]">{visa.processing_time}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-[#5F7B84]">{t.apply.review.entryDate}</span>
                <span className="font-semibold text-[#0B3948]">{new Date(entryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-[#5F7B84]">{t.apply.review.exitDate}</span>
                <span className="font-semibold text-[#0B3948]">{new Date(exitDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-[#5F7B84]">{t.apply.review.totalPrice}</span>
                <span className="text-3xl font-bold text-[#00B863]">€{visa.total_price}</span>
              </div>
            </div>

            <div className="mb-8 rounded-2xl bg-[#F7FBFA] p-6">
              <h3 className="mb-4 text-lg font-semibold text-[#0B3948]">{t.apply.review.uploadedDocuments.replace('{count}', (documents.length + (hasValidPassport ? 1 : 0)).toString())}</h3>
             <div className="space-y-2">
  {documents.map((doc, idx) => (
    <div key={idx} className="flex items-center text-sm text-[#355865]">
      <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
      <span>{doc.type}</span>
    </div>
  ))}

  {hasValidPassport && (
    <div className="flex items-center text-sm text-[#355865]">
      <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
      <span>{t.apply.review.passportFromVault}</span>
    </div>
  )}
</div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                disabled={loading}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                {t.apply.review.backButton}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                size="lg"
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    {t.apply.review.submitting}
                  </span>
                ) : (
                  t.apply.review.submitButton
                )}
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
}
