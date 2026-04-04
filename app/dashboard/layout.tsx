'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, FileText, Calendar, User, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();
  const pathname = usePathname();

  const { session, loading, signOut } = useAuth();
  const { t } = useLanguage();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/auth/login');
    }
  }, [session, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Redirecting...
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navigation = [
    { name: t.nav.home, href: '/dashboard', icon: Home },
    { name: t.nav.myApplications, href: '/dashboard/applications', icon: FileText },
    { name: t.nav.appointments, href: '/dashboard/appointments', icon: Calendar },
    { name: t.nav.profile, href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <nav className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between h-16 items-center">

            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">eV</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                e-Vizza
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-2">

              {navigation.map((item) => {

                const Icon = item.icon;
                const active = mounted && pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition
                      ${active
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.name}
                  </Link>
                );

              })}

              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg ml-2"
              >
                <LogOut size={18} className="mr-2" />
                {t.nav.signOut}
              </button>

            </div>

            <div className="md:hidden">
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut size={20} />
              </button>
            </div>

          </div>

        </div>

      </nav>

      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex justify-around">

          {navigation.map((item) => {

            const Icon = item.icon;
            const active = mounted && pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-3 text-xs font-medium transition
                  ${active ? 'text-emerald-600' : 'text-gray-600'}`}
              >
                <Icon size={20} className="mb-1" />
                {item.name}
              </Link>
            );

          })}

        </div>
      </div>

      <main className="flex-1">
        {children}
      </main>

    </div>
  );

}
