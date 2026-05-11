---
name: 10-optimization-deploy
description: Produce final delivery documents for performance, build, smoke testing, and handoff. Use when wrapping up a feature before user approval, push, or deploy.
---

# Skill: 10-optimization-deploy

## Overview

Đây là bước cuối của pipeline. Skill này tạo ra 2 tài liệu quan trọng:

- `deploy report`: ghi nhận build, smoke test, và readiness
- `review report`: bản tổng kết chi tiết để USER duyệt trước khi push

Nếu `09-testing` là bước ghi nhận kiểm thử, thì `10-optimization-deploy` là bước **tổng hợp toàn bộ chất lượng bàn giao**.

## Required Input

- `.agent/rules/PROJECT_RULES.md`
- `persona.md`
- `vite.config.ts`
- `package.json`
- **Test report từ `09-testing`** — bắt buộc, phải là `READY` hoặc `READY WITH RISKS`
- Các artifact đã sinh ở các bước trước
- Route / UI / data / auth artifacts nếu feature có đủ các bước đó
- Branch name hiện tại nếu đang trong flow chuẩn bị push

## Gate Từ Skill 09

**Trước khi bắt đầu skill 10, kiểm tra test report:**

```
Test report verdict là gì?

NOT READY  →  DỪNG NGAY
              Không tạo deploy-report hay review.md
              Thông báo: "Skill 09 chưa pass. Fix các blocking issues trước."

READY WITH RISKS  →  Tiếp tục nhưng phải ghi rõ risks trong deploy-report
                     Reviewer phải acknowledge risks trước khi push

READY  →  Tiếp tục bình thường
```

## Delivery Intent

Skill này có 3 vai trò:

1. Kiểm tra deploy readiness
2. Tạo bản review/walkthrough cho USER hoặc teammate
3. Khóa lại toàn bộ trace của feature từ bước 01 đến bước 10

## Required Commands

```bash
npm run prepush:check
npm run build
npm run preview
```

Tùy ngữ cảnh, có thể ghi thêm kết quả của:

```bash
npm run lint
npm run typecheck
```

## Process

### 0) Artifact Trace Check

Trước khi viết bất kỳ report nào, kiểm tra artifacts đã có:

```
✓ analysis/...__screen-analysis.md        → bước 01
? api-contracts/...__api-contract.md      → bước 03 (nếu có data)
? routing/...__route-plan.md              → bước 04 (nếu có route mới)
? ui-specs/...__ui-spec.md                → bước 05 (nếu có UI mới)
? integration/...__data-integration.md   → bước 06 (nếu có data wiring)
? interaction-specs/...__interaction-spec.md → bước 07 (nếu có interaction)
? auth/...__auth-permissions-review.md   → bước 08 (nếu có auth)
✓ test-cases/...__test-report.md          → bước 09 (bắt buộc)
```

Nếu thiếu artifact bắt buộc → ghi rõ trong review.md phần nào chưa có.

### 1) Build And Readiness Review

Phải ghi rõ:

- lint / typecheck / build / prepush:check pass hay fail
- có warning nào đáng chú ý không
- nếu build pass nhưng còn risk, risk đó là gì

### 2) Performance Review

Không cần tối ưu cực đoan, nhưng phải rà:

- chunk size có bất thường không
- có thể lazy-load modal/heavy block không
- queries có đang waterfall vô lý không
- có full-page spinner hoặc state gây CLS không

### 3) Smoke Test Review

Smoke test nên ghi ít nhất:

- feature page có load không
- action chính có chạy không
- auth redirect có đúng không
- browser console có lỗi không

Nếu không chạy được smoke test, phải ghi lý do rất cụ thể.

### 4) Review / Walkthrough Document

`review.md` không phải changelog.
Nó phải là tài liệu giúp USER hiểu:

- feature này làm gì
- đã thay đổi ở đâu
- đã đi qua pipeline nào
- quyết định kỹ thuật nào đáng chú ý
- trạng thái validation hiện tại là gì

### 5) Handoff Decision

Cuối cùng phải kết luận một trong các trạng thái:

- `Ready for user review`
- `Ready for push after approval`
- `Not ready — [lý do cụ thể]`

---

## Git Handoff — Gợi ý và Chờ Lệnh

Sau khi tạo xong `deploy-report.md` và `review.md`, AI phải:

### Bước 1 — Gợi ý tên nhánh

Convention bắt buộc:

```
<type>/DATN-<STT>/<mô-tả-ngắn>
```

**Cách xác định STT — chạy lệnh này trước:**

```bash
git branch -a | grep -oP 'DATN-\K[0-9]+' | sort -n | tail -1
```

Lấy số lớn nhất tìm được, cộng thêm 1 → đó là STT cho nhánh mới.

**Ví dụ:**
```
Nhánh hiện có: feat/DATN-63/tour-crud, fix/DATN-64/filter-bug
→ STT mới nhất: 64
→ STT cho nhánh mới: 65
→ Tên nhánh gợi ý: feat/DATN-65/create-tour-list
```

**Các type:**
```
feat     → tính năng mới
fix      → bug fix
refactor → refactor không đổi behavior
chore    → config, deps, tooling
docs     → chỉ đổi docs/comments
test     → thêm/sửa tests
```

**Mô tả ngắn:** kebab-case, tối đa 4-5 từ, mô tả đúng việc đang làm.

