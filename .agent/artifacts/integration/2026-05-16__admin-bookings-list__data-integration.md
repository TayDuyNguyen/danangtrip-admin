# Data Integration Plan: Admin Bookings List

- **Feature Slug:** `admin-bookings-list`
- **Integration Date:** 2026-05-16
- **Status:** ✅ VERIFIED
- **Infrastructure:** TanStack Query v5 + axiosClient

---

## 1. Data Source Breakdown

| Query/Mutation | Service Method | Purpose | Trigger |
|---|---|---|---|
| `useAdminBookingsQuery` | `bookingApi.getList` | Fetch list of bookings | On mount / Filter change / Page change |
| `useAdminBookingStatsQuery`| `bookingApi.getStatusCounts` | Fetch status counts | On mount / Filter change |
| `updateStatusMutation` | `bookingApi.updateStatus` | Confirm or Cancel booking | Manual (Button click) |
| `exportMutation` | `bookingApi.export` | Download Excel file | Manual (Header button) |

---

## 2. Query Strategy

### Hierarchical Keys
```ts
const bookingKeys = {
    all: ['bookings'] as const,
    lists: () => [...bookingKeys.all, 'list'] as const,
    list: (filters: BookingListFilters, page: number, limit: number) => 
        ([...bookingKeys.lists(), { ...filters, page, limit }] as const),
    stats: (params?: Record<string, unknown>) => [...bookingKeys.all, 'stats', params || {}] as const,
};
```

### State Configuration
- `staleTime`: 30s for lists, 60s for stats.
- `refetchOnWindowFocus`: Standard (true).
- `enabled`: Always enabled (stats rely on filters).

---

## 3. Mutation & Invalidation Strategy

| Mutation | Action | Invalidation | User Feedback |
|---|---|---|---|
| **Confirm** | `PATCH .../status` (confirmed) | `bookingKeys.all`, `['dashboard']` | Toast Success/Error |
| **Cancel** | `PATCH .../status` (cancelled) | `bookingKeys.all`, `['dashboard']` | Toast Success/Error |
| **Export** | `GET .../export` (blob) | None | Toast Success/Error |

---

## 4. UI State Handling

| Section | Loading State | Empty State | Error Handling |
|---|---|---|---|
| **Stats Grid** | `BookingStats` (Skeleton Pulse) | N/A (Defaults to 0) | Global Toast |
| **Activity Stream** | `BookingTimeline` (Skeletons) | `BookingTimeline` (Illustration) | Global Toast |
| **Pagination** | Hidden while loading | Hidden if total = 0 | N/A |

---

## 5. Files Impacted

- **[REUSE]** `src/api/bookingApi.ts`
- **[REUSE]** `src/dataHelper/booking.mapper.ts`
- **[REUSE]** `src/hooks/useBookingQueries.ts`
- **[REUSE]** `src/pages/Bookings/BookingList/index.tsx`
