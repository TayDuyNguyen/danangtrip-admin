# API Contract: Tạo / Sửa lịch khởi hành

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Backend base: `/api/v1`

---

## 1) Endpoints

Hệ thống quản lý lịch khởi hành (`Tour Schedules`) giao tiếp trực tiếp với backend Laravel thông qua 5 endpoints cốt lõi sau:

| Method | Path | Auth | Description | API Status |
|:---|:---|:---|:---|:---|
| **GET** | `/admin/tour-schedules` | 🛡️ jwt.auth + role:admin,staff | Lấy danh sách lịch trình kèm bộ lọc và phân trang | **OK** |
| **GET** | `/admin/tour-schedules/:id` | 🛡️ jwt.auth + role:admin,staff | Lấy thông tin chi tiết của một lịch trình cụ thể | **OK** |
| **POST** | `/admin/tours/:tourId/schedules` | 🛡️ jwt.auth + role:admin,staff | Tạo lịch trình khởi hành mới cho một Tour chỉ định | **OK** |
| **PUT** | `/admin/tour-schedules/:id` | 🛡️ jwt.auth + role:admin,staff | Cập nhật thông tin chi tiết một lịch trình | **OK** |
| **DELETE** | `/admin/tour-schedules/:id` | 🛡️ jwt.auth + role:admin | Xóa lịch trình (Chỉ được phép nếu chưa có ai đặt) | **OK** |
| **PATCH** | `/admin/tour-schedules/:id/status` | 🛡️ jwt.auth + role:admin,staff | Thay đổi nhanh trạng thái lịch trình (Available / Cancelled) | **OK** |

---

## 1.1) Source References

