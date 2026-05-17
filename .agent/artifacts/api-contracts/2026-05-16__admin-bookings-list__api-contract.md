# API Contract: Admin Bookings List

- **Feature Slug:** `admin-bookings-list`
- **Contract Date:** 2026-05-16
- **Status:** ✅ VERIFIED
- **Sources Used:**
  - `api_list.md` (Section: BOOKINGS)
  - `src/constants/endpoints.ts`
  - `src/api/bookingApi.ts`
  - `src/dataHelper/booking.dataHelper.ts`

---

## 1. Endpoint List

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/bookings` | 🛡️ Admin | Fetch list of bookings with filtering and pagination. |
| GET | `/admin/bookings/status-counts` | 🛡️ Admin | Fetch count of bookings per status for dashboard/stats. |
| PATCH | `/admin/bookings/{id}/status` | 🛡️ Admin | Update booking status (confirm/cancel). |
| GET | `/admin/bookings/export` | 🛡️ Admin | Export filtered bookings to Excel. |

---

## 2. Models & Mapping

### Raw Models (Backend Snake Case)

```ts
// src/dataHelper/booking.dataHelper.ts
export interface AdminRawBookingItem {
    id: number;
    booking_code: string;
    booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    total_amount: number | string;
    customer_name: string;
    customer_email: string;
    customer_avatar?: string;
    tour_name: string;
    tour_thumbnail?: string;
    tour_category?: string;
    booked_at: string;
    departure_date: string;
    cancellation_reason?: string;
}
```

### ViewModels (UI Camel Case)

```ts
// src/dataHelper/booking.dataHelper.ts
export interface BookingItem {
    id: number;
    code: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    amount: number;
    customer: {
        name: string;
        email: string;
        avatar?: string;
    };
    tour: {
        name: string;
        thumbnail?: string;
        category?: string;
    };
    bookedAt: string;
    departureDate: string;
    cancellationReason?: string;
}
```

### Mapping Logic

Verified in `src/dataHelper/booking.mapper.ts`:
- Uses `toNumberSafe` for `total_amount`.
- Groups customer and tour info into objects for cleaner UI consumption.
- Maps snake_case keys to camelCase.

---

## 3. Validation Contract

A validation schema for cancellation reason is recommended for consistency:

```ts
// Proposed: src/validations/booking.schema.ts
export const cancelBookingSchema = (t: TFunction) =>
  yup.object({
    reason: yup
      .string()
      .required(t('booking:validation.reason_required'))
      .min(10, t('booking:validation.reason_min_length', { min: 10 })),
  });
```

---

## 4. API Module Contract

Verified in `src/api/bookingApi.ts`:
- `getList(params)`: Uses `axiosClient`.
- `getStatusCounts(params)`: Uses `axiosClient`.
- `updateStatus(id, data)`: Uses `PATCH` with `booking_status`.
- `export(params)`: Uses `responseType: 'blob'`.

---

## 5. Risks and Assumptions

- **[ASSUMPTION]** `PATCH /admin/bookings/{id}/status` is the standard way to confirm bookings (by passing `booking_status: 'confirmed'`).
- **[NOTE]** The `status-counts` endpoint was missing from the documentation but exists in the code and backend.

---

## 6. Files Impacted

- **[REUSE]** `src/api/bookingApi.ts`
- **[REUSE]** `src/dataHelper/booking.dataHelper.ts`
- **[REUSE]** `src/dataHelper/booking.mapper.ts`
- **[NEW]** `src/validations/booking.schema.ts` (To be added for strict validation)
