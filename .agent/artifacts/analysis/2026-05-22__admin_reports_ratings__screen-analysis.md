# Screen Analysis: Báo cáo Đánh giá (Ratings Report)

> Feature slug: `admin_reports_ratings`
> Date: 2026-05-22
> Mockup/SRS: [admin_reports_ratings.md](file:///D:/DATN/DATN_Document/docs/page/admin_reports_ratings.md)

---

## 1) Summary
- **Mục đích**: Màn hình này cung cấp cho người quản trị cái nhìn toàn diện, trực quan về phản hồi, đánh giá của người dùng đối với các Tour du lịch và Địa điểm trên hệ thống. Giúp theo dõi chất lượng dịch vụ, kiểm duyệt đánh giá và xuất dữ liệu thống kê ra file Excel phục vụ báo cáo.
- **Actor chính**: Admin / Staff (Quyền quản trị viên và nhân viên vận hành).
- **Module liên quan**: Báo cáo & Thống kê (Reports & Analytics).
- **Source inputs**:
  - Đặc tả màn hình: [admin_reports_ratings.md](file:///D:/DATN/DATN_Document/docs/page/admin_reports_ratings.md)
  - Hệ thống Design Tokens: [DESIGN.md](file:///d:/DATN/danangtrip-admin/DESIGN.md)
  - API Routes: `danangtrip-api/routes/api.php`
  - Constants Endpoints: `src/constants/endpoints.ts`
  - Location Reviews Component: `src/pages/Locations/LocationDetail/components/LocationReviewsTab.tsx`

---

## 2) Component Breakdown

### [REUSE] — Components đã có

| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `Sidebar` | `src/components/common/Sidebar.tsx` | Có | Cần thêm mục menu **"Báo cáo"** (Reports) và menu con **"Báo cáo Đánh giá"** (`/admin/reports/ratings`). |
| `Header` | `src/components/common/Header.tsx` | Không | Sử dụng header dùng chung của admin layout. |
| `EmptyState` | `src/components/common/EmptyState.tsx` | Không | Hiển thị khi biểu đồ hoặc bảng chi tiết không có dữ liệu. |
| `ProgressBar` | `src/components/ui/ProgressBar.tsx` | Không | Dùng hiển thị biểu đồ thanh ngang phân bố số sao (5★ -> 1★). |
| `Skeleton` | `src/components/ui/Skeleton.tsx` | Không | Dùng làm loading skeleton cho stats cards và các ô biểu đồ. |

### [NEW] — Components cần tạo mới

| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| `RatingsReport` | Trang chính chứa toàn bộ bố cục báo cáo đánh giá | Page | N/A (Route-level screen) |
| `ReportFilterBar` | Thanh điều khiển chứa bộ lọc ngày, quick-range pills, trạng thái duyệt và phân loại | Molecule | `ReportFilterBarProps` |
| `RatingStatsCards` | Hàng 4 thẻ thống kê chính (Tổng, Chờ duyệt, Đã duyệt, Điểm TB) kèm chỉ số tăng trưởng | Molecule | `RatingStatsCardsProps` |
| `RatingsReportCharts` | Khối chứa biểu đồ Recharts (Line xu hướng, Bar phân bố sao, Donut trạng thái, Grouped Bar loại ĐG) | Organism | `RatingsReportChartsProps` |
| `RatingsReportTable` | Bảng chi tiết danh sách đánh giá kèm phân trang và tính năng kiểm duyệt/xóa nhanh | Organism | `RatingsReportTableProps` |

### [MOD] — Components cần chỉnh sửa

| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| `Sidebar` | `src/components/common/Sidebar.tsx` | Chèn thêm mục menu **Báo cáo** và route con tương ứng. Khởi tạo trạng thái mở dropdown khi active. | Chỉ ảnh hưởng giao diện Sidebar trái, đảm bảo điều hướng hoạt động tốt. |

---

## 3) Responsive Behavior

| Breakpoint | Layout | Note |
|------------|--------|------|
| **Desktop** (≥1024px) | - Filter Bar xếp ngang trên 1 dòng.<br>- Stats Row chia thành lưới 4 cột (`grid-cols-4`).<br>- Biểu đồ Hàng 1 và Hàng 2 chia thành lưới 2 cột (`grid-cols-2`).<br>- Bảng hiển thị đầy đủ các cột và các nút thao tác. | Trải nghiệm chuẩn, hiển thị mật độ thông tin cao nhưng thoáng đãng. |
| **Tablet** (768px - 1023px) | - Filter Bar tự động xuống dòng và co giãn.<br>- Stats Row chuyển thành lưới 2x2 (`grid-cols-2`).<br>- Biểu đồ Hàng 1 và Hàng 2 chuyển thành 1 cột dọc (`grid-cols-1`).<br>- Bảng ẩn bớt cột không quan trọng (avatar người dùng, ngày tạo chi tiết), hỗ trợ cuộn ngang (`overflow-x-auto`). | Đảm bảo tính cân đối và dễ đọc cho các chỉ số biểu đồ. |
| **Mobile** (<768px) | - Filter Bar chuyển thành chiều dọc hoàn toàn (`flex-col items-stretch`).<br>- Stats Row xếp chồng dọc 1 cột (`grid-cols-1`).<br>- Toàn bộ biểu đồ xếp chồng dọc.<br>- Bảng chi tiết tối giản hóa chỉ hiển thị cột Người dùng, Số sao/Đánh giá, Trạng thái, kèm thanh cuộn ngang mượt mà. | Tối ưu hóa không gian hiển thị hẹp, nút bấm to và dễ chạm. |

---

## 4) UI States

| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| **Stats Row** | Hiển thị 4 khối `Skeleton` hình chữ nhật bo góc. | Hiển thị giá trị là `0` hoặc `--` tùy thuộc vào kết quả API. | Hiển thị `--` và biểu tượng cảnh báo nhỏ. | Render số liệu thực tế kèm hiệu ứng số chạy nhẹ. | N/A | N/A |
| **Biểu đồ chính** | Hiển thị skeleton chiều cao `240px` mô phỏng khu vực vẽ chart. | Hiển thị thông báo "Không có dữ liệu trong khoảng thời gian này". | Hiển thị "Lỗi tải biểu đồ. Vui lòng thử lại". | Vẽ biểu đồ Recharts tương tác mượt mà khi hover. | N/A | Hiển thị Tooltip chi tiết khi rê chuột vào điểm dữ liệu. |
| **Bảng chi tiết** | Hiển thị 10 hàng skeleton dòng và thanh phân trang skeleton. | Hiển thị component `EmptyState` với thông điệp thích hợp. | Hiển thị dòng thông báo lỗi màu đỏ kèm nút "Thử lại". | Hiển thị danh sách đánh giá thực tế và thanh phân trang. | Các nút Duyệt/Từ chối bị vô hiệu hóa khi đang gửi API. | Hover dòng đổi màu nền (`hover:bg-slate-50`), link điểm đến có gạch chân. |
| **Nút Xuất Excel** | Thay thế bằng biểu tượng spinner quay và vô hiệu hóa nút bấm. | N/A (luôn hiển thị). | Hiển thị Toast thông báo lỗi xuất file. | Toast thông báo xuất thành công và tự động tải file. | Bị vô hiệu hóa khi bộ dữ liệu trống hoặc đang thực hiện xuất. | Tăng độ sáng viền hoặc đổi màu nền nhẹ nhàng. |

---

## 5) Data Fields

| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `total_count` | `number` | ✓ | ≥ 0 | `1024` | `GET /admin/reports/ratings` |
| `pending_count` | `number` | ✓ | ≥ 0 | `18` | `GET /admin/reports/ratings` |
| `approved_count` | `number` | ✓ | ≥ 0 | `986` | `GET /admin/reports/ratings` |
| `average_score` | `number` | ✓ | 1.0 – 5.0 | `4.7` | `GET /admin/reports/ratings` |
| `trend_total` | `number` | ✗ | Phần trăm | `8.3` | `GET /admin/reports/ratings` |
| `trend_approved` | `number` | ✗ | Phần trăm | `-1.2` | `GET /admin/reports/ratings` |
| `trend_pending` | `number` | ✗ | Phần trăm | `5.0` | `GET /admin/reports/ratings` |
| `trend_average` | `number` | ✗ | Phần trăm | `0.5` | `GET /admin/reports/ratings` |
| `ratings_list` | `array` | ✓ | Mảng đối tượng | `[RawRating, ...]` | `GET /admin/reports/ratings` |

---

## 6) API Endpoints

| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| `GET` | `/admin/reports/ratings` | ✓ | Query: `from`, `to`, `status`, `type`, `page`, `per_page` | `ApiResponse<RawRatingsReport>` (Thống kê + Danh sách) | ✓ (Thêm vào endpoints) |
| `GET` | `/admin/ratings/export` | ✓ | Query: `status`, `date_from`, `date_to`, `type` | `AxiosResponse<Blob>` (File Excel) | ✓ (Thêm vào endpoints) |
| `PATCH` | `/admin/ratings/{id}/approve` | ✓ | Params: `id` | `ApiResponse` (Duyệt đánh giá) | ✓ (Thêm vào endpoints) |
| `PATCH` | `/admin/ratings/{id}/reject` | ✓ | Params: `id` | `ApiResponse` (Từ chối đánh giá) | ✓ (Thêm vào endpoints) |
| `DELETE`| `/admin/ratings/{id}` | ✓ | Params: `id` | `ApiResponse` (Xóa đánh giá) | ✓ (Thêm vào endpoints) |

---

## 7) Mapper Requirements

| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| `rawRatingStats` | `object` | `RatingStatsViewModel` | Chuyển đổi mảng phân bố sao thô thành mảng phân trăm hiển thị trên biểu đồ ngang. |
| `rawTrends` | `array` | `TrendChartData[]` | Chuẩn hóa định dạng ngày từ API (ví dụ: `2026-05-22`) thành nhãn dễ đọc (ví dụ: `22/05`) cho trục X. |
| `rawRating` | `object` | `RatingViewModel` | Sử dụng helper mappers tương tự `LocationReviewsTab.tsx` để lấy tên user, avatar, định dạng ngày tháng tạo. |

---

## 8) Business Rules
- **BR-01 (Phân quyền truy cập)**: Chỉ người dùng có role là `admin` hoặc `staff` mới được quyền truy cập màn hình báo cáo đánh giá. Giao diện Sidebar chỉ hiển thị nhóm Báo cáo nếu tài khoản có quyền hợp lệ.
- **BR-02 (Tương tác bộ lọc)**: Bộ lọc thời gian mặc định sẽ lấy từ ngày 1 của tháng hiện tại cho đến ngày hôm nay. Khi nhấn nút "Áp dụng" hoặc thay đổi bộ lọc nhanh (Quick range), toàn bộ biểu đồ và bảng phải được làm mới (invalidation và fetch lại).
- **BR-03 (Phê duyệt tức thời)**: Thao tác duyệt/từ chối nhanh một đánh giá trực tiếp từ bảng chi tiết phải lập tức cập nhật lại trạng thái dòng đó mà không cần tải lại toàn bộ trang, tuy nhiên phải kích hoạt làm mới (invalidate) query thống kê trên hàng chỉ số và biểu đồ phân bố để số liệu luôn chính xác 100%.

---

## 9) Actors & Permissions

| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| **Admin** | Truy cập màn hình, xem mọi chỉ số biểu đồ, lọc dữ liệu, xuất Excel, phê duyệt/từ chối đánh giá, xóa đánh giá vĩnh viễn. | Không có giới hạn. | Quyền tối cao. |
| **Staff** | Truy cập màn hình, xem số liệu, lọc dữ liệu, xuất Excel, phê duyệt/từ chối đánh giá. | Không được phép xóa đánh giá vĩnh viễn (nút xóa bị ẩn hoặc vô hiệu hóa). | Nhân viên vận hành điều hành kiểm duyệt. |
| **User/Guest** | Không được phép truy cập. Hệ thống tự động chuyển hướng về `/login` hoặc báo lỗi 403. | Không làm được gì. | Bị chặn bởi `PrivateRoute`. |

---

## 10) Edge Cases
- **EC-01 (Khoảng ngày nghịch đảo)**: Người dùng chọn ngày "Từ ngày" lớn hơn "Đến ngày".
  - *Giải pháp*: Khi nhấn áp dụng hoặc chọn ngày mới, hệ thống tự động đổi giá trị ngày còn lại hoặc báo lỗi inline cảnh báo không cho phép gửi yêu cầu không hợp lệ.
- **EC-02 (Dữ liệu trống hoàn toàn)**: Khoảng thời gian được chọn không có bất kỳ đánh giá nào.
  - *Giải pháp*: Tất cả các biểu đồ hiển thị nhãn rỗng nhẹ nhàng, Stats Cards hiển thị `0` và `--`, bảng chi tiết hiển thị `EmptyState` chứa văn bản "Không tìm thấy đánh giá nào". Không xảy ra lỗi crash ứng dụng hoặc lỗi trắng trang.
- **EC-03 (Token hết hạn giữa chừng)**: Người dùng đang thao tác duyệt hoặc xuất Excel nhưng phiên làm việc hết hạn.
  - *Giải pháp*: `axiosClient` tự động bắt mã lỗi 401, hiển thị Toast cảnh báo và điều hướng người dùng về trang đăng nhập một cách mượt mà.

---

## 11) Assumptions & Open Questions

### Assumptions
- **A-01**: Biểu đồ Recharts xu hướng theo ngày/tuần/tháng sẽ được nhóm tự động dựa trên khoảng thời gian lọc (ví dụ: lọc dưới 30 ngày -> nhóm theo ngày, lọc từ 30 ngày đến 3 tháng -> nhóm theo tuần, lọc trên 3 tháng -> nhóm theo tháng) hoặc hiển thị theo dữ liệu trả về trực tiếp từ API `/admin/reports/ratings`.
- **A-02**: File Excel tải xuống sẽ giữ nguyên các tham số lọc hiện tại của người dùng để đảm bảo tính nhất quán (xuất đúng những gì đang nhìn thấy trên màn hình).

### Open Questions
- **Q-01**: *Phản hồi API cho biểu đồ xu hướng `/admin/reports/ratings` có dạng danh sách ngày cụ thể hay dạng cấu trúc phân cấp tuần/tháng?*
  - *Giải pháp*: Chúng ta sẽ xử lý linh hoạt trong mapper, chuyển đổi định dạng ngày trả về từ API thành nhãn hiển thị trực quan và cấu trúc hóa dữ liệu biểu đồ Recharts một cách an toàn.

---

## 12) Implementation Checklist
- [ ] **Types & API contract** (03-types-api-contract)
  - Khai báo kiểu dữ liệu thống kê, dữ liệu biểu đồ và kiểu tham số bộ lọc.
  - Định nghĩa các endpoint mới trong `src/constants/endpoints.ts`.
  - Khởi tạo API service `src/api/reportApi.ts`.
- [ ] **Route & layout** (04-layout-routing)
  - Đăng ký path trong `routes.ts`.
  - Lazy load trang trong `src/routes/index.tsx`.
  - Thêm menu Báo cáo Đánh giá vào `Sidebar.tsx`.
- [ ] **UI components**
  - Scaffold cấu trúc trang `RatingsReport`.
  - Phát triển các thành phần con: `ReportFilterBar`, `RatingStatsCards`, `RatingsReportCharts`, `RatingsReportTable`.
- [ ] **Data integration**
  - Viết hook `useRatingsReportQuery` sử dụng `@tanstack/react-query`.
  - Viết hook mutation cho xuất Excel và phê duyệt/từ chối đánh giá.
  - Tích hợp mappers xử lý dữ liệu biểu đồ và bảng chi tiết một cách an toàn.
- [ ] **Interactions**
  - Xử lý đồng bộ các tham số lọc lên URL query params (để lưu trạng thái lọc khi reload).
  - Tích hợp tính năng click nút xuất Excel có loading spinner.
  - Phân trang bảng chi tiết đánh giá.
- [ ] **Auth/permissions**
  - Đảm bảo trang được bảo vệ bởi `PrivateRoute` (chỉ admin/staff truy cập được).
- [ ] **Testing**
  - Chạy `npm run prepush:check` để kiểm tra TypeScript, Lint và Build thành công.
- [ ] **Deploy / Review**
  - Sinh báo cáo review và deploy trước khi bàn giao.

---

## 13) Files / Areas Likely To Change
- `src/constants/endpoints.ts` (Thêm API endpoints mới)
- `src/routes/routes.ts` & `src/routes/index.tsx` (Đăng ký router)
- `src/components/common/Sidebar.tsx` (Thêm định tuyến sidebar)
- `src/api/` (Thêm `reportApi.ts` mới)
- `src/hooks/` (Thêm `useReportQueries.ts` mới)
- `src/dataHelper/` (Thêm mapper `report.mapper.ts` và helper types)
- `src/pages/` (Tạo mới thư mục và các file cho `Reports/RatingsReport`)
- `public/lang/vi/common.json` & `public/lang/en/common.json` (Bổ sung từ khóa dịch thuật tiếng Việt/Anh)
