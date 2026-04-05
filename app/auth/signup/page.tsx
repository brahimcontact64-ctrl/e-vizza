'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader as Loader2 } from 'lucide-react';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError(t.auth.google.failed);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError(t.auth.signup.errors.emptyFields);
      return;
    }

    if (!email.includes('@')) {
      setError(t.auth.signup.errors.invalidEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.signup.errors.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.signup.errors.passwordsDontMatch);
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUpWithEmail(email, password, fullName);

    if (signUpError) {
      setError(t.auth.signup.errors.failed);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F7FBFA] via-white to-white px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#00D474] to-[#00B863] shadow-lg shadow-[#00D474]/30">
              <span className="text-white font-bold text-xl">eV</span>
            </div>
            <span className="text-3xl font-bold text-[#0B3948]">e-Vizza</span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-[#0B3948]">{t.auth.signup.title}</h1>
          <p className="text-[#6B7C85] mt-2">{t.auth.signup.subtitle}</p>
        </div>

        <Card>
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="mb-5 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#DDEAE5] bg-white px-5 text-sm font-semibold text-[#0B3948] shadow-sm transition-all duration-200 hover:border-[#00D474] hover:bg-[#F7FBFA] hover:shadow-md disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <GoogleIcon />
            )}
            <span>{googleLoading ? t.auth.google.loading : t.auth.google.button}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-5 flex items-center">
            <div className="flex-1 border-t border-[#DDEAE5]" />
            <span className="mx-4 text-xs font-medium text-[#9AAFB7] uppercase tracking-wider">
              {t.auth.divider}
            </span>
            <div className="flex-1 border-t border-[#DDEAE5]" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="fullName"
              type="text"
              label={t.auth.signup.fullNameLabel}
              placeholder={t.auth.signup.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              id="email"
              type="email"
              label={t.auth.signup.emailLabel}
              placeholder={t.auth.signup.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              type="password"
              label={t.auth.signup.passwordLabel}
              placeholder={t.auth.signup.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              id="confirmPassword"
              type="password"
              label={t.auth.signup.confirmPasswordLabel}
              placeholder={t.auth.signup.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading || googleLoading} size="lg" fullWidth>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  {t.auth.signup.loading}
                </>
              ) : (
                t.auth.signup.button
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#6B7C85]">{t.auth.signup.alreadyHaveAccount} </span>
            <Link href="/auth/login" className="font-semibold text-[#00B863] hover:underline">
              {t.auth.signup.signInLink}
            </Link>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[#9AAFB7] transition hover:text-[#00B863]">
            ← {t.auth.signup.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
