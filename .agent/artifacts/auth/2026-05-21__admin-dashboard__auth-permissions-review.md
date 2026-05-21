# Auth & Permissions Review: Tổng quan hệ thống (System Dashboard)

> Feature slug: `admin-dashboard`
> Date: 2026-05-21
> Route scope: `/dashboard` (ROUTES.DASHBOARD)

---

## 1) Protected Routes

| Route | Guard | Required Role | Redirect Behavior | Notes |
|---|---|---|---|---|
| `/dashboard` | `PrivateRoute` wrapper | `admin` | Redirects to `/login` via `<Navigate to={ROUTES.LOGIN} replace />` | Standard private route protection for admin-only modules |

---

## 2) Role Matrix

| Role | View | Create | Update | Delete | Export | Notes |
|---|---|---|---|---|---|---|
| **admin** | ✓ | N/A | N/A | N/A | ✓ | Full dashboard access and report exporting |
| **staff** | ✗ | N/A | N/A | N/A | ✗ | Forbidden by `PrivateRoute` (system-wide admin constraint) |

> [!NOTE]
> Since the backend administrative panel is strictly locked down for high-level operations, the client-side routing currently gates the entire application layout under the `admin` role hasRole checks in `PrivateRoute.tsx`.

## 2.1) Action Matrix

| Action | Allowed Role(s) | UI Behavior | Backend Expectation | Notes |
|---|---|---|---|---|
| **View Dashboard** | `admin` | Full layout rendering | Enforces admin Bearer token verify check | Primary landing page |
| **Export Bookings Report** | `admin` | Renders enabled "Xuất báo cáo" button | Validates admin scope for Excel workbook streams | Triggers custom download mutation |
| **Global Refetch / Reload** | `admin` | Renders action triggers | Standard query refetching | Triggers multiple background updates |

---

## 3) Guarded UI Actions

| UI Element | Visible To | Why |
|---|---|---|
| **Export Report Button** | `admin` | Visible only because the entire page is restricted to `admin` |
| **Individual Refresh Buttons** | `admin` | Tool to refetch dashboard metrics |

## 3.1) Hidden vs Disabled Decisions

| UI Element | Hidden or Disabled | Reason | Risk |
|---|---|---|---|
| **Action buttons (Export/Refresh)** | Disabled | When actions are already loading (pending), they are disabled with spin indicators to prevent concurrent overloading | Minimal risk of rate-limiting bypass |

---

## 4) Token / Redirect Flow Review

| Area | Current Behavior | Expected Behavior | Status | Notes |
|---|---|---|---|---|
| **Token attach** | Automatically attached in request interceptors at `axiosClient.ts` | Attaches `Authorization: Bearer <token>` to all queries | **Flawless** | Standard axios interceptor architecture |
| **Logout** | Clears Zustand auth states and local storage before routing back | Completely clears user context, tokens, and redirects to `/login` | **Flawless** | Centralized in `useAuth` stores |
| **Unauthorized redirect** | Interceptor captures 401 and calls `logout()` action | Redirects non-authenticated sessions immediately | **Flawless** | Seamless user experience |
| **Wrong role redirect** | `PrivateRoute` checks role matching and pushes to `/login` | Redirects unauthorized roles out | **Flawless** | Enforces `admin` role boundary |

---

## 5) Risks / Assumptions

- **[ASSUMPTION] A-01:** We assume that staff members do not have access to any API endpoints backing this dashboard. This is reinforced by token authorization verification at the server gateway.
- **R-01 (Token Expired in Middle of Session):** If an admin keeps the dashboard open for too long, their token might expire.
  *Mitigation:* The axios interceptor captures 401 errors, immediately logging the user out and redirecting them to `/login` without leaving stale data on screen.

---

## 6) Files / Areas Affected

- `src/routes/index.tsx` (Route registration)
- `src/routes/PrivateRoute.tsx` (Access gate wrapper)
- `src/api/axiosClient.ts` (Bearer token attach interceptors)
- `src/pages/Dashboard/index.tsx` (Action guards)
