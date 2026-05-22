# Phân tích Màn hình Báo cáo Địa điểm (admin_reports_locations)

> **Ngày tạo:** 22/05/2026  
> **Feature Slug:** `admin_reports_locations`  
> **Route chính:** `/admin/reports/locations`  
> **Quyền truy cập:** 🛡️ Admin / Staff (Chỉ dành cho quản trị viên đã đăng nhập)  
> **Tài liệu nguồn:** `D:\DATN\DATN_Tài liệu\docs\page\admin_reports_locations.md`

---

## 1. Mục tiêu Nghiệp vụ & Triết lý Thiết kế

Màn hình **Báo cáo Địa điểm** cung cấp một cái nhìn tổng quan, trực quan và chi tiết về chất lượng nội dung, tần suất truy cập, mức độ yêu thích và sự phân bổ của các địa điểm du lịch trên địa bàn thành phố Đà Nẵng. Thông qua đó, ban quản trị (Admin/Staff) có thể đánh giá danh mục nào đang thu hút nhất, quận/huyện nào là trọng điểm du lịch, và địa điểm cụ thể nào hoạt động hiệu quả nhất dựa trên lượt xem, lượt yêu thích và đánh giá thực tế.

### Triết lý Thiết kế UI/UX (Aesthetics First):
- **Premium Glassmorphism**: Kế thừa trực tiếp ngôn ngữ thiết kế của Dashboard và RevenueReport hiện tại với hiệu ứng kính mờ (`backdrop-blur-md bg-white/80`), viền hairline mảnh mai (`border-slate-100`), và bóng đổ mỏng (`shadow-xs`) tạo chiều sâu.
- **Dynamic Micro-animations**: Tương tác mượt mà (hover scale nhẹ, transition màu sắc 150ms) trên các thẻ số liệu KPI, các phần tử biểu đồ và dòng dữ liệu trong bảng.
- **Trực quan hóa dữ liệu (Recharts)**: Phối màu chủ đạo trang nhã và đồng bộ:
  - **#14b8a6 (Teal - Primary)** cho các chỉ số hoạt động / Active.
  - **#3b82f6 (Blue)** cho các chỉ số chung và phân bổ quận/huyện.
  - **#f59e0b (Amber)** cho các địa điểm nổi bật / Featured và phân bổ danh mục.
- **Resilient Mock/Real Toggle**: Giữ vững nút chuyển đổi chế độ Mock Mode để phục vụ việc kiểm thử giao diện mượt mà và trực quan ngay cả khi cơ sở dữ liệu backend chưa có đầy đủ seedings.

---

## 2. Phân rã Bố cục Giao diện (Layout Breakdown)

Giao diện trang được phân chia theo cấu trúc lưới (Grid) chuẩn 4px của hệ thống thiết kế `DESIGN.md`:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. HEADER: Breadcrumb + Tiêu đề + [Mock Toggle] [Xuất CSV/Excel]│
├─────────────────────────────────────────────────────────────────┤
│ 2. FILTER BAR: Khoảng ngày + Danh mục + Quận/Huyện + Trạng thái │
│                + Các phím lọc nhanh khoảng ngày (Pills)         │
├─────────────────────────────────────────────────────────────────┤
│ 3. KPI STATS ROW:                                               │
│    [Tổng địa điểm] [Địa điểm hoạt động] [Đã nổi bật] [Tổng xem] │
├─────────────────────────────────────────────────────────────────┤
│ 4. BIỂU ĐỒ TRỰC QUAN (HÀNG 1 - 2 cột):                           │
│    - [Donut/Pie: Phân bổ theo Danh mục] | - [Bar: Phân bổ theo Quận]│
├─────────────────────────────────────────────────────────────────┤
│ 5. TABS TOP LISTS (HÀNG 2 - 1 cột):                             │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Tab 1: Top Lượt xem | Tab 2: Top Yêu thích | Tab 3: Top Rating │  │
│    ├─────────────────────────────────────────────────────────┤  │
│    │ Bảng danh sách chi tiết (5-10 dòng) + Phân trang mượt   │  │
│    └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Chi tiết các khối UI:
1. **Page Header**:
   - Breadcrumb: `Trang chủ` / `Báo cáo` / `Báo cáo Địa điểm`.
   - Tiêu đề chính: "Báo cáo Địa điểm" kèm dòng mô tả phụ.
   - Nút bật tắt chế độ giả lập (Mock Mode Toggle): Hiển thị trạng thái On/Off màu cam nổi bật.
   - Nút **Xuất Excel/CSV**: Hiển thị với icon tải xuống và trạng thái xoay loading khi đang xử lý tải file.
