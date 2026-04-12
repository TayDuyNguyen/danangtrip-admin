---
description: "Project rules and architecture guide for DanangTrip Admin — mandatory reading for AI before any code generation."
---

# DanangTrip Admin — Project Rules & Architecture

This document is the **primary operating guide** for AI working on this project. Use it together with `AGENTS.md` and other project docs when needed.

---

## 1. Tech Stack

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| **Framework**      | React 19 with Vite, TypeScript (strict)            |
| **Routing**        | `react-router-dom` v7 (Public/Private split)       |
| **Server State**   | `@tanstack/react-query` (useMutation / useQuery)  |
| **Client State**   | `zustand` (persisted to localStorage)             |
| **HTTP Client**    | `axios` with request/response interceptors        |
| **Styling**        | Tailwind CSS                                      |
| **Validation**     | `yup` schemas (i18n-aware)                        |
| **i18n**           | `react-i18next` + `i18next-http-backend`          |
| **Icons**          | `lucide-react`                                    |
| **Charts**         | `recharts`                                        |
| **Notifications**  | `sonner` (toast)                                  |

---

## 2. Directory Structure

```
src/
├── api/                  # Axios service files (*Api.ts) + axiosClient.ts
├── assets/               # Static assets (images, fonts)
├── components/           # Shared/reusable UI components
│   ├── common/           #   Sidebar, Header, RightSidebar
│   ├── input/            #   Form input components
│   ├── loading/          #   Loading spinners/skeletons
│   ├── pagination/       #   Pagination component
│   ├── toast/            #   Toast notification wrappers
│   └── LanguageSwitcher/ #   Language toggle component
├── constants/            # App-wide constants
│   ├── endpoints.ts      #   API_ENDPOINTS object (centralized)
│   └── colors.ts         #   Color palette constants
├── dataHelper/           # Interface/Type definitions per feature
├── hooks/                # React Query hooks — THE bridge between pages and API
├── i18n/                 # i18next configuration
├── layouts/              # Page layouts (MainLayout with Sidebar + Header)
├── pages/                # Feature pages (one folder per feature)
├── providers/            # React context providers
├── routes/               # Router config (Public/Private route guards)
├── store/                # Zustand global stores
├── types/                # Global TypeScript interfaces
├── utils/                # Utility/helper functions
└── validations/          # Yup validation schemas (i18n-integrated)
```

---

## 3. Socratic Discovery (Think Before Code)

Use this discovery flow for ambiguous requests, architecture-impacting changes, or high-risk bug fixes.
For clear and low-risk requests, proceed directly after a quick impact scan.

1. **Impact Analysis (required):** Check `ARCHITECTURE.md` and identify dependent files/layers.
2. **Clarifying Questions (conditional):** Ask up to 3 targeted questions only when requirements are unclear. Prioritize:
   - **Edge Cases:** empty states, API errors, loading/retry behavior.
   - **Business Logic:** permissions, workflow constraints, data ownership.
   - **UX/UI:** responsive behavior, hidden states, accessibility expectations.
3. **Confirmation Gate (conditional):** Wait for user confirmation only when answers materially affect architecture, UX, or business logic.

---

## 4. Data Flow Architecture

Use this as the **target architecture for all new code and touched modules**. Legacy code may not fully follow this yet; prefer incremental migration instead of risky rewrites.

**Layer 1 — Page / UI Component** (`src/pages/`): Prefer calling a Hook. Avoid direct API service calls in pages for new code.

**Layer 2 — Hook** (`src/hooks/use*Query.ts`): Wraps API calls in `useMutation` or `useQuery`. Handles side effects in `onSuccess`/`onError`. Returns state back to the page.

**Layer 3 — API Service** (`src/api/*Api.ts`): Thin wrapper around `axiosClient`. Maps function names to endpoint constants. Zero business logic.

**Layer 4 — axiosClient** (`src/api/axiosClient.ts`): Single axios instance. Handles auth headers, token refresh, and global error toasts.

---

## 5. Internationalization (i18n) Rules

