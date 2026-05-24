# Route and Layout Plan: Admin Users Report (`admin_reports_users`)

> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> Scope: `route registration and sidebar integration`

---

## 1) Target Route

- **UI URL Route Path:** `/admin/reports/users`
- **Authorized Roles:** `Admin`, `Staff`
- **Guard Component:** `<PrivateRoute />`
- **Nesting Layout:** `<MainLayout />` with sidebar and header elements.

---

## 2) Router Registration Plan

### Modified `src/routes/routes.ts`
Added `REPORTS_USERS` key to global ROUTES registry to prevent hardcoding URLs elsewhere.
```diff
     REPORTS_BOOKINGS: '/admin/reports/bookings',
     REPORTS_REVENUE: '/admin/reports/revenue',
     REPORTS_LOCATIONS: '/admin/reports/locations',
+    REPORTS_USERS: '/admin/reports/users',
 } as const;
```

### Modified `src/routes/index.tsx`
Configured React lazy loading for the page component and registered the child route under MainLayout.
```diff
 const BookingsReport = React.lazy(() => import('@/pages/Reports/BookingsReport'));
 const RevenueReport = React.lazy(() => import('@/pages/Reports/RevenueReport'));
 const LocationReport = React.lazy(() => import('@/pages/Reports/LocationReport'));
+const UsersReport = React.lazy(() => import('@/pages/Reports/UsersReport'));
```

```diff
                     { path: ROUTES.REPORTS_BOOKINGS, element: withSuspense(BookingsReport) },
                     { path: ROUTES.REPORTS_REVENUE, element: withSuspense(RevenueReport) },
                     { path: ROUTES.REPORTS_LOCATIONS, element: withSuspense(LocationReport) },
+                    { path: ROUTES.REPORTS_USERS, element: withSuspense(UsersReport) },
```

---

## 3) Navigation & Sidebar Integration

### Modified `src/components/common/Sidebar.tsx`
Integrated the sub-menu navigation link to allow Admin/Staff to toggle the screen.
```diff
             { label: 'sidebar.reports_bookings', path: ROUTES.REPORTS_BOOKINGS },
             { label: 'sidebar.reports_revenue', path: ROUTES.REPORTS_REVENUE },
             { label: 'sidebar.reports_locations', path: ROUTES.REPORTS_LOCATIONS },
+            { label: 'sidebar.reports_users', path: ROUTES.REPORTS_USERS },
         ]
```

---

## 4) Verification Plan
We will run `npm run typecheck` to confirm route declarations and imports compiling without errors before proceeding with visual component design.
