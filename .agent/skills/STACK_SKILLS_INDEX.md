# STACK SKILLS INDEX — Pipeline triển khai 1 màn hình A→Z

> File này là bản hướng dẫn thao tác để kích hoạt các skill trong `.agent/skills/` theo đúng pipeline triển khai từng màn hình cho dự án `danangtrip-admin`.
>
> **Repo:** `d:/DATN/danangtrip-admin` — React 19 + Vite + TypeScript + react-router-dom v7 + TanStack Query + Zustand + Tailwind CSS v4 + react-hook-form + yup

---

## Stack thực tế của dự án

| Hạng mục | Công nghệ |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Routing | react-router-dom v7 |
| Server state | @tanstack/react-query |
| Client state | zustand |
| HTTP | axios (`src/api/axiosClient.ts`) |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + yup + @hookform/resolvers |
| i18n | react-i18next + i18next-http-backend + browser detector |
| Icons | lucide-react, react-icons |
| Notifications | sonner |
| Charts | recharts |
| Validation schemas | `src/validations/*.schema.ts` (Yup, function-based) |
| Data mappers | `src/dataHelper/*.mapper.ts` + `*.dataHelper.ts` |
| E2E | Playwright (`npm run test:console`) |
| Deploy | Vite build (`npm run build`) |

---

## Pipeline tổng quan

```
01-screen-analysis      Phan tich man hinh (khong code)
02-project-setup        Kiem tra/chuan bi project base
03-types-api-contract   Dinh nghia Types, Yup schemas, API module
04-layout-routing       Xay dung Layout & Route (react-router-dom v7)
05-ui-components        Xay dung UI Components (Atomic Design)
06-data-integration     Tich hop Data (TanStack Query hooks)
07-interactions         CRUD, Filter, Search, Pagination, Export
08-auth-permissions     Auth guard, role-based UI
09-testing              Lint + Typecheck + Playwright
10-optimization-deploy  Build + Deploy + Smoke test
```

---

## 1) Danh sách 10 Skills

| # | Skill ID | Persona | Mục đích | Output |
|---|----------|---------|----------|--------|
| 01 | `01-screen-analysis` | Business Analyst | Đọc mockup/SRS → checklist UI + API + Business Rules | `artifacts/analysis/` |
| 02 | `02-project-setup` | DevOps Engineer | Audit project base, dependencies, cấu trúc | Project sạch, chạy được |
| 03 | `03-types-api-contract` | System Architect | Định nghĩa TS types, Yup schemas, API module, mapper | `types/`, `api/`, `validations/`, `dataHelper/` |
| 04 | `04-layout-routing` | Senior Software Engineer | Tạo route, layout, page skeleton | `pages/`, `layouts/`, `routes/` |
| 05 | `05-ui-components` | UI/UX Designer + SSE | Build UI theo Atomic Design từ mockup | `components/`, `pages/*/components/` |
| 06 | `06-data-integration` | Senior Software Engineer | Gắn API vào UI, xử lý states | Loading/Error/Empty states |
| 07 | `07-interactions` | Senior Software Engineer | CRUD, Filter, Search, Pagination, Export | Full interactions |
| 08 | `08-auth-permissions` | Security Expert | Auth guard, role-based UI, token management | Auth flow hoàn chỉnh |
| 09 | `09-testing` | QA/QC Engineer | Lint + typecheck + build + Playwright | Quality gates pass |
| 10 | `10-optimization-deploy` | Performance Engineer + DevOps | Optimize + Build + Deploy | Build OK, deployed |

---

## 2) File context bắt buộc đọc trước khi làm bất kỳ skill nào

Trước khi bắt đầu bất kỳ skill nào, AI PHẢI đọc:

### Rules
- `.agent/rules/PROJECT_RULES.md` — quy tắc kiến trúc, code quality, delivery gates

