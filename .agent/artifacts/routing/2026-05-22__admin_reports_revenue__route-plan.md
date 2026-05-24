# Kế hoạch & Thiết lập Định tuyến (admin_reports_revenue)

Tài liệu này chi tiết hóa việc tích hợp định tuyến (Routing) màn hình **Báo cáo Doanh thu** vào hệ thống điều hướng quản trị của ứng dụng `danangtrip-admin`.

---

## 1. Khai báo Route & Khóa định danh

Đường dẫn tĩnh cho màn hình báo cáo doanh thu đã được thêm trực tiếp vào tệp chứa các hằng số định tuyến hệ thống:

* **Hằng số:** `ROUTES.REPORTS_REVENUE`
* **Đường dẫn (Path):** `/admin/reports/revenue`
* **Tệp khai báo:** [routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts)

```typescript
export const ROUTES = {
    ...
    REPORTS_RATINGS: '/admin/reports/ratings',
    REPORTS_BOOKINGS: '/admin/reports/bookings',
    REPORTS_REVENUE: '/admin/reports/revenue', // Mới thêm
} as const;
```

---

## 2. Lazy Loading & Đăng ký bảo vệ (PrivateRoute)

Màn hình được tải thông qua cơ chế phân tách mã (Code Splitting) bằng `React.lazy` nhằm tăng tốc độ phản hồi tải trang ban đầu của Admin Dashboard. Route này được bọc bảo vệ dưới component `PrivateRoute` (chỉ cho phép quản trị viên/nhân viên truy cập sau khi xác thực thành công):

* **Tệp cấu hình:** [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx)

```typescript
// Lazy Load Component
const RevenueReport = React.lazy(() => import('@/pages/Reports/RevenueReport'));

// Khai báo Route bảo vệ dưới MainLayout
{
    element: <PrivateRoute />,
    children: [
        {
            element: <MainLayout />,
            children: [
                ...
                { path: ROUTES.REPORTS_REVENUE, element: withSuspense(RevenueReport) },
            ]
        }
    ]
}
```

---

## 3. Quản lý Trạng thái qua URL SearchParams

Để đảm bảo khả năng đồng bộ cao khi tải lại trang (F5) hoặc chia sẻ đường dẫn nội bộ giữa các quản trị viên, trạng thái bộ lọc được gắn chặt vào URL:

* `from`: ngày bắt đầu lọc (YYYY-MM-DD).
* `to`: ngày kết thúc lọc (YYYY-MM-DD).
* `payment_gateway`: cổng thanh toán (`all` | `momo` | `vnpay` | `zalopay`).
* `page`: trang dữ liệu hiện tại của bảng chi tiết.

Component cha điều phối `index.tsx` sẽ lắng nghe sự thay đổi của các tham số trên qua `useSearchParams` để tự động kích hoạt tải lại dữ liệu thích hợp từ React Query.

---

> [!NOTE]  
> Hạ tầng định tuyến và cấu trúc lazy-loading đã được đăng ký và kiểm tra biên dịch thành công. Sẵn sàng chuyển tiếp sang bước tiếp theo **05-ui-components** để phát triển các component UI cao cấp.
