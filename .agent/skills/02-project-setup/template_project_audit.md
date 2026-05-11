# Project Audit: <Feature Name hoặc Project Base>

> Feature slug: `<feature-slug>`
> Date: YYYY-MM-DD
> Scope: `project base audit`

---

## 1) Summary
- Audit này phục vụ mục tiêu gì?
- Có blocker nào trước khi triển khai feature không?

## 1.1) Audit Verdict
- Ready / Not Ready:
- Lý do chính:

## 2) Dependency Audit
| Item | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| React | | | | |
| Vite | | | | |
| TypeScript | | | | |
| TanStack Query | | | | |
| Zustand | | | | |

## 3) Repository Shape Audit
| Path | Expected | Status | Notes |
|---|---|---|---|
| `src/api/` | Exists | | |
| `src/components/` | Exists | | |
| `src/hooks/` | Exists | | |
| `src/routes/` | Exists | | |

## 4) Config Audit
| Config | Check | Status | Notes |
|---|---|---|---|
| `vite.config.ts` | alias `@/*` | | |
| `tsconfig.app.json` | paths aligned | | |
| `.env.example` | required env vars present | | |

## 5) HTTP / Auth Bootstrap Audit
| Area | Check | Status | Notes |
|---|---|---|---|
| `axiosClient` | Bearer token attach | | |
| `axiosClient` | fallback URL logic | | |
| `axiosClient` | response/error interceptor | | |
| `providers` | Query bootstrap | | |
| `routes` | ProtectedRoute wiring | | |

## 5.1) Commands / Scripts Audit
| Script | Purpose | Status | Notes |
|---|---|---|---|
| `npm run lint` | quality gate | | |
| `npm run typecheck` | type safety | | |
| `npm run build` | build verification | | |
| `npm run prepush:check` | full gate | | |

## 6) Risks / Gaps
- R-01:
- R-02:

## 6.1) Smallest Safe Fixes
- Fix-01:
- Fix-02:

## 7) Recommended Next Actions
- [ ] Continue with feature implementation
- [ ] Fix blockers first
- [ ] Re-audit after dependency/config update