2. **Filter Bar**:
   - Hai trường chọn ngày: "Từ ngày" và "Đến ngày" định dạng chuẩn `YYYY-MM-DD`.
   - Bộ nút lọc nhanh (Quick range pills): **7 ngày**, **30 ngày**, **3 tháng**, **Năm nay** tự động tính ngày và điền vào ô date.
   - Hộp chọn Danh mục (Lấy động từ `GET /categories`).
   - Hộp chọn Quận/Huyện (Lấy động từ `GET /locations/districts`).
   - Hộp chọn Trạng thái (Tất cả / Hoạt động / Khóa).
   - Nút "Áp dụng" (`bg-emerald-500` / `#14b8a6`) và nút "Mặc định" (Reset).
3. **KPI Stats Row**:
   - 4 thẻ hiển thị chỉ số chính:
     - **Tổng địa điểm**: Tổng số địa điểm được ghi nhận.
     - **Địa điểm hoạt động**: Số địa điểm có trạng thái `active`.
     - **Đã nổi bật**: Số địa điểm có cờ `is_featured = true`.
     - **Tổng lượt xem**: Tổng tích lũy `view_count` toàn hệ thống.
4. **Hàng biểu đồ phân bổ**:
   - **Bên trái (Donut/Pie Chart)**: Tỷ lệ phân bổ địa điểm theo Danh mục du lịch. Hover vào từng phần hiển thị tooltip chi tiết số lượng và phần trăm.
   - **Bên phải (Vertical/Horizontal Bar Chart)**: Số lượng địa điểm phân bổ theo từng Quận/Huyện thuộc Đà Nẵng.
5. **Bảng xếp hạng Top địa điểm (Tabs Container)**:
   - Cho phép chuyển đổi nhanh qua 3 tab báo cáo chi tiết:
     - **Top Lượt xem**: Sắp xếp theo `view_count` giảm dần.
     - **Top Yêu thích**: Sắp xếp theo `favorite_count` giảm dần.
     - **Top Đánh giá cao**: Sắp xếp theo `avg_rating` giảm dần, tiếp theo là `review_count`.
   - Mỗi bảng sẽ hiển thị các trường: Tên địa điểm, Danh mục, Quận/Huyện, Chỉ số xếp hạng tương ứng, Trạng thái (Badge), và nút chuyển hướng nhanh xem chi tiết địa điểm.

---

## 3. Danh sách Components & Sơ đồ Cấu trúc

Trang sẽ được thiết lập cấu trúc module tương tự như `RevenueReport`:

```
src/pages/Reports/LocationReport/
├── index.tsx                             # Trang điều phối chính, đồng bộ URL SearchParams & Mock/Real State
└── components/
    ├── LocationReportFilterBar.tsx       # Bộ lọc khoảng ngày, danh mục, quận huyện, trạng thái & phím tắt
    ├── LocationStatsCards.tsx            # Hàng thẻ KPI hiển thị thống kê nhanh (Tổng, Active, Nổi bật, Views)
    ├── LocationReportCharts.tsx          # Các biểu đồ Recharts (Donut phân bổ danh mục, Bar phân bổ quận)
    └── LocationReportTables.tsx          # Bảng xếp hạng phân tab (Top lượt xem, Top yêu thích, Top đánh giá)
```

