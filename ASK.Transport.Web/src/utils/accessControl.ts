export interface AccessControlUser {
  id?: number | string;
  userIdCode?: string; // Auto-generated ID (e.g. ASK-CUST-84920)
  name?: string;
  phone?: string;
  email?: string;
  role?: 'User' | 'Admin' | 'SuperAdmin' | string;
  isApproved?: boolean;
}

export type AccessStatus = 'SuperAdmin' | 'Admin' | 'Approved' | 'PendingSuperAdmin' | 'Restricted';

export type ApprovalStatus = 'PENDING' | 'PENDING_SUPERADMIN' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  userId: number | string;
  userIdCode?: string; // Unique Auto-generated User ID (e.g. ASK-CUST-84920)
  userName: string;
  userEmail: string;
  userPhone?: string;
  requestedAt: string;
  status: ApprovalStatus;

  // Step 1: Admin Pre-Approval Details (Maker / Level-1)
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  adminNotes?: string;

  // Step 2: SuperAdmin Re-Verification & Master Pass Details (Checker / Final Level)
  superAdminVerifiedBy?: string;
  superAdminVerifiedAt?: string;
  superAdminNotes?: string;
}

const STORAGE_REQUESTS_KEY = 'ask_approval_requests';

/**
 * Returns or generates a deterministic User ID Code for any given user.
 */
export function getUserIdCodeForUser(userId?: number | string, email?: string, role?: string): string {
  if (userId !== undefined && userId !== null) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`ask_user_id_code_${userId}`) : null;
    if (saved) return saved;
  }
  if (email) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`ask_user_id_code_${email.trim().toLowerCase()}`) : null;
    if (saved) return saved;
  }

  // Check approval requests
  const req = getApprovalRequestForUser(userId, email);
  if (req?.userIdCode) return req.userIdCode;

  // Known seeds
  if (email === 'superadmin@askgroup.com') return 'ASK-SUP-10001';
  if (email === 'admin@askgroup.com') return 'ASK-ADM-20002';
  if (email === 'ops@askgroup.com') return 'ASK-ADM-20003';
  if (email === 'user@askgroup.com') return 'ASK-CUST-30003';

  // Generate deterministic ID
  const prefix = role === 'SuperAdmin' ? 'ASK-SUP' : role === 'Admin' ? 'ASK-ADM' : 'ASK-CUST';
  const num = Math.abs(typeof userId === 'number' ? userId : 7400);
  const code = `${prefix}-${10000 + (num % 89999)}`;
  if (typeof window !== 'undefined') {
    if (userId !== undefined) localStorage.setItem(`ask_user_id_code_${userId}`, code);
    if (email) localStorage.setItem(`ask_user_id_code_${email.trim().toLowerCase()}`, code);
  }
  return code;
}

/**
 * Retrieve all account clearance approval requests.
 */
