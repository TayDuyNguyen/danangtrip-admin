# Route Plan: Admin Dashboard

> Feature slug: `admin-dashboard`
> Date: 2026-05-21
> Layout target: `MainLayout`

---

## 1) Summary
- This step audits, hardens, and verifies the layout and routing implementation for the modular **Admin Dashboard** (`admin-dashboard`) screen.
- The route `/dashboard` is already registered, lazily loaded, and secured under `PrivateRoute`. This route is an essential central administrative view.

## 1.1) Route Decision
- Route type: `extend` / `audit` (existing core route verified)
- Guard needed: `yes` (requires active authentication and administrator/super admin permissions)
- Why: Gated under `PrivateRoute` with `MainLayout` to ensure statistics, revenue data, and user list are strictly restricted to authenticated administrators.

## 2) Target Routes
| Route Path | Page Component | Guard | Layout | Notes |
|---|---|---|---|---|
| `/dashboard` | `src/pages/Dashboard/index.tsx` | `PrivateRoute` | `MainLayout` | The primary dashboard page rendering premium stats, charts, top tours, and recent bookings. |

## 3) Page Structure
| File | Purpose | Status |
|---|---|---|
| `src/pages/Dashboard/index.tsx` | Main Dashboard screen layout assembling child widgets and managing filter/refresh states. | `Exist` (Hardened) |
| `src/pages/Dashboard/components/StatsCards.tsx` | High-fidelity glassmorphic cards rendering key system metrics and counters. | `Exist` (To be audited in Step 05) |
| `src/pages/Dashboard/components/DashboardCharts.tsx` | Recharts-based multi-period revenue, booking trends, user growth, and status distribution graphs. | `Exist` (To be audited in Step 05) |
| `src/pages/Dashboard/components/TopToursTable.tsx` | Table showcasing top tours sorted by booking metrics with action links. | `Exist` (To be audited in Step 05) |
| `src/pages/Dashboard/components/RecentOrdersTable.tsx` | High-fidelity table with reactive status filtering and pagination for recent bookings. | `Exist` (To be audited in Step 05) |

## 3.1) Layout / Guard Notes
| Concern | Decision | Notes |
|---|---|---|
| Layout | `MainLayout` | Standard admin workspace with a left collapsible sidebar (`Sidebar`), a top header with search and user settings (`Header`), and a scrollable content box. |
| ProtectedRoute | Active | Wrapped inside `<PrivateRoute />` inside the central React Router configuration. Any unauthenticated requests are redirected back to the Login screen. |
| Breadcrumb | Reused standard | The Dashboard represents the root administrative level. Navigation and header components reference it as the root path `/` or `/dashboard`. |
| Menu item | Registered | Registered in `src/components/common/Sidebar.tsx` as the first primary action: Bảng điều khiển (Dashboard) with the `LayoutDashboard` Lucide icon. |

## 4) Navigation / Breadcrumb
| Item | Locale Key | Path | Icon | Notes |
|---|---|---|---|---|
| Menu | `sidebar.dashboard` | `/dashboard` | `LayoutDashboard` | Displays "Bảng điều khiển" (VI) or "Dashboard" (EN) at the top of the sidebar. |
| Breadcrumb Root | `breadcrumb.home` | `/` | None | Header and pages link back to the dashboard as the core root home. |

## 5) Locale Updates
No new keys are required as both languages already contain symmetric, high-quality entries matching our navigation decisions:
| File | Keys Verified |
|---|---|
| `public/lang/vi/common.json` | `"sidebar.dashboard": "Bảng điều khiển"`, `"brand.name": "DaNangTrip"` |
| `public/lang/en/common.json` | `"sidebar.dashboard": "Dashboard"`, `"brand.name": "DaNangTrip"` |

## 6) Risks / Notes
- **R-01: Route mismatch in docs vs repo**: Backend docs list `/admin/dashboard` but the frontend strictly routes under `/dashboard`.
  - *Mitigation*: Adhered strictly to repo reality (`/dashboard`) inside `src/routes/routes.ts` and `src/routes/index.tsx` to maintain route registration consistency.
- **R-02: Double Loading State**: If the layout loads slowly while lazy page elements also fetch, the layout might flicker.
  - *Mitigation*: The router utilizes `<Suspense fallback={<PageLoader />}>` globally and inside `MainLayout` to ensure a smooth, unified skeleton state.

## 6.1) Open Questions
- **No active blockers or open questions.** The routing config, sidebar linkages, and layout integrations are structurally complete and conform perfectly to the standards.

## 7) Files Expected To Change
No functional code changes are required for routing as the active files have been audited and verified as 100% correct:
- `src/routes/routes.ts` (Verified)
- `src/routes/index.tsx` (Verified)
- `src/layouts/MainLayout.tsx` (Verified)
- `src/components/common/Sidebar.tsx` (Verified)
