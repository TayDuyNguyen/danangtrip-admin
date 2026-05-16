# API Contract: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-14
- **Reference:** `.agent/artifacts/analysis/2026-05-14__tour-detail__screen-analysis.md`, `api_list.md`

## 1. Source Reconciliation

- **Screen Analysis:** Yêu cầu các thông tin chi tiết tour, lịch khởi hành liên quan, và đánh giá.
- **Endpoints (từ `src/constants/endpoints.ts` và `api_list.md`):**
  - Khớp 100% đối với Tour Detail: `GET /admin/tours/:id`, `PATCH /admin/tours/:id/status`, `PATCH /admin/tours/:id/featured`, `PATCH /admin/tours/:id/hot`, `DELETE /admin/tours/:id`. Đã có sẵn trong `tourApi.ts`.
  - Khớp 100% đối với Schedules: `GET /admin/tour-schedules?tour_id=:id`, `DELETE /admin/tour-schedules/:id`. Đã có sẵn trong `scheduleApi.ts`.
  - Ratings & Rating Stats: `GET /locations/:id/ratings` đang có trong `endpoints.ts`, nhưng cần endpoint dành riêng cho Tours (`GET /tours/:id/ratings` và `GET /tours/:id/rating-stats`). Cần bổ sung vào `API_ENDPOINTS`.

## 2. API Module Contract

### Existing APIs (No changes needed)
- **`tourApi.getTour(id)`**: Lấy dữ liệu chi tiết tour (RawTour -> TourViewModel).
- **`tourApi.updateStatus(id, status)`**: Cập nhật trạng thái (`active`, `inactive`, `sold_out`).
- **`tourApi.toggleFeatured(id, is_featured)`**: Bật tắt nhãn nổi bật.
- **`tourApi.toggleHot(id, is_hot)`**: Bật tắt nhãn hot.
- **`tourApi.deleteTour(id)`**: Xóa tour.
- **`scheduleApi.getSchedules({ tour_id })`**: Lấy danh sách lịch khởi hành thuộc tour.
- **`scheduleApi.deleteSchedule(id)`**: Xóa lịch.

### Planned APIs (To be added)
Cần bổ sung `ratingApi.ts`:
- **`ratingApi.getRatingsByTour(tourId, params)`**: Trỏ tới `GET /tours/:id/ratings`
- **`ratingApi.getRatingStatsByTour(tourId)`**: Trỏ tới `GET /tours/:id/rating-stats`

## 3. Type Design & Mappers

### 3.1. Tour Types (Existing in `src/dataHelper/tour.mapper.ts`)
- **Raw Type (`RawTour`)**: Đã bám sát cấu trúc snake_case backend.
- **ViewModel (`TourViewModel`)**: Đã chuẩn hóa camelCase/safe numbers. Chứa các trường phụ trợ như `categoryName`.
- **Mapper (`tourMapper`)**: Đã cover đầy đủ xử lý an toàn (safeConverters). KHÔNG CẦN CHỈNH SỬA.

### 3.2. Schedule Types (Existing in `src/dataHelper/schedule.dataHelper.ts`)
- **Raw Type (`RawSchedule`)**: Đã map đúng cấu trúc.
- **ViewModel (`Schedule`)**: Đã có sẵn.
- **Mapper (`scheduleMapper`)**: Đã có. KHÔNG CẦN CHỈNH SỬA.

### 3.3. Rating Types (Planned)
*Note: Hệ thống chưa có type chuẩn cho Rating của Tour, cần định nghĩa để tạo hook.*

**RawRating (Backend Shape):**
```ts
export interface RawRating {
    id: number;
    tour_id: number;
    user_id: number;
    score: number;
    comment: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user?: {
        id: number;
        full_name: string;
        avatar: string | null;
    };
    images?: Array<{ id: number; url: string }>;
}
```

**RatingViewModel (UI Shape):**
```ts
export interface RatingViewModel {
    id: number;
    tourId: number;
    userId: number;
    score: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    user: {
        id: number;
        name: string;
        avatar: string;
    };
    images: string[];
}
```

**RatingStats (Backend & UI Shape):**
```ts
export interface RatingStats {
    average_score: number;
    total_reviews: number;
    distribution: {
        '5': number;
        '4': number;
        '3': number;
        '2': number;
        '1': number;
    };
}
```

## 4. Validation Contract

Đối với màn hình Chi tiết Tour, các thao tác phần lớn là hiển thị và gọi API cập nhật nhanh (Patch), hoặc Xóa (Delete). Không yêu cầu Form phức tạp, do đó không cần thêm Schema mới. Các payload truyền đi đều là primitive types (`boolean`, `string`, `number`).

**Lưu ý khi gọi API:**
- Khi gọi Xóa Tour/Lịch, cần dùng hộp thoại Confirm (không dùng form schema).
- Payload khi đổi trạng thái tour/lịch phải nằm trong enum giới hạn (`active`, `inactive`, `sold_out`).

## 5. Handoff to Implementation

**Files Expected to Change:**
1. `src/constants/endpoints.ts`:
   - Bổ sung `RATINGS_BY_TOUR: (id: string | number) => \`/tours/\${id}/ratings\``
   - Bổ sung `RATING_STATS_BY_TOUR: (id: string | number) => \`/tours/\${id}/rating-stats\``
2. `src/api/ratingApi.ts`:
   - (New File) Định nghĩa module `ratingApi` xử lý `getRatings` và `getRatingStats`.
3. `src/types/rating.ts` & `src/dataHelper/rating.mapper.ts`:
   - (New File) Định nghĩa `RawRating`, `RatingViewModel` và logic mapper `mapFromRaw`.
4. `src/hooks/useTourDetailQueries.ts`:
   - (New File) Hook gộp (hoặc gọi song song) các query: `tourApi.getTour`, `scheduleApi.getSchedules`, `ratingApi.getRatingsByTour`.

**Assumptions:**
- [ASSUMPTION]: Backend endpoint `/tours/:id/ratings` và `/tours/:id/rating-stats` đã sẵn sàng, nếu chưa có thì UI sẽ phải hiển thị UI rỗng tạm thời.
- Component UI sẽ tái sử dụng `TourViewModel` hiện tại mà không làm vỡ các module khác (VD: `TourList`).
