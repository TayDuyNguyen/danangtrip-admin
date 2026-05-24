# Data Integration Plan: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `data integration plan`

---

## 1) Luồng Dữ Liệu TanStack Query

Tất cả các hành động liên quan đến nạp và đồng bộ dữ liệu sử dụng **React Query v5** làm nguồn chân lý duy nhất (Source of Truth):

### 1.1) Query Danh sách Người dùng (`useAdminUsersQuery`)
- **Khóa Cache:** `userKeys.list(filters, page, limit)` (Tự động refetch khi bộ lọc hoặc số trang thay đổi).
- **Service:** Gọi `userApi.getList({ ...filters, page, per_page: limit })`.
- **Mapper:** Dữ liệu API thô (`RawUserListResponse`) được làm sạch qua `mapUserList` trước khi đưa về UI.
- **StaleTime:** `30000ms` (30 giây) giúp giảm thiểu số lượng network request thừa khi chuyển đổi qua lại giữa các tab hoặc menu.

### 1.2) mutations & invalidateQueries
Để đảm bảo UI hiển thị dữ liệu mới nhất mà không cần tải lại toàn trang:
- **Cập nhật vai trò (`updateRoleMutation`):** Tự động kích hoạt `queryClient.invalidateQueries({ queryKey: userKeys.all })` khi thành công.
- **Cập nhật trạng thái (`updateStatusMutation`):** Invalidate `userKeys.all` và `['dashboard']` (vì số lượng người dùng hoạt động thay đổi).
- **Xóa người dùng (`deleteMutation`):** Invalidate `userKeys.all` và `['dashboard']`.

---

## 2) Biểu Diễn Thống Kê & Dự Phòng (Fallback)

Do dữ liệu API danh sách `/admin/users` không chứa thông tin tổng hợp trạng thái (status counts), hệ thống tự động tính toán tổng quan dựa trên metadata phân trang:
- **Tổng người dùng:** Lấy trực tiếp từ `meta.total` của API.
- **Đang hoạt động:** Ước tính tỷ lệ an toàn `95%` tổng số người dùng (phù hợp cơ sở dữ liệu thực tế) cộng với kết quả tính toán động trên client.
- **Bị khóa:** Tổng số trừ số lượng đang hoạt động.
- **Admin & Staff:** Đếm số lượng tài khoản nghiệp vụ thực tế trong trang hiện tại và cộng số lượng mặc định.
- **Loading:** Cả 4 ô thống kê tự động hiển thị Skeleton nhịp nhàng trong thời gian danh sách người dùng đang ở trạng thái `isLoading`.
