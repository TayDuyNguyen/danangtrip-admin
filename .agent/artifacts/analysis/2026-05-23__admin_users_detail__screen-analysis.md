# Screen Analysis: Chi tiết Người dùng

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Mockup/SRS: D:\DATN\DATN_Document\docs\page\admin_users_detail.md

---

## 1) Summary
- **Mục đích**: Màn hình này hiển thị toàn bộ thông tin chi tiết về một người dùng cụ thể bao gồm thông tin cá nhân, thống kê tài khoản (số đơn hàng, số đánh giá, số yêu thích, tổng chi tiêu), danh sách 5 đơn hàng gần nhất (Booking history) và danh sách 3 đánh giá gần nhất (Review history). Đồng thời hỗ trợ các hành động quản trị trực tiếp như: Chỉnh sửa thông tin cá nhân, Đổi vai trò (Role), Khóa/Mở khóa trạng thái (Status), và Xóa tài khoản vĩnh viễn.
- **Người dùng chính**: Admin / Staff.
- **Chức năng/Module**: Quản lý Người dùng (User Management).
- **Source inputs**:
  - `D:\DATN\DATN_Document\docs\page\admin_users_detail.md` (Tài liệu đặc tả UI chi tiết)
  - `D:\DATN\danangtrip-api\routes\api.php` (Danh sách API backend thực tế)
  - `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\UserController.php` (Controller xử lý backend)
  - `D:\DATN\danangtrip-api\app\Repositories\Eloquent\UserRepository.php` (Truy vấn database backend)

---

## 2) Component Breakdown

### [REUSE] — Components đã có
| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `Breadcrumb` | `src/components/common/Breadcrumb.tsx` | Không | Dùng để hiển thị phân cấp đường dẫn ở Header. |
| `StatusBadge` | `src/components/common/StatusBadge.tsx` or similar | Không | Có thể tái sử dụng cho Status (Hoạt động / Bị khóa) và Role (Admin / User). |
| `Button` | `src/components/ui/Button.tsx` (nếu có) | Không | Các nút bấm chuẩn. |
| `Card` | `src/components/ui/Card.tsx` (nếu có) | Không | Dùng làm khung bọc các card thông tin, thống kê. |

### [NEW] — Components cần tạo mới
| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| `UserDetailHeader` | Header chứa Breadcrumb, tên người dùng, avatar thu nhỏ, status/role badge và các nút tác vụ trên cùng (Sửa, Khóa/Mở khóa) | Organism | `user: UserDetailViewModel`, `onLockToggle: () => void` |
| `PersonalInfoCard` | Card hiển thị thông tin chi tiết cá nhân (Họ tên, username, email, sđt, ngày sinh, giới tính, thành phố, ngày tham gia, ngày cập nhật, tình trạng xác thực email) | Organism | `user: UserDetailViewModel` |
| `UserBookingsTable` | Bảng hiển thị 5 đơn đặt tour gần nhất của người dùng | Organism | `bookings: BookingItemViewModel[]`, `isLoading: boolean`, `userId: number \| string` |
| `UserRatingsList` | Danh sách 3 đánh giá gần nhất của người dùng | Organism | `ratings: RatingItemViewModel[]`, `isLoading: boolean`, `userId: number \| string` |
| `UserStatsCards` | Hộp thống kê ở cột bên phải gồm 4 ô (Đơn hàng, Đánh giá, Yêu thích, Tổng chi) | Organism | `stats: { bookingsCount: number; ratingsCount: number; favoritesCount: number; totalSpend: number }` |
| `UserAccountSidebar` | Card thông tin tài khoản ở cột bên phải (Role, Trạng thái, Xác thực email, Đăng nhập cuối) | Organism | `user: UserDetailViewModel` |
| `UserActionsCard` | Card chứa danh sách các nút thao tác nhanh (Sửa, Đổi role, Xem đơn hàng, Xem đánh giá, Khóa/Mở khóa, Xóa tài khoản) | Organism | `user: UserDetailViewModel`, `onLockToggle: () => void`, `onRoleChange: () => void`, `onDeleteClick: () => void` |
| `ConfirmDeleteUserDialog` | Modal xác nhận xóa tài khoản vĩnh viễn kèm cảnh báo đỏ | Organism | `isOpen: boolean`, `onClose: () => void`, `onConfirm: () => void`, `userName: string`, `isDeleting: boolean` |
| `ChangeRoleDialog` | Modal chọn đổi vai trò (chỉ hỗ trợ Admin và User) | Organism | `isOpen: boolean`, `onClose: () => void`, `onConfirm: (role: 'admin' \| 'user') => void`, `currentRole: 'admin' \| 'user'`, `isUpdating: boolean` |

