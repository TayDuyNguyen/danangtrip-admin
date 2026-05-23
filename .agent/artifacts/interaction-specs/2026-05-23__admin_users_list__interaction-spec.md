# Interaction Specification: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `interaction specifications`

---

## 1) URL Search Params Sync (Đồng bộ bộ lọc URL)

Hệ thống đồng bộ hai chiều giữa trạng thái bộ lọc trên UI và tham số truy vấn trên URL trình duyệt (`useSearchParams`):

- **Các tham số hỗ trợ:**
  - `q`: Từ khóa tìm kiếm (debounce 300ms).
  - `role`: Bộ lọc vai trò (`user`, `staff`, `admin`).
  - `status`: Bộ lọc trạng thái (`active`, `banned`).
  - `page`: Chỉ số trang hiện tại.
  - `per_page`: Số dòng hiển thị mỗi trang.
  - `sort_by`: Cột đang sắp xếp.
  - `sort_order`: Hướng sắp xếp (`asc`, `desc`).
- **Trải nghiệm:** Khi người dùng thay đổi bất kỳ bộ lọc nào, trang tự động reset về `page=1`, cập nhật URL và React Query tự động nạp dữ liệu tương ứng. Khi tải lại trang (F5), các bộ lọc cũ trên URL được khôi phục nguyên vẹn.

---

## 2) Dialog Confirmations & Toast Feedback

Để tránh các sai sót thao tác nguy hiểm và tăng độ mượt mà cho trải nghiệm (UX):

- **Xác nhận đổi quyền Admin:**
  - Cửa sổ nhỏ nổi lên hỏi: "Bạn có chắc muốn cấp quyền Admin cho [Tên]?" kèm giải thích "Tài khoản này sẽ có toàn quyền quản trị hệ thống".
  - Nút Hủy và Xác nhận (Teal) đều hỗ trợ trạng thái vô hiệu hóa (disabled) khi đang gửi request.
- **Xác nhận xóa tài khoản:**
  - Modal cảnh báo đỏ nguy hiểm.
  - Hộp chú ý màu vàng: "⚠ Tất cả đơn hàng, đánh giá, yêu thích và thông báo của người dùng này sẽ bị xóa theo."
- **Toasts Feedback (sonner):**
  - Mọi thao tác thành công đều bắn Toast xanh lá mượt ở góc màn hình.
  - Lỗi mạng hoặc lỗi backend bắn Toast đỏ mô tả chi tiết lỗi (ví dụ: Quyền hạn không đủ).

---

## 3) Bulk Actions (Hành động hàng loạt)

- **Cơ chế kích hoạt:** Xuất hiện thanh công cụ phụ bên trên bảng khi có từ `1` dòng checkbox trở lên được tick chọn.
- **Hành động hỗ trợ:**
  - *Kích hoạt hàng loạt:* Lặp qua danh sách ID được tick và chạy song song cập nhật status sang `active`.
  - *Khóa hàng loạt:* Cập nhật status sang `banned`.
  - *Xóa hàng loạt:* Modal confirm, xóa song song.
- **UX:** Khi đang chạy đột biến hàng loạt (`Promise.all`), thanh bulk action bị disable toàn bộ, hiển thị spinner và tự động reset checkbox về rỗng sau khi hoàn thành.
