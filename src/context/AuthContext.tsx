'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/mock-store';

export type UserRole = 'coordinator' | 'patient';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error?: string; confirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'med_vantage_user_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from Supabase or local storage
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabaseClient.auth.getSession();
          if (!error && data.session?.user) {
            const supaUser = data.session.user;
            const appUser: AppUser = {
              id: supaUser.id,
              email: supaUser.email || '',
              fullName: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
              role: (supaUser.user_metadata?.role as UserRole) || 'patient',
              createdAt: supaUser.created_at,
            };
            if (mounted) setUser(appUser);
          } else {
            // Check local fallback session
            checkLocalSession();
          }
        } else {
          checkLocalSession();
        }
      } catch (err) {
        console.warn('Auth initialization check failed, using local session fallback:', err);
        checkLocalSession();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    function checkLocalSession() {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (mounted) setUser(parsed);
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          }
        }
      }
    }

    initSession();

    // Listen to Supabase auth events
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      if (isSupabaseConfigured()) {
        const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const supaUser = session.user;
            const appUser: AppUser = {
              id: supaUser.id,
              email: supaUser.email || '',
              fullName: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
              role: (supaUser.user_metadata?.role as UserRole) || 'patient',
              createdAt: supaUser.created_at,
            };
            setUser(appUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
            }
          } else {
            // User signed out in Supabase
            if (typeof window !== 'undefined' && !localStorage.getItem(LOCAL_STORAGE_USER_KEY)?.includes('demo-')) {
              setUser(null);
              localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            }
          }
        });
        subscription = data.subscription;
      }
    } catch (e) {
      console.warn('Auth state change listener error:', e);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // If Supabase returned invalid login or email not confirmed, return the message
          return { error: error.message };
        }

        if (data.user) {
          const appUser: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || (email.includes('coordinator') ? 'coordinator' : 'patient'),
            createdAt: data.user.created_at,
          };
          setUser(appUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
          }
          return {};
        }
      }

      // Local fallback sign in if Supabase offline
      const mockRole: UserRole = email.includes('coordinator') || email.includes('staff') || email.includes('doctor') ? 'coordinator' : 'patient';
      const fallbackUser: AppUser = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        fullName: email.split('@')[0],
        role: mockRole,
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackUser));
      }
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      return { error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ error?: string; confirmationRequired?: boolean }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        // In Supabase, if email confirmation is enabled, session is null until user clicks email link
        if (data.user && !data.session) {
          return { confirmationRequired: true };
        }

        if (data.user && data.session) {
          const appUser: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: fullName.trim() || email.split('@')[0],
            role,
            createdAt: data.user.created_at,
          };
          setUser(appUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
          }
          return {};
        }
      }

      // Local Fallback Registration
      const fallbackUser: AppUser = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        fullName: fullName.trim() || email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackUser));
      }
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return { error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured()) {
        await supabaseClient.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    }
  };

  const quickLogin = async (role: UserRole): Promise<void> => {
    const demoUser: AppUser = role === 'coordinator'
      ? {
          id: 'demo-coordinator-1',
          email: 'coordinator@medvantage.com',
          fullName: 'Dr. Sarah Chen, RN',
          role: 'coordinator',
          createdAt: new Date().toISOString(),
        }
      : {
          id: 'demo-patient-1',
          email: 'patient@medvantage.com',
          fullName: 'Jane Doe',
          role: 'patient',
          createdAt: new Date().toISOString(),
        };

    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
