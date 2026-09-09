'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, Bell, Lock, User, Clock, AlertTriangle, 
  Fingerprint, ChevronDown, CheckCircle2, ArrowLeft,
  Radio, LogOut, FileText, Map, RefreshCw, ShieldCheck
} from 'lucide-react';
import { OfficerRole, OFFICER_ROLES, OfficerProfile } from '@/data/collabData';
import { getModelHealth, ModelHealthStatus } from '@/lib/apiService';
import { checkAdbDeviceStatus, AdbDeviceStatus } from '@/lib/hardwareService';
import { supabase } from '@/lib/auth/supabaseClient';

interface OfficerSession {
  badgeId: string;
  name: string;
  role?: string;
  persona?: string;
  email?: string;
}

interface CollabHeaderProps {
  currentRole: OfficerRole;
  onRoleChange: (role: OfficerRole) => void;
  unreadCount?: number;
  onOpenAuthModal?: () => void;
  onLoginClick?: () => void;
}

export default function CollabHeader({
  currentRole,
  onRoleChange,
  unreadCount = 3,
  onOpenAuthModal,
  onLoginClick,
}: CollabHeaderProps) {
  const router = useRouter();
  const triggerAuthModal = onLoginClick || onOpenAuthModal || (() => {});
  const [istTime, setIstTime] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(900); // 15 minutes auto-logout
  const [modelHealth, setModelHealth] = useState<ModelHealthStatus | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [officer, setOfficer] = useState<OfficerSession | null>(null);

  // Poll Model API Health every 60s
  const refreshHealth = React.useCallback(async () => {
    try {
      const health = await getModelHealth();
      setModelHealth(health);
    } catch (e) {
      console.warn('Collab header health poll failed:', e);
    }
  }, []);

  // Poll USB ADB Hardware status every 12s
  const [hardwareStatus, setHardwareStatus] = useState<AdbDeviceStatus | null>(null);
  const refreshHardware = React.useCallback(async () => {
    try {
      const st = await checkAdbDeviceStatus();
      setHardwareStatus(st);
    } catch (e) {
      console.warn('Collab header hardware poll failed:', e);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    refreshHardware();
    const timerHealth = setInterval(refreshHealth, 60000);
    const timerHw = setInterval(refreshHardware, 12000);
    return () => {
      clearInterval(timerHealth);
      clearInterval(timerHw);
    };
  }, [refreshHealth, refreshHardware]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Inter-State Help Request Received',
      sub: 'Rajasthan Cyber Cell requests ATM CCTV logs for Case CY-44521',
      time: '2 mins ago',
      level: 'Critical',
      read: false,
    },
    {
      id: 2,
      title: 'Funds Freeze Confirmed',
      sub: 'SBI confirmed ₹1.85 Lakhs frozen in PNB account #XXXX1102',
      time: '14 mins ago',
      level: 'High',
      read: false,
    },
    {
      id: 3,
      title: 'Task Overdue Escalation',
      sub: 'Patna Tower Dump analysis TSK-2026-085 has passed 4-hour SLA',
      time: '45 mins ago',
      level: 'Critical',
      read: false,
    },
  ]);

  const activeOfficer = OFFICER_ROLES[currentRole];

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      };
      setIstTime(now.toLocaleDateString('en-GB', options).toUpperCase() + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 15-min Session Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor Supabase Auth & LocalStorage Session
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
        console.warn('CollabHeader: error checking session:', err);
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
      console.error('Error during signOut in CollabHeader:', err);
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

  const formatSessionTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="w-full bg-[#0c0c0c] border-b border-white/10 select-none z-50 text-white font-mono">
      {/* Top Banner Bar */}
      <div className="mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left Identity: Brand, Logos & Portal Return */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            title="Return to CyberCast Portal"
          >
            <div className="relative h-7 w-7 flex-shrink-0 flex items-center justify-center bg-black p-0.5 border border-white/20">
              <Image
                src="/logos/cybercast.png"
                alt="CyberCast Logo"
                width={26}
                height={26}
                className="h-full w-full object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading-display text-sm font-semibold tracking-wider text-white">
                  CYBER<span className="text-neon">CAST</span>
                </span>
                <span className="h-1.5 w-1.5 bg-neon" />
              </div>
              <span className="text-[9px] text-zinc-400 tracking-wider">
                COLLAB & DOSSIER • PS 184
              </span>
            </div>
          </Link>

          {/* Institutional Emblems */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="flex items-center gap-1.5" title="Ministry of Home Affairs">
              <Image
                src="/logos/emblem_india.svg"
                alt="MHA"
                width={16}
                height={16}
                className="h-4 w-auto filter invert brightness-200"
              />
              <span className="text-[10px] text-zinc-300 font-medium">MHA</span>
            </div>
            <span className="text-zinc-700 text-xs">/</span>
            <div className="flex items-center gap-1.5" title="Indian Cyber Crime Coordination Centre">
              <Image
                src="/logos/i4c.png"
                alt="I4C"
                width={20}
                height={16}
                className="h-4 w-auto"
              />
              <span className="text-[10px] text-zinc-300 font-medium">I4C</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 sm:gap-2 pl-4 border-l border-white/10">
            <Link
              href="/"
              className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-white/5 text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-zinc-400" />
              <span>PORTAL</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-white/5 text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Map className="h-3.5 w-3.5 text-zinc-400" />
              <span>RADAR MAP</span>
            </Link>

            <Link
              href="/verify"
              className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-white/5 text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Public Judicial Verification Portal"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              <span>VERIFY</span>
            </Link>

            <div className="px-2.5 py-1 text-neon text-[11px] uppercase font-bold flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>COLLAB ACTIVE</span>
            </div>
          </div>

          {/* Telemetry Status Bar */}
          <div className="hidden xl:flex items-center gap-3.5 pl-4 border-l border-white/10 text-[10px]">
            {/* Live Model Badge */}
            <div 
              onClick={refreshHealth}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors py-1 select-none"
              title={`ML Engine Status: ${modelHealth?.status === 'healthy' ? '5/5 Models Active' : 'Offline / Cached'} (Latency: ${modelHealth?.latencyMs || 0}ms)`}
            >
              <span className={`h-1.5 w-1.5 ${
                modelHealth?.status === 'healthy' ? 'bg-neon animate-pulse' :
                modelHealth?.status === 'degraded' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="uppercase">
                {modelHealth?.status === 'healthy' ? (
                  <>AI ENGINE: <span className="text-neon font-bold">{modelHealth.modelsLoadedCount}/5 LIVE</span></>
                ) : modelHealth?.status === 'degraded' ? (
                  <span className="text-amber-400">AI ENGINE: {modelHealth.modelsLoadedCount}/5</span>
                ) : (
                  <span className="text-red-400">AI ENGINE: CACHED</span>
                )}
              </span>
            </div>

            {/* Polygon Ledger Synced Pulse Indicator */}
            <Link
              href="/verify"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors py-1 select-none"
              title="Polygon Amoy Ledger: Synced (Block Finality 2.1s)"
            >
              <span className="h-1.5 w-1.5 bg-neon animate-pulse" />
              <span className="uppercase">
                LEDGER: <span className="text-neon font-bold">SYNCED</span>
              </span>
            </Link>

            {/* USB ADB Hardware Bridge Status Indicator */}
            <div
              onClick={refreshHardware}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 cursor-pointer select-none transition-colors py-1"
              title={
                hardwareStatus?.connected
                  ? `ADB Hardware Bridge: ${hardwareStatus.deviceId} (${hardwareStatus.model || 'Android'}). Method A Live Intent Active.`
                  : hardwareStatus?.unauthorized
                  ? `USB Device Unauthorized: ${hardwareStatus.deviceId || 'Android'}. Unlock phone and tap "Allow USB debugging".`
                  : 'ADB Hardware Bridge: Offline / Fallback Simulation Mode'
              }
            >
              <span className={`h-1.5 w-1.5 ${
                hardwareStatus?.connected ? 'bg-[#ceff00] animate-pulse' :
                hardwareStatus?.unauthorized ? 'bg-amber-400 animate-pulse' : 'bg-amber-500'
              }`} />
              <span className="uppercase">
                {hardwareStatus?.connected ? (
                  <>USB HW: <span className="text-[#ceff00] font-bold">{hardwareStatus.deviceId}</span></>
                ) : hardwareStatus?.unauthorized ? (
                  <span className="text-amber-400">USB HW: UNAUTHORIZED</span>
                ) : (
                  <span>USB HW: <span className="text-amber-400 font-bold">SIM</span></span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Center Live IST Clock & Session Security */}
        <div className="hidden 2xl:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-neon" />
            <span className="text-[11px] font-mono">{istTime || 'LOADING IST...'}</span>
          </div>

          {/* Auto-logout countdown */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 pl-4 border-l border-white/10">
            <Lock className="h-3 w-3 text-amber-400" />
            <span>SESSION: <strong className="text-white">{formatSessionTime(sessionSeconds)}</strong></span>
            <button
              onClick={() => setSessionSeconds(900)}
              className="hover:text-neon text-[9px] uppercase tracking-wider text-zinc-500 hover:underline ml-1"
              title="Reset 15-min Session Timer"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Right Section: Role Switcher & Profile & Notifications */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Role Switcher Dropdown (5 Operational Tiers) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="px-2.5 py-1 hover:bg-white/5 flex items-center gap-2 text-xs transition-colors cursor-pointer"
              title="Switch Operational Role for Evaluation"
            >
              <Shield className="h-3.5 w-3.5 text-neon" />
              <div className="text-left hidden sm:block">
                <div className="text-[9px] text-zinc-400 uppercase tracking-wider">
                  ROLE TIER:
                </div>
                <div className="text-[11px] font-bold text-white leading-tight">
                  {activeOfficer.roleName}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-400 ml-1" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-[#141414] border border-white/20 shadow-2xl z-50 p-2 text-xs">
                <div className="text-[9px] text-zinc-400 uppercase tracking-wider px-2 py-1 border-b border-white/10 mb-1">
                  SWITCH OPERATIONAL ACCESS TIER
                </div>
                {(Object.keys(OFFICER_ROLES) as OfficerRole[]).map((rKey) => {
                  const rProf = OFFICER_ROLES[rKey];
                  const isSelected = rKey === currentRole;
                  return (
                    <button
                      key={rKey}
                      onClick={() => {
                        onRoleChange(rKey);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 border mb-1 flex items-start gap-2.5 transition-colors ${
                        isSelected 
                          ? 'bg-neon/10 border-neon text-white' 
                          : 'bg-black/50 border-white/5 text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                        rKey === 'i4c_admin' ? 'text-neon border-neon/40' :
                        rKey === 'state_nodal' ? 'text-blue-400 border-blue-500/40' :
                        rKey === 'district_officer' ? 'text-amber-400 border-amber-500/40' :
                        rKey === 'field_investigator' ? 'text-red-400 border-red-500/40' :
                        'text-cyan-400 border-cyan-500/40'
                      }`}>
                        {rProf.badgeNumber}
                      </span>
                      <div className="flex-1 truncate">
                        <div className="font-bold text-white text-[11px]">{rProf.roleName}</div>
                        <div className="text-zinc-400 text-[9px] truncate">{rProf.name} • {rProf.department}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-neon flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors relative cursor-pointer"
              title="Operational Alerts & Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-[#141414] border border-white/20 shadow-2xl z-50 p-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    OPERATIONAL NOTIFICATIONS ({notifications.filter(n => !n.read).length})
                  </span>
                  <button
                    onClick={markAllRead}
                    className="text-[9px] text-neon hover:underline uppercase"
                  >
                    MARK ALL READ
                  </button>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 border text-[10px] ${
                        notif.read ? 'bg-black/30 border-white/5 text-zinc-400' : 'bg-black border-red-500/40 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold uppercase ${notif.level === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                          [{notif.level}] {notif.title}
                        </span>
                        <span className="text-[8px] text-zinc-500">{notif.time}</span>
                      </div>
                      <p className="text-[9px] leading-relaxed text-zinc-300">{notif.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Biometric / Login Authenticator Trigger or Sign Out */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {officer && (
                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-zinc-300">
                  <span className="h-1.5 w-1.5 bg-neon animate-pulse" />
                  <span className="text-neon font-bold">{officer.badgeId}</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-300 truncate max-w-[130px]">{officer.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                title="Sign out and terminate session"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span>SIGN OUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={triggerAuthModal}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#ceff00] hover:bg-[#b8e600] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none shadow-[0_0_10px_rgba(206,255,0,0.2)] cursor-pointer"
              title="Biometric & Security Credentials"
            >
              <Fingerprint className="h-3.5 w-3.5 text-black" />
              <span>AUTH ID</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