- **Đặc tả API gốc**: [api_list.md](file:///D:/DATN/DATN_Tài%20liệu/docs/api/api_list.md)
- **Tập hợp Endpoints**: [endpoints.ts](file:///d:/DATN/danangtrip-admin/src/constants/endpoints.ts) (dòng 72 - 80)
- **Ma trận Endpoint**: [API_ENDPOINT_MATRIX.md](file:///d:/DATN/danangtrip-admin/API_ENDPOINT_MATRIX.md) (dòng 65 - 75)
- **Bản phân tích nghiệp vụ**: [2026-05-18__admin-tour-schedule-form__screen-analysis.md](file:///d:/DATN/danangtrip-admin/.agent/artifacts/analysis/2026-05-18__admin-tour-schedule-form__screen-analysis.md)

---

## 2) Request Schemas

### 2.1) List Params (`ScheduleFilters`)
Sử dụng khi nhân viên tìm kiếm hoặc lọc danh sách lịch trình tại trang quản lý tổng.
```ts
export interface ScheduleFilters {
    q?: string;               // Tìm kiếm theo tên tour hoặc mã tour
    tour_id?: string | number;// Lọc theo Tour cụ thể
    status?: string;          // Lọc trạng thái hoạt động: AVAILABLE | CANCELLED
    start_date?: string;      // Lọc lịch bắt đầu từ ngày (YYYY-MM-DD)
    end_date?: string;        // Lọc lịch kết thúc đến ngày (YYYY-MM-DD)
    page?: number;            // Trang hiện tại
    limit?: number;           // Số bản ghi trên 1 trang
    sort?: string;            // Trường sắp xếp (ví dụ: 'start_date')
    order?: 'asc' | 'desc';   // Hướng sắp xếp
}
```

### 2.2) Create Input (`CreateSchedulePayload`)
Payload gửi lên backend khi submit form **Tạo mới** lịch trình.
*Lưu ý: Endpoint `POST /admin/tours/:tourId/schedules` nhận tourId từ URL parameter.*
```json
{
  "start_date": "2026-06-01",
  "end_date": "2026-06-03",
  "max_people": 20,
  "status": "available",
  "price_adult": 950000.00,
  "price_child": 500000.00,
  "price_infant": 100000.00
}
```

### 2.3) Update Input (`UpdateSchedulePayload`)
Payload gửi lên khi sửa lịch trình. Cho phép sửa tất cả các trường trên form hoặc cập nhật một phần.
```json
{
  "start_date": "2026-06-01",
  "end_date": "2026-06-03",
  "max_people": 25,
  "status": "available",
  "price_adult": null,
  "price_child": null,
  "price_infant": null
}
```
*Lưu ý: Giá trị `null` được gửi lên đại diện cho việc xóa giá riêng (override price) để quay về sử dụng giá mặc định của Tour gốc.*

---

## 3) Response Shapes

### 3.1) Detail Response (`ApiDetailResponse<RawSchedule>`)
Định dạng trả về từ API `GET /admin/tour-schedules/:id` hoặc sau khi `POST` / `PUT` thành công.
```json
{
  "status": "success",
  "message": "Retrieve schedule details successfully",
  "data": {
    "id": 14,
    "tour_id": 5,
    "start_date": "2026-06-15",
    "end_date": "2026-06-15",
    "max_people": 30,
    "booked_people": 12,
    "price_adult": "900000.00",
    "price_child": "500000.00",
    "price_infant": null,
    "status": "available",
    "booking_availability": "open",
    "created_at": "2026-05-18T10:00:00.000000Z",
    "updated_at": "2026-05-18T11:30:00.000000Z",
    "tour": {
      "id": 5,
      "name": "Bà Nà Hills - Cầu Vàng 1 Ngày",
      "thumbnail": "/uploads/tours/ba-na-hills.jpg",
      "category": {
        "id": 2,
        "name": "Tham quan"
      }
    }
  }
}
```

---

## 4) TypeScript Interfaces

Để duy trì tính nhất quán tuyệt đối, chúng ta phân tách rõ cấu trúc Dữ liệu gốc từ API (`Raw`) và Dữ liệu phục vụ hiển thị/xử lý tại Client (`ViewModel`).

### 4.1) Raw Interface (Bám sát Backend Shape)
Định nghĩa tại `src/dataHelper/schedule.dataHelper.ts`:
```ts
export interface RawScheduleTour {
    id: number;
    name?: string;
    thumbnail?: string | null;
    category?: { id: number; name: string; slug?: string } | null;
}

export interface RawSchedule {
    id: number | string;
    tour_id: number | string;
    start_date: string;
    end_date: string;
    max_people: number | string;
    booked_people: number | string;
    price_adult?: string | number | null;
    price_child?: string | number | null;
    price_infant?: string | number | null;
    status: string;
    booking_availability?: string;
    tour?: RawScheduleTour | null;
    created_at?: string;
    updated_at?: string;
}
```

### 4.2) ViewModel Interface (UI Shape sạch sẽ)
Định nghĩa tại `src/types/schedule.ts`:
```ts
export const ScheduleStatus = {
    AVAILABLE: 'AVAILABLE',
    CANCELLED: 'CANCELLED',
} as const;

export type ScheduleStatus = (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

export const ScheduleBookingAvailability = {
    OPEN: 'OPEN',
    SOLD_OUT: 'SOLD_OUT',
} as const;

export type ScheduleBookingAvailability =
    (typeof ScheduleBookingAvailability)[keyof typeof ScheduleBookingAvailability];

export interface Schedule {
    id: number | string;
    tourId: number | string;
    tourName: string;
    tourImage: string;
    categoryName: string;
    startDate: string;         // Định dạng sạch YYYY-MM-DD
    endDate: string;           // Định dạng sạch YYYY-MM-DD
    totalSlots: number;        // Map từ max_people
    bookedSlots: number;       // Map từ booked_people
    remainingSlots: number;    // Thuộc tính tính toán ảo: totalSlots - bookedSlots
    priceAdult: number | null; // null đại diện hiển thị "Theo giá tour"
    priceChild: number | null;
    priceInfant: number | null;
    status: ScheduleStatus;
    bookingAvailability: ScheduleBookingAvailability;
    
    // --- Các trường nghiệp vụ chuẩn hóa (Standardization Focus) ---
    departureCode: string;     // Virtual: mã lịch (Ví dụ: "DEP-14" hoặc "BNH-20260615")
    departurePlace: string;    // Virtual: nơi đi (Thừa kế mặc định từ Tour meeting_point hoặc "Đà Nẵng")
    bookingDeadline: string;   // Virtual: hạn chót đặt (Tính toán thời gian trước khi khởi hành)
    createdAt?: string;
    updatedAt?: string;
}
```

---

## 4.3) Data Mapper (Sanitization & Mapping)

Lớp ánh xạ `scheduleMapper` (tại `src/dataHelper/schedule.mapper.ts`) thực thi chuyển dịch và chuẩn hóa an toàn:

```ts
import type { Schedule, ScheduleBookingAvailability, ScheduleStatus } from '@/types/schedule';
import type { RawSchedule } from './schedule.dataHelper';
import { toNumberSafe } from '@/utils/safeConverters';

export const scheduleMapper = {
    mapFromRaw: (raw: RawSchedule): Schedule => {
        const checkOverride = (val: string | number | null | undefined) =>
            val !== null && val !== undefined && String(val).trim() !== '';

        const total = toNumberSafe(raw.max_people, 0);
        const booked = toNumberSafe(raw.booked_people, 0);

        return {
            id: raw.id,
            tourId: raw.tour_id,
            tourName: raw.tour?.name?.trim() ?? '',
            tourImage: raw.tour?.thumbnail?.trim() ?? '',
            categoryName: raw.tour?.category?.name?.trim() ?? '',
            startDate: String(raw.start_date).split('T')[0],
            endDate: String(raw.end_date).split('T')[0],
            totalSlots: total,
            bookedSlots: booked,
            remainingSlots: Math.max(0, total - booked), // EC-04 safe check
            priceAdult: checkOverride(raw.price_adult) ? toNumberSafe(raw.price_adult, 0) : null,
            priceChild: checkOverride(raw.price_child) ? toNumberSafe(raw.price_child, 0) : null,
            priceInfant: checkOverride(raw.price_infant) ? toNumberSafe(raw.price_infant, 0) : null,
            status: raw.status?.toLowerCase() === 'cancelled' ? 'CANCELLED' : 'AVAILABLE',
            bookingAvailability: (raw.booking_availability?.toLowerCase() === 'sold_out' || raw.status?.toLowerCase() === 'full' || booked >= total) 
                ? 'SOLD_OUT' 
                : 'OPEN',
            
            // --- Xử lý chuẩn hóa nghiệp vụ ---
            departureCode: `DEP-${raw.id}`,
            departurePlace: 'Đà Nẵng', // Sẽ được binding động từ tour.meeting_point trong UI
            bookingDeadline: String(raw.start_date).split('T')[0],
            createdAt: raw.created_at,
            updatedAt: raw.updated_at
        };
    },

    mapToRaw: (data: Partial<Schedule>): Record<string, unknown> => {
        const out: Record<string, unknown> = {};
        if (data.startDate !== undefined) out.start_date = data.startDate;
        if (data.endDate !== undefined) out.end_date = data.endDate;
        if (data.totalSlots !== undefined) out.max_people = data.totalSlots;
        if (data.priceAdult !== undefined) out.price_adult = data.priceAdult;
        if (data.priceChild !== undefined) out.price_child = data.priceChild;
        if (data.priceInfant !== undefined) out.price_infant = data.priceInfant;
        if (data.status !== undefined) out.status = String(data.status).toLowerCase();
        return out;
    }
};
```

---

## 5) Yup Validation Schema

Định nghĩa tại `src/validations/schedule.schema.ts`.
Để đảm bảo form chỉnh sửa không bị chặn lỗi khi sửa các lịch cũ trong quá khứ (`BR-04`), schema nhận thêm cờ `isEdit` và số ghế đã đặt hiện tại (`bookedSlots` - phục vụ kiểm tra giới hạn `BR-03`).

```ts
import * as Yup from 'yup';
import type { TFunction } from 'i18next';

export const getScheduleSchema = (t: TFunction, isEdit = false, bookedSlots = 0) => {
    return Yup.object().shape({
        startDate: Yup.string()
            .required(t('validation:common.required', { field: t('schedules:fields.start_date') }))
            .test('is-future', t('schedules:validation.start_date_future'), (value) => {
                if (!value) return false;
                if (isEdit) return true; // BR-04: Bỏ qua kiểm tra ngày tương lai khi chỉnh sửa lịch cũ
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const start = new Date(value);
                return start >= today;
            }),
        endDate: Yup.string()
            .required(t('validation:common.required', { field: t('schedules:fields.end_date') }))
            .test('is-after-start', t('schedules:validation.end_date_after'), function (value) {
                const { startDate } = this.parent;
                if (!value || !startDate) return true;
                return new Date(value) >= new Date(startDate); // BR-01
            }),
        totalSlots: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .required(t('validation:common.required', { field: t('schedules:fields.max_people') }))
            .min(1, t('validation:common.min_number', { field: t('schedules:fields.max_people'), min: 1 }))
            .test('is-greater-than-booked', t('schedules:validation.total_slots_min_booked', { booked: bookedSlots }), (value) => {
                if (value === undefined) return false;
                if (!isEdit) return value >= 1;
                return value >= bookedSlots; // BR-03: Không cho sửa tổng chỗ nhỏ hơn số chỗ khách đã đặt
            }),
        priceAdult: Yup.number()
            .transform((value) => (value === '' || isNaN(value) ? null : value))
            .nullable()
            .min(0, t('validation:common.min_number', { field: t('schedules:fields.price_adult'), min: 0 })), // BR-02
        priceChild: Yup.number()
            .transform((value) => (value === '' || isNaN(value) ? null : value))
            .nullable()
            .min(0, t('validation:common.min_number', { field: t('schedules:fields.price_child'), min: 0 })),
        priceInfant: Yup.number()
            .transform((value) => (value === '' || isNaN(value) ? null : value))
            .nullable()
            .min(0, t('validation:common.min_number', { field: t('schedules:fields.price_infant'), min: 0 })),
        status: Yup.string().required(t('validation:common.required', { field: t('schedules:fields.status') })),
    });
};

export type ScheduleFormValues = Yup.InferType<ReturnType<typeof getScheduleSchema>>;
```

---

## 6) Error Codes & Client Handling

Bản đồ mã lỗi trả về từ API Gateway của backend Laravel được cấu hình phản hồi trực quan tại client:

| HTTP Status | Error Code / Payload | Client UI Handling Behavior |
|:---|:---|:---|
| **401** | `{"message": "Unauthenticated"}` | Điều hướng ngay về `/login` qua Axios Interceptor và hiển thị toast cảnh báo phiên làm việc hết hạn. |
| **403** | `{"message": "This action is unauthorized"}` | Vô hiệu hóa tính năng sửa/xóa, hiển thị cảnh báo đỏ `"Bạn không có quyền thực hiện thao tác này"`. |
| **404** | `{"message": "Tour schedule not found"}` | Chuyển hướng người dùng về trang danh sách tour `/admin/tours`, hiển thị toast lỗi `"Không tìm thấy lịch trình cần chỉnh sửa"`. |
| **422** | `{"errors": {"max_people": ["Cannot be less than booked slots"]}}` | Khớp trực tiếp mảng lỗi `errors` vào form qua hàm `setError()` của `react-hook-form` để bôi đỏ trường nhập liệu và hiển thị text chi tiết. |
| **500** | `{"message": "Server Error"}` | Hiển thị Toast lớn góc màn hình: `"Lỗi hệ thống. Vui lòng liên hệ quản trị viên."` |

---

## 7) Files Expected To Change

Trong quá trình thực hiện bước phát triển tiếp theo, các file sau đây sẽ được chỉnh sửa hoặc bổ sung để áp dụng API Contract thống nhất này:

1. **`src/types/schedule.ts`**  
   *Nhiệm vụ*: Cập nhật kiểu dữ liệu `Schedule` hỗ trợ các trường ảo nghiệp vụ (`departureCode`, `departurePlace`, `bookingDeadline`).
2. **`src/validations/schedule.schema.ts`**  
   *Nhiệm vụ*: Bổ sung tham số đầu vào `isEdit` và `bookedSlots` cho `getScheduleSchema`, hoàn thiện hai kiểm tra nghiệp vụ động (`BR-03`, `BR-04`).
3. **`src/dataHelper/schedule.mapper.ts`**  
   *Nhiệm vụ*: Đồng bộ lớp Mapper xử lý dữ liệu ảo an toàn và chuẩn hóa `remainingSlots` để hiển thị trên UI.
4. **`src/pages/Tours/TourScheduleEdit/index.tsx`**  
   *Nhiệm vụ*: Tích hợp logic validation mới với cờ `isEdit: true` và kết nối API chi tiết/cập nhật thông qua React Query Hooks.
