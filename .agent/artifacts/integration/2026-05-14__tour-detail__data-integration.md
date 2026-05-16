# Data Integration Plan: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-14
- **API Contract:** `.agent/artifacts/api-contracts/2026-05-14__tour-detail__api-contract.md`
- **UI Spec:** `.agent/artifacts/ui-specs/2026-05-14__tour-detail__ui-spec.md`

## 1. Data Sources Breakdown

| Source | Hook | Purpose | Dependency |
|---|---|---|---|
| `GET /admin/tours/:id` | `useTourDetailQuery(id)` | Lấy thông tin cơ bản tour, gallery, mô tả. | Khởi chạy ngay khi có `id`. |
| `GET /admin/tour-schedules` | `useTourDetailSchedules(id)` | Lấy danh sách lịch khởi hành (limit 25). | Phụ thuộc `id`. |
| `GET /tours/:id/ratings` | `useTourRatings(id)` | (New) Lấy danh sách đánh giá. | Phụ thuộc `id`. |
| `GET /tours/:id/rating-stats` | `useTourRatingStats(id)` | (New) Lấy thống kê sao (5/4/3/2/1). | Phụ thuộc `id`. |

## 2. Query Strategy

### Hierarchical Query Keys
Bám theo convention hiện tại của repo:
- `tourKeys.detail(id)`: `['tours', 'detail', id]`
- `scheduleKeys.list({ tour_id: id, ... })`: `['schedules', 'list', { tour_id: id, ... }]`
- `ratingKeys.detail(id)`: `['ratings', 'tour', id]`

### Configuration
- **StaleTime:** 5 minutes (`5 * 60 * 1000`) cho dữ liệu tour và ratings.
- **Enabled Condition:** Tất cả các sub-queries chỉ chạy khi `!!id`.
- **Placeholder Data:** Sử dụng `keepPreviousData: true` (hoặc `placeholderData`) khi chuyển trang ratings (nếu có phân trang).

## 3. Mutation Strategy

| Action | Hook | Invalidation Strategy | Feedback |
|---|---|---|---|
| Toggle Status | `statusMutation` | Invalidate `tourKeys.all`. | Toast Success/Error. |
| Toggle Featured | `featuredMutation` | Invalidate `tourKeys.all`. | Toast Success/Error. |
| Toggle Hot | `hotMutation` | Invalidate `tourKeys.all`. | Toast Success/Error. |
| Delete Tour | `deleteMutation` | Invalidate `tourKeys.all` + Redirect to `/admin/tours`. | Toast Success + Redirect. |
| Delete Schedule | `deleteSchedule` | Invalidate `['schedules']` + `tourKeys.detail(id)`. | Toast Success. |

## 4. UI State Handling (Per Section)

| UI Section | Loading State | Empty State | Error State |
|---|---|---|---|
| **Header** | `Skeleton` title & breadcrumbs | N/A | Inline error với nút "Thử lại" |
| **Gallery** | `Skeleton` rect (320px) | Placeholder image | N/A |
| **Info / Price** | `Skeleton` lines | N/A | N/A |
| **Schedules** | `TableSkeleton` (5 rows) | Component `EmptyState` | "Lỗi khi tải lịch khởi hành" |
| **Reviews** | `Skeleton` cards | "Chưa có đánh giá nào" | N/A |

## 5. Implementation Steps

### Step 1: Hooks Preparation
- Bổ sung `useTourRatings` và `useTourRatingStats` vào file hook mới `src/hooks/useTourDetailQueries.ts`.
- Re-use `useTourDetailQuery` từ `src/hooks/useTourQueries.ts`.
- Re-use `useTourEditDepartureSchedules` (hoặc tạo mới `useTourDetailSchedules`) từ `src/hooks/useScheduleQueries.ts`.

### Step 2: Page Integration
- Tại `TourDetail/index.tsx`, gọi 4 query hooks song song.
- Truyền `data` và `isLoading` xuống các components: `TourDetailHeader`, `TourGallery`, `TourInfoSection`, `TourScheduleTable`.

### Step 3: Mutation Wiring
- Kết nối các nút bấm tại `TourQuickSettings` và `TourQuickActions` (Sidebar) với mutation hooks.
- Đảm bảo có `ConfirmDialog` trước khi thực hiện `deleteTour` hoặc `deleteSchedule`.

## 6. Files Expected to Change

| File | Action | Reason |
|---|---|---|
| `src/hooks/useTourDetailQueries.ts` | New | Gộp các queries cần thiết cho màn hình detail. |
| `src/pages/Tours/TourDetail/index.tsx` | Edit | Wire data hooks và truyền props. |
| `src/pages/Tours/TourDetail/components/*` | Edit | Tiếp nhận props `data` và render UI thật thay vì placeholder. |
