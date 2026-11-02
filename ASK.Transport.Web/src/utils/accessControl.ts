export interface AccessControlUser {
  id?: number | string;
  name?: string;
  phone?: string;
  email?: string;
  role?: 'User' | 'Admin' | 'SuperAdmin' | string;
  isApproved?: boolean;
}

export type AccessStatus = 'SuperAdmin' | 'Admin' | 'Approved' | 'Restricted';

export interface ApprovalRequest {
  id: string;
  userId: number | string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const STORAGE_REQUESTS_KEY = 'ask_approval_requests';

/**
 * Checks if a user has full account clearance approved by Admin or Super Admin.
 * SuperAdmin and Admin users always have full master/operational privileges.
 * Regular 'User' accounts are restricted to Book & Track only by default,
 * until explicitly granted access / approved by Admin or Super Admin.
 */
export function isUserApproved(user: AccessControlUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'Admin' || user.role === 'SuperAdmin') return true;
  if (user.isApproved === true) return true;

  // Check persistent storage by user ID
  if (user.id !== undefined && user.id !== null) {
    const byId = localStorage.getItem(`ask_user_approved_${user.id}`);
    if (byId === 'true') return true;
    if (byId === 'false') return false;
  }

  // Check persistent storage by user email
  if (user.email) {
    const byEmail = localStorage.getItem(`ask_user_approved_${user.email.trim().toLowerCase()}`);
    if (byEmail === 'true') return true;
    if (byEmail === 'false') return false;
  }

  // By default, newly created / registered users are restricted to Book & Track only
  return false;
}

/**
 * Returns a human-readable status for display badges across portals.
 */
export function getUserApprovalStatus(user: AccessControlUser | null | undefined): AccessStatus {
  if (!user) return 'Restricted';
  if (user.role === 'SuperAdmin') return 'SuperAdmin';
  if (user.role === 'Admin') return 'Admin';
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
  if (email) {
    localStorage.setItem(`ask_user_approved_${email.trim().toLowerCase()}`, approved ? 'true' : 'false');
  }

  // Also update approval request status if present
  try {
    const requests = getApprovalRequests();
    const updated = requests.map(r => {
      if (String(r.userId) === String(userId) || (email && r.userEmail.toLowerCase() === email.toLowerCase())) {
        return { ...r, status: (approved ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED' };
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
        detail: { userId, email, approved }
      })
    );
  } catch {
    // Fallback if CustomEvent fails
  }
}

/**
 * Retrieve all account clearance approval requests.
 */
export function getApprovalRequests(): ApprovalRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (!raw) {
      // Seed initial pending request for Demo Shipper if not yet approved
      const initial: ApprovalRequest[] = [
        {
          id: 'req-init-2',
          userId: 2,
          userName: 'Demo Shipper Updated',
          userEmail: 'user@askgroup.com',
          userPhone: '+91 98765 43210',
          requestedAt: new Date().toISOString(),
          status: 'PENDING'
        }
      ];
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Check if a user currently has an approval request in PENDING state.
 */
export function isApprovalPending(userId?: number | string, email?: string): boolean {
  if (!userId && !email) return false;
  // If already approved, not pending
  if (isUserApproved({ id: userId, email })) return false;

  const requests = getApprovalRequests();
  return requests.some(r => {
    const matchesUser = (userId !== undefined && String(r.userId) === String(userId)) ||
      (email && r.userEmail.toLowerCase() === email.trim().toLowerCase());
    return matchesUser && r.status === 'PENDING';
  });
}

/**
 * Submits an approval request for a shipper user, notifies Super Admin,
 * and notifies any listening components immediately.
 */
export async function requestUserApproval(user: AccessControlUser): Promise<ApprovalRequest> {
  const userId = user.id || 2;
  const userName = user.name || 'Shipper User';
  const userEmail = user.email || 'user@askgroup.com';
  const userPhone = user.phone || '+91 98765 43210';

  const newReq: ApprovalRequest = {
    id: `req-${Date.now()}`,
    userId,
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

  // Also call backend API to notify SuperAdmin asynchronously
  try {
    const token = localStorage.getItem('ask_token');
    fetch('http://localhost:5208/api/account-approval/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).catch(() => {
      // offline/mock fallback
    });
  } catch {
    // offline/mock fallback
  }

  // Dispatch live cross-component notification event
  try {
    window.dispatchEvent(
      new CustomEvent('ask_approval_request_submitted', {
        detail: newReq
      })
    );
  } catch {
    // ignore
  }

  return newReq;
}

/**
 * Approve a user request directly from Super Admin notification center or User Directory.
 */
export async function approveUserRequest(userId: number | string, email?: string): Promise<void> {
  setUserApproved(userId, email, true);

  // Call backend API if possible
  try {
    const token = localStorage.getItem('ask_token');
    fetch(`http://localhost:5208/api/account-approval/approve/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).catch(() => {});
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new CustomEvent('ask_approval_request_updated', { detail: { userId, status: 'APPROVED' } }));
  } catch {}
}

/**
 * Reject or restrict a user request.
 */
export async function rejectUserRequest(userId: number | string, email?: string): Promise<void> {
  setUserApproved(userId, email, false);

  try {
    const token = localStorage.getItem('ask_token');
    fetch(`http://localhost:5208/api/account-approval/reject/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).catch(() => {});
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new CustomEvent('ask_approval_request_updated', { detail: { userId, status: 'REJECTED' } }));
  } catch {}
}
