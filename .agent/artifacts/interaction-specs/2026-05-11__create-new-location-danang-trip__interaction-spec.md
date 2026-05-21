# Interaction Spec: Tạo Địa điểm mới
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-11
> Source hooks: `src/hooks/useLocationQueries.ts`

---

## 1) Main User Actions
| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| Lưu địa điểm | Submit button | `useCreateLocationMutation` | Toast success + Redirect | Toast error + Scroll to error |
| Hủy bỏ | Cancel button | N/A | Redirect to List | N/A |
| Chọn tọa độ | Click Map | N/A | Marker di chuyển + Cập nhật Lat/Lng | N/A |
| Upload ảnh | D&D / Click slot | `useUploadImageMutation` | Hiện preview ảnh | Toast error |
| Chọn Tag/Tiện ích | Click chip/select | N/A | Cập nhật list badges | N/A |

---

## 2) Forms
| Form | Fields | Validation Source | Submit Flow | Reset/Cancel Flow |
|---|---|---|---|---|
| `LocationCreateForm` | 20+ fields (Name, Slug, Desc, Map, Images, etc.) | `locationSchema(t)` | Validate -> Mutation -> Invalidate | Confirm if dirty -> Redirect |

### Special Form Interactions:
- **Auto-slug**: Tự động sinh slug từ Tên khi Tên thay đổi (dùng `slugifyVietnamese`).
- **Form Progress**: Tính toán tỷ lệ hoàn thành dựa trên các trường bắt buộc đã điền (Name, Category, Desc, Address, Map, Thumbnail). Hiển thị qua `ProgressBar`.
- **Markdown Preview**: Tab switch hoặc split view để xem trước nội dung định dạng.

---

## 3) Filters / Search / Pagination
*Màn hình tạo không có filter/search/pagination, nhưng có lookup cho các dropdown.*
| Control | State Source | Sync URL | Debounce | Notes |
|---|---|---|---|---|
| District Select | `useLocationFilterDistrictsQuery` | No | No | Danh sách lấy từ API |
| Category Select | `useLocationCategoriesQuery` | No | No | Danh sách lấy từ API |

---

## 4) Confirm / Destructive Actions
| Action | Confirm UI | Permission | Notes |
|---|---|---|---|
| Rời khỏi khi đang nhập | `Modal` (Hủy bỏ?) | role:admin | Cảnh báo mất dữ liệu nếu form dirty |
| Xóa ảnh trong thư viện | Inline icon | role:admin | Xóa khỏi state UI trước khi submit |

---

## 5) i18n Keys To Add (via `location.json`)
- `vi`: `actions.create_success`, `actions.discard_confirm`, `validation.invalid_slug`, `validation.price_max_min`
- `en`: `actions.create_success`, `actions.discard_confirm`, `validation.invalid_slug`, `validation.price_max_min`
