# Skill: 09-testing (Quality Gates — Lint, Typecheck, Build, Playwright)

## 0) Tuyên bố tự mô tả
Skill này chạy quality gates bắt buộc trước khi deliver feature. Không có Vitest/Jest setup — focus vào native repo checks.

## 1) Goal
- Pass tất cả quality gates: lint, typecheck, build.
- Không có console errors khi chạy feature.
- i18n vi/en đồng bộ.
- Playwright smoke test (nếu dev server đang chạy).

## 2) Persona
Đóng vai: **QA/QC Engineer**.

## 3) Input & Context (must read first)
- `.agent/rules/PROJECT_RULES.md` (Sections 8, 9)
- `package.json` — test scripts

## 4) Quality Gates (thứ tự bắt buộc)

```bash
# 1. Lint
npm run lint

# 2. TypeScript check
npm run typecheck

# 3. Build
npm run build

# 4. All-in-one (recommended trước push)
npm run prepush:check

# 5. Playwright (chỉ khi dev server đang chạy trên 127.0.0.1:5173)
npm run test:console
```

## 5) Checklist thủ công

- [ ] `npm run lint` — PASS (0 errors, 0 warnings)
- [ ] `npm run typecheck` — PASS (0 type errors)
- [ ] `npm run build` — PASS (bundle generated)
- [ ] Browser console: không có `console.error` khi dùng feature
- [ ] i18n vi/en: tất cả keys đồng bộ, không missing translation
- [ ] Không có hardcoded text ngoài i18n
- [ ] Không có `any` type mới được introduce
- [ ] API calls return đúng data structure
- [ ] Empty states hiển thị đúng khi API trả về []
- [ ] Error states hiển thị đúng khi API lỗi

## 6) AI Browser UI Testing (Manual E2E)
- Cần chạy dev server trước (vd: `npm run dev` trên `127.0.0.1:5173`).
- Khác với chạy command test tự động, AI PHẢI yêu cầu hoặc sử dụng URL được cấp (vd: `http://127.0.0.1:5173/feature`) để trực tiếp mở trình duyệt (Browser Subagent) và test giao diện.
- Mục đích: Test mọi kịch bản có thể xảy ra trên giao diện thật (thao tác CRUD, nhập liệu form, click các nút, filter/search, pagination, hiển thị thông báo lỗi/thành công).
- Báo cáo lỗi (nếu có) kèm hướng khắc phục.

## 7) i18n Check (nếu đã thêm keys mới)
```bash
python .agent/skills/i18n-localization/scripts/i18n_checker.py .
```
(Nếu script không tồn tại → kiểm tra thủ công bằng cách so sánh vi/en files)

## 8) Output specification
- `.agent/artifacts/test-cases/YYYY-MM-DD__<feature-slug>__test-report.md`

Format report:
```
| Gate | Status | Notes |
|------|--------|-------|
| lint | PASS | 0 errors |
| typecheck | PASS | 0 errors |
| build | PASS | ... |
| i18n sync | PASS | ... |
| browser console | PASS | no errors |
```
