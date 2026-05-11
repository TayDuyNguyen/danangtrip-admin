---
name: 09-testing
description: Execute structured testing phases like a professional QA tester — from static gates to UI visual, functional flows, edge cases, and regression. Use before handoff.
---

# Skill: 09-testing

## Overview

Skill này thực hiện kiểm thử có cấu trúc theo **5 phase** như một tester chuyên nghiệp.

**QUAN TRỌNG — Gate cứng giữa các phase:**

```
Phase 1 PHẢI PASS 100% → mới được chạy Phase 2
Phase 2 không có blocking issue → mới được chạy Phase 3
Phase 3 PHẢI PASS happy path → mới được chạy Phase 4
Phase 4 + Phase 5 → tổng hợp verdict cuối
```

**Nếu Phase 1 có bất kỳ FAIL nào → DỪNG NGAY. Không chạy Phase 2-5. Báo cáo lỗi và yêu cầu fix trước.**

```
Phase 1: Static Gates      → lint / typecheck / build  [BLOCKING]
Phase 2: UI Visual         → layout, responsive, states [BLOCKING nếu crash]
Phase 3: Functional Flows  → happy path, CRUD, form, filter [BLOCKING]
Phase 4: Edge Cases        → empty, error, boundary, network failure
Phase 5: Regression        → i18n, auth, existing features
```

## Required Input

- `.agent/rules/PROJECT_RULES.md`
- `package.json`
- Scope code của feature đang thay đổi
- Analysis file từ `01-screen-analysis`
- Interaction spec từ `07-interactions`
- Auth review từ `08-auth-permissions` nếu có
- **Dev server URL** — bắt buộc để chạy Phase 2-5

## Dev Server URL

Truyền URL vào khi kích hoạt skill:

```
Dev server URL: http://localhost:5173
Feature URL:    http://localhost:5173/tours
```

Nếu không có URL → Phase 2-5 ghi `NOT RUN` với lý do cụ thể.

---

## GATE LOGIC — Bắt buộc tuân thủ

```
┌─────────────────────────────────────────────────────┐
│  Phase 1: Static Gates                              │
│  npm run lint + typecheck + build + prepush:check   │
└──────────────┬──────────────────────────────────────┘
               │
        Có FAIL nào không?
               │
        YES ───┼──→ DỪNG. Báo lỗi cụ thể.
               │    Yêu cầu fix trước khi tiếp tục.
               │    Verdict: NOT READY — blocked by Phase 1
               │
        NO  ───┼──→ Tiếp tục Phase 2
               │
┌──────────────▼──────────────────────────────────────┐
│  Phase 2: UI Visual                                 │
│  Layout, responsive, skeleton, empty, design tokens │
└──────────────┬──────────────────────────────────────┘
               │
        App có crash / blank screen không?
               │
        YES ───┼──→ DỪNG. Báo lỗi cụ thể.
               │    Verdict: NOT READY — blocked by Phase 2
               │
        NO  ───┼──→ Ghi nhận issues (non-blocking), tiếp tục Phase 3
               │
┌──────────────▼──────────────────────────────────────┐
│  Phase 3: Functional Flows                          │
│  Happy path CRUD, search, filter, pagination, form  │
└──────────────┬──────────────────────────────────────┘
               │
        Happy path có FAIL không?
               │
        YES ───┼──→ DỪNG. Báo flow nào fail.
               │    Verdict: NOT READY — blocked by Phase 3
               │
        NO  ───┼──→ Tiếp tục Phase 4 + 5
               │
┌──────────────▼──────────────────────────────────────┐
│  Phase 4: Edge Cases + Phase 5: Regression          │
│  Boundary, network errors, i18n, auth               │
└──────────────┬──────────────────────────────────────┘
               │
        Tổng hợp tất cả issues
               │
        ┌──────▼──────┐
        │   VERDICT   │
        │ ready /     │
        │ not ready   │
        └─────────────┘
```

---

## Phase 1 — Static Quality Gates [BLOCKING]

Chạy tuần tự. **Dừng ngay nếu có FAIL — không chạy Phase tiếp theo.**

```bash
npm run lint
npm run typecheck
npm run build
npm run prepush:check
```

**Ghi kết quả:**
```
PASS  - lint: 0 errors, 0 warnings
PASS  - typecheck: no errors
PASS  - build: completed in 12.3s
PASS  - prepush:check: all gates passed
```

**Nếu FAIL:**
```
FAIL  - typecheck: 3 errors tại src/pages/Tours/TourForm.tsx:45
        → Type 'string' is not assignable to type 'number'
        → BLOCKING: không thể tiếp tục Phase 2-5
        → Yêu cầu fix trước khi chạy lại skill 09
```

