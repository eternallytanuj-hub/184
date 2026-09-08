'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, User, AlertTriangle, CheckCircle, 
  MapPin, Clock, Shield, ExternalLink, X, ChevronDown, LogOut 
} from 'lucide-react';
import { 
  ATMS_DATA, 
  ACTIVE_INCIDENTS_DATA, 
  PREDICTED_HOTSPOTS_DATA, 
  LIVE_ALERTS_DATA 
} from '@/data/dashboardData';
import { getModelHealth, ModelHealthStatus } from '@/lib/apiService';
import { supabase } from '@/lib/auth/supabaseClient';

interface OfficerSession {
  badgeId: string;
  name: string;
  role?: string;
  persona?: string;
  email?: string;
}

interface DashboardHeaderProps {
  onSelectEntity?: (type: string, id: string, coords: [number, number], zoom?: number) => void;
  onTriggerSOS?: () => void;
  unreadCount?: number;
  onOpenJudgeModal?: () => void;
}

export default function DashboardHeader({
  onSelectEntity,
  onTriggerSOS,
  unreadCount = 3,
  onOpenJudgeModal,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [istTime, setIstTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [alerts, setAlerts] = useState(LIVE_ALERTS_DATA);
  const [modelHealth, setModelHealth] = useState<ModelHealthStatus | null>(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [officer, setOfficer] = useState<OfficerSession | null>(null);

  // Poll Model API Health every 60s
  const refreshHealth = React.useCallback(async () => {
    setIsRefreshingHealth(true);
    try {
      const health = await getModelHealth();
      setModelHealth(health);
    } catch (e) {
      console.warn('Failed to poll health:', e);
    } finally {
      setIsRefreshingHealth(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 60000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

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
      setIstTime(now.toLocaleString('en-IN', options).toUpperCase() + ' IST');
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
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
        console.warn('DashboardHeader: error checking session:', err);
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
      console.error('Error during signOut in DashboardHeader:', err);
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

  // Global Search Suggestions
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();

    const results: Array<{
      type: 'CASE' | 'ATM' | 'ZONE' | 'PHONE' | 'ACCOUNT';
      title: string;
      subtitle: string;
      coords: [number, number];
      id: string;
    }> = [];

    // Search Incidents & Cases
    ACTIVE_INCIDENTS_DATA.forEach(inc => {
      if (inc.id.toLowerCase().includes(q) || inc.fraudType.toLowerCase().includes(q) || inc.victimLocation.toLowerCase().includes(q)) {
        results.push({
          type: 'CASE',
          title: inc.id,
          subtitle: `${inc.fraudType} • ${inc.amountFormatted} • ${inc.victimLocation}`,
          coords: [inc.lat, inc.lng],
          id: inc.id,
        });
      }
    });

    // Search ATMs
    ATMS_DATA.forEach(atm => {
      if (atm.id.toLowerCase().includes(q) || atm.bank.toLowerCase().includes(q) || atm.address.toLowerCase().includes(q) || atm.zone.toLowerCase().includes(q)) {
        results.push({
          type: 'ATM',
          title: `${atm.bank} (${atm.id})`,
          subtitle: `${atm.address} • Risk ${atm.riskScore}/100`,
          coords: [atm.lat, atm.lng],
          id: atm.id,
        });
      }
    });

    // Search Zones / Hotspots
    PREDICTED_HOTSPOTS_DATA.forEach(spot => {
      if (spot.name.toLowerCase().includes(q)) {
        results.push({
          type: 'ZONE',
          title: spot.name,
          subtitle: `Confidence ${spot.confidence}% • Window: ${spot.timeWindow}`,
          coords: [spot.lat, spot.lng],
          id: spot.id,
        });
      }
    });

    // Simulated Suspect Phone / Account match
    if (q.includes('98') || q.includes('phone') || q.includes('94')) {
      results.push({
        type: 'PHONE',
        title: '+91 94140 88219 [SUSPECT MULE CDR]',
        subtitle: 'Linked to 3 vishing complaints • Last tower: Jaipur Sindhi Camp',
        coords: [26.9215, 75.7968],
        id: 'PHONE-MULE-88',
      });
    }

    if (q.includes('mule') || q.includes('sbi') || q.includes('account') || q.includes('44')) {
      results.push({
        type: 'ACCOUNT',
        title: 'A/C 38291048291 (SBI Sindhi Camp)',
        subtitle: 'Flagged by CFCFRMS • Layer 2 mule account • ₹14.8L transit',
        coords: [26.9218, 75.7960],
        id: 'ACC-MULE-3829',
      });
    }

    return results.slice(0, 7);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: typeof searchResults[0]) => {
    if (onSelectEntity) {
      onSelectEntity(result.type, result.id, result.coords, 16);
    }
    setSearchQuery('');
    setSearchResultsOpen(false);
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  return (
    <header className="relative z-50 w-full h-14 bg-[#0c0c0c] border-b border-white/10 px-3 sm:px-5 flex items-center justify-between gap-3 text-white select-none">
      
      {/* LEFT: Project Brand & Institutional Seals */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-7 w-7 flex items-center justify-center bg-black border border-white/20">
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
            <div className="flex items-center gap-1 leading-none">
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white">
                CYBER<span className="text-neon">CAST</span>
              </span>
              <span className="h-1 w-1 bg-neon" />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 hidden md:block">
              COMMAND RADAR • PS 184
            </span>
          </div>
        </Link>

        {/* MHA & I4C Accreditation Strip */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-white/15">
          <div className="flex items-center gap-1" title="Ministry of Home Affairs">
            <Image
              src="/logos/emblem_india.svg"
              alt="MHA"
              width={14}
              height={14}
              className="h-4 w-auto filter invert brightness-200"
            />
            <span className="font-mono text-[9px] text-zinc-400 uppercase">MHA</span>
          </div>
          <span className="text-zinc-700 text-xs">/</span>
          <div className="flex items-center gap-1" title="Indian Cyber Crime Coordination Centre">
            <Image
              src="/logos/i4c.png"
              alt="I4C"
              width={18}
              height={14}
              className="h-3.5 w-auto"
            />
            <span className="font-mono text-[9px] text-zinc-400 uppercase">I4C</span>
          </div>
        </div>

        {/* Live IST Clock */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-black/80 border border-white/10 font-mono text-[10px] text-zinc-300">
          <Clock className="h-3 w-3 text-neon" />
          <span>{istTime || 'SYNCHRONIZING IST...'}</span>
        </div>

        {/* Live ML Model Status Telemetry Indicator */}
        <div 
          onClick={refreshHealth}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 border border-white/15 font-mono text-[9px] uppercase cursor-pointer hover:border-neon transition-colors"
          title={`Click to re-ping model API (Lat: ${modelHealth?.latencyMs || 0}ms). Loaded: zone_stage1, zone_stage2, state_predictor, district_model, district_risk_table`}
        >
          <span 
            className={`h-1.5 w-1.5 ${
              modelHealth?.status === 'healthy' 
                ? 'bg-neon animate-pulse' 
                : modelHealth?.status === 'degraded'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-red-500'
            }`} 
          />
          <span className="font-bold tracking-wider">
            {modelHealth?.status === 'healthy' && (
              <span className="text-zinc-200">
                MODEL LIVE • <span className="text-neon">{modelHealth.modelsLoadedCount}/5 ACTIVE</span>
                <span className="text-zinc-400 font-normal ml-1">({modelHealth.latencyMs}ms)</span>
              </span>
            )}
            {modelHealth?.status === 'degraded' && (
              <span className="text-amber-400">
                MODEL DEGRADED • {modelHealth.modelsLoadedCount}/5 ACTIVE ({modelHealth.latencyMs}ms)
              </span>
            )}
            {(!modelHealth || modelHealth.status === 'offline') && (
              <span className="text-red-400">
                MODEL OFFLINE • USING CACHED DATA
              </span>
            )}
          </span>
          {isRefreshingHealth && <span className="text-zinc-500 text-[8px] animate-spin">⟳</span>}
        </div>

        {/* Real Court Cases & Judge Code Inspector Trigger */}
        <button
          type="button"
          onClick={onOpenJudgeModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/60 hover:border-emerald-400 text-white font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all shadow-md shadow-emerald-950/40 hover:shadow-emerald-500/20 rounded-none cursor-pointer flex-shrink-0"
          title="Inspect Real High Court Case Provenance, Ground Truth, and ML Code Verification for Judges"
        >
          <Image
            src="/logos/emblem_india.svg"
            alt="MHA"
            width={14}
            height={14}
            className="h-3.5 w-auto filter invert brightness-200"
          />
          <span className="hidden sm:inline text-emerald-300">COURT BENCHMARKS & CODE</span>
          <span className="inline sm:hidden text-emerald-300">CASES</span>
          <span className="px-1 py-0.2 bg-emerald-500/20 text-[8px] text-emerald-300 border border-emerald-500/40 font-mono">
            6 VERIFIED
          </span>
        </button>
      </div>

      {/* CENTER: Global Search Bar with Auto-Suggest */}
      <div className="relative flex-1 max-w-lg hidden sm:block">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Case ID (CY-44521), ATM, Location, Phone, Account..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchResultsOpen(true);
            }}
            onFocus={() => setSearchResultsOpen(true)}
            className="w-full bg-[#141414] border border-white/15 pl-8 pr-7 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon rounded-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResultsOpen(false);
              }}
              className="absolute right-2 text-zinc-500 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Auto-suggest dropdown modal */}
        {searchResultsOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#121212] border border-white/20 shadow-2xl z-50 divide-y divide-white/5 font-mono text-xs">
            <div className="p-2 bg-black/80 text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>MATCHING INTELLIGENCE NODES ({searchResults.length})</span>
              <span>PRESS ESC TO CLOSE</span>
            </div>
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSearchResult(item)}
                className="p-2.5 hover:bg-[#1a1a1a] cursor-pointer transition-colors flex items-start gap-2.5"
              >
                <div className="mt-0.5 px-1.5 py-0.5 bg-black border border-white/10 text-[9px] font-bold text-neon uppercase">
                  {item.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{item.title}</div>
                  <div className="text-zinc-400 text-[10px] truncate">{item.subtitle}</div>
                </div>
                <span className="text-[10px] text-zinc-500 hover:text-neon">PAN →</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Actions, Notifications, Profile, SOS */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        {/* Return to Landing Page & Collab Link */}
        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 hover:text-neon uppercase px-2 py-1 border border-white/10 hover:border-neon transition-colors"
        >
          <span>[ ← PORTAL ]</span>
        </Link>

        <Link
          href="/collab"
          className="inline-flex items-center gap-1 font-mono text-[10px] text-black font-bold bg-[#ceff00] hover:bg-[#b8e600] uppercase px-2.5 py-1 transition-colors shadow-[0_0_10px_rgba(206,255,0,0.2)]"
        >
          <span>[ REPORT & COLLAB ]</span>
        </Link>

        {/* Header Sign Out Button */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-300 hover:text-red-400 uppercase px-2 py-1 bg-black border border-white/15 hover:border-red-500/50 transition-colors rounded-none cursor-pointer"
            title="Terminate session and sign out"
          >
            <LogOut className="h-3 w-3 text-red-400" />
            <span>[ SIGN OUT ]</span>
          </button>
        )}

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setAlertsDropdownOpen(!alertsDropdownOpen);
              setProfileDropdownOpen(false);
            }}
            className="relative p-1.5 bg-[#141414] border border-white/15 hover:border-neon text-zinc-300 hover:text-white transition-colors"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-1 bg-red-600 text-[9px] font-mono font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {alertsDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-[#121212] border border-white/20 shadow-2xl z-50 font-mono text-xs">
              <div className="p-3 bg-black border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-red-500 animate-ping" />
                  <span className="font-bold text-white uppercase text-[11px]">ACTIVE ALERTS STREAM</span>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-neon hover:underline uppercase"
                >
                  MARK ALL READ
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {alerts.map((al) => (
                  <div 
                    key={al.id} 
                    className={`p-3 hover:bg-white/[0.04] transition-colors ${al.acknowledged ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 border ${
                        al.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        al.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        'bg-zinc-800 text-zinc-300 border-white/10'
                      }`}>
                        {`${al.severity} // ${al.timeAgo}`}
                      </span>
                      <span className="text-[10px] text-neon font-semibold">{al.amount}</span>
                    </div>
                    <div className="text-white text-xs font-medium">{al.location}</div>
                    <div className="text-zinc-400 text-[10px] mt-0.5">{al.fraudType} • Conf: {al.confidence}%</div>
                    
                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (onSelectEntity) onSelectEntity('ZONE', al.id, [al.lat, al.lng], 15);
                          setAlertsDropdownOpen(false);
                        }}
                        className="text-[10px] text-neon hover:underline uppercase"
                      >
                        [ VIEW ON MAP → ]
                      </button>
                      <button
                        onClick={() => {
                          setAlerts(prev => prev.map(a => a.id === al.id ? { ...a, acknowledged: true } : a));
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white uppercase"
                      >
                        {al.acknowledged ? 'ACKNOWLEDGED' : '[ ACKNOWLEDGE ]'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-black border-t border-white/10 text-center">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">
                  SHOWING LATEST 5 ALERTS • CFCFRMS SYNCED
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setAlertsDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 bg-[#141414] border border-white/15 hover:border-white/30 text-zinc-300 transition-colors"
          >
            <div className="h-4 w-4 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-neon">
              {officer?.name
                ? officer.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'VS'}
            </div>
            <span className="hidden md:inline font-mono text-[10px] text-white">
              {officer?.name ? officer.name.toUpperCase() : 'INSP. SHARMA'}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#121212] border border-white/20 shadow-2xl z-50 font-mono text-xs divide-y divide-white/10">
              <div className="p-3 bg-black">
                <div className="font-bold text-white text-xs">
                  {officer?.name || 'Inspector V. Sharma, RPS'}
                </div>
                <div className="text-zinc-400 text-[10px]">
                  {officer?.persona || 'Addl. SP (Cybercrime Division)'}
                </div>
                <div className="text-neon text-[9px] mt-1 font-semibold">
                  {officer?.badgeId
                    ? `BADGE: ${officer.badgeId} • ${(officer.role || 'OFFICER').toUpperCase()}`
                    : 'ROLE: I4C NATIONAL ADMIN'}
                </div>
              </div>

              <div className="p-2 space-y-1 text-[11px]">
                <div className="p-1.5 hover:bg-white/5 cursor-pointer text-zinc-300 hover:text-white flex items-center justify-between">
                  <span>My Assigned Cases</span>
                  <span className="px-1.5 py-0.2 bg-white/10 text-[10px] text-white">14</span>
                </div>
                <div className="p-1.5 hover:bg-white/5 cursor-pointer text-zinc-300 hover:text-white flex items-center justify-between">
                  <span>Surveillance Teams Active</span>
                  <span className="text-neon text-[10px]">2 Units</span>
                </div>
                <div className="p-1.5 hover:bg-white/5 cursor-pointer text-zinc-300 hover:text-white">
                  Operational Settings
                </div>
                <div className="p-1.5 hover:bg-white/5 cursor-pointer text-zinc-300 hover:text-white">
                  Audit Telemetry Log
                </div>
              </div>

              <div className="p-2 bg-black">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-center py-1.5 bg-zinc-900 border border-white/10 hover:border-red-500/50 text-red-400 hover:bg-red-950/40 text-[10px] uppercase font-bold font-mono rounded-none cursor-pointer"
                >
                  [ SIGN OUT ]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency SOS Button */}
        <button
          onClick={onTriggerSOS}
          className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
          title="Trigger Immediate Command Center SOS Alert"
        >
          <AlertTriangle className="h-3 w-3 animate-bounce" />
          <span className="hidden sm:inline">URGENT ALERT</span>
        </button>

      </div>

    </header>
  );
}
