# Screen Analysis: Chỉnh sửa Địa điểm (Edit Location)

- **Feature Slug**: `edit-location`
- **Date**: 2026-05-11
- **Source Inputs**: 
    - `admin_locations_edit.md`
    - `DESIGN.md`
    - `api_list.md`
    - `endpoints.ts`
    - `PROJECT_RULES.md`
- **Status**: Ready for Implementation

---

## 1. Summary And Scope

- **Tên màn hình**: Chỉnh sửa Địa điểm
- **Mục tiêu nghiệp vụ**: Cho phép quản trị viên cập nhật thông tin chi tiết của một địa điểm đã tồn tại trong hệ thống.
- **Actor chính**: Admin, Staff.
- **Module**: Quản lý Địa điểm (Location Management).
- **Mô tả**: Tái sử dụng layout và component từ màn Tạo Địa điểm, bổ sung cơ chế pre-filled dữ liệu, auto-save cho Tags/Amenities và các thao tác nhanh (xem đánh giá, xóa).

---

## 2. Design And Token Audit

Dựa trên `DESIGN.md` và `admin_locations_edit.md`:

| Token | Giá trị | Ghi chú |
|---|---|---|
| **Primary Color** | `#0066CC` | Sử dụng theo thực tế Admin Dashboard hiện tại (Target: `#14B8A6`) |
| **Secondary Color** | `#DBEAFE` | Light blue background |
| **Warning Color** | `#F59E0B` | Icon và border cho warning box |
| **Danger Color** | `#EF4444` | Nút Xóa và thông báo lỗi |
| **Success Color** | `#10B981` | Toast "Đã lưu" / "Cập nhật thành công" |
| **Typography** | Inter / System Font | Title: 16-18px Bold; Subtitle: 14px Medium #64748B |
| **Border Radius** | 16px (Card), 10px (Button), 8px (Warning) | Tuân thủ hệ thống radius của NovaEstate |
| **Spacing** | 4px base (Grid 4) | Section padding: 24px; Gap: 12-16px |
| **Surface** | Glassy / White | Background: #FFFFFF; Border: 0.8px #F1F5F9 |

---

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `EditLocationPage` | [NEW] | Page | `src/pages/Locations/LocationEdit/index.tsx` | Trang root cho chức năng chỉnh sửa |
| `LocationForm` | [MOD] | Organism | `src/pages/Locations/LocationCreate/components/LocationForm.tsx` | Tái sử dụng form tạo mới, thêm logic hydrate dữ liệu và edit state |
| `ImageUploader` | [REUSE] | Molecule | `src/pages/Locations/LocationCreate/components/ImageUploader.tsx` | Dùng cho thumbnail và gallery ảnh |
| `MapPicker` | [REUSE] | Molecule | `src/pages/Locations/LocationCreate/components/MapPicker.tsx` | Chọn tọa độ GPS |
| `TagSelector` | [MOD] | Molecule | `src/pages/Locations/LocationCreate/components/TagSelector.tsx` | Thêm logic auto-save (POST/DELETE) khi click |
| `QuickActionsCard` | [NEW] | Molecule | `src/pages/Locations/LocationEdit/components/QuickActionsCard.tsx` | Card sidebar chứa nút: Xem đánh giá, Xóa... |
| `LocationSidebar` | [MOD] | Organism | `src/components/common/RightSidebar.tsx` | Bổ sung block "THÔNG TIN" (Ngày tạo, Lượt xem...) |
| `DeleteConfirmModal` | [NEW] | Molecule | `src/components/modals/DeleteConfirmModal.tsx` | Modal xác nhận xóa dùng chung |

---

## 4. Responsive And UI States

### Layout Strategy
- **Desktop**: 2 cột. Form chính chiếm 65% bên trái. Sidebar 320px bên phải.
- **Tablet/Mobile**: Chuyển sang 1 cột (Full-width), Sidebar đẩy xuống dưới hoặc ẩn (tùy breakpoint).

### UI States Mapping

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| **Header** | Breadcrumb skeleton | N/A | Toast error | N/A |
| **Main Form** | Skeleton pulse (all inputs) | "Không tìm thấy dữ liệu" | Inline validation errors | Toast "Cập nhật thành công" |
| **Tags / Amenities** | Spinner nhỏ tại item | "Chưa có tag nào" | Toast error | Toast "Đã lưu" (auto-dismiss 2s) |
| **Image Gallery** | Skeleton grid | Upload zone | Alert error | N/A |
| **Sidebar Info** | Skeleton lines | "-" values | N/A | N/A |
| **Delete Action** | Button spinner | N/A | Toast error | Toast + Redirect to list |