---

## Phase 2 — UI Visual Testing [BLOCKING nếu crash]

Mở URL feature trong browser. **Nếu app crash hoặc blank screen → dừng ngay.**

### 2.1) Layout & Responsive

| Check | Desktop (1440px) | Tablet (768px) | Mobile (375px) |
|---|---|---|---|
| Layout không bị vỡ | | | |
| Text không bị overflow | | | |
| Button/input đủ touch target | | | |
| Sidebar/menu collapse đúng | | | |

### 2.2) Loading States

Reload trang, quan sát:

- Skeleton hiển thị đúng vị trí (không phải spinner toàn trang)
- Skeleton đúng số lượng rows/cards như design
- Không có layout shift khi data load xong

### 2.3) Empty States

Xóa hết data hoặc dùng filter không có kết quả:

- Empty state component hiển thị (không phải blank)
- Message rõ ràng, có CTA nếu cần
- Không có lỗi console khi empty

### 2.4) Design Token Compliance

Đối chiếu với `DESIGN.md`:

- Màu sắc đúng token
- Typography đúng font/size/weight
- Spacing nhất quán
- Border radius đúng

**Blocking issues Phase 2:** App crash, blank screen, console.error khi load.
**Non-blocking issues Phase 2:** Minor visual misalignment — ghi nhận, tiếp tục.

---

## Phase 3 — Functional Flow Testing [BLOCKING]

**Nếu happy path của bất kỳ flow nào FAIL → dừng, báo cáo, yêu cầu fix.**

### 3.1) Happy Path — CRUD

**Create:**
```
1. Click nút "Thêm mới"
2. Form modal mở
3. Điền đầy đủ thông tin hợp lệ
4. Submit
✓ Modal đóng
✓ Toast success hiển thị
✓ Bản ghi mới xuất hiện trong list
✓ Không có console.error
```

**Update:**
```
1. Click nút Edit trên một bản ghi
2. Form modal mở với data đã điền sẵn
3. Thay đổi một field
4. Submit
✓ Modal đóng
✓ Toast success hiển thị
✓ Bản ghi trong list cập nhật đúng
```

**Delete:**
```
1. Click nút Delete
✓ Confirm dialog xuất hiện (KHÔNG window.confirm)
2. Click "Xác nhận"
✓ Toast success hiển thị
✓ Bản ghi biến mất khỏi list
✓ Pagination cập nhật đúng
```

### 3.2) Search & Filter

```
1. Nhập từ khóa vào search box
✓ Không gửi request ngay — chờ debounce (400ms)
✓ List cập nhật đúng kết quả
✓ URL params cập nhật (search=...)
2. Xóa từ khóa
✓ List trở về trạng thái ban đầu
✓ URL params được clear

Filter:
1. Chọn filter (category, status)
✓ List lọc đúng
✓ URL params cập nhật
2. Refresh trang
✓ Filter vẫn giữ nguyên (URL-synced)
3. Click "Reset filter"
✓ Tất cả filter clear, list về default
```

### 3.3) Pagination

```
1. Chuyển sang trang 2
✓ URL params: page=2
✓ Data đúng trang 2
2. Refresh trang
✓ Vẫn ở trang 2 (URL-synced)
```

### 3.4) Form Validation

```
Submit form rỗng:
✓ Tất cả required fields hiển thị error message
✓ Error message đúng ngôn ngữ hiện tại
✓ Form không submit

Nhập sai format:
✓ Field-level error hiển thị ngay sau blur
✓ Message cụ thể

Nhập đúng sau khi sai:
✓ Error message biến mất
✓ Submit được
```

### 3.5) Export (nếu có)

```
1. Click nút Export
✓ Button disabled + spinner khi đang xử lý
✓ File download tự động
✓ File có đúng format (xlsx/csv)
```

---

## Phase 4 — Edge Case Testing

### 4.1) Boundary Values

```
- Tên có 1 ký tự → phải fail validation
- Tên có đúng max length → phải pass
- Tên có max+1 ký tự → phải fail
- Số âm cho price → phải fail
```

### 4.2) Network & Error States

Dùng DevTools → Network → Block request:

```
Simulate API timeout:
✓ Loading skeleton không bị stuck vô hạn
✓ Error state hiển thị sau timeout
✓ Retry button hoạt động

Simulate 500 error:
✓ Toast error hiển thị
✓ Message không expose raw server error
✓ App không crash
```

### 4.3) Concurrent Actions

