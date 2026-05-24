# Route Plan: Chi tiết Người dùng (`admin_users_detail`)

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Main path: `/admin/users/:id`

---

## 1) Route Definitions
The route `/admin/users/:id` is registered dynamically inside the project's centralized routing infrastructure to load the user detail page.

### 1.1 Centralized Constants (`src/routes/routes.ts`)
- Constant declared: `USERS_DETAIL: '/admin/users/:id'`

### 1.2 Router Registry (`src/routes/index.tsx`)
- Lazy splitting applied:
```typescript
const UserDetail = React.lazy(() => import('@/pages/Users/UserDetail'));
```
- Wrap structure inside `PrivateRoute` with `Suspense` and `PageLoader` fallback component:
```typescript
{ path: ROUTES.USERS_DETAIL, element: withSuspense(UserDetail) }
```

---

## 2) Navigation Mappings

### 2.1 From Users List Screen
In the `UserTable` row actions, clicking the `Eye` button executes a React Router navigation action:
```typescript
onClick={() => navigate(ROUTES.USERS_DETAIL.replace(":id", String(user.id)))}
```

### 2.2 Breadcrumbs Structure
Within the User Detail header, a localized breadcrumb links back to the list screen:
`Người dùng / Danh sách Người dùng / [Tên Người Dùng]` (translated dynamically based on the current locale).

---

## 3) i18n Localization Namespace
The User Detail screen uses the `'user'` translation namespace pre-registered inside i18next configuration.
- VI localization bundle: `public/lang/vi/user.json`
- EN localization bundle: `public/lang/en/user.json`
- Parity checklist: 100% synchronized key validation.
