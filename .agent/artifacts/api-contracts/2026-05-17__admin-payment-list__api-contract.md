# Tài liệu Kỹ thuật: Hợp đồng dữ liệu & Thiết kế API (API Contract Specification)

- **Feature Slug:** `admin-payment-list`
- **Mã định danh:** `Hợp đồng API Giao dịch`
- **Ngày lập:** 2026-05-17
- **Trạng thái:** **APPROVED & FULLY ALIGNED**

---

## 1. Bản đồ Định tuyến API Backend (API Routing Map)

| Phương thức | Đường dẫn API | Chức năng | Phân quyền tối thiểu | Thể loại kết quả |
| --- | --- | --- | --- | --- |
| **GET** | `/admin/payments` | Lấy danh sách giao dịch có phân trang & bộ lọc | Staff / Admin | JSON (Danh sách phân trang) |
| **GET** | `/admin/payments/{id}` | Lấy thông tin chi tiết một giao dịch | Staff / Admin | JSON (Đối tượng đơn lẻ) |
| **POST** | `/admin/payments/{id}/refund` | Thực hiện hoàn tiền cho khách hàng | Admin | JSON (Đối tượng đã cập nhật) |
| **GET** | `/admin/payments/export` | Xuất danh sách giao dịch ra Excel | Staff / Admin | BLOB (Tệp nhị phân Spreadsheet) |

---

## 2. Đặc tả Kiểu Dữ liệu TypeScript (TypeScript Interfaces)

Các kiểu dữ liệu được khai báo nhất quán tại [payment.dataHelper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/payment.dataHelper.ts):

### A. Định nghĩa Trạng thái & Cổng thanh toán
```typescript
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentGateway = 'momo' | 'vnpay' | 'zalopay';
```

### B. Đối tượng Raw API Backend (`AdminRawPaymentItem`)
```typescript
export interface AdminRawPaymentItem {
    id: number;
    transaction_code: string;
    amount: number | string;
    payment_method: PaymentGateway;
    payment_status: PaymentStatus;
    refunded_at?: string | null;
    refund_reason?: string | null;
    created_at: string;
    updated_at: string;
    booking?: {
        id: number;
        booking_code: string;
        total_amount: number | string;
        customer_name?: string;
        customer_email?: string;
        customer_avatar?: string;
        tour_name?: string;
        tour_thumbnail?: string;
    } | null;
}
```

### C. Đối tượng hiển thị UI (`PaymentItem`)
```typescript
export interface PaymentItem {
    id: number;
    transactionCode: string;
    bookingCode: string;
    customerName: string;
    customerEmail: string;
    customerAvatar?: string;
    amount: number;
    gateway: PaymentGateway;
    status: PaymentStatus;
    refundedAt?: string | null;
    refundReason?: string | null;
    transactionDate: string;
    tourName: string;
    tourThumbnail?: string;
}
```

---

## 3. Đặc tả Yêu cầu Biểu mẫu & Tham số Lọc (Parameters & Payloads)

### A. Bộ lọc truy vấn danh sách (`PaymentListFilters`)
```typescript
export interface PaymentListFilters {
    search?: string;          // Khớp transaction_code hoặc booking_code
    payment_status?: string;  // Lọc theo PaymentStatus
    payment_gateway?: string; // Lọc theo PaymentGateway
    date_from?: string;       // YYYY-MM-DD
    date_to?: string;         // YYYY-MM-DD
}
```

### B. Payload Hoàn tiền (`POST /admin/payments/{id}/refund`)
- **Body JSON:**
```json
{
  "refund_reason": "string (Tối thiểu 10 ký tự, tối đa 255 ký tự)"
}
```
- **Validation rule:** Trường `refund_reason` là bắt buộc, không được để trống hoặc chứa toàn ký tự trắng.

---

## 4. Thiết kế Hàm Chuyển đổi Dữ liệu (Mappers)

Được phát triển tại [payment.mapper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/payment.mapper.ts):
- **`mapPaymentItem`**: Chuyển đổi an toàn số tiền từ kiểu String của DB sang Number bằng `toNumberSafe`. Trích xuất các trường phẳng từ quan hệ booking để giao diện React kết xuất nhanh chóng.
- **`mapPaymentList`**: Duyệt mảng an toàn qua `toArraySafe` để tránh lỗi sập giao diện khi server trả về giá trị null hoặc định dạng mảng không mong muốn. Tái cấu trúc metadata phân trang sạch sẽ.
