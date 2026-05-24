# Auth & Permissions Review: Báo cáo Đánh giá (Ratings Report)

- Feature Slug: `admin_reports_ratings`
- Route Path: `/admin/reports/ratings`
- Role Requirement: `admin` | `super_admin`
- Last Updated: 2026-05-22

---

## 1. Route Gating & Protection

The new route `/admin/reports/ratings` is registered inside `src/routes/index.tsx` inside the `<PrivateRoute />` and `<MainLayout />` context wrappers:

```tsx
{
    element: <PrivateRoute />,
    errorElement: <ErrorPage />,
    children: [
        {
            element: <MainLayout />,
            children: [
                ...
                { path: ROUTES.REPORTS_RATINGS, element: withSuspense(RatingsReport) },
            ]
        }
    ]
}
```

- **Route Guard**: The `<PrivateRoute />` component inspects the active user state inside Zustand `useUserStore`. If no token exists, the user is redirected to the login screen `/login` immediately.
- **Admin System Access**: The navigation group is designated for authenticated admin portal staff. Users with lower-tier permissions cannot authenticate to the React Admin system in standard operational environments.

---

## 2. Moderation Action Access Control

The interactive table includes inline operations to Approve, Reject, and Delete customer reviews:

- **Approve & Reject Operations**: Available to all authorized staff members (Admins, Content Moderation team) who have permission to clean up locations and tours feedbacks.
- **Delete Operation**: Gated behind standard security confirmation (`window.confirm`). This protects reviews against accidental purge actions.
- **Backend Sync**: The Laravel backend implements role checks (e.g. `auth:sanctum` and role gate middleware) to reject rating status patches from unauthorised user scopes.
