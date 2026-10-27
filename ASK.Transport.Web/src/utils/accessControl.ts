export interface AccessControlUser {
  id?: number | string;
  email?: string;
  role?: 'User' | 'Admin' | 'SuperAdmin' | string;
  isApproved?: boolean;
}

export type AccessStatus = 'SuperAdmin' | 'Admin' | 'Approved' | 'Restricted';

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

  // Notify active components immediately
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
