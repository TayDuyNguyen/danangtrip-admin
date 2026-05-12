# Auth & Permissions Review: Chi tiết Địa điểm (Location Detail)

- **Feature Slug**: `location-detail`
- **Date**: 2026-05-12
- **Status**: ✅ Reviewed

## 1. Route Guard Review

The feature is hosted under the `/admin/locations/detail/:id` path, which is protected by the `PrivateRoute` component in the main router configuration.

| Route | Guard | Role Required | Unauthorized Behavior |
| :--- | :--- | :--- | :--- |
| `/admin/locations/detail/:id` | `PrivateRoute` | `admin` | Redirect to `/login` |

**Implementation Details**:
- The guard is applied at the layout level in `src/routes/index.tsx`.
- `PrivateRoute` verifies both `isAuthenticated` and `hasRole(user, 'admin')`.
- If the token is missing or expired, `axiosClient` interceptors trigger `handleLogout`, clearing the store and redirecting to the login page.

---

## 2. Permission Matrix

This matrix defines the expected access levels for different actions within the Location Detail screen.

| Action | admin | staff | guest | Note |
| :--- | :---: | :---: | :---: | :--- |
| **View Basic Info** | ✓ | ✓ | ✗ | Detailed description, contact info |
| **View Reviews** | ✓ | ✓ | ✗ | Customer ratings and comments |
| **Edit Location** | ✓ | ✗ | ✗ | Navigation to Edit screen |
| **Delete Location** | ✓ | ✗ | ✗ | Permanent removal of data |
| **Update Status** | ✓ | ✗ | ✗ | Active/Inactive toggle |
| **Toggle Featured** | ✓ | ✗ | ✗ | Featured status on home page |

> [!NOTE]
> Currently, the entire `/admin/*` scope is restricted to `admin` role by `PrivateRoute`. The "staff" column represents the intended behavior if access is expanded in the future.

---

## 3. UI Gating Review

To ensure a secure and clean UX, sensitive actions are conditionally rendered based on the user's role.

| Component | Target UI | Rule | Gating Type |
| :--- | :--- | :--- | :--- |
| `DetailHeader` | Edit Button | `role === 'admin'` | Conditional Render |
| `DetailHeader` | Delete Button | `role === 'admin'` | Conditional Render |
| `DetailSidebar` | Status Select | `role === 'admin'` | Conditional Render |
| `DetailSidebar` | Featured Toggle | `role === 'admin'` | Conditional Render |
| `DetailSidebar` | Delete Action | `role === 'admin'` | Conditional Render |

> [!IMPORTANT]
> Use conditional rendering `{user?.role === 'admin' && (...)}` instead of CSS `display: none` to prevent users from inspecting and enabling buttons via DevTools.

---

## 4. Auth Flow Integrity

- **Token Attachment**: `axiosClient.ts` request interceptor automatically attaches the `Bearer` token from `localStorage`.
- **Silent Refresh**: The app uses an HttpOnly cookie refresh mechanism. If the access token expires, `axiosClient` attempts a refresh before retrying the failed request.
- **Bootstrap Phase**: The `authReady` flag in `useUserStore` prevents premature redirects during the initial app load while verifying the session.
- **Interceptors**: Global 401 handling ensures that any session expiration across the detail page (e.g., while viewing reviews) correctly triggers a logout.

---

## 5. Risk Review & Assumptions

- **[ASSUMPTION] Backend Sync**: This review assumes the backend endpoints (`DELETE /locations/:id`, `PATCH /locations/:id/status`) strictly enforce the `admin` role independently of the frontend.
- **[RISK] Broad Guard**: The current `PrivateRoute` is hardcoded to require `admin`. This may lead to code duplication or "guard fatigue" if more granular roles (e.g., `moderator`) are introduced later.
- **[MITIGATION] UI Integrity**: We ensure that `DeleteLocationModal` cannot be triggered by non-admins by wrapping the trigger buttons in conditional logic.

---

## 6. Required Actions

1.  **Wrap Actions**: Ensure `DetailHeader` and `DetailSidebar` wrap their action-oriented UI elements in `{user?.role === 'admin' && (...)}`.
2.  **Verify Status API**: Confirm that the `bulkAction` and `toggleFeatured` mutations in `useLocationQueries.ts` handle 403 Forbidden errors gracefully via the global interceptor.
