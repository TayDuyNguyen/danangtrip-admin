# UI Spec: Chi tiết giao dịch (Payment Detail)

> Feature slug: `admin-payments-detail`
> Date: 2026-05-21
> Source analysis: `.agent/artifacts/analysis/2026-05-21__admin-payments-detail__screen-analysis.md`

---

## 1) Summary
- **Mục tiêu UI**: Cung cấp giao diện quản trị trực quan để theo dõi thông tin chi tiết một giao dịch thanh toán (mã giao dịch, trạng thái, số tiền, cổng thanh toán, thời gian), thông tin đơn đặt (booking) và khách hàng liên quan, cùng lịch sử mốc thời gian trạng thái (timeline). Ngoài ra, cung cấp nút chức năng hoàn tiền (Refund) kiểm soát theo quyền hạn tài khoản.
- **Người dùng chính**: Admin (toàn quyền xem và thực hiện hoàn tiền), Staff (chỉ xem thông tin giao dịch).

## 1.1) UI Delivery Goal
- **Thông tin ưu tiên**: Mã giao dịch, Trạng thái thanh toán (Thành công/Đang xử lý/Thất bại/Đã hoàn tiền), Số tiền giao dịch và liên kết tới Đơn đặt chi tiết.
- **Thành phần Above-the-fold**: Tiêu đề trang (Mã giao dịch + Badge trạng thái), Nút hành động "Hoàn tiền" (chỉ kích hoạt cho Admin và trạng thái Success), thẻ thông tin tóm tắt giao dịch thanh toán.

## 2) Component Matrix

### [REUSE]
| Component | Path | Why reuse | Notes |
|---|---|---|---|
| `PaymentGatewayBadge` | `src/pages/Payments/PaymentList/components/PaymentGatewayBadge.tsx` | Hiển thị logo/tên cổng thanh toán có màu sắc chuẩn thương hiệu (MOMO, VNPAY, ZALOPAY). | Trực quan hóa cổng thanh toán. |
| `PaymentStatusBadge` | `src/pages/Payments/PaymentList/components/PaymentStatusBadge.tsx` | Hiển thị nhãn trạng thái giao dịch (Success, Pending, Failed, Refunded) đồng nhất với trang danh sách. | Dùng màu sắc tiêu chuẩn (teal, slate, rose, amber). |
| `RefundPaymentDialog` | `src/pages/Payments/PaymentList/components/RefundPaymentDialog.tsx` | Sử dụng lại modal xác nhận và điền lý do hoàn tiền để thực hiện mutation. | Đảm bảo tính nhất quán của hộp thoại. |

### [NEW]
| Component | Layer | Purpose | Expected Props |
|---|---|---|---|
| `PaymentDetail` | Page (Organism) | Trang giao diện chi tiết chính, chứa cấu trúc lưới, quản lý query/mutation, kiểm tra quyền và điều phối dialog hoàn tiền. | Không có (Sử dụng URL route params `:id`). |
| `VirtualTimeline` | Molecule | Renders lịch sử mốc thời gian giao dịch được nội suy từ các trường thời gian (`created_at`, `paid_at`, `refunded_at`) và trạng thái giao dịch. | `{ createdAt: string, paidAt?: string \| null, refundedAt?: string \| null, refundReason?: string \| null, status: string, gateway: string }` |

### [MOD]
| Component | Path | Required change | Impact |
|---|---|---|---|
| `PaymentTable` | `src/pages/Payments/PaymentList/components/PaymentTable.tsx` | Thay đổi liên kết mã giao dịch thành thẻ `<Link>` trỏ tới `/admin/payments/:id` và điều chỉnh liên kết mã đơn đặt sang `/admin/bookings/:id`. | Tăng khả năng liên kết giữa các màn hình quản trị. |

## 3) UI States
| Component | Loading | Empty | Error | Success | Disabled |
|---|---|---|---|---|---|
| `PaymentDetail` Page | Vòng xoay spinner ở giữa trang kèm thông điệp "Đang tải dữ liệu...". | Renders màn hình lỗi "Không tìm thấy giao dịch". | Khung thông báo lỗi "Không tìm thấy giao dịch hoặc giao dịch không tồn tại" kèm nút quay lại danh sách. | Hiển thị cấu trúc lưới 2 cột (Desktop) hoặc 1 cột (Mobile). | N/A |
| `Refund Payment` Button | Hiển thị icon xoay tròn biểu thị đang gọi API. | N/A | N/A | N/A | Bị vô hiệu hóa (`disabled`) nếu user không phải Admin, hoặc trạng thái giao dịch không phải `success`, hoặc mutation đang xử lý. |

## 3.1) Interaction Notes
| Component | Hover / Focus | Click / Expand | Notes |
|---|---|---|---|
| **Mã Đơn đặt (Booking Link)** | Chữ chuyển sang màu `#0f766e` (teal đậm hơn), hiện icon mũi tên ra ngoài. | Điều hướng tới `/admin/bookings/:id`. | Chỉ liên kết nếu có `bookingId`. |
| **Nút Hoàn tiền (Refund)** | Hiển thị nền đỏ đậm, chữ trắng, hiệu ứng bóng mờ nhẹ. | Mở hộp thoại `RefundPaymentDialog`. | Tooltip giải thích xuất hiện bên dưới nút nếu tài khoản là Staff (không đủ quyền). |
| **Nút Quay lại danh sách** | Nền teal đậm hơn (`bg-[#0f766e]`). | Điều hướng quay lại `/admin/payments`. | Dạng icon mũi tên kèm chữ. |

## 4) Responsive Notes
| Breakpoint | Behavior | Notes |
|---|---|---|
| **Mobile (< 1024px)** | Bố cục dạng 1 cột dọc (stacked). Thẻ thông tin thanh toán xếp đầu tiên, sau đó đến Đơn đặt & Khách hàng, cuối cùng là Lịch sử Trạng thái (Timeline). Nút hoàn tiền di chuyển lên Header và thu nhỏ kích thước chữ/padding nếu cần. | Tránh tràn màn hình và đảm bảo độ cao của timeline hợp lý. |
| **Tablet (>= 768px và < 1024px)** | Chia grid 2 cột cho các thẻ thông tin (Thanh toán & Khách hàng), Timeline nằm toàn bộ chiều ngang ở dưới. | Giữ bố cục cân đối. |
| **Desktop (>= 1024px)** | Lưới 3 cột: 2 cột bên trái dành cho thẻ Thông tin thanh toán và Đơn đặt & Khách hàng. 1 cột bên phải độc lập dành cho Lịch sử Trạng thái (Timeline). | Đảm bảo không gian hiển thị rộng rãi và gọn gàng. |

## 5) Files Expected To Change
- `src/pages/Payments/PaymentDetail/index.tsx`
- `src/pages/Payments/PaymentList/components/PaymentTable.tsx`

## 6) Build Order
1. **Atoms & Molecules**: Xây dựng component `VirtualTimeline` cục bộ trong file chi tiết.
2. **Page assembly**: Lắp ráp màn hình chính `PaymentDetail` tại `src/pages/Payments/PaymentDetail/index.tsx`, cấu trúc các thẻ thông tin và tích hợp logic hiển thị/ẩn nút bấm.
3. **Integration & Linking**: Điều chỉnh lại `PaymentTable.tsx` ở danh sách giao dịch để hoàn tất việc kết nối luồng người dùng.
