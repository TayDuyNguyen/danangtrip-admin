# UI Spec: Chỉnh sửa lịch khởi hành

- **Feature Slug:** `admin-tour-schedule-edit`
- **Date:** 2026-05-19
- **Sources Used:**
  - `.agent/artifacts/analysis/2026-05-19__admin-tour-schedule-edit__screen-analysis.md`
  - `src/pages/Tours/TourScheduleEdit/index.tsx`
  - `src/pages/Tours/TourSchedules/components/ScheduleDeleteDialog.tsx`
  - `DESIGN.md`

## 1. Reuse / New / Mod Component Matrix

| Component | Layer | Status | Target Path | Reason / Notes |
|---|---|---|---|---|
| `ScheduleForm` | Organism | `[REUSE]` | `../TourScheduleCreate/components/ScheduleForm` | Tái sử dụng nguyên form từ màn tạo, React Hook Form lo liệu init state. |
| `SchedulePreviewBox` | Molecule | `[REUSE]` | `../TourScheduleCreate/components/SchedulePreviewBox` | Tái sử dụng box xem trước, nó tự listen changes từ form. |
| `TourInfoBox` | Molecule | `[REUSE]` | `../TourScheduleCreate/components/TourInfoBox` | Dùng lại phần hiển thị tên Tour và Ảnh ở trên header. |
| `ScheduleDeleteDialog` | Molecule | `[REUSE]` | `../TourSchedules/components/ScheduleDeleteDialog` | Đã tồn tại, có style đẹp, có sẵn warning khi `booked_slots > 0` nếu pass đúng message, sẽ gọi trực tiếp từ Edit page. |
| `ScheduleStatsBlock` | Molecule | `[NEW]` | `src/pages/Tours/TourScheduleEdit/components/ScheduleStatsBlock.tsx` | Khối thống kê booking (số chỗ đã đặt, còn trống, bar progress) đặt bên cột phải. |
| `ScheduleMetaBlock` | Molecule | `[NEW]` | `src/pages/Tours/TourScheduleEdit/components/ScheduleMetaBlock.tsx` | Khối hiện thời gian tạo/update, thuộc tour... (Vì BE backend chưa có trường created_at trong Schedule API hiện tại, block này sẽ render placeholder hoặc lược bỏ nếu data thiếu. Ta sẽ fallback chỉ hiển thị Tên Tour link). |
| `TourScheduleEdit` | Page | `[MOD]` | `src/pages/Tours/TourScheduleEdit/index.tsx` | Page chính đã có bộ khung. Cần bổ sung layout cột phải thêm `ScheduleStatsBlock` & Nút Xóa lịch ở dưới form. |

## 2. Component Decomposition

### 2.1. `ScheduleStatsBlock` (NEW)
**Purpose:** Hiển thị progress bar của số người đã đặt so với tổng số. 
**Expected Props:**
- `totalSlots: number`
- `bookedSlots: number`
**Design/Style:** 
- Background: `#F8FAFC` (slate-50), border `E2E8F0`, radius `12px`.
- Lưới 3 số liệu: "Đã đặt", "Còn trống", "Tối đa".
- Progress Bar: tính `% = (booked / total) * 100`.
  - <= 60%: màu `#0066CC` hoặc primary `#14B8A6`.
  - 61-89%: màu `#F59E0B` (amber).
  - \>= 90%: màu `#EF4444` (red).

### 2.2. `ScheduleDeleteDialog` (REUSE + INTEGRATION)
**Purpose:** Confirm trước khi xóa.
**Integration in Page:** 
- Nút "Xóa lịch này" đặt ở góc dưới cùng bên trái của Form / hoặc ở góc phải trên.
- Click mở state `isDeleteDialogOpen = true`.
- Khi Confirm -> Gọi `deleteScheduleMutation`. On success -> toast & navigate `/admin/tours/schedules`.

## 3. UI States Contract

| Component | `isLoading` | `isEmpty` / `isError` | Interactions |
|---|---|---|---|
| `ScheduleStatsBlock` | N/A (đợi page load xong) | Nếu `totalSlots === 0`, progress = 0% | Tooltip cảnh báo nếu booked > total (logic fail) |
| `ScheduleDeleteDialog` | `isDeleting=true` -> Nút Submit disabled, spinner | N/A | Esc / click ra ngoài để đóng. |
| Button Xóa lịch | Disabled nếu form đang submit. | N/A | Text `#EF4444`, hover bg `red-50` |

## 4. Placement Strategy

- Các component mới như `ScheduleStatsBlock` đặt trong thư mục `src/pages/Tours/TourScheduleEdit/components/` vì tính chất feature-specific.
- Không đụng chạm vào `ScheduleForm` hay `SchedulePreviewBox` của Create để tránh side effects không mong muốn.

## 5. Implementation Execution Plan

1. Tạo thư mục `src/pages/Tours/TourScheduleEdit/components`.
2. Viết file `ScheduleStatsBlock.tsx`.
3. Sửa file `src/pages/Tours/TourScheduleEdit/index.tsx`:
   - Thêm nút **"Xóa lịch này"** (Nút màu đỏ).
   - Import và thêm `ScheduleDeleteDialog` vào DOM. Xử lý logic xóa thông qua `useDeleteSchedule` mutation (sẽ kiểm tra trong `useScheduleQueries.ts`).
   - Import và đặt `ScheduleStatsBlock` ở cột bên phải, phía trên hoặc dưới `SchedulePreviewBox`.
   - Setup `toast.success` cho action Delete.
4. Đảm bảo i18n (`schedules:delete.*`, `schedules:stats.*`) được xử lý (Sẽ add locale json key nếu cần).
