import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const nextPath = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth code exchange failed:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  console.log(await supabase.auth.getUser());

  const redirectPath = nextPath?.startsWith('/') ? nextPath : '/dashboard';
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
