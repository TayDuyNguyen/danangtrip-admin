# Project Audit: location-categories

- **Date**: 2026-05-12
- **Feature Slug**: `location-categories`
- **Audit Verdict**: ⚠️ **WARNING** (Action Required)

---

## 1. Summary

Dự án hiện tại có nền tảng vững chắc, tuân thủ đúng Tech Stack (React 19, Vite 7, Tailwind 4). Tuy nhiên, có một lỗ hổng quan trọng trong cấu hình Routing cần được khắc phục trước khi bắt đầu triển khai code UI cho tính năng `location-categories`.

---

## 2. Dependency Audit

| Package | Expected | Actual | Status |
|---|---|---|---|
| **React** | 19.x | 19.2.4 | ✅ Pass |
| **Vite** | 7.x | 7.3.1 | ✅ Pass |
| **TypeScript** | 5.x | 5.9.3 | ✅ Pass |
| **react-router-dom** | 7.x | 7.13.2 | ✅ Pass |
| **@tanstack/react-query**| 5.x | 5.95.2 | ✅ Pass |
| **tailwindcss** | 4.x | 4.2.2 | ✅ Pass |
| **zustand** | 5.x | 5.0.8 | ✅ Pass |

---

## 3. Configuration Audit

- **Alias `@`**: 
    - `tsconfig.app.json`: `{"@/*": ["./src/*"]}` ✅
    - `vite.config.ts`: `alias: { '@': path.resolve(__dirname, './src') }` ✅
- **Environment**: 
    - `.env.example` chứa đầy đủ `VITE_API_URL`, `VITE_PORT`. ✅
- **Scripts**: 
    - `npm run dev`, `npm run build`, `npm run typecheck` hoạt động bình thường. ✅
    - `npm run prepush:check` tồn tại như một chốt chặn chất lượng. ✅

---

## 4. HTTP & Auth Audit

- **axiosClient.ts**: 
    - Cấu hình robust với `request` và `response` interceptors. ✅
    - Xử lý auto-refresh token và logout khi 401. ✅
    - Cơ chế failover cho API base URL rất tốt. ✅
- **Auth Bootstrap**:
    - `AuthBootstrapGate` được gọi trong `AppProviders` đảm bảo user state sẵn sàng trước khi render. ✅

---

## 5. Routing & Permission Audit

- **Private Guard**: `PrivateRoute.tsx` kiểm tra cả `isAuthenticated` và `role: admin`. ✅
- **Router Configuration**:
    - **MAJOR GAP**: Hằng số `LOCATIONS_CATEGORIES` đã có trong `src/routes/routes.ts` nhưng **CHƯA** được khai báo trong mảng `children` của `router` tại `src/routes/index.tsx`.
    - Điều này sẽ khiến trang `/admin/locations/categories` bị trả về `PageNotFound` (404) dù code đã sẵn sàng.

---

## 6. Risks and Gaps

| Risk/Gap | Impact | Recommendation |
|---|---|---|
| **Missing Route** | Không thể truy cập trang Danh mục Địa điểm. | Thêm `LOCATIONS_CATEGORIES` vào `src/routes/index.tsx`. |
| **i18n Missing** | Thiếu keys cho màn hình Category Management. | Tạo file `categories.json` hoặc bổ sung vào `location.json`. |
| **API Sync** | API Subcategories tách biệt với Categories. | Cần xác định rõ UI sẽ handle lồng nhau hay tách tab. |

---

## 7. Next Actions (Priority Order)

1.  **Fix Routing**: Cập nhật `src/routes/index.tsx` để hỗ trợ route `LOCATIONS_CATEGORIES`.
2.  **Scaffold Page**: Tạo thư mục `src/pages/Locations/LocationCategories/`.
3.  **i18n Setup**: Thêm namespace `categories` vào cấu hình i18next hoặc bổ sung keys vào `location.json`.
4.  **Verify Access**: Chạy `npm run dev` và truy cập thử route mới để đảm bảo layout và guard hoạt động.