1. **Zero Hardcoding:** Never hardcode UI text. Use `t('key')` from `useTranslation`.
2. **Synchronization:** `vi/*.json` and `en/*.json` must stay perfectly in sync. If you add a key to one, you must add it to the other.
3. **Namespacing:** One namespace per feature (e.g., `dashboard`, `tours`). Shared keys go in `common`.
4. **Validation:** Pass the `t` function to Yup schemas: `loginSchema(t)`.

---

## 6. Authentication & Environment

- **Token Storage:** Access tokens are stored in `localStorage` via `tokenUtils.ts`.
- **Environment Variables:**
  - Sensitive variables must use the `VITE_` prefix (e.g., `VITE_API_URL`).
  - Update `.env.example` whenever a new variable is added.
  - Never commit actual `.env` files.
  - `VITE_API_URL`: backend base URL (also used by Vite proxy target when set).
  - `VITE_PORT`: dev server port.
  - `VITE_PREVIEW_PORT`: preview port.
  - `VITE_HOST`: dev server host.
  - `VITE_NAME`: app name.

## 6.1. Test Status

- There is currently no test framework or `test` script configured in `package.json`.
- Running all tests / running a single test is not available until a test runner (e.g. Vitest/Jest) is added.

## 6.2. Implementation Notes

- Import alias `@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- `src/providers/index.tsx` is wired into `src/main.tsx` via `AppProviders`.
- React Query dependency and auth mutation hooks (`src/hooks/useAuthQuery.ts`) exist, but current login flow primarily uses direct API calls in the page component.
- `src/dataHelper/index.ts` currently exports auth + dashboard helpers, while tour types are imported from `src/dataHelper/tour.dataHelper.ts` directly.

---

## 7. UI/UX & Design Policy

- **Design Tokens First:** Prefer existing color, spacing, and typography tokens before introducing new values.
- **Primary Accent Guidance:** Avoid purple/violet as default primary accents unless required by approved branding.
- **Radius:** Prefer `rounded-2xl` or `rounded-3xl`; use larger radius only for intentionally "hero" surfaces.
- **Shadows:** Use `shadow-sm` or `shadow-md` by default; stronger hover shadows only for interactive elevation cues.
- **Typography:** Prefer readable weight hierarchy (e.g., `font-semibold`/`font-bold` for headings, `font-medium`/`font-normal` for body).
- **Accessibility:** Ensure contrast, focus states, keyboard navigation, and touch target sizes are not regressed.

---

## 8. Quality Control Loop (MANDATORY)

Every agent **must** execute these 4 steps before reporting completion:

```bash
# 1. Base Validation
npm run lint && npx tsc --noEmit

# 2. Agent Core Validation (Antigravity Kit)
python .agent/scripts/checklist.py .

# 3. Domain Specific Audits (If UI/Text changed)
python .agent/skills/i18n-localization/scripts/i18n_checker.py .
python .agent/skills/frontend-design/scripts/ux_audit.py .

# 4. Final Smoke Test
npm run build
```
- **Red Errors:** Must be fixed immediately. No `// @ts-ignore` allowed.
- **Reporting:** Summarize script results (Errors/Warnings/Passed) to the user.

### Execution fallback policy

If one or more `.agent` scripts fail because of missing dependencies or local environment mismatch:
1. Report the failing script and exact error context.
2. Run native fallback checks (`npm run lint`, `npx tsc -b`, `npm run build`).
3. Continue only after core checks pass, or after explicit user approval to proceed with known risk.

---

## 9. Testing Strategy

Current repository status: there is no active test runner in `package.json`.

1. **When no test runner is available:** rely on `npm run lint`, `npx tsc -b`, and `npm run build` as required quality gates.
2. **When tests are introduced:** follow the pyramid (Unit > Integration > E2E) and AAA pattern.
3. **Isolation Principle:** mock `axiosClient` at boundaries rather than scattering mocks across feature services.
4. **Regression Rule:** for high-risk bugs, add a reproducible test/spec once test infrastructure exists.

---

## 10. Git & Commit Standards

When preparing a commit, follow the **Conventional Commits** standard:

- **Format:** `type(scope): subject`
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- **Scope:** Feature name (e.g., `auth`, `tours`).
- **Example:** `feat(tours): add pagination to list view`
- **Requirement:** Review `git diff` and ensure `checklist.py` passes before committing.

---

