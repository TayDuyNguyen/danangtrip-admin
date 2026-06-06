# Data Integration: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02
- **Tệp tin Tích hợp**:
  - API Service: [landingPageApi.ts](file:///d:/DATN/danangtrip-admin/src/api/landingPageApi.ts)
  - TanStack Query hooks: [useLandingPageQueries.ts](file:///d:/DATN/danangtrip-admin/src/hooks/useLandingPageQueries.ts)
  - Main view: [index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/index.tsx)

---

## 1. API Integration Flow

Tính năng kết nối trực tiếp với backend RESTful API thông qua `axiosClient`:
1. **Fetch list**: `useLandingPages` gọi hàm `landingPageApi.list(filters)` và lưu trữ dữ liệu với key `['landing_pages', filters]`.
2. **Detail**: `useLandingPage` gọi hàm `landingPageApi.get(id)` kích hoạt khi truyền ID khác null.
3. **Mutations**:
   - `useCreateLandingPage` => `POST /admin/landing-pages`
   - `useUpdateLandingPage` => `PUT /admin/landing-pages/{id}`
   - `useUpdateLandingPageStatus` => `PATCH /admin/landing-pages/{id}/status`
   - `useDeleteLandingPage` => `DELETE /admin/landing-pages/{id}`

---

## 2. React Query Cache & Invalidation Strategy

Để đảm bảo dữ liệu luôn mới nhất mà không cần tải lại toàn bộ trình duyệt (F5):
- Mỗi mutation khi thành công (`onSuccess`) đều thực hiện tự động gọi `queryClient.invalidateQueries({ queryKey: ['landing_pages'] })`.
- Đối với mutation cập nhật chi tiết (`useUpdateLandingPage`), hệ thống đồng thời invalidates thêm key `['landing_pages', 'detail', id]` để đảm bảo dữ liệu trong form Drawer được cập nhật mới nhất ở lần mở tiếp theo.
- Sử dụng hàm `mutateAsync` thay vì `mutate` trong form drawer submit để đợi phản hồi từ server hoàn tất trước khi thực hiện đóng Drawer.

---

## 3. Debounce & Optimization

- Để ngăn chặn việc gửi quá nhiều request API dồn dập lên server khi admin gõ tìm kiếm, ô nhập liệu Title/Slug được cấu hình hook `useDebounce` với độ trễ `400ms`.
- Chỉ khi admin dừng gõ quá 400ms, bộ lọc tìm kiếm mới cập nhật trạng thái và kích hoạt React Query fetch dữ liệu.
- Reset số trang (`page`) về 1 bất cứ khi nào bộ lọc thay đổi để tránh lỗi rỗng dữ liệu khi số lượng trang mới nhỏ hơn trang hiện tại.
