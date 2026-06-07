# System Deploy Audit - Admin

Date: 2026-06-06
Feature slug: `system-deploy-audit`

## Verdict

READY WITH RISKS

## Validation

- `npm run prepush:check`: passed
- ESLint: passed without warnings
- TypeScript: passed
- Production Vite build: passed
- Playwright console checks: 7/7 passed
- SPA `_redirects` file confirmed in production output
- Production environment preflight correctly rejects localhost or missing URLs

## Fixes

- Replaced hardcoded public blog URLs with `VITE_PUBLIC_WEB_URL`.
- Added SPA deep-link fallback for compatible static hosts.
- Added production environment validation to release CI.
- Lazy-loaded the route error page to reduce the initial bundle.
- Replaced unsafe React Hook Form `watch()` usage and removed synchronous state updates from the hydration effect.

## Required Production Variables

- `VITE_API_URL`
- `VITE_PUBLIC_WEB_URL`

## Residual Risks

- `lottie-web` emits an `eval` warning during build.
- Recharts and Lottie remain large optional chunks.
- Live production smoke testing was not performed because this audit did not deploy.
