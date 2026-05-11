---
name: 02-project-setup
description: Audit project base before implementing a feature. Use when you need a reliable project-level checklist and a reusable audit document for the team.
---

# Skill: 02-project-setup

## Overview

Skill này kiểm tra project base hiện tại để đảm bảo repo đủ điều kiện triển khai feature mới và để lại **audit document có thể tái sử dụng**.
Đây không chỉ là bước "check package", mà là bước khóa nền tảng để các step sau không build trên assumption sai.

## When To Use

- Trước feature lớn đầu tiên trong phiên làm việc
- Khi nghi ngờ base đang lệch stack/rules
- Khi vừa đổi package, route guard, env, axios, hoặc providers
- Khi cần tài liệu audit để onboarding hoặc review

## Required Input

- `persona.md`
- `.agent/rules/PROJECT_RULES.md`
- `package.json`
- `tsconfig.app.json`
- `vite.config.ts`
- `.env.example`
- `src/api/axiosClient.ts`
- `src/providers/index.tsx`
- `src/routes/`

## Recommended Questions To Answer

1. Repo hiện tại có đúng stack như rule đang nói không?
2. Các command chính có còn dùng được không?
3. Cấu trúc `src/` có đang drift với conventions không?
4. Auth/bootstrap/http layer có đang duplicate hoặc thiếu mắt xích nào không?
5. Có blocker nào khiến các bước sau dễ fail hàng loạt không?

## Process

### 1) Dependency And Scripts Audit

Kiểm tra:

- dependencies cốt lõi và version
- scripts cốt lõi
- sự nhất quán giữa package scripts và docs/rules

Phải ghi rõ:

- script nào là quality gate chính
- script nào optional
- script nào được nhắc trong docs nhưng không còn tồn tại

### 2) Repository Shape Audit

So khớp `src/` với `PROJECT_RULES.md`.
Nếu có drift, phải nêu:

- drift ở đâu
- impact tới bước nào trong pipeline
- có cần sửa ngay hay chỉ note

### 3) Config Audit

Rà các file:

- `tsconfig.app.json`
- `vite.config.ts`
- `.env.example`

Phải chỉ ra:

- alias có đúng không
- env vars có đủ không
- config nào có khả năng gây fail build/runtime

### 4) HTTP / Provider / Route Audit

Kiểm tra:

- axios client và interceptors
- auth token attach
- refresh/error handling
- providers wiring
- route bootstrap và ProtectedRoute

Không chỉ ghi "đã có".
Phải nói rõ đang ổn chỗ nào, đáng nghi chỗ nào.

### 5) Audit Result And Next Actions

Tài liệu cuối phải chỉ ra:

- pass/fail từng nhóm
- blocker
- warning
- khuyến nghị bước tiếp theo

## Audit Checklist Nhanh

### Stack thực tế cần verify

```
Framework:    React 19 + Vite + TypeScript
Routing:      react-router-dom v7
Server state: @tanstack/react-query
Client state: zustand
HTTP:         axios + axiosClient interceptor
Styling:      Tailwind CSS v4
Forms:        react-hook-form + yup
i18n:         react-i18next
Icons:        lucide-react, react-icons
Notifications: sonner
Charts:       recharts
Build gate:   npm run prepush:check
```

### Commands phải tồn tại và chạy được

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run build         # Vite build
npm run prepush:check # lint + typecheck + build
npm run preview       # Preview production build
```

### axiosClient phải có

```ts
// src/api/axiosClient.ts — kiểm tra các điểm sau
// ✓ baseURL từ env (VITE_API_BASE_URL)
// ✓ request interceptor gắn Bearer token
// ✓ response interceptor xử lý 401 → logout
// ✓ không hardcode token trong service files
```

### Providers phải wrap đúng thứ tự

```tsx
// src/providers/index.tsx — kiểm tra thứ tự
<QueryClientProvider client={queryClient}>
  <I18nextProvider i18n={i18n}>
    <RouterProvider router={router} />
  </I18nextProvider>
</QueryClientProvider>
```

### ProtectedRoute phải có

```tsx
// src/routes/ — kiểm tra
// ✓ ProtectedRoute component tồn tại
// ✓ Tất cả admin routes đều wrap ProtectedRoute
// ✓ Redirect về /login khi chưa auth
// ✓ useAuthBootstrap được gọi ở root
```

### Vite alias phải đúng

```ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},

// tsconfig.app.json
"paths": {
  "@/*": ["./src/*"]
}
// Hai file phải khớp nhau
```

## Output Document

Tạo file:

- `.agent/artifacts/audits/YYYY-MM-DD__<feature-slug>__project-audit.md`

Nếu audit không gắn với một feature cụ thể, dùng `project-base` làm `feature-slug`.

Template:

- `template_project_audit.md`

## Strict Rules

- Không đổi stack ở bước này nếu user chưa yêu cầu
- Không refactor ngoài phạm vi audit
- Nếu phát hiện lỗi, nêu rõ:
  - triệu chứng
  - mức ảnh hưởng
  - hướng fix nhỏ nhất
- Không báo "ổn" nếu chưa kiểm thực tế file/config liên quan

## Red Flags

Nếu thấy những dấu hiệu sau, phải flag trong audit:

- `axiosClient` không có interceptor → mọi service phải tự gắn token thủ công
- `ProtectedRoute` không wrap tất cả admin routes → route bị hở
- `tsconfig.app.json` và `vite.config.ts` alias không khớp → import `@/` bị lỗi
- `npm run prepush:check` không tồn tại → không có quality gate trước push
- `useAuthBootstrap` không được gọi ở root → user bị logout khi refresh page
- `.env.example` thiếu `VITE_API_BASE_URL` → dev mới không biết cần set gì

## Documentation Expectations

Audit report tốt phải có:

- summary (mục tiêu audit, verdict ready/not ready)
- dependency audit (version thực tế vs expected)
- repository shape audit (drift nếu có)
- config audit (alias, env vars)
- http/auth bootstrap audit (interceptor, providers, routes)
- risks/gaps
- next actions

## Verification

- Đối chiếu `checklist.md`
- Report Pass/Fail từng mục
- Audit report phải giúp người đọc biết: `có thể triển khai tiếp ngay hay cần sửa nền trước`
