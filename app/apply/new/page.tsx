'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Upload, FileText, CircleCheck as CheckCircle, Loader as Loader2, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';

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
    if (!session?.user) return;

  const { data, error } = await supabase
  .from('passport_vault')
  .select('*')
  .eq('user_id', session.user.id)
  .maybeSingle();

if (error) {
  console.error('Passport fetch error:', error);
  return;
}
if (!data) {
  setPassportValid(null); 
  return;
}
    

    const expiry = new Date(data.expiry_date);
    const today = new Date();

    const diffMonths =
      (expiry.getFullYear() - today.getFullYear()) * 12 +
      (expiry.getMonth() - today.getMonth());

    if (diffMonths >= 6) {
      setPassportValid(true);
    } else {
      setPassportValid(false);
    }
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

    if (!res.ok) throw new Error(data.error || 'Verification failed');

    return data;
  } catch (e: any) {
    throw new Error(e.message || 'Passport verification failed');
  }
};

const handleFileUpload = async (type: string, file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB');
    return;
  }

  if (type.toLowerCase().includes('passport') && passportValid === true) {
  alert('Passport already exists in your account ✅');
  return;
}
  if (type.toLowerCase().includes('passport')) {
    setVerifying(true);
    setPassportValid(null);

    try {
      const res = await verifyPassport(file);

      if (!res.isPassport) {
        setPassportValid(false);
        alert('Invalid passport document ❌');
        setVerifying(false);
        return;
      }

    setPassportValid(true);

if (session?.user?.id) {
  await supabase
    .from('passport_vault')
    .upsert({
      user_id: session.user.id,
      passport_number: res.passport_number,
      expiry_date: res.expiry_date,
      updated_at: new Date().toISOString()
    });
}
    } catch (err: any) {
      setPassportValid(false);
      alert(err.message);
      setVerifying(false);
      return;
    }

  setVerifying(false);
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
    
   const { data: { session: currentSession } } = await supabase.auth.getSession();

if (!currentSession) {
  alert("Session expired. Please login again.");
 router.push(`/auth/login?redirect=${encodeURIComponent(`/apply/new?visa_id=${visaId}`)}`);
  return;
}

const userId = currentSession.user.id;
// 🔥 نجيب passport من vault
const { data: passportData } = await supabase
  .from('passport_vault')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();

    if (!currentSession?.user) {
      console.error('Session exists but no user found');
      alert('Session expired. Please login again.');
      router.push(`/auth/login?redirect=${encodeURIComponent(`/apply/new?visa_id=${visaId}`)}`);
      return;
    }

    if (!visa) {
      alert('Visa information not found. Please try again.');
      return;
    }

    if (!entryDate || !exitDate) {
      alert('Please select entry and exit dates');
      return;
    }

 const requiredDocs = visa.requirements || [];

const nonPassportDocs = requiredDocs.filter(
  r => !r.toLowerCase().includes('passport')
);

const uploadedNonPassportDocs = documents.filter(
  d => !d.type.toLowerCase().includes('passport')
);

if (nonPassportDocs.length > 0 && uploadedNonPassportDocs.length === 0) {
  alert('Please upload required documents');
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

      if (passportData && passportValid !== false) {
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
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => step === 1 ? router.push(`/destinations/${visa.id}`) : setStep(step - 1)}
          className="flex items-center text-gray-600 hover:text-teal-600 mb-6 transition"
        >
          <ArrowLeft size={20} className="mr-2" />
          {t.apply.navigation.back}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">{getCountryFlag(visa.country_code)}</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{t.apply.title}</h1>
              <p className="text-xl text-gray-600 mt-1">{visa.country_name} - {visa.visa_type}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  s <= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s < step ? <CheckCircle size={20} /> : s}
                </div>
                {s < 3 && <div className={`w-20 h-1 transition ${s < step ? 'bg-teal-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-sm font-medium">
            <span className={step >= 1 ? 'text-teal-600' : 'text-gray-500'}>{t.apply.steps.step1}</span>
            <span className={step >= 2 ? 'text-teal-600' : 'text-gray-500'}>{t.apply.steps.step2}</span>
            <span className={step >= 3 ? 'text-teal-600' : 'text-gray-500'}>{t.apply.steps.step3}</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.apply.travelDates.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  {t.apply.travelDates.entryLabel}
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  {t.apply.travelDates.exitLabel}
                </label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  min={entryDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-teal-900">
                <strong>{t.apply.travelDates.note}</strong> {t.apply.travelDates.noteText.replace('{processing_time}', visa.processing_time)}
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!entryDate || !exitDate}
              className="w-full bg-teal-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.apply.travelDates.continueButton}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.apply.documents.title}</h2>
            {passportValid === true && (
 <div className="bg-green-100 border border-green-400 p-3 rounded mb-4 text-green-800 font-medium">
  {t.apply.documents.passportSaved}
</div>
)}
           <p className="text-gray-700 mb-6">
  {passportValid === true
    ? t.apply.documents.passportSavedDesc
    : t.apply.documents.defaultDesc}
</p>

            <div className="space-y-4 mb-8">
              {visa.requirements?.map((docType, index) => {

 
  const isPassportType = docType.toLowerCase().includes('passport');
  const isAutoPassport = isPassportType && passportValid === true;

  const uploadedDoc = documents.find(d => d.type === docType);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText size={20} className="text-teal-600 mr-3" />
                        <span className="font-medium text-gray-900">{docType}</span>
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
                        <label className="cursor-pointer bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center">
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
  <div className="mt-2 text-sm text-gray-600 ml-8">
    
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
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                {t.apply.documents.backButton}
              </button>
              <button
               onClick={() => setStep(3)}
disabled={
  (documents.length === 0 && passportValid !== true) ||
  passportValid === false ||
  verifying
}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.apply.documents.continueButton}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.apply.review.title}</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">{t.apply.review.destination}</span>
                <span className="font-semibold text-gray-900">{visa.country_name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">{t.apply.review.visaType}</span>
                <span className="font-semibold text-gray-900">{visa.visa_type}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">{t.apply.review.processingTime}</span>
                <span className="font-semibold text-gray-900">{visa.processing_time}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">{t.apply.review.entryDate}</span>
                <span className="font-semibold text-gray-900">{new Date(entryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">{t.apply.review.exitDate}</span>
                <span className="font-semibold text-gray-900">{new Date(exitDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600 font-medium">{t.apply.review.totalPrice}</span>
                <span className="font-bold text-teal-600 text-3xl">€{visa.total_price}</span>
              </div>
            </div>

            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">{t.apply.review.uploadedDocuments.replace('{count}', (documents.length + (passportValid === true ? 1 : 0)).toString())}</h3>
             <div className="space-y-2">
  {documents.map((doc, idx) => (
    <div key={idx} className="flex items-center text-sm text-gray-700">
      <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
      <span>{doc.type}</span>
    </div>
  ))}

  {passportValid === true && (
    <div className="flex items-center text-sm text-gray-700">
      <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
      <span>{t.apply.review.passportFromVault}</span>
    </div>
  )}
</div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                {t.apply.review.backButton}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    {t.apply.review.submitting}
                  </span>
                ) : (
                  t.apply.review.submitButton
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
