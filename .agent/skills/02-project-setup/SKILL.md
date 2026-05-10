# Skill: 02-project-setup (Kiểm tra & chuẩn bị Project Base)

## 0) Tuyên bố tự mô tả
Skill này kiểm tra project base hiện tại để đảm bảo đủ điều kiện triển khai feature mới.

## 1) Goal
Audit toàn bộ project setup:
- Dependencies đúng version
- Folder structure theo PROJECT_RULES
- Path aliases hoạt động
- axiosClient configured đúng
- Route guards hoạt động
- i18n setup đúng
- Quality gates pass (lint, typecheck, build)

## 2) Persona
Đóng vai: **DevOps Engineer + Senior Software Engineer**.

## 3) Input & Context (must read first)
- `.agent/rules/PROJECT_RULES.md`
- `package.json`
- `tsconfig.app.json`
- `vite.config.ts`
- `src/api/axiosClient.ts`
- `src/providers/index.tsx`
- `src/routes/`

## 4) Workflow

### 4.1 Dependency Audit
1. Check `package.json` — xác nhận versions:
   - React 19, Vite, TypeScript
   - @tanstack/react-query, zustand, react-router-dom v7
   - react-hook-form, yup, @hookform/resolvers
   - react-i18next, i18next-http-backend
   - lucide-react, react-icons, sonner, recharts
2. Flag dependencies cũ hoặc missing.

### 4.2 Folder Structure Audit
3. Verify `src/` structure theo PROJECT_RULES Section 3:
   - `api/`, `components/`, `constants/`, `dataHelper/`, `hooks/`
   - `i18n/`, `layouts/`, `pages/`, `providers/`, `routes/`
   - `store/`, `types/`, `utils/`, `validations/`

### 4.3 Config Audit
4. `vite.config.ts` — alias `@/*` → `src/*`.
5. `tsconfig.app.json` — paths matching vite aliases.
6. `.env.example` — đủ env vars: VITE_API_URL, VITE_API_FALLBACK_URLS, VITE_API_TIMEOUT_MS.

### 4.4 axiosClient Audit
7. Verify fallback URL logic (VITE_API_FALLBACK_URLS).
8. Verify Bearer token interceptor.
9. Verify refresh token logic.
10. Verify error interceptor (sonner toast cho 5xx, 401 redirect).

### 4.5 Quality Gates
11. `npm run lint` → PASS.
12. `npm run typecheck` → PASS.
13. `npm run build` → PASS (hoặc document errors).

## 5) Strict Rules
- KHÔNG thay đổi stack — chỉ verify.
- Nếu phát hiện vấn đề → report rõ ràng, đề xuất fix nhỏ nhất.
- KHÔNG refactor ngoài scope của task.

## 6) Output specification
- Report inline (không cần tạo artifact file trừ khi được yêu cầu).
- List Pass/Fail cho từng mục.
