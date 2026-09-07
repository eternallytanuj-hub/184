/**
 * CyberCast Law Enforcement Badge ID Mapping & Resolver
 * Ministry of Home Affairs | Indian Cyber Crime Coordination Centre (I4C)
 * Problem Statement 184 - Enterprise Authentication Gate System
 */

export interface OfficerProfile {
  badgeId: string;
  name: string;
  role: string;
  persona: string;
  email: string;
  title?: string;
}

export const BADGE_TO_EMAIL: Record<string, string> = {
  'I4C-DIR-01': 'i4c.dir01@cybercast.demo',
  'RJ-SP-Z04': 'state.nodal.rj@cybercast.demo',
  'JPR-CI-889': 'district.jpr@cybercast.demo',
  'JPR-SI-412': 'field.si.jpr@cybercast.demo',
  'SBI-CFC-91': 'bank.sbi.cfc@cybercast.demo',
};

export const BADGE_TO_OFFICER: Record<string, OfficerProfile> = {
  'I4C-DIR-01': {
    badgeId: 'I4C-DIR-01',
    name: 'Dr. A. K. Saxena',
    role: 'i4c_central',
    persona: 'I4C Central Directorate',
    email: 'i4c.dir01@cybercast.demo',
    title: 'I4C Central Directorate',
  },
  'RJ-SP-Z04': {
    badgeId: 'RJ-SP-Z04',
    name: 'Supt. R. Sharma',
    role: 'state_nodal',
    persona: 'State Cyber Nodal',
    email: 'state.nodal.rj@cybercast.demo',
    title: 'State Cyber Nodal',
  },
  'JPR-CI-889': {
    badgeId: 'JPR-CI-889',
    name: 'Insp. P. Verma',
    role: 'district_cyber',
    persona: 'District Cyber Cell',
    email: 'district.jpr@cybercast.demo',
    title: 'District Cyber Cell',
  },
  'JPR-SI-412': {
    badgeId: 'JPR-SI-412',
    name: 'SI K. Mehta',
    role: 'field_investigator',
    persona: 'Field Investigator',
    email: 'field.si.jpr@cybercast.demo',
    title: 'Field Investigator',
  },
  'SBI-CFC-91': {
    badgeId: 'SBI-CFC-91',
    name: 'M. Agarwal (SBI Fraud)',
    role: 'bank_fi',
    persona: 'Bank Fraud Investigator',
    email: 'bank.sbi.cfc@cybercast.demo',
    title: 'Bank Fraud Investigator',
  },
};

/**
 * Resolves an OfficerProfile from a badge ID.
 * Normalizes input by trimming whitespace and converting to uppercase.
 * Returns null if the badge ID is empty, invalid, or unrecognized.
 */
export function resolveOfficer(badgeId: string): OfficerProfile | null {
  if (!badgeId || typeof badgeId !== 'string') {
    return null;
  }
  const normalized = badgeId.trim().toUpperCase();
  if (!normalized) {
    return null;
  }
  return Object.prototype.hasOwnProperty.call(BADGE_TO_OFFICER, normalized)
    ? BADGE_TO_OFFICER[normalized]
    : null;
}

/**
 * Validates whether a badge ID belongs to a known authorized law enforcement officer.
 * Normalizes input by trimming whitespace and converting to uppercase.
 */
export function isValidBadge(badgeId: string): boolean {
  if (!badgeId || typeof badgeId !== 'string') {
    return false;
  }
  const normalized = badgeId.trim().toUpperCase();
  if (!normalized) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(BADGE_TO_OFFICER, normalized);
}

/**
 * Returns the Supabase email associated with an authorized badge ID.
 * Normalizes input by trimming whitespace and converting to uppercase.
 * Returns null if not recognized.
 */
export function getSupabaseEmail(badgeId: string): string | null {
  if (!badgeId || typeof badgeId !== 'string') {
    return null;
  }
  const normalized = badgeId.trim().toUpperCase();
  if (!normalized) {
    return null;
  }
  return Object.prototype.hasOwnProperty.call(BADGE_TO_EMAIL, normalized)
    ? BADGE_TO_EMAIL[normalized]
    : null;
}
