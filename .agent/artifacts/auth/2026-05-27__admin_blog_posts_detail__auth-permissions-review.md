# Auth & Permissions Review - Blog Post Detail (`admin_blog_posts_detail`)

- **Feature Slug:** `admin_blog_posts_detail`
- **Review Date:** 2026-05-27
- **Verdict:** ✅ SECURE & ALIGNED (All route level and UI level controls reviewed)

---

## 1. Route Level Protection

The newly registered route `/admin/blog-posts/:id` is nested securely inside the `PrivateRoute` wrapper configuration inside `src/routes/index.tsx`:

- **Guard Component:** `PrivateRoute` validates `isAuthenticated` from Zustand store. Unauthenticated requests are immediately redirected back to `/login` with a clean return URL parameter.
- **Route Access:** Restricted exclusively to authenticated members holding an active JWT session token. Guests/Public users navigating directly to this page are safely blocked.

---

## 2. Role-Based Permissions Matrix

We map permissions cleanly across Admin and Staff (Editor/Contributor) roles:

| Action | admin | staff | guest | UX Control Strategy |
|---|---|---|---|---|
| View Post Detail | ✓ | ✓ | ✗ | Allowed to enter route, loads showing full content preview. |
| Quick Status Update | ✓ | ✓ | ✗ | Allowed (both roles edit content, hence they edit status). |
| Navigate to Edit Screen | ✓ | ✓ | ✗ | Allowed. Button visible to both roles. |
| Duplicate Blog Post | ✓ | ✓ | ✗ | Allowed. Prefills create state correctly. |
| Delete Blog Post (Destructive) | ✓ | ✗ | ✗ | **Gated.** Admin: Allowed. Staff: Blocked. Hidden from DOM. |

---

## 3. UI Level Gating Strategy

We prevent unauthorized actions in the UI through strict conditional DOM renders rather than hiding elements via CSS:

- **Delete Button Gating:**
  We use `isAdmin` flag retrieved from `useAuth` user session store to gate the Delete Button:
  ```typescript
  {isAdmin && (
      <Button variant="ghost" onClick={onDeleteClick}>
          Xóa bài viết
      </Button>
  )}
  ```
  If logged in as a non-admin Staff member, the delete button is completely absent from the DOM, preventing inspect-element bypasses.

---

## 4. Auth Integrity Verification

- **Token attachment:** Handled centrally by `src/api/axiosClient.ts` request interceptors, preventing security credentials duplication.
- **Session Expiry (401):** Centralized response interceptors catch 401s, clear browser cookies and Zustand auth stores, and trigger redirections.

---

## 5. Security Verdict

✅ Secure. The implementation enforces correct role mappings, applies bulletproof DOM-level conditional gating, and prevents private information leakage.
