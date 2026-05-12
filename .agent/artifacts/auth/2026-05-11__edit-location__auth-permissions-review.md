# Auth & Permissions Review: Chỉnh sửa Địa điểm (Edit Location)

Tài liệu này rà soát các cơ chế bảo mật, phân quyền và kiểm soát truy cập cho tính năng chỉnh sửa địa điểm.

---

## 1. Route Guard Review

Tất cả các route liên quan đều nằm trong nhóm `PrivateRoute` của hệ thống quản trị.

| Route | Level | Guard Pattern | Status |
|---|---|---|---|
| `/admin/locations/edit/:id` | Page | `PrivateRoute` (Layout-level) | [PROTECTED] |

- **Behavior**: Nếu người dùng chưa đăng nhập, hệ thống sẽ tự động redirect về trang `/login` và lưu lại `returnUrl`.
- **Role Requirement**: Hiện tại hệ thống đang phân biệt `admin` và `user`. Chỉ người dùng có role `admin` mới được cấp quyền truy cập vào Dashboard.

---

## 2. Permission Matrix

| Action | admin | user | guest |
|---|---|---|---|
| Xem trang chỉnh sửa | ✓ | ✗ | ✗ |
| Cập nhật thông tin | ✓ | ✗ | ✗ |
| Xóa địa điểm | ✓ | ✗ | ✗ |
| Upload/Delete ảnh | ✓ | ✗ | ✗ |
| Đồng bộ Tags/Amenities | ✓ | ✗ | ✗ |

---

## 3. UI Gating (Conditional Rendering)

Dựa trên thiết kế và yêu cầu bảo mật, các thành phần UI nhạy cảm sẽ được ẩn hoàn toàn nếu không đủ quyền (không chỉ disable).

- **Nút Xóa (Trash icon)**: Ẩn hoàn toàn nếu role không phải `admin`.
- **Nút Cập nhật**: Ẩn hoặc disable nếu không có quyền edit.
- **Image Upload Controls**: Chỉ hiển thị cho người có quyền chỉnh sửa.

---

## 4. Auth Flow Integrity

- **Token Attach**: `axiosClient` interceptor tự động gắn Bearer token cho các request `GET detail`, `PUT update`, và `DELETE`.
- **401 Handling**: Nếu token hết hạn trong khi đang ở trang edit, interceptor sẽ gọi `logout()` và đẩy user về trang login.
- **Hydration**: `useUserStore` sử dụng middleware `persist` để duy trì trạng thái đăng nhập khi F5 trang.

---

## 5. Risks & Assumptions

- **[ASSUMPTION]**: Dashboard này chỉ dành cho Admin (`role === 'admin'`). Nếu trong tương lai có thêm role `staff` hoặc `moderator`, cần bổ sung logic check permission chi tiết cho từng action (VD: staff được sửa nhưng không được xóa).
- **[RISK]**: Hiện tại chưa có permission chi tiết cho từng địa điểm (VD: owner của địa điểm mới được sửa). Hệ thống đang mặc định Admin có toàn quyền.

---

## 6. Files Impacted

- **[MODIFY]** `src/pages/Locations/LocationEdit/index.tsx`: Thêm logic check role để hiển thị nút Xóa.
- **[MODIFY]** `src/pages/Locations/components/LocationForm.tsx`: Kiểm soát quyền submit.
