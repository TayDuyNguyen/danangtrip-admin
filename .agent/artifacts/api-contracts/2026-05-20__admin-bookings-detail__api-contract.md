# API Contract: Chi tiết Đơn hàng (Booking Detail)

> Feature slug: `admin-bookings-detail`
> Date: 2026-05-20
> Backend base: `/api/v1`

---

## 1) Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/admin/bookings/{id}` | jwt.auth + role:admin/staff | Lấy thông tin chi tiết đơn hàng (kèm user, items.tour, items.tourSchedule) |
| `PATCH` | `/admin/bookings/{id}/status` | jwt.auth + role:admin/staff | Cập nhật trạng thái đơn hàng (xác nhận, hủy kèm lý do, hoàn thành) |
| `GET` | `/user/bookings/{id}/invoice` | jwt.auth + role:admin/staff | Kết xuất/Tải hóa đơn đơn hàng dạng PDF/Blob |

---

## 1.1) Source References
- `api_list.md` section: `Quản lý Đơn hàng`
- `src/constants/endpoints.ts` entries:
  - `API_ENDPOINTS.BOOKINGS.LIST`
  - `API_ENDPOINTS.BOOKINGS.STATUS_COUNTS`
  - `API_ENDPOINTS.BOOKINGS.UPDATE_STATUS`
  - `API_ENDPOINTS.BOOKINGS.DETAIL` (Cần bổ sung)
  - `API_ENDPOINTS.BOOKINGS.INVOICE` (Cần bổ sung)
- Analysis file: `2026-05-20__admin-bookings-detail__screen-analysis.md`

---

## 2) Request Schemas

### Get Detail Request
- **URL Params:** `{id}` (số nguyên dương)

### Update Status Request
- **URL Params:** `{id}`
- **Body Payload (JSON):**
```ts
interface UpdateBookingStatusInput {
  booking_status: 'confirmed' | 'completed' | 'cancelled';
  cancellation_reason?: string; // Bắt buộc khi status là 'cancelled'
}
```

### Invoice Request
- **URL Params:** `{id}`
- **Response Header:** `Content-Type: application/pdf` hoặc `text/html`
- **Response Type:** `blob`

---

## 3) Response Shapes

### Detail Response (`GET /admin/bookings/{id}`)
```json
{
  "status": "success",
  "message": "Retrieve booking detail successfully",
  "data": {
    "id": 1008,
    "booking_code": "BK-1008",
    "user_id": 15,
    "customer_name": "Nguyễn Văn A",
    "customer_email": "customer@example.com",
    "customer_phone": "0901234567",
    "customer_address": "Đà Nẵng, Việt Nam",
    "customer_note": "Yêu cầu hướng dẫn viên nói tiếng Anh.",
    "total_amount": "2200000.00",
    "discount_amount": "0.00",
    "final_amount": "2200000.00",
    "deposit_amount": "0.00",
    "payment_method": "MoMo",
    "payment_status": "paid",
    "booking_status": "confirmed",
    "cancellation_reason": null,
    "booked_at": "2026-04-06T14:30:00.000000Z",
    "confirmed_at": "2026-04-06T15:00:00.000000Z",
    "cancelled_at": null,
    "completed_at": null,
    "created_at": "2026-04-06T14:30:00.000000Z",
    "updated_at": "2026-04-06T15:00:00.000000Z",
    "user": {
      "id": 15,
      "full_name": "Nguyễn Văn A",
      "email": "customer@example.com",
      "avatar": "https://example.com/avatar.jpg"
    },
    "items": [
      {
        "id": 42,
        "booking_id": 1008,
        "tour_id": 5,
        "tour_schedule_id": 88,
        "item_type": "tour",
        "item_name": "Tour du lịch Bà Nà Hills 1 Ngày",
        "travel_date": "2026-04-15",
        "quantity_adult": 2,
        "quantity_child": 1,
        "quantity_infant": 0,
        "unit_price_adult": "850000.00",
        "unit_price_child": "500000.00",
        "unit_price_infant": "0.00",
        "subtotal": "2200000.00",
        "tour": {
          "id": 5,
          "name": "Tour du lịch Bà Nà Hills 1 Ngày",
          "thumbnail": "https://example.com/banahills.jpg",
          "duration": "1 ngày",
          "slug": "tour-ba-na-hills-1-ngay"
        },
        "tour_schedule": {
          "id": 88,
          "start_date": "2026-04-15",
          "end_date": "2026-04-15",
          "departure_place": "Đà Nẵng",
          "booking_deadline": "2026-04-14",
          "status": "available"
        }
      }
    ]
  }
}
```

---

## 4) TypeScript Interfaces