### Chi tiết phân rã Components:

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `LocationReport` | [NEW] | Page / Screen | `src/pages/Reports/LocationReport/index.tsx` | Trang điều phối state chính của màn hình báo cáo địa điểm. |
| `LocationReportFilterBar` | [NEW] | Molecule | `src/pages/Reports/LocationReport/components/LocationReportFilterBar.tsx` | Bộ lọc tùy biến đặc thù cho địa điểm (có dropdown category & district động). |
| `LocationStatsCards` | [NEW] | Molecule | `src/pages/Reports/LocationReport/components/LocationStatsCards.tsx` | Hàng thẻ KPI hiển thị số lượng địa điểm và tổng lượt xem. |
| `LocationReportCharts` | [NEW] | Molecule | `src/pages/Reports/LocationReport/components/LocationReportCharts.tsx` | Chứa biểu đồ Donut (Danh mục) và Bar (Quận/Huyện). |
| `LocationReportTables` | [NEW] | Organism | `src/pages/Reports/LocationReport/components/LocationReportTables.tsx` | Bảng xếp hạng dạng tab cho Top xem, Top yêu thích, Top đánh giá. |
| `DataTable` | [REUSE] | Organism | `src/components/common/DataTable.tsx` | Dùng lại bảng dữ liệu generic nếu có thể hoặc tự custom layout kính mờ gọn nhẹ. |

---

## 4. Thiết kế Responsive (Responsive Behavior)

| Breakpoint | Bố cục Layout | Hành vi tương tác |
|------------|---------------|-------------------|
| **Desktop** (≥ 1024px) | Grid 4 cột cho thẻ KPI; Grid 2 cột cho hàng Biểu đồ; Layout bảng hiển thị đầy đủ thông tin. | Baseline chuẩn cho quản trị. Đầy đủ hiệu ứng Hover và Micro-interactions. |
| **Tablet** (768px - 1023px) | Grid 2 cột cho thẻ KPI; Biểu đồ xếp chồng dọc (1 cột); Bảng chi tiết ẩn bớt các cột phụ (như Danh mục, Quận/Huyện) để tránh tràn ngang. | Sidebar thu nhỏ thành icon gọn gàng. Hỗ trợ cuộn ngang bảng nếu cần thiết. |
| **Mobile** (< 768px) | 1 cột duy nhất cho tất cả các thành phần. Thẻ KPI hiển thị dạng danh sách trượt dọc hoặc vuốt ngang. Bộ lọc thu gọn dưới dạng một nút bấm hiện Modal bộ lọc. | Bảng chỉ hiển thị tên địa điểm và chỉ số xếp hạng chính. Nút thao tác chuyển thành icon nhỏ. |

---

## 5. UI States (Trạng thái giao diện từng phần)

| Section / Component | Loading State | Empty State | Error State | Success State | Hover/Focus State |
|---------------------|---------------|-------------|-------------|---------------|-------------------|
| **KPI Stats Cards** | Hiển thị Skeleton cho từng con số (nhấp nháy nhẹ 700ms). | Hiển thị giá trị mặc định là `0`. | Hiển thị `N/A` hoặc dấu chấm hỏi kèm tooltip báo lỗi. | Hiển thị số liệu thực tế kèm hiệu ứng đếm số chạy mượt. | Thẻ nâng nhẹ lên (`-translate-y-0.5`), đổi nhẹ màu viền sang Accent. |
| **Charts Card** | Trạng thái Spinner quay ở giữa hoặc khung xương biểu đồ rỗng. | Hiển thị text "Không có dữ liệu biểu đồ" ở tâm biểu đồ rỗng. | Hiển thị thông báo lỗi tải biểu đồ kèm nút "Tải lại". | Render biểu đồ màu sắc tươi tắn với hiệu ứng vẽ cột/vòng tròn mượt. | Hover vào cột/miếng bánh sẽ làm sáng màu đó lên và hiện Tooltip thông tin chi tiết. |
| **Top Lists Tables** | Skeleton Table (5 dòng x 6 cột) nhấp nháy mượt. | Hiển thị ảnh minh họa rỗng và mô tả "Không tìm thấy địa điểm nào". | Hiện thanh thông báo lỗi màu đỏ kèm nút "Thử lại". | Hiển thị dữ liệu danh sách xếp hạng chuẩn. | Dòng bảng đổi màu nền sang xám nhạt (`bg-slate-50/50`), hiển thị trỏ chuột bàn tay. |
| **Filter Bar / Inputs** | Dropdown hiển thị chữ "Đang tải..." và ở trạng thái disabled. | Các dropdown trống chỉ có option mặc định "Tất cả". | Viền đỏ cảnh báo nếu có lỗi validation khoảng ngày. | Áp dụng lọc mượt mà. | Focus vào input hiện viền sáng màu Accent (`ring-2 ring-teal-500/20`). |

