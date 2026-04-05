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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#00B863]"></div>
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
    <div className="flex min-h-screen flex-col bg-background">

      <nav className="border-b border-[#DDEAE5] bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between h-16 items-center">

            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#00D474] to-[#00B863]">
                <span className="text-white font-bold">eV</span>
              </div>
              <span className="text-xl font-bold text-[#0B3948]">
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
                        ? 'bg-[#E8FFF4] text-[#00B863]'
                        : 'text-[#355865] hover:bg-[#F1F7F5]'
                      }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.name}
                  </Link>
                );

              })}

              <button
                onClick={handleSignOut}
                className="ml-2 flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[#355865] hover:bg-[#F1F7F5]"
              >
                <LogOut size={18} className="mr-2" />
                {t.nav.signOut}
              </button>

            </div>

            <div className="md:hidden">
              <button
                onClick={handleSignOut}
                className="rounded-lg p-2 hover:bg-[#F1F7F5]"
              >
                <LogOut size={20} />
              </button>
            </div>

          </div>

        </div>

      </nav>

      <div className="border-b border-[#DDEAE5] bg-white md:hidden">
        <div className="flex justify-around">

          {navigation.map((item) => {

            const Icon = item.icon;
            const active = mounted && pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-3 text-xs font-medium transition
                  ${active ? 'text-[#00B863]' : 'text-[#5F7B84]'}`}
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
