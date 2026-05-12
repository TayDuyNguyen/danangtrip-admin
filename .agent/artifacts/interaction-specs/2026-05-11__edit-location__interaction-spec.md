# Interaction Specification: Chỉnh sửa Địa điểm (Edit Location)

Tài liệu này xác định các tương tác của người dùng, quy trình xử lý form, và các cơ chế phản hồi (feedback) cho tính năng chỉnh sửa địa điểm.

---

## 1. Main User Actions & Flows

### Form Submission (Update)
- **Trigger**: Click nút "Cập nhật địa điểm" tại trang `LocationEdit`.
- **Validation**: Sử dụng `createLocationSchema` (Yup). Tất cả lỗi sẽ hiển thị inline dưới từng field.
- **Processing**: Gọi mutation `useUpdateLocation`. Nút bấm sẽ chuyển sang trạng thái `isSubmitting` (disabled + spinner).
- **Feedback**: 
    - Success: Toast "Cập nhật thành công", không chuyển trang để admin có thể tiếp tục chỉnh sửa.
    - Error: Toast thông báo lỗi từ server (VD: Slug đã tồn tại).

### Destructive Action: Delete Location
- **Trigger**: Click icon Xóa tại Header hoặc Sidebar.
- **UI**: Hiển thị `ConfirmDialog` với tiêu đề "Xóa địa điểm này?" và mô tả cảnh báo mất dữ liệu.
- **Processing**: Gọi mutation `useDeleteLocation`.
- **Feedback**:
    - Success: Toast "Xóa thành công", tự động chuyển hướng về `/admin/locations`.

### Auto-save Interactions (Tags & Amenities)
- **Trigger**: Thay đổi selection trong `TagSelector` tại sidebar.
- **Processing**: Gọi mutation sync tương ứng (`useSyncLocationTags` / `useSyncLocationAmenities`).
- **Feedback**: Hiển thị loading indicator nhỏ tại card. Nếu lỗi, rollback state hoặc hiển thị Toast thông báo.

---

## 2. Form State & Dirty Check

- **Pre-fill**: Dữ liệu từ API được đổ vào `defaultValues` của `useForm` ngay khi query `detail` thành công.
- **Dirty Check**: Nếu admin thay đổi dữ liệu mà chưa lưu rồi nhấn Back hoặc thoát trang, hiển thị Browser Confirm (hoặc Custom Modal) hỏi: "Bạn có chắc muốn rời đi? Các thay đổi chưa lưu sẽ bị mất."
- **Reset**: Có nút "Đặt lại" để revert form về trạng thái ban đầu của API.

---

## 3. URL Synced State

- **Breadcrumbs**: Đồng bộ theo cấu trúc route.
- **Navigation**: Nút "Quay lại" (Back) dẫn về trang danh sách địa điểm, giữ nguyên các filter cũ (nhờ state của TanStack Query).

---

## 4. i18n Keys Impact

Cần đảm bảo các key sau có trong `location.json`:
- `actions.confirm_delete`: "Xóa địa điểm này?"
- `messages.discard_confirm`: "Bạn có chắc muốn hủy bỏ? Các thay đổi sẽ không được lưu."
- `form.actions.updating`: "Đang cập nhật..."

---

## 5. Verification Plan

1. **Validation Test**: Để trống các field bắt buộc và nhấn lưu -> Kiểm tra xem lỗi có hiển thị đúng không.
2. **Discard Test**: Thay đổi 1 field -> Nhấn nút Back -> Kiểm tra xem có dialog cảnh báo không.
3. **Delete Test**: Nhấn xóa -> Hủy (Cancel) -> Đảm bảo data vẫn còn. Nhấn xóa -> Xác nhận (Confirm) -> Đảm bảo đã chuyển về trang list và data biến mất.
