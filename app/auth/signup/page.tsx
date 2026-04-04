'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader as Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError(signUpError.message || t.auth.signup.errors.failed);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">eV</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">e-Vizza</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{t.auth.signup.title}</h1>
          <p className="text-gray-600 mt-2">{t.auth.signup.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                {t.auth.signup.fullNameLabel}
              </label>
              <input
                id="fullName"
                type="text"
                placeholder={t.auth.signup.fullNamePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                {t.auth.signup.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t.auth.signup.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                {t.auth.signup.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                placeholder={t.auth.signup.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                {t.auth.signup.confirmPasswordLabel}
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder={t.auth.signup.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  {t.auth.signup.loading}
                </>
              ) : (
                t.auth.signup.button
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t.auth.signup.alreadyHaveAccount} </span>
            <Link href="/auth/login" className="text-teal-600 font-semibold hover:underline">
              {t.auth.signup.signInLink}
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-teal-600 transition">
            {t.auth.signup.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
