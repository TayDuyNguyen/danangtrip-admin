/**
 * Creates a minimal JWT for Playwright auth seeding (header.payload.signature).
 * Signature is not validated by the SPA — only exp claim is read client-side.
 */
function createMockJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  return `${encode(header)}.${encode(payload)}.mock-signature`;
}

export function createAdminToken(userId = 1): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  return createMockJwt({ sub: String(userId), role: 'admin', exp });
}

export function createStaffToken(userId = 3): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  return createMockJwt({ sub: String(userId), role: 'staff', exp });
}

export function createUserRoleToken(userId = 2): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  return createMockJwt({ sub: String(userId), role: 'user', exp });
}
