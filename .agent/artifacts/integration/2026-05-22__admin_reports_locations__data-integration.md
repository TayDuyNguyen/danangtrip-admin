# Data Integration Plan: Báo cáo Địa điểm

> Feature slug: `admin_reports_locations`
> Date: 2026-05-22
> API module: `src/api/reportApi.ts`

---

## 1) Data Sources
| Purpose | Endpoint | Hook | Notes |
|---|---|---|---|
| Phân bổ địa điểm theo danh mục & quận | `/admin/reports/locations` | `useLocationsReportQuery` | Gọi api `reportApi.getLocationsReport` |
| Thống kê tổng hợp KPIs | `/admin/locations/stats` | `useLocationsReportQuery` | Gọi api `locationApi.getStats` |
| Danh sách địa điểm xếp hạng (Top Lượt xem / Đánh giá) | `/admin/locations` | `useLocationsReportQuery` | Gọi axios trực tiếp qua `API_ENDPOINTS.LOCATIONS.LIST` với params lọc & phân trang |
| Danh sách địa điểm xếp hạng (Top Yêu thích) | `/admin/dashboard/top-locations` | `useLocationsReportQuery` | Gọi api `reportApi.getTopLocations` để lấy danh sách yêu thích nhiều nhất |
| Xuất báo cáo CSV địa điểm | `/admin/locations/export` | `useReportMutations` | Gọi `exportLocationsMutation` tải file blob |
| Dropdown Danh mục | `/categories` | `useLocationCategoriesQuery` | Phục vụ bộ lọc, được cache toàn app |
| Dropdown Quận/Huyện | `/locations/districts` | `useLocationFilterDistrictsQuery` | Phục vụ bộ lọc, được cache toàn app |

## 1.1) Data Ownership Notes
- **Query chính (Source of Truth)**: `useLocationsReportQuery` chịu trách nhiệm tải đồng thời tất cả các dữ liệu thống kê, biểu đồ phân bổ, và danh sách bảng xếp hạng địa điểm tương ứng với bộ lọc ngày (`from`, `to`) và lọc phân trang/sắp xếp của bảng.
- **Lookup/Supporting data**:
  - `useLocationCategoriesQuery` và `useLocationFilterDistrictsQuery` là các queries độc lập hỗ trợ tải danh sách các danh mục và quận/huyện đổ vào Dropdown ở Filter Bar. Các query này được quản lý cache bởi TanStack Query ở mức độ repo để tránh fetch lại.

## 2) Query Plan
| Query Key | Query Type | Trigger | staleTime | Mapper |
|---|---|---|---|---|
| `['reports', 'locations', {from, to}, tableParams]` | Main Query (Combined) | Thay đổi khoảng ngày (`from`/`to`), thay đổi bộ lọc (`category_id`, `district`, `status`), chuyển trang hoặc đổi Tab sắp xếp | 30 giây (`30000ms`) | `mapLocationsReport` |
| `['location-categories']` | Lookup / Cache | Mount trang lần đầu | Vô hạn (chỉ đổi khi reload) | Không |
| `['location-districts']` | Lookup / Cache | Mount trang lần đầu | Vô hạn (chỉ đổi khi reload) | Không |

## 2.1) Parallel / Dependent Query Notes
| Query | Parallel or Dependent | Why |
|---|---|---|
| KPIs, Charts & Table items | Parallel | Gọi thông qua `Promise.all` trong `queryFn` của `useLocationsReportQuery` để tối ưu hóa thời gian tải trang, tránh hiện tượng waterfalling. |
| Category & District Dropdowns | Parallel | Chạy song song và không phụ thuộc vào dữ liệu báo cáo để hiển thị Filter Bar ngay lập tức. |

## 3) Mutation Plan
| Action | API Method | Success Handling | Error Handling |
|---|---|---|---|
| Xuất báo cáo CSV | `reportApi.exportLocationsReport` (GET dạng blob) | Gọi hàm helper `prepareSpreadsheetDownload` và `downloadBlobFile` để tải file về máy. Hiển thị thông báo Toast thành công. | Kích hoạt Toast báo lỗi chi tiết qua `toast.promise`. |

## 4) UI State Handling
| UI Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| **KPI Stats Row** | Hiển thị 4 thẻ `SkeletonCard` nhấp nháy 700ms. | Hiển thị các chỉ số là `0` hoặc `-`. | Hiển thị `N/A` hoặc dấu `-`. | Render số liệu thực tế đã định dạng `.toLocaleString('vi-VN')`. |
| **Charts Row** | Khung chữ nhật `Skeleton` xám nhấp nháy. | Hiển thị chuỗi thông báo "Không có dữ liệu biểu đồ...". | Hiển thị text thông báo lỗi tải biểu đồ. | Render donut và bar charts sinh động với tooltip hover. |
| **Ranking Tables** | Khung xương `Skeleton` giả lập 5 hàng dữ liệu. | Hiển thị hình minh họa trống kèm mô tả "Không tìm thấy địa điểm nào". | Hiển thị thanh thông báo lỗi màu đỏ kèm nút "Thử lại". | Hiển thị dữ liệu danh sách xếp hạng có số thứ tự, badge trạng thái và chỉ số. |

## 4.1) Error Strategy
| Error Type | UI Handling | Toast | Retry |
|---|---|---|---|
| Lỗi kết nối API chính (Network Error) | Hiển thị lỗi toàn màn hình qua Alert Card ở giữa trang. | Toast cảnh báo tự động bật mock mode fallback | Có nút "Thử lại" (`refetch`) và nút "Sử dụng Mock Data" |
| Lỗi xuất file CSV | Vẫn giữ nguyên trạng thái UI hiện tại | Hiển thị Toast báo lỗi đỏ qua `toast.promise` | Người dùng bấm lại nút "Xuất CSV" để thử lại |

## 5) Files Expected To Change
- `src/hooks/useReportQueries.ts` (Đã được verify cấu trúc query & mutation)
- `src/pages/Reports/LocationReport/index.tsx` (Đã được verify luồng lấy data & mock fallback)
- `src/dataHelper/report.mapper.ts` (Đã được verify logic mapping an toàn `toNumberSafe`)

## 6) Risks / Open Questions
- **R-01**: Khi chuyển sang chế độ Top Yêu thích, API sử dụng `/admin/dashboard/top-locations` không nhận tham số lọc ngày (`from`/`to`). Dữ liệu này là tổng hợp tích lũy từ trước đến nay.
  - *Giải pháp*: Hiển thị rõ ràng trong UI hoặc trong file dịch (ở tooltip/subtitle của bảng) để người quản trị biết dữ liệu lượt yêu thích là tổng tích lũy hệ thống.
- **Q-01**: Có cần invalidate cache khi admin khóa/mở khóa địa điểm từ màn hình khác không?
  - *Giải đáp*: Do báo cáo có `staleTime` ngắn (30 giây), dữ liệu sẽ tự động được cập nhật khi người dùng quay lại trang hoặc thực hiện thay đổi bộ lọc.
