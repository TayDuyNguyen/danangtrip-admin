# Project Setup Audit: Chỉnh sửa Địa điểm (Edit Location)

- **Feature Slug**: `edit-location`
- **Date**: 2026-05-11
- **Repo**: `d:/DATN/danangtrip-admin`
- **Audit Verdict**: **PASS** (Ready for Implementation)

---

## 1. Summary

Cuộc audit này nhằm xác nhận tính sẵn sàng của nền tảng (project base) trước khi triển khai feature **Chỉnh sửa Địa điểm**. Kết quả cho thấy repo đang tuân thủ nghiêm ngặt các quy tắc trong `PROJECT_RULES.md` và không có dấu hiệu drift stack.

---

## 2. Dependency Audit

| Layer | Technology | Actual Version | Expected | Status |
|---|---|---|---|---|
| Framework | React | `19.2.4` | React 19+ | ✅ Pass |
| Routing | react-router-dom | `7.13.2` | v7 | ✅ Pass |
| Server State | TanStack Query | `5.95.2` | v5 | ✅ Pass |
| Client State | Zustand | `5.0.8` | v5 | ✅ Pass |
| HTTP Layer | Axios | `1.14.0` | 1.x | ✅ Pass |
| Styling | Tailwind CSS | `4.2.2` | v4 | ✅ Pass |
| Build Gate | Scripts | `prepush:check` | exists | ✅ Pass |

---

## 3. Repository Shape Audit

Cấu trúc thư mục `src/` tuân thủ đúng kiến trúc Triple-Layer và convention của dự án:
- `src/api/`: Chứa `axiosClient.ts` tập trung.
- `src/hooks/`: Chứa các hook React Query tách biệt.
- `src/pages/`: Tổ chức theo feature (Locations, Tours).
- `src/routes/`: Có `PrivateRoute` và `PublicRoute` phân quyền rõ ràng.

---

## 4. Configuration Audit

### Path Aliases
- **Vite**: `@` map tới `./src` (OK)
- **TypeScript**: `@/*` map tới `./src/*` (OK)
- **Khớp lệnh**: ✅ Hai cấu hình hoàn toàn khớp nhau.

### Environment Variables (`.env.example`)
- `VITE_API_URL`: Có sẵn.
- `VITE_APP_NAME`: Có sẵn.
- **Ghi chú**: Đã có cơ chế failover API base chain trong `axiosClient`.

---

## 5. HTTP & Auth Bootstrap Audit

### axiosClient (`src/api/axiosClient.ts`)
- [x] **Request Interceptor**: Tự động gắn Bearer Token từ store.
- [x] **Response Interceptor**: Xử lý 401 (Unauthorized) tự động gọi refresh token.
- [x] **Failover Logic**: Tự động thử lại với backup URL nếu API chính chết.
- [x] **Global UI**: Tích hợp `sonner` để báo lỗi mạng/server.

### Auth & Routing
- [x] **AppProviders**: Wrap `QueryClientProvider` và `AuthBootstrapGate` đúng thứ tự.
- [x] **AuthBootstrapGate**: Chặn render cho đến khi `useAuthBootstrap` hoàn tất (tránh nháy trang).
- [x] **PrivateRoute**: Kiểm tra cả `isAuthenticated` và `role === 'admin'`.

---

## 6. Risks & Gaps

- **[Warning]**: `package.json` có `name: "datn-frontend-user"`. Mặc dù không ảnh hưởng kỹ thuật nhưng nên cập nhật thành `danangtrip-admin` để tránh nhầm lẫn.
- **[Note]**: Dự án đang dùng Tailwind v4 (`@tailwindcss/vite`), cần lưu ý cú pháp mới khi viết CSS trong bước UI.

---

## 7. Next Actions

Dựa trên kết quả Pass, khuyến nghị tiếp tục pipeline:
1. **03-types-api-contract**: Định nghĩa Interface cho Location Detail và Update payload.
2. **04-layout-routing**: Đăng ký route `/admin/locations/:id/edit` và breadcrumb.

---

**Audit by**: Antigravity AI
**Status**: 🟢 **READY**
