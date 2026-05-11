# UI Spec: Tạo Địa điểm mới
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-11
> Source analysis: `2026-05-10__create-new-location-danang-trip__screen-analysis.md`

---

## 1) Summary
- **Mục tiêu**: Xây dựng giao diện form tạo địa điểm hiện đại, chuyên nghiệp, hỗ trợ nhập liệu đa dạng (Markdown, Bản đồ, Ảnh).
- **Người dùng chính**: Quản trị viên (Admin) hệ thống.

## 2) Component Matrix

### [REUSE]
| Component | Path | Why reuse | Notes |
|---|---|---|---|
| `TextInput` | `src/components/ui/TextInput.tsx` | Nhập tên, địa chỉ, email, phone | Dùng chung cho text/number/email/phone |
| `TextareaField` | `src/components/ui/TextareaField.tsx` | Mô tả ngắn | Simple text area |
| `CustomSelect` | `src/components/ui/CustomSelect.tsx` | Chọn danh mục, quận huyện | React-select wrapper |
| `ToggleSwitch` | `src/components/ui/ToggleSwitch.tsx` | Trạng thái, nổi bật | Boolean inputs |
| `ProgressBar` | `src/components/ui/ProgressBar.tsx` | Độ hoàn thiện form | Progress indicator ở sidebar |
| `Button` | `src/components/ui/Button.tsx` | Các nút hành động | Primary/Secondary variants |
| `Badge` | `src/components/ui/Badge.tsx` | Hiển thị tag/amenity đã chọn | |

### [NEW]
| Component | Layer | Purpose | Expected Props |
|---|---|---|---|
| `MarkdownEditor` | Molecule | Nhập mô tả chi tiết với preview | `value`, `onChange`, `label`, `error` |
| `MapCoordinatePicker` | Organism | Chọn tọa độ trên bản đồ | `lat`, `lng`, `onChange`, `address` |
| `ImageGalleryUploader` | Organism | Quản lý ảnh đại diện & thư viện | `value`, `onChange`, `maxItems`, `maxSize` |
| `TagAmenitySelector` | Molecule | Chọn tag & tiện ích (multi-select) | `options`, `value`, `onChange`, `type` |

### [MOD]
| Component | Path | Required change | Impact |
|---|---|---|---|
| `SectionHeader` | N/A | Tách từ `TourCreate` thành shared component | Dùng cho cả Tours & Locations |

---

## 3) UI States
| Component | Loading | Empty | Error | Success | Disabled |
|---|---|---|---|---|---|
| `LocationForm` | Skeleton (Main sections) | N/A | Toast + inline error messages | Toast + Redirect | `isSubmitting` state |
| `MapPicker` | Spinner (Map loading) | Center at Danang | Red border on container | Marker showing | |
| `ImageUploader` | Skeleton (per image slot) | Placeholder icon | "Upload failed" text | Preview image | `uploading` state |

---

## 4) Responsive Notes
| Breakpoint | Behavior | Notes |
|---|---|---|
| Mobile | 1 column. Sidebar chuyển xuống dưới hoặc dùng drawer. | Ưu tiên stack layout. |
| Tablet | 1 column (main content rộng hơn). Sidebar sticky nếu đủ chỗ. | |
| Desktop | 2 columns (Main: 8/12, Sidebar: 4/12). Sticky sidebar và header. | Layout tiêu chuẩn của Tours. |

---

## 5) Files Expected To Change
- `src/components/common/SectionHeader.tsx`: [NEW/SHARED]
- `src/pages/Locations/LocationCreate/components/LocationForm.tsx`: [NEW]
- `src/pages/Locations/LocationCreate/components/MarkdownEditor.tsx`: [NEW]
- `src/pages/Locations/LocationCreate/components/MapPicker.tsx`: [NEW]
- `src/pages/Locations/LocationCreate/components/ImageUploader.tsx`: [NEW]
- `src/pages/Locations/LocationCreate/components/TagSelector.tsx`: [NEW]
