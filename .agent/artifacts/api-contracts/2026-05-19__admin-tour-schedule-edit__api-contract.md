# API Contract: Chỉnh sửa lịch khởi hành

- **Feature Slug:** `admin-tour-schedule-edit`
- **Date:** 2026-05-19
- **Sources Used:**
  - `.agent/artifacts/analysis/2026-05-19__admin-tour-schedule-edit__screen-analysis.md`
  - `docs/api/api_list.md`
  - `src/constants/endpoints.ts`
  - `src/types/schedule.ts`
  - `src/dataHelper/schedule.mapper.ts`
  - `src/validations/schedule.schema.ts`
  - `src/api/scheduleApi.ts`

## 1. Source Reconciliation

Các thông tin từ Analysis, `api_list.md` và `endpoints.ts` khớp nhau.
- `GET /admin/tour-schedules/{id}`: Lấy chi tiết lịch. (Đã có trong `endpoints.ts`: `ENDPOINTS.SCHEDULES.DETAIL`)
- `PUT /admin/tour-schedules/{id}`: Cập nhật lịch. (Đã có trong `endpoints.ts`: `ENDPOINTS.SCHEDULES.UPDATE`)
- `DELETE /admin/tour-schedules/{id}`: Xóa lịch. (Đã có trong `endpoints.ts`: `ENDPOINTS.SCHEDULES.DELETE`)
- `PATCH /admin/tour-schedules/{id}/status`: Đổi trạng thái. (Đã có trong `endpoints.ts`: `ENDPOINTS.SCHEDULES.PATCH_STATUS`)

Các property "Standardization" như `departure_code`, `departure_place`, `booking_deadline` mà Analysis đề cập KHÔNG TỒN TẠI trong bảng `tour_schedules` của backend hiện tại (theo API Matrix & `schedule.mapper.ts`). Chúng ta sẽ THUẬN THEO `REPO_FACTS` và backend schema hiện tại, bỏ qua các trường không tồn tại này để tránh crash hoặc phải update backend (nằm ngoài scope hiện tại).

## 2. Type Design

Các Type trong `src/types/schedule.ts` đã được thiết kế chuẩn xác:

### Raw Type (Backend Shape)
(Được định nghĩa trong `src/dataHelper/schedule.dataHelper.ts` qua interface `RawSchedule` mà ta suy ra từ Mapper).
```typescript
interface RawSchedule {
  id: number;
  tour_id: number;
  start_date: string;
  end_date: string;
  max_people: number;
  booked_people: number;
  price_adult: number | null;
  price_child: number | null;
  price_infant: number | null;
  status: string;
  booking_availability?: string;
  tour?: {
    name?: string;
    thumbnail?: string;
    category?: { name?: string };
  };
}
```

### ViewModel Type (UI Consumable)
Đã tồn tại trong `src/types/schedule.ts`:
```typescript
export interface Schedule {
    id: number | string;
    tourId: number | string;
    tourName: string;
    tourImage: string;
    categoryName: string;
    startDate: string;
    endDate: string;
    totalSlots: number;
    bookedSlots: number;
    priceAdult: number | null;
    priceChild: number | null;
    priceInfant: number | null;
    status: ScheduleStatus;
    bookingAvailability: ScheduleBookingAvailability;
}
```

### Form Values Type
```typescript
export interface ScheduleFormValues {
    startDate: string;
    endDate: string;
    totalSlots: number;
    priceAdult: number | null;
    priceChild: number | null;
    priceInfant: number | null;
    status: string;
}
```

## 3. Validation Contract

Validation schema tại `src/validations/schedule.schema.ts` **ĐÃ HỖ TRỢ** sẵn logic cho màn Edit:
- Function: `getScheduleSchema(t: TFunction, isEdit = false, bookedSlots = 0)`
- **BR-01 (Past Date Bypass):** `is-future` bypasses check khi `isEdit === true`.
- **BR-02 (Capacity Constraint):** `min-booked` test kiểm tra `value >= bookedSlots` khi `isEdit === true` và `bookedSlots > 0`.
- Validation message sử dụng `t()` chuẩn i18n (`schedules:validation.*`).

=> **Không cần thay đổi file schema**. Code hiện tại đã bao phủ hoàn hảo hợp đồng dữ liệu cho màn edit.

## 4. API Module Contract

`src/api/scheduleApi.ts` đã khai báo đầy đủ và đúng pattern.
- `getSchedule`: `(id) => Promise<Schedule>`
- `updateSchedule`: `(id, data: Partial<Schedule>) => Promise<Schedule>`
- `deleteSchedule`: `(id) => Promise<boolean>`
- Sử dụng `axiosClient` theo pattern.

=> **Không cần thay đổi file API**.

## 5. Mapper Contract

`src/dataHelper/schedule.mapper.ts` đã ánh xạ 1-1 chính xác:
- `mapFromRaw`: chuyển từ snake_case của backend sang camelCase của `Schedule` type, tự parse an toàn các nested relations (tour info).
- `mapToRaw`: chuyển `Partial<Schedule>` thành payload API (`start_date`, `max_people`, v.v.).

=> **Không cần thay đổi file Mapper**.

## 6. Handoff To Implementation

Tất cả các foundation về Data Contract (Types, API, Validation, Mapper) ĐÃ HOÀN THIỆN và tương thích 100% với yêu cầu của màn hình Edit.

**Files to modify:** Không có. (Tất cả contract đều đã đúng theo chuẩn).
**Files to create:** Không có.

**Next step:** Chuyển thẳng tới `04-layout-routing` để setup layout cho Edit form.
