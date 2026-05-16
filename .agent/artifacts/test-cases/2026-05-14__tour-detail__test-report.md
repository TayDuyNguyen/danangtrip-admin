# Test Report: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-14 (Update 4)
- **Verdict:** ❌ **FAIL (NOT READY FOR HANDOFF)**
- **Author:** Codex (QA via `09-testing`)
- **Sources:** `.agent/artifacts/analysis/2026-05-14__tour-detail__screen-analysis.md`, `.agent/artifacts/interaction-specs/2026-05-14__tour-detail__interaction-spec.md`, `.agent/artifacts/auth/2026-05-14__tour-detail__auth-permissions-review.md`, `package.json`, `src/pages/Tours/TourDetail/index.tsx`, `src/hooks/useTourQueries.ts`, `src/routes/PrivateRoute.tsx`, `src/types/auth.ts`, `public/lang/{vi,en}/tour.json`

## 1. Summary

Update 4 confirms that the previous "skeleton only" assessment is no longer accurate. The current repo state already wires `TourDetail` to `useTourDetailQuery(id)` and renders real content sections for hero, description, itinerary, services, schedules, stats, and sidebar actions.

The feature still fails release QA for three reasons:
- browser-backed runtime validation remains incomplete because no authenticated feature walkthrough was available in this environment
- the implemented interactions do not fully match the interaction spec
- there are user-facing regressions in i18n and role-based permissions

## 2. Phase 1 - Static Quality Gates [PASS]

| Check | Status | Evidence |
|---|---|---|
| `npm run lint` | ✅ **PASS** | Completed successfully with 0 reported errors/warnings. |
| `npm run typecheck` | ✅ **PASS** | `tsc -b` completed with no errors. |
| `npm run build` | ✅ **PASS** | Production build completed successfully. |
| `npm run prepush:check` | ✅ **PASS** | Native gate passed; `test:console` was skipped by the script until a dev server was started. |

**Additional build warnings recorded:**
- `lottie-web` emits an `eval` warning during build.
- Vite reports multiple chunks larger than 500 kB after minification.

## 3. Phase 2 - UI Visual, Copy, and Polish Review [FAIL]

- **Visual layout walkthrough:** ⚠️ **SKIPPED**
  - No authenticated browser walkthrough of `/admin/tours/:id` was available in this run.
  - Desktop/tablet/mobile layout behavior could not be visually verified end to end.

- **State coverage in code:** ✅ **PASS**
  - Page-level loading skeleton exists at `src/pages/Tours/TourDetail/index.tsx:136`.
  - Page-level error state uses `ErrorWidget` with retry/back actions at `src/pages/Tours/TourDetail/index.tsx:153`.
  - Schedule section has loading, error, and empty branches at `src/pages/Tours/TourDetail/index.tsx:462`, `:467`, and `:499`.

- **Copy review:** ❌ **FAIL**
  - Hardcoded English label `Views` bypasses i18n at `src/pages/Tours/TourDetail/index.tsx:533`.
  - Hardcoded Vietnamese toggle labels bypass i18n at `src/pages/Tours/TourDetail/index.tsx:597` and `:608`.
  - This creates mixed-language risk when switching locale.

- **Visual polish review:** ⚠️ **SKIPPED**
  - No runtime screenshot or manual browser inspection was completed, so alignment, overflow, sticky behavior, and responsive polish remain unverified.

## 4. Phase 3 - Functional Flow Testing [FAIL]

- **Data integration:** ✅ **PASS**
  - Detail page fetches live data via `useTourDetailQuery(id)` at `src/pages/Tours/TourDetail/index.tsx:65`.
  - Schedule preview fetches via `useTourDetailModalSchedules(id, true)` at `src/pages/Tours/TourDetail/index.tsx:66`.

- **Primary actions implemented:** ✅ **PASS**
  - Status toggle wired through `statusMutation` at `src/pages/Tours/TourDetail/index.tsx:72` and `:108`.
  - Featured toggle wired through `featuredMutation` at `src/pages/Tours/TourDetail/index.tsx:72` and `:113`.
  - Hot toggle wired through `hotMutation` at `src/pages/Tours/TourDetail/index.tsx:72` and `:118`.
  - Delete tour confirmation is wired through `TourDeleteDialog` and `deleteMutation` at `src/pages/Tours/TourDetail/index.tsx:121`, `:613`, and `:626`.
  - Edit tour and add schedule navigation exist at `src/pages/Tours/TourDetail/index.tsx:206`, `:455`, `:568`, and `:572`.

