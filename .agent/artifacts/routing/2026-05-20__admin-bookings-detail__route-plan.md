# Route Plan: admin-bookings-detail
Date: 2026-05-20
Feature: admin-bookings-detail (Chi tiết Đơn hàng)

## 1. Route Configuration

The route for viewing the booking details is registered and uses the standard React Router v7 configuration. It uses a dynamic route parameter `:id` for the booking ID.

| Route Name | Constant | Path | Page Component |
|---|---|---|---|
| Booking Detail | `BOOKINGS_DETAIL` | `/admin/bookings/:id` | `src/pages/Bookings/BookingDetail/index.tsx` |

The route is fully registered under `PrivateRoute` with lazy-loading:
```tsx
const BookingDetail = React.lazy(() => import('@/pages/Bookings/BookingDetail'));

// Within router children list (MainLayout wrapper):
{ path: ROUTES.BOOKINGS_DETAIL, element: withSuspense(BookingDetail) },
```

## 2. Layout and Breadcrumbs

- **Parent Layout:** Wrapped with `MainLayout` (which renders the global left sidebar, dynamic header, and global drawer right sidebar).
- **Page Breadcrumbs Structure:**
  - `Trang chủ` (Link to `ROUTES.DASHBOARD` - `/dashboard`)
  - `Danh sách Đơn hàng` (Link to `ROUTES.BOOKINGS_LIST` - `/admin/bookings`)
  - `Chi tiết Đơn hàng #{id}` (Active page, non-link, styled with `#14b8a6`)

Breadcrumbs are dynamically rendered in the page header with standard Tailwind UI styling.

## 3. i18n Impact

The translation keys used inside the page skeleton are fully integrated and synchronized in both **Vietnamese** and **English** within the `booking` namespace:

### Translation Keys (`booking.json`)
- `detail.page_title`: Chi tiết Đơn hàng / Booking Details
- `detail.page_subtitle`: Quản lý thông tin thanh toán, lịch khởi hành và trạng thái đơn hàng. / Manage payment information, tour schedules, and booking status.
- `detail.breadcrumb_current`: Chi tiết Đơn hàng / Booking Details
- `detail.back_button`: Quay lại danh sách / Back to List
- `detail.invoice_button`: Xuất hóa đơn (PDF) / Export Invoice (PDF)
- `detail.section_customer`: Thông tin Khách hàng / Customer Information
- `detail.section_tour`: Chi tiết Tour đã đặt / Booked Tour Details
- `detail.section_payment`: Thông tin Thanh toán & Tóm tắt / Payment Info & Summary
- `detail.section_timeline`: Lịch sử Trạng thái / Status History
- `detail.section_passengers`: Số lượng Khách tham gia / Passenger Counts

## 4. Navigation & Redirects

- **On Back Button Click:** Redirects to the Bookings List screen (`/admin/bookings`).
- **On Customer/User Link (Optional Future Flow):** Deep link navigation to the customer list or specific customer profile.
- **On Invoice Download:** Will invoke `getInvoiceMutation` and download the invoice once the user clicks "Export Invoice" (currently disabled in skeleton until data is fully integrated).

## 5. Files Inspected / Verified

- `D:\DATN\danangtrip-admin\src\routes\routes.ts` (Route constants verified)
- `D:\DATN\danangtrip-admin\src\routes\index.tsx` (Route registration & code splitting verified)
- `D:\DATN\danangtrip-admin\src\layouts\MainLayout.tsx` (Layout rendering verified)
- `D:\DATN\danangtrip-admin\src\components\common\Sidebar.tsx` (Sidebar active navigation state verified)
- `D:\DATN\danangtrip-admin\public\lang\vi\booking.json` (Vietnamese locale keys verified)
- `D:\DATN\danangtrip-admin\public\lang\en\booking.json` (English locale keys verified)
