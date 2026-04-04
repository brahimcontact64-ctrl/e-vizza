import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {

  let res = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // مهم جداً: قراءة session أولاً
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  const { pathname } = req.nextUrl

  const protectedRoutes = [
    '/dashboard',
    '/applications',
    '/appointments',
    '/profile',
    '/apply',
  ]

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !user) {

    const loginUrl = req.nextUrl.clone()

    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', pathname)

    return NextResponse.redirect(loginUrl)

  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/applications/:path*',
    '/appointments/:path*',
    '/profile/:path*',
    '/apply/:path*',
  ],
}