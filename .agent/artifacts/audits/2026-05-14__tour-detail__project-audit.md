# Project Audit: Tour Detail

- **Feature Slug:** `tour-detail`
- **Audit Date:** 2026-05-14
- **Audit Reason:** new sprint | stack drift suspicion | onboarding
- **Status:** ✅ READY

## 1. Summary

Dự án hiện tại đang ở trạng thái tốt, tuân thủ chặt chẽ các quy tắc đã đề ra trong `PROJECT_RULES.md`. Stack công nghệ hiện đại (React 19, Tailwind v4) đã được thiết lập đúng đắn. Cơ chế xác thực (Auth Bootstrap) và HTTP Client (Axios interceptors) hoạt động ổn định, sẵn sàng cho việc triển khai feature `tour-detail`.

## 2. Dependency and Scripts Audit

| Package | Version | Status |
|---|---|---|
| `react` | `^19.2.4` | ✅ Expected |
| `vite` | `^7.3.1` | ✅ Expected |
| `@tanstack/react-query`| `^5.95.2` | ✅ Expected |
| `zustand` | `^5.0.8` | ✅ Expected |
| `tailwindcss` | `^4.2.2` | ✅ Expected |
| `react-router-dom` | `^7.13.2` | ✅ Expected |

**Core Scripts:**
- `npm run dev`: Vite dev server.
- `npm run build`: Build production.
- `npm run typecheck`: Kiểm tra kiểu dữ liệu (Mandatory).
- `npm run lint`: Linting (Mandatory).
- `npm run prepush:check`: Chạy toàn bộ quality gates (Mandatory).

## 3. Repository Shape Audit

- **`src/pages/Tours`**: Đã có cấu trúc phân tách cho `TourList`, `TourCreate`, `TourEdit`. Phù hợp để thêm `TourDetail`.
- **`src/api/`**: Chứa `axiosClient.ts` quản lý request tập trung.
- **`src/hooks/`**: Đã có các hooks query cho Tours.
- **`src/dataHelper/`**: Đã có `tour.mapper.ts`.
- **Drift Audit**: Không phát hiện drift đáng kể. Cấu trúc thư mục tuân thủ pattern đã định.

## 4. Config Audit

- **Aliases**: `@/` được cấu hình đồng bộ trong `vite.config.ts` và `tsconfig.app.json`.
- **Environment**: `.env.example` đầy đủ các biến cần thiết (`VITE_API_URL`, `VITE_PORT`, v.v.).
- **Tailwind**: Đã dùng `@tailwindcss/vite` (v4), tinh gọn config.

## 5. HTTP / Auth / Providers Audit

- **`axiosClient.ts`**:
  - Gắn `Authorization` header tự động.
  - Xử lý 401 (Unauthorized) thông qua `refreshAccessToken` và `handleLogout`.
  - Hỗ trợ Failover API nếu endpoint chính lỗi.
- **`AppProviders.tsx`**:
  - `QueryClientProvider` bọc ngoài cùng.
  - `AuthBootstrapGate` đảm bảo user state được phục hồi trước khi render nội dung.
- **`src/routes/`**:
  - `PrivateRoute` kiểm tra `isAuthenticated` và role `admin`.
  - `AppRoute` sử dụng `createBrowserRouter` (React Router v7 style).

## 6. Risks and Warnings

- **[WARNING]**: `VITE_API_URL` trong `.env.example` đang trỏ tới `api.example.com`. Cần đảm bảo dev local được hướng dẫn thay đổi giá trị này.
- **[NOTE]**: `lucide-react` đang dùng v1.7.0, hãy cẩn thận khi copy code dùng các icons mới nhất.

## 7. Next Actions

1. Proceed to **01-screen-analysis** (Đã hoàn thành trước đó).
2. Proceed to **03-types-api-contract** để định nghĩa schemas cho Tour Detail.
