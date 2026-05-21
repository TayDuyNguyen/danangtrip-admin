# Screen Analysis - Admin Payments Detail (`admin-payments-detail`)

- **Feature Slug**: `admin-payments-detail`
- **Screen Name**: Chi tiết giao dịch (Payment Detail)
- **Target Route**: `/admin/payments/:id`
- **Date**: 2026-05-21
- **Sources Used**:
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_payments_detail.md` (Requirements)
  - `D:\DATN\danangtrip-admin\src\pages\Payments\PaymentList\index.tsx` (Reference List Screen)
  - `D:\DATN\danangtrip-admin\src\pages\Bookings\BookingDetail\index.tsx` (Reference Detail Screen)
  - `D:\DATN\danangtrip-api\app\Models\Payment.php` (Database Schema)

---

## 1. Summary And Scope

This screen is an authenticated administrative page allowing system operators and admins to view detailed payment transaction logs, cross-examine booking references, view transaction milestones, and perform refund requests if a customer cancels a tour or experiences payment issues.

- **Main Actor**: System Admin (authorized to view and refund), Staff (authorized to view only).
- **Scope Lock**: Only implement the transaction detail view and links to corresponding bookings. Do not create unrelated settings, user views, or report interfaces.

---

## 2. Design And Token Audit

Following [DESIGN.md](file:///D:/DATN/danangtrip-admin/DESIGN.md) and Tailwind CSS v4 patterns present in the codebase:
- **Surface**: Pure white cards (`bg-white`) with thin slate borders (`border-slate-100`) and slight shadow elevations (`shadow-xs` / `hover:shadow-md`) to ensure consistency with the booking detail interface.
- **Color Accent**: Teal/Emerald (`#14B8A6`) for success indicators, Slate (`#64748B`) for secondary text, and Amber/Rose for alerts/refund states.
- **Typography**: Inter/sans font stack with heavy font-weights (`font-black` / `font-bold`) for headers and numeric data.
- **Rounded Corners**: 3XL border radius (`rounded-3xl`) for cards and 2XL (`rounded-2xl`) for smaller elements.

---

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `PaymentDetailPageShell` | `[NEW]` | Organism | `src/pages/Payments/PaymentDetail/index.tsx` | Main structure of the payment detail screen, including sidebar actions. |
| `PaymentGatewayBadge` | `[REUSE]` | Atom | `src/pages/Payments/PaymentList/components/PaymentGatewayBadge.tsx` | Displays MOMO, VNPAY, or ZALOPAY logos/styling. |
| `PaymentStatusBadge` | `[REUSE]` | Atom | `src/pages/Payments/PaymentList/components/PaymentStatusBadge.tsx` | Displays badges for success, pending, failed, or refunded. |
| `RefundPaymentDialog` | `[REUSE]` | Organism | `src/pages/Payments/PaymentList/components/RefundPaymentDialog.tsx` | Reuses the existing modal structure for submitting a refund reason. |
| `PaymentTable` | `[MOD]` | Organism | `src/pages/Payments/PaymentList/components/PaymentTable.tsx` | Add link navigation from table rows to the detail screen and correct booking path parameters. |

---

## 4. Responsive And UI States

### Layout Breakpoints
- **Desktop (>= 1024px)**: Two-column grid. Left/main column displays Payment Details, Booking Linkage, and Virtual Timeline. Right sidebar column hosts operational actions (Refund Payment status check).
- **Mobile/Tablet (< 1024px)**: Single column stacked. The Action panel moves to the top or below the payment details card.

### UI States

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| **Page Wrapper** | Large spinner screen overlay. | "Không tìm thấy giao dịch" text. | Error panel with a "Go Back" button. | Renders full details page. |
| **Payment Cards** | Skeletons simulating fields. | N/A | N/A | Displays gateway details & transaction codes. |
| **Refund Dialog** | Loading spinner in submit button. | N/A | Renders validation error below textarea. | Shows success toast, closes dialog, invalidates query. |

