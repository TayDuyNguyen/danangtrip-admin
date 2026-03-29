export type UserRole = 'admin' | 'user';

export type UserStatus = 'active' | 'banned' | 'inactive';

/**
 * User interface
 * (Interface để lưu trữ thông tin user)
 */
export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar: string | null;
    phone: string | null;
    birthdate: string | null;
    gender: string | null;
    city: string | null;
    point_balance: number;
    role: UserRole;
    status: UserStatus;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}
