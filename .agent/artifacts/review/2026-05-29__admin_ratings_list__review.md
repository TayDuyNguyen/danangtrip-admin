# Review Report: Admin Ratings List

> Feature slug: `admin_ratings_list`
> Date: 2026-05-29
> Status: `READY FOR PUSH`
> Route: `/admin/ratings`

---

## 1. Objective

Xây dựng màn hình **Quản lý Đánh giá** (`/admin/ratings`) cho `danangtrip-admin`. Màn hình cho phép admin xem, duyệt, từ chối và xóa các đánh giá (ratings) của khách hàng cho cả Tour và Địa điểm. Thiết kế nhất quán với màn hình Payments List đã triển khai.

---

## 2. Delivered Scope

### Components mới

| Component | Mục đích |
|---|---|
| `src/pages/Ratings/index.tsx` | Page container — filter state, bulk select, query integration |
| `src/pages/Ratings/components/RatingTable.tsx` | Bảng hiển thị ratings: avatar, sao, comment expander, ảnh lightbox |
| `src/pages/Ratings/components/RatingFilterBar.tsx` | Filter bar 5 cột: search, loại dịch vụ, trạng thái, điểm sao |
| `src/pages/Ratings/components/RatingDeleteDialog.tsx` | Confirm dialog xóa đơn/bulk |
| `src/pages/Ratings/components/RejectRatingDialog.tsx` | Modal từ chối + nhập lý do |

### Tích hợp & Infrastructure

| File | Thay đổi |
|---|---|
| `src/dataHelper/rating.dataHelper.ts` | Types: `RatingVM`, `RatingsListFilters`, `RatingStatus` |
| `src/dataHelper/rating.mapper.ts` | Map API response → `RatingVM` |
| `src/api/ratingApi.ts` | HTTP methods: list, approve, reject, delete, bulk |
| `src/hooks/useRatingQueries.ts` | TanStack Query hooks với cache invalidation |
| `src/routes/routes.ts` | Đăng ký `ROUTES.RATINGS_LIST` |
| `src/routes/index.tsx` | Lazy load `Ratings` page |
| `src/components/layout/Sidebar.tsx` | Menu item "Đánh giá" với icon |
| `public/lang/vi/ratings.json` | Tiếng Việt đầy đủ |
| `public/lang/en/ratings.json` | Tiếng Anh đầy đủ |

### Bug fix trong Step 10

- `RatingFilterBar.tsx`: Xóa `_onExport`/`_isExporting` khỏi destructure → ESLint PASS.
- `RatingDeleteDialog.tsx`: Sửa `t('actions.deleting')` → `t('common:actions.deleting')` → không còn hiển thị raw key.

---

## 3. Pipeline Artifact Trace

| Step | Artifact | Status |
|---|---|---|
| 01 Screen Analysis | `.agent/artifacts/analysis/2026-05-29__admin_ratings_list__screen-analysis.md` | ✅ |
| 02 Project Setup | `.agent/artifacts/setup/` | ✅ |
| 03 API Contract | `.agent/artifacts/api-contracts/` | ✅ |
| 04 Layout & Routing | `.agent/artifacts/routing/` | ✅ |
| 05 UI Components | `.agent/artifacts/ui-specs/` | ✅ |
| 06 Data Integration | `.agent/artifacts/integration/` | ✅ |
| 07 Interactions | `.agent/artifacts/interaction-specs/` | ✅ |
| 08 Auth & Permissions | `.agent/artifacts/auth/` | ✅ |
| 09 Testing | `prepush:check` — lint/typecheck/build/playwright | ✅ PASS |
| 10 Deploy | `.agent/artifacts/deploy/2026-05-29__admin_ratings_list__deploy-report.md` | ✅ Written |

---

## 4. Technical Decisions

1. **Table layout thay Card layout:** Thống nhất với màn hình Payments cho UX nhất quán. Bảng cho phép bulk action dễ hơn và scan nhanh hơn trên màn hình rộng.

2. **Comment expander in-cell:** Text dài được cắt ngắn với "Xem thêm/Thu gọn" thay vì mở modal riêng — giảm số click, giữ ngữ cảnh.

3. **RejectRatingDialog tách biệt:** Lý do từ chối là thông tin quan trọng về nghiệp vụ. Tách dialog riêng giúp validate required field (lý do không được để trống) trước khi submit.

4. **Namespace i18n `common:`:** Các action chung như "Đang xóa...", "Hủy", "Xóa" đặt trong `common.json` thay vì copy sang mỗi namespace — tránh dư thừa và đảm bảo nhất quán.

---

## 5. Auth & Permissions Verification

- **Route guard:** `PrivateRoute` wraps toàn bộ admin layout — user chưa đăng nhập bị redirect về `/login`.
- **Role check:** API `GET /admin/ratings` trả 403 nếu không phải admin — UI hiển thị error state thay vì crash.
- **Không rò rỉ dữ liệu:** Không có rating data nào được cache ở localStorage hay cookie.

---

## 6. Risks & Follow-ups

- **Rủi ro:** Không phát hiện rủi ro nghiêm trọng.
- **Export chức năng:** `onExport` prop được khai báo trong interface `RatingFilterBarProps` nhưng chưa implement nút Export. Có thể thêm ở sprint sau mà không cần thay đổi interface.
- **Kế hoạch tiếp theo:** `admin_ratings_list` **COMPLETE**. Progress report admin cần update đánh dấu Done và chọn screen tiếp theo.