---

## 5. Data And API Mapping

| Field | Type | Required | Validation | Source Endpoint / Field |
|---|---|---|---|---|
| `id` | `number` | Yes | — | `GET /admin/payments/{id}` -> `data.id` |
| `transactionCode` | `string` | Yes | — | `GET /admin/payments/{id}` -> `data.transaction_code` |
| `amount` | `number` | Yes | — | `GET /admin/payments/{id}` -> `data.amount` (Decimal cast to float) |
| `gateway` | `string` | Yes | MOMO/VNPAY/ZALOPAY | `GET /admin/payments/{id}` -> `data.payment_method` |
| `status` | `string` | Yes | pending/success/failed/refunded | `GET /admin/payments/{id}` -> `data.payment_status` |
| `refundedAt` | `string` (ISO) | No | — | `GET /admin/payments/{id}` -> `data.refunded_at` |
| `refundReason` | `string` | No | — | `GET /admin/payments/{id}` -> `data.refund_reason` |
| `transactionDate` | `string` (ISO) | Yes | — | `GET /admin/payments/{id}` -> `data.created_at` |
| `bookingCode` | `string` | No | — | `GET /admin/payments/{id}` -> `data.booking.booking_code` |
| `bookingId` | `number` | No | — | `GET /admin/payments/{id}` -> `data.booking.id` |
| `customerName` | `string` | No | — | `GET /admin/payments/{id}` -> `data.booking.customer_name` |
| `customerEmail` | `string` | No | — | `GET /admin/payments/{id}` -> `data.booking.customer_email` |
| `customerAvatar` | `string` | No | — | `GET /admin/payments/{id}` -> `data.booking.customer_avatar` |
| `tourName` | `string` | No | — | `GET /admin/payments/{id}` -> `data.booking.tour_name` |
| `tourThumbnail` | `string` | No | — | `GET /admin/payments/{id}` -> `data.booking.tour_thumbnail` |

---

## 6. Business Rules And Edge Cases

- **BR-01 (Refund Privileges)**: Only users with the role `admin` are authorized to perform a refund transaction. Staff roles will see the Refund button disabled with a tooltip explaining their authorization limit.
- **BR-02 (Refund Gating)**: The refund action is only allowed if `payment_status` equals `success` (Paid). If the transaction is already `refunded`, `failed`, or still `pending`, the refund action must be completely disabled.
- **BR-03 (Virtual Timeline Construction)**:
  - If status is `pending`: Show "Created at" milestone.
  - If status is `success` or `failed`: Show "Created at" and "Settled at" (using `updated_at` or `paid_at`).
  - If status is `refunded`: Show "Created at", "Settled at", and "Refunded at" milestones.

- **EC-01 (Orphan Transaction)**: If the backend returns a payment without a linked `booking`, hide the booking card gracefully and display a warning banner stating "Giao dịch không đính kèm thông tin đơn hàng".

---

## 7. Handoff To Next Steps

### Expected File Changes:
- `D:\DATN\danangtrip-admin\src\dataHelper\payment.dataHelper.ts` (Add `bookingId` to `PaymentItem`)
- `D:\DATN\danangtrip-admin\src\dataHelper\payment.mapper.ts` (Map `bookingId`)
- `D:\DATN\danangtrip-admin\src\routes\routes.ts` (Add `PAYMENTS_DETAIL`)
- `D:\DATN\danangtrip-admin\src\routes\index.tsx` (Lazy load and register route)
- `D:\DATN\danangtrip-admin\src\pages\Payments\PaymentList\components\PaymentTable.tsx` (Add detail links and fix booking routes)
- `D:\DATN\danangtrip-admin\public\lang/vi/payment.json` & `public/lang/en/payment.json` (i18n entries)

### New Files:
- `D:\DATN\danangtrip-admin\src\pages\Payments\PaymentDetail\index.tsx`