export function getApprovalRequests(): ApprovalRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (!raw) {
      // Seed demonstration requests illustrating the dual-control pipeline:
      // 1. User #4 (Pooja Verma): Pre-approved by Admin Kunal Kumar, awaiting SuperAdmin re-verification!
      // 2. User #999 (Demo Shipper): Fresh pending request awaiting initial admin review.
      const initial: ApprovalRequest[] = [
        {
          id: 'req-init-4',
          userId: 4,
          userIdCode: 'ASK-CUST-40004',
          userName: 'Pooja Verma (Billing & Accounts)',
          userEmail: 'pooja.verma@asktransport.com',
          userPhone: '+91 94140 77812',
          requestedAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'PENDING_SUPERADMIN',
          adminApprovedBy: 'Kunal Kumar (Operations Admin)',
          adminApprovedAt: new Date(Date.now() - 1800000).toISOString(),
          adminNotes: 'Verified KYC, GSTIN ledger, and verified billing contract. Forwarded for SuperAdmin re-verification.'
        },
        {
          id: 'req-init-2',
          userId: 999,
          userIdCode: 'ASK-CUST-30003',
          userName: 'Demo Shipper Updated',
          userEmail: 'user@askgroup.com',
          userPhone: '+91 98765 43210',
          requestedAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'PENDING'
        }
      ];
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: ApprovalRequest[] = JSON.parse(raw);
    let modified = false;
    for (const r of parsed) {
      if ((String(r.userId) === '2' || r.userId === 2) && r.userEmail === 'user@askgroup.com') {
        r.userId = 999;
        modified = true;
      }
    }
    if (modified) {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Find the approval request corresponding to a given user ID, email, or user ID code.
 */
export function getApprovalRequestForUser(
  userId?: number | string,
  email?: string,
  userIdCode?: string
): ApprovalRequest | undefined {
  if (userId === undefined && !email && !userIdCode) return undefined;
  const requests = getApprovalRequests();
  return requests.find(r => {
    // 1. Email matching takes highest priority
    if (email && r.userEmail) {
      if (email.trim().toLowerCase() === r.userEmail.trim().toLowerCase()) return true;
      // If email doesn't match, this is a different user
      return false;
    }
    // 2. User ID Code match
    if (userIdCode && r.userIdCode && userIdCode.trim().toLowerCase() === r.userIdCode.trim().toLowerCase()) {
      return true;
    }
    // 3. User ID match only if emails don't conflict
    if (userId !== undefined && String(r.userId) === String(userId)) {
      return true;
    }
    return false;
  });
}

/**
 * Checks if a user has full account clearance approved by SuperAdmin.
 * Dual-control rule: Admin approval alone is NOT enough! It must be re-verified and passed by SuperAdmin.
 * SuperAdmin and Admin users always have full master/operational privileges.
 * Regular 'User' accounts are restricted to Book & Track only until SuperAdmin re-verifies and passes.
 */
export function isUserApproved(user: AccessControlUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'Admin' || user.role === 'SuperAdmin') return true;

  // Check matching approval request state
  const req = getApprovalRequestForUser(user.id, user.email);
  if (req) {
    if (req.status === 'PENDING_SUPERADMIN') return false; // Waiting for SuperAdmin Re-verification!
    if (req.status === 'APPROVED') return true;
    if (req.status === 'PENDING' || req.status === 'REJECTED') return false;
  }

  // Check persistent stage flag by user ID
  if (user.id !== undefined && user.id !== null) {
    const stage = localStorage.getItem(`ask_user_approval_stage_${user.id}`);
    if (stage === 'PENDING_SUPERADMIN') return false;
    if (stage === 'APPROVED') return true;
    const byId = localStorage.getItem(`ask_user_approved_${user.id}`);
    if (byId === 'true') return true;
    if (byId === 'false') return false;
  }

  // Check persistent stage flag by user email
  if (user.email) {
    const emailKey = user.email.trim().toLowerCase();
    const stage = localStorage.getItem(`ask_user_approval_stage_${emailKey}`);
    if (stage === 'PENDING_SUPERADMIN') return false;
    if (stage === 'APPROVED') return true;
    const byEmail = localStorage.getItem(`ask_user_approved_${emailKey}`);
    if (byEmail === 'true') return true;
    if (byEmail === 'false') return false;
  }

  if (user.isApproved === true) return true;

  // By default, newly created / registered users are restricted to Book & Track only
  return false;
}

/**
 * Check if a user is currently in the Step-1 Admin Verified state, awaiting Step-2 SuperAdmin Re-Verification.
 */
export function isPendingSuperAdminReverify(userId?: number | string, email?: string): boolean {
  if (isUserApproved({ id: userId, email })) return false;
  const req = getApprovalRequestForUser(userId, email);
  if (req?.status === 'PENDING_SUPERADMIN') return true;

  if (userId !== undefined && userId !== null) {
    if (localStorage.getItem(`ask_user_approval_stage_${userId}`) === 'PENDING_SUPERADMIN') return true;
  }
  if (email) {
    if (localStorage.getItem(`ask_user_approval_stage_${email.trim().toLowerCase()}`) === 'PENDING_SUPERADMIN') return true;
  }
  return false;
}

/**
 * Check if a user currently has an active clearance request (either fresh PENDING or PENDING_SUPERADMIN).
 */
export function isApprovalPending(userId?: number | string, email?: string): boolean {
  if (!userId && !email) return false;
  if (isUserApproved({ id: userId, email })) return false;

  const req = getApprovalRequestForUser(userId, email);
  if (req) {
    return req.status === 'PENDING' || req.status === 'PENDING_SUPERADMIN';
  }
  return false;
}

/**
 * Returns a human-readable status for display badges across portals.
 */
export function getUserApprovalStatus(user: AccessControlUser | null | undefined): AccessStatus {
  if (!user) return 'Restricted';
  if (user.role === 'SuperAdmin') return 'SuperAdmin';
  if (user.role === 'Admin') return 'Admin';
  if (isPendingSuperAdminReverify(user.id, user.email)) return 'PendingSuperAdmin';
  return isUserApproved(user) ? 'Approved' : 'Restricted';
}

/**
 * Sets user approval state in persistent storage and dispatches a cross-component event.
 */
export function setUserApproved(
  userId: number | string,
  email?: string,
  approved: boolean = true
): void {
  localStorage.setItem(`ask_user_approved_${userId}`, approved ? 'true' : 'false');
  localStorage.setItem(`ask_user_approval_stage_${userId}`, approved ? 'APPROVED' : 'REJECTED');
  if (email) {
    const emailKey = email.trim().toLowerCase();
    localStorage.setItem(`ask_user_approved_${emailKey}`, approved ? 'true' : 'false');
    localStorage.setItem(`ask_user_approval_stage_${emailKey}`, approved ? 'APPROVED' : 'REJECTED');
  }

  // Also update approval request status if present
  try {
    const requests = getApprovalRequests();
    const updated = requests.map(r => {
      const emailMatches = email && r.userEmail && email.trim().toLowerCase() === r.userEmail.trim().toLowerCase();
      const idMatches = (!email || !r.userEmail || emailMatches) && String(r.userId) === String(userId);
      if (emailMatches || idMatches) {
        return {
          ...r,
          status: (approved ? 'APPROVED' : 'REJECTED') as ApprovalStatus,
          superAdminVerifiedBy: approved ? (r.superAdminVerifiedBy || 'Super Admin') : undefined,
          superAdminVerifiedAt: approved ? (r.superAdminVerifiedAt || new Date().toISOString()) : undefined
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // Notify active components immediately across windows/tabs
  try {
    window.dispatchEvent(
      new CustomEvent('ask_access_control_change', {
        detail: { userId, email, approved, stage: approved ? 'APPROVED' : 'REJECTED' }
      })
    );
  } catch {
    // Fallback
  }
}

/**
 * Submits an approval request for a shipper user, notifies Admins & SuperAdmin,
 * and notifies any listening components immediately.
 */
export async function requestUserApproval(user: AccessControlUser): Promise<ApprovalRequest> {
  const userId = user.id || 2;
  const userName = user.name || 'Shipper User';
  const userEmail = user.email || 'user@askgroup.com';
  const userPhone = user.phone || '+91 98765 43210';
  const userIdCode = user.userIdCode || getUserIdCodeForUser(userId, userEmail, user.role);

  const newReq: ApprovalRequest = {
    id: `req-${Date.now()}`,
    userId,
    userIdCode,
    userName,
    userEmail,
    userPhone,
    requestedAt: new Date().toISOString(),
    status: 'PENDING'
  };

  try {
    const existing = getApprovalRequests().filter(
      r => !(String(r.userId) === String(userId) || r.userEmail.toLowerCase() === userEmail.toLowerCase())
    );
    const updated = [newReq, ...existing];
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // Call backend API to notify administrators asynchronously
  try {
    const token = localStorage.getItem('ask_token');
    fetch('http://localhost:5208/api/account-approval/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).catch(() => {});
  } catch {}

  // Dispatch live cross-component notification event
  try {
    window.dispatchEvent(
      new CustomEvent('ask_approval_request_submitted', {
        detail: newReq
      })
    );
  } catch {}

  return newReq;
}

/**
 * STEP 1: Admin Pre-Approves User Request.
 * Dual-Authorization rule: Status is set to PENDING_SUPERADMIN. The user remains restricted
 * until SuperAdmin re-verifies and gives the master pass.
 */
export async function adminPreApproveUserRequest(
  userId: number | string,
  email?: string,
  adminName: string = 'Operations Admin',
  notes: string = 'Verified documents & KYC. Forwarded for SuperAdmin re-verification.'
): Promise<ApprovalRequest> {
  const requests = getApprovalRequests();
  let existing = getApprovalRequestForUser(userId, email);
  const now = new Date().toISOString();
  const userIdCode = getUserIdCodeForUser(userId, email);

  if (!existing) {
    existing = {
      id: `req-${Date.now()}`,
      userId,
      userIdCode,
      userName: `User #${userId}`,
      userEmail: email || `user${userId}@asktransport.com`,
      requestedAt: now,
      status: 'PENDING_SUPERADMIN',
      adminApprovedBy: adminName,
      adminApprovedAt: now,
      adminNotes: notes
    };
    requests.unshift(existing);
  } else {
    if (!existing.userIdCode) existing.userIdCode = userIdCode;
    existing.status = 'PENDING_SUPERADMIN';
    existing.adminApprovedBy = adminName;
    existing.adminApprovedAt = now;
    existing.adminNotes = notes;
  }

  // Explicitly keep account restricted until SuperAdmin verification!
  localStorage.setItem(`ask_user_approved_${userId}`, 'false');
  localStorage.setItem(`ask_user_approval_stage_${userId}`, 'PENDING_SUPERADMIN');
  if (email) {
    const emailKey = email.trim().toLowerCase();
    localStorage.setItem(`ask_user_approved_${emailKey}`, 'false');
    localStorage.setItem(`ask_user_approval_stage_${emailKey}`, 'PENDING_SUPERADMIN');
  }
  localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));

  // Cross-component notifications
  try {
    window.dispatchEvent(
      new CustomEvent('ask_approval_request_updated', {
        detail: {
          userId,
          email,
          status: 'PENDING_SUPERADMIN',
          adminApprovedBy: adminName,
          adminApprovedAt: now
        }
      })
    );
    window.dispatchEvent(
      new CustomEvent('ask_access_control_change', {
        detail: { userId, email, approved: false, stage: 'PENDING_SUPERADMIN' }
      })
    );
  } catch {}

  // Inform backend
  try {
    const token = localStorage.getItem('ask_token');
    fetch(`http://localhost:5208/api/account-approval/pre-approve/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ adminName, notes })
    }).catch(() => {});
  } catch {}

  return existing;
}

/**
 * STEP 2: SuperAdmin Re-Verifies and Grants Master Pass.
 * This is the final statutory verification that unlocks full portal clearance.
 */
export async function superAdminReverifyAndPass(
  userId: number | string,
  email?: string,
  superAdminName: string = 'ASK GROUP Admin (Super Admin)',
  notes: string = 'Re-verified and cleared by SuperAdmin'
): Promise<ApprovalRequest> {
  const requests = getApprovalRequests();
  let existing = getApprovalRequestForUser(userId, email);
  const now = new Date().toISOString();
  const userIdCode = getUserIdCodeForUser(userId, email);

  if (!existing) {
    existing = {
      id: `req-${Date.now()}`,
      userId,
      userIdCode,
      userName: `User #${userId}`,
      userEmail: email || `user${userId}@asktransport.com`,
      requestedAt: now,
      status: 'APPROVED',
      adminApprovedBy: 'Direct Master Clearance',
      adminApprovedAt: now,
      superAdminVerifiedBy: superAdminName,
      superAdminVerifiedAt: now,
      superAdminNotes: notes
    };
    requests.unshift(existing);
  } else {
    if (!existing.userIdCode) existing.userIdCode = userIdCode;
    existing.status = 'APPROVED';
    if (!existing.adminApprovedBy) {
      existing.adminApprovedBy = 'Direct Master Clearance';
      existing.adminApprovedAt = now;
    }
    existing.superAdminVerifiedBy = superAdminName;
    existing.superAdminVerifiedAt = now;
    existing.superAdminNotes = notes;
  }

  // UNLOCK ACCOUNT FULLY
  localStorage.setItem(`ask_user_approved_${userId}`, 'true');
  localStorage.setItem(`ask_user_approval_stage_${userId}`, 'APPROVED');
  if (email) {
    const emailKey = email.trim().toLowerCase();
    localStorage.setItem(`ask_user_approved_${emailKey}`, 'true');
    localStorage.setItem(`ask_user_approval_stage_${emailKey}`, 'APPROVED');
  }
  localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));

  // Cross-component notifications
  try {
    window.dispatchEvent(
      new CustomEvent('ask_approval_request_updated', {
        detail: {
          userId,
          email,
          status: 'APPROVED',
          adminApprovedBy: existing.adminApprovedBy,
          superAdminVerifiedBy: superAdminName,
          superAdminVerifiedAt: now
        }
      })
    );
    window.dispatchEvent(
      new CustomEvent('ask_access_control_change', {
        detail: { userId, email, approved: true, stage: 'APPROVED' }
      })
    );
  } catch {}

  // Inform backend
  try {
    const token = localStorage.getItem('ask_token');
    fetch(`http://localhost:5208/api/account-approval/approve/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ superAdminName, notes })
    }).catch(() => {});
  } catch {}

  return existing;
}

/**
 * Universal approval gateway that routes according to caller role.
 */
export async function approveUserRequest(
  userId: number | string,
  email?: string,
  callerRole: string = 'SuperAdmin',
  callerName: string = 'Admin'
): Promise<void> {
  if (callerRole === 'SuperAdmin') {
    await superAdminReverifyAndPass(userId, email, callerName);
  } else {
    await adminPreApproveUserRequest(userId, email, callerName);
  }
}

/**
 * Reject or restrict a user request.
 */
export async function rejectUserRequest(
  userId: number | string,
  email?: string,
  rejectedBy: string = 'SuperAdmin',
  reason: string = 'Account restricted by administrator'
): Promise<void> {
  const requests = getApprovalRequests();
  const existing = getApprovalRequestForUser(userId, email);
  if (existing) {
    existing.status = 'REJECTED';
    existing.superAdminNotes = `Rejected/Restricted by ${rejectedBy}: ${reason}`;
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
  }

  localStorage.setItem(`ask_user_approved_${userId}`, 'false');
  localStorage.setItem(`ask_user_approval_stage_${userId}`, 'REJECTED');
  if (email) {
    const emailKey = email.trim().toLowerCase();
    localStorage.setItem(`ask_user_approved_${emailKey}`, 'false');
    localStorage.setItem(`ask_user_approval_stage_${emailKey}`, 'REJECTED');
  }

  try {
    window.dispatchEvent(
      new CustomEvent('ask_approval_request_updated', {
        detail: { userId, email, status: 'REJECTED', rejectedBy, reason }
      })
    );
    window.dispatchEvent(
      new CustomEvent('ask_access_control_change', {
        detail: { userId, email, approved: false, stage: 'REJECTED' }
      })
    );
  } catch {}

  try {
    const token = localStorage.getItem('ask_token');
    fetch(`http://localhost:5208/api/account-approval/reject/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).catch(() => {});
  } catch {}
}
