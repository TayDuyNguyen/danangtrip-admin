# Project Audit: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02
- **Audit Target**: `danangtrip-admin` & `danangtrip-api`

---

## 1. Routing Conventions & Scope
- **Route Constant**: `ROUTES.LANDING_PAGES` sẽ được định nghĩa là `/admin/landing-pages` trong `src/routes/routes.ts`.
- **Lazy Loading**: Route này sẽ được đăng ký trong `src/routes/index.tsx` sử dụng cấu hình React.lazy, đảm bảo tải động code-splitting.
- **Menu Sidebar**: Sidebar sẽ lấy đường dẫn trực tiếp từ hằng số `ROUTES.LANDING_PAGES` để kích hoạt trạng thái hiển thị tích cực (active link) khi người dùng truy cập.

---

## 2. i18n Translation Loaders
- **Registration**: Namespace mới `landing_pages` sẽ được thêm vào mảng `ns` của i18next trong `src/i18n/index.ts`.
- **Location Files**:
  - Tiếng Việt: `public/lang/vi/landing_pages.json`
  - Tiếng Anh: `public/lang/en/landing_pages.json`
- **Sidebar & Common translations**: Key hiển thị sidebar menu `"sidebar.landing_pages"` sẽ được khai báo trong `public/lang/vi/common.json` và `public/lang/en/common.json`.

---

## 3. Data Flow & Patterns Audit
- **HTTP Client**: Tất cả các yêu cầu API sẽ được định nghĩa trong `src/api/landingPageApi.ts` và sử dụng `axiosClient` có sẵn từ `src/api/axiosClient.ts`.
- **Server State Management**: Sử dụng `@tanstack/react-query` v5 với các hooks chuyên biệt trong `src/hooks/useLandingPageQueries.ts`.
- **Cache Invalidation**: Sau khi gọi mutation thành công (Tạo, Sửa, Xóa, hoặc Toggle Status), hệ thống sẽ invalidate `['landing_pages']` để tự động cập nhật danh sách UI mà không cần tải lại toàn bộ trang.

---

## 4. Scripts & Build Gates Audit
- **Frontend Commands**:
  - `npm run dev`: Chạy môi trường local dev server.
  - `npm run lint`: Kiểm tra chất lượng mã nguồn bằng ESLint.
  - `npm run typecheck`: Biên dịch TypeScript kiểm tra kiểu dữ liệu tĩnh.
  - `npm run build`: Build gói production để kiểm chứng chất lượng trước khi hoàn thành.
  - `npm run prepush:check`: Chạy kiểm tra lint + typecheck + build.
- **Backend Commands**:
  - `php artisan test`: Kiểm tra tính chính xác của các API unit & integration tests.

---

## 5. Audit Conclusion
- Không có bất kỳ vấn đề xung đột thư viện hay scripts nào cản trở việc triển khai.
- Hệ thống đã sẵn sàng để thực hiện bước Step 03: Thiết kế API và Types.