---

## 6. Khảo sát Data Fields (Trường dữ liệu)

Dưới đây là đặc tả các trường dữ liệu cần thiết phục vụ UI và mappers:

| Field (UI) | Type | Required | Quy tắc Validation | Mô tả / Ví dụ | Source API |
|---|---|---|---|---|---|
| `id` | `number` | ✓ | Số nguyên dương | ID địa điểm (ví dụ: `12`) | `GET /admin/locations` |
| `name` | `string` | ✓ | Chuỗi ký tự, tối đa 250 kí tự | Tên địa điểm (ví dụ: `Cầu Rồng`) | `GET /admin/locations` |
| `slug` | `string` | ✓ | Chuỗi không khoảng trắng | Slug nhận diện (ví dụ: `cau-rong`) | `GET /admin/locations` |
| `category` | `object` | ✓ | Đối tượng chứa `id` và `name` | Thông tin danh mục (ví dụ: `{ id: 1, name: "Cầu" }`) | `GET /admin/locations` / `/admin/reports/locations` |
| `district` | `string` | ✓ | Chuỗi ký tự | Quận/Huyện (ví dụ: `Sơn Trà`) | `GET /admin/locations` / `/admin/reports/locations` |
| `view_count` | `number` | ✓ | Số nguyên không âm, mặc định `0` | Lượt truy cập (ví dụ: `1520`) | `GET /admin/locations` / `GET /admin/locations/stats` |
| `favorite_count` | `number` | ✓ | Số nguyên không âm, mặc định `0` | Lượt lưu yêu thích (ví dụ: `340`) | `GET /admin/locations` / `GET /admin/dashboard/top-locations` |
| `avg_rating` | `number` | ✓ | Số thực từ 0.0 đến 5.0, mặc định `0` | Điểm đánh giá trung bình (ví dụ: `4.8`) | `GET /admin/locations` |
| `review_count` | `number` | ✓ | Số nguyên không âm, mặc định `0` | Số lượng đánh giá (ví dụ: `45`) | `GET /admin/locations` |
| `status` | `string` | ✓ | Chỉ nhận `active` hoặc `inactive` | Trạng thái hiển thị (ví dụ: `active`) | `GET /admin/locations` |
| `created_at` | `string` | ✓ | Chuỗi định dạng ngày giờ | Thời gian tạo (ví dụ: `2026-05-22 09:00:00`) | `GET /admin/locations` |

---

## 7. Tài liệu API Endpoints

Hệ thống sẽ tương tác với các API Laravel hiện tại của dự án:

