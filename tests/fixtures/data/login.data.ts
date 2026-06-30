/** Credentials aligned with 12_login.md and login.mock.ts */
export const loginCredentials = {
  admin: {
    email: 'admin@danangtrip.vn',
    password: 'Admin123!',
  },
  wrong: {
    email: 'wrongadmin@test.com',
    password: '123456',
  },
  customer: {
    email: 'customer@test.com',
    password: 'Customer123!',
  },
  staff: {
    email: 'staff@danangtrip.vn',
    password: 'Staff123!',
  },
} as const;

export const loginValidationSamples = {
  invalidEmail: 'not-an-email',
  shortPassword: '12345',
  validPasswordForInvalidEmail: '123456',
} as const;

export const mockCustomerLoginUser = {
  id: 99,
  username: 'customer_user',
  email: loginCredentials.customer.email,
  full_name: 'Customer Test',
  avatar: null,
  phone: null,
  birthdate: null,
  gender: null,
  city: null,
  point_balance: 0,
  role: 'user' as const,
  status: 'active' as const,
  last_login_at: '2026-06-01T08:00:00.000Z',
  created_at: '2026-01-01T08:00:00.000Z',
  updated_at: '2026-06-01T08:00:00.000Z',
};

export const mockStaffLoginUser = {
  id: 3,
  username: 'staff_user',
  email: loginCredentials.staff.email,
  full_name: 'Staff User',
  avatar: null,
  phone: '0905123456',
  birthdate: null,
  gender: null,
  city: 'Da Nang',
  point_balance: 0,
  role: 'staff' as const,
  status: 'active' as const,
  last_login_at: '2026-06-01T08:00:00.000Z',
  created_at: '2026-01-01T08:00:00.000Z',
  updated_at: '2026-06-01T08:00:00.000Z',
};
