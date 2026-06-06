# Project Audit: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Date Audited:** `2026-05-28`
- **Verdict:** READY (No major blockers found)

## 1. Stack Verification

| Tech | Expected | Actual | Status |
| --- | --- | --- | --- |
| Framework | React 19 + Vite | React 19.2.4 + Vite 7.3.1 | PASS |
| Routing | react-router-dom v7 | react-router-dom 7.13.2 | PASS |
| Server state | TanStack Query v5 | @tanstack/react-query 5.95.2 | PASS |
| Client state | Zustand v5 | zustand 5.0.8 | PASS |
| HTTP | axios | axios 1.14.0 | PASS |
| Styling | Tailwind CSS v4 | tailwindcss 4.2.2 | PASS |
| Forms | react-hook-form + yup | react-hook-form 7.72.0 + yup 1.7.1 | PASS |
| i18n | react-i18next | react-i18next 17.0.2 + i18next 26.0.3 | PASS |
| Notifications | sonner | sonner 2.0.7 | PASS |

## 2. Core Commands Audit

- `npm run lint`: Hỗ trợ đầy đủ qua `eslint .`.
- `npm run typecheck`: Sử dụng `tsc -b`.
- `npm run prepush:check`: Sử dụng node script `node scripts/prepush-check.mjs` chạy cả lint, typecheck, build và E2E playwright tests (nếu có dev server).
- `npm run test:console`: Chạy Playwright test suite `tests/console-errors.spec.ts`.

Các lệnh này sẵn sàng chạy kiểm tra build chất lượng.

## 3. Configuration Audit

- **Vite Path Aliases:**
  - `tsconfig.app.json` và `vite.config.ts` đều cấu hình alias `@/*` khớp với thư mục `src/`.
- **Environment Variables:**
  - `.env.example` chứa `VITE_API_URL` là endpoint API chính.
  - Dự án có chứa `VITE_API_URL` được sử dụng trong `axiosClient` để tạo `baseURL`.

## 4. HTTP & Auth Bootstrap Audit

- **axiosClient (`src/api/axiosClient.ts`):**
  - Đã có interceptor gắn token JWT vào Header Authorization.
  - Tự động bắt lỗi 401 để xóa storage và điều hướng ra màn hình đăng nhập nếu token hết hạn.
- **Providers & Routing:**
  - `src/providers/index.tsx` bọc đầy đủ QueryClientProvider và router setup.
  - Route guard `PrivateRoute` bảo vệ các route quản trị `/admin/*`.
  - Có cơ chế reload giữ phiên (Zustand store + localStorage).

## 5. Potential Gaps & Risks

- **Không có blocker lớn:** Cấu trúc dự án hoàn toàn sạch và tuân thủ chặt chẽ `PROJECT_RULES.md`.
- **Warning:** Cần chắc chắn rằng khi phát triển thêm các trường thông tin trong form, chúng ta không gọi sai các API trường `status` và `image` mà DB không lưu trữ. Mọi thuộc tính của danh mục blog phải khớp với Laravel Request Validator.

## 6. Next Actions

- Bước tiếp theo: Tiến hành triển khai Step 03 (Types & API Contract) để mở rộng các phương thức API và kiểu dữ liệu.