| Method | Endpoint | Auth | Request Parameters | Response Shape | Cần bổ sung? |
|---|---|---|---|---|---|
| **GET** | `/admin/reports/locations` | ✓ (Admin/Staff) | `from` (YYYY-MM-DD, optional)<br>`to` (YYYY-MM-DD, optional) | Mảng các bản ghi thống kê phân bổ:<br>`[{ category_id, district, count, category: { id, name } }]` | Không (Đã có sẵn trên backend) |
| **GET** | `/admin/locations/stats` | ✓ (Admin/Staff) | Không | Đối tượng thống kê nhanh:<br>`{ total, active, featured, total_views }` | Không (Đã có sẵn trên backend) |
| **GET** | `/admin/locations` | ✓ (Admin/Staff) | `category_id`, `district`, `status`, `sort_by`, `sort_order`, `page`, `per_page` | Cấu trúc phân trang chứa danh sách các địa điểm thô (`RawLocation`) | Không (Dùng cho Top Lượt xem & Top Đánh giá) |
| **GET** | `/admin/dashboard/top-locations` | ✓ (Admin/Staff) | `limit` (mặc định 10) | Mảng chứa danh sách các địa điểm có lượt thích/xem cao nhất | Không (Dùng cho Top Yêu thích) |
| **GET** | `/admin/locations/export` | ✓ (Admin/Staff) | Không | Dòng nhị phân tải file CSV (`text/csv`) | Không (Đã có sẵn trên backend) |
| **GET** | `/admin/locations/districts` | ✓ (Admin/Staff) | Không | Mảng danh sách tên các quận/huyện hiện có: `["Hải Châu", "Sơn Trà", ...]` | Không (Dùng đổ dữ liệu vào bộ lọc) |
| **GET** | `/categories` | ✗ | Không | Mảng danh mục: `[{ id, name, slug, ... }]` | Không (Dùng đổ dữ liệu vào bộ lọc) |

---

## 8. Đặc tả Mapper (Mapper Requirements)

Để bảo vệ ứng dụng React trước lỗi trắng màn hình và dữ liệu không đồng nhất từ backend, chúng ta sẽ xây dựng mapper tại `src/dataHelper/locationReport.mapper.ts` sử dụng các hàm an toàn có sẵn:

- **Mục tiêu**:
  - Chuyển đổi dữ liệu `/admin/reports/locations` thành dữ liệu biểu đồ phân bổ Danh mục và Quận/Huyện sạch sẽ.
  - Chuyển đổi dữ liệu `/admin/locations` thô thành mô hình view-model hiển thị trên bảng Top Lượt xem và Top Đánh giá.
  - Chuyển đổi dữ liệu `/admin/dashboard/top-locations` thô thành mô hình view-model hiển thị trên bảng Top Yêu thích.

### Logic biến đổi:
1. **Thống kê Biểu đồ (Category & District Distribution)**:
   - Gộp nhóm và tính tổng số lượng địa điểm theo từng tên danh mục (Category Name) để vẽ biểu đồ tròn/donut.
   - Gộp nhóm và tính tổng số lượng địa điểm theo tên Quận/Huyện để vẽ biểu đồ cột dọc.
   - Luôn sử dụng `toArraySafe` và kiểm tra thuộc tính để tránh lỗi nếu danh mục bị null.
2. **Sanitize số liệu**:
   - `view_count` -> `toNumberSafe(value, 0)`
   - `favorite_count` -> `toNumberSafe(value, 0)`
   - `avg_rating` -> `toNumberSafe(value, 0)` và giới hạn hiển thị 1 chữ số thập phân (`.toFixed(1)`).
   - `review_count` -> `toNumberSafe(value, 0)`.

---

## 9. Quy tắc Nghiệp vụ (Business Rules)

