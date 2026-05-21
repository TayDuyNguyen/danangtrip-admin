# UI Specification: admin-bookings-detail
Date: 2026-05-20
Feature: admin-bookings-detail (Chi tiết Đơn hàng)

## 1. Component Mapping Matrix

We maximize visual consistency by reuse and separate our local screen sections logically.

| Component | Path | Status | Purpose | Props |
|---|---|---|---|---|
| `BookingStatusBadge` | `@/pages/Bookings/BookingList/components/BookingStatusBadge.tsx` | `[REUSE]` | Render order status colors & labels | `{ status: string }` |
| `PaymentStatusBadge` | `@/pages/Bookings/BookingList/components/PaymentStatusBadge.tsx` | `[REUSE]` | Render payment status colors & labels | `{ status: string }` |
| `BookingCancelDialog` | `@/pages/Bookings/BookingList/components/BookingCancelDialog.tsx` | `[REUSE]` | Prompt confirmation modal with cancellation reason field | `{ isOpen: boolean, onClose: () => void, onConfirm: (reason: string) => void, bookingCode: string, customerName: string, isSubmitting?: boolean }` |
| `BookingDetail` | `@/pages/Bookings/BookingDetail/index.tsx` | `[NEW]` | Main page shell, manages loading, error, success states and layout | `{}` (URL Params: `id`) |
| `VirtualTimeline` | Feature-local inside `BookingDetail/` | `[NEW]` | Custom status history timeline generated dynamically from order timestamp values | `{ bookedAt: string, confirmedAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null }` |
| `PassengerListPlaceholder` | Feature-local inside `BookingDetail/` | `[NEW]` | Renders passenger counts breakdown with an alert banner addressing API Gaps | `{ adults: number, children: number, infants: number }` |

## 2. Component Decomposition & Hierarchy

The page structure will follow a robust 2-column responsive layout:

```
+---------------------------------------------------------------------------------+
| Breadcrumbs / Header & Actions (Back / Export Invoice)                         |
+--------------------------------------------------------+------------------------+
| Left Column (65% width)                                | Right Column (35%)     |
|                                                        |                        |
|  +--------------------------------------------------+  |  +------------------+  |
|  | CustomerInfoCard                                 |  |  | PaymentSummary   |  |
|  | (Avatar, Name, Email, Phone, Address, CustomerNote)|  |  | (Subtotal, Total |  |
|  +--------------------------------------------------+  |  | Deposit, Method) |  |
|  | TourBookingCard                                  |  |  +------------------+  |
|  | (Image, Name, Category, Duration, TravelDate,    |  |  | ActionsPanel     |  |
|  |  DeparturePlace, DepartureCode, Slots)           |  |  | (Confirm, Cancel |  |
|  +--------------------------------------------------+  |  |  Complete btns)  |  |
|  | PassengerListPlaceholder                         |  |  +------------------+  |
|  | (Adults, Children, Infants counts + Alert GAP)   |  |  | VirtualTimeline  |  |
|  +--------------------------------------------------+  |  | (Status logs)    |  |
|                                                        |  +------------------+  |
+--------------------------------------------------------+------------------------+
```

## 3. UI States Matrix

- **Loading State:** An elegant grey pulse Skeleton Grid (`animate-pulse`) is built to prevent CLS. We render exact dimension placeholders matching our card elements.
- **Empty State:** A beautiful card rendering "No booking found" with a retro ShoppingCart icon and a "Back to list" button.
- **Error State:** A full-bleed alert panel indicating loading failure with an explicit "Try Again" button to retrigger query.

## 4. Visual Styles (Tailwind v4 Aesthetics)

We leverage standard visual conventions from `DESIGN.md`:
- **Card Styling:** Smooth border lines `border border-slate-100`, large rounded corners `rounded-3xl`, subtle drop-shadows `shadow-xs hover:shadow-lg transition-all`.
- **Buttons:** Bold interactive widgets (`active:scale-95 transition-all`). Teal `#14b8a6` is the primary accent hue.
- **Actions Sidebar:** The operational buttons are styled according to severity:
  - Confirm: Emerald green outlined with `border-[#10B981] hover:bg-[#10B981] hover:text-white`.
  - Cancel: Rose red outlined with `border-red-500 hover:bg-red-500 hover:text-white`.
  - Complete: Teal outlined with `border-[#14b8a6] hover:bg-[#14b8a6] hover:text-white`.

## 5. i18n & Translation Parity

Every component and label uses the `booking` translation namespace. No static text is hardcoded.

## 6. Implementation Sequence

1. Define sub-components internally or within feature folder (e.g. `VirtualTimeline`, `PassengerListPlaceholder` inside page file or adjacent files).
2. Wire core query logic and wrap the main page element with loader conditions.
3. Build action buttons with strict condition checking (BR-01).
4. Integrate cancel confirmation dialog (`BookingCancelDialog`).
5. Add i18n keys for complete bilingual Vietnamese/English alignment.
