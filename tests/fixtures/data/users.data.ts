/** Minimal API shapes for Playwright mocks (mirrors src/dataHelper/user.dataHelper) */
export interface RawUserItem {
  id: number;
  full_name: string;
  email: string;
  username: string;
  avatar: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'banned' | 'pending';
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  city: string | null;
  last_login_at: string | null;
  email_verified_at: string | null;
  orders_count?: number;
  reviews_count?: number;
  bookings_count?: number;
  favorites_count?: number;
  total_spend?: number;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total: number;
  active: number;
  banned: number;
  admin: number;
}

export interface RawUserListResponse {
  data: RawUserItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  stats?: UserStats;
}

const now = '2026-05-01T08:00:00.000Z';

export const mockAdminUser: RawUserItem = {
  id: 1,
  full_name: 'Nguyen Duy Tay',
  email: 'admin@danangtrip.vn',
  username: 'admin_tay',
  avatar: null,
  role: 'admin',
  status: 'active',
  phone: '0905123456',
  birthdate: null,
  gender: null,
  city: 'Da Nang',
  last_login_at: now,
  email_verified_at: now,
  orders_count: 0,
  reviews_count: 0,
  bookings_count: 0,
  favorites_count: 0,
  total_spend: 0,
  created_at: now,
  updated_at: now,
};

export const mockStaffLikeUser: RawUserItem = {
  id: 2,
  full_name: 'Le Thi Thanh Thao',
  email: 'staff@danangtrip.vn',
  username: 'operator_danang',
  avatar: null,
  role: 'user',
  status: 'active',
  phone: '0905654321',
  birthdate: null,
  gender: null,
  city: 'Da Nang',
  last_login_at: now,
  email_verified_at: now,
  orders_count: 3,
  reviews_count: 1,
  bookings_count: 3,
  favorites_count: 2,
  total_spend: 1500000,
  created_at: '2026-04-10T08:00:00.000Z',
  updated_at: now,
};

export const mockCustomerUser: RawUserItem = {
  id: 3,
  full_name: 'Tran Thu Ha',
  email: 'hatran@gmail.com',
  username: 'tranthuha',
  avatar: null,
  role: 'user',
  status: 'active',
  phone: '0914112233',
  birthdate: '1995-08-20T00:00:00.000Z',
  gender: 'female',
  city: 'Da Nang',
  last_login_at: now,
  email_verified_at: now,
  orders_count: 5,
  reviews_count: 2,
  bookings_count: 5,
  favorites_count: 4,
  total_spend: 3200000,
  created_at: '2026-03-15T08:00:00.000Z',
  updated_at: now,
};

export const mockBannedUser: RawUserItem = {
  ...mockCustomerUser,
  id: 4,
  full_name: 'Nguyen Minh Quang',
  email: 'quangminh@yahoo.com',
  username: 'minhquang',
  status: 'banned',
};

export const mockSecondaryAdmin: RawUserItem = {
  id: 5,
  full_name: 'Pham Van Admin',
  email: 'admin2@test.com',
  username: 'admin_two',
  avatar: null,
  role: 'admin',
  status: 'active',
  phone: '0905999888',
  birthdate: '1990-01-15T00:00:00.000Z',
  gender: 'male',
  city: 'Hue',
  last_login_at: now,
  email_verified_at: now,
  orders_count: 1,
  reviews_count: 0,
  bookings_count: 1,
  favorites_count: 0,
  total_spend: 500000,
  created_at: '2026-02-01T08:00:00.000Z',
  updated_at: now,
};

export const mockPendingUser: RawUserItem = {
  id: 6,
  full_name: 'Vo Thi Pending',
  email: 'pending@test.com',
  username: 'pending_user',
  avatar: null,
  role: 'user',
  status: 'pending',
  phone: '0905111222',
  birthdate: null,
  gender: null,
  city: 'Da Nang',
  last_login_at: null,
  email_verified_at: null,
  orders_count: 0,
  reviews_count: 0,
  bookings_count: 0,
  favorites_count: 0,
  total_spend: 0,
  created_at: '2026-05-10T08:00:00.000Z',
  updated_at: now,
};

export const mockUserStats: UserStats = {
  total: 4,
  active: 3,
  banned: 1,
  admin: 1,
};

export const mockUserListResponse: RawUserListResponse = {
  data: [mockAdminUser, mockStaffLikeUser, mockCustomerUser, mockBannedUser],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 4,
  stats: mockUserStats,
};

/** 14 users total — for pagination tests (page 1 = 10, page 2 = 4) */
export const mockExtraUsers: RawUserItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: 5 + i,
  full_name: `Extra User ${i + 1}`,
  email: `extra${i + 1}@example.com`,
  username: `extra_user_${i + 1}`,
  avatar: null,
  role: 'user' as const,
  status: 'active' as const,
  phone: null,
  birthdate: null,
  gender: null,
  city: null,
  last_login_at: now,
  email_verified_at: now,
  orders_count: 0,
  reviews_count: 0,
  bookings_count: 0,
  favorites_count: 0,
  total_spend: 0,
  created_at: `2026-02-${String(i + 1).padStart(2, '0')}T08:00:00.000Z`,
  updated_at: now,
}));

export const mockPaginatedUserListResponse: RawUserListResponse = {
  data: [mockAdminUser, mockStaffLikeUser, mockCustomerUser, mockBannedUser, ...mockExtraUsers],
  current_page: 1,
  last_page: 2,
  per_page: 10,
  total: 14,
  stats: { total: 14, active: 13, banned: 1, admin: 1 },
};

export const searchKeyword = 'staff@danangtrip.vn';

export const invalidCredentials = {
  email: 'invalid@example.com',
  password: 'wrong-password',
};

export const sqlInjectionPayload = "' OR 1=1 --";
export const xssPayload = '<script>alert(1)</script>';
export const longTextPayload = 'A'.repeat(150);

export const authUsers = {
  validAdmin: {
    email: 'admin@danangtrip.vn',
    password: 'password',
  },
  invalid: invalidCredentials,
};