### Core Infrastructure
- `src/api/axiosClient.ts` — axios instance, interceptors, token attach, refresh logic
- `src/constants/endpoints.ts` — TẤT CẢ API_ENDPOINTS constants
- `src/providers/index.tsx` — AppProviders (QueryClient, i18n, auth bootstrap)

### Config
- `vite.config.ts` — path aliases: `@/*` → `src/*`
- `tsconfig.app.json` — TypeScript config
- `.env.example` — env vars: VITE_API_URL, VITE_API_FALLBACK_URLS, VITE_API_TIMEOUT_MS

### Auth
- `src/store/useUserStore.ts` — Zustand auth store (user, token, isAuthenticated)
- `src/hooks/useAuthQuery.ts` — auth hook pattern
- `src/routes/` — router setup + guards

### Shared UI
- `src/components/ui/` — atomic UI components
- `src/components/common/` — shared molecules/organisms
- `src/components/loading/` — loading states
- `src/components/pagination/` — pagination component
- `src/layouts/` — AdminLayout, AuthLayout

### Existing Patterns (reuse trước khi tạo mới)
- `src/api/tourApi.ts` — API module pattern mẫu
- `src/hooks/useTourQueries.ts` — TanStack Query hook pattern mẫu
- `src/dataHelper/tour.mapper.ts` — mapper pattern mẫu
- `src/validations/tour.schema.ts` — Yup schema pattern mẫu
- `src/pages/Tours/` — page/component pattern mẫu

### Types (reuse trước khi tạo mới)
- `src/types/api.ts` — ApiResponse<T>, PaginatedResponse<T>
- `src/types/auth.ts` — User, AuthState
- `src/types/location.ts` — Location entity
- `src/types/schedule.ts` — Schedule entity

---

## 3) Prompt chi tiết từng skill

### 3.1 — 01-screen-analysis

```
Kích hoạt 01-screen-analysis

Context:
- Repo: d:/DATN/danangtrip-admin
- Screen name: <tên màn hình>
- Mockup/SRS: <path hoặc NONE>
- API docs: đọc src/constants/endpoints.ts để biết endpoints có sẵn

Files bắt buộc đọc trước:
- .agent/skills/01-screen-analysis/persona.md
- .agent/skills/01-screen-analysis/SKILL.md
- .agent/skills/01-screen-analysis/checklist.md
- .agent/rules/PROJECT_RULES.md
- d:/DATN/DATN_Tài liệu/docs/api/api_list.md (NGUỒN CHÂN LÝ — 184 endpoints, params, DB tables, auth level)
- src/constants/endpoints.ts (endpoints đã đăng ký trong frontend)
- src/routes/ (biết routes hiện có)

Required output:
- .agent/artifacts/analysis/YYYY-MM-DD__<feature-slug>__screen-analysis.md
  (dùng template: .agent/skills/01-screen-analysis/template_screen_analysis.md)

📁 Ví dụ (feature "blogs"):
  .agent/artifacts/analysis/2026-05-10__blogs__screen-analysis.md
  → Nội dung: component breakdown, UI states, API mapping, BR-01..BR-05, actors

Phân tích 5 mục:
1. Component breakdown: [REUSE]/[NEW]/[MOD]
2. UI States: loading (skeleton), empty, error, success, disabled
3. Data fields: map với API_ENDPOINTS trong src/constants/endpoints.ts
4. Business rules: BR-xx
5. Auth/Permissions: admin-only vs role-based

KHÔNG viết code. Chỉ phân tích và output checklist.
```

---

### 3.2 — 02-project-setup

```
Kích hoạt 02-project-setup

Context:
- Repo: d:/DATN/danangtrip-admin

Files bắt buộc đọc trước:
- .agent/skills/02-project-setup/SKILL.md
- .agent/rules/PROJECT_RULES.md
- package.json (stack hiện tại)
- tsconfig.app.json (path aliases: @/* → src/*)
- vite.config.ts
- src/api/axiosClient.ts (HTTP client đã có)
- src/providers/index.tsx (providers đã có)

Stack hiện tại (KHÔNG thay đổi):
- React 19, Vite, TypeScript, Tailwind CSS v4
- TanStack Query, Zustand, react-router-dom v7
- react-hook-form + yup, react-i18next, lucide-react, sonner

Kiểm tra:
- Dependencies trong package.json
- Folder structure theo PROJECT_RULES Section 3
- Path aliases trong tsconfig.app.json
- axiosClient có fallback URL logic không
- Route guards hoạt động không

Verify: npm run lint && npm run typecheck && npm run build
```

