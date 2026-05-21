# UI Spec: Admin Bookings List

- **Feature Slug:** `admin-bookings-list`
- **Spec Date:** 2026-05-16
- **Status:** ✅ VERIFIED
- **Aesthetic:** Activity Stream / Timeline View

---

## 1. Component Map

| Component | Layer | Status | Reuse/New/Mod | Path |
|---|---|---|---|---|
| **BookingHeader** | Organism | ✅ | NEW | `src/pages/Bookings/BookingList/components/BookingHeader.tsx` |
| **BookingStats** | Organism | ✅ | NEW | `src/pages/Bookings/BookingList/components/BookingStats.tsx` |
| **BookingFilter** | Organism | ✅ | NEW | `src/pages/Bookings/BookingList/components/BookingFilter.tsx` |
| **BookingTimeline**| Organism | ✅ | NEW | `src/pages/Bookings/BookingList/components/BookingTimeline.tsx` |
| **BookingCard** | Molecule | ✅ | NEW | `src/pages/Bookings/BookingList/components/BookingCard.tsx` |
| **BookingStatusBadge**| Atom | ✅ | NEW | `src/pages/Bookings/BookingList/components/BookingStatusBadge.tsx` |
| **PaymentStatusBadge**| Atom | ✅ | NEW | `src/pages/Bookings/BookingList/components/PaymentStatusBadge.tsx` |
| **BookingCancelDialog**| Molecule | ✅ | NEW | `src/pages/Bookings/BookingList/components/BookingCancelDialog.tsx` |
| **Pagination** | Shared | ✅ | REUSE | `src/components/pagination/Pagination.tsx` |

---

## 2. UI States & Behaviors

### Loading State
- **Implementation:** Skeleton loaders within `BookingTimeline` and `BookingStats`.
- **Pattern:** Pulse animation with matching layout shapes.

### Empty State
- **Implementation:** Centered illustration with "ShoppingCart" icon in `BookingTimeline`.
- **Labels:** `empty.title` and `empty.subtitle` from `booking.json`.

### Error Handling
- **Implementation:** Global `axiosClient` interceptors handle errors via toast notifications.

---

## 3. Design Tokens & Consistency

- **Fonts:** `Inter` (Sans), `JetBrains Mono` (for Booking Codes).
- **Colors:**
  - Primary: `#14b8a6` (Teal)
  - Pending: `#F59E0B` (Amber)
  - Success: `#10B981` (Emerald)
  - Error/Cancel: `#EF4444` (Red)
  - Background: `#F3F2EE` (Soft Grey)
- **Rounding:** `rounded-2xl` (16px) and `rounded-3xl` (24px) for cards and modals.

---

## 4. Key Interactions

- **Timeline Vertical Line:** Continuous visual anchor for activity stream.
- **Card Hover:** Subtle scale up and border color change (`#14b8a6/30`).
- **Filter Debounce:** 300ms delay on search input to reduce API calls.
- **Status Badges:** Color-coded for rapid scanning of booking lifecycle.

---

## 5. Files Impacted

- **[NEW]** `src/pages/Bookings/BookingList/components/*.tsx`
- **[REUSE]** `src/components/ui/CustomSelect.tsx`
- **[REUSE]** `src/components/ui/TextInput.tsx`
- **[REUSE]** `src/components/pagination/Pagination.tsx`