```
- Double-click submit button nhanh
  ✓ Chỉ gửi 1 request (button disabled sau click đầu)

- Search trong khi đang load
  ✓ Request cũ bị cancel, chỉ dùng request mới nhất
```

---

## Phase 5 — Regression Testing

### 5.1) i18n Regression

```
Switch sang tiếng Anh:
✓ Tất cả text chuyển sang English
✓ Không có key bị thiếu (không hiển thị dạng "tour.pageTitle")
✓ Validation messages đúng ngôn ngữ
✓ Toast messages đúng ngôn ngữ

Switch lại tiếng Việt:
✓ Tất cả text trở về tiếng Việt
```

### 5.2) Auth & Permission Regression

```
Đăng xuất, truy cập URL trực tiếp:
✓ Redirect về /login
✓ Sau login, redirect về URL ban đầu

Login với role staff (nếu có):
✓ Các action bị restrict không hiển thị

Token hết hạn (xóa token):
✓ Redirect về login
✓ Không có infinite redirect loop
```

### 5.3) Existing Feature Regression

```
- Dashboard vẫn load đúng
- Màn hình khác cùng module vẫn hoạt động
- Không có console.error mới ở các trang khác
```

---

## Unit Test Automation

Chạy song song với browser testing:

```bash
npm run prepush:check
```

### Mapper test pattern

```ts
describe('mapTour', () => {
  it('converts snake_case to camelCase', () => { ... });
  it('converts is_active 0|1 to boolean', () => { ... });
  it('handles null price safely', () => { ... });
});
```

### Schema test pattern

```ts
describe('tourSchema', () => {
  it('validates valid input', async () => { ... });
  it('rejects empty name', async () => { ... });
  it('rejects negative price', async () => { ... });
});
```

---

## Verdict Logic

```
Phase 1 có FAIL          → NOT READY (blocked)
Phase 2 có crash/blank   → NOT READY (blocked)
Phase 3 có happy path FAIL → NOT READY (blocked)
Phase 4-5 có issues      → NOT READY hoặc READY WITH RISKS
Tất cả pass              → READY
```

**READY WITH RISKS** — dùng khi:
- Phase 4-5 có issues nhỏ không block core flow
- Phải liệt kê rõ risks và reviewer phải acknowledge trước khi push

---

## Output Document

Tạo file:

- `.agent/artifacts/test-cases/YYYY-MM-DD__<feature-slug>__test-report.md`

Template:

- `template_test_report.md`

### Cấu trúc report

```
1. Summary & Verdict (ready / not ready / ready with risks)
2. Phase 1 — Static Gates [BLOCKING]
3. Phase 2 — UI Visual [BLOCKING nếu crash]
4. Phase 3 — Functional Flows [BLOCKING]
5. Phase 4 — Edge Cases
6. Phase 5 — Regression
7. Unit Test Status
8. Residual Risks
```

---

## Strict Rules

- **Phase 1 FAIL → DỪNG NGAY. Không chạy Phase 2-5.**
- **Phase 2 crash/blank → DỪNG NGAY. Không chạy Phase 3-5.**
- **Phase 3 happy path FAIL → DỪNG NGAY. Không chạy Phase 4-5.**
- Không gọi done nếu Phase 1 chưa pass
- Mọi check phải có status: `PASS` / `FAIL` / `NOT RUN` / `N/A`
- Không ghi "đã test ổn" — phải có evidence cụ thể
- Nếu FAIL: ghi file/dòng lỗi, severity, có block release không
- Nếu NOT RUN: ghi lý do và residual risk

## Red Flags

- Phase 2 bị bỏ qua hoàn toàn → UI có thể vỡ layout mà không ai biết
- Phase 4 không có network error test → không biết app xử lý lỗi thế nào
- Phase 5 không có i18n check → language switch có thể broken
- Report chỉ có Phase 1 → không đủ để bàn giao
- Verdict "READY" khi Phase 3 chưa pass → sai hoàn toàn

## Verification

- Đối chiếu `checklist.md`
- Report phải cover đủ 5 phase
- Verdict phải có lý do cụ thể
- Nếu dừng sớm vì blocking issue, phải ghi rõ phase nào block và lỗi gì


## Required Input

- `.agent/rules/PROJECT_RULES.md`
- `package.json`
- Scope code của feature đang thay đổi
- Analysis file từ `01-screen-analysis`
- Interaction spec từ `07-interactions`
- Auth review từ `08-auth-permissions` nếu có
- **Dev server URL** — bắt buộc để chạy Phase 2-5

## Dev Server URL

Truyền URL vào khi kích hoạt skill:

```
Dev server URL: http://localhost:5173
Feature URL:    http://localhost:5173/tours
```

