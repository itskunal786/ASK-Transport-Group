// =============================================================================
// CRYPTOGRAPHIC UTILITIES & PASSWORD SECURITY VAULT
// Industry-standard SHA-256 hashing & sensitive data sanitization for ASK Transport
// =============================================================================

import type { User, LoginResponse } from '../types/auth';

/**
 * Standard SHA-256 cryptographic hash function using native Web Crypto API
 * with pure JavaScript fallback for maximum environment resilience.
 */
export async function hashPasswordSHA256(password: string): Promise<string> {
  const clean = (password || '').trim();
  if (!clean) return '';

  // 1. Native Web Crypto API
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(clean);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  // 2. Pure JS SHA-256 implementation fallback
  return sha256SyncFallback(clean);
}

/**
 * Synchronous pure JavaScript SHA-256 implementation
 */
export function sha256SyncFallback(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClearance = 0;
  for (let idx = 0; idx < ascii.length; idx++) {
    const charCode = ascii.charCodeAt(idx);
    words[idx >> 2] |= charCode << ((3 - (idx % 4)) * 8);
    compositeClearance++;
  }

  words[compositeClearance >> 2] |= 0x80 << ((3 - (compositeClearance % 4)) * 8);
  words[(((compositeClearance + 8) >> 6) << 4) + 15] = asciiBitLength;

  const w = new Array(64);
  for (let chunkIdx = 0; chunkIdx < words.length; chunkIdx += 16) {
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (let wordIdx = 0; wordIdx < 64; wordIdx++) {
      if (wordIdx < 16) {
        w[wordIdx] = words[chunkIdx + wordIdx] | 0;
      } else {
        const gamma0 = rightRotate(w[wordIdx - 15], 7) ^ rightRotate(w[wordIdx - 15], 18) ^ (w[wordIdx - 15] >>> 3);
        const gamma1 = rightRotate(w[wordIdx - 2], 17) ^ rightRotate(w[wordIdx - 2], 19) ^ (w[wordIdx - 2] >>> 10);
        w[wordIdx] = (w[wordIdx - 16] + gamma0 + w[wordIdx - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[wordIdx] + w[wordIdx]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byteVal = (hash[i] >> (8 * j)) & 255;
      result += (byteVal < 16 ? '0' : '') + byteVal.toString(16);
    }
  }

  return result;
}

/**
 * Sanitizes any user object to guarantee passwords, hashes, and internal secrets
 * are NEVER stored in localStorage or exposed to the browser.
 */
export function sanitizeUserForStorage(rawUser: any): User {
  if (!rawUser || typeof rawUser !== 'object') {
    return {
      id: 0,
      name: 'ASK User',
      email: '',
      phone: '',
      role: 'User',
      isVerified: true,
      isActive: true
    };
  }

  // Explicitly destructure out ANY password, hash, or credential fields
  const {
    password: _p,
    passwordHash: _ph,
    cleanPassword: _cp,
    tempPassword: _tp,
    rawPassword: _rp,
    secret: _s,
    token: _t,
    refreshToken: _rt,
    ...safeMetadata
  } = rawUser;

  // Auto-generate or preserve deterministic User ID
  let userIdCode = safeMetadata.userIdCode;
  if (!userIdCode) {
    const rolePrefix = safeMetadata.role === 'SuperAdmin' ? 'ASK-SUP' : safeMetadata.role === 'Admin' ? 'ASK-ADM' : 'ASK-CUST';
    const numId = Number(safeMetadata.id) || 1;
    userIdCode = `${rolePrefix}-${10000 + (numId % 89999)}`;
  }

  return {
    id: Number(safeMetadata.id) || 1,
    name: String(safeMetadata.name || 'ASK User').trim(),
    email: String(safeMetadata.email || '').trim().toLowerCase(),
    phone: String(safeMetadata.phone || ''),
    role: (['SuperAdmin', 'Admin', 'User'].includes(safeMetadata.role) ? safeMetadata.role : 'User') as any,
    isVerified: safeMetadata.isVerified !== false,
    isActive: safeMetadata.isActive !== false,
    userIdCode
  };
}

// =============================================================================
// SECURE USER CREDENTIAL VAULT (In-Browser SHA-256 Hashed Store)
// =============================================================================

export function generateCustomUserIdCode(role: string = 'User'): string {
  const prefix = role === 'SuperAdmin' ? 'ASK-SUP' : role === 'Admin' ? 'ASK-ADM' : 'ASK-CUST';
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${rand}`;
}

export interface SecureAuthRecord {
  id: number;
  userIdCode?: string; // Auto-generated ID (e.g. ASK-CUST-84920)
  name: string;
  email: string;
  phone: string;
  role: 'SuperAdmin' | 'Admin' | 'User';
  passwordHash: string; // Cryptographic SHA-256 hash — NEVER plain text!
  secondaryHash?: string; // Optional alternate hash (e.g. for case variations)
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

const STORAGE_USERS_KEY = 'ask_secure_auth_users';

/**
 * Pre-seeded SHA-256 hash records for standard ASK Transport roles.
 * Passwords are encrypted as SHA-256 digests.
 */
export const SEED_SECURE_USERS: SecureAuthRecord[] = [
  {
    id: 1,
    userIdCode: 'ASK-SUP-10001',
    name: 'ASK Super Admin',
    email: 'superadmin@askgroup.com',
    phone: '+91 99999 99990',
    role: 'SuperAdmin',
    // SHA-256 of "SuperAdmin@123"
    passwordHash: 'd3535b78e24867f3c850fec1c8591b7a469b8f8683be64d835057cb9fd204aa1',
    // SHA-256 of "Admin@123"
    secondaryHash: 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',
    isVerified: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 2,
    userIdCode: 'ASK-ADM-20002',
    name: 'ASK GROUP Admin',
    email: 'admin@askgroup.com',
    phone: '+91 99999 99999',
    role: 'Admin',
    // SHA-256 of "Admin@123"
    passwordHash: 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',
    // SHA-256 of "admin@123"
    secondaryHash: '7676aaafb027c825bd9abab78b234070e702752f625b752e55e55b48e607e358',
    isVerified: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 3,
    userIdCode: 'ASK-ADM-20003',
    name: 'ASK Operations Lead',
    email: 'ops@askgroup.com',
    phone: '+91 99999 99999',
    role: 'Admin',
    // SHA-256 of "Admin@123"
    passwordHash: 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',
    // SHA-256 of "admin@123"
    secondaryHash: '7676aaafb027c825bd9abab78b234070e702752f625b752e55e55b48e607e358',
    isVerified: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 4,
    userIdCode: 'ASK-CUST-30003',
    name: 'Demo Corporate User',
    email: 'user@askgroup.com',
    phone: '+91 88888 88888',
    role: 'User',
    // SHA-256 of "User@123"
    passwordHash: '3e7c19576488862816f13b512cacf3e4ba97dd97243ea0bd6a2ad1642d86ba72',
    // SHA-256 of "user@123"
    secondaryHash: 'dcb694aa0322f143ed970e275c807bf123bd5db4f73140b94ccc757f42dc8043',
    isVerified: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

/**
 * Returns all registered accounts with SHA-256 password hashes.
 */
export function getSecureUserRegistry(): SecureAuthRecord[] {
  if (typeof window === 'undefined') return SEED_SECURE_USERS;

  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Initialize store with seed records
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_SECURE_USERS));
  } catch {}

  return SEED_SECURE_USERS;
}

/**
 * Saves a newly registered user with a cryptographic SHA-256 password hash.
 * The plain text password is NEVER stored.
 */
export async function registerSecureUser(userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'SuperAdmin' | 'Admin' | 'User';
  userIdCode?: string;
}): Promise<SecureAuthRecord> {
  const registry = getSecureUserRegistry();
  const cleanEmail = userData.email.trim().toLowerCase();

  // Check existing
  const existingIdx = registry.findIndex(u => u.email === cleanEmail);

  // Generate SHA-256 hash of password
  const passwordHash = await hashPasswordSHA256(userData.password);

  const role = userData.role || 'User';
  const userIdCode = userData.userIdCode || generateCustomUserIdCode(role);

  const newRecord: SecureAuthRecord = {
    id: existingIdx >= 0 ? registry[existingIdx].id : Date.now(),
    userIdCode,
    name: userData.name.trim() || 'ASK Transport User',
    email: cleanEmail,
    phone: userData.phone.trim() || '9876543210',
    role,
    passwordHash, // Cryptographically hashed
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  let updated: SecureAuthRecord[];
  if (existingIdx >= 0) {
    updated = registry.map((r, i) => i === existingIdx ? newRecord : r);
  } else {
    updated = [...registry, newRecord];
  }

  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
  } catch {}

  return newRecord;
}

/**
 * Authenticates user by comparing SHA-256 password hash against stored hash.
 * Accepts either Email Address OR Auto-Generated User ID (e.g. ASK-CUST-84920).
 * Returns safe LoginResponse with zero password exposure.
 */
export async function authenticateWithSecureHash(
  identifier: string,
  plainPassword: string
): Promise<LoginResponse | null> {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPwd = (plainPassword || '').trim();
  if (!cleanId || !cleanPwd) return null;

  // Compute incoming password's SHA-256 hash
  const incomingHash = await hashPasswordSHA256(cleanPwd);

  const registry = getSecureUserRegistry();
  const matchedUser = registry.find(u =>
    u.email.toLowerCase() === cleanId ||
    (u.userIdCode && u.userIdCode.toLowerCase() === cleanId) ||
    String(u.id) === cleanId
  );

  if (!matchedUser) {
    // If not found in registry, check default seed
    const seedUser = SEED_SECURE_USERS.find(u =>
      u.email.toLowerCase() === cleanId ||
      (u.userIdCode && u.userIdCode.toLowerCase() === cleanId) ||
      String(u.id) === cleanId
    );
    if (seedUser && (seedUser.passwordHash === incomingHash || seedUser.secondaryHash === incomingHash)) {
      return buildSecureLoginResponse(seedUser);
    }
    return null;
  }

  // Validate SHA-256 hash
  const isValid =
    matchedUser.passwordHash === incomingHash ||
    (matchedUser.secondaryHash && matchedUser.secondaryHash === incomingHash);

  if (!isValid) return null;

  return buildSecureLoginResponse(matchedUser);
}

function buildSecureLoginResponse(record: SecureAuthRecord): LoginResponse {
  const safeUser = sanitizeUserForStorage(record);
  return {
    message: 'Login successful (SHA-256 Cryptographically Verified)',
    token: `ask-jwt-sec-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    refreshToken: `ask-rt-sec-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    refreshTokenExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    user: safeUser
  };
}
