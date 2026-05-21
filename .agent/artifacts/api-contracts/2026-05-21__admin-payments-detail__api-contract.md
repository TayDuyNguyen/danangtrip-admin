# API Contract: Admin Payments Detail

> Feature slug: `admin-payments-detail`
> Date: 2026-05-21
> Backend base: `/api/v1`

---

## 1) Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/payments/:id` | jwt.auth + role:admin | Get payment details by payment ID |
| POST | `/admin/payments/:id/refund` | jwt.auth + role:admin | Refund a successful payment (requires refund_reason) |

---

## 1.1) Source References
- `api_list.md` section: "Payments Management" / "Admin Routes"
- `src/constants/endpoints.ts` entries:
  - `API_ENDPOINTS.PAYMENTS.DETAIL`
  - `API_ENDPOINTS.PAYMENTS.REFUND`
- Analysis file: `2026-05-21__admin-payments-detail__screen-analysis.md`

---

## 2) Request Schemas

### Detail Request
- Path parameter `id` (integer)
- No body.

### Refund Request
- Path parameter `id` (integer)
- Body:
```json
{
  "refund_reason": "Customer cancelled booking because of health problems"
}
```

---

## 3) Response Shapes

### Detail Response
```json
{
  "code": 200,
  "message": "Payment retrieved successfully",
  "data": {
    "id": 12,
    "booking_id": 8,
    "transaction_code": "PAY-A1B2C3D4E5",
    "amount": "1500000.00",
    "payment_method": "vnpay",
    "payment_status": "success",
    "refunded_at": null,
    "refund_reason": null,
    "created_at": "2026-05-20T10:00:00.000000Z",
    "updated_at": "2026-05-20T10:05:00.000000Z",
    "paid_at": "2026-05-20T10:05:00.000000Z",
    "booking": {
      "id": 8,
      "booking_code": "BK-20260520-X1Y2",
      "total_amount": "1500000.00",
      "customer_name": "Nguyen Van A",
      "customer_email": "nguyenvana@gmail.com",
      "customer_avatar": "https://example.com/avatar.jpg",
      "tour_name": "Tour Tham Quan Ba Na Hills 1 Ngay",
      "tour_thumbnail": "https://example.com/tours/banahills.jpg"
    }
  }
}
```

### Refund Response
```json
{
  "code": 200,
  "message": "Payment refunded successfully",
  "data": null
}
```

---

## 4) TypeScript Interfaces

### Raw (API shape)
Located in `src/dataHelper/payment.dataHelper.ts`:

```ts
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentGateway = 'momo' | 'vnpay' | 'zalopay';

export interface AdminRawPaymentItem {
    id: number;
    transaction_code: string;
    amount: number | string;
    payment_method: PaymentGateway;
    payment_status: PaymentStatus;
    refunded_at?: string | null;
    refund_reason?: string | null;
    created_at: string;
    updated_at: string;
    booking?: {
        id: number;
        booking_code: string;
        total_amount: number | string;
        customer_name?: string;
        customer_email?: string;
        customer_avatar?: string;
        tour_name?: string;
        tour_thumbnail?: string;
    } | null;
}
```

### ViewModel (UI shape)
Located in `src/dataHelper/payment.dataHelper.ts`:

```ts
export interface PaymentItem {
    id: number;
    bookingId?: number;
    transactionCode: string;
    bookingCode: string;
    customerName: string;
    customerEmail: string;
    customerAvatar?: string;
    amount: number;
    gateway: PaymentGateway;
    status: PaymentStatus;
    refundedAt?: string | null;
    refundReason?: string | null;
    transactionDate: string;
    tourName: string;
    tourThumbnail?: string;
}
```

---

## 5) Yup Schema

No creation/edit form schema is needed for this page because there are no forms. However, the refund action modal uses the following schema:

```ts
import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const refundSchema = (t: TFunction) =>
  yup.object({
    refundReason: yup
      .string()
      .required(t('validation.required', { field: t('payment.detail.refundReasonLabel') }))
      .min(5, t('validation.minLength', { min: 5 }))
      .max(255, t('validation.maxLength', { max: 255 })),
  });

export type RefundFormValues = yup.InferType<ReturnType<typeof refundSchema>>;
```

---

## 6) Error Codes
| Code | Meaning | UI handling |
|------|---------|-------------|
| 422 | Validation error (e.g. invalid refund reason) | Display errors inline in modal |
| 404 | Payment not found | Redirect to payment list with error message / show 404 block |
| 403 | Forbidden (non-admin attempt) | Show fallback permission screen |
| 401 | Unauthorized | Redirect to login |
| 500 | Server error | Show standard global toast message |

---

## 7) Files Expected To Change
- `src/dataHelper/payment.dataHelper.ts` (Modified - Added `bookingId?: number`)
- `src/dataHelper/payment.mapper.ts` (Modified - Mapped raw `booking.id` to `bookingId`)