- **BR-01 (Bộ lọc ngày)**: Lọc ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc (`from <= to`). Nếu không chọn ngày, mặc định hiển thị thống kê 30 ngày gần nhất.
- **BR-02 (Lọc Danh mục & Quận/Huyện)**: Bộ lọc Danh mục và Quận/Huyện hoạt động độc lập hoặc đồng thời. Nếu chọn "Tất cả", hệ thống sẽ bỏ qua tham số lọc đó khi gửi yêu cầu lên API.
- **BR-03 (Bảng xếp hạng Top Lists)**:
  - Bảng **Top Lượt xem** hiển thị danh sách địa điểm sắp xếp theo thứ tự `view_count` giảm dần.
  - Bảng **Top Yêu thích** hiển thị danh sách địa điểm sắp xếp theo thứ tự `favorite_count` giảm dần (kết hợp `view_count` giảm dần nếu trùng số yêu thích).
  - Bảng **Top Đánh giá cao** hiển thị danh sách địa điểm sắp xếp theo thứ tự `avg_rating` giảm dần (kết hợp `review_count` giảm dần).
- **BR-04 (Đồng bộ URLSearchParams)**: Toàn bộ thông số lọc ngày (`from`, `to`), danh mục (`category_id`), quận/huyện (`district`), trạng thái (`status`) và Tab hoạt động hiện tại phải được phản ánh trên URL trong thời gian thực. Giúp quản trị viên có thể F5 hoặc chia sẻ link báo cáo chính xác.
- **BR-05 (Quy tắc xuất báo cáo Excel/CSV)**: Nút xuất báo cáo gọi trực tiếp API `/admin/locations/export` để tải file. Để đồng nhất thông tin, bộ lọc hiện tại trên UI sẽ được đồng bộ gửi kèm trong tham số truy vấn xuất file (nếu API hỗ trợ).
- **BR-06 (Dữ liệu rỗng)**: Khi không có dữ liệu khớp bộ lọc, biểu đồ hiển thị trạng thái "Không có dữ liệu", bảng danh mục trống và nút "Xuất file" vẫn hoạt động nhưng xuất ra file rỗng (hoặc chỉ chứa tiêu đề cột).

---

## 10. Rủi ro & Giải pháp Phòng ngừa (Edge Cases)

- **EC-01: Backend `/admin/reports/locations` chỉ hỗ trợ lọc theo ngày, không hỗ trợ lọc theo danh mục hay quận huyện ở database**:
  - *Giải pháp*: Biểu đồ phân bổ quận/huyện và danh mục sẽ hiển thị phân bổ tổng thể dựa trên khoảng ngày đã lọc. Khi người dùng lọc cụ thể một danh mục hoặc quận/huyện trên Filter Bar, chúng ta sẽ lọc (filter) kết quả biểu đồ tương ứng trên Client Side để giao diện phản ánh đúng bộ lọc người dùng chọn, đồng thời gửi tham số lọc vào các bảng xếp hạng bên dưới.
- **EC-02: Điểm đánh giá trung bình `avg_rating` trả về dạng chuỗi từ API**:
  - *Giải pháp*: Sử dụng hàm chuyển đổi an toàn `toNumberSafe` trong Mapper để đưa về kiểu số trước khi so sánh hoặc hiển thị trên UI.
- **EC-03: Trình duyệt bị crash khi hiển thị biểu đồ quá nhiều Quận/Huyện**:
  - *Giải pháp*: Giới hạn hiển thị Top 10 quận có số lượng địa điểm nhiều nhất trên biểu đồ cột, gộp các quận còn lại vào nhóm "Khác" để biểu đồ trực quan, không bị rối.
- **EC-04: Lỗi tải file CSV xuất khẩu không hiển thị đúng ký tự tiếng Việt (mất dấu hoặc lỗi font)**:
  - *Giải pháp*: Đảm bảo thêm ký tự Byte Order Mark (BOM `\uFEFF`) vào đầu file CSV trong hàm xử lý xuất dữ liệu giả lập (Mock Mode) để Excel có thể nhận diện và hiển thị tiếng Việt có dấu chuẩn 100%.

---

## 11. Các điểm Giả định & Câu hỏi mở (Assumptions & Open Questions)