### Raw shapes (Từ backend)
```ts
export interface RawBookingUser {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
}

export interface RawBookingItemTour {
    id: number;
    name: string;
    thumbnail?: string;
    duration: string;
    slug: string;
}

export interface RawBookingItemSchedule {
    id: number;
    start_date: string;
    end_date: string;
    departure_place: string;
    booking_deadline: string;
    status: string;
}

export interface RawBookingDetailItem {
    id: number;
    booking_id: number;
    tour_id: number;
    tour_schedule_id: number;
    item_type: string;
    item_name: string;
    travel_date: string;
    quantity_adult: number;
    quantity_child: number;
    quantity_infant: number;
    unit_price_adult: string | number;
    unit_price_child: string | number;
    unit_price_infant: string | number;
    subtotal: string | number;
    tour?: RawBookingItemTour;
    tour_schedule?: RawBookingItemSchedule;
}

export interface RawBookingDetail {
    id: number;
    booking_code: string;
    user_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address?: string;
    customer_note?: string;
    total_amount: string | number;
    discount_amount: string | number;
    final_amount: string | number;
    deposit_amount: string | number;
    payment_method: string;
    payment_status: PaymentStatus;
    booking_status: BookingStatus;
    cancellation_reason?: string;
    booked_at: string;
    confirmed_at?: string | null;
    cancelled_at?: string | null;
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
    user?: RawBookingUser;
    items: RawBookingDetailItem[];
}
```

### ViewModel shapes (Cho UI Frontend)
```ts
export interface BookingDetailCustomer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
    avatar?: string;
    note?: string;
}

export interface BookingDetailTourInfo {
    id: number;
    name: string;
    thumbnail?: string;
    duration: string;
    slug: string;
    category?: string;
}

export interface BookingDetailScheduleInfo {
    id: number;
    startDate: string;
    endDate: string;
    departurePlace: string;
    bookingDeadline: string;
    status: string;
}

export interface BookingDetailItem {
    id: number;
    bookingId: number;
    tourId: number;
    tourScheduleId: number;
    itemName: string;
    travelDate: string;
    quantityAdult: number;
    quantityChild: number;
    quantityInfant: number;
    unitPriceAdult: number;
    unitPriceChild: number;
    unitPriceInfant: number;
    subtotal: number;
    tour: BookingDetailTourInfo;
    tourSchedule?: BookingDetailScheduleInfo;
}

export interface BookingDetail {
    id: number;
    code: string;
    userId: number;
    customer: BookingDetailCustomer;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    depositAmount: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    cancellationReason?: string;
    bookedAt: string;
    confirmedAt?: string | null;
    cancelledAt?: string | null;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    items: BookingDetailItem[];
}
```

---

## 5) Yup Schema
Sử dụng lại schema hủy đơn hàng `cancelBookingSchema` trong `src/validations/booking.schema.ts` có sẵn:
```ts
export const cancelBookingSchema = (t: TFunction) =>
    yup.object({
        reason: yup
            .string()
            .required(t('booking:validation.reason_required'))
            .min(5, t('booking:validation.reason_min_length', { min: 5 }))
            .max(500, t('booking:validation.reason_max_length', { max: 500 })),
    });
```

---

## 6) Error Codes

| Code | Meaning | UI handling |
|------|---------|-------------|
| `422` | Lỗi validate dữ liệu truyền lên (ví dụ: lý do hủy quá ngắn) | Hiển thị thông tin lỗi trên Form/Dialog hủy đơn |
| `404` | Không tìm thấy đơn hàng | Hiển thị trang trống báo lỗi 404 kèm nút quay lại danh sách |
| `403` | Không đủ quyền xem hoặc chỉnh sửa | Hiển thị toast cảnh báo và chặn truy cập |
| `401` | Token hết hạn / Chưa đăng nhập | Tự động chuyển hướng về trang `/login` |
| `500` | Lỗi hệ thống backend | Hiển thị toast thông báo lỗi hệ thống |

---

## 7) Files Expected To Change
- `src/constants/endpoints.ts` (Thêm API path cho detail & invoice)
- `src/api/bookingApi.ts` (Thêm `getDetail` và `getInvoice` methods)
- `src/dataHelper/booking.dataHelper.ts` (Định nghĩa kiểu dữ liệu Raw và ViewModel cho chi tiết đơn hàng)
- `src/dataHelper/booking.mapper.ts` (Thêm hàm `mapBookingDetail` chuyển đổi dữ liệu từ Raw sang ViewModel sạch)
- `src/hooks/useBookingQueries.ts` (Bổ sung React Query hook `useAdminBookingDetailQuery`)