```
feat/DATN-65/create-tour-list
fix/DATN-66/tour-filter-reset
refactor/DATN-67/tour-mapper-cleanup
```

### Bước 2 — Gợi ý commit message

Theo format Conventional Commits:

```
<type>(<scope>): <short description>

<body — optional, mô tả chi tiết nếu cần>

<footer — optional, refs issue nếu có>
```

**Ví dụ:**
```
feat(tours): add tour list screen with CRUD and filter

- Add TourListPage with DataTable, FilterBar, Pagination
- Add useTourQueries hook (list, detail, create, update, delete)
- Add tour.mapper.ts for Raw → ViewModel conversion
- Add tourSchema.ts with yup validation
- Add i18n keys for vi/en

Closes #42
```

**Các type phổ biến:**
```
feat     → tính năng mới
fix      → bug fix
refactor → refactor không đổi behavior
style    → format, spacing (không đổi logic)
chore    → deps, config, tooling
docs     → chỉ đổi docs/comments
test     → thêm/sửa tests
```

### Bước 3 — Hiển thị lệnh git và CHỜ

Sau khi gợi ý, AI phải hiển thị các lệnh cần chạy và **dừng lại chờ lệnh từ USER**:

```
📋 Sẵn sàng push. Các lệnh cần chạy:

git checkout -b feat/tour-list
git add src/pages/Tours/ src/hooks/useTourQueries.ts src/dataHelper/tour.mapper.ts src/validations/tour.schema.ts src/locales/
git commit -m "feat(tours): add tour list screen with CRUD and filter"
git push -u origin feat/tour-list

⚠️  AI sẽ KHÔNG tự chạy các lệnh này.
✋  Hãy xem xét review.md và deploy-report.md, sau đó gõ "push" hoặc "confirm push" để tiến hành.
```

### Bước 4 — Chỉ push khi USER xác nhận

```
USER gõ "push" hoặc "confirm push"
  → AI chạy: git checkout -b <branch>
  → AI chạy: git add <files>
  → AI chạy: git commit -m "<message>"
  → AI chạy: git push -u origin <branch>

USER không xác nhận
  → AI dừng tại đây
  → Không tự ý push
```

**Tuyệt đối không push nếu:**
- USER chưa xác nhận
- `npm run prepush:check` chưa pass
- Test report là `NOT READY`

## Performance Checklist Cho Admin

### Bundle size — Vite

```bash
# Sau khi build, xem output
npm run build

# Vite output sẽ hiển thị chunk sizes
# Target: initial JS < 300KB gzipped cho admin app
```

### Common issues cần rà

```
❌ Modal/Dialog không lazy-load → tăng initial bundle
❌ recharts import toàn bộ thay vì tree-shake → bundle bloat
❌ Table render 1000 rows không có virtualization → performance issue
❌ Query không có staleTime → refetch mỗi lần focus
❌ Không có skeleton cho table → layout shift khi load
```

### Vite-specific

```bash
# Build production
npm run build

# Preview production build local
npm run preview

# Prepush check (lint + typecheck + build)
npm run prepush:check
```

## Output Documents

Tạo các file:

- `.agent/artifacts/deploy/YYYY-MM-DD__<feature-slug>__deploy-report.md`
- `.agent/artifacts/review/YYYY-MM-DD__<feature-slug>__review.md`

Templates:

- `template_deploy_report.md`
- `template_review.md`

## Strict Rules

- Không gọi deploy-ready nếu lint/typecheck/build chưa pass
- Không dùng từ ngữ mơ hồ như "seems fine" trong report
- Nếu chưa chạy được smoke test, phải ghi rõ vì sao
- `review.md` phải mô tả đúng stack hiện tại (React + Vite, không nhắc Next.js hay Zod)
- **Tuyệt đối không tự ý `git push` — phải chờ USER xác nhận**
- **Phải gợi ý tên nhánh và commit message trước khi hỏi USER**
- Không biến `review.md` thành danh sách file khô khan
- Nếu thiếu artifact ở bước trước, phải ghi rõ đang thiếu bước nào

## Red Flags

Nếu thấy những dấu hiệu sau, phải dừng và flag:

- Gọi "deploy-ready" khi `npm run prepush:check` chưa pass
- `review.md` chỉ là danh sách file thay đổi — không có objective, scope, risks
- Nhắc Zod hoặc Next.js trong review của admin repo → sai stack
- Claim smoke test pass nhưng không có dev server chạy
- Push mà không có USER xác nhận → vi phạm nghiêm trọng
- Commit message không theo Conventional Commits format

## Minimum Detail Standard

### `deploy-report.md` nên có

- build status (lint/typecheck/build/prepush:check)
- performance/bundle notes
- smoke test notes
- deploy readiness verdict

### `review.md` nên có

- objective (feature làm gì)
- scope delivered (thay đổi ở đâu)
- artifact trace (bước nào đã đi qua)
- technical decisions (quyết định kỹ thuật đáng chú ý)
- validation summary
- risks / follow-ups

Nếu feature phức tạp, nên thêm:

- auth impact
- i18n impact
- breaking change / migration notes

## Verification

- Đối chiếu `checklist.md`
- Cả `deploy-report` và `review.md` phải tồn tại trước khi xin USER duyệt push
- Người đọc phải có thể hiểu feature mà không cần mở toàn bộ diff ngay lập tức
