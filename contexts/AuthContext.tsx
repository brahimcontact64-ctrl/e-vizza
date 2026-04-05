'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null; session: Session | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      setProfile(data ?? null);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile(null);
    }
  };

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const handleAuthFailure = async (error: unknown) => {
    console.error('Supabase auth failure:', error);
    clearAuthState();

    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.warn('Error signing out after auth failure:', signOutError);
    }

    router.replace('/auth/login');
  };

  const refreshUser = async () => {
    try {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (!currentSession?.user) {
        clearAuthState();
        return;
      }

      setSession(currentSession);
      setUser(currentSession.user);
      await fetchProfile(currentSession.user.id);
    } catch (error) {
      await handleAuthFailure(error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          throw error;
        }

        setSession(initialSession ?? null);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (!mounted) return;
        await handleAuthFailure(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        await handleAuthFailure(new Error(`Auth state change: ${event}`));
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error, session: null };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
      }

      return {
        error: null,
        session: data?.session ?? null,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      await handleAuthFailure(error);
      return { error: { message: 'Sign in failed' } as AuthError, session: null };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'Sign up failed' } as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: (typeof window !== 'undefined' ? window.location.origin : '') + '/dashboard',
      },
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Sign out error:', error);
    }

    clearAuthState();
  };

  const isAdmin =
    profile?.role === 'admin' || profile?.role === 'super_admin';

  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isAdmin,
        isSuperAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};