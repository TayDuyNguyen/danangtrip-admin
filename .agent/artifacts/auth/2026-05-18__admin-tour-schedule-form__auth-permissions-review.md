# Auth & Permissions Review: Lịch khởi hành Tour

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Route scope: `/admin/tours/schedules/create`, `/admin/tours/schedules/:id/edit`

---

## 1) Protected Routes
| Route | Guard | Required Role | Redirect Behavior | Notes |
|---|---|---|---|---|
| `/admin/tours/schedules/create` | `PrivateRoute` | `admin` | Chuyển hướng về trang `/login` nếu chưa xác thực hoặc không có role `admin`. | Tự động kế thừa `MainLayout` và kiểm soát phiên đăng nhập. |
| `/admin/tours/schedules/:id/edit` | `PrivateRoute` | `admin` | Chuyển hướng về trang `/login` nếu chưa xác thực hoặc không có role `admin`. | Tự động bảo vệ lịch sử điều chỉnh dữ liệu quá khứ. |

## 2) Role Matrix
| Role | View | Create | Update | Delete | Export | Notes |
|---|---|---|---|---|---|---|
| **admin** | ✓ | ✓ | ✓ | ✓ | ✓ | Quyền tối cao: Được phép thực hiện tất cả thao tác điều chỉnh giá, xóa lịch và sửa đổi lịch quá khứ. |
| **user** | ✗ | ✗ | ✗ | ✗ | ✗ | Khách hàng vãng lai/người dùng đầu cuối: Tuyệt đối bị cấm truy cập bất kỳ route hoặc action quản trị nào. |

## 2.1) Action Matrix
| Action | Allowed Role(s) | UI Behavior | Backend Expectation | Notes |
|---|---|---|---|---|
| **Xem danh sách & chi tiết** | `admin` | Render đầy đủ giao diện danh sách, form điền và mock-preview. | API trả dữ liệu lịch khởi hành kèm thông tin tour liên kết. | Cho phép admin giám sát sức chứa và giá phòng. |
| **Tạo lịch khởi hành** | `admin` | Hiển thị form trống, nút "Thêm lịch" hoạt động kèm loading state khi pending. | Endpoint `POST /admin/tour-schedules` xác thực quyền admin. | Ngăn spam tạo trùng lặp lịch khởi hành qua disabled button. |
| **Cập nhật lịch (Tương lai)** | `admin` | Giao diện form chỉnh sửa đầy đủ, không có cảnh báo đặc biệt. | Endpoint `PUT /admin/tour-schedules/{id}` cập nhật thông tin thành công. | Cho phép điều chỉnh giá người lớn/trẻ em, sức chứa tùy ý. |
| **Cập nhật lịch (Quá khứ)** | `admin` | Hiển thị Form kèm **Banner hổ phách `PastEventWarning`** cảnh báo tác động dữ liệu cũ. | Endpoint `PUT /admin/tour-schedules/{id}` cho phép cập nhật, nhưng chặn chuyển ngày về tương lai nếu đã có booking. | Nghiệp vụ nhạy cảm liên quan đến thống kê/báo cáo tài chính lịch sử. |
| **Xóa lịch khởi hành** | `admin` | Nút xóa kích hoạt `<ConfirmDialog>` variant `destructive`. | Endpoint `DELETE /admin/tour-schedules/{id}` kiểm tra xem có booking nào chưa. Nếu có sẽ trả lỗi 400. | Ngăn chặn việc xóa nhầm lịch khởi hành đang có vé đã thanh toán. |

## 3) Guarded UI Actions
| UI Element | Visible To | Why |
|---|---|---|
| **Nút "Thêm lịch khởi hành"** | `admin` | Tránh việc người dùng có vai trò khác có thể click nút để spam API endpoint. |
| **Nút "Xóa lịch khởi hành"** | `admin` | Action hủy diệt dữ liệu nên chỉ hiện diện khi đăng nhập bằng tài khoản quản trị viên. |
| **Cảnh báo Lịch quá khứ (`PastEventWarning`)** | `admin` (Chỉ hiện khi `isPastSchedule === true`) | Nhắc nhở người vận hành cực kỳ cẩn trọng khi sửa đổi thông tin lịch sử của tour. |

## 3.1) Hidden vs Disabled Decisions
| UI Element | Hidden or Disabled | Reason | Risk |
|---|---|---|---|
| **Form chỉnh sửa lịch** | Ẩn hoàn toàn (Redirect về Login) | Bảo vệ tính toàn vẹn của hệ thống quản trị, ngăn chặn dò quét route. | User cố tình gõ link trực tiếp -> Đã được chặn triệt để bằng `PrivateRoute` ở router layer. |
| **Nút "Lưu/Cập nhật" khi đang Pending** | **Disabled** (vô hiệu hóa kèm spinner) | Ngăn người dùng nhấp chuột hai lần liên tiếp gây trùng request. | Double request trùng lặp bản ghi trên cơ sở dữ liệu -> Đã kiểm soát cứng ở client. |

## 4) Token / Redirect Flow Review
| Area | Current Behavior | Expected Behavior | Status | Notes |
|---|---|---|---|---|
| **Token attach** | Tự động đính kèm `Authorization: Bearer <token>` thông qua request interceptor của `axiosClient`. | Đính kèm Bearer token chính xác cho mọi request hướng tới backend. | **PASS** | Đã cấu hình tập trung tại `axiosClient.ts`. |
| **Logout** | Zustand store xóa sạch `user: null`, gọi hàm `clearTokens()`, và điều hướng người dùng về màn Login. | Xóa sạch phiên đăng nhập, xóa storage và ngăn việc back lại màn Admin. | **PASS** | Hoàn thành dọn dẹp bộ nhớ state Zustand. |
| **Unauthorized redirect** | Nếu chưa có token, `PrivateRoute` lập tức chặn render `<Outlet />` và gọi `<Navigate to={ROUTES.LOGIN} replace />`. | Redirect nhanh chóng, không bị flash màn hình chính. | **PASS** | Trải nghiệm mượt mà, sử dụng component `<LoadingReact />` trong lúc bootstrapping. |
| **Wrong role redirect** | Người dùng có token nhưng không có role `admin` (ví dụ khách hàng thường bấm nhầm link) sẽ bị redirect thẳng về `/login`. | Ngăn cản truy cập bất hợp pháp. | **PASS** | Kiểm soát bằng hàm `hasRole(user, 'admin')`. |

## 5) Risks / Assumptions
- **[ASSUMPTION] A-01**: Quyền quản trị hệ thống phân phối chung cho tất cả các tài khoản có role `'admin'`. Hiện chưa có phân quyền chi tiết hơn (như `tour_manager`, `editor`).
- **[RISK] R-01**: Phía API Backend chưa kiểm tra chặt chẽ việc xóa lịch khởi hành có liên quan đến các hóa đơn/lượt đặt vé đã thanh toán.
  * *Biện pháp giảm thiểu*: Giao diện Admin đã hiển thị cảnh báo từ chối hành động và phía frontend cũng đề xuất backend thiết lập khóa ngoại cứng trên DB.

## 6) Files / Areas Affected
- [PrivateRoute.tsx](file:///d:/DATN/danangtrip-admin/src/routes/PrivateRoute.tsx) (Kiểm duyệt token và role `admin`)
- [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx) (Đăng ký route trong cây Private)
- [useUserStore.ts](file:///d:/DATN/danangtrip-admin/src/store/useUserStore.ts) (Lưu trữ thông tin user và trạng thái `authReady`)
- [TourScheduleEdit/index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleEdit/index.tsx) (Gated actions và warning banner)