## 11. Debugging & Refactoring

- **Isolation:** Identify the failing layer (UI/Hook/API/Backend) before writing code.
- **5 Whys:** Ask "Why" until the root cause is found. Do not just patch symptoms.
- **No Overlapping:** Do not refactor and add features in the same task/commit.
- **Safety:** Write characterization tests for complex legacy logic before refactoring.

---

## 12. Documentation Standards

- **Code Comments:** Explain *Why*, not *What*.
- **Format:** English primary.
- **JSDoc:** Required for public/shared utilities, reusable hooks with non-trivial behavior, and complex exported types.
- **README:** Only update documentation when explicitly requested by the user.

---

## 13. Skill Routing & Usage Rules (.agent)

Choose skills intentionally by task domain. Do not load all skills by default.
Only reference skills that actually exist under `.agent/skills`.

| Task Type | Primary Skills | Optional Workflow |
| --- | --- | --- |
| Architecture changes / multi-module refactor | `architecture`, `plan-writing` | `.agent/workflows/plan.md` |
| Ambiguous requirement discovery | `brainstorming` | `.agent/workflows/brainstorm.md` |
| Bug isolation and root cause analysis | `systematic-debugging` | `.agent/workflows/debug.md` |
| API contract and endpoint work | `api-patterns` | `.agent/workflows/create.md` |
| Tests and reliability work | `testing-patterns`, `tdd-workflow`, `webapp-testing` | `.agent/workflows/test.md` |
| Lint/type and validation workflow | `lint-and-validate` | `.agent/workflows/test.md` |
| UI/UX changes | `frontend-design`, `tailwind-patterns`, `web-design-guidelines` | `.agent/workflows/ui-ux-pro-max.md` |
| i18n and locale consistency | `i18n-localization` | `.agent/workflows/enhance.md` |
| Security-sensitive auth/API updates | `vulnerability-scanner`, `red-team-tactics` | `.agent/workflows/debug.md` |
| Performance investigations | `performance-profiling` | `.agent/workflows/test.md` |
| Code quality cleanup / maintainability | `clean-code`, `code-review-checklist` | `.agent/workflows/enhance.md` |
| Windows command generation | `powershell-windows` | `.agent/workflows/status.md` |

### Skill loading protocol

1. Read the selected skill's `SKILL.md` first.
2. Read only relevant sections/scripts for the current request.
3. When multiple skills overlap, prioritize one "primary" skill and keep others as support.
4. Reflect applied skill guidance in implementation and final validation/reporting.

### Intelligent routing policy

- Use `intelligent-routing` as the default request classifier.
- Escalate multi-domain work to orchestration flow (`.agent/workflows/orchestrate.md`).
- Keep routing transparent by stating which specialist perspective is being applied.
- If a referenced skill/workflow is missing from `.agent`, fall back to the closest available skill and note the fallback.

---

## 14. Coding Standards (React/TypeScript)

Để đảm bảo hiệu suất, tính dễ đọc và khả năng bảo trì lâu dài, toàn bộ code mới phải thực hiện theo các nguyên tắc sau:

### 14.1. React Components
- **Ưu tiên Functional Components thuần túy:** 
    - Không sử dụng `React.FC` (hoặc `React.FunctionComponent`) cho các components mới.
    - Khai báo Props explicitly bằng `interface` hoặc `type`.
- **Lý do:** `React.FC` không còn lợi thế thực tế từ React 18+, gây khó khăn khi dùng Generics và làm loãng kiểu dữ liệu.

**Ví dụ Pattern chuẩn:**
```tsx
interface Props {
  title: string;
  onAction?: () => void;
}

// Khuyến khích: Arrow function + explicit props type
const MyComponent = ({ title, onAction }: Props) => {
  return <div onClick={onAction}>{title}</div>;
};

// Khuyến khích: Standard function
function UserProfile({ title }: Props) {
  return <h1>{title}</h1>;
}
```

### 14.2. TypeScript
- **Type-only Imports:** Sử dụng `import type` khi chỉ import interfaces hoặc types (`verbatimModuleSyntax: true`).
- **Strict Typing:** Tuyệt đối không dùng `any`. Sử dụng `unknown` và type narrowing khi cần thiết.

---
