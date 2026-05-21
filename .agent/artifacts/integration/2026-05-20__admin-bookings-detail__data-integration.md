# Data Integration Plan: admin-bookings-detail
Date: 2026-05-20
Feature: `admin-bookings-detail` (Chi tiết Đơn hàng)

This document maps out the backend data integration flow for the **Booking Detail** (`Chi tiết Đơn hàng`) operations screen, detailing hierarchical caching query keys, raw-to-ViewModel mapping logic, mutation side effects, and state-driven UI structures.

---

## 1. Data Sources Matrix

We integrate with three primary endpoints from our admin backend API:

| Source API Method | HTTP Method | Endpoint URI | Purpose | Output Shape |
|---|---|---|---|---|
| `bookingApi.getDetail(id)` | `GET` | `/admin/bookings/{id}` | Retrieve booking detail context (customer, items, payments) | `ApiResponse<RawBookingDetail>` |
| `bookingApi.updateStatus(id, payload)` | `PATCH` | `/admin/bookings/{id}/status` | Update booking status (`confirmed`, `completed`, `cancelled`) | `ApiResponse<AdminRawBookingItem>` |
| `bookingApi.getInvoice(id)` | `GET` | `/user/bookings/{id}/invoice` | Stream binary Blob PDF invoice for customer orders | `AxiosResponse<Blob>` |

---

## 2. Query Caching Strategy (TanStack Query)

To manage server state efficiently, prevent redundant network requests, and ensure real-time UI synchronization, we utilize a hierarchical query key structure.

### Caching Keys
* **All Bookings Domain**: `['bookings']`
* **Lists Sub-Cache**: `['bookings', 'list']`
* **Lists Params Cache**: `['bookings', 'list', filters]`
* **Statistics Cache**: `['bookings', 'stats', params]`
* **Active Booking Detail Cache**: `['bookings', 'detail', id]` (Invalidated specifically on mutations)

### Hook Implementation: `useAdminBookingDetailQuery(id)`
* **Key**: `bookingKeys.detail(id)`
* **Enabled condition**: Only runs when `!!id` (prevents empty path fetch on route bootstrap).
* **Stale Time**: `30,000ms` (30 seconds) to ensure operator sees up-to-date status changes while maintaining caching benefits.
* **Mapper Pipeline**: Automatically maps the backend's raw snake_case format to the frontend's camelCase ViewModel via `mapBookingDetail`.

---

## 3. Data Transformation & Mapping (ViewModel Pattern)

To avoid exposing raw backend structures directly to our React views, the integration pipeline transforms `RawBookingDetail` to `BookingDetail` structures inside our query functions.

```
[Raw Response] -> [bookingApi.getDetail] -> [mapBookingDetail] -> [useAdminBookingDetailQuery] -> [React View]
```

### Key Field Standardizations:
1. **Order Timestamps**: Maps backend timestamps (`booked_at`, `confirmed_at`, `completed_at`, `cancelled_at`) into camelCase fields used to feed the `VirtualTimeline` milestone logs.
2. **Passenger Aggregations**: Extracts adult, child, and infant registration counts from the individual `RawBookingDetailItem` items and sums them reactively to render the travelers' breakdown.
3. **Prices and Currency**: Standardizes number structures safely using `toNumberSafe()` mapping, preventing compilation crashes on string-wrapped numeric fields.

---

## 4. Mutation & Invalidation Strategy

Operators perform critical status actions directly from the page sidebar. Success side effects must trigger targeted cache updates.

### A. Status Transition Mutation: `updateStatusMutation`
* **API Action**: `PATCH /admin/bookings/{id}/status`
* **On Success Callbacks**:
  1. **Self-Invalidation**: Invalidates `bookingKeys.detail(id)` to immediately trigger a background refresh of the current page details.
  2. **Domain Invalidation**: Invalidates `bookingKeys.all` to force booking tables, search filters, and lists to reload the updated statuses.
  3. **Cross-Domain Invalidation**: Invalidates the `['dashboard']` cache to guarantee dashboard stats count badges remain 100% in sync with database changes.
* **Feedback Toasts**:
  * Confirm Success: *Đã xác nhận đơn hàng thành công* (Confirm success)
  * Complete Success: *Đã hoàn tất đơn hàng thành công* (Complete success)
  * Cancel Success: *Đã huỷ đơn hàng thành công* (Cancel success)
  * Failure: *Có lỗi xảy ra khi cập nhật đơn hàng* (Update error)

### B. PDF Export Mutation: `getInvoiceMutation`
* **API Action**: `GET /user/bookings/{id}/invoice` (streams binary payload)
* **Client-side Action**: Parses `Content-Disposition` header elements to extract the backend filename, sanitizes special characters, and triggers a seamless file download.
* **Feedback Toasts**:
  * Success: *Xuất hoá đơn PDF thành công* (Export success)
  * Failure: *Không thể tải hoá đơn đơn hàng* (Export error)

---

## 5. UI State Handling (CLS-Free)

We guarantee high-end aesthetics by matching our loader states perfectly to the active template dimensions:

1. **Query Loading State**: 
   * Mounts a grey pulse skeleton container layout (`animate-pulse`) representing the header, breadcrumbs, the 65% width left column card stack, and the 35% sidebar card stack.
   * Completely avoids Cumulative Layout Shift (CLS) during page bootstrap.
2. **API Query Failure State**:
   * Mounts a full-bleed rose warning card highlighting connection details and displaying an active **Retry** button targeting `refetch()`.
3. **Operational Terminal State Gating**:
   * When `bookingStatus === 'completed'` or `'cancelled'`, the sidebar panels disable operational transition buttons and mount a persistent informative banner explaining that the transaction is locked in a terminal archive state.