---

### 3.3 — 03-types-api-contract

```
Kích hoạt 03-types-api-contract

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- Analysis file: .agent/artifacts/analysis/YYYY-MM-DD__<feature-slug>__screen-analysis.md

Files bắt buộc đọc trước:
- .agent/skills/03-types-api-contract/persona.md
- .agent/skills/03-types-api-contract/SKILL.md
- .agent/skills/03-types-api-contract/checklist.md
- .agent/rules/PROJECT_RULES.md (Sections 12, 14, 15)
- d:/DATN/DATN_Tài liệu/docs/api/api_list.md (NGUỒN CHÂN LÝ — xác nhận method, path, params name, auth level TRƯỚC khi tạo type)
- src/constants/endpoints.ts (endpoints thực tế)
- src/types/api.ts (ApiResponse<T>, PaginatedResponse<T> — REUSE)
- src/types/ (entities hiện có — REUSE trước khi tạo mới)
- src/api/tourApi.ts (API module pattern mẫu)
- src/dataHelper/tour.mapper.ts (mapper pattern mẫu)
- src/validations/tour.schema.ts (Yup schema pattern mẫu)

Placement rules:
- Types: src/types/<entity>.ts
- API module: src/api/<feature>Api.ts
- Mapper: src/dataHelper/<feature>.mapper.ts + <feature>.dataHelper.ts
- Yup schema: src/validations/<feature>.schema.ts

Patterns bắt buộc:
- API module: export const featureApi = { getList, getById, create, update, delete }
- Mapper: Raw<Entity> → ViewModel pattern
- Schema: export const featureSchema = (t: TFunction) => yup.object({...})
- Types: Raw<Entity> interface + ViewModel interface

Required outputs:
- src/types/<feature>.ts
- src/api/<feature>Api.ts
- src/dataHelper/<feature>.mapper.ts
- src/dataHelper/<feature>.dataHelper.ts (nếu cần helpers)
- src/validations/<feature>.schema.ts
- .agent/artifacts/api-contracts/YYYY-MM-DD__<feature-slug>__api-contract.md

📁 Ví dụ (feature "blogs"):
  src/types/blog.ts               → interface RawBlog { id, title, body, status, ... }
                                    interface Blog { id, title, body, status, createdAt }
  src/api/blogApi.ts              → blogApi.getList(params), .getById(id), .create(data), .update(id,data), .delete(id)
  src/dataHelper/blog.mapper.ts   → mapRawBlogToViewModel(raw: RawBlog): Blog
  src/validations/blog.schema.ts  → blogSchema(t: TFunction) => yup.object({ title: ..., body: ... })
  .agent/artifacts/api-contracts/2026-05-10__blogs__api-contract.md
```

---

### 3.4 — 04-layout-routing

```
Kích hoạt 04-layout-routing

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- Route path: <vd: /admin/blogs, /admin/users>
- Layout: <AdminLayout / AuthLayout>
- Auth requirement: <admin-only / public>

Files bắt buộc đọc trước:
- .agent/skills/04-layout-routing/SKILL.md
- .agent/rules/PROJECT_RULES.md (Sections 3, 4)
- src/routes/ (router setup hiện có + guards)
- src/layouts/ (AdminLayout, AuthLayout hiện có)
- src/pages/ (structure mẫu)
- src/i18n/ (i18next bootstrap)

Route structure:
- Admin pages: src/pages/<Feature>/index.tsx
- Detail/sub-pages: src/pages/<Feature>/<SubPage>.tsx
- Route registration: src/routes/index.tsx hoặc routes config

Required outputs:
- src/pages/<Feature>/index.tsx (page skeleton)
- Cập nhật src/routes/ để đăng ký route mới
- Cập nhật i18n locale files nếu cần menu/breadcrumb text

📁 Ví dụ (feature "blogs"):
  src/pages/Blogs/index.tsx           → <BlogsPage> skeleton, import AdminLayout, breadcrumb
  src/routes/index.tsx                → thêm { path: '/admin/blogs', element: <Blogs />, guard: ProtectedRoute }
  src/i18n/locales/vi/common.json     → thêm key "nav.blogs": "Bài viết"
  src/i18n/locales/en/common.json     → thêm key "nav.blogs": "Blogs"
```

