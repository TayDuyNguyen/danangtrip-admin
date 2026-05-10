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

# 2. **Build Verification**:
   - Run mandatory quality gate: `npm run prepush:check` (covers lint, typecheck, build).
   - Resolve all failures before proceeding.
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
- **Bắt buộc review trước khi push**: Phải sinh ra file `review.md` và trình USER duyệt. TUYỆT ĐỐI KHÔNG TỰ Ý `git push`.
- **Quy tắc tên nhánh (Branch Naming)**: Phải dùng format `<viết tắt chức năng>/DATN-<số thứ tự>/<nội dung ngắn gọn>` (ví dụ: `feat/DATN-54/api-align-location`).

## 6) Output specification
- Deploy Report: `.agent/artifacts/deploy/YYYY-MM-DD__<feature-slug>__deploy-report.md` (Phải bao gồm: Tên nhánh, Commit message, và bảng trạng thái các Quality Gates).
- **Feature Review/Walkthrough**: `.agent/artifacts/review/YYYY-MM-DD__<feature-slug>__review.md` (Bản tổng kết cực kỳ chi tiết toàn bộ quá trình thực hiện từ Bước 1 đến Bước 10:
  1. Phân tích yêu cầu/SRS.
  2. Thiết kế cấu trúc dữ liệu/Zod Schema.
  3. Xây dựng Service & Mock API (nếu có).
  4. Xây dựng Hooks & State logic.
  5. Phát triển UI Components & Layout.
  6. Tích hợp i18n (đa ngôn ngữ).
  7. Viết Unit Tests & Integration Tests.
  8. Kiểm thử E2E bằng Browser Subagent.
  9. Tối ưu Performance, SEO & Accessibility.
  10. Fix bugs phát sinh & Build Verification).
  Mỗi bước phải mô tả rõ các file đã thay đổi và lý do thực hiện.

Format:
```
| Check | Status | Notes |
|-------|--------|-------|
| lint | PASS | |
| typecheck | PASS | |
| build | PASS | bundle size: ... |
| smoke test | PASS | |
```
