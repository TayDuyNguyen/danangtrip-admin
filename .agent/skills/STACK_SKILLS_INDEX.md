# STACK SKILLS INDEX — Pipeline tài liệu và triển khai màn hình A→Z

File này là **master index** cho bộ 10 skill trong `.agent/skills/`.
Nó tồn tại để giúp AI chọn đúng skill, đọc đúng context, và sinh ra **tài liệu chi tiết phục vụ dự án** trước khi gọi công việc là hoàn tất.

## Mục tiêu của bộ skill này

- Bám sát repo `danangtrip-admin`
- Tạo được tài liệu có thể dùng lại cho team
- Chuẩn hóa output theo từng bước trong pipeline
- Giảm tình trạng prompt dài nhưng output không đồng đều
- Tránh lỗi chữ và lỗi format trong tài liệu Markdown

## Quy ước chung

### 1) Nguồn sự thật

Luôn ưu tiên theo thứ tự:

1. `.agent/rules/PROJECT_RULES.md`
2. Repo thực tế: `package.json`, `src/`, `vite.config.ts`, `tsconfig.app.json`
3. Từng `SKILL.md`

### 2) Chuẩn đặt tên artifact

```text
.agent/artifacts/<group>/YYYY-MM-DD__<feature-slug>__<artifact-name>.md
```

### 3) Chuẩn format tài liệu

- Markdown UTF-8
- 1 H1 duy nhất
- Có metadata đầu file: feature slug, date, source
- Bảng dùng đúng cột, không trộn tab/spaces ngẫu nhiên
- Không để lỗi ký tự mã hóa
- Nếu chưa chắc chắn: ghi `[ASSUMPTION]`

### 4) Chuẩn mức chi tiết

Một artifact tốt phải trả lời được:

- Đang làm feature nào?
- Dựa vào nguồn nào?
- Những file nào liên quan?
- Rule nghiệp vụ hoặc technical decision là gì?
- Còn rủi ro hoặc câu hỏi mở nào?

Nếu là artifact ở cuối pipeline như `test-report`, `deploy-report`, `review.md`, mức chi tiết phải cao hơn:

- có verdict rõ ràng
- có evidence rõ ràng
- có phần `not run / skipped / pending` nếu tồn tại
- có phần `risks / next actions`

## Stack thực tế của dự án

| Hạng mục | Công nghệ |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Routing | react-router-dom v7 |
| Server state | @tanstack/react-query |
| Client state | zustand |
| HTTP | axios + axiosClient interceptor |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + yup |
| i18n | react-i18next |
| Icons | lucide-react, react-icons |
| Notifications | sonner |
| Charts | recharts |
| Build gate | `npm run prepush:check` |

## Pipeline 10 Skills

| # | Skill | Khi dùng | Output chính | Có thể bỏ qua khi |
|---|---|---|---|---|
| 01 | `01-screen-analysis` | Có mockup, SRS, hoặc màn hình mới | `analysis/...__screen-analysis.md` | Chỉ sửa bug rất nhỏ, không đổi UI/flow |
| 02 | `02-project-setup` | Cần audit base hoặc vừa đổi nền tảng | `audits/...__project-audit.md` | Base đã audit gần đây và không đổi stack |
| 03 | `03-types-api-contract` | Có field/API/schema mới hoặc đổi contract | `api-contracts/...__api-contract.md` | Chỉ đổi text/style, không chạm data |
| 04 | `04-layout-routing` | Có route, page shell, breadcrumb, menu mới | `routing/...__route-plan.md` | Chỉ sửa component con trong page có sẵn |
| 05 | `05-ui-components` | Cần build mới hoặc tách component UI | `ui-specs/...__ui-spec.md` | Chỉ chỉnh logic, không đổi UI structure |
| 06 | `06-data-integration` | Cần nối API vào UI | `integration/...__data-integration.md` | UI tĩnh, chưa dùng data thật |
| 07 | `07-interactions` | Có CRUD, form, filter, search, pagination | `interaction-specs/...__interaction-spec.md` | Page read-only, không có interaction đáng kể |
| 08 | `08-auth-permissions` | Có role check, route guard, action nhạy cảm | `auth/...__auth-permissions-review.md` | Feature hoàn toàn public hoặc không đổi quyền |
| 09 | `09-testing` | Trước khi bàn giao | `test-cases/...__test-report.md` | Không nên bỏ qua |
| 10 | `10-optimization-deploy` | Trước khi push/deploy/bàn giao cuối | `deploy/...__deploy-report.md`, `review/...__review.md` | Không nên bỏ qua |

## Kích hoạt nhanh theo loại việc

### Nếu đang làm màn hình mới

1. `01-screen-analysis`
2. `03-types-api-contract`
3. `04-layout-routing`
4. `05-ui-components`
5. `06-data-integration`
6. `07-interactions`
7. `08-auth-permissions` nếu cần
8. `09-testing`
9. `10-optimization-deploy`

### Nếu chỉ audit project

1. `02-project-setup`
2. `09-testing`
3. `10-optimization-deploy` nếu cần tổng kết/review

### Nếu chỉ sửa UI nhỏ

1. `01-screen-analysis` dạng nhẹ nếu cần hiểu màn
2. `05-ui-components`
3. `09-testing`

## File bắt buộc nên đọc trước hầu hết task

- `.agent/rules/PROJECT_RULES.md`
- `package.json`
- `vite.config.ts`
- `tsconfig.app.json`
- `src/constants/endpoints.ts`
- `src/api/axiosClient.ts`
- `src/providers/index.tsx`
- `src/routes/`

## Prompt Kích Hoạt Từng Skill

Mỗi skill có prompt riêng với các trường bắt buộc trong `[...]`.
Copy prompt tương ứng, điền vào các trường `[...]`, rồi gửi cho AI.

---

### Skill 01 — Screen Analysis

```text
Kích hoạt 01-screen-analysis

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Screen name: [Danh sách Tour]
- Figma/Stitch: [https://www.figma.com/... | https://stitch.withgoogle.com/... | NONE]
- Input source: [d:/DATN/DATN_Tài liệu/mockup/tour-list.png | SRS section 3.2 | NONE]
- DESIGN.md: [d:/DATN/danangtrip-admin/DESIGN.md]
- API docs: [d:/DATN/DATN_Tài liệu/docs/api/api_list.md]
- Output: [.agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 01-screen-analysis

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Screen name: Danh sách Tour
- Figma/Stitch: https://www.figma.com/design/abc123/DanangTrip-Admin?node-id=12-34
- Input source: d:/DATN/DATN_Tài liệu/mockup/admin-tour-list.png
- DESIGN.md: d:/DATN/danangtrip-admin/DESIGN.md
- API docs: d:/DATN/DATN_Tài liệu/docs/api/api_list.md
- Output: .agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md
```

**Output mong đợi:** `analysis/2026-05-11__tour-list__screen-analysis.md` với design token audit (đối chiếu DESIGN.md), bảng component breakdown [REUSE]/[NEW]/[MOD], UI states per section, data/API mapping, business rules BR-xx, edge cases EC-xx.

---

### Skill 02 — Project Setup Audit

```text
Kích hoạt 02-project-setup

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [project-base | tour-list]
- Lý do audit: [Trước feature mới | Nghi ngờ stack drift | Onboarding]
- Output: [.agent/artifacts/audits/2026-05-11__project-base__project-audit.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 02-project-setup

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: project-base
- Lý do audit: Bắt đầu sprint mới, cần verify base trước khi làm Tour CRUD
- Output: .agent/artifacts/audits/2026-05-11__project-base__project-audit.md
```

**Output mong đợi:** `audits/2026-05-11__project-base__project-audit.md` với verdict ready/not ready, pass/fail từng nhóm (dependency, config, http/auth bootstrap, scripts).

---

### Skill 03 — Types & API Contract

```text
Kích hoạt 03-types-api-contract

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Analysis file: [.agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md]
- API docs: [d:/DATN/DATN_Tài liệu/docs/api/api_list.md]
- Endpoints liên quan: [GET /admin/tours, POST /admin/tours, PUT /admin/tours/:id, DELETE /admin/tours/:id]
- Output: [.agent/artifacts/api-contracts/2026-05-11__tour-list__api-contract.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 03-types-api-contract

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Analysis file: .agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md
- API docs: d:/DATN/DATN_Tài liệu/docs/api/api_list.md
- Endpoints liên quan: GET /admin/tours (list + filter), POST /admin/tours, PUT /admin/tours/:id, DELETE /admin/tours/:id
- Output: .agent/artifacts/api-contracts/2026-05-11__tour-list__api-contract.md
```

**Output mong đợi:** `api-contracts/2026-05-11__tour-list__api-contract.md` với RawTour interface, Tour ViewModel, tourSchema(t), tourApi module plan, mapper plan, files expected to change.

---

### Skill 04 — Layout & Routing

```text
Kích hoạt 04-layout-routing

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Analysis file: [.agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md]
- Route path mong muốn: [/tours]
- Có route mới không: [Có — /tours, /tours/create, /tours/:id/edit | Không]
- Có menu item mới không: [Có — sidebar "Quản lý Tour" | Không]
- Output: [.agent/artifacts/routing/2026-05-11__tour-list__route-plan.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 04-layout-routing

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Analysis file: .agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md
- Route path mong muốn: /tours
- Có route mới không: Có — /tours (list), /tours/create, /tours/:id/edit
- Có menu item mới không: Có — sidebar "Quản lý Tour" với icon MapIcon
- Output: .agent/artifacts/routing/2026-05-11__tour-list__route-plan.md
```

**Output mong đợi:** `routing/2026-05-11__tour-list__route-plan.md` với route registration plan, page skeleton files, breadcrumb/menu impact, i18n keys cần thêm.

---

### Skill 05 — UI Components

```text
Kích hoạt 05-ui-components

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Analysis file: [.agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md]
- Components cần đặc biệt chú ý: [TourTable, TourFormModal, TourFilterBar | NONE]
- Output: [.agent/artifacts/ui-specs/2026-05-11__tour-list__ui-spec.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 05-ui-components

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Analysis file: .agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md
- Components cần đặc biệt chú ý: TourTable (reuse DataTable?), TourFormModal (create + edit), TourStatusBadge
- Output: .agent/artifacts/ui-specs/2026-05-11__tour-list__ui-spec.md
```

**Output mong đợi:** `ui-specs/2026-05-11__tour-list__ui-spec.md` với bảng [REUSE]/[NEW]/[MOD], layer breakdown, UI states per component, placement strategy, build order.

---

### Skill 06 — Data Integration

```text
Kích hoạt 06-data-integration

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- API contract: [.agent/artifacts/api-contracts/2026-05-11__tour-list__api-contract.md]
- UI spec: [.agent/artifacts/ui-specs/2026-05-11__tour-list__ui-spec.md]
- Queries cần có: [list với filter/pagination, detail, categories lookup]
- Mutations cần có: [create, update, delete, toggle-status]
- Output: [.agent/artifacts/integration/2026-05-11__tour-list__data-integration.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 06-data-integration

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- API contract: .agent/artifacts/api-contracts/2026-05-11__tour-list__api-contract.md
- UI spec: .agent/artifacts/ui-specs/2026-05-11__tour-list__ui-spec.md
- Queries cần có: useTourList (list + filter + pagination), useTourDetail (cho edit modal), useCategoryList (lookup cho filter)
- Mutations cần có: useCreateTour, useUpdateTour, useDeleteTour, useToggleTourStatus
- Output: .agent/artifacts/integration/2026-05-11__tour-list__data-integration.md
```

**Output mong đợi:** `integration/2026-05-11__tour-list__data-integration.md` với query key hierarchy, staleTime, mutation invalidation strategy, UI state handling per section.

---

### Skill 07 — Interactions

```text
Kích hoạt 07-interactions

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Analysis file: [.agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md]
- Data integration: [.agent/artifacts/integration/2026-05-11__tour-list__data-integration.md]
- Actions chính: [create, update, delete, search, filter-by-category, filter-by-status, pagination, export-excel]
- Destructive actions: [delete single, bulk delete]
- Output: [.agent/artifacts/interaction-specs/2026-05-11__tour-list__interaction-spec.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 07-interactions

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Analysis file: .agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md
- Data integration: .agent/artifacts/integration/2026-05-11__tour-list__data-integration.md
- Actions chính: create (modal), update (modal), delete (confirm dialog), search (debounce), filter by category + status, pagination (URL sync), export Excel
- Destructive actions: delete single tour, bulk delete selected tours
- Output: .agent/artifacts/interaction-specs/2026-05-11__tour-list__interaction-spec.md
```

**Output mong đợi:** `interaction-specs/2026-05-11__tour-list__interaction-spec.md` với action breakdown, form flow (schema + submit + reset), URL-synced state, confirm dialog spec, i18n keys cần thêm.

---

### Skill 08 — Auth & Permissions

```text
Kích hoạt 08-auth-permissions

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Route plan: [.agent/artifacts/routing/2026-05-11__tour-list__route-plan.md]
- Interaction spec: [.agent/artifacts/interaction-specs/2026-05-11__tour-list__interaction-spec.md]
- Loại feature: [authenticated-only | role-based]
- Roles liên quan: [admin, staff]
- Actions nhạy cảm: [delete, bulk-delete, export]
- Output: [.agent/artifacts/auth/2026-05-11__tour-list__auth-permissions-review.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 08-auth-permissions

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Route plan: .agent/artifacts/routing/2026-05-11__tour-list__route-plan.md
- Interaction spec: .agent/artifacts/interaction-specs/2026-05-11__tour-list__interaction-spec.md
- Loại feature: role-based
- Roles liên quan: admin (full access), staff (view + create + edit, không được delete/export)
- Actions nhạy cảm: delete single, bulk delete, export Excel
- Output: .agent/artifacts/auth/2026-05-11__tour-list__auth-permissions-review.md
```

**Output mong đợi:** `auth/2026-05-11__tour-list__auth-permissions-review.md` với protected routes, permission matrix (action × role), guarded UI actions (hidden vs disabled), redirect behavior, risks.

---

### Skill 09 — Testing

```text
Kích hoạt 09-testing

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Dev server URL: [http://localhost:5173/tours | NOT AVAILABLE]
- Code scope: [src/pages/Tours/, src/hooks/useTourQueries.ts, src/dataHelper/tour.mapper.ts, src/validations/tour.schema.ts]
- Analysis file: [.agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md]
- Interaction spec: [.agent/artifacts/interaction-specs/2026-05-11__tour-list__interaction-spec.md]
- Auth review: [.agent/artifacts/auth/2026-05-11__tour-list__auth-permissions-review.md]
- Output: [.agent/artifacts/test-cases/2026-05-11__tour-list__test-report.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 09-testing

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Dev server URL: http://localhost:5173/tours
- Code scope: src/pages/Tours/, src/hooks/useTourQueries.ts, src/dataHelper/tour.mapper.ts, src/validations/tour.schema.ts
- Analysis file: .agent/artifacts/analysis/2026-05-11__tour-list__screen-analysis.md
- Interaction spec: .agent/artifacts/interaction-specs/2026-05-11__tour-list__interaction-spec.md
- Auth review: .agent/artifacts/auth/2026-05-11__tour-list__auth-permissions-review.md
- Output: .agent/artifacts/test-cases/2026-05-11__tour-list__test-report.md
```

**Output mong đợi:** `test-cases/2026-05-11__tour-list__test-report.md` với 5 phase đầy đủ:
- Phase 1: lint/typecheck/build/prepush (PASS/FAIL)
- Phase 2: UI visual — layout, skeleton, empty state, design tokens
- Phase 3: Functional — CRUD flows, search/filter/pagination, form validation
- Phase 4: Edge cases — boundary values, network errors, concurrent actions
- Phase 5: Regression — i18n vi/en, auth redirect, existing features
- Verdict: `ready / not ready`

---

### Skill 10 — Optimization & Deploy

```text
Kích hoạt 10-optimization-deploy

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-list]
- Test report: [.agent/artifacts/test-cases/2026-05-11__tour-list__test-report.md]
- Test verdict: [READY | READY WITH RISKS | NOT READY]
- Artifacts đã có: [analysis, api-contract, route-plan, ui-spec, data-integration, interaction-spec, auth-review, test-report]
- Branch hiện tại: [main | develop | NONE — chưa tạo nhánh]
- Output deploy: [.agent/artifacts/deploy/2026-05-11__tour-list__deploy-report.md]
- Output review: [.agent/artifacts/review/2026-05-11__tour-list__review.md]
```

**Ví dụ thực tế:**
```text
Kích hoạt 10-optimization-deploy

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: tour-list
- Test report: .agent/artifacts/test-cases/2026-05-11__tour-list__test-report.md
- Test verdict: READY
- Artifacts đã có: analysis, api-contract, route-plan, ui-spec, data-integration, interaction-spec, auth-review, test-report
- Branch hiện tại: main
- Output deploy: .agent/artifacts/deploy/2026-05-11__tour-list__deploy-report.md
- Output review: .agent/artifacts/review/2026-05-11__tour-list__review.md
```

**Output mong đợi:**
- `deploy-report.md` — build status, performance notes, smoke test, verdict
- `review.md` — objective, scope, artifact trace, technical decisions, risks
- **Gợi ý tên nhánh**: `feat/tour-list`
- **Gợi ý commit message**: `feat(tours): add tour list screen with CRUD and filter`
- **Hiển thị lệnh git** và **CHỜ USER xác nhận** trước khi push.

## Những gì mỗi SKILL.md cung cấp

Mỗi SKILL.md trong bộ này có:

- **Overview**: mục tiêu và vai trò trong pipeline
- **Required Input**: file phải đọc trước khi bắt đầu
- **Process**: các bước thực hiện có thứ tự
- **Pattern Chuẩn**: code example thực tế từ repo (không generic)
- **Output Document**: artifact cần tạo và template dùng
- **Strict Rules**: rule không được vi phạm
- **Red Flags**: dấu hiệu đang làm sai — phải dừng và flag
- **Common Rationalizations**: lý do hay dùng để bỏ qua bước — và tại sao sai
- **Verification**: checklist cuối để xác nhận output đủ chất lượng

## Kỳ vọng đầu ra 10/10

Một bộ skill được xem là thực dụng `10/10` cho repo này khi:

- Tất cả skill đều tham chiếu đúng file đang tồn tại
- Mỗi skill có artifact rõ ràng
- Tài liệu đủ chi tiết để người khác review mà không phải hỏi lại
- Không có lỗi encoding/format
- Không có rule nói một đằng, template làm một nẻo
- Các ví dụ đều bám `Tours`, `Locations`, `Dashboard` hoặc pattern thật trong repo

Đồng thời:

- skill docs đủ chi tiết để AI không phải tự đoán quy trình
- code example trong skill bám đúng pattern thật (react-hook-form + yup, axiosClient, useTourQueries)
- template docs đủ chi tiết để artifact sinh ra không bị cụt
- cuối pipeline có thể đọc `review.md` mà nắm được toàn bộ feature ở mức high-level lẫn execution trace
