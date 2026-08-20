import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          fullName: data.full_name || 'Kelnix Creator',
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error('[AuthContext] Session init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
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

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured. Authentication is disabled.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign up.';
      return { error: msg };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured. Authentication is disabled.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      return { error: msg };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured. Google sign-in is disabled.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      return { error: error?.message || null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Google sign-in failed.' };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