Nếu không có URL → Phase 2-5 ghi `NOT RUN` với lý do cụ thể.

---

## Phase 1 — Static Quality Gates

Chạy tuần tự, dừng ngay nếu có FAIL:

```bash
npm run lint
npm run typecheck
npm run build
npm run prepush:check
```

**Ghi kết quả:**
```
PASS  - lint: 0 errors, 0 warnings
PASS  - typecheck: no errors
PASS  - build: completed in 12.3s
PASS  - prepush:check: all gates passed
```

Nếu FAIL → ghi rõ file lỗi, dòng lỗi, loại lỗi, có block release không.

---

## Phase 2 — UI Visual Testing

Mở URL feature trong browser, kiểm tra từng mục:

### 2.1) Layout & Responsive

| Check | Desktop (1440px) | Tablet (768px) | Mobile (375px) |
|---|---|---|---|
| Layout không bị vỡ | | | |
| Text không bị overflow | | | |
| Button/input đủ touch target | | | |
| Sidebar/menu collapse đúng | | | |

### 2.2) Loading States

Reload trang, quan sát:

- Skeleton hiển thị đúng vị trí (không phải spinner toàn trang)
- Skeleton đúng số lượng rows/cards như design
- Không có layout shift khi data load xong

### 2.3) Empty States

Xóa hết data hoặc dùng filter không có kết quả:

- Empty state component hiển thị (không phải blank)
- Message rõ ràng, có CTA nếu cần
- Không có lỗi console khi empty

### 2.4) Design Token Compliance

Đối chiếu với `DESIGN.md`:

- Màu sắc đúng token (không có màu hardcode lạ)
- Typography đúng font/size/weight
- Spacing nhất quán
- Border radius đúng

---

## Phase 3 — Functional Flow Testing

Test từng flow theo interaction spec từ `07-interactions`.

### 3.1) Happy Path — CRUD

**Create:**
```
1. Click nút "Thêm mới"
2. Form modal mở
3. Điền đầy đủ thông tin hợp lệ
4. Submit
5. ✓ Modal đóng
6. ✓ Toast success hiển thị
7. ✓ Bản ghi mới xuất hiện trong list
8. ✓ Không có console.error
```

**Update:**
```
1. Click nút Edit trên một bản ghi
2. Form modal mở với data đã điền sẵn
3. Thay đổi một field
4. Submit
5. ✓ Modal đóng
6. ✓ Toast success hiển thị
7. ✓ Bản ghi trong list cập nhật đúng
```

**Delete:**
```
1. Click nút Delete
2. ✓ Confirm dialog xuất hiện (KHÔNG window.confirm)
3. Click "Xác nhận"
4. ✓ Toast success hiển thị
5. ✓ Bản ghi biến mất khỏi list
6. ✓ Pagination cập nhật đúng
```

### 3.2) Search & Filter

```
1. Nhập từ khóa vào search box
2. ✓ Không gửi request ngay — chờ debounce (400ms)
3. ✓ List cập nhật đúng kết quả
4. ✓ URL params cập nhật (search=...)
5. Xóa từ khóa
6. ✓ List trở về trạng thái ban đầu
7. ✓ URL params được clear
```

**Filter:**
```
1. Chọn filter (category, status, v.v.)
2. ✓ List lọc đúng
3. ✓ URL params cập nhật
4. Refresh trang
5. ✓ Filter vẫn giữ nguyên (URL-synced)
6. Click "Reset filter"
7. ✓ Tất cả filter clear, list về default
```

### 3.3) Pagination

```
1. Chuyển sang trang 2
2. ✓ URL params: page=2
3. ✓ Data đúng trang 2
4. Refresh trang
5. ✓ Vẫn ở trang 2 (URL-synced)
6. Chuyển về trang 1
7. ✓ URL params: page=1 hoặc không có page param
```

### 3.4) Form Validation

```
Submit form rỗng:
✓ Tất cả required fields hiển thị error message
✓ Error message đúng ngôn ngữ hiện tại
✓ Form không submit

Nhập sai format (email, số điện thoại):
✓ Field-level error hiển thị ngay sau blur
✓ Message cụ thể (không phải "Invalid")

Nhập đúng sau khi sai:
✓ Error message biến mất
✓ Submit được
```

### 3.5) Export (nếu có)

```
1. Click nút Export
2. ✓ Button disabled + spinner khi đang xử lý
3. ✓ File download tự động
4. ✓ File có đúng format (xlsx/csv)
5. ✓ Dữ liệu trong file khớp với filter hiện tại
```

---

## Phase 4 — Edge Case Testing

### 4.1) Boundary Values

