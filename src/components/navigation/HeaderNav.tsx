'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/auth/supabaseClient';

interface OfficerSession {
  badgeId: string;
  name: string;
  role?: string;
  persona?: string;
  email?: string;
}

export default function HeaderNav() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [officer, setOfficer] = useState<OfficerSession | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncAuth = async () => {
      let currentOfficer: OfficerSession | null = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('cybercast_officer');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object' && parsed.badgeId) {
              currentOfficer = parsed as OfficerSession;
            }
          }
        } catch {
          currentOfficer = null;
        }
      }

      if (currentOfficer) {
        if (isMounted) {
          setOfficer(currentOfficer);
          setIsAuthenticated(true);
        }
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          if (isMounted) {
            setIsAuthenticated(true);
            if (typeof window !== 'undefined') {
              try {
                const stored2 = localStorage.getItem('cybercast_officer');
                if (stored2) {
                  const parsed2 = JSON.parse(stored2);
                  if (parsed2 && typeof parsed2 === 'object' && parsed2.badgeId) {
                    setOfficer(parsed2 as OfficerSession);
                  }
                }
              } catch {
                // ignore
              }
            }
          }
          return;
        }
      } catch (err) {
        console.warn('HeaderNav: error verifying session:', err);
      }

      if (isMounted) {
        setOfficer(null);
        setIsAuthenticated(false);
      }
    };

    syncAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT') {
        setOfficer(null);
        setIsAuthenticated(false);
      } else if (session) {
        syncAuth();
      } else {
        syncAuth();
      }
    });

    const handleAuthChange = () => {
      if (!isMounted) return;
      syncAuth();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (!isMounted) return;
      if (e.key === 'cybercast_officer' || !e.key) {
        syncAuth();
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signOut:', err);
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cybercast_officer');
      }
    } catch (err) {
      console.error('Error removing cybercast_officer:', err);
    }

    setOfficer(null);
    setIsAuthenticated(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cybercast_auth_change'));
    }

    try {
      router.push('/');
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0c0c0c]/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto h-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          
          {/* Logo & Brand Lockup with Official Seals */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-8 w-8 flex items-center justify-center bg-black border border-white/15">
                <Image
                  src="/logos/cybercast.png"
                  alt="CyberCast Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-mono text-sm font-bold tracking-wider text-white">
                    CYBER<span className="text-neon">CAST</span>
                  </span>
                  <span className="inline-block h-1 w-1 bg-neon" />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 mt-1">
                  SIH PS 184 • I4C DEFENSE
                </span>
              </div>
            </Link>

            {/* Official MHA / I4C / SIH Badges in Header */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/15">
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity" title="Ministry of Home Affairs">
                <Image
                  src="/logos/emblem_india.svg"
                  alt="MHA"
                  width={16}
                  height={16}
                  className="h-4 w-auto filter invert brightness-200"
                />
              </div>
              <span className="text-zinc-700 text-[10px]">/</span>
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity" title="Indian Cyber Crime Coordination Centre">
                <Image
                  src="/logos/i4c.png"
                  alt="I4C"
                  width={20}
                  height={16}
                  className="h-4 w-auto"
                />
              </div>
              <span className="text-zinc-700 text-[10px]">/</span>
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity" title="Smart India Hackathon">
                <Image
                  src="/logos/sih2026.png"
                  alt="SIH"
                  width={24}
                  height={16}
                  className="h-4 w-auto"
                />
              </div>
            </div>
          </div>

          {/* Center Navigation Group */}
          <nav className="hidden lg:flex items-center gap-3">
            <Link
              href="/benchmarks"
              className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500/40 bg-black/60 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] uppercase tracking-wider transition-colors rounded-none"
            >
              <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
              <span>[ COURT BENCHMARKS ]</span>
            </Link>
          </nav>

          {/* Right Action Group */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-5">
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                {officer && (
                  <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 bg-black/80 border border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                    <span className="h-1.5 w-1.5 bg-neon animate-pulse" />
                    <span className="text-neon font-bold">{officer.badgeId}</span>
                    <span className="text-zinc-500">|</span>
                    <span className="text-zinc-300 truncate max-w-[120px]">{officer.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 border border-white/15 bg-black hover:border-red-500/50 hover:text-red-400 text-zinc-300 font-mono text-[10px] uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                  title="Sign out of CyberCast session"
                >
                  [ SIGN OUT ]
                </button>
              </div>
            )}
            <Link
              href="/collab"
              className="px-3.5 py-1.5 border border-white/20 bg-black hover:border-neon text-white hover:text-neon font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-colors rounded-none"
            >
              [ I4C COLLAB ]
            </Link>
            <Button href="/dashboard" variant="neon" size="sm" className="rounded-none">
              EXPLORE DASHBOARD
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white font-mono text-xs uppercase border border-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? '[ CLOSE ✕ ]' : '[ MENU ☰ ]'}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c0c0c] border-b border-white/10 px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <Link
              href="#tech-stack"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ TECH STACK ]
            </Link>
            <Link
              href="#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ TEAM ROSTER ]
            </Link>
            <Link
              href="/benchmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:border-emerald-400 font-mono text-xs uppercase font-bold col-span-2 text-center flex items-center justify-center gap-2"
            >
              <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
              [ COURT BENCHMARKS ]
            </Link>
          </div>
          <div className="pt-2 space-y-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center justify-center p-2.5 bg-black border border-red-500/40 hover:border-red-400 text-red-400 font-mono text-xs uppercase font-bold tracking-wider transition-colors rounded-none cursor-pointer"
              >
                [ SIGN OUT ]
              </button>
            )}
            <Link
              href="/collab"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center p-2.5 bg-[#171717] border border-white/20 text-[#ceff00] font-mono text-xs uppercase font-bold"
            >
              ACCESS I4C COLLAB SYSTEM →
            </Link>
            <Button href="/dashboard" variant="neon" size="md" className="w-full justify-center">
              EXPLORE DASHBOARD
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