---

### 3.5 — 05-ui-components

```
Kích hoạt 05-ui-components

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- Screen analysis: .agent/artifacts/analysis/YYYY-MM-DD__<feature-slug>__screen-analysis.md

Files bắt buộc đọc trước:
- .agent/skills/05-ui-components/persona.md
- .agent/skills/05-ui-components/SKILL.md
- .agent/skills/05-ui-components/checklist.md
- .agent/rules/PROJECT_RULES.md (Sections 7, 12, 17)
- src/components/ui/ (atoms hiện có — REUSE)
- src/components/common/ (molecules hiện có — REUSE)
- src/components/loading/ (loading components)
- src/components/pagination/ (pagination)
- src/pages/Tours/ (page/component pattern mẫu)

Build order (Atomic Design):
1. Atoms: Button, Input, Badge, Skeleton (src/components/ui/)
2. Molecules: FormField, SearchBar, StatusBadge (src/components/common/ hoặc src/pages/<Feature>/components/)
3. Organisms: DataTable, FilterPanel, ModalForm (src/pages/<Feature>/components/)
4. Template: Compose organisms thành page sections

Strict rules:
- KHÔNG gán data thật — chỉ props interface
- KHÔNG tạo component mới nếu đã có tương đương trong src/components/
- Icons: lucide-react (CHÍNH) + react-icons (PHỤ)
- Responsive: mobile-first, Tailwind breakpoints
- State qua props: isLoading → Skeleton, isEmpty → EmptyState, error → ErrorState

Required outputs:
- src/components/ui/<NewAtom>.tsx (nếu cần atom mới)
- src/pages/<Feature>/components/<Component>.tsx (feature components)
- src/components/common/<Shared>.tsx (shared molecules nếu dùng >= 2 features)

📁 Ví dụ (feature "blogs"):
  src/pages/Blogs/components/BlogTable.tsx        → <BlogTable blogs={[]} isLoading columns={[...]} />
  src/pages/Blogs/components/BlogTableSkeleton.tsx→ Skeleton rows thay cho spinner
  src/pages/Blogs/components/BlogStatusBadge.tsx  → <BlogStatusBadge status="published" />
  src/components/common/ConfirmDialog.tsx         → dùng chung >= 2 features
```

---

### 3.6 — 06-data-integration