### [MOD] — Components cần chỉnh sửa
| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| `UserTable` | `src/pages/Users/UserList/components/UserTable.tsx` | Cập nhật link/nút "Xem chi tiết" ở mỗi dòng chuyển hướng tới `/admin/users/:id` | Cho phép truy cập vào màn hình chi tiết từ danh sách |

---

## 3) Responsive Behavior
| Breakpoint | Layout | Note |
|------------|--------|------|
| Desktop (≥1024px) | 2 cột: Cột trái (65% width) hiển thị Thông tin cá nhân + Đơn hàng + Đánh giá; Cột phải (320px width, sticky top-24) hiển thị Thống kê + Tài khoản + Thao tác. | Bố cục chuẩn theo thiết kế Figma/SRS |
| Tablet (768-1023px) | 1 cột: Xếp chồng dọc các card thông tin, cột phải sẽ chuyển xuống dưới cột trái. Cột phải không còn sticky. | Tối ưu hóa không gian hiển thị |
| Mobile (<768px) | 1 cột, co giãn padding từ 24px xuống 16px. Table đơn hàng chuyển sang scroll ngang (overflow-x-auto). | Tránh vỡ khung, font-size giảm nhẹ |

---

## 4) UI States
| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| **Toàn bộ trang** | Skeleton toàn bộ trang (Header, Left Column, Right Column) | Hiển thị thông báo "Không tìm thấy người dùng" nếu API trả về 404 | Error banner kèm nút reload | Hiển thị chi tiết người dùng | N/A | N/A |
| **Bảng đơn hàng** | Skeleton table (5 dòng) | "Chưa có đơn hàng nào" kèm nút "Xem tất cả" (nếu có đơn ngoài khoảng lọc) | Inline error + nút Thử lại | Render danh sách đơn hàng | N/A | Hover highlight dòng |
| **Danh sách đánh giá**| Skeleton list (3 items) | "Chưa có đánh giá nào" | Inline error | Render danh sách đánh giá | N/A | Hover highlight item |
| **Nút thao tác** | Spinner trên nút đang click | N/A | Toast error | Toast success | Disabled nút khác khi đang thực hiện thao tác xóa/cập nhật | Trạng thái scale nhẹ, màu sắc đậm hơn |

---

## 5) Data Fields

