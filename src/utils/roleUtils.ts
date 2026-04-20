import type { User, UserRole } from "@/types";

/**
 * Kiểm tra xem user có quyền truy cập không
 * @param user - Thông tin user
 * @param requiredRoles - Quyền yêu cầu
 * @returns True nếu user có quyền, false nếu không
 */
export const hasRole = (user: User | null, required: string | string[]) => {
    if(!user || !user.role) return false;
    const userRoles = Array.isArray(user.role) ? user.role: [user.role];
    if(!required) return true;
    const requiredRoles = Array.isArray(required) ? required : [required];
    return requiredRoles.some( role => userRoles.includes(role as UserRole))
}