### Giả định (Assumptions)
- `[ASSUMPTION] A-01`: API xuất danh sách `/admin/locations/export` sẽ trả về dữ liệu thô dạng file CSV. Hệ thống frontend sẽ sử dụng thẻ link ẩn để tải file nhị phân này về máy người dùng một cách tự động.
- `[ASSUMPTION] A-02`: Dữ liệu phân bổ Danh mục và Quận/Huyện trả về từ `/admin/reports/locations` sẽ tự động cập nhật theo khoảng ngày `from`/`to`. Nếu không truyền khoảng ngày, Laravel tự động tính 30 ngày qua.

### Câu hỏi mở (Open Questions)
- `Q-01`: API `/admin/dashboard/top-locations` có cần hỗ trợ lọc theo khoảng ngày để phản ánh đúng xếp hạng trong kỳ báo cáo hay không? 
  - *Câu trả lời tạm thời*: Hiện tại backend API chỉ nhận tham số `limit` và xếp hạng dựa trên tổng tích lũy cột `favorite_count` / `view_count` trong database. Chúng ta sẽ hiển thị danh sách này dưới dạng xếp hạng tích lũy chung của hệ thống. Nếu sau này backend nâng cấp hỗ trợ lọc theo thời gian, frontend sẽ truyền thêm params tương ứng.

---

## 12. Kế hoạch Triển khai (Checklist)

- [ ] **Step 03 — Types & API Contract**: Định nghĩa các kiểu dữ liệu `RawLocationReportItem`, `LocationReportFilters`, `RawLocation` và ViewModel tương ứng; bổ sung API endpoints vào `endpoints.ts` và `reportApi.ts`.
- [ ] **Step 04 — Layout & Routing**: Khai báo route `/admin/reports/locations` trong `routes.ts` & `index.tsx`, đăng ký liên kết submenu tại `Sidebar.tsx`, cập nhật file dịch i18n (vi/en).
- [ ] **Step 05 — UI Components**: Thiết kế các components tĩnh: `LocationStatsCards`, `LocationReportFilterBar` (với các ô chọn ngày, danh mục, quận huyện), `LocationReportCharts` và `LocationReportTables` (các tab xếp hạng).
- [ ] **Step 06 — Data Integration**: Xây dựng mappers, tích hợp TanStack Query hooks (`useQuery` cho stats, distribution, top lists).
- [ ] **Step 07 — Interactions**: Triển khai tương tác: đồng bộ bộ lọc lên URLSearchParams, xử lý nút lọc nhanh, nút xuất CSV/Excel, bật tắt chế độ Mock Mode linh hoạt.
- [ ] **Step 08 — Auth & Permissions**: Thiết lập bảo vệ route bằng `PrivateRoute` chỉ cho phép quyền Admin/Staff truy cập.
- [ ] **Step 09 — Testing**: Thực hiện chạy bộ test tĩnh (`npm run prepush:check`) để đảm bảo chất lượng build, kiểm tra hiển thị song ngữ vi/en.
- [ ] **Step 10 — Deploy & Handoff**: Viết tài liệu `review.md` và trình USER phê duyệt trước khi hoàn tất feature.

---

## 13. Các Tệp/Phân vùng Dự kiến Thay đổi

- `src/routes/routes.ts` (Thêm route `/admin/reports/locations`)
- `src/routes/index.tsx` (Lazy load trang `LocationReport` và đăng ký route)
- `src/layouts/MainLayout.tsx` / `src/components/common/Sidebar.tsx` (Thêm mục điều hướng)
- `src/constants/endpoints.ts` (Thêm API endpoint của báo cáo địa điểm và xuất báo cáo)
- `src/api/reportApi.ts` (Thêm phương thức gọi API báo cáo và xuất báo cáo địa điểm)
- `src/dataHelper/report.dataHelper.ts` (Thêm types và mappers liên quan)
- `public/lang/vi/location_report.json` & `public/lang/en/location_report.json` (File dịch đa ngôn ngữ)
- `src/pages/Reports/LocationReport/` (Thư mục chứa mã nguồn tính năng mới)
