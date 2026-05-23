# Data Integration Plan: Chi tiết Người dùng (admin_users_detail)

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Scope: `data integration plan`

---

## 1) Luồng Dữ Liệu TanStack Query

Màn hình Chi tiết Người dùng quản lý dữ liệu đồng bộ và cập nhật thông qua **React Query v5**, tối ưu hóa bộ nhớ đệm và giảm thiểu tối đa các yêu cầu mạng không cần thiết:

### 1.1) Query Chi tiết Người dùng (`useAdminUserDetailQuery`)
- **Khóa Cache:** `["users", "detail", id]` (userKeys.detail(id)).
- **Service:** Gọi `userApi.getDetail(id)`.
- **Mapper:** Dữ liệu thô từ backend (`RawUserItem`) được ánh xạ qua `mapUserItem` để trả về định dạng camelCase an toàn cho frontend (`UserItem`).
- **StaleTime:** `5 phút` (`300000ms`) để tối ưu hóa bộ đệm và giữ thông tin chi tiết ổn định khi admin chuyển đổi giữa các tab lịch sử đặt tour/đánh giá.

### 1.2) Query Lịch sử Đặt Tour (`useUserBookingsQuery`)
- **Khóa Cache:** `["users", "bookings", id, { page, limit }]` (userKeys.bookingsList(id, page, limit)).
- **Service:** Gọi `userApi.getBookings(id, { page, per_page: limit })`.
- **Mapping & Phân trang:** Trả về kiểu dữ liệu `UserBookingListResponse` với danh sách `data` và metadata phân trang `meta` được ánh xạ trực tiếp từ `LengthAwarePaginator` của Laravel.
- **StaleTime:** `30 giây` (`30000ms`).

### 1.3) Query Danh sách Đánh giá (`useUserRatingsQuery`)
- **Khóa Cache:** `["users", "ratings", id, { page, limit }]` (userKeys.ratingsList(id, page, limit)).
- **Service:** Gọi `userApi.getRatings(id, { page, per_page: limit })`.
- **Mapping & Phân trang:** Trả về kiểu dữ liệu `UserRatingListResponse` với danh sách `data` và metadata phân trang `meta`.
- **StaleTime:** `30 giây` (`30000ms`).

---

## 2) Các Mutations & Chiến Lược Đồng Bộ Cache

Để đảm bảo thông tin trên giao diện thay đổi tức thì sau khi thực hiện thao tác quản trị:
- **Khóa/Mở khóa tài khoản (`updateStatusMutation`):** Tự động gọi `queryClient.invalidateQueries({ queryKey: userKeys.all })` và `queryClient.invalidateQueries({ queryKey: ["dashboard"] })` để làm mới thông tin tổng quan, đồng thời gọi `refetchUser()` thủ công trên trang chi tiết để badge trạng thái cập nhật ngay lập tức.
- **Cập nhật vai trò (`updateRoleMutation`):** Gọi `queryClient.invalidateQueries({ queryKey: userKeys.all })` và gọi `refetchUser()` để cập nhật badge quyền hạn ngay lập tức trên UI.
- **Xóa tài khoản (`deleteMutation`):** Tự động gọi `queryClient.invalidateQueries({ queryKey: userKeys.all })` và `queryClient.invalidateQueries({ queryKey: ["dashboard"] })` để loại bỏ người dùng khỏi bộ nhớ đệm toàn hệ thống trước khi điều hướng admin trở lại màn hình danh sách người dùng.
