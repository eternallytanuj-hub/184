'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { supabase } from '@/lib/auth/supabaseClient';
import AuthModal from '@/components/collab/AuthModal';

export interface AuthGateProps {
  children: React.ReactNode;
}

// Isomorphic layout effect to run synchronously before paint on the client
// while avoiding SSR warnings on the server.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Synchronously check localStorage before initial paint to prevent FOUC (flash of modal or blur)
  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cybercast_officer');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && parsed.badgeId) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Handle corrupted localStorage gracefully
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Helper to evaluate full authentication state
    const evaluateAuth = async () => {
      // 1. Check localStorage for active officer
      let hasStoredOfficer = false;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('cybercast_officer');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object' && parsed.badgeId) {
              hasStoredOfficer = true;
            }
          }
        } catch {
          hasStoredOfficer = false;
        }
      }

      // 2. Query Supabase session
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (data?.session) {
          setIsAuthenticated(true);
          return;
        }
      } catch (err) {
        console.error('Failed to get Supabase session in AuthGate:', err);
      }

      // If no active Supabase session, fall back to stored officer (or unauthenticated)
      if (!isMounted) return;
      setIsAuthenticated(hasStoredOfficer);
    };

    // Initial session verification on mount
    evaluateAuth();

    // Subscribe to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        } else if (session) {
          setIsAuthenticated(true);
        } else {
          evaluateAuth();
        }
      }
    );

    // Listen to custom intra-window auth change event
    const handleAuthChange = () => {
      if (!isMounted) return;
      evaluateAuth();
    };

    // Listen to cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (!isMounted) return;
      if (e.key === 'cybercast_officer' || !e.key) {
        evaluateAuth();
      }
    };

    window.addEventListener('cybercast_auth_change', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('cybercast_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="filter blur-[8px] pointer-events-none select-none transition-all duration-300"
        aria-hidden="true"
      >
        {children}
      </div>
      <AuthModal
        isOpen={true}
        onClose={() => {}}
        canDismiss={false}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    </>
  );
}

export default AuthGate;
