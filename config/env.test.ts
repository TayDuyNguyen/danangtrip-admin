export const testEnv = {
  appBaseUrl: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
  apiBaseUrl: process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:8000/api/v1',
  adminEmail: process.env.PLAYWRIGHT_ADMIN_EMAIL ?? 'admin@danangtrip.vn',
  adminPassword: process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? 'password',
  defaultLocale: 'vi' as const,
} as const;
