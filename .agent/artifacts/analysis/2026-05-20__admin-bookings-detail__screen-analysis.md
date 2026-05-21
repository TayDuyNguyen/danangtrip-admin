# Screen Analysis: Chi tiết Đơn hàng (Booking Detail)

> Feature slug: `admin-bookings-detail`
> Date: 2026-05-20
> Mockup/SRS: [admin_bookings_detail.md](file:///D:/DATN/DATN_Tài%20liệu/docs/page/admin_bookings_detail.md)

---

## 1) Summary
- **Mục đích:** Xem toàn bộ thông tin chi tiết đơn đặt tour (khách hàng, tour, lịch khởi hành, thanh toán, trạng thái) và thực hiện các thao tác xử lý nghiệp vụ (Xác nhận, Hủy, Hoàn thành đơn hàng).
- **Actor chính:** Admin / Staff (Nhân viên vận hành).
- **Module:** Quản lý đơn hàng (Bookings Management).
- **Source inputs:**
  - Thiết kế & UX: `D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_detail.md`
  - Backend Routing & Controllers: `D:\DATN\danangtrip-api\routes\api.php`, `BookingController.php`, `BookingRepository.php`
  - Client codebase: `src/routes/routes.ts`, `src/api/bookingApi.ts`, `src/hooks/useBookingQueries.ts`

---

## 2) Component Breakdown

### [REUSE] — Components đã có
| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `BookingStatusBadge` | `src/pages/Bookings/BookingList/components/BookingStatusBadge.tsx` | Không | Dùng lại để hiển thị trạng thái đơn hàng |
| `PaymentStatusBadge` | `src/pages/Bookings/BookingList/components/PaymentStatusBadge.tsx` | Không | Dùng lại để hiển thị trạng thái thanh toán |
| `BookingCancelDialog` | `src/pages/Bookings/BookingList/components/BookingCancelDialog.tsx` | Không | Dùng để xác nhận hủy đơn (yêu cầu lý do) |

### [NEW] — Components cần tạo mới
| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| `BookingDetail` | Trang chính hiển thị chi tiết đơn hàng | Organism / Page | `{}` (Lấy ID từ URL params) |
| `VirtualTimeline` | Lịch sử trạng thái đơn hàng tự dựng từ các mốc thời gian thực tế của đơn hàng | Molecule | `{ bookedAt: string; confirmedAt?: string \| null; completedAt?: string \| null; cancelledAt?: string \| null; cancellationReason?: string }` |
| `PassengerListPlaceholder` | Phần hiển thị thông tin hành khách (kèm thông tin cảnh báo GAP API) | Molecule | `{ quantityAdult: number; quantityChild: number; quantityInfant: number }` |
| `BookingInvoiceButton` | Nút in hóa đơn gọi API xuất file | Molecule | `{ bookingId: number \| string; isSubmitting?: boolean }` |

### [MOD] — Components cần chỉnh sửa
| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| `BookingCard` | `src/pages/Bookings/BookingList/components/BookingCard.tsx` | Đổi sự kiện click "Eye" (Xem chi tiết) từ mở Dialog thành chuyển hướng sang route `/admin/bookings/:id` | Di chuyển luồng thao tác từ popup sang trang chi tiết chuyên dụng |

---

## 3) Responsive Behavior
| Breakpoint | Layout | Note |
|------------|--------|------|
| Desktop (≥1024px) | 2 cột song song (Trái 65% - Phải 35% / Sticky Sidebar) | Layout tiêu chuẩn theo tài liệu UX thiết kế |
| Tablet (768-1023px) | 1 cột duy nhất, Sidebar đẩy xuống dưới hoặc thu gọn | Các thông tin phụ xếp chồng theo thứ tự |
| Mobile (<768px) | 1 cột xếp chồng, Spacing thu nhỏ, table chuyển sang dạng card | Tối ưu hiển thị bảng số lượng và thông tin chi tiết |

---

## 4) UI States
| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| **Toàn bộ trang** | Skeleton loader mô phỏng cấu trúc 2 cột | Hiển thị thông báo "Không tìm thấy đơn hàng" kèm nút quay lại | Hiển thị error alert và nút "Thử lại" | Hiển thị thông tin đơn hàng đầy đủ | N/A | N/A |
| **Thao tác đơn hàng (Sidebar)** | Hiển thị spinner trên button đang trigger | N/A | Toast lỗi từ mutation | Toast thành công và cập nhật lại dữ liệu (Query invalidation) | Trạng thái button bị disabled khi đang xử lý | Hiệu ứng hover nổi bật trên các button hành động |

---

## 5) Data Fields
| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `id` | `number` | ✓ | Phải là số nguyên dương | `1008` | `GET /admin/bookings/{id}` |
| `booking_code` | `string` | ✓ | Định dạng `#BK-XXXX` | `#BK-1008` | `GET /admin/bookings/{id}` |
| `booking_status` | `string` | ✓ | `pending` \| `confirmed` \| `completed` \| `cancelled` | `pending` | `GET /admin/bookings/{id}` |
| `payment_status` | `string` | ✓ | `pending` \| `paid` \| `refunded` | `paid` | `GET /admin/bookings/{id}` |
| `customer_name` | `string` | ✓ | — | `Nguyễn Văn A` | `GET /admin/bookings/{id}` |
| `customer_email` | `string` | ✓ | Định dạng email | `customer@example.com` | `GET /admin/bookings/{id}` |
| `customer_phone` | `string` | ✓ | Định dạng số điện thoại | `0901234567` | `GET /admin/bookings/{id}` |
| `customer_address` | `string \| null` | ✗ | — | `Đà Nẵng` | `GET /admin/bookings/{id}` |
| `customer_note` | `string \| null` | ✗ | — | `Yêu cầu phòng hướng biển` | `GET /admin/bookings/{id}` |
| `total_amount` | `number` | ✓ | Số >= 0 | `2200000` | `GET /admin/bookings/{id}` |
| `discount_amount` | `number` | ✓ | Số >= 0 | `0` | `GET /admin/bookings/{id}` |
| `final_amount` | `number` | ✓ | Số >= 0 | `2200000` | `GET /admin/bookings/{id}` |
| `payment_method` | `string` | ✓ | `MoMo` \| `VNPay` \| `ZaloPay` | `MoMo` | `GET /admin/bookings/{id}` |
| `booked_at` | `string` | ✓ | ISO Date | `2026-04-06T14:30:00Z` | `GET /admin/bookings/{id}` |
| `confirmed_at` | `string \| null` | ✗ | ISO Date | `2026-04-06T15:00:00Z` | `GET /admin/bookings/{id}` |
| `cancelled_at` | `string \| null` | ✗ | ISO Date | `2026-04-06T16:00:00Z` | `GET /admin/bookings/{id}` |
| `completed_at` | `string \| null` | ✗ | ISO Date | `2026-04-06T18:00:00Z` | `GET /admin/bookings/{id}` |
| `cancellation_reason` | `string \| null` | ✗ | — | `Khách đổi lịch trình` | `GET /admin/bookings/{id}` |

---

## 6) API Endpoints
| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| `GET` | `/admin/bookings/{id}` | Có | Params: `{id}` | `ApiResponse<AdminRawBookingDetail>` | Có (Cần định nghĩa endpoint & api function) |
| `PATCH` | `/admin/bookings/{id}/status` | Có | Body: `{ booking_status: string, cancellation_reason?: string }` | `ApiResponse<AdminRawBookingItem>` | Không (Đã có `updateStatus` trong `bookingApi.ts`) |
| `GET` | `/user/bookings/{id}/invoice` | Có | Params: `{id}` | File Blob | Có (Cần định nghĩa endpoint & api function) |

---

## 7) Mapper Requirements
| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| `booking_code` | `string` | `code` | Giữ nguyên |
| `total_amount` | `string \| number` | `totalAmount` | `toNumberSafe(val)` |
| `discount_amount` | `string \| number` | `discountAmount` | `toNumberSafe(val)` |
| `final_amount` | `string \| number` | `finalAmount` | `toNumberSafe(val)` |
| `deposit_amount` | `string \| number` | `depositAmount` | `toNumberSafe(val)` |
| `booked_at` | `string` | `bookedAt` | Giữ nguyên |
| `confirmed_at` | `string \| null` | `confirmedAt` | Giữ nguyên |
| `completed_at` | `string \| null` | `completedAt` | Giữ nguyên |
| `cancelled_at` | `string \| null` | `cancelledAt` | Giữ nguyên |
| `cancellation_reason`| `string \| null` | `cancellationReason` | Giữ nguyên |

---

## 8) Business Rules
- **BR-01 (Điều kiện chuyển trạng thái):**
  - Đơn ở trạng thái `pending` (Chờ xác nhận) có thể được chuyển sang `confirmed` (Xác nhận) hoặc `cancelled` (Hủy).
  - Đơn ở trạng thái `confirmed` (Đã xác nhận) có thể được chuyển sang `completed` (Hoàn tất) hoặc `cancelled` (Hủy).
  - Đơn ở trạng thái `completed` (Hoàn tất) hoặc `cancelled` (Đã hủy) là các trạng thái cuối cùng, không thể thay đổi trạng thái nữa.
- **BR-02 (Lý do hủy đơn):** Khi chuyển sang trạng thái `cancelled`, bắt buộc phải cung cấp lý do hủy đơn (cancellation_reason).
- **BR-03 (Bảo vệ thông tin):** Chỉ admin hoặc nhân viên có quyền quản trị mới truy cập được màn hình chi tiết đơn hàng của toàn hệ thống.

---

## 9) Actors & Permissions
| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| admin | Xem toàn bộ chi tiết, cập nhật trạng thái đơn hàng, in hóa đơn | Không có hạn chế | Quyền tối cao |
| staff | Xem chi tiết, cập nhật trạng thái đơn hàng, in hóa đơn | Không thể chỉnh sửa cấu trúc dữ liệu chính | Nhân viên hỗ trợ vận hành |

---

## 10) Edge Cases
- **EC-01 (API Gaps - Danh sách hành khách & Lịch sử trạng thái chi tiết):**
  - **Mô tả:** Tài liệu thiết kế yêu cầu load chi tiết hành khách từ `/admin/bookings/{id}/passengers` và lịch sử timeline chi tiết từ `/admin/bookings/{id}/timeline`. Tuy nhiên, backend API không hỗ trợ các route này.
  - **Giải pháp:**
    - Thay vì query API không tồn tại, hiển thị số lượng khách NL/TE/EB tổng hợp từ `items` (BookingItem) và hiển thị thông báo chú thích nhỏ về GAP.
    - Xây dựng một Virtual Timeline tự động từ các thuộc tính thời gian thực tế trên đơn hàng (`booked_at`, `confirmed_at`, `completed_at`, `cancelled_at`).
- **EC-02 (Lỗi kết xuất Hóa đơn):** Khi in hóa đơn, nếu file PDF/HTML không tạo được, cần hiển thị toast thông báo lỗi rõ ràng thay vì crash ứng dụng.

---

## 11) Assumptions & Open Questions
### Assumptions
- **[ASSUMPTION] A-01:** Virtual Timeline tự dựng từ các trường thời gian (`booked_at`, `confirmed_at`, `completed_at`, `cancelled_at`) đủ đáp ứng nhu cầu xem lịch sử trạng thái cơ bản của Admin ở phiên bản này mà không cần gọi API lịch sử chi tiết.
- **[ASSUMPTION] A-02:** API Hóa đơn (`/user/bookings/{id}/invoice`) trả về định dạng file PDF hoặc HTML hiển thị trực quan hóa đơn để in.

### Open Questions
- *Không có câu hỏi mở tồn đọng cần giải đáp từ User do đã xác nhận GAP nghiệp vụ ở bước discovery.*

---

## 12) Implementation Checklist
- [ ] Định nghĩa types chi tiết đơn hàng trong `src/dataHelper/booking.dataHelper.ts` (03-types-api-contract)
- [ ] Thêm các API endpoints mới và mapper tương ứng trong `src/constants/endpoints.ts`, `src/api/bookingApi.ts` và `src/dataHelper/booking.mapper.ts`
- [ ] Thêm route mới `/admin/bookings/:id` vào `src/routes/routes.ts` và tích hợp vào Router của ứng dụng tại `src/routes/index.tsx` (04-layout-routing)
- [ ] Cập nhật component `BookingCard` để chuyển hướng sang trang chi tiết thay vì mở Dialog cũ
- [ ] Xây dựng giao diện trang chi tiết `BookingDetail/index.tsx` với cấu trúc 2 cột, responsive hoàn chỉnh (05-ui-components)
- [ ] Tích hợp react-query hooks để fetch chi tiết đơn hàng, xử lý loading/error states (06-data-integration)
- [ ] Cài đặt các mutations xử lý trạng thái đơn hàng (Xác nhận, Hủy, Hoàn tất) và in hóa đơn (07-interactions)
- [ ] Tối ưu hóa UI/UX: Thêm các hiệu ứng micro-animations, glassmorphism, và đảm bảo parity ngôn ngữ (vi/en) cho trang chi tiết (08-aesthetics-and-translation)
- [ ] Kiểm thử lint, typecheck và build hoàn tất (09-verification)

---

## 13) Files / Areas Likely To Change
- `src/constants/endpoints.ts` (Thêm endpoint chi tiết & invoice)
- `src/api/bookingApi.ts` (Thêm function getDetail và getInvoice)
- `src/dataHelper/booking.dataHelper.ts` (Định nghĩa interface chi tiết)
- `src/dataHelper/booking.mapper.ts` (Thêm hàm map cho BookingDetail)
- `src/hooks/useBookingQueries.ts` (Thêm query hook `useAdminBookingDetailQuery` và mutation hook `useInvoiceQuery`)
- `src/routes/routes.ts` (Thêm route `/admin/bookings/:id`)
- `src/routes/index.tsx` (Thêm lazy load component BookingDetail)
- `src/pages/Bookings/BookingList/components/BookingCard.tsx` (Cập nhật nút Xem chi tiết)
- `src/pages/Bookings/BookingDetail/index.tsx` (Tạo mới toàn bộ trang chi tiết)
- `public/lang/vi/booking.json` & `public/lang/en/booking.json` (Bổ sung từ khóa dịch thuật)
