import type { User } from '@/types';
import { hasRole } from '@/utils/roleUtils';

/** Roles allowed to open any admin report screen */
export function canAccessReports(user: User | null): boolean {
    return hasRole(user, ['admin', 'manager']);
}

/** Roles allowed into the admin shell (broader than reports) */
export function canAccessAdminPanel(user: User | null): boolean {
    return hasRole(user, ['admin', 'manager', 'staff']);
}
