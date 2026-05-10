# Skill: 10-optimization-deploy (Optimize & Build & Deploy)

## 0) Tuyên bố tự mô tả
Skill này optimize performance, chạy production build, và deploy. Đây là bước cuối của pipeline.

## 1) Goal
- Performance: không có bottlenecks rõ ràng.
- Build: `npm run build` PASS, bundle size hợp lý.
- Deploy: static files sẵn sàng deploy.
- Smoke test: feature hoạt động sau deploy.

## 2) Persona
Đóng vai: **Performance Engineer + DevOps Engineer**.

## 3) Input & Context (must read first)
- `.agent/rules/PROJECT_RULES.md` (Sections 8, 14, 17)
- `vite.config.ts` — build config
- `package.json` — build/preview scripts

## 4) Workflow

### 4.1 Performance Checklist
1. **React.memo**: chỉ dùng cho expensive components (có evidence — profiler/measurement).
2. **Dynamic import**: cho modals, heavy components (charts, rich editors).
3. **staleTime**: hợp lý trong TanStack Query hooks (5–30 phút cho static data).
4. **Parallel queries**: không có artificial sequential waterfalls.
5. **Image optimization**: dùng đúng format, lazy loading.
6. KHÔNG premature optimize — chỉ fix khi có evidence.

### 4.2 Build Commands
```bash
# Dev
npm run dev

# Quality gates (bắt buộc pass trước build)
npm run lint
npm run typecheck

# Production build
npm run build

# Preview build locally
npm run preview

# All-in-one pre-push check
npm run prepush:check
```

### 4.3 Bundle Size Check
7. Vite build output: check chunk sizes.
8. Flag nếu có chunk > 500KB (investigate và code split nếu cần).

### 4.4 Smoke Test sau Deploy
9. Navigate tới feature page → load OK.
10. CRUD flow hoạt động.
11. Filter/Search/Pagination hoạt động.
12. Auth guard: unauthorized → redirect login.
13. Browser console: không có errors.
14. Network tab: không có failed API calls.

## 5) Strict Rules
- KHÔNG deploy khi lint hoặc typecheck fail.
- KHÔNG deploy khi build fail.
- Dynamic import cho modals và heavy components.
- Smoke test phải pass trước khi gọi done.

## 6) Output specification
- `.agent/artifacts/deploy/YYYY-MM-DD__<feature-slug>__deploy-report.md`

Format:
```
| Check | Status | Notes |
|-------|--------|-------|
| lint | PASS | |
| typecheck | PASS | |
| build | PASS | bundle size: ... |
| smoke test | PASS | |
```
