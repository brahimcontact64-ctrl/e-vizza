'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { session, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const navLinkClass = (href: string) =>
    `relative text-sm font-medium transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-transform after:duration-200 ${
      pathname === href
        ? 'text-[#00B863] after:bg-[#00D474] after:scale-x-100'
        : 'text-[#5F7B84] hover:text-[#00B863] after:bg-[#00D474] after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full max-w-full overflow-x-clip transition-all duration-300 ${
          scrolled ? 'glass border-b border-[#DDEAE5] shadow-sm' : 'bg-white/95 border-b border-[#DDEAE5]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* LOGO */}
            <div className={`${isRTL ? 'order-2' : 'order-1'} flex items-center flex-shrink-0 min-w-fit`}>
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-gradient-to-br from-[#00D474] to-[#00B863] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-[#00D474]/40 transition-shadow duration-300">
                  <span className="text-white font-extrabold text-sm tracking-tight">eV</span>
                </div>
                <span className="text-lg font-extrabold text-[#0B3948] tracking-tight">
                  e<span className="text-[#00B863]">-</span>Vizza
                </span>
              </Link>
            </div>

            {/* CONTROLS */}
            <div className={`${isRTL ? 'order-1' : 'order-2'} flex items-center gap-3`}>

              {/* ── MOBILE ── */}
              <div className="md:hidden flex items-center gap-2">
                <div className={isRTL ? 'order-2' : 'order-1'}>
                  <LanguageSwitcher />
                </div>
                <button
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className={`${isRTL ? 'order-1' : 'order-2'} p-2 rounded-xl hover:bg-[#F1F7F5] active:bg-[#E8F4EF] transition-all duration-200 text-[#0B3948]`}
                  aria-label={t.navbar.toggleMenu}
                >
                  {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                </button>
              </div>

              {/* ── DESKTOP ── */}
              <div className={`hidden md:flex items-center ${isRTL ? 'gap-7 flex-row-reverse' : 'gap-7'}`}>
                <Link href="/" className={navLinkClass('/')}>{t.navbar.home}</Link>
                <Link href="/destinations" className={navLinkClass('/destinations')}>{t.navbar.destinations}</Link>

                {session ? (
                  <>
                    <Link href="/apply/new" className={navLinkClass('/apply/new')}>{t.navbar.applyVisa}</Link>
                    <Link href="/appointments/book" className={navLinkClass('/appointments/book')}>{t.navbar.appointments}</Link>
                    <Link href="/dashboard" className={navLinkClass('/dashboard')}>{t.navbar.dashboard}</Link>
                    <Link href="/dashboard/applications" className={navLinkClass('/dashboard/applications')}>{t.navbar.myApplications}</Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-[#5F7B84] hover:text-red-500 transition-colors duration-200"
                    >
                      {t.navbar.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/apply/new" className={navLinkClass('/apply/new')}>{t.navbar.applyVisa}</Link>
                    <Link href="/appointments/book" className={navLinkClass('/appointments/book')}>{t.navbar.appointments}</Link>
                    <Link href="/auth/login" className={navLinkClass('/auth/login')}>{t.navbar.login}</Link>
                    <Link
                      href="/auth/signup"
                      className="btn-primary inline-flex h-10 items-center rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] px-5 text-sm font-semibold text-white shadow-primary"
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
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 z-50 md:hidden w-[min(18rem,90vw)] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        {/* drawer header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#00D474] to-[#00B863] rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-xs">eV</span>
            </div>
            <span className="text-base font-extrabold text-[#0B3948]">e<span className="text-[#00B863]">-</span>Vizza</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* drawer links */}
        <nav className={`flex-1 overflow-y-auto px-4 py-5 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          {[
            { href: '/', label: t.navbar.home },
            { href: '/destinations', label: t.navbar.destinations },
            { href: '/apply/new', label: t.navbar.applyVisa },
            { href: '/appointments/book', label: t.navbar.appointments },
            ...(session ? [
              { href: '/dashboard', label: t.navbar.dashboard },
              { href: '/dashboard/applications', label: t.navbar.myApplications },
            ] : []),
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === href
                  ? 'bg-[#E8FFF4] text-[#00B863] font-semibold'
                  : 'text-[#0B3948] hover:bg-[#F1F7F5] hover:text-[#00B863]'
              }`}
            >
              {label}
            </Link>
          ))}

          {session ? (
            <button
              onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
              className={`w-full flex px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition ${isRTL ? 'justify-end' : 'justify-start'}`}
            >
              {t.navbar.logout}
            </button>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-[#0B3948] hover:bg-[#F1F7F5] hover:text-[#00B863] transition"
            >
              {t.navbar.login}
            </Link>
          )}
        </nav>

        {/* drawer footer */}
        {!session && (
          <div className="px-4 pb-6 pt-3 border-t border-gray-100">
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary flex h-12 items-center justify-center w-full rounded-2xl bg-gradient-to-r from-[#00D474] to-[#00B863] text-white text-sm font-semibold shadow-primary"
            >
              {t.navbar.createAccount}
            </Link>
          </div>
        )}

        {/* language in drawer */}
        <div className={`px-4 pb-5 flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}