```
- Tên có 1 ký tự → phải fail validation
- Tên có đúng max length → phải pass
- Tên có max+1 ký tự → phải fail
- Số âm cho price → phải fail
- Số 0 cho price → pass hay fail? (theo business rule)
```

### 4.2) Network & Error States

Dùng DevTools → Network → Throttle hoặc block request:

```
Simulate API timeout:
✓ Loading skeleton không bị stuck vô hạn
✓ Error state hiển thị sau timeout
✓ Retry button hoạt động

Simulate 500 error:
✓ Toast error hiển thị (không phải blank screen)
✓ Message không expose raw server error
✓ App không crash

Simulate 404:
✓ Empty state hoặc redirect đúng
```

### 4.3) Concurrent Actions

```
- Double-click submit button nhanh
  ✓ Chỉ gửi 1 request (button disabled sau click đầu)

- Delete rồi ngay lập tức delete bản ghi khác
  ✓ Cả 2 hoạt động đúng, không conflict

- Search trong khi đang load
  ✓ Request cũ bị cancel, chỉ dùng request mới nhất
```

### 4.4) Large Dataset

```
- List có 100+ bản ghi
  ✓ Pagination hoạt động đúng
  ✓ Không có performance issue rõ ràng
  ✓ Scroll mượt
```

---

## Phase 5 — Regression Testing

### 5.1) i18n Regression

```
Switch sang tiếng Anh:
✓ Tất cả text chuyển sang English
✓ Không có key bị thiếu (hiển thị dạng "tour.pageTitle")
✓ Validation messages đúng ngôn ngữ
✓ Toast messages đúng ngôn ngữ
✓ Date/number format đúng locale

Switch lại tiếng Việt:
✓ Tất cả text trở về tiếng Việt
```

### 5.2) Auth & Permission Regression

```
Đăng xuất, truy cập URL trực tiếp:
✓ Redirect về /login
✓ Sau login, redirect về URL ban đầu

Login với role staff (nếu có):
✓ Các action bị restrict (delete, export) không hiển thị
✓ Không thể bypass bằng cách gọi API trực tiếp (frontend check)

Token hết hạn (simulate bằng cách xóa token):
✓ Redirect về login
✓ Không có infinite redirect loop
```

### 5.3) Existing Feature Regression

Kiểm tra các màn hình liên quan không bị ảnh hưởng:

```
- Dashboard vẫn load đúng
- Màn hình khác cùng module vẫn hoạt động
- Navigation/sidebar vẫn đúng
- Không có console.error mới ở các trang khác
```

---

## Unit Test Automation

Chạy song song với browser testing:

```bash
npm run prepush:check
```

### Mapper test pattern

```ts
describe('mapTour', () => {
  it('converts snake_case to camelCase', () => { ... });
  it('converts is_active 0|1 to boolean', () => { ... });
  it('handles null price safely', () => { ... });
});
```

### Schema test pattern

```ts
describe('tourSchema', () => {
  it('validates valid input', async () => { ... });
  it('rejects empty name', async () => { ... });
  it('rejects negative price', async () => { ... });
});
```

---

## Output Document

Tạo file:

- `.agent/artifacts/test-cases/YYYY-MM-DD__<feature-slug>__test-report.md`

Template:

- `template_test_report.md`

### Cấu trúc report

```
1. Summary & Verdict (ready / not ready)
2. Phase 1 — Static Gates
3. Phase 2 — UI Visual
4. Phase 3 — Functional Flows
5. Phase 4 — Edge Cases
6. Phase 5 — Regression
7. Unit Test Status
8. Residual Risks
```

---

## Strict Rules

- Không gọi done nếu Phase 1 chưa pass
- Không bỏ qua Phase 2 nếu có URL — UI visual là phase đầu tiên sau static gates
- Mọi check phải có status: `PASS` / `FAIL` / `NOT RUN` / `N/A`
- Không ghi "đã test ổn" — phải có evidence cụ thể
- Nếu FAIL: ghi file/dòng lỗi, severity, có block release không
- Nếu NOT RUN: ghi lý do và residual risk

## Red Flags

- Phase 2 bị bỏ qua hoàn toàn → UI có thể vỡ layout mà không ai biết
- Phase 4 không có network error test → không biết app xử lý lỗi thế nào
- Phase 5 không có i18n check → language switch có thể broken
- Report chỉ có Phase 1 → không đủ để bàn giao

## Verification

- Đối chiếu `checklist.md`
- Report phải cover đủ 5 phase
- Verdict `ready / not ready` phải có lý do cụ thể
- Residual risks phải liệt kê rõ phần nào chưa test và tại sao
