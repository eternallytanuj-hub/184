'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  User,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { OfficerRole, OFFICER_ROLES } from '@/data/collabData';
import {
  BADGE_TO_EMAIL,
  resolveOfficer,
  OfficerProfile as AuthOfficerProfile,
} from '@/lib/auth/badgeMapping';
import { supabase } from '@/lib/auth/supabaseClient';

export interface DemoPersona {
  badgeId: string;
  shortLabel: string;
  name: string;
  role: string;
  collabRole: OfficerRole;
  password: string;
  persona: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    badgeId: 'I4C-DIR-01',
    shortLabel: 'I4C Central',
    name: 'Dr. A. K. Saxena',
    role: 'i4c_central',
    collabRole: 'i4c_admin',
    password: 'CyberCast@I4C2024',
    persona: 'I4C Central Directorate',
  },
  {
    badgeId: 'RJ-SP-Z04',
    shortLabel: 'State Nodal',
    name: 'Supt. R. Sharma',
    role: 'state_nodal',
    collabRole: 'state_nodal',
    password: 'CyberCast@State2024',
    persona: 'State Cyber Nodal',
  },
  {
    badgeId: 'JPR-CI-889',
    shortLabel: 'District Cyber',
    name: 'Insp. P. Verma',
    role: 'district_cyber',
    collabRole: 'district_officer',
    password: 'CyberCast@District2024',
    persona: 'District Cyber Cell',
  },
  {
    badgeId: 'JPR-SI-412',
    shortLabel: 'Field Squad',
    name: 'SI K. Mehta',
    role: 'field_investigator',
    collabRole: 'field_investigator',
    password: 'CyberCast@Field2024',
    persona: 'Field Investigator',
  },
  {
    badgeId: 'SBI-CFC-91',
    shortLabel: 'Bank Fraud',
    name: 'M. Agarwal (SBI Fraud)',
    role: 'bank_fi',
    collabRole: 'bank_liaison',
    password: 'CyberCast@Bank2024',
    persona: 'Bank Fraud Investigator',
  },
];

const BADGE_OR_ROLE_TO_COLLAB_ROLE: Record<string, OfficerRole> = {
  'I4C-DIR-01': 'i4c_admin',
  i4c_central: 'i4c_admin',
  i4c_admin: 'i4c_admin',
  'RJ-SP-Z04': 'state_nodal',
  state_nodal: 'state_nodal',
  'JPR-CI-889': 'district_officer',
  district_cyber: 'district_officer',
  district_officer: 'district_officer',
  'JPR-SI-412': 'field_investigator',
  field_investigator: 'field_investigator',
  'SBI-CFC-91': 'bank_liaison',
  bank_fi: 'bank_liaison',
  bank_liaison: 'bank_liaison',
};

export type { AuthOfficerProfile as OfficerProfile };

export interface AuthModalProps<T = OfficerRole> {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
  initialBadgeId?: string;
  currentRole?: OfficerRole;
  onLoginSuccess?: (data: T) => void;
}

