# UI Specification: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-14
- **Target Folder:** `src/pages/Tours/TourDetail/components/`

## 1. Overview

Màn hình Chi tiết Tour yêu cầu hiển thị khối lượng thông tin lớn, đa dạng loại dữ liệu (text, media, bảng giá, danh sách) trong một giao diện 2 cột (70/30). Do các components dùng chung (`PageHeader`, `StatusBadge`, `Card`) chưa tồn tại dưới dạng thư viện `common` hoặc `ui` độc lập, chúng ta sẽ xây dựng các component này dưới dạng Feature-local (cục bộ) tại `src/pages/Tours/TourDetail/components/` để đảm bảo tốc độ và tránh ảnh hưởng ngoài phạm vi.

## 2. Component Matrix

Dưới đây là các components chính yếu được yêu cầu phân tích:

| Component | Status | Layer | Location | Purpose |
|---|---|---|---|---|
| `TourDetailHeader` | `[NEW]` | Molecule | Feature-local | Header của trang, bao gồm breadcrumbs, title, các badges (trạng thái, hot, nổi bật) và nhóm nút actions (Xem, Sửa). |
| `TourGallery` | `[NEW]` | Organism | Feature-local | Hero section chứa ảnh cover lớn, grid ảnh nhỏ (thumbnails) bên dưới, overlay số lượng ảnh và thanh thông tin nhanh (duration, location, max_people, start_time). |
| `TourInfoSection` | `[NEW]` | Organism | Feature-local | Cụm chứa "Mô tả tour" (có tabs ngắn/chi tiết) và "Bảng giá" (người lớn, trẻ em, em bé) kèm block cảnh báo giảm giá. |
| `TourScheduleTable` | `[NEW]` | Organism | Feature-local | Bảng danh sách các đợt khởi hành, hiển thị ngày đi/về, giá riêng, tiến độ chỗ ngồi (progress bar), trạng thái và nút action (Edit/Delete). |

## 3. Component Details & States

### 3.1. `TourDetailHeader`
- **Props:**
  - `tour: TourViewModel | null`
  - `onEdit: () => void`
  - `isLoading: boolean`
- **States:**
  - `isLoading`: Hiển thị Skeleton cho phần title và action buttons.
  - `Badges`: Trạng thái (Xanh lá = Hoạt động, Đỏ = Tạm ẩn), Hot (Cam), Nổi bật (Xanh dương).
- **Styling:** Tuân thủ pattern breadcrumb của `TourHeader.tsx`.

### 3.2. `TourGallery`
- **Props:**
  - `images: string[]`
  - `thumbnail: string`
  - `quickInfo: { duration, max_people, meeting_point, start_time }`
  - `isLoading: boolean`
- **States:**
  - `isLoading`: `Skeleton` dạng rect chiếm toàn bộ chiều cao 320px.
  - `Empty Image`: Nếu mảng `images` rỗng, hiển thị placeholder ảnh xám có icon Image.
- **Styling:** Ảnh cover có `object-cover`. Bottom bar dùng nền đen mờ (`bg-black/50 backdrop-blur-sm`).

### 3.3. `TourInfoSection`
- **Props:**
  - `tour: TourViewModel`
  - `isLoading: boolean`
- **States:**
  - `Tabs`: State local để chuyển đổi giữa "Mô tả ngắn" và "Mô tả chi tiết".
  - `Discount`: Chỉ hiển thị block `#FFE0D4` khi `discount_percent > 0`. Cần tính toán "Giá gốc" dựa trên giá trị sau giảm từ API (nếu cần thiết) hoặc ngược lại.
  - `isLoading`: Skeleton text lines.
- **Styling:** Card nền trắng, border viền nhạt `border-[#E2E8F0]`. Giá tiền màu nổi (Success cho rẻ/miễn phí, Warning/Accent cho hot).

### 3.4. `TourScheduleTable`
- **Props:**
  - `schedules: Schedule[]`
  - `isLoading: boolean`
  - `onAddSchedule: () => void`
  - `onEditSchedule: (id) => void`
  - `onDeleteSchedule: (id) => void`
- **States:**
  - `isLoading`: Render `TableSkeleton` với `rows=5`.
  - `isEmpty`: Render `EmptyState` component báo "Chưa có đợt khởi hành nào".
  - `ProgressBar`: Màu thay đổi (Primary khi còn chỗ, Error khi đầy chỗ).
- **Styling:** Dùng thẻ `table` cơ bản styled bằng Tailwind. Không cần phức tạp hóa với `@tanstack/react-table` nếu không có nhu cầu sort/filter phức tạp ngay tại bảng này.

## 4. Placement & Build Strategy

1.  **Phase 1: Shared Atoms (Feature-local)**
    - Xây dựng tạm các file UI nhở ở thư mục local nếu cần thiết. Tuy nhiên, ưu tiên dùng trực tiếp HTML/Tailwind theo design để tránh over-engineering.
2.  **Phase 2: Complex Organisms**
    - Build `TourGallery` trước vì nó tác động mạnh nhất đến hình ảnh trang.
    - Build `TourInfoSection` để xử lý text và logic giá trị hiển thị.
    - Build `TourScheduleTable` để xử lý danh sách.
3.  **Phase 3: Assembly**
    - Đưa tất cả vào `TourDetail/index.tsx`.
    - Kết nối với `useTourDetailQueries` hook để bơm data thật.

## 5. Notes & Handoff

- **Icons:** Thay thế toàn bộ Material Symbols trong prototype bằng thư viện `lucide-react` đang dùng trên toàn project.
- **Colors:** Prototype dùng `#0066CC` làm Primary thay vì `#14B8A6`. Tuân theo Repo Facts: Dùng `lucide-react` và bám theo `Tailwind v4` đã được config sẵn.
- **Responsive:** Khi ở màn hình Mobile, thiết kế 2 cột (70/30) sẽ gập lại thành 1 cột (100%), các component con phải dùng flex wrap linh hoạt.
