# Auth & Permissions Review: Báo cáo Địa điểm
2: 
3: > Feature slug: `admin-reports-locations`
4: > Date: 2026-05-22
5: > Route scope: `/admin/reports/locations`
6: 
7: ---
8: 
9: ## 1) Protected Routes
10: | Route | Guard | Required Role | Redirect Behavior | Notes |
11: |---|---|---|---|---|
12: | `/admin/reports/locations` | `PrivateRoute` | `admin` | Chuyển hướng về trang `/login` nếu chưa xác thực hoặc không có role `admin`. | Tự động kế thừa `MainLayout` và kiểm soát phiên đăng nhập thông qua `useAuth()`. |
13: 
14: ## 2) Role Matrix
15: | Role | View | Create | Update | Delete | Export | Notes |
16: |---|---|---|---|---|---|---|
17: | **admin** | ✓ | N/A | N/A | N/A | ✓ | Quyền tối cao: Được phép truy cập trang báo cáo và tải file CSV chứa số liệu chi tiết. |
18: | **user** | ✗ | ✗ | ✗ | ✗ | ✗ | Khách hàng vãng lai/người dùng đầu cuối: Tuyệt đối bị chặn truy cập và không được gọi API báo cáo. |
19: 
20: ## 2.1) Action Matrix
21: | Action | Allowed Role(s) | UI Behavior | Backend Expectation | Notes |
22: |---|---|---|---|---|
23: | **Xem Báo cáo phân bổ địa điểm** | `admin` | Render đầy đủ biểu đồ, thẻ thống kê (Stats Cards), và bảng số liệu phân chia theo danh mục/quận huyện. | API `GET /api/v1/admin/reports/locations` trả về mảng số liệu thô phân bổ địa điểm. | Cung cấp thông tin tổng quan phục vụ việc quản trị địa lý và danh mục. |
24: | **Xuất file báo cáo (CSV)** | `admin` | Hiển thị nút "Xuất file CSV" (id: `location-report-export-btn`). Hỗ trợ loading spinner khi đang tiến hành gọi API xuất file. | Endpoint `GET /api/v1/admin/locations/export` trả về dữ liệu định dạng CSV nhị phân (Blob). | Bảo mật dữ liệu xuất qua cơ chế đính kèm Header token tự động. |
25: | **Sử dụng Chế độ giả lập (Mock Mode)** | `admin` | Nút chuyển đổi Mock Mode (id: `location-report-mock-toggle`) cho phép test UI trực quan khi mất kết nối backend. | Không gửi request lên backend thực tế. Tạo CSV giả lập ngay trên client. | Dùng để demo hoặc phát triển offline một cách an toàn. |
26: 
27: ## 3) Guarded UI Actions
28: | UI Element | Visible To | Why |
29: |---|---|---|
30: | **Toàn bộ trang Báo cáo Địa điểm** | `admin` | Chỉ quản trị viên mới được quyền xem thống kê phân bổ địa lý và dữ liệu kinh doanh của ứng dụng. |
31: | **Nút "Xuất file CSV"** | `admin` | Ngăn chặn rò rỉ dữ liệu thô hàng loạt cho các đối tượng khác. |
32: 
33: ## 3.1) Hidden vs Disabled Decisions
34: | UI Element | Hidden or Disabled | Reason | Risk |
35: |---|---|---|---|
36: | **Nút "Xuất file CSV" khi đang tải** | **Disabled** (Spinner hiển thị) | Tránh click đúp gửi trùng lặp nhiều request tải file lên server cùng lúc. | Người dùng gửi quá nhiều request làm chậm máy chủ -> Đã vô hiệu hóa nút bấm trong quá trình tải. |
37: | **Giao diện trang khi chưa đăng nhập** | **Hidden** (Redirect về `/login`) | Đảm bảo an toàn thông tin hệ thống, tránh lộ sơ đồ phân bổ của Đà Nẵng Trip. | Người dùng cố tình inspect DOM để xem layout -> Đã chặn triệt để bằng `PrivateRoute` ở lớp định tuyến cao nhất. |
38: 
39: ## 4) Token / Redirect Flow Review
40: | Area | Current Behavior | Expected Behavior | Status | Notes |
41: |---|---|---|---|---|
42: | **Token attach** | Tự động chèn header `Authorization: Bearer <token>` qua request interceptor của `axiosClient`. | Đính kèm Bearer token chính xác cho mọi request hướng tới backend. | **PASS** | Đảm bảo tính tập trung, không đính kèm thủ công ở API layer. |
43: | **Logout** | Clear tokens, reset Zustand store về `user: null`, chuyển hướng người dùng về màn hình Login. | Xóa sạch phiên đăng nhập, xóa storage và ngăn chặn nút "Back" quay lại màn Admin. | **PASS** | Xử lý tập trung ở `useUserStore.ts` và `axiosClient.ts`. |
44: | **Unauthorized redirect** | Nếu chưa có token, `PrivateRoute` lập tức chặn render `<Outlet />` và gọi `<Navigate to={ROUTES.LOGIN} replace />`. | Redirect nhanh chóng, không bị flash màn hình chính. | **PASS** | Trải nghiệm mượt mà, sử dụng component `<LoadingReact />` trong lúc bootstrapping. |
45: | **Wrong role redirect** | Người dùng có token nhưng không có role `admin` sẽ bị `PrivateRoute` redirect về `/login`. | Ngăn cản truy cập bất hợp pháp từ tài khoản user thường. | **PASS** | Kiểm soát bằng hàm `hasRole(user, 'admin')`. |
46: 
47: ## 5) Risks / Assumptions
48: - **[ASSUMPTION] A-01**: Hệ thống hiện tại phân quyền chung ở mức vai trò `admin`. Chưa có các vai trò nhỏ hơn như `auditor`, `reporter` chỉ được xem mà không được tải báo cáo.
49: - **[RISK] R-01**: Nếu Token hết hạn giữa chừng trong lúc click nút xuất file báo cáo, server sẽ trả về lỗi `401 Unauthorized`.
50:   * *Biện pháp giảm thiểu*: Interceptor phản hồi trong `axiosClient.ts` tự động bắt lỗi `401` và kích hoạt hàm `handleLogout` làm sạch bộ nhớ Zustand, sau đó chuyển hướng người dùng về `/login` một cách an toàn.
51: 
52: ## 6) Files / Areas Affected
53: - [PrivateRoute.tsx](file:///d:/DATN/danangtrip-admin/src/routes/PrivateRoute.tsx) (Kiểm duyệt token và role `admin`)
54: - [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx) (Đăng ký route trong cây Private)
55: - [useUserStore.ts](file:///d:/DATN/danangtrip-admin/src/store/useUserStore.ts) (Lưu trữ thông tin user và trạng thái `authReady`)
56: - [reportApi.ts](file:///d:/DATN/danangtrip-admin/src/api/reportApi.ts) (Các API thống kê và xuất file báo cáo địa điểm)
57: - [LocationReport/index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Reports/LocationReport/index.tsx) (Gated actions và loading states cho hành vi xuất CSV)
