'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader as Loader2 } from 'lucide-react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      // No code present — could be a direct visit; send to login
      router.replace('/auth/login');
      return;
    }

    const exchange = async () => {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('OAuth code exchange failed:', exchangeError);
        setError(exchangeError.message);
        return;
      }

      // Session is now active; onAuthStateChange in AuthContext will pick it up.
      router.replace('/dashboard');
    };

    exchange();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">Sign-in failed</p>
          <p className="mt-1 text-xs text-red-500">{error}</p>
          <a
            href="/auth/login"
            className="mt-4 inline-block text-sm font-semibold text-[#00B863] hover:underline"
          >
            ← Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="animate-spin text-[#00B863]" size={48} />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="animate-spin text-[#00B863]" size={48} />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
