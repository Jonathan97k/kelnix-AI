import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  firebaseAuth,
  googleProvider,
  isFirebaseConfigured,
} from '../lib/firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isFirebaseReady: boolean;
  authProvider: 'supabase' | 'firebase' | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authProvider, setAuthProvider] = useState<'supabase' | 'firebase' | null>(null);

  const fetchProfile = async (userId: string, provider: 'supabase' | 'firebase') => {
    if (provider === 'supabase' && isSupabaseConfigured && supabase) {
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
    } else if (provider === 'firebase' && firebaseUser) {
      // For Firebase, build profile from Firebase user data
      setProfile({
        id: firebaseUser.uid,
        fullName: firebaseUser.displayName || 'Kelnix Creator',
        avatarUrl: firebaseUser.photoURL || undefined,
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        updatedAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
      });
    }
  };

  // Initialize Supabase auth
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setAuthProvider('supabase');
          await fetchProfile(currentSession.user.id, 'supabase');
        }
      } catch (err) {
        console.error('[AuthContext] Supabase session init error:', err);
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
        setAuthProvider('supabase');
        await fetchProfile(currentSession.user.id, 'supabase');
      } else {
        setProfile(null);
        setAuthProvider(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Initialize Firebase auth
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // If Supabase isn't configured either, stop loading
      if (!isSupabaseConfigured) setLoading(false);
      return;
    }

    let mounted = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!mounted) return;

      if (fbUser) {
        // Only set Firebase user if Supabase isn't already authenticated
        if (!user) {
          setFirebaseUser(fbUser);
          setAuthProvider('firebase');
          await fetchProfile(fbUser.uid, 'firebase');
        }
      } else {
        setFirebaseUser(null);
        // Don't clear profile if Supabase is still authenticated
        if (!user) {
          setProfile(null);
          setAuthProvider(null);
        }
      }

      // Mark loading as done once Firebase resolves
      if (!isSupabaseConfigured) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

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
        setAuthProvider('supabase');
        await fetchProfile(data.user.id, 'supabase');
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
        setAuthProvider('supabase');
        await fetchProfile(data.user.id, 'supabase');
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      return { error: msg };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    // Try Firebase first if configured
    if (isFirebaseConfigured) {
      try {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        setFirebaseUser(result.user);
        setAuthProvider('firebase');
        await fetchProfile(result.user.uid, 'firebase');
        return { error: null };
      } catch (err: any) {
        console.error('[AuthContext] Firebase Google sign-in error:', err);
        // Handle popup closed by user
        if (err.code === 'auth/popup-closed-by-user') {
          return { error: null };
        }
        return { error: err.message || 'Google sign-in failed.' };
      }
    }

    // Fallback to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/dashboard` },
        });
        return { error: error?.message || null };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Google sign-in failed.' };
      }
    }

    return { error: 'No authentication provider configured.' };
  };

  const signOut = async (): Promise<void> => {
    // Sign out from Firebase if using Firebase
    if (authProvider === 'firebase' && isFirebaseConfigured) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch (err) {
        console.error('[AuthContext] Firebase sign out error:', err);
      }
    }

    // Sign out from Supabase if using Supabase
    if (authProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[AuthContext] Supabase sign out error:', err);
      }
    }

    // Clear all state
    setUser(null);
    setFirebaseUser(null);
    setSession(null);
    setProfile(null);
    setAuthProvider(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (authProvider === 'supabase' && user) {
      await fetchProfile(user.id, 'supabase');
    } else if (authProvider === 'firebase' && firebaseUser) {
      await fetchProfile(firebaseUser.uid, 'firebase');
    }
  };

  const getIdToken = useCallback(async (): Promise<string | null> => {
    // Get Firebase ID token for API calls
    if (authProvider === 'firebase' && firebaseUser) {
      try {
        return await firebaseUser.getIdToken();
      } catch (err) {
        console.error('[AuthContext] Error getting Firebase ID token:', err);
        return null;
      }
    }

    // For Supabase, return the access token
    if (authProvider === 'supabase' && session?.access_token) {
      return session.access_token;
    }

    return null;
  }, [authProvider, firebaseUser, session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        profile,
        session,
        loading,
        isConfigured: isSupabaseConfigured || isFirebaseConfigured,
        isFirebaseReady: isFirebaseConfigured,
        authProvider,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
        getIdToken,
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