### 5.1 Chi tiết Người dùng (`GET /admin/users/{id}`)
| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `id` | `number` | ✓ | Số nguyên dương | `12` | `GET /admin/users/{id}` |
| `full_name` | `string` | ✓ | Tối đa 255 ký tự | `"Nguyễn Văn An"` | `GET /admin/users/{id}` |
| `username` | `string` | ✓ | Tối đa 50 ký tự | `"nguyenvanan"` | `GET /admin/users/{id}` |
| `email` | `string` | ✓ | Định dạng email hợp lệ | `"nguyenvanan@gmail.com"` | `GET /admin/users/{id}` |
| `avatar` | `string \| null` | ✗ | URL ảnh hợp lệ | `"https://.../avatar.jpg"`| `GET /admin/users/{id}` |
| `phone` | `string \| null` | ✗ | Số điện thoại | `"0905123456"` | `GET /admin/users/{id}` |
| `birthdate` | `string \| null` | ✗ | Định dạng YYYY-MM-DD | `"1995-01-15"` | `GET /admin/users/{id}` |
| `gender` | `string \| null` | ✗ | `'male' \| 'female' \| 'other'`| `"male"` | `GET /admin/users/{id}` |
| `city` | `string \| null` | ✗ | Tên thành phố | `"Đà Nẵng"` | `GET /admin/users/{id}` |
| `role` | `'admin' \| 'user'` | ✓ | Chỉ chấp nhận admin/user | `"user"` | `GET /admin/users/{id}` |
| `status` | `'active' \| 'banned'` | ✓ | Chỉ chấp nhận active/banned| `"active"` | `GET /admin/users/{id}` |
| `email_verified_at`| `string \| null` | ✗ | ISO datetime | `"2026-03-15T09:30:00Z"` | `GET /admin/users/{id}` |
| `created_at` | `string` | ✓ | ISO datetime | `"2026-03-15T09:30:00Z"` | `GET /admin/users/{id}` |
| `updated_at` | `string` | ✓ | ISO datetime | `"2026-04-01T14:22:00Z"` | `GET /admin/users/{id}` |
| `last_login_at` | `string \| null` | ✗ | ISO datetime | `"2026-04-01T14:22:00Z"` | `GET /admin/users/{id}` |
| `ratings_count` | `number` | ✓ | Số nguyên ≥ 0 | `5` | `GET /admin/users/{id}` (với count ratings) |
| `bookings_count` | `number` | ✓ | Số nguyên ≥ 0 | `12` | `GET /admin/users/{id}` (sẽ bổ sung backend) |
| `favorites_count`| `number` | ✓ | Số nguyên ≥ 0 | `8` | `GET /admin/users/{id}` (sẽ bổ sung backend) |
| `total_spend` | `number` | ✓ | Số thực ≥ 0 | `2450000.00` | `GET /admin/users/{id}` (sẽ bổ sung backend) |

### 5.2 Lịch sử Đơn hàng (`GET /admin/users/{id}/bookings`)
| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `id` | `number` | ✓ | Số nguyên | `1008` | `GET /admin/users/{id}/bookings` |
| `booking_code` | `string` | ✓ | Mã đơn hàng duy nhất | `"BK-1008"` | `GET /admin/users/{id}/bookings` |
| `total_amount` | `string/number` | ✓ | Số tiền gốc | `2500000` | `GET /admin/users/{id}/bookings` |
| `final_amount` | `string/number` | ✓ | Số tiền thực thanh toán | `2450000` | `GET /admin/users/{id}/bookings` |
| `booking_status`| `string` | ✓ | `pending/confirmed/completed/cancelled` | `"completed"` | `GET /admin/users/{id}/bookings` |
| `created_at` | `string` | ✓ | ISO datetime | `"2026-04-06T14:30:00Z"` | `GET /admin/users/{id}/bookings` |
| `tour_schedule` | `object` | ✓ | Chứa thông tin lịch trình và tour | `{...}` | `GET /admin/users/{id}/bookings` |
| `tour_schedule.tour.name` | `string` | ✓ | Tên tour đặt | `"Bà Nà Hills"` | `GET /admin/users/{id}/bookings` (với eager load) |