```
Kích hoạt 06-data-integration

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- API module: src/api/<feature>Api.ts
- UI components: src/pages/<Feature>/components/
- TanStack Query key prefix: <feature>

Files bắt buộc đọc trước:
- .agent/skills/06-data-integration/SKILL.md
- .agent/rules/PROJECT_RULES.md (Sections 4, 14)
- src/providers/index.tsx (QueryClient setup)
- src/api/<feature>Api.ts (API functions)
- src/dataHelper/<feature>.mapper.ts (mapper)
- src/hooks/useTourQueries.ts (hook pattern mẫu)
- src/hooks/useDashboardQueries.ts (parallel queries pattern)

Hook patterns:
- READ: useQuery({ queryKey: [feature, list, params], queryFn: () => featureApi.getList(params), staleTime: 5*60*1000 })
- MUTATION: useMutation({ mutationFn: featureApi.create, onSuccess: () => { queryClient.invalidateQueries({queryKey:[feature]}); toast.success(t(create_success)); } })
- Parallel queries cho independent data (KHÔNG chain enabled trừ khi có dependency thực sự)

Data flow bắt buộc:
- API module (src/api/) → mapper (src/dataHelper/) → hook (src/hooks/) → UI component
- KHÔNG gọi API trực tiếp trong component
- KHÔNG hardcode mock data

States bắt buộc:
- Loading: Skeleton screens (KHÔNG dùng full-page spinner)
- Error: toast.error() từ sonner
- Empty: EmptyState component hoặc "No data available"
- Success: hiển thị data thật

Required outputs:
- src/hooks/use<Feature>Queries.ts
- src/pages/<Feature>/components/ (wired with data)
- src/pages/<Feature>/components/<Component>Skeleton.tsx

📁 Ví dụ (feature "blogs"):
  src/hooks/useBlogQueries.ts
    → useBlogList(params)         queryKey: ['blogs','list',params], staleTime: 5min
    → useBlogDetail(id)           queryKey: ['blogs','detail',id], enabled: !!id
    → useBlogMutations()          createBlog, updateBlog, deleteBlog mutations
  src/pages/Blogs/index.tsx       → const { data, isLoading } = useBlogList(filters)
  src/pages/Blogs/components/BlogTable.tsx  → nhận blogs={data} isLoading={isLoading}
```

---

### 3.7 — 07-interactions

```
Kích hoạt 07-interactions

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- Components đã build: src/pages/<Feature>/components/
- Hooks đã có: src/hooks/use<Feature>Queries.ts

Files bắt buộc đọc trước:
- .agent/skills/07-interactions/SKILL.md
- .agent/rules/PROJECT_RULES.md (Sections 4, 5, 7, 16)
- src/validations/<feature>.schema.ts (Yup schemas)
- src/hooks/use<Feature>Queries.ts (hooks đã có)
- src/pages/Tours/ (interaction pattern mẫu — CRUD, Filter, Pagination)

Interaction patterns:
- Form: react-hook-form + yup resolver + i18n error messages
- CRUD: useMutation + invalidateQueries sau mutation
- Search/Filter: controlled state + debounce 300ms
- Pagination: sync với URL search params
- Confirm dialog: conditional render (KHÔNG dùng window.confirm)
- Export: download trigger với loading state
- Toast: sonner toast.success/error/warning (KHÔNG hardcode message)

Mỗi interaction phải có:
- Success feedback: toast.success(t('action_success'))
- Error feedback: toast.error(normalizedError)
- Loading state: button disabled + spinner khi pending

i18n rules:
- Mọi user-facing text phải có i18n key
- Cập nhật cả vi và en locale files cùng lúc

Required outputs:
- src/pages/<Feature>/components/ (form, filter, pagination)
- src/hooks/use<Feature>Queries.ts (mutation hooks cập nhật)
- Cập nhật src/i18n/locales/vi/<feature>.json
- Cập nhật src/i18n/locales/en/<feature>.json

📁 Ví dụ (feature "blogs"):
  src/pages/Blogs/components/BlogForm.tsx
    → useForm({ resolver: yupResolver(blogSchema(t)) })
    → onSubmit → createBlog.mutate() → toast.success(t('blogs.create_success'))
  src/pages/Blogs/components/BlogFilters.tsx
    → search input (debounce 300ms) + status select + reset
    → sync với URL ?page=1&search=&status=
  src/pages/Blogs/components/DeleteBlogDialog.tsx
    → conditional render dialog, onConfirm → deleteBlog.mutate(id)
  src/i18n/locales/vi/blogs.json  → { "create_success": "Tạo bài viết thành công", ... }
  src/i18n/locales/en/blogs.json  → { "create_success": "Blog created successfully", ... }
```

---

### 3.8 — 08-auth-permissions

