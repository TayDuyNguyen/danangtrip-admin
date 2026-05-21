# Screen Analysis: Tạo Địa điểm mới
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-10
> Mockup/SRS: [Stitch Mockup](https://stitch.withgoogle.com/projects/385194501614952395?node-id=c9b819ea58244557961fc5c989f2301f)

---

## 1) Summary
- **Mục đích**: Cho phép Admin/Staff thêm mới địa điểm du lịch, ẩm thực hoặc dịch vụ vào hệ thống Đà Nẵng Trip.
- **Người dùng chính**: Admin, Staff.
- **Module**: Quản lý nội dung (Content Management) -> Địa điểm (Locations).
- **Source inputs**: Stitch mockup, API List (`api_list.md`), `PROJECT_RULES.md`.

## 2) Component Breakdown
### [REUSE] — Components đã có
| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `TextInput` | `src/components/ui/TextInput.tsx` | Không | Dùng cho Tên, Slug, Phone, Email, Website, Tọa độ. |
| `TextareaField` | `src/components/ui/TextareaField.tsx` | Không | Dùng cho Mô tả ngắn. |
| `CurrencyInput` | `src/components/ui/CurrencyInput.tsx` | Không | Dùng cho Giá vé (min/max). |
| `ToggleSwitch` | `src/components/ui/ToggleSwitch.tsx` | Không | Dùng cho Trạng thái (Active/Inactive), Nổi bật. |
| `CustomSelect` | `src/components/ui/CustomSelect.tsx` | Không | Dùng cho Danh mục, Quận/Huyện. |
| `ProgressBar` | `src/components/ui/ProgressBar.tsx` | Không | Dùng hiển thị độ hoàn thiện form. |
| `Button` | `src/components/ui/Button.tsx` | Không | Các action Lưu, Hủy, Xem trước. |

### [NEW] — Components cần tạo mới
| Component | Mô tả | Layer | Props interface |
|-----------|-------|-------|-----------------|
| `MarkdownEditor` | Editor hỗ trợ preview Markdown cho phần mô tả chi tiết. | Molecule | `{ value: string, onChange: (val: string) => void }` |
| `ImageGalleryUploader` | Upload ảnh đại diện và quản lý danh sách ảnh thư viện. | Organism | `{ values: string[], onChange: (urls: string[]) => void }` |
| `MapCoordinatePicker` | Bản đồ mini để chọn tọa độ hoặc xem vị trí từ Lat/Lng nhập vào. | Organism | `{ lat: number, lng: number, onChange: (lat: number, lng: number) => void }` |
| `TagAmenitySelector` | Selector hỗ trợ chọn nhiều tag/tiện ích (dạng chip/badge). | Molecule | `{ options: Tag[], selected: number[], onChange: (ids: number[]) => void }` |

### [MOD] — Components cần chỉnh sửa
| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| `Sidebar` | `src/components/common/Sidebar.tsx` | Active state cho menu "Thêm mới" | UI navigation |

## 3) Responsive Behavior
| Breakpoint | Layout | Note |
|------------|--------|------|
| Desktop (≥1024px) | 2 cột: Cột trái (Form chính), Cột phải (Sticky sidebar: Lưu ý, Độ hoàn thiện, Action). | Baseline chuẩn admin dashboard. |
| Tablet (768-1023px) | 1 cột: Các section xếp chồng. Sidebar đẩy xuống dưới hoặc thành Drawer. | Đảm bảo form input không bị vỡ. |
| Mobile (<768px) | 1 cột: Padding nhỏ lại, inputs full width. | Ưu tiên nhập liệu dọc. |

## 4) UI States
| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| Toàn bộ Form | Skeleton khi fetch categories/tags | - | Toast lỗi nếu API tạch | Toast thành công + Redirect | Đang submit | - |
| Image Uploader | Spin/Progress bar khi upload | Placeholder ảnh | Viền đỏ + message | Hiện preview | Đang upload | Border glow |
| Map Picker | Loading spinner cho map tiles | - | Lỗi load map | Marker hiện đúng | - | - |

## 5) Data Fields (Mapping to `RawLocation`)
| Field | Type | Required | Validation | Source API | Note |
|-------|------|----------|------------|------------|------|
| `name` | string | Có | Tối thiểu 5 ký tự | `name` | |
| `slug` | string | Có | Regex slug, duy nhất | `slug` | Tự động sinh từ name |
| `category_id` | number | Có | - | `category_id` | |
| `subcategory_id`| number | Không | - | `subcategory_id` | |
| `description` | string | Có | Tối thiểu 50 ký tự | `description` | Markdown |
| `short_description`| string| Có | Tối đa 200 ký tự | `short_description`| |
| `address` | string | Có | - | `address` | |
| `district` | string | Có | - | `district` | |
| `latitude` | number | Có | -90 đến 90 | `latitude` | |
| `longitude` | number | Có | -180 đến 180 | `longitude` | |
| `phone` | string | Không | Regex phone | `phone` | |
| `email` | string | Không | Email format | `email` | |
| `website` | string | Không | URL format | `website` | |
| `opening_hours` | string | Không | - | `opening_hours` | |
| `price_min` | number | Không | ≥ 0 | `price_min` | |
| `price_max` | number | Không | ≥ price_min | `price_max` | |
| `price_level` | number | Không | 1-4 | `price_level` | |
| `thumbnail` | string | Có | URL ảnh | `thumbnail` | |
| `images` | string[] | Không | - | `images` | |
| `video_url` | string | Không | URL YouTube/Vimeo | `video_url` | |
| `status` | string | Có | `active` \| `inactive` | `status` | |
| `is_featured` | boolean | Có | - | `is_featured` | |

## 6) API Endpoints
| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| GET | `/categories` | 🔐 | - | `Category[]` | Có (vào API_ENDPOINTS.TOURS or LOCATIONS) |
| GET | `/tags` | 🔐 | `?type=...` | `Tag[]` | Có |
| GET | `/amenities` | 🔐 | `?category=...` | `Amenity[]` | Có |
| POST | `/admin/locations` | 🛡️ | `LocationPayload` | `RawLocation` | Có (vào LOCATIONS.CREATE) |
| POST | `/upload/image` | 🔐 | `FormData` | `{ url: string }` | Đã có (UPLOAD.IMAGE) |

## 7) Mapper Requirements
| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| `latitude` | string/number | `lat` | `toNumberSafe` |
| `longitude` | string/number | `lng` | `toNumberSafe` |
| `price_level` | number | `priceLevel` | Giữ nguyên 1-4 |
| `status` | string | `status` | Map sang UI label nếu cần |

## 8) Business Rules
- **BR-01**: `slug` phải được tự động sinh khi nhập `name` nhưng vẫn cho phép Admin sửa thủ công.
- **BR-02**: `price_max` không được nhỏ hơn `price_min`.
- **BR-03**: Cho phép upload tối đa 10 ảnh vào `images`. Mỗi ảnh không quá 5MB.
- **BR-04**: Tọa độ Lat/Lng mặc định lấy tâm Đà Nẵng nếu người dùng không chọn.

## 9) Actors & Permissions
| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| admin | Toàn quyền tạo, sửa, xóa, duyệt nổi bật | - | |
| staff | Tạo địa điểm, cập nhật thông tin | Xóa địa điểm | Staff có thể bị giới hạn theo phân vùng (Assumption) |

## 10) Edge Cases
- **EC-01**: User nhập slug trùng lặp -> API trả 422 -> UI phải báo lỗi tại trường Slug.
- **EC-02**: Upload ảnh lỗi giữa chừng -> Phải xóa cleanup các ảnh đã upload thành công trên Cloudinary (nếu client-side upload) hoặc rollback.
- **EC-03**: Nhập tọa độ ngoài vùng Đà Nẵng -> Hiển thị cảnh báo (Warning) nhưng vẫn cho phép lưu.

## 11) Assumptions & Open Questions
### Assumptions
- [ASSUMPTION] A-01: Admin panel hiện tại chưa có Map SDK tích hợp (Google Maps hoặc Leaflet). Cần cài đặt `react-leaflet` hoặc tương đương.
- [ASSUMPTION] A-02: Markdown editor sẽ dùng thư viện nhẹ như `react-simplemde-editor` hoặc tương đương.

### Open Questions
- Q-01: Phần "Độ hoàn thiện" (Progress) tính toán dựa trên những field nào là bắt buộc?
- Q-02: Có cần tính năng "Lưu nháp" (Draft) riêng biệt với trạng thái `inactive` không?

## 12) Implementation Checklist
- [ ] Cập nhật `RawLocation` type và tạo `LocationCreatePayload` type.
- [ ] Thêm endpoints vào `endpoints.ts`.
- [ ] Viết `locationApi.createLocation`.
- [ ] Tạo `location.validation.ts` dùng Yup.
- [ ] Phát triển các component mới: `MarkdownEditor`, `MapPicker`, `ImageGalleryUploader`.
- [ ] Lắp ghép trang `LocationCreate`.
- [ ] Tích hợp i18n cho các label tiếng Việt/Anh.
- [ ] Test form validation và flow upload ảnh.

## 13) Files / Areas Likely To Change
- `src/types/location.ts`
- `src/constants/endpoints.ts`
- `src/api/locationApi.ts`
- `src/pages/Locations/LocationCreate/` (New directory)
- `src/components/ui/` (New shared components)
- `src/validations/location.validation.ts`
