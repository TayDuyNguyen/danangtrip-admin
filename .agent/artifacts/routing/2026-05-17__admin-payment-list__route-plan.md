# Đặc tả Định tuyến & Cấu trúc Bố cục (Layout & Routing Specification)

- **Feature Slug:** `admin-payment-list`
- **Mã định danh:** `Kế hoạch định tuyến`
- **Ngày lập:** 2026-05-17
- **Trạng thái:** **INTEGRATED & VERIFIED**

---

## 1. Thiết lập Tuyến đường Định tuyến (Route Configuration)

Các tệp cấu hình định tuyến của ứng dụng đã được đăng ký và cập nhật đồng bộ như sau:

1. **Đăng ký Tuyến đường (Route Path Key):**
   Đường dẫn định danh được lưu trữ tập trung tại [routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts):
   ```typescript
   export const ROUTES = {
       // ... các tuyến đường hiện tại
       PAYMENTS_LIST: '/admin/payments',
   } as const;
   ```

2. **Khai báo Nạp động (Lazy-loading Page Component):**
   Trong [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx), component được cấu hình lazy-load để tối ưu dung lượng tải lần đầu của Bundle:
   ```typescript
   const PaymentList = React.lazy(() => import('@/pages/Payments/PaymentList'));
   ```

3. **Gắn kết Tuyến đường an toàn (PrivateRoute Guarding):**
   Đăng ký trang dưới quyền quản lý của layout bảo vệ `PrivateRoute` và khung `MainLayout` trong `index.tsx`:
   ```typescript
   {
       element: <PrivateRoute />,
       errorElement: <ErrorPage />,
       children: [
           {
               element: <MainLayout />,
               children: [
                   // ... các trang khác
                   { path: ROUTES.PAYMENTS_LIST, element: withSuspense(PaymentList) },
               ]
           }
       ],
   }
   ```

---

## 2. Liên kết Điều hướng Sidebar (Sidebar Link Integration)

1. **Biểu tượng giao dịch:**
   Sử dụng icon `CreditCard` nhập khẩu trực tiếp từ bộ thư viện chất lượng cao `lucide-react` để hiển thị trên menu điều hướng.
2. **Khai báo Menu danh mục:**
   Đăng ký mục điều hướng mới trong danh sách `navItems` tại [Sidebar.tsx](file:///d:/DATN/danangtrip-admin/src/components/common/Sidebar.tsx):
   ```typescript
   const navItems = [
       // ... các mục trước
       { icon: ShoppingCart, label: 'sidebar.orders', path: ROUTES.BOOKINGS_LIST },
       { icon: CreditCard, label: 'sidebar.payments', path: ROUTES.PAYMENTS_LIST },
       { icon: FileText, label: 'sidebar.posts', path: '/admin/posts' },
       // ... các mục sau
   ];
   ```

---

## 3. Khung trang chính sơ khởi (Page Shell Scaffold)

Trang được tạo thành công tại [index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/index.tsx). Trong các bước tiếp theo, khung này sẽ tích hợp các thành phần UI chức năng cao cấp và kết nối luồng React Query.