```
Kích hoạt 08-auth-permissions

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- Required roles: <ADMIN / STAFF / list>
- Protected routes: <routes cần protect>

Files bắt buộc đọc trước:
- .agent/skills/08-auth-permissions/SKILL.md
- .agent/rules/PROJECT_RULES.md (Section 6)
- src/routes/ (route guards hiện có)
- src/store/useUserStore.ts (Zustand auth store: user, token, isAuthenticated)
- src/hooks/useAuthQuery.ts (auth hook)
- src/api/axiosClient.ts (interceptor gắn Bearer token — ĐÃ CÓ, KHÔNG cần thêm)

Auth architecture:
- Source of truth: Zustand store (useUserStore) + persist vào browser storage
- Token auto-attach: axios interceptor trong axiosClient.ts (KHÔNG duplicate)
- Route guard: ProtectedRoute component trong src/routes/
- Logout: useUserStore.getState().logout() → clearTokens() → redirect /login

Role-based UI pattern:
  const { user } = useUserStore();
  const canEdit = user?.role === 'admin';
  {canEdit && <EditButton />}  // conditional render, KHÔNG CSS hide

Required outputs:
- Cập nhật src/routes/ (nếu cần protect route mới)
- src/pages/<Feature>/components/ (permission-gated UI)

📁 Ví dụ (feature "blogs"):
  src/routes/index.tsx
    → route /admin/blogs wrap <ProtectedRoute requiredRole="admin" />
  src/pages/Blogs/components/BlogActions.tsx
    → const canDelete = user?.role === 'admin';
    → {canDelete && <DeleteButton />}   ← conditional render, KHÔNG CSS hide
```

---

### 3.9 — 09-testing

```
Kích hoạt 09-testing

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- Test URL: <link localhost de test UI, vd: http://127.0.0.1:5173/admin/feature>
- Code scope: src/pages/<Feature>/, src/hooks/use<Feature>Queries.ts

Files bắt buộc đọc trước:
- .agent/skills/09-testing/SKILL.md
- .agent/rules/PROJECT_RULES.md (Sections 8, 9)
- package.json (test scripts)

Testing hiện tại:
- npm run lint (ESLint — bắt buộc pass)
- npm run typecheck (TSC — bắt buộc pass)
- npm run build (Vite build — bắt buộc pass)
- npm run test:console (Playwright — khi dev server đang chạy)
- npm run prepush:check (all-in-one gate)
- E2E Manual (AI Browser Subagent): YÊU CẦU TRUYỀN LINK URL VÀO PROMPT (vd: `http://127.0.0.1:5173/feature`) ĐỂ AI TEST TRỰC TIẾP TRÊN TRÌNH DUYỆT.

KHÔNG có Vitest/Jest setup → không viết unit tests trừ khi được yêu cầu

Checklist bắt buộc:
- [ ] npm run lint PASS
- [ ] npm run typecheck PASS
- [ ] npm run build PASS
- [ ] Không có console.error trong browser khi chạy tính năng
- [ ] i18n vi/en đồng bộ

Required outputs:
- .agent/artifacts/test-cases/YYYY-MM-DD__<feature-slug>__test-report.md

📁 Ví dụ (feature "blogs"):
  .agent/artifacts/test-cases/2026-05-10__blogs__test-report.md
  → | Gate       | Status | Notes              |
  → | lint       | PASS   | 0 errors           |
  → | typecheck  | PASS   | 0 errors           |
  → | build      | PASS   | dist/ generated    |
  → | i18n sync  | PASS   | vi/en đồng bộ      |
  → | browser    | PASS   | no console.error   |
```

---

### 3.10 — 10-optimization-deploy

```
Kích hoạt 10-optimization-deploy

Context:
- Repo: d:/DATN/danangtrip-admin
- Feature slug: <feature-slug>
- Deploy target: Vite static build (PRIMARY)

Files bắt buộc đọc trước:
- .agent/skills/10-optimization-deploy/SKILL.md
- .agent/rules/PROJECT_RULES.md (Sections 8, 14, 17)
- vite.config.ts (build config)
- package.json (build scripts)
- .env.example

