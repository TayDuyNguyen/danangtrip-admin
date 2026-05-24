# UI Spec: Báo cáo Địa điểm

> Feature slug: `admin_reports_locations`
> Date: 2026-05-22
> Source analysis: `d:/DATN/danangtrip-admin/.agent/artifacts/analysis/2026-05-22__admin_reports_locations__screen-analysis.md`

---

## 1) Summary
- Mục tiêu UI của feature là cung cấp giao diện trực quan hiển thị thông tin thống kê về các địa điểm du lịch tại Đà Nẵng: bao gồm tổng quan (KPIs), biểu đồ phân bổ (theo danh mục & quận/huyện), và bảng danh sách xếp hạng theo lượt truy cập, lượt thích và lượt đánh giá.
- Người dùng chính là Quản trị viên (Admin/Staff), giúp họ có cái nhìn toàn diện về hiệu suất địa điểm để đưa ra các định hướng phát triển nội dung du lịch.

## 1.1) UI Delivery Goal
- Màn hình này ưu tiên hiển thị các chỉ số tổng hợp nhanh (KPI Cards) và các bộ lọc tìm kiếm (Date pickers + category/district dropdowns) ở khu vực trên cùng để người dùng dễ dàng thao tác lọc.
- Thành phần above-the-fold bao gồm: Breadcrumbs, Tiêu đề chính, Nút xuất CSV & Mock/Real Toggle, Bộ lọc (Filter Bar), và hàng thẻ thống kê KPI (LocationStatsCards). Biểu đồ và bảng xếp hạng chi tiết được xếp ở dưới để cuộn xuống xem tiếp.

## 2) Component Matrix
### [REUSE]
| Component | Path | Why reuse | Notes |
|---|---|---|---|
| `Skeleton` | `src/components/ui/Skeleton.tsx` | Dùng để làm khung xương nhấp nháy (skeleton) khi đang tải dữ liệu. | Đã có sẵn, import trực tiếp. |
| Recharts Components | Thư viện `recharts` | Render biểu đồ phân bổ hình bánh donut và biểu đồ cột. | Dùng các component nguyên bản từ `recharts` như PieChart, BarChart, v.v. |

### [NEW]
| Component | Layer | Purpose | Expected Props |
|---|---|---|---|
| `LocationReport` | Page / Screen | Trang điều khiển chính, đồng bộ bộ lọc lên URLSearchParams, xử lý Mock Mode và gọi query hook. | Không có props (Route-level page). |
| `LocationReportFilterBar` | Molecule | Bộ lọc khoảng thời gian, danh mục du lịch, quận/huyện, trạng thái, và các nút chọn nhanh khoảng ngày. | `filters: LocalFilters`, `onFilterChange: (updated: Partial<LocalFilters>) => void`, `onApply: () => void`, `onReset: () => void`, `isSubmitting?: boolean` |
| `LocationStatsCards` | Molecule | Hiển thị 4 thẻ KPI thống kê nhanh: Tổng số địa điểm, Địa điểm đang hoạt động, Địa điểm nổi bật, Tổng lượt xem. | `stats: LocationReportViewModel['stats'] \| undefined`, `isLoading: boolean` |
| `LocationReportCharts` | Molecule | Chứa hai biểu đồ phân bổ địa điểm: Donut chart theo danh mục và Bar chart theo quận/huyện. | `data: LocationReportViewModel['charts'] \| undefined`, `isLoading: boolean` |
| `LocationReportTables` | Organism | Bảng phân tab để hiển thị top địa điểm theo lượt xem, lượt yêu thích, hoặc đánh giá trung bình. | `data: LocationReportViewModel['table'] \| undefined`, `isLoading: boolean`, `activeTab: TabType`, `onTabChange: (tab: TabType) => void`, `onPageChange: (page: number) => void` |

### [MOD]
| Component | Path | Required change | Impact |
|---|---|---|---|
| Không có | N/A | Không có component chung nào bị sửa đổi trực tiếp. | N/A |

