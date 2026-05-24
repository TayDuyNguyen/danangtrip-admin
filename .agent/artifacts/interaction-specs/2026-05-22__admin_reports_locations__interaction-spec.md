# Interaction Spec: Báo cáo Địa điểm

> Feature slug: `admin_reports_locations`
> Date: 2026-05-22
> Source hooks: `src/hooks/useReportQueries.ts`

---

## 1) Main User Actions
| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| Áp dụng lọc | Click nút "Áp dụng" | `useLocationsReportQuery` | Query refetch với bộ lọc mới | Hiển thị Toast lỗi nếu ngày "Từ" > ngày "Đến" |
| Đặt lại bộ lọc | Click nút "Mặc định" | `useLocationsReportQuery` | Trở về mặc định, refetch trang 1. Toast thông báo đặt lại. | N/A |
| Lọc nhanh khoảng ngày | Click các pills: 7 ngày, 30 ngày, 3 tháng, Năm nay | N/A (Client state update) | Tính toán khoảng ngày và tự động cập nhật local filters. | N/A |
| Chuyển Tab xếp hạng | Click chọn Tab: Top Lượt xem / Top Yêu thích / Top Đánh giá | `useLocationsReportQuery` | Đổi `activeTab`, đổi query parameter `sort_by`, refetch trang 1. | N/A |
| Phân trang | Click nút "Trước" / "Sau" | `useLocationsReportQuery` | Thay đổi `page` parameter, refetch danh sách bảng. | N/A |
| Xuất báo cáo CSV | Click nút "Xuất CSV" | `exportLocationsMutation` (trong `useReportMutations`) | Tải file `.csv` về máy. Toast thông báo xuất thành công. | Toast thông báo xuất lỗi. |
| Bật/tắt chế độ giả lập | Click nút "Dữ liệu Giả lập (On/Off)" | N/A (Client state switch) | Đổi sang mode mock/real, hiển thị Toast thông báo trạng thái. | N/A |

## 1.1) Action Priority
| Action | Priority | Why |
|---|---|---|
| Áp dụng lọc | High | Chức năng cốt lõi để thu hẹp phạm vi báo cáo theo thời gian, danh mục, quận huyện. |
| Chuyển Tab xếp hạng | High | Cho phép xem các chiều thông tin xếp hạng hiệu suất địa điểm khác nhau. |
| Xuất báo cáo CSV | Medium | Phục vụ lưu trữ ngoại tuyến và chia sẻ báo cáo. |
| Bật/tắt chế độ giả lập | Low | Hỗ trợ debug và demo giao diện khi API chưa sẵn sàng. |

## 2) Forms
*Màn hình Báo cáo Địa điểm không có form nhập liệu tạo mới/sửa đổi (CRUD). Giao diện chỉ chứa các controls lọc dữ liệu ở Filter Bar.*

| Form | Fields | Validation Source | Submit Flow | Reset/Cancel Flow |
|---|---|---|---|---|
| Bộ lọc khoảng ngày | `from`, `to` | Logic kiểm tra thủ công: `new Date(from) > new Date(to)` | Click nút "Áp dụng" sẽ trigger validation. Nếu hợp lệ, cập nhật active filters. | Click "Mặc định" để xóa khoảng ngày về mặc định đầu tháng đến ngày hiện tại. |

## 3) Filters / Search / Pagination
| Control | State Source | Sync URL | Debounce | Notes |
|---|---|---|---|---|
| Khoảng ngày `from`/`to` | `localFilters` (local) & `activeFilters` (URL sync) | Có (`from`, `to` params) | Không | Chỉ đồng bộ lên URL khi người dùng click "Áp dụng" hoặc Click nút lọc nhanh. |
| Chọn Danh mục | `localFilters` & `activeFilters` | Có (`category_id`) | Không | Chỉ đồng bộ lên URL khi click "Áp dụng". |
| Chọn Quận/Huyện | `localFilters` & `activeFilters` | Có (`district`) | Không | Chỉ đồng bộ lên URL khi click "Áp dụng". |
| Chọn Trạng thái | `localFilters` & `activeFilters` | Có (`status`) | Không | Chỉ đồng bộ lên URL khi click "Áp dụng". |
| Tab xếp hạng | `activeTab` | Không | Không | Cần reset trang (`page = 1`) khi chuyển tab. |
| Phân trang bảng | `activeFilters.page` | Có (`page` param) | Không | Sync tức thì lên URLSearchParams khi click "Trước"/"Sau". |

## 3.1) Default Values / Reset Logic
| Control | Default Value | Reset Behavior | Notes |
|---|---|---|---|
| Từ ngày (`from`) | Ngày đầu tiên của tháng hiện tại | Trở về ngày đầu tiên của tháng hiện tại | Nhờ helper `getFirstDayOfMonth()` |
| Đến ngày (`to`) | Ngày hôm nay | Trở về ngày hôm nay | Nhờ helper `getToday()` |
| Danh mục | `'all'` (Tất cả danh mục) | Chọn lại `'all'` | Lọc bỏ tham số `category_id` khỏi query gửi đi |
| Quận/Huyện | `'all'` (Tất cả quận/huyện) | Chọn lại `'all'` | Lọc bỏ tham số `district` khỏi query gửi đi |
| Trạng thái | `'all'` (Tất cả trạng thái) | Chọn lại `'all'` | Lọc bỏ tham số `status` khỏi query gửi đi |
| Phân trang | Trang `1` | Trở về trang `1` | Mỗi khi áp dụng lọc hoặc chuyển tab đều reset về trang `1` |

## 4) Confirm / Destructive Actions
*Trang Báo cáo Địa điểm chỉ có tính chất đọc dữ liệu (Read-only reports) và xuất báo cáo. Không có các hành động hủy hoại dữ liệu (như xóa địa điểm, sửa trạng thái).*

## 4.1) Loading / Pending Behavior
| Action | Pending UI | Disabled Elements | Notes |
|---|---|---|---|
| Đang tải báo cáo (API Pending) | Khung xương `Skeleton` ở KPI Cards, Charts, và Tables. | Vô hiệu hóa các nút ở Filter Bar (`isSubmitting = true`). | Layout không bị vỡ hay giật cục nhờ Skeletons. |
| Đang xuất CSV | Icon download chuyển thành Spinner xoay tròn mượt. | Vô hiệu hóa nút "Xuất CSV". | Toast của `sonner` hiển thị thông điệp loading động. |

## 5) i18n Keys To Add
*Tất cả ngôn ngữ đã được thêm đồng bộ và đầy đủ cho cả tiếng Việt và tiếng Anh ở bước trước. Không cần bổ sung key mới.*

- Tiếng Việt: `public/lang/vi/location_report.json`
- Tiếng Anh: `public/lang/en/location_report.json`

## 6) Risks / Open Questions
- **R-01: Lỗi font tiếng Việt khi mở file CSV trên Excel**:
  - *Giải pháp*: Trong hàm export ở client (Mock Mode), thêm ký tự BOM (`\uFEFF`) ở đầu dữ liệu để Excel mở file bằng định dạng UTF-8 chính xác. Đối với API thật, backend Laravel đã xử lý headers xuất file tương ứng.