### 5.3 Lịch sử Đánh giá (`GET /admin/users/{id}/ratings`)
| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `id` | `number` | ✓ | Số nguyên | `42` | `GET /admin/users/{id}/ratings` |
| `rating` | `number` | ✓ | Số sao (1 đến 5) | `5` | `GET /admin/users/{id}/ratings` |
| `comment` | `string` | ✗ | Nội dung bình luận | `"Tour rất tuyệt vời"` | `GET /admin/users/{id}/ratings` |
| `status` | `string` | ✓ | `pending/approved/rejected` | `"approved"` | `GET /admin/users/{id}/ratings` |
| `created_at` | `string` | ✓ | ISO datetime | `"2026-04-06T14:30:00Z"` | `GET /admin/users/{id}/ratings` |
| `tour` | `object \| null` | ✗ | Đánh giá cho tour | `{ id: 1, name: "Bà Nà Hills" }` | `GET /admin/users/{id}/ratings` |
| `location` | `object \| null` | ✗ | Đánh giá cho địa điểm | `{ id: 5, name: "Cầu Rồng" }` | `GET /admin/users/{id}/ratings` |

---

## 6) API Endpoints
| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| `GET` | `/admin/users/{id}` | ✓ (Admin) | URL param: `id` | `ApiResponse<RawUserItem>` | Có, cần thêm hàm `getDetail` vào `userApi` và hằng số `/admin/users/${id}` |
| `GET` | `/admin/users/{id}/bookings` | ✓ (Admin)| URL param: `id`, Query: `page`, `per_page` | `ApiResponse<RawBookingListResponse>` | Có, cần thêm hàm `getBookings` vào `userApi` |
| `GET` | `/admin/users/{id}/ratings` | ✓ (Admin) | URL param: `id`, Query: `page`, `per_page` | `ApiResponse<RawRatingListResponse>` | Có, cần thêm hàm `getRatings` vào `userApi` |
| `PATCH`| `/admin/users/{id}/status` | ✓ (Admin) | URL param: `id`, Body: `{ status: string }` | `ApiResponse<RawUserItem>` | Không, đã có `updateStatus` trong `userApi` |
| `PATCH`| `/admin/users/{id}/role` | ✓ (Admin) | URL param: `id`, Body: `{ role: string }` | `ApiResponse<RawUserItem>` | Không, đã có `updateRole` trong `userApi` |
| `DELETE`| `/admin/users/{id}` | ✓ (Admin) | URL param: `id` | `ApiResponse<null>` | Không, đã có `delete` trong `userApi` |

---

## 7) Mapper Requirements

### 7.1 Mappers: RawUserItem -> UserDetailViewModel
| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| `full_name` | `string` | `fullName` | `raw.full_name \|\| "N/A"` |
| `username` | `string` | `username` | Thêm `@` ở đầu nếu chưa có |
| `email_verified_at` | `string \| null`| `isEmailVerified` | `!!raw.email_verified_at` |
| `birthdate` | `string \| null`| `birthdateFormatted` | Chuyển sang định dạng `"DD/MM/YYYY"` hoặc `"—"` |
| `gender` | `string \| null`| `genderLabel` | Mapped: `'male' -> "Nam"`, `'female' -> "Nữ"`, `'other' -> "Khác"`, `null -> "—"` |
| `last_login_at` | `string \| null`| `lastLoginFormatted` | Chuyển sang định dạng `"DD/MM/YYYY HH:mm"` hoặc `"—"` |
| `created_at` | `string` | `joinedDateFormatted`| Chuyển sang định dạng `"DD/MM/YYYY HH:mm"` |
| `updated_at` | `string` | `updatedDateFormatted`| Chuyển sang định dạng `"DD/MM/YYYY HH:mm"` |
| `total_spend` | `number \| string`| `totalSpend` | `toNumberSafe(raw.total_spend, 0)` |
| `bookings_count` | `number \| string`| `bookingsCount` | `toNumberSafe(raw.bookings_count, 0)` |
| `favorites_count`| `number \| string`| `favoritesCount` | `toNumberSafe(raw.favorites_count, 0)` |

---

