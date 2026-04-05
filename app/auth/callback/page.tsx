import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth code exchange failed:', error);
    redirect('/auth/login');
  }

  redirect('/dashboard');
}