- **Interaction-spec drift:** ❌ **FAIL**
  - The spec requires description tabs (`short` vs `detail`), but the implementation renders a static description section and no tab control.
  - The spec requires schedule edit/delete actions from the detail screen, but the schedule area only previews rows plus "Add schedule"; there is no edit/delete control in the rendered list.

- **Runtime execution of happy path:** ⚠️ **SKIPPED**
  - Mutations and navigation were verified at code level only.
  - No authenticated browser session was available to validate actual submit, toast, refresh, and redirect behavior against the backend.

## 5. Phase 4 - Edge Case Testing [SKIPPED]

- **Status:** ⚠️ **SKIPPED**
- **Reason:** No authenticated browser session or backend test harness was available to simulate timeout/offline/4xx/5xx flows or double-submit behavior on the real feature route.

## 6. Phase 5 - Regression Testing [FAIL]

### 6.1. i18n Regression

- **Locale keys:** ✅ **PASS**
  - `tour-detail` translation keys exist in `public/lang/en/tour.json`.
  - Matching `detail` structure also exists in `public/lang/vi/tour.json`.

- **Rendered copy integrity:** ❌ **FAIL**
  - `Views` remains untranslated in UI code at `src/pages/Tours/TourDetail/index.tsx:533`.
  - Featured/hot toggle labels are hardcoded Vietnamese strings at `src/pages/Tours/TourDetail/index.tsx:597` and `:608`.

### 6.2. Auth & Permission Regression

- **Protected route:** ✅ **PASS**
  - `PrivateRoute` now allows both `admin` and `staff` at `src/routes/PrivateRoute.tsx:13`.
  - `UserRole` includes `staff` at `src/types/auth.ts:1`.

- **Guarded destructive UI:** ❌ **FAIL**
  - The sidebar delete-tour button is always rendered for any user who can open the detail page.
  - There is no role check around the delete action in `src/pages/Tours/TourDetail/index.tsx:613`.
  - This violates the auth review expectation that delete should remain admin-only in the UI.

### 6.3. Existing Feature Regression

- **Console route sweep:** ❌ **FAIL**
  - `npm run test:console` failed on `/`, `/admin/dashboard`, and `/admin/tours` due `401 (Unauthorized)` console errors.
  - `/login` timed out waiting for `networkidle`.
  - These failures are environment/runtime findings and block a clean browser-backed regression pass.

## 7. Copy and Visual Findings

1. `Views` is hardcoded and not localized in the stats card.
2. Featured/hot toggle labels are hardcoded in Vietnamese and bypass the locale files.
3. The detail page does not implement the tabbed description interaction described in the interaction spec.
4. Visual responsive validation for desktop/tablet/mobile remains outstanding because no direct browser inspection of the authenticated route was completed.

## 8. Console and Warning Findings

1. `npm run test:console` initially failed because Playwright browser binaries were missing; Chromium was then installed locally.
2. After browser installation, `npm run test:console` still failed with:
   - `401 (Unauthorized)` console errors on `/`, `/admin/dashboard`, and `/admin/tours`
   - `/login` timing out while waiting for `networkidle`
3. Production build emits non-blocking warnings for `lottie-web` `eval` usage and oversized chunks.

## 9. Residual Risks

1. The current QA run did not verify `/admin/tours/:id` in an authenticated browser session, so responsive layout and mutation UX are still unproven at runtime.
2. Delete-tour UI is exposed without role-based gating in the page component.
3. The feature is functionally close, but still diverges from the approved interaction spec on description tabs and schedule row actions.
4. The console regression failures suggest broader runtime/auth noise that can hide feature-specific problems until the environment is stabilized.

## 10. Final Verdict

❌ **FAIL - NOT READY FOR HANDOFF**

The feature has moved past the earlier skeleton stage and its core data wiring is present, but it is not ready to hand off yet.

Required follow-up:
1. Localize the hardcoded `Views`, featured toggle, and hot toggle labels.
2. Add role-gating so delete-tour is hidden or disabled for `staff`.
3. Bring the detail screen into parity with the interaction spec, especially the description tabs and schedule row actions.
4. Re-run browser-backed QA on an authenticated feature URL after the runtime `401` and `/login` timeout issues are resolved.