---

## 5. Data And API Analysis

### Data Mapping

| Field | Type | Required | Validation | Source Endpoint |
|---|---|---|---|---|
| `id` | `number` | ✓ | — | `GET /admin/locations/{id}` |
| `name` | `string` | ✓ | max 255 | `GET /admin/locations/{id}` |
| `slug` | `string` | ✓ | format, unique | `GET /admin/locations/{id}` |
| `category_id` | `number` | ✓ | exists | `GET /admin/locations/{id}` |
| `district` | `string` | ✓ | enum | `GET /admin/locations/{id}` |
| `thumbnail` | `string` | ✗ | url | `GET /admin/locations/{id}` |
| `images` | `string[]` | ✗ | array of urls | `GET /admin/locations/{id}` |
| `is_featured` | `boolean` | ✗ | — | `GET /admin/locations/{id}` |
| `status` | `string` | ✓ | `active\|inactive` | `GET /admin/locations/{id}` |

### API Endpoints

- **Load Detail**: `GET /admin/locations/{id}`
- **Submit Edit**: `PUT /admin/locations/{id}`
- **Auto-save Tag**: `POST /admin/locations/{id}/tags` / `DELETE /admin/locations/{id}/tags/{tagId}`
- **Auto-save Amenity**: `POST /admin/locations/{id}/amenities` / `DELETE /admin/locations/{id}/amenities/{amenityId}`
- **Delete Location**: `DELETE /admin/locations/{id}`
- **Image Upload**: `POST /upload/image` (Cloudinary)

---

## 6. Business Rules And Edge Cases

### Business Rules (BR)
- **BR-01**: Khi thay đổi `slug`, phải hiển thị Warning cảnh báo về việc thay đổi URL ảnh hưởng đến SEO/Links.
- **BR-02**: Tags và Amenities được **auto-save** ngay khi user click (toggle), không đợi submit form chính.
- **BR-03**: Button "Hủy" phải quay về trang chi tiết địa điểm (`/admin/locations/{id}`).
- **BR-04**: Phải có "Unsaved Changes Guard" nếu user đã sửa form chính nhưng chưa bấm "Lưu thay đổi" mà muốn navigate away.

### Edge Cases (EC)
- **EC-01**: **Concurrent Edit**: Hai admin cùng sửa một địa điểm. Xử lý: Toast thông báo lỗi nếu data phía server đã thay đổi (Optimistic locking hoặc simple toast).
- **EC-02**: **Slug Duplicate**: User nhập slug đã tồn tại. Xử lý: Báo lỗi validation tại field slug.
- **EC-03**: **Image Reorder**: Kéo thả đổi thứ tự ảnh trong gallery phải update field `images` và enable nút Lưu.

---

## 7. Handoff To Next Steps

### Code Areas To Change
- `src/pages/Locations/LocationEdit/`: Tạo mới folder và các component liên quan.
- `src/hooks/useLocationQueries.ts`: Bổ sung hook `useLocationDetail` và `useUpdateLocation`.
- `src/routes/index.tsx`: Đăng ký route `/admin/locations/:id/edit`.

### Actions Required
- [ ] Implement `useLocationDetail` hook using TanStack Query.
- [ ] Refactor `LocationForm` to handle both Create and Edit modes (support `defaultValues`).
- [ ] Implement auto-save logic for tags/amenities with optimistic UI.
- [ ] Create `QuickActionsCard` and integrate Delete flow.

---

## 8. Assumptions / Open Questions
- **[ASSUMPTION]**: Endpoint `GET /admin/locations/{id}` trả về đầy đủ các trường bao gồm `tags` và `amenities` dưới dạng mảng objects hoặc IDs.
- **[OPEN QUESTION]**: Có cần hỗ trợ "Lưu nháp" (Draft) cho màn Edit không? (Tài liệu nói màn Tạo mới có Lưu nháp, màn Edit có "Xem trang").
- **[OPEN QUESTION]**: Slug warning có cần yêu cầu user tick confirm mới cho phép lưu không?
