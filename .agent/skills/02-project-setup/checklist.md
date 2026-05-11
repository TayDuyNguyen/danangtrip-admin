# Checklist: 02-project-setup

## Dependency Audit
- [ ] `package.json` đã đọc — version thực tế ghi vào report
- [ ] React 19 + Vite + TypeScript đúng version
- [ ] @tanstack/react-query đúng version
- [ ] zustand đúng version
- [ ] react-hook-form + yup đúng version
- [ ] react-i18next đúng version
- [ ] sonner (notifications) có mặt
- [ ] recharts có mặt (nếu feature dùng chart)

## Scripts Audit
- [ ] `npm run lint` tồn tại và chạy được
- [ ] `npm run typecheck` tồn tại và chạy được
- [ ] `npm run build` tồn tại và chạy được
- [ ] `npm run prepush:check` tồn tại và chạy được
- [ ] `npm run preview` tồn tại và chạy được

## Config Audit
- [ ] `tsconfig.app.json` có `paths: { "@/*": ["./src/*"] }`
- [ ] `vite.config.ts` có `resolve.alias: { "@": "./src" }`
- [ ] Hai alias phải khớp nhau
- [ ] `.env.example` có `VITE_API_BASE_URL`
- [ ] `.env.example` có các env vars cần thiết khác

## Repository Shape Audit
- [ ] `src/api/` tồn tại (axiosClient + feature API modules)
- [ ] `src/components/ui/` tồn tại
- [ ] `src/components/common/` tồn tại
- [ ] `src/hooks/` tồn tại
- [ ] `src/pages/` tồn tại
- [ ] `src/routes/` tồn tại
- [ ] `src/store/` tồn tại
- [ ] `src/types/` tồn tại
- [ ] `src/validations/` tồn tại
- [ ] `src/dataHelper/` tồn tại (mappers)
- [ ] `src/constants/endpoints.ts` tồn tại
- [ ] `src/locales/vi/` và `src/locales/en/` tồn tại

## HTTP / Auth Bootstrap Audit
- [ ] `src/api/axiosClient.ts` có request interceptor gắn Bearer token
- [ ] `src/api/axiosClient.ts` có response interceptor xử lý 401
- [ ] `src/providers/index.tsx` wrap QueryClientProvider đúng
- [ ] `src/store/useUserStore.ts` tồn tại
- [ ] `src/hooks/useAuthBootstrap.ts` tồn tại và được gọi ở root
- [ ] `src/routes/ProtectedRoute.tsx` tồn tại
- [ ] Tất cả admin routes đều wrap ProtectedRoute

## Evidence Style
- Mọi mục phải có status: `PASS` / `FAIL` / `WARNING` / `NOT CHECKED`
- Nếu FAIL: ghi rõ triệu chứng, mức ảnh hưởng, hướng fix nhỏ nhất
- Không báo "ổn" nếu chưa kiểm thực tế file

## Output
- [ ] Audit report tạo đúng path: `.agent/artifacts/audits/YYYY-MM-DD__<slug>__project-audit.md`
- [ ] Report có verdict rõ ràng: `ready / not ready`