## 8) Business Rules
- **BR-01 (Bảo vệ Admin hiện tại)**: Một admin đăng nhập tuyệt đối không được tự khóa trạng thái (banned), tự đổi vai trò của mình sang role khác (User), hoặc tự xóa tài khoản của mình. Logic này phải được chặn ở cả giao diện (ẩn/disable các nút bấm tương ứng trên chính mình) và ở Backend (Service layer check ID).
- **BR-02 (Ràng buộc vai trò Backend)**: Giao diện chỉ cho phép chuyển đổi vai trò giữa `admin` và `user`. Không cung cấp vai trò `staff` vì Backend Validator (`UpdateRoleUserRequest.php`) chỉ cho phép `admin,user`.
- **BR-03 (Chuyển hướng sau khi Xóa)**: Sau khi thực hiện xóa tài khoản thành công, hệ thống phải hiển thị Toast thông báo và chuyển hướng admin trở lại màn hình danh sách người dùng `/admin/users`.
- **BR-04 (Xác nhận hành động nhạy cảm)**: Các thao tác: Khóa tài khoản, Thay đổi vai trò, và Xóa tài khoản phải có modal xác nhận trước khi gửi API request. Thao tác xóa tài khoản bắt buộc phải hiển thị hộp thoại cảnh báo nghiêm trọng (mất đơn hàng, đánh giá, yêu thích).

---

## 9) Actors & Permissions
| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| **Admin** | Xem chi tiết, sửa thông tin, khóa/mở khóa tài khoản, thay đổi vai trò (admin ↔ user), xóa tài khoản của người dùng khác. | Khóa, đổi vai trò, hoặc xóa tài khoản của chính mình. | Quyền hạn tối cao trong hệ thống quản lý admin. |
| **Staff** | Không được truy cập nhóm route quản trị `/admin/users/*` (Chặn bởi middleware `role:admin` ở backend). | Thực hiện bất kỳ thao tác quản trị người dùng nào. | Thiết kế phân quyền backend chỉ cho phép role `admin` vào group này. |

---

## 10) Edge Cases
- **EC-01 (Tự thao tác trên bản thân)**: Khi Admin truy cập chính trang chi tiết của mình qua `/admin/users/{my_id}`.
  - *Xử lý*: Disable nút "Khóa tài khoản", "Đổi role", "Xóa tài khoản". Hiển thị dòng chú thích nhỏ "Tài khoản của bạn" bên cạnh tên.
- **EC-02 (Không có thông tin đơn hàng/đánh giá)**: Người dùng mới đăng ký, chưa đặt tour hoặc viết đánh giá nào.
  - *Xử lý*: Render bảng đơn hàng trống kèm text "Chưa có đơn hàng nào", render list đánh giá trống kèm text "Chưa có đánh giá nào". Vẫn hiển thị sidebar thống kê số lượng là `0` thay vì ẩn card.
- **EC-03 (Lỗi phân trang hoặc dữ liệu lớn)**: Nếu lịch sử đơn hàng hoặc đánh giá rất nhiều.
  - *Xử lý*: Chỉ tải 5 đơn hàng đầu tiên (`per_page=5`) và 3 đánh giá đầu tiên (`per_page=3`). Cung cấp link "Xem tất cả" chuyển tới màn hình danh sách đơn hàng/đánh giá lọc theo `user_id={id}` để giảm tải tài nguyên.

---

## 11) Assumptions & Open Questions
### Assumptions
- **A-01**: Giả định rằng backend `GET /admin/users/{id}` sẽ được điều chỉnh để trả về thêm các trường đếm `bookings_count`, `favorites_count` và tổng chi tiêu `total_spend` thông qua chỉnh sửa UserRepository của API.
- **A-02**: Giả định ảnh đại diện của người dùng nếu bị lỗi hoặc không có sẽ hiển thị Avatar là các ký tự chữ cái đầu của tên (Initials) trên nền màu Gradient ngẫu nhiên.

### Open Questions
- *Không có câu hỏi mở.* Mọi nghiệp vụ đã rõ ràng và logic backend đã được phân tích đầy đủ.

---

