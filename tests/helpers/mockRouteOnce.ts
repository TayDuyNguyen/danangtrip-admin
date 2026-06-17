import type { Page } from '@playwright/test';

const registeredMocks = new WeakMap<Page, Set<string>>();

/** Skip route registration when the same mock was already wired for this page. */
export function shouldRegisterMockRoutes(page: Page, mockId: string): boolean {
  let ids = registeredMocks.get(page);
  if (!ids) {
    ids = new Set();
    registeredMocks.set(page, ids);
  }
  if (ids.has(mockId)) {
    return false;
  }
  ids.add(mockId);
  return true;
}
