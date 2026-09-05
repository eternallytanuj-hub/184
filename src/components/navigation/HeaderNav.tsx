'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Center Navigation Group matching spur.us */}
          <nav className="hidden lg:flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-neon mr-1.5" />
            <Link href="#problem" className="nav-link-tech">
              THE PROBLEM
            </Link>
            <span className="text-zinc-700 text-xs select-none">/</span>
            <Link href="#solution" className="nav-link-tech">
              OUR SOLUTION
            </Link>
            <span className="text-zinc-700 text-xs select-none">/</span>
            <Link href="#features" className="nav-link-tech">
              KEY FEATURES
            </Link>
            <span className="text-zinc-700 text-xs select-none">/</span>
            <Link href="#how-it-works" className="nav-link-tech">
              HOW IT WORKS
            </Link>
            <span className="text-zinc-700 text-xs select-none">/</span>
            <Link href="#impact" className="nav-link-tech">
              IMPACT
            </Link>
            <span className="text-zinc-700 text-xs select-none">/</span>
            <Link href="#ecosystem" className="nav-link-tech">
              ECOSYSTEM
            </Link>
            <span className="text-zinc-700 text-xs select-none">/</span>
            <Link href="/collab" className="nav-link-tech text-neon font-bold">
              REPORT & COLLAB
            </Link>
          </nav>

          {/* Right Action Group */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/collab"
              className="px-2.5 py-1.5 border border-white/15 bg-black hover:border-neon text-white hover:text-neon font-mono text-[10px] uppercase tracking-wider transition-colors"
            >
              [ I4C COLLAB ]
            </Link>
            <Button href="/dashboard" variant="neon" size="sm">
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
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ THE PROBLEM ]
            </Link>
            <Link
              href="#solution"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ OUR SOLUTION ]
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ KEY FEATURES ]
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ HOW IT WORKS ]
            </Link>
            <Link
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ IMPACT ]
            </Link>
            <Link
              href="#ecosystem"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-white/10 hover:border-neon hover:text-neon"
            >
              [ ECOSYSTEM ]
            </Link>
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
              href="/collab"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 border border-[#ceff00] bg-[#ceff00]/10 text-[#ceff00] font-bold"
            >
              [ REPORT & COLLAB ]
            </Link>
          </div>
          <div className="pt-2 space-y-2">
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