export default function AuthModal<T = OfficerRole>({
  isOpen,
  onClose,
  canDismiss = true,
  onLoginSuccess,
  initialBadgeId,
  currentRole,
}: AuthModalProps<T>) {
  // Determine initial state based on props
  const defaultPersona = DEMO_PERSONAS.find(
    (p) =>
      (initialBadgeId && p.badgeId.toUpperCase() === initialBadgeId.trim().toUpperCase()) ||
      (currentRole && p.collabRole === currentRole)
  ) || DEMO_PERSONAS[0];

  const [selectedRole, setSelectedRole] = useState<OfficerRole>(
    currentRole || defaultPersona.collabRole
  );
  const [badgeId, setBadgeId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Sync state when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setIsProcessing(false);

      if (initialBadgeId) {
        const normalized = initialBadgeId.trim().toUpperCase();
        const match = DEMO_PERSONAS.find((p) => p.badgeId.toUpperCase() === normalized);
        if (match) {
          setPassword('');
          setSelectedRole(match.collabRole);
        }
      } else if (currentRole) {
        setSelectedRole(currentRole);
        const match = DEMO_PERSONAS.find((p) => p.collabRole === currentRole);
        if (match) {
          setBadgeId('');
          setPassword('');
        }
      }
    }
  }, [isOpen, initialBadgeId, currentRole]);

  // Handle escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canDismiss && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canDismiss, isProcessing, onClose]);

  if (!isOpen) return null;

  // Resolve officer in real-time
  const resolvedOfficer = resolveOfficer(badgeId);

  const handleSelectPersona = (persona: DemoPersona) => {
    if (isProcessing) return;
    setSelectedRole(persona.collabRole);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && canDismiss && !isProcessing) {
      onClose();
    }
  };

  // Login submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    const trimmedBadge = badgeId ? badgeId.trim() : '';

    // Validate required badge
    if (!trimmedBadge) {
      setErrorMsg('Please enter Officer ID / Badge Number');
      return;
    }

    // Pre-auth Badge Validation: instant rejection without calling Supabase
    const officer = resolveOfficer(trimmedBadge);
    if (!officer) {
      setErrorMsg('Invalid Officer ID. Access Denied.');
      return;
    }

    const email = BADGE_TO_EMAIL[officer.badgeId] || officer.email;
    if (!email) {
      setErrorMsg('Invalid Officer ID. Access Denied.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.session) {
        setIsProcessing(false);
        setErrorMsg('Authentication Failed. Invalid credentials.');
        return;
      }

      // Successful Supabase Authentication
      const officerPayload = {
        badgeId: officer.badgeId,
        name: officer.name,
        role: officer.role,
        persona: officer.persona,
      };

      // 1. Persist to localStorage under key "cybercast_officer"
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cybercast_officer', JSON.stringify(officerPayload));
        } catch (err) {
          console.error('Failed to persist cybercast_officer:', err);
        }
        // 2. Dispatch custom event "cybercast_auth_change"
        window.dispatchEvent(new Event('cybercast_auth_change'));
      }

      const collabRole =
        BADGE_OR_ROLE_TO_COLLAB_ROLE[officer.role] ||
        (selectedRole as OfficerRole) ||
        'i4c_admin';

      const officerWithCompat: any = {
        ...officerPayload,
        email: officer.email,
        title: officer.title || officer.persona,
        collabRole,
        toString: () => collabRole,
        valueOf: () => collabRole,
        [Symbol.toPrimitive]: () => collabRole,
      };

      setIsProcessing(false);
      setSuccessMsg(`ACCESS GRANTED: ${officer.name.toUpperCase()}`);

      // Close modal
      onClose();

      // Trigger success callback with backward compatibility
      if (onLoginSuccess) {
        const isLegacyRoleCallback =
          currentRole !== undefined &&
          typeof onLoginSuccess === 'function' &&
          (/setCurrentRole/i.test(onLoginSuccess.toString()) ||
            /^\s*\(?\s*role\s*\)?\s*=>/i.test(onLoginSuccess.toString()));

        if (isLegacyRoleCallback) {
          onLoginSuccess(collabRole as any);
        } else {
          onLoginSuccess(officerWithCompat);
        }
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg('Authentication Failed. Invalid credentials.');
    }
  };


  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121212] border border-white/20 w-full max-w-lg rounded-none shadow-2xl overflow-hidden flex flex-col font-mono"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 bg-[#0c0c0c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 relative flex items-center justify-center">
              <Image
                src="/CyberCast.png"
                alt="CyberCast"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#ceff00] tracking-widest block uppercase">
                MHA // I4C SECURE ACCESS GATEWAY
              </span>
              <span className="text-xs font-bold text-white font-mono uppercase">
                Law Enforcement Verification Portal
              </span>
            </div>
          </div>

          {canDismiss && (
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              aria-label="Close modal"
              className="text-white/50 hover:text-white p-1 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>


        {/* Form Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                Officer ID / Badge Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  disabled={isProcessing}
                  value={badgeId}
                  onChange={(e) => {
                    setBadgeId(e.target.value);
                    if (errorMsg) setErrorMsg('');
                    if (successMsg) setSuccessMsg('');
                  }}
                  placeholder="e.g. I4C-DIR-01 or JPR-CI-889"
                  className="w-full bg-[#0c0c0c] border border-white/10 pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                Govt SSO Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  autoComplete="off"
                  disabled={isProcessing}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                    if (successMsg) setSuccessMsg('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0c0c0c] border border-white/10 pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Dynamic Selected Officer Resolution */}
            <div className="p-3 bg-[#0c0c0c] border border-white/5 text-[11px] font-mono text-white/50 flex items-center justify-between">
              <span>Selected Officer:</span>
              <span
                className={`font-bold ${
                  resolvedOfficer ? 'text-white' : 'text-white/40'
                }`}
              >
                {resolvedOfficer ? resolvedOfficer.name : 'Unknown Officer'}
              </span>
            </div>

            {/* Error Message Area directly above the LOGIN button */}
            {errorMsg && (
              <div
                role="alert"
                className="p-3 bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-400 flex items-center gap-2 rounded-none"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div
                role="status"
                className="p-3 bg-[#ceff00]/10 border border-[#ceff00]/30 text-xs font-mono text-[#ceff00] flex items-center gap-2 rounded-none"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-[#ceff00] hover:bg-[#b8e600] text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors rounded-none flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(206,255,0,0.2)] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    LOGIN
                  </>
                )}
              </button>


            </div>
          </form>
        </div>

        {/* Footer Disclaimer */}
        <div className="p-3 bg-[#080808] border-t border-white/10 text-[9px] font-mono text-white/40 text-center uppercase">
          Authorized for Official Indian Law Enforcement Personnel Only • Session Timeout: 15 Mins
        </div>
      </div>
    </div>
  );
}
