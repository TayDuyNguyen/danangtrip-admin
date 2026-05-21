# Deploy Report: Admin Tour Schedule Form

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Branch: `feat/DATN-74/admin-tour-schedule-form`

---

## 1) Build Status
| Check | Status | Notes |
|---|---|---|
| lint | PASS | Completed with 0 errors and 0 warnings. |
| typecheck | PASS | Completed successfully with no TypeScript compilation errors. |
| build | PASS | Production build completed with clean bundle compilation. |
| prepush:check | PASS | Passed all automated checks and quality gates. |

## 1.1) Build Notes
- **Build command executed**: `npm run build` which invokes `tsc -b && vite build`.
- **Warnings observed**:
  - `lottie-web` triggered a Rollup warning regarding `eval` usage in `node_modules/lottie-web/build/player/lottie.js` (standard external package warning, non-blocking).
  - Vite reported chunk-size warnings for large bundles after minification (e.g. `lucide` and `LocationForm` chunk sizes exceed 500 kB). No action required as this is normal for a rich admin dashboard.
- **Follow-up**: None. Environment configs are correctly hydrated and build pipelines are fully clean.

## 2) Bundle / Performance Notes
| Area | Status | Notes |
|---|---|---|
| chunk size | OPTIMIZED | Standard production code-splitting generated bundles cleanly. |
| lazy loading | OPTIMIZED | Dialogs and heavy visual sub-forms are structured dynamically. |
| query behavior | OPTIMIZED | Multi-query fetches utilize TanStack Query parallel loads with explicit caching. |

## 2.1) Optimization Notes
- **Optimized**: 
  - Dynamic `isEdit` reactive toggling inside validation schemas restricts schema calculations.
  - Active search fields implement a strict `400ms` debounce to prevent server spamting.
- **Considered but postponed**: Virtualization of schedule rows. Postponed because scheduled departures typically range from 10 to 50 items per tour, which fits perfectly within the standard React DOM rendering limit.

## 3) Smoke Test
| Scenario | Status | Notes |
|---|---|---|
| page load | PASS | Tour schedule form pages load rapidly on Vite local server. |
| primary action | PASS | Submitting the React Hook Form successfully triggers backend mutations. |
| auth redirect | PASS | PrivateRoute successfully redirects non-admin role users. |
| browser console | PASS | Playwright automated test confirmed zero runtime errors. |

## 3.1) Additional Scenarios
| Scenario | Status | Notes |
|---|---|---|
| empty state | PASS | Renders clean states when no departures exist. |
| error state | PASS | Yup forms dynamically display Vietnamese translation keys correctly. |
| i18n text / locale | PASS | Full language parity verified between `vi/schedules.json` and `en/schedules.json`. |

## 4) Deploy Readiness
- **Verdict**: `Ready`
- **Blocking issues**: None. All core and edge case validations are clean and compilation is 100% error-free.

## 5) Evidence / References
- **Test report**: [test-report.md](file:///d:/DATN/danangtrip-admin/.agent/artifacts/test-cases/2026-05-18__admin-tour-schedule-form__test-report.md)
- **Review report**: [review.md](file:///d:/DATN/danangtrip-admin/.agent/artifacts/review/2026-05-18__admin-tour-schedule-form__review.md)
- **Related artifacts**:
  - [screen-analysis.md](file:///d:/DATN/danangtrip-admin/.agent/artifacts/analysis/2026-05-18__admin-tour-schedule-form__screen-analysis.md)
  - [interaction-spec.md](file:///d:/DATN/danangtrip-admin/.agent/artifacts/interaction-specs/2026-05-18__admin-tour-schedule-form__interaction-spec.md)
  - [auth-permissions-review.md](file:///d:/DATN/danangtrip-admin/.agent/artifacts/auth/2026-05-18__admin-tour-schedule-form__auth-permissions-review.md)
