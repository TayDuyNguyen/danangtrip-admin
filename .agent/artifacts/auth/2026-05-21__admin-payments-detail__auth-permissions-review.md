# Auth & Permissions Review: Admin Payments Detail

> Feature slug: `admin-payments-detail`
> Date: 2026-05-21
> Route scope: `/admin/payments/:id`

---

## 1) Protected Routes
| Route | Guard | Required Role | Redirect Behavior | Notes |
|---|---|---|---|---|
| `/admin/payments/:id` | `PrivateRoute` | `admin` | Redirects to `/login` | The entire dashboard administration site is protected under `PrivateRoute`. |

## 2) Role Matrix
| Role | View | Create | Update | Delete | Export | Refund | Notes |
|---|---|---|---|---|---|---|---|
| admin | ✓ | N/A | N/A | N/A | N/A | ✓ | Full permissions for views and refund actions. |
| user (client) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Redirected to `/login` if attempting to access any route under `PrivateRoute`. |

## 2.1) Action Matrix
| Action | Allowed Role(s) | UI Behavior | Backend Expectation | Notes |
|---|---|---|---|---|
| View Payment Detail | `admin` | Allowed to enter the route and render detail cards. | GET `/api/admin/payments/{id}` requires admin token. | |
| Refund Payment | `admin` | "Refund" button is enabled. | POST `/api/admin/payments/{id}/refund` requires admin token. | Non-admins see the button disabled with a helper tooltip. |

## 3) Guarded UI Actions
| UI Element | Visible To | Why |
|---|---|---|
| Refund Button | All roles that access the screen | Visible to maintain UI consistency. However, it is enabled only for `admin` role. |
| Tooltip Warning for Staff | Non-admin roles (if route access is ever expanded) | Displays "Chỉ người quản trị mới có quyền thực hiện hoàn tiền" to explain why the action is disabled. |

## 3.1) Hidden vs Disabled Decisions
| UI Element | Hidden or Disabled | Reason | Risk |
|---|---|---|---|
| Refund Button | Disabled (for non-admins) | Preserves dashboard layout consistency and shows that the refund capability exists on the transaction, while conveying security restrictions via tooltip. | Minor: exposure of the button structure in DOM. Mitigation: backend endpoint is strictly protected. |

## 4) Token / Redirect Flow Review
| Area | Current Behavior | Expected Behavior | Status | Notes |
|---|---|---|---|---|
| Token attach | Automatically injected into `Authorization` header by `axiosClient` request interceptor. | Every API call carries the Bearer token if it exists in local storage. | ✓ PASS | |
| Logout | Resets Zustand store via `logout()`, clears access token via `clearTokens()`, redirects to `/login`. | Clear all local user metadata and session states, redirect cleanly. | ✓ PASS | |
| Unauthorized redirect | Redirects user to `/login` if `isAuthenticated` is false. | Block access to dashboard and route user to auth module. | ✓ PASS | |
| Wrong role redirect | Redirects user to `/login` if role is not `'admin'`. | Gate client-side access for standard clients (`user`). | ✓ PASS | |

## 5) Risks / Assumptions
- **[ASSUMPTION] A-01**: Currently, the system only defines roles `admin` and `user`. The admin dashboard is strictly `admin`-only. If a middle role (like `staff` or `moderator`) is introduced in the future, `PrivateRoute` will need to accept an array of roles.
- **[RISK] R-01**: Client-side role checking can be bypassed by modifying the local state in the browser.
  - *Mitigation*: The backend API must validate authorization and ensure the token belongs to a user with the `admin` role for the `POST` refund endpoint.

## 6) Files / Areas Affected
- `src/routes/PrivateRoute.tsx` (Route protection)
- `src/store/useUserStore.ts` (Zustand state and storage keys)
- `src/api/axiosClient.ts` (Bearer token injection and 401 handling)
- `src/pages/Payments/PaymentDetail/index.tsx` (Role checks on screen actions)
