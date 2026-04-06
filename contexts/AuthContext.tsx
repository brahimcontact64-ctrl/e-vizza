'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  signInWithGoogle: (redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfileForAuthenticatedUser = async (authenticatedUser: User) => {
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .single();

      if (profileError) {
        const noProfileFound =
          profileError.code === 'PGRST116' ||
          profileError.message.toLowerCase().includes('no rows');

        if (!noProfileFound) {
          throw profileError;
        }

        const { error: insertError } = await supabase.from('profiles').insert({
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          full_name: authenticatedUser.user_metadata?.full_name,
          avatar_url: authenticatedUser.user_metadata?.avatar_url,
        });

        if (insertError) {
          throw insertError;
        }

        const { data: createdProfile, error: createdProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authenticatedUser.id)
          .single();

        if (createdProfileError) {
          throw createdProfileError;
        }

        setProfile(createdProfile as Profile);
        return;
      }

      setProfile(existingProfile as Profile);
    } catch (error) {
      console.error('Profile ensure error:', error);
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
    setLoading(false);
  };

  const refreshUser = async () => {
    try {
      const {
        data: { user: authenticatedUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!authenticatedUser) {
        clearAuthState();
        return;
      }

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      setSession(currentSession ?? null);
      setUser(authenticatedUser);
      await ensureProfileForAuthenticatedUser(authenticatedUser);
    } catch (error) {
      await handleAuthFailure(error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { user: authenticatedUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userError) {
          throw userError;
        }

        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          throw error;
        }

        setSession(initialSession ?? null);
        setUser(authenticatedUser ?? initialSession?.user ?? null);

        if (authenticatedUser) {
          await ensureProfileForAuthenticatedUser(authenticatedUser);
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

      try {
        const {
          data: { user: authenticatedUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        setSession(nextSession ?? null);
        setUser(authenticatedUser ?? nextSession?.user ?? null);

        if (authenticatedUser) {
          await ensureProfileForAuthenticatedUser(authenticatedUser);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          clearAuthState();
        }
      } catch (error) {
        await handleAuthFailure(error);
      } finally {
        setLoading(false);
      }
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
        await ensureProfileForAuthenticatedUser(data.session.user);
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

  const signInWithGoogle = async (redirectPath?: string) => {
    if (typeof window === 'undefined') {
      throw new Error('Google OAuth must run in the browser');
    }

    const callbackUrl = new URL('/auth/callback', window.location.origin);
    if (redirectPath?.startsWith('/')) {
      callbackUrl.searchParams.set('next', redirectPath);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      throw error;
    }
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