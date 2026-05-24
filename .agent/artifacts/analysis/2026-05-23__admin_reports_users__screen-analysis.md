# Screen Analysis: Admin Users Report (`admin_reports_users`)

> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> Mockup/SRS: `D:\DATN\DATN_Document\docs\page\admin_reports_users.md`

---

## 1) Summary
- **Mục tiêu:** Màn hình này phục vụ mục đích theo dõi tốc độ tăng trưởng người dùng đăng ký mới theo thời gian (tháng/năm), thống kê cấu trúc phân bổ và hỗ trợ xuất dữ liệu danh sách người dùng ra bảng tính Excel.
- **Actor chính:** Quản trị viên hệ thống (Admin) và Nhân viên vận hành (Staff).
- **Thuộc nhóm chức năng:** Báo cáo & Thống kê (Reports & Analytics).
- **Source inputs đã dùng:** 
  - Tài liệu đặc tả giao diện: `D:\DATN\DATN_Document\docs\page\admin_reports_users.md`
  - Code thực tế của Backend controllers: `DashboardController.php`, `UserController.php`
  - Các cấu trúc báo cáo sẵn có: `BookingsReport`, `RevenueReport`, `LocationReport` để đảm bảo tính đồng bộ về giao diện và kiến trúc dữ liệu.

---

## 2) Component Breakdown

### [REUSE] — Components đã có
| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `MainLayout` | `src/layouts/MainLayout.tsx` | Không | Layout bao ngoài hệ thống chính |
| `StatCard` | `src/components/common/StatCard.tsx` | Không | Thẻ hiển thị các chỉ số KPI số liệu lớn |
| `EmptyState` | `src/components/common/EmptyState.tsx` | Không | Hiển thị khi biểu đồ hoặc bảng không có dữ liệu |
| `ErrorWidget` | `src/components/common/ErrorWidget.tsx` | Không | Widget thông báo lỗi và cung cấp nút thử lại (Retry) |

### [NEW] — Components cần tạo mới (Dưới `src/pages/Reports/UsersReport/components/`)
| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| `UsersReportFilterBar` | Thanh điều hướng bộ lọc Năm (Report) + Role/Status (Export) | Molecule | `{ filters: UsersReportFilters & UsersExportFilters, onFilterChange: (updated: Partial<filters>) => void, onApply: () => void, onReset: () => void, isSubmitting: boolean }` |
| `UsersStatsCards` | Hàng thẻ hiển thị các chỉ số KPI tăng trưởng người dùng | Molecule | `{ stats: UsersReportViewModel['stats'], isLoading: boolean }` |
| `UsersReportCharts` | Biểu đồ Recharts Area & Bar trực quan hóa số lượng đăng ký mới | Organism | `{ data: UsersReportViewModel['stats'], isLoading: boolean }` |
| `UsersReportTable` | Bảng liệt kê chi tiết: Tháng, Số lượng mới, Tổng lũy kế tăng dần | Organism | `{ data: UsersReportViewModel['stats'], isLoading: boolean }` |

### [MOD] — Components cần chỉnh sửa
| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| `Sidebar` | `src/components/common/Sidebar.tsx` | Thêm phần tử `{ label: 'sidebar.reports_users', path: ROUTES.REPORTS_USERS }` vào mảng `navItems` | Bổ sung liên kết trên menu Sidebar bên trái dưới nhóm Báo cáo |

---

## 3) Responsive Behavior
| Breakpoint | Layout | Note |
|------------|--------|------|
| Desktop (≥1024px) | Bố cục 3 cột cho KPI, biểu đồ rộng 100%, bảng và biểu đồ xếp dọc hợp lý. Khoảng cách biên đệm 24px-32px (p-6 md:p-8). | Baseline chuẩn hệ thống Admin |
| Tablet (768-1023px) | Thẻ KPI chuyển thành grid 2 cột (1 thẻ rớt xuống dòng hoặc giãn rộng). Biểu đồ và bảng thu gọn vừa vặn chiều ngang. | Trải nghiệm mượt mà trên iPad |
| Mobile (<768px) | Tất cả thẻ KPI xếp chồng dọc. Biểu đồ thu nhỏ chiều cao. Bảng hiển thị thanh cuộn ngang tự động (custom-scrollbar). Nút xuất báo cáo và công tắc Mock Mode chuyển thành hàng linh hoạt. | Trải nghiệm tối ưu trên màn hình dọc điện thoại |

---

## 4) UI States
| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| **Filter Bar** | Các nút chuyển trạng thái disabled, ẩn icon hành động | N/A | Khung đỏ viền input nếu năm nhập sai | Cho phép chọn lại | Khóa tương tác khi đang fetch | Đổi màu nền nhẹ, hiển thị outline mảnh |
| **KPI Cards** | Hiển thị hiệu ứng Skeleton nhấp nháy (pulsing) | Hiển thị giá trị `0` hoặc `-` | Hiển thị dấu `-` | Hiện số liệu dạng to màu thẫm | N/A | N/A |
| **Growth Chart** | Skeleton dạng hộp xám nhấp nháy | Biểu đồ phẳng lì với 12 tháng đều nhận giá trị `0` | Ẩn biểu đồ, hiển thị banner lỗi | Vẽ đồ thị Area màu xanh ngọc lam mượt mà | N/A | Hiển thị Tooltip kính mờ (glassmorphism) |
| **Monthly Table** | Render 5 hàng Skeleton giả lập dữ liệu bảng | Hiển thị "Không có dữ liệu báo cáo" | Hiển thị `ErrorWidget` có nút thử lại | Hiển thị danh sách 12 tháng đầy đủ | N/A | Đổi màu nền hàng khi di chuột qua |
| **Export Action** | Icon quay vòng (Spinner), nút giảm độ mờ (opacity) | Khóa nút nếu mảng dữ liệu rỗng | Hiển thị Toast đỏ báo lỗi kết nối | Tải file Excel tự động về máy, báo Toast xanh lá | Disabled khi đang tải dữ liệu hoặc đang xuất | Độ sáng nút thay đổi nhẹ, thu hẹp kích thước 95% khi bấm |

---

## 5) Data Fields
| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `year` | `number` | ✓ | Số nguyên, trong khoảng `[2000 - 2027]` | `2026` | `GET /admin/reports/users?year=YYYY` |
| `month` | `number` | ✓ | Số nguyên từ `1` đến `12` | `5` | Trả về từ mảng `stats` trong báo cáo |
| `count` | `number` | ✓ | Lớn hơn hoặc bằng `0` | `28` | Trả về từ mảng `stats` trong báo cáo |
| `role` | `string` | ✗ | Chỉ nhận `admin` hoặc `user` | `user` | Chỉ dùng cho bộ lọc Xuất (`/admin/users/export`) |
| `status` | `string` | ✗ | Chỉ nhận `active` hoặc `banned` | `active` | Chỉ dùng cho bộ lọc Xuất (`/admin/users/export`) |

---

## 6) API Endpoints
| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| `GET` | `/admin/reports/users` | Có | `?year=YYYY` | `{ year: number, stats: { month: number, count: number }[] }` | **Cần thêm** |
| `GET` | `/admin/users/export` | Có | `?role=role&status=status` | Binary Excel file (`Blob`) | **Cần thêm** |

---

## 7) Mapper Requirements
| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| `stats` | `Array` | `stats` | **Bắt buộc lấp đầy 12 tháng:** Khởi tạo một mảng chứa 12 tháng (từ 1 đến 12). Duyệt qua kết quả API, tháng nào có dữ liệu thì cập nhật số lượng `count`, tháng nào bị khuyết thì đặt mặc định `count = 0`. |
| `month` | `number` | `label` | Ánh xạ mã tháng số sang nhãn bản dịch i18n phù hợp (ví dụ: `month.1` tương ứng "Tháng 1" / "January"). |
| `count` | `number` | `cumulativeCount` | **Tính toán tích lũy:** Tạo một biến đếm cộng dồn qua từng tháng để hiển thị cột "Tổng lũy kế" tăng dần trong năm. |

---

## 8) Business Rules
- **BR-01 (Giới hạn lọc Năm):** Bộ lọc năm chỉ nhận số có 4 chữ số, tối đa là năm 2027 (theo quy định của backend validator `UserReportsDashboardRequest`). Mặc định khởi tạo là năm hiện tại.
- **BR-02 (Tự động lấp đầy):** Nếu API trả về mảng rỗng hoặc thiếu tháng (do tháng đó không có user nào đăng ký), Frontend bắt buộc tự động chèn đầy đủ 12 tháng với giá trị đăng ký mới bằng `0` để vẽ biểu đồ và bảng đầy đủ.
- **BR-03 (Chỉ Staff/Admin được xem):** Chỉ người dùng có token hợp lệ và vai trò là `admin` hoặc `staff` mới được quyền truy cập màn hình này. Mọi truy cập bất hợp pháp sẽ bị chuyển hướng về `/login` hoặc trang báo lỗi `403`.

---

## 9) Actors & Permissions
| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| **admin** | Xem toàn bộ báo cáo, thay đổi năm, xuất tệp Excel không hạn chế bộ lọc. | Không có hạn chế. | Quyền tối cao hệ thống. |
| **staff** | Xem báo cáo, đổi năm, xuất tệp Excel. | Không thể thay đổi các cài đặt người dùng tại các màn cấu hình admin sâu nếu thiếu quyền. | Nhân viên vận hành được phép xem báo cáo số liệu. |
| **guest** | Không thể xem bất kỳ nội dung nào. | Bị chặn từ lớp Router Guard (`PrivateRoute`). | |

