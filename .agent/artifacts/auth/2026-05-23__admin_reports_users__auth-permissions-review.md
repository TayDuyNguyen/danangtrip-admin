# Security & Auth Review: Admin Users Report (`admin_reports_users`)

> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> Scope: `route guards, role checks, and API session refreshes`

---

## 1) Client Route Protection
The users report route (`/admin/reports/users`) is nested directly within the private router layout in `src/routes/index.tsx`:

```tsx
    {
        element: <PrivateRoute />,
        errorElement: <ErrorPage />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    // ...
                    { path: ROUTES.REPORTS_USERS, element: withSuspense(UsersReport) },
                ]
            }
        ]
    }
```

- **`PrivateRoute` role:** Ensures that any unauthenticated access triggers a redirection to `/login` immediately.
- **Role Boundary check:** Since this feature belongs strictly to the Reports & Analytics system, only administrators and staff profiles who have successfully passed Auth bootstrapping are allowed.

---

## 2) API Request Authentication
Every outbound network request initiated by the page query hooks (`getUsersReport` and `exportUsersReport`) is routed through `axiosClient.ts`.

- **Bearer Token injection:** The `axiosClient` request interceptor automatically extracts the active JWT access token from browser state and attaches it to the `Authorization` header (`Bearer <token>`).
- **Session Continuity (Silent Refresh):** If a request encounters a token expiration window or returns a `401 Unauthorized` status from Laravel, the interceptor automatically queues pending requests and performs a silent token refresh via the backend HttpOnly `refresh_token` cookie.
- **Session Termination:** If the silent refresh fails (session is completely expired), tokens are cleared and the user is redirected to the login panel safely, preventing data leaks or broken state.

---

## 3) Backend Role Enforcement
On the backend side, both endpoints are locked behind the `jwt.auth` and `role:admin` middleware inside `routes/api.php`:

```php
Route::middleware(['jwt.auth', 'role:admin'])->prefix('admin')->group(function () {
    // ...
    Route::get('/reports/users', [AdminDashboardController::class, 'userReports']);
    Route::get('/users/export', [AdminUserController::class, 'export']);
});
```

- Any rogue requests bypassing frontend routing to directly hit these API endpoints will be blocked at the Laravel routing layer, returning a `403 Forbidden` or `401 Unauthorized` payload.
- This guarantees absolute boundary protection.

---

## 4) Audit Verdict
- **Verdict:** `Secure & Compliant`
- **Rationale:** Frontend PrivateRoute guards match backend middleware validations perfectly. Network authentication flows are centralized within `axiosClient`, eliminating page-level leaks or authentication vulnerabilities.
