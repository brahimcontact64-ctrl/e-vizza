import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🟢 مهم جدًا: استثناء كل auth routes
  if (
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/destinations')
  ) {
    return NextResponse.next({ request: req });
  }

  // 🟢 فقط هذه routes محمية
  const protectedRoutes = [
    '/dashboard',
    '/applications',
    '/appointments',
    '/profile',
    '/apply',
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next({ request: req });
  }

  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ❌ إذا ما عندوش session → يروح login
  if (!session?.user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';

    loginUrl.searchParams.set('redirect', `${pathname}${req.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/applications/:path*',
    '/appointments/:path*',
    '/profile/:path*',
    '/apply/:path*',
  ],
};