# Test Report: <Feature Name>

> Feature slug: `<feature-slug>`
> Date: YYYY-MM-DD
> Dev server URL: `<http://localhost:5173/tours | NOT AVAILABLE>`
> Scope: `<src/pages/Tours/, src/hooks/useTourQueries.ts, ...>`

---

## Summary

- **Verdict:** `Ready / Not Ready`
- **Lý do chính:**
- **Phases completed:** Phase 1 / Phase 1-2 / Phase 1-3 / Phase 1-4 / Phase 1-5
- **Blocking issues:**

---

## Phase 1 — Static Quality Gates

| Gate | Status | Notes |
|---|---|---|
| `npm run lint` | | |
| `npm run typecheck` | | |
| `npm run build` | | |
| `npm run prepush:check` | | |

---

## Phase 2 — UI Visual

> Dev server: `<URL>`

### Layout & Responsive

| Check | Desktop | Tablet | Mobile | Notes |
|---|---|---|---|---|
| Layout không vỡ | | | | |
| Text không overflow | | | | |
| Skeleton đúng vị trí | | | | |
| Empty state đúng | | | | |

### Design Token Compliance

| Token | Expected (DESIGN.md) | Actual | Status |
|---|---|---|---|
| Primary color | | | |
| Background | | | |
| Typography | | | |

### Console Check

| Check | Status | Notes |
|---|---|---|
| Không có `console.error` khi load | | |
| Không có network request fail | | |

---

## Phase 3 — Functional Flows

### Create Flow

| Step | Status | Notes |
|---|---|---|
| Form modal mở | | |
| Validation hiển thị đúng | | |
| Submit thành công | | |
| Toast success hiển thị | | |
| Bản ghi xuất hiện trong list | | |

### Update Flow

| Step | Status | Notes |
|---|---|---|
| Form mở với data đã điền | | |
| Submit thành công | | |
| Bản ghi cập nhật đúng | | |

### Delete Flow

| Step | Status | Notes |
|---|---|---|
| Confirm dialog xuất hiện | | |
| Cancel không xóa | | |
| Confirm xóa thành công | | |
| Bản ghi biến mất | | |

### Search / Filter / Pagination

| Check | Status | Notes |
|---|---|---|
| Search debounce đúng (400ms) | | |
| URL params cập nhật khi search | | |
| Filter URL-synced | | |
| Pagination URL-synced | | |
| Refresh giữ nguyên state | | |

### Form Validation

| Check | Status | Notes |
|---|---|---|
| Required fields hiển thị error | | |
| Format sai hiển thị error | | |
| Error biến mất khi nhập đúng | | |

---

## Phase 4 — Edge Cases

### Boundary Values

| Case | Expected | Status | Notes |
|---|---|---|---|
| Input rỗng | Validation fail | | |
| Input max length | Pass | | |
| Input max+1 length | Fail | | |
| Số âm (nếu có) | Fail | | |

### Network & Error States

| Case | Expected | Status | Notes |
|---|---|---|---|
| API timeout | Error state, không crash | | |
| 500 error | Toast error, không expose raw | | |
| Double-click submit | Chỉ 1 request | | |

---

## Phase 5 — Regression

### i18n

| Check | Status | Notes |
|---|---|---|
| Switch sang EN: text đổi đúng | | |
| Switch sang EN: không có key thiếu | | |
| Switch lại VI: text đúng | | |
| Validation messages đúng ngôn ngữ | | |

### Auth

| Check | Status | Notes |
|---|---|---|
| Không auth → redirect /login | | |
| Sau login → redirect về URL ban đầu | | |
| Role-based UI đúng (nếu có) | | |

### Existing Features

| Check | Status | Notes |
|---|---|---|
| Các màn hình khác vẫn load | | |
| Không có console.error mới | | |

---

## Unit Test Status

| Test | Status | Notes |
|---|---|---|
| Mapper tests | PASS / FAIL / NOT RUN | |
| Schema tests | PASS / FAIL / NOT RUN | |
| Utility tests | PASS / FAIL / NOT RUN | |

---

## Residual Risks

| Risk | Severity | Reason not tested | Reviewer action |
|---|---|---|---|
| | | | |

---

## Recommended Next Actions

- [ ] Ready — có thể bàn giao cho USER review
- [ ] Cần fix blocking issues trước khi bàn giao
- [ ] Cần chạy lại Phase ___ sau khi fix
