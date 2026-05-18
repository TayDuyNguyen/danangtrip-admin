# Data Integration Plan: Tạo / Sửa lịch khởi hành

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> API module: `src/api/scheduleApi.ts` và `src/api/tourApi.ts`

---

## 1) Data Sources
| Purpose | Endpoint | Hook | Notes |
|:---|:---|:---|:---|
| **Lấy chi tiết Tour** | `GET /admin/tours/{id}` | `useTourDetail(tourId)` | Dùng hiển thị `TourInfoBox` (tên tour, category, duration, thumbnail). |
| **Lấy chi tiết Lịch khởi hành** | `GET /admin/tour-schedules/{id}` | `useScheduleDetail(id)` | Phục vụ màn hình Chỉnh sửa (Edit) để đổ dữ liệu cũ vào Form. |
| **Tạo mới Lịch khởi hành** | `POST /admin/tour-schedules` | `useCreateSchedule()` | Mutation gửi payload tạo lịch trình khởi hành mới. |
| **Cập nhật Lịch khởi hành** | `PUT /admin/tour-schedules/{id}` | `useUpdateSchedule()` | Mutation gửi payload cập nhật lịch trình khởi hành hiện tại. |

---

## 1.1) Data Ownership Notes
- **Query chính đóng vai trò Source of Truth**:
  * `useScheduleDetail(id)` là nguồn dữ liệu gốc của lịch khởi hành cần chỉnh sửa.
  * `useTourDetail(tourId)` là nguồn dữ liệu hỗ trợ hiển thị thông tin trực quan.
- **Lookup/Supporting Data**:
  * Cờ `isEdit` và `bookedSlots` được truyền động trực tiếp từ dữ liệu chi tiết lịch (`scheduleDetail.bookedSlots`) vào Yup validator schema để xử lý nghiệp vụ tại chỗ.

---

## 2) Query Plan
| Query Key | Query Type | Trigger | staleTime | Mapper |
|:---|:---|:---|:---|:---|
| `['tours', 'detail', tourId]` | Detail | Tự động chạy khi `tourId` hợp lệ. | `5 * 60 * 1000` (5 phút) | `mapTour` (`src/dataHelper/tour.mapper.ts`) |
| `['schedules', 'detail', id]` | Detail | Tự động chạy ở màn Edit khi `id` hợp lệ. | `0` (Không cache để tránh stale data khi edit) | `mapSchedule` (`src/dataHelper/schedule.mapper.ts`) |

---

## 2.1) Parallel / Dependent Query Notes
| Query | Parallel or Dependent | Why |
|:---|:---|:---|
| **Lấy chi tiết Tour gốc trong màn Tạo mới** | `Independent` | Chỉ chạy truy vấn `useTourDetail(tourId)` độc lập để hiển thị box thông tin tour. |
| **Lấy chi tiết Tour + Lịch cũ trong màn Chỉnh sửa** | `Parallel` | Khi truy cập màn Edit, hai truy vấn `useScheduleDetail(id)` và `useTourDetail(tourId)` sẽ được kích hoạt **song song** để rút ngắn tối đa thời gian phản hồi giao diện. |

---

## 3) Mutation Plan
| Action | API Method | Success Handling | Error Handling |
|:---|:---|:---|:---|
| **Tạo mới lịch** | `POST /admin/tour-schedules` | - Invalidate lists query: `['schedules', 'list']`<br>- Hiển thị Toast thông báo thành công.<br>- Điều hướng về trang danh sách lịch khởi hành. | - Hiển thị Toast thông báo lỗi chi tiết trả về từ máy chủ.<br>- Unlock submit button. |
| **Cập nhật lịch** | `PUT /admin/tour-schedules/{id}` | - Invalidate lists query: `['schedules', 'list']`<br>- Invalidate detail query: `['schedules', 'detail', id]` để refresh cache.<br>- Hiển thị Toast thông báo thành công.<br>- Điều hướng về trang danh sách lịch. | - Hiển thị Toast thông báo lỗi chi tiết từ API.<br>- Unlock submit button. |

---

## 4) UI State Handling
| UI Section | Loading | Empty | Error | Success |
|:---|:---|:---|:---|:---|
| **TourInfoBox** | Hiển thị 2 hàng Skeleton xám mờ chuyển động nhẹ. | Ẩn hoàn toàn. | Hiển thị thông tin mặc định dạng fallback. | Render thumbnail và meta-data mượt mà. |
| **Form Card chính** | Ẩn phía sau lớp Loading Spinner toàn trang (ở màn Edit khi đang tải dữ liệu cũ). | N/A | Toast cảnh báo lỗi tải dữ liệu gốc kèm nút quay lại. | Render Form với đầy đủ dữ liệu binding chuẩn. |

---

## 4.1) Error Strategy
| Error Type | UI Handling | Toast | Retry |
|:---|:---|:---|:---|
| **Lỗi mạng / Không kết nối** | Khóa form, hiển thị thông báo lỗi mạng chung. | Có (Toast báo lỗi kết nối hệ thống) | N/A |
| **Lỗi nghiệp vụ (422 Unprocessable Entity)** | Highlight đỏ ở các trường nhập liệu tương ứng trên Form nhờ React Hook Form binding. | Có (Toast hiển thị tóm tắt lỗi nghiệp vụ) | Người dùng sửa lại dữ liệu và bấm gửi lại. |
| **Lỗi xác thực (401/403)** | Trục xuất về trang đăng nhập hoặc màn hình từ chối quyền truy cập (xử lý ở mức Interceptor). | Có (Toast hết hạn phiên làm việc) | Đăng nhập lại. |

---

## 5) Files Expected To Change
- `src/validations/schedule.schema.ts` (Nâng cấp Yup Schema nhận tham số động `isEdit` và `bookedSlots`)
- `src/pages/Tours/TourScheduleEdit/index.tsx` (Tích hợp schema động và hiển thị cảnh báo quá khứ `PastEventWarning`)

---

## 6) Risks / Open Questions
- **R-01: Past Date Validation Lock**: Lỗi logic cực kỳ phổ biến khiến nhân viên không thể cập nhật bất cứ thông tin gì (kể cả chỉ sửa giá hoặc tổng số chỗ) của một lịch trình trong quá khứ vì schema yup tĩnh bắt buộc `startDate >= today`. 
  * *Giải pháp*: Schema yup động mới sẽ bỏ qua ràng buộc tương lai này khi `isEdit === true`.
- **Q-01: bookedSlots Limit check**: Tránh trường hợp nhân viên hạ tổng số chỗ (`totalSlots`) xuống thấp hơn số chỗ khách hàng đã đặt thực tế (`bookedSlots`).
  * *Giải pháp*: Yup schema động mới sẽ bắt buộc `totalSlots >= bookedSlots`.