Build commands:
- Dev: npm run dev
- Lint: npm run lint
- Typecheck: npm run typecheck
- Build: npm run build
- Preview: npm run preview
- All-in-one: npm run prepush:check

Quality gates (PHẢI pass trước khi deploy):
- npm run lint
- npm run typecheck
- npm run build

Performance checklist:
- React.memo cho expensive components (chỉ khi có evidence)
- dynamic import cho modals, heavy components
- staleTime hợp lý trong TanStack Query hooks
- Parallel queries cho independent data (xem PROJECT_RULES §14)
- KHÔNG premature optimize

Required outputs:
- .agent/artifacts/deploy/YYYY-MM-DD__<feature-slug>__deploy-report.md

📁 Ví dụ (feature "blogs"):
  .agent/artifacts/deploy/2026-05-10__blogs__deploy-report.md
  → | Check      | Status | Notes                    |
  → | lint       | PASS   |                          |
  → | typecheck  | PASS   |                          |
  → | build      | PASS   | chunk: index 342KB       |
  → | smoke test | PASS   | /admin/blogs load OK     |
```

---

## 4) Thứ tự chạy cho 1 feature

1. `01-screen-analysis`  → Output: screen analysis + checklist
2. `02-project-setup`    → Output: project audit (chỉ lần đầu hoặc khi có vấn đề)
3. `03-types-api-contract` → Output: types + Yup schemas + API module + mapper + api-contract
4. `04-layout-routing`   → Output: route + page skeleton + i18n keys
5. `05-ui-components`    → Output: UI components (không data)
6. `06-data-integration` → Output: UI + data thật + loading/error/empty states
7. `07-interactions`     → Output: CRUD + filter + search + pagination
8. `08-auth-permissions` → Output: auth guard + permissions (nếu cần)
9. `09-testing`          → Output: lint + typecheck + build pass
10. `10-optimization-deploy` → Output: optimized + deployed

---

## 5) Checklist trước khi gọi hoàn thiện

- [ ] UI match mockup (responsive, dark mode nếu có)
- [ ] API integrate xong, data hiển thị đúng (không mock data)
- [ ] Đầy đủ states: loading (skeleton), error (toast), empty (EmptyState), success
- [ ] Form validate đúng business rules (react-hook-form + yup + i18n messages)
- [ ] Auth/permission hoạt động (conditional render, không CSS hide)
- [ ] i18n: vi/en đồng bộ, không hardcode text
- [ ] Query keys hierarchical, staleTime hợp lý
- [ ] Mappers xử lý Raw → ViewModel (không trust raw API types)
- [ ] npm run lint PASS
- [ ] npm run typecheck PASS
- [ ] npm run build PASS

---

## 6) Các lỗi thường gặp và cách tránh

| Lỗi | Nguyên nhân | Cách tránh |
|-----|-------------|------------|
| `any` type | Lười type | Dùng `unknown` + narrowing |
| API call trong component | Bỏ qua service layer | Luôn: API module → mapper → hook → UI |
| CSS hide permission | Nhầm bảo mật | Dùng conditional render |
| Duplicate auth store | Tạo store mới | Dùng useUserStore từ `src/store/useUserStore.ts` |
| Hardcode text | Quên i18n | Mọi text phải có key trong `src/i18n/locales/` |
| Missing vi/en sync | Cập nhật 1 locale | Luôn cập nhật cả 2 locale cùng lúc |
| Mock data trong production | Quên xóa mock | EmptyState hoặc hide section, KHÔNG fake data |
| Spinner thay vì skeleton | Quên PROJECT_RULES | Loading = Skeleton screens |
| Raw API type trong UI | Bỏ qua mapper | Luôn qua `src/dataHelper/*.mapper.ts` |
| Schema không có t() | Hardcode messages | Yup schema phải là function nhận `t: TFunction` |
| Chain enabled không cần | "Giảm load" giả | Chỉ dùng `enabled` khi có dependency thực sự |
