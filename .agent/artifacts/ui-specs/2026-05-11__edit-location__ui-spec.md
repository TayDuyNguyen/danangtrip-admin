# UI Specification: Chỉnh sửa Địa điểm (Edit Location)

Tài liệu này xác định các component UI cần thiết, chiến lược tái sử dụng và kế hoạch refactor để hỗ trợ tính năng chỉnh sửa địa điểm.

---

## 1. Component Reuse & Refactor Matrix

| Component | Layer | Current Path | Action | New Path (Target) |
|---|---|---|---|---|
| **LocationForm** | Organism | `LocationCreate/components` | **[MOD]** | `src/pages/Locations/components/LocationForm.tsx` |
| **ImageUploader** | Molecule | `LocationCreate/components` | **[REUSE]** | `src/pages/Locations/components/ImageUploader.tsx` |
| **MapPicker** | Molecule | `LocationCreate/components` | **[REUSE]** | `src/pages/Locations/components/MapPicker.tsx` |
| **TagSelector** | Molecule | `LocationCreate/components` | **[REUSE]** | `src/pages/Locations/components/TagSelector.tsx` |
| **MarkdownEditor** | Molecule | `LocationCreate/components` | **[REUSE]** | `src/pages/Locations/components/MarkdownEditor.tsx` |

> [!NOTE]
> Việc di chuyển các component sang `src/pages/Locations/components` giúp cả `LocationCreate` và `LocationEdit` đều có thể sử dụng chung, tránh lặp code.

---

## 2. Component Detailed Spec

### `LocationForm` (Organism)
Linh hồn của cả màn hình Create và Edit.
- **Props**:
    - `initialData?: RawLocation`: Dữ liệu ban đầu (nếu có).
    - `isEdit?: boolean`: Mode chỉnh sửa hay tạo mới.
    - `onSubmit: (data: any) => void`: Callback xử lý khi submit.
    - `isSubmitting: boolean`: Trạng thái đang gửi dữ liệu.
- **Refactor Point**: Chuyển logic gọi `useCreateLocationMutation` ra ngoài Page level để component thuần túy nhận data qua props.

### `AutoSaveSidebar` (Organism) - *Tùy chọn cho phase 2*
Phần sidebar chứa Tags và Amenities với logic auto-save.
- **Purpose**: Giúp admin thay đổi nhanh các thuộc tính nhỏ mà không cần submit toàn bộ form.
- **Components**: Reuse `TagSelector`.

---

## 3. UI States Contract

| State | Handling |
|---|---|
| **Page Loading** | Hiển thị `LoadingReact` hoặc `Skeleton` cho toàn bộ form. |
| **Submitting** | Nút "Cập nhật địa điểm" chuyển sang trạng thái `isLoading`. |
| **Validation Error** | Hiển thị thông báo lỗi dưới từng field (sử dụng `react-hook-form`). |
| **Success Toast** | Hiển thị Toast thông báo sau khi cập nhật thành công. |

---

## 4. Placement Strategy

- **Feature-shared components**: Đặt tại `src/pages/Locations/components/`.
- **Page components**: Đặt tại `src/pages/Locations/LocationEdit/index.tsx`.
- **UI Atoms**: Reuse `src/components/ui/` (TextInput, Button, CustomSelect, v.v.).

---

## 5. Files Expected To Change

1. **[MOVE/MOD]** Toàn bộ component từ `LocationCreate/components` sang `Locations/components`.
2. **[MODIFY]** `src/pages/Locations/LocationCreate/index.tsx`: Update path import.
3. **[NEW]** `src/pages/Locations/LocationEdit/index.tsx`: Sử dụng `LocationForm` đã refactor.

---

## 6. Handoff Notes

1. **Thứ tự thực hiện**: Refactor `LocationForm` trước -> Verify `LocationCreate` vẫn chạy tốt -> Build `LocationEdit`.
2. **Visual Check**: Đảm bảo glassmorphism và bo góc (rounded-3xl) đồng nhất với các màn hình quản trị khác.
