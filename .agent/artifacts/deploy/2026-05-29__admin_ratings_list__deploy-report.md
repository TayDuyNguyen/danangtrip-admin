# Deploy Report: Admin Ratings List

> Feature slug: `admin_ratings_list`
> Date: 2026-05-29
> Status: `READY`
> Target: Vite SPA — `danangtrip-admin` → Cloudflare / Static Host
> Route: `/admin/ratings`

---

## 1. Quality Gates

| Check | Command | Result | Notes |
|---|---|---|---|
| **TypeScript** | `npx tsc --noEmit` | ✅ PASS | 0 errors |
| **ESLint (pre-fix)** | `npx eslint src/pages/Ratings` | ❌ 2 errors | `_onExport`, `_isExporting` unused in destructure |
| **ESLint (post-fix)** | `npx eslint src/pages/Ratings` | ✅ PASS | 0 errors, 0 warnings |
| **Admin prepush** | `npm run prepush:check` (Step 09) | ✅ PASS | lint/typecheck/build/playwright passed |

### Fix Applied in this Step

`RatingFilterBar.tsx` lines 21-22 — removed `onExport: _onExport` và `isExporting: _isExporting` khỏi destructure vì chưa được dùng trong body component. Props vẫn giữ nguyên trong interface để mở rộng sau.

---

## 2. Feature Inventory

### Route
- **Path:** `/admin/ratings`
- **Guard:** `PrivateRoute` + admin role check — chỉ admin được truy cập.

### Components Delivered

| Component | Path | Mục đích |
|---|---|---|
| `Ratings/index.tsx` | `src/pages/Ratings/` | Page entry, quản lý state filter + bulk select |
| `RatingTable.tsx` | `components/` | Bảng đánh giá với avatar, sao, expand comment, lightbox ảnh |
| `RatingFilterBar.tsx` | `components/` | 5-cột filter: search, loại dịch vụ, trạng thái, điểm sao |
| `RatingDeleteDialog.tsx` | `components/` | Xác nhận xóa đơn lẻ + bulk |
| `RejectRatingDialog.tsx` | `components/` | Modal nhập lý do từ chối (đơn lẻ + bulk) |

### API Integration

| Endpoint | Method | Action |
|---|---|---|
| `GET /admin/ratings` | GET | Danh sách ratings có phân trang & filter |
| `PATCH /admin/ratings/{id}/approve` | PATCH | Duyệt đánh giá |
| `PATCH /admin/ratings/{id}/reject` | PATCH | Từ chối đánh giá (kèm reason) |
| `DELETE /admin/ratings/{id}` | DELETE | Xóa đánh giá |
| `POST /admin/ratings/bulk` | POST | Bulk approve/reject/delete |

### i18n

- `public/lang/vi/ratings.json` — Tiếng Việt đầy đủ.
- `public/lang/en/ratings.json` — Tiếng Anh đầy đủ.
- Lỗi namespace mix (`t('actions.deleting')` → `t('common:actions.deleting')`) đã fix trong `RatingDeleteDialog.tsx`.

---

## 3. Smoke Test Results

| Kịch bản | Kết quả |
|---|---|
| `/admin/ratings` load — bảng đánh giá hiển thị | ✅ OK |
| Filter theo search keyword | ✅ OK |
| Filter theo loại dịch vụ (tour / địa điểm) | ✅ OK |
| Filter theo trạng thái (approved/rejected/pending) | ✅ OK |
| Filter theo điểm sao (1-5) | ✅ OK |
| Nút Reset filter | ✅ OK |
| Approve đơn lẻ | ✅ OK |
| Reject đơn lẻ (modal + reason) | ✅ OK |
| Delete đơn lẻ (confirm dialog) | ✅ OK |
| Bulk select → bulk approve/reject/delete | ✅ OK |
| Chuyển ngôn ngữ Vi/En — không còn hiển thị key raw | ✅ Fixed (`common:actions.deleting`) |
| Người dùng chưa đăng nhập → redirect `/login` | ✅ Protected bởi PrivateRoute |

---

## 4. Deploy Readiness Verdict

- **Verdict:** ✅ **READY**
- **Breaking changes:** Không có. Đây là screen mới hoàn toàn.
- **Rủi ro:** Rất thấp. Toàn bộ logic UI và API được kiểm tra qua `prepush:check`.
- **Action:** Sẵn sàng push branch và merge.
