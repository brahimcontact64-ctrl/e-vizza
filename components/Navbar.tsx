'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navbar() {
  const { session, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white text-slate-900 shadow-md sticky top-0 z-50 w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className={`${isRTL ? 'order-2' : 'order-1'} flex items-center flex-shrink-0 min-w-fit`}>
            <Link href="/" className="flex items-center gap-2 min-w-fit">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">eV</span>
              </div>
              <span className="text-xl font-bold text-slate-900">e-Vizza</span>
            </Link>
          </div>

          <div className={`${isRTL ? 'order-1' : 'order-2'} flex items-center gap-2`}>
            <div className="md:hidden flex items-center gap-2 flex-shrink-0">
              <div className={`${isRTL ? 'order-2' : 'order-1'} max-w-[80px]`}>
                <LanguageSwitcher />
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${isRTL ? 'order-1' : 'order-2'} p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-slate-900`}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'}`}>
              <Link href="/" className="text-slate-900 hover:text-teal-600 transition font-medium">
                {t.navbar.home}
              </Link>
              <Link href="/destinations" className="text-slate-900 hover:text-teal-600 transition font-medium">
                {t.navbar.destinations}
              </Link>

              {session ? (
                <>
                  <Link href="/apply/new" className="text-slate-900 hover:text-teal-600 transition font-medium">
                    {t.navbar.applyVisa}
                  </Link>
                  <Link href="/appointments/book" className="text-slate-900 hover:text-teal-600 transition font-medium">
                    {t.navbar.appointments}
                  </Link>
                  <Link href="/dashboard" className="text-slate-900 hover:text-teal-600 transition font-medium">
                    {t.navbar.dashboard}
                  </Link>
                  <Link href="/dashboard/applications" className="text-slate-900 hover:text-teal-600 transition font-medium">
                    {t.navbar.myApplications}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-slate-900 hover:text-red-600 transition font-medium"
                  >
                    {t.navbar.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/apply/new" className="text-slate-900 hover:text-teal-600 transition font-medium">
                    {t.navbar.applyVisa}
                  </Link>
                  <Link href="/appointments/book" className="text-slate-900 hover:text-teal-600 transition font-medium">
                    {t.navbar.appointments}
                  </Link>
                  <Link href="/auth/login" className="text-slate-900 hover:text-teal-600 transition font-medium">
                    {t.navbar.login}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
                  >
                    {t.navbar.createAccount}
                  </Link>
                </>
              )}

              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-[min(20rem,100vw)] max-w-full bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto`}>
            <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link href="/" className="flex items-center gap-2 min-w-fit flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">eV</span>
                </div>
                <span className="text-xl font-bold text-slate-900">e-Vizza</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={24} className="text-slate-900" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.navbar.home}
            </Link>
            <Link
              href="/destinations"
              className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.navbar.destinations}
            </Link>

            {session ? (
              <>
                <Link
                  href="/apply/new"
                  className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.applyVisa}
                </Link>
                <Link
                  href="/appointments/book"
                  className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.appointments}
                </Link>
                <Link
                  href="/dashboard"
                  className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.dashboard}
                </Link>
                <Link
                  href="/dashboard/applications"
                  className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.myApplications}
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className={`w-full py-2 text-red-600 font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {t.navbar.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/apply/new"
                  className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.applyVisa}
                </Link>
                <Link
                  href="/appointments/book"
                  className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.appointments}
                </Link>
                <Link
                  href="/auth/login"
                  className="block py-2 text-slate-900 hover:text-teal-600 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.login}
                </Link>
                <Link
                  href="/auth/signup"
                  className="block py-2 text-white bg-emerald-600 rounded-lg text-center font-medium hover:bg-emerald-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.createAccount}
                </Link>
              </>
            )}

            </div>
          </div>
        </>
      )}
    </nav>
  );
}
