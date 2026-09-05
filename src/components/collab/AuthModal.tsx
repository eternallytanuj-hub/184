'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  OFFICER_ROLES, 
  OfficerRole, 
  OfficerProfile 
} from '@/data/collabData';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  Smartphone, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw,
  ScanFace
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: OfficerRole) => void;
  currentRole: OfficerRole;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentRole,
}: AuthModalProps) {
  const [selectedRole, setSelectedRole] = useState<OfficerRole>(currentRole);
  const [badgeId, setBadgeId] = useState(OFFICER_ROLES[currentRole].badgeNumber);
  const [password, setPassword] = useState('••••••••••••');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP' | 'BIOMETRIC'>('CREDENTIALS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectRolePreset = (role: OfficerRole) => {
    setSelectedRole(role);
    setBadgeId(OFFICER_ROLES[role].badgeNumber);
    setPassword('••••••••••••');
    setErrorMsg('');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeId) {
      setErrorMsg('Please enter Officer ID / Badge Number');
      return;
    }
    setIsProcessing(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsProcessing(false);
      setStep('OTP');
      setOtp('749210'); // Simulated prefilled OTP for hackathon demo
    }, 600);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrorMsg('Please enter 6-digit OTP');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onLoginSuccess(selectedRole);
      onClose();
    }, 600);
  };

  const handleBiometricSimulate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onLoginSuccess(selectedRole);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#121212] border border-white/20 w-full max-w-lg rounded-none shadow-2xl overflow-hidden flex flex-col">
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

          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Role Switcher Presets */}
        <div className="p-4 bg-[#171717] border-b border-white/10">
          <label className="block text-[10px] font-mono text-white/50 uppercase mb-2">
            Select Operational Persona for Live Demonstration:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {(Object.keys(OFFICER_ROLES) as OfficerRole[]).map((r) => {
              const profile = OFFICER_ROLES[r];
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectRolePreset(r)}
                  className={`p-2 text-left border text-xs font-mono transition-all rounded-none ${
                    isSelected
                      ? 'border-[#ceff00] bg-[#ceff00]/10 text-white'
                      : 'border-white/10 bg-[#0c0c0c] text-white/60 hover:text-white hover:border-white/30'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate text-[#ceff00]">
                    {profile.roleName.split(' ')[0]} {profile.roleName.split(' ')[1] || ''}
                  </div>
                  <div className="text-[9px] text-white/40 truncate mt-0.5">
                    {profile.badgeNumber}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'CREDENTIALS' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Officer ID / Badge Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="e.g. I4C-DIR-01 or JPR-CI-889"
                    className="w-full bg-[#0c0c0c] border border-white/10 pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0c0c0c] border border-white/10 pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0c0c0c] border border-white/5 text-[11px] font-mono text-white/50 flex items-center justify-between">
                <span>Selected Officer:</span>
                <span className="text-white font-bold">{OFFICER_ROLES[selectedRole].name}</span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-[#ceff00] hover:bg-[#b8e600] text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors rounded-none flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(206,255,0,0.2)] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Validating Credentials...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Request Mobile OTP Verification
                    </>
                  )}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="flex-shrink mx-2 text-[10px] font-mono text-white/40 uppercase">OR QUICK BIOMETRIC</span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleBiometricSimulate}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono uppercase flex items-center justify-center gap-1.5 transition-colors rounded-none"
                  >
                    <Fingerprint className="w-4 h-4 text-[#ceff00]" />
                    Fingerprint
                  </button>
                  <button
                    type="button"
                    onClick={handleBiometricSimulate}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono uppercase flex items-center justify-center gap-1.5 transition-colors rounded-none"
                  >
                    <ScanFace className="w-4 h-4 text-sky-400" />
                    Facial Recog
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="p-4 bg-[#0c0c0c] border border-white/10 text-center space-y-2">
                <Smartphone className="w-8 h-8 text-[#ceff00] mx-auto" />
                <div className="text-xs font-mono font-bold text-white uppercase">
                  OTP Sent to Registered Mobile
                </div>
                <div className="text-[11px] font-mono text-white/50">
                  Transmitted to {OFFICER_ROLES[selectedRole].phone}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Enter 6-Digit One Time Password *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="749210"
                  className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2.5 text-center text-lg tracking-widest font-mono text-[#ceff00] focus:outline-none focus:border-[#ceff00] rounded-none"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>Resend OTP in 24s</span>
                <button
                  type="button"
                  onClick={() => setStep('CREDENTIALS')}
                  className="text-[#ceff00] hover:underline"
                >
                  Change Officer ID
                </button>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-[#ceff00] hover:bg-[#b8e600] text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors rounded-none flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(206,255,0,0.2)] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Authorizing Secure Session...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Enter Command Console
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="p-3 bg-[#080808] border-t border-white/10 text-[9px] font-mono text-white/40 text-center uppercase">
          Authorized for Official Indian Law Enforcement Personnel Only • Session Timeout: 15 Mins
        </div>
      </div>
    </div>
  );
}
