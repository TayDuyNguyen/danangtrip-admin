# Tài liệu Kỹ thuật: Tích hợp Dữ liệu React Query (Data Integration Specification)

- **Feature Slug:** `admin-payment-list`
- **Mã định danh:** `Hợp đồng Tích hợp`
- **Ngày lập:** 2026-05-17
- **Trạng thái:** **FULLY INTEGRATED & CACHED**

---

## 1. Khóa Bộ nhớ đệm (Query Cache Keys Map)

Được cấu hình phân cấp tại [usePaymentQueries.ts](file:///d:/DATN/danangtrip-admin/src/hooks/usePaymentQueries.ts) để quản lý cache thông minh:

```typescript
export const paymentKeys = {
    all: ["payments"] as const,
    lists: () => [...paymentKeys.all, "list"] as const,
    list: (filters: PaymentListFilters, page: number, limit: number) =>
        [...paymentKeys.lists(), { ...filters, page, limit }] as const,
    details: () => [...paymentKeys.all, "detail"] as const,
    detail: (id: number | string) => [...paymentKeys.details(), id] as const,
};
```

---

## 2. Các Hook Truy vấn dữ liệu (Query Hooks)

1. **`useAdminPaymentsQuery(filters, page, limit)`**
   - **Mục đích:** Tải danh sách giao dịch phân trang kèm bộ lọc động.
   - **Tối ưu staleTime:** `30000ms` (30 giây) để giảm tải cho server khi người quản trị di chuyển qua lại giữa các màn hình, nhưng vẫn đảm bảo độ mới của số liệu tài chính.
   - **Chuyển đổi:** Tích hợp trực tiếp mapper `mapPaymentList` tại luồng xử lý `queryFn`.

2. **`useAdminPaymentDetailQuery(id, enabled)`**
   - **Mục đích:** Tải thông tin chi tiết một giao dịch đơn lẻ.
   - **Tối ưu staleTime:** `60000ms` (1 phút).
   - **An toàn:** Chỉ kích hoạt khi có ID hợp lệ và cờ `enabled === true`.

---

## 3. Các Hook Nghiệp vụ Tương tác (Mutation Hooks)

1. **`refundMutation`**
   - **Mục đích:** Gửi yêu cầu hoàn tiền lên API `paymentApi.refund`.
   - **Đồng bộ hóa trạng thái (Cache Invalidation):** Sau khi hoàn tiền thành công (`onSuccess`), tự động vô hiệu hóa toàn bộ cache có khóa `payments` (`paymentKeys.all`) để cập nhật bảng danh sách ngay lập tức, đồng thời vô hiệu hóa cache `dashboard` để cập nhật lại biểu đồ doanh thu trên trang quản trị chính.

2. **`exportMutation`**
   - **Mục đích:** Tải báo cáo giao dịch Excel nhị phân (`responseType: 'blob'`).
   - **Trải nghiệm:** Sử dụng helper `prepareSpreadsheetDownload` để trích xuất tên tệp chính xác từ header của server và kích hoạt tải xuống trực tiếp trên trình duyệt qua `downloadBlobFile`.
