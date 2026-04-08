import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ PUBLIC ROUTES
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/callback',
    '/destinations',
  ];

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // ✅ PROTECTED ROUTES
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
    return NextResponse.next();
  }

  const res = NextResponse.next();

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

  if (!session?.user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
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