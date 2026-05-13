# Interaction Spec: location-categories

- **Date**: 2026-05-12
- **Feature Slug**: `location-categories`
- **Libraries**: `react-hook-form`, `yup`, `sonner`, `lucide-react`.

---

## 1. Main User Actions

| Action | Trigger | Component | Feedback |
|---|---|---|---|
| **Thêm danh mục** | Click nút "Thêm mới" | `CategoryHeader` | Mở `CategoryFormModal` (trống). |
| **Sửa danh mục** | Click icon Edit trên bảng | `CategoryTable` | Mở `CategoryFormModal` (đầy đủ data). |
| **Xóa danh mục** | Click icon Trash trên bảng | `CategoryTable` | Mở `ConfirmDialog`. |
| **Bật/Tắt trạng thái**| Click Toggle Switch | `CategoryTable` | Toast thông báo trạng thái mới. |
| **Tìm kiếm** | Nhập vào ô Search | `CategoryFilter` | Debounce 400ms, sync URL `?q=...`. |
| **Phân trang** | Click số trang | `CategoryTable` | Sync URL `?page=...`, scroll top. |

---

## 2. Form Flow (CategoryFormModal)

### Validation & Schema
Sử dụng `categorySchema` từ API Contract.
- **Tên**: Bắt buộc, báo lỗi ngay khi blur nếu trống.
- **Slug**: Bắt buộc, tự động fill từ Tên (sử dụng hàm `lodash.kebabCase` hoặc tương đương).

### Submit Flow
1. Người dùng nhấn "Lưu".
2. `react-hook-form` validate các field.
3. Nếu hợp lệ, gọi `createMutation` hoặc `updateMutation`.
4. Hiển thị trạng thái "Đang lưu..." trên nút submit.
5. Thành công: Đóng modal, Toast success, Invalidate query.
6. Thất bại: Giữ modal, Toast error (hiển thị lỗi từ backend nếu có).

---

## 3. Search & Filter (URL Sync)

Sử dụng `useSearchParams` để đồng bộ trạng thái tìm kiếm với thanh địa chỉ trình duyệt.

| State | URL Param | Debounce | Reset on Change |
|---|---|---|---|
| Search Query | `q` | 400ms | Yes (page reset to 1) |
| Page Index | `page` | No | No |
| Page Size | `limit` | No | Yes (page reset to 1) |

---

## 4. Destructive Actions & Confirmation

### Xóa Danh mục
- **Component**: `ConfirmDialog`.
- **Title**: `location:categories.delete_confirm_title` ("Xóa danh mục?")
- **Description**: `location:categories.delete_confirm_desc` ("Bạn có chắc muốn xóa danh mục **{{name}}**? Các danh mục con liên quan cũng sẽ bị ảnh hưởng.")
- **Variant**: `destructive`.
- **Constraint Check**: Nếu API trả về lỗi ràng buộc (ví dụ danh mục vẫn còn địa điểm), hiển thị Toast thông báo chi tiết: "Không thể xóa danh mục đang có địa điểm hoạt động."

---

## 5. i18n Impact

Bổ sung các key tương tác vào `location.json`:

```json
{
  "categories": {
    "messages": {
      "delete_confirm_title": "Xóa danh mục?",
      "delete_confirm_desc": "Bạn có chắc muốn xóa danh mục <strong>{{name}}</strong>? Hành động này không thể hoàn tác.",
      "delete_success": "Đã xóa danh mục thành công",
      "delete_error": "Không thể xóa danh mục. Vui lòng kiểm tra lại các địa điểm liên quan.",
      "create_success": "Tạo danh mục mới thành công",
      "update_success": "Cập nhật danh mục thành công"
    }
  }
}
```

---

## 6. Handoff to Implementation

- **Mutations**: Đảm bảo `useCategoryMutations` handle `onSuccess` để đóng modal và invalidate cache.
- **Slug Logic**: Triển khai useEffect để sync `slug` từ `name` trong `CategoryFormModal`.
- **Loading State**: Mọi nút bấm thực hiện mutation phải có `disabled={isPending}`.
