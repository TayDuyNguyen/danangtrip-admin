# Data Integration Plan: Chi tiết giao dịch (Payment Detail)

> Feature slug: `admin-payments-detail`
> Date: 2026-05-21
> API module: `src/api/paymentApi.ts`

---

## 1) Data Sources
| Purpose | Endpoint | Hook | Notes |
|---|---|---|---|
| Lấy chi tiết giao dịch | `GET /v1/admin/payments/{id}` | `useAdminPaymentDetailQuery` | Truy vấn toàn bộ thông tin thanh toán, booking và khách hàng đính kèm. |
| Yêu cầu hoàn tiền | `POST /v1/admin/payments/{id}/refund` | `refundMutation` (từ `usePaymentMutations`) | Gửi yêu cầu hoàn tiền kèm tham số `refund_reason` từ quản trị viên. |

## 1.1) Data Ownership Notes
- **Query chính**: `useAdminPaymentDetailQuery(id)` là nguồn dữ liệu chuẩn (source of truth) duy nhất cung cấp trạng thái giao dịch hiện tại, mã code đơn đặt và thông tin khách hàng cho màn hình chi tiết.
- **Query bổ trợ**: `useAdminPaymentsQuery` (ở màn danh sách giao dịch) và các số liệu doanh thu trên `useAdminDashboardQuery` sẽ bị ảnh hưởng trực tiếp khi trạng thái hoàn tiền (`refunded`) được cập nhật thành công.

## 2) Query Plan
| Query Key | Query Type | Trigger | staleTime | Mapper |
|---|---|---|---|---|
| `['payments', 'detail', id]` | Detail | Tự động tải khi component mount và có tham số `id` | `60000` (1 phút) | `mapPaymentItem` trong `payment.mapper.ts` |

## 2.1) Parallel / Dependent Query Notes
- Không có truy vấn song song hoặc truy vấn phụ thuộc nào khác cần thiết cho màn hình này, toàn bộ thông tin về khách hàng, tour và đơn đặt đều đã được lồng trong cấu trúc kết quả trả về của API chi tiết giao dịch thanh toán.

## 3) Mutation Plan
| Action | API Method | Success Handling | Error Handling |
|---|---|---|---|
| **Hoàn tiền giao dịch** | `paymentApi.refund(id, { refund_reason })` | Vô hiệu hóa toàn bộ cache giao dịch (`paymentKeys.all`) để cập nhật lại danh sách và chi tiết; vô hiệu hóa cache dashboard (`['dashboard']`); hiển thị toast success; đóng hộp thoại. | Trích xuất thông báo lỗi nghiệp vụ từ API (ví dụ: `error.response.data.message`) hoặc sử dụng lỗi mạng mặc định; hiển thị toast error thông qua `sonner`. |

## 4) UI State Handling
| UI Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| **Khung lắp ráp chính (Page Shell)** | Spinner xoay tròn ở giữa màn hình đi kèm chữ "Đang tải dữ liệu...". | Hiển thị màn hình báo lỗi giao dịch không tồn tại với nút "Quay lại danh sách". | Renders hộp cảnh báo đỏ và nút quay lại nếu API lỗi hoặc trả về rỗng. | Hiển thị bố cục lưới chi tiết 3 cột. |
| **Nút Hoàn tiền (Refund Action)** | Thêm icon vòng xoay `RefreshCw` chuyển động xoay tròn, vô hiệu hóa click chuột. | N/A | N/A | N/A |

## 4.1) Error Strategy
| Error Type | UI Handling | Toast | Retry |
|---|---|---|---|
| **Lỗi tải dữ liệu chi tiết (API 404/500)** | Hiển thị card trạng thái lỗi tĩnh kèm nút điều hướng quay về trang danh sách. | Không hiển thị toast để tránh lặp. | Có (người dùng bấm F5 hoặc bấm nút quay lại danh sách để thử lại). |
| **Lỗi thực hiện hoàn tiền (API Validation/403)** | Giữ nguyên modal, hiện thông báo lỗi nghiệp vụ dạng toast thông qua `sonner`. | Có (Toast báo lỗi chi tiết nhận từ API). | Có (Người dùng sửa lại lý do hoàn tiền và nhấn gửi lại). |

## 5) Files Expected To Change
- `src/pages/Payments/PaymentDetail/index.tsx`

## 6) Risks / Open Questions
- **R-01**: Đồng bộ cache dashboard: Cần đảm bảo `queryClient.invalidateQueries({ queryKey: ["dashboard"] })` dọn sạch cache của biểu đồ doanh thu và thống kê để dữ liệu trang chủ admin phản ánh chính xác khoản tiền vừa được hoàn lại.
