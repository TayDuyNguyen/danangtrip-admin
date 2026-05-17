# Auth And Permissions Review: Admin Payment List

- Feature slug: `admin-payment-list`
- Date: `2026-05-17`
- Route: `/admin/payments`
- Verdict: `READY WITH RISKS`

## 1. Route Protection

- Protected wrapper: [PrivateRoute.tsx](/D:/DATN/danangtrip-admin/src/routes/PrivateRoute.tsx)
- Current behavior:
  - waits for `authReady`
  - renders loading screen before auth is ready
  - allows access only when:
    - `isAuthenticated === true`
    - `hasRole(user, 'admin') === true`
  - otherwise redirects to `/login`

## 2. Effective Access Matrix

| User state | Route access | Refund button |
|---|---|---|
| Unauthenticated | Denied, redirected to `/login` | N/A |
| Authenticated `admin` | Allowed | Enabled when payment status is `success` |
| Authenticated `staff` | Denied by route guard | Unreachable in normal routing |
| Authenticated other role | Denied by route guard | N/A |

## 3. Important Mismatch

There is a contract mismatch between documentation and implementation:

- screen docs and current prompt language describe the feature as `Admin / Staff`
- actual route guard only allows `admin`

Evidence:

- [PrivateRoute.tsx](/D:/DATN/danangtrip-admin/src/routes/PrivateRoute.tsx) checks `hasRole(user, 'admin')`
- [PaymentTable.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentTable.tsx) contains staff-facing refund tooltip logic, implying staff were expected to at least view the screen

## 4. UI-Level Permission Gating

Inside the screen:

- `isAdmin = user?.role === "admin"` in [PaymentTable.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentTable.tsx)
- refund button:
  - visible only for `success` payments
  - disabled for non-admin users
  - tooltip explains only admins may refund

This UI gating is stricter than needed only if staff are supposed to access the page.
Right now the route guard already blocks staff entirely, so the disabled-staff branch is effectively unreachable in normal use.

## 5. Backend Permission Assumptions

Frontend contracts point to:

- `GET /admin/payments`
- `GET /admin/payments/{id}`
- `POST /admin/payments/{id}/refund`
- `GET /admin/payments/export`

The frontend assumes the backend will enforce permission boundaries server-side as well.
No client-side token/role branching is used to selectively hide list/export while allowing route access for staff.

## 6. Redirect And Session Behavior

- unauthenticated or unauthorized users are redirected to `/login`
- loading state is shown while auth hydration finishes
- `useAuth()` derives authentication from:
  - persisted user state
  - access token presence

Evidence:

- [useUserStore.ts](/D:/DATN/danangtrip-admin/src/store/useUserStore.ts)

## 7. Risks

1. Staff access mismatch
   If business requirements expect staff to view `/admin/payments`, current route protection is too strict.
2. Unreachable tooltip branch
   The disabled refund button tooltip for staff suggests intended partial access, but the current route guard prevents staff from ever reaching the screen.
3. No fine-grained action policy
   Permissions are applied at route level and row-action level only; there is no explicit matrix for `view`, `export`, and `refund`.

## 8. Recommendation

Choose one direction and keep route/UI/backend aligned:

1. `Admin only`
   - keep `PrivateRoute` as-is
   - remove staff-specific refund tooltip language if it is no longer meaningful
   - update docs/prompts to say admin-only

2. `Admin + Staff view, Admin refund`
   - update route guard to allow `['admin', 'staff']`
   - keep refund disabled for staff
   - verify backend allows list/export/detail for staff but restricts refund to admin

## 9. Current Conclusion

From the code alone, the implemented policy is:

- route: `admin only`
- refund action: `admin only`

This is internally consistent enough to ship technically, but it is not fully aligned with the documented `Admin / Staff` expectation, so the feature carries a permission-spec risk until product intent is clarified.