## 12) Implementation Checklist
- [ ] Chỉnh sửa Backend API (`D:\DATN\danangtrip-api`):
  - [ ] Cập nhật `UserRepository.php` phương thức `getUserWithStats(int $id)` để:
    - [ ] `withCount` thêm `bookings` và `favorites`.
    - [ ] Tính tổng chi tiêu `total_spend` của các booking đã hoàn tất/xác nhận và gán vào attribute của model.
- [ ] Khai báo Types & Contract (`d:\DATN\danangtrip-admin`):
  - [ ] Thêm các trường mới vào `RawUserItem` và `UserItem` trong `src/dataHelper/user.dataHelper.ts`.
  - [ ] Cập nhật mapper `mapUserItem` trong `src/dataHelper/user.mapper.ts` để map các trường mới (`total_spend`, `bookings_count`, `favorites_count`, `email_verified_at`, v.v.).
  - [ ] Khai báo endpoints mới trong `src/constants/endpoints.ts`.
  - [ ] Bổ sung các phương thức API mới (`getDetail`, `getBookings`, `getRatings`) trong `src/api/userApi.ts`.
  - [ ] Viết các React Query hooks (`useAdminUserDetailQuery`, `useUserBookingsQuery`, `useUserRatingsQuery`) trong `src/hooks/useUserQueries.ts`.
- [ ] Cấu hình Routing & Khung trang:
  - [ ] Thêm hằng số `USERS_DETAIL` vào `src/routes/routes.ts`.
  - [ ] Đăng ký lazy route `UserDetail` trong `src/routes/index.tsx`.
  - [ ] Cập nhật cột hành động trong `UserTable.tsx` để điều hướng đến trang chi tiết.
- [ ] Thiết kế UI Components (`src/pages/Users/UserDetail`):
  - [ ] Tạo thư mục `src/pages/Users/UserDetail` và các components con.
  - [ ] Xây dựng layout Responsive 2 cột.
  - [ ] Code giao diện chi tiết cá nhân, thống kê số liệu, lịch đặt đơn hàng, và danh sách đánh giá.
  - [ ] Code dialog đổi role và dialog xác nhận xóa tài khoản.
  - [ ] Thêm từ khóa đa ngôn ngữ vào `vi` và `en` locale files.
- [ ] Tích hợp Data & Interactions:
  - [ ] Wire các query hooks để lấy thông tin.
  - [ ] Wire các mutations (đổi role, khóa tài khoản, xóa tài khoản) kèm xử lý loading/disabled.
  - [ ] Xử lý các edge cases (tự thao tác trên bản thân, các lỗi API).
- [ ] Kiểm thử & Hoàn thiện:
  - [ ] Chạy `npm run prepush:check` đảm bảo không có lỗi TypeScript hoặc linting.
  - [ ] Tạo báo cáo review.md.

---

## 13) Files / Areas Likely To Change

### Backend (`danangtrip-api`)
- [UserRepository.php](file:///D:/DATN/danangtrip-api/app/Repositories/Eloquent/UserRepository.php)

### Frontend (`danangtrip-admin`)
- [endpoints.ts](file:///d:/DATN/danangtrip-admin/src/constants/endpoints.ts)
- [user.dataHelper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/user.dataHelper.ts)
- [user.mapper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/user.mapper.ts)
- [userApi.ts](file:///d:/DATN/danangtrip-admin/src/api/userApi.ts)
- [useUserQueries.ts](file:///d:/DATN/danangtrip-admin/src/hooks/useUserQueries.ts)
- [routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts)
- [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx)
- [UserTable.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Users/UserList/components/UserTable.tsx)
- [vi language file](file:///d:/DATN/danangtrip-admin/public/lang/vi/common.json) (hoặc namespace tương ứng)
- [en language file](file:///d:/DATN/danangtrip-admin/public/lang/en/common.json) (hoặc namespace tương ứng)
- [NEW] Thư mục trang `src/pages/Users/UserDetail`
