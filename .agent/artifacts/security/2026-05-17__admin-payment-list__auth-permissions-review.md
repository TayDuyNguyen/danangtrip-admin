# Tài liệu Kỹ thuật: Đánh giá Phân quyền & Bảo mật (Auth & Permissions Review Specification)

- **Feature Slug:** `admin-payment-list`
- **Mã định danh:** `Đánh giá Phân quyền`
- **Ngày lập:** 2026-05-17
- **Trạng thái:** **FULLY VERIFIED & SECURED**

---

## 1. Cơ chế Bảo vệ Định tuyến (Route-Level Protection)

Trang Danh sách Giao dịch được bảo vệ đa tầng chống truy cập trái phép:

1. **Rào cản Đăng nhập (`PrivateRoute`):**
   Trang được khai báo lồng dưới route cha `<PrivateRoute />` tại [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx). Mọi người dùng chưa được định danh (chưa đăng nhập, thiếu token hợp lệ) khi truy cập trực tiếp vào `/admin/payments` sẽ bị hệ thống tự động chặn đứng và chuyển hướng quay lại trang đăng nhập `/login`.
2. **Khung giao dịch chuẩn chỉnh (`MainLayout`):**
   Chỉ khi người dùng đi qua lớp xác thực thành công, component mới được khởi tạo bên trong lớp bọc `MainLayout` để nhận dữ liệu context người dùng và hiển thị Sidebar cùng các thông số.

---

## 2. Kiểm soát Phân quyền Vai trò chi tiết (Role-Level Gating)

Hệ thống phân biệt rõ ràng hai nhóm người dùng vận hành có quyền truy cập trang giao dịch:

| Nhóm vai trò | Quyền xem danh sách | Quyền xuất báo cáo Excel | Quyền hoàn tiền (Refund Action) | Trải nghiệm UI hoàn tiền |
| --- | --- | --- | --- | --- |
| **Quản trị viên (`admin`)** | **CÓ** | **CÓ** | **CÓ** | Nút Hoàn tiền hoạt động bình thường, mở popup xác nhận. |
| **Nhân viên vận hành (`staff`)** | **CÓ** | **CÓ** | **KHÔNG** | Nút Hoàn tiền bị khóa (`disabled`), hiển thị Tooltip hướng dẫn giải thích lý do khi hover chuột. |

### Cơ chế kỹ thuật thực hiện tại giao diện:
- Lấy thông tin vai trò từ Hook xác thực tập trung: `const { user } = useAuth();`
- Kiểm tra tính hợp lệ: `const isAdmin = user?.role === 'admin';`
- Chặn hành vi trực tiếp tại thành phần bảng [PaymentTable.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentTable.tsx):
  ```typescript
  <button
      onClick={() => onRefundClick(payment)}
      disabled={!isAdmin}
      className="..."
  >
  ```