---

## 10) Edge Cases
- **EC-01 (Kết nối lỗi mạng hoặc API sập):** Hiển thị trực quan `ErrorWidget` thay cho biểu đồ và bảng, cung cấp nút "Thử lại" (`refetch`) để người dùng tải lại trang mà không cần reset thủ công.
- **EC-02 (Nhấp xuất Excel khi không có dữ liệu):** Vô hiệu hóa (disable) nút Xuất dữ liệu nếu tổng số lượng đăng ký mới trong năm bằng `0` để tránh tạo ra file rỗng vô nghĩa.
- **EC-03 (Xử lý Export trong Mock Mode):** Nếu đang bật chế độ dữ liệu giả lập (Mock Mode), khi bấm nút Xuất Excel, hệ thống sẽ hiển thị toast loading giả lập, sau đó tạo trực tiếp và tải xuống file CSV giả từ mảng Mock data nhằm mang lại phản hồi chân thực nhất cho người dùng.

---

## 11) Assumptions & Open Questions
### Assumptions
- **[ASSUMPTION] A-01:** Phối màu của biểu đồ tăng trưởng người dùng sẽ tái sử dụng mã màu Teal ngọc lam chủ đạo (`#14b8a6`) của hệ thống báo cáo hiện hành để duy trì trải nghiệm thị giác cao cấp, đồng nhất.
- **[ASSUMPTION] A-02:** Backend không hỗ trợ lọc role/status trực tiếp trên biểu đồ báo cáo người dùng. Do đó, các bộ lọc này chỉ truyền đi dưới dạng tham số của API export dữ liệu.

### Open Questions
- **Q-01:** Đối với thẻ KPI "Tổng số lượng người dùng", do API báo cáo năm không trả về tổng số lượng toàn cục. Chúng ta sẽ hiển thị trạng thái `N/A` kèm giải thích hợp lý, HOẶC nếu hệ thống muốn hiển thị sống động, ta sẽ lấy chỉ số tổng này từ API chung `/admin/dashboard/stats` nếu nó đã được nạp sẵn. *Quyết định:* Sẽ lấy từ API chung `/admin/dashboard/stats` để thẻ KPI sinh động nhất, nếu API này trả về thành công.

---

## 12) Implementation Checklist
- [ ] Định nghĩa kiểu dữ liệu và hợp đồng API trong `report.dataHelper.ts` (Bước 03)
- [ ] Thực hiện mapper xử lý chuyển đổi dữ liệu và lấp đầy 12 tháng trong `report.mapper.ts` (Bước 03)
- [ ] Khai báo endpoints API và cấu hình hàm gọi trong `reportApi.ts` & `useReportQueries.ts` (Bước 03)
- [ ] Cấu hình hằng số đường dẫn và đăng ký Route, lazy load trong `routes.ts` & `routes/index.tsx` (Bước 04)
- [ ] Wires thêm menu Sidebar trong `Sidebar.tsx` và dịch bản dịch i18n cho Sidebar (Bước 04)
- [ ] Thiết kế và cài đặt cấu trúc trang báo cáo cùng 4 components con dưới `src/pages/Reports/UsersReport/` (Bước 05)
- [ ] Tích hợp React Query, xử lý Mock Mode và đồng bộ bộ lọc (Bước 06)
- [ ] Đồng bộ URL search params và xác thực validate bộ lọc Năm (Bước 07)
- [ ] Kiểm thử biên, chạy typecheck, linter kiểm tra và đóng gói dự án thành công (Bước 09)

---

## 13) Files / Areas Likely To Change
- `src/constants/endpoints.ts` (Khai báo API endpoints mới)
- `src/routes/routes.ts` (Khai báo đường dẫn mới)
- `src/routes/index.tsx` (Đăng ký router component)
- `src/components/common/Sidebar.tsx` (Gắn menu con)
- `src/api/reportApi.ts` (Hàm gọi API)
- `src/hooks/useReportQueries.ts` (React Query hooks)
- `src/dataHelper/report.dataHelper.ts` (Định nghĩa TypeScript types)
- `src/dataHelper/report.mapper.ts` (Mapper chuyển đổi cấu trúc API thành ViewModel)
- `public/lang/vi/common.json` & `public/lang/en/common.json` (Bổ sung nhãn Sidebar)
- `public/lang/vi/users_report.json` & `public/lang/en/users_report.json` (Hồ sơ bản dịch chi tiết)
- `src/pages/Reports/UsersReport/` (Trang giao diện chính và các components trực quan)