## 3) UI States
| Component | Loading | Empty | Error | Success | Disabled |
|---|---|---|---|---|---|
| `LocationReportFilterBar` | Các dropdown hiển thị "Đang tải...", các input bị disabled nhẹ. | Hiển thị dropdown trống với tùy chọn mặc định "Tất cả". | Viền đỏ cảnh báo nếu validation ngày sai. | Bộ lọc sẵn sàng, áp dụng mượt mà. | Khi `isSubmitting = true`, các controls bị disabled để tránh click trùng lặp. |
| `LocationStatsCards` | Render 4 khung xương `SkeletonCard` nhấp nháy mượt. | Hiển thị các con số là `0` hoặc `-`. | Hiển thị `N/A` hoặc dấu `-` nếu API lỗi. | Hiển thị số liệu đã format định dạng số Việt Nam (`toLocaleString('vi-VN')`). | N/A |
| `LocationReportCharts` | Khung xương `Skeleton` hốc chữ nhật thay thế biểu đồ. | Hiển thị thông báo "Không có dữ liệu biểu đồ" ở chính giữa. | Hiển thị text báo lỗi tải dữ liệu biểu đồ. | Vẽ biểu đồ tròn/donut và cột với hiệu ứng chuyển động của Recharts. | N/A |
| `LocationReportTables` | Render 5 hàng giả lập `Skeleton` nhấp nháy. | Hiển thị text mô tả "Không có dữ liệu địa điểm" kèm chi tiết. | Hiển thị text cảnh báo lỗi tải bảng. | Hiển thị dữ liệu dạng bảng xếp hạng, phân trang, có badge trạng thái. | N/A |

## 3.1) Interaction Notes
| Component | Hover / Focus | Click / Expand | Notes |
|---|---|---|---|
| `LocationReportFilterBar` | Focus vào input/select sẽ có viền teal sáng nhẹ (`focus:ring-2 focus:ring-teal-500/20`). | Click chọn ngày, mở dropdown danh mục/quận huyện. | Nút chọn nhanh (Quick Range) thay đổi giá trị ngày ngay lập tức. |
| `LocationStatsCards` | Hover thẻ sẽ nâng nhẹ (`-translate-y-0.5`), viền chuyển sang màu xám đậm hơn. | N/A | Micro-animation mượt mà 150ms. |
| `LocationReportCharts` | Hover vào miếng bánh donut hoặc cột bar sẽ làm nổi bật phần tử đó và hiển thị Tooltip thông tin chi tiết. | N/A | Tooltip Recharts sử dụng glassmorphism (`backdrop-blur-md bg-white/95`). |
| `LocationReportTables` | Hover lên dòng của bảng sẽ đổi nền sang `bg-slate-50/50` và trỏ chuột bàn tay. | N/A | Dòng dữ liệu hiển thị rõ ràng chỉ số xếp hạng tương ứng với Tab đang chọn. |

## 4) Responsive Notes
| Breakpoint | Behavior | Notes |
|---|---|---|
| Mobile (< 768px) | Lưới 1 cột dọc. KPI Cards xếp chồng. Bảng ẩn cột Danh mục và Quận/Huyện, chỉ hiện Tên địa điểm và chỉ số chính. | Cắt giảm tối đa chi tiết thừa để giao diện gọn gàng nhất. |
| Tablet (768px - 1023px) | Lưới 2 cột cho KPI Cards. Biểu đồ xếp chồng dọc (1 cột). Bảng ẩn bớt cột Danh mục, giữ cột Quận/Huyện. | Responsive cân đối, đảm bảo không tràn màn hình. |
| Desktop (≥ 1024px) | Lưới 4 cột cho KPI Cards. Lưới 2 cột song song cho Biểu đồ. Bảng hiển thị đầy đủ tất cả các cột. | Trải nghiệm tối đa của Admin, đầy đủ hover effects. |

## 5) Files Expected To Change
- `src/pages/Reports/LocationReport/components/LocationReportFilterBar.tsx` (Review & Verify)
- `src/pages/Reports/LocationReport/components/LocationStatsCards.tsx` (Review & Verify)
- `src/pages/Reports/LocationReport/components/LocationReportCharts.tsx` (Review & Verify)
- `src/pages/Reports/LocationReport/components/LocationReportTables.tsx` (Review & Verify)
- `src/pages/Reports/LocationReport/index.tsx` (Review & Verify)

## 6) Build Order
1. **Atoms**: Kiểm tra `Skeleton.tsx` đã sẵn sàng và hoạt động đúng.
2. **Molecules**:
   - Hoàn thiện `LocationReportFilterBar.tsx` (kiểm tra dropdown query hooks từ cache).
   - Hoàn thiện `LocationStatsCards.tsx` (kiểm tra layout và logic loading).
   - Hoàn thiện `LocationReportCharts.tsx` (kiểm tra thư viện Recharts và tooltip custom).
3. **Organisms**:
   - Hoàn thiện `LocationReportTables.tsx` (kiểm tra chuyển đổi tab, phân trang, và format số liệu).
4. **Page assembly**:
   - Hoàn thiện file `index.tsx` để điều phối bộ lọc, đồng bộ URL parameters và xử lý mock mode fallback.
