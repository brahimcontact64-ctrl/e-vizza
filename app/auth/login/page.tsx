'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader as Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { signInWithEmail, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectParam = searchParams.get('redirect');

  const redirect =
    redirectParam && redirectParam.startsWith('/')
      ? redirectParam
      : '/dashboard/applications';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t.auth.login.errors.emptyFields);
      return;
    }

    setLoading(true);

    try {
      const { error, session } = await signInWithEmail(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!session) {
        setError(t.auth.login.errors.noSession);
        setLoading(false);
        return;
      }

      router.replace('/')
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(t.auth.login.errors.failed);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">eV</span>
            </div>

            <span className="text-3xl font-bold text-gray-900">e-Vizza</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">{t.auth.login.title}</h1>

          <p className="text-gray-600 mt-2">{t.auth.login.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.auth.login.emailLabel}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder={t.auth.login.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.auth.login.passwordLabel}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder={t.auth.login.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  {t.auth.login.loading}
                </>
              ) : (
                t.auth.login.button
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}