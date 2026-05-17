# Route Plan: admin-bookings-list

- **Feature Slug:** `admin-bookings-list`
- **Artifact Type:** `route-plan`
- **Date:** 2026-05-16

---

## 1. Route Definitions (`src/routes/routes.ts`)

Add the following constant to the `ROUTES` object:

```typescript
export const ROUTES = {
    // ... existing routes
    BOOKINGS_LIST: '/admin/bookings', // Targeted route for Booking List
} as const;
```

---

## 2. Router Registration (`src/routes/index.tsx`)

### 2.1 Lazy Load Component
Add the lazy import for the new page:
```typescript
const BookingList = React.lazy(() => import('@/pages/Bookings/BookingList'));
```

### 2.2 Register Private Route
Add the route entry within the `MainLayout` children:
```typescript
{ path: ROUTES.BOOKINGS_LIST, element: withSuspense(BookingList) },
```

---

## 3. Sidebar Integration (`src/components/common/Sidebar.tsx`)

### 3.1 Update `navItems`
The current sidebar has a placeholder for orders:
`{ icon: ShoppingCart, label: 'sidebar.orders', path: '/admin/orders' }`

This should be updated to use the new `ROUTES.BOOKINGS_LIST`:
```typescript
{ icon: ShoppingCart, label: 'sidebar.orders', path: ROUTES.BOOKINGS_LIST },
```

---

## 4. Breadcrumbs Configuration

The `BookingHeader` component will use the following breadcrumb structure:
- `Home` (Dashboard)
- `Đơn hàng & Thanh toán` (Label only)
- `Danh sách Đơn hàng` (Active)

---

## 5. Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/routes/routes.ts` | Update | Add `BOOKINGS_LIST` constant. |
| `src/routes/index.tsx` | Update | Import and register `/admin/bookings` route. |
| `src/components/common/Sidebar.tsx` | Update | Link "Orders" menu item to `ROUTES.BOOKINGS_LIST`. |
| `src/pages/Bookings/BookingList/index.tsx` | New | Create entry file for the new screen. |
