---
name: 04-layout-routing
description: Plan route, layout, navigation, and page skeleton before wiring data. Use when a feature adds or changes screens, menu items, or protected routes.
---

# Skill: 04-layout-routing

## Overview

Skill này dùng để lập kế hoạch route, layout, breadcrumb, menu, và page skeleton cho feature mới trong admin.
Đây là bước giúp tránh việc code UI xong mới phát hiện route sai, i18n thiếu, hoặc guard chưa hợp lý.

## Required Input

- `persona.md`
- `.agent/rules/PROJECT_RULES.md`
- `src/routes/`
- `src/layouts/`
- `src/pages/Tours/index.tsx`
- `src/pages/Locations/`
- Analysis file từ `01-screen-analysis`

## Recommended Questions To Answer

1. Feature này là page mới, sub-page, hay chỉ là biến thể của route cũ?
2. Route path nên theo naming nào?
3. Có cần guard không?
4. Có cần menu item / breadcrumb mới không?
5. Có cần skeleton page trước khi wiring data không?

## Process

### 1) Route Scope Review

Xác định:

- route mới hay route cũ
- path convention
- auth/guard requirement
- layout chain

### 2) Page Skeleton Planning

Phải chỉ ra:

- page file nào cần có
- section chính của page
- component nào chỉ là placeholder ở bước này

### 3) Navigation And i18n Planning

Ghi rõ:

- breadcrumb text
- menu label
- icon (lucide-react)
- locale keys cần thêm

### 4) Route Registration Planning

Mô tả:

- file route config nào bị ảnh hưởng
- route đăng ký theo pattern nào
- nếu protected, guard sẽ ở đâu

### 5) Handoff Notes

Route plan nên để bước UI/data sau nhìn vào biết:

- page skeleton nằm ở đâu
- route nào đã active
- text/key nào cần sync

## Pattern Chuẩn Của Repo

### Route registration pattern — react-router-dom v7

```tsx
// src/routes/index.tsx — bám pattern hiện tại
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';

// Lazy load page-level — code splitting
const ToursPage = lazy(() => import('@/pages/Tours'));
const TourCreatePage = lazy(() => import('@/pages/Tours/TourCreate'));
const TourEditPage = lazy(() => import('@/pages/Tours/TourEdit'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,  // Guard ở route level
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'tours',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <ToursPage />
              </Suspense>
            ),
          },
          {
            path: 'tours/create',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <TourCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'tours/:id/edit',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <TourEditPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
```

### Page skeleton — không fetch data

```tsx
// src/pages/Tours/index.tsx — skeleton trước khi wire data
import { useTranslation } from 'react-i18next';

export default function ToursPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('tour.pageTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('tour.pageDesc')}</p>
        </div>
        <button className="btn-primary">
          {t('tour.addNew')}
        </button>
      </div>

      {/* Filter bar placeholder */}
      <div className="h-10 bg-muted rounded animate-pulse" />

      {/* Table placeholder */}
      <div className="h-64 bg-muted rounded animate-pulse" />
    </div>
  );
}
```

### Breadcrumb pattern

```tsx
// src/components/common/Breadcrumb.tsx — reuse component này
<Breadcrumb
  items={[
    { label: t('nav.dashboard'), href: '/' },
    { label: t('nav.tours'), href: '/tours' },
    { label: t('tour.create'), current: true },
  ]}
/>
```

### Sidebar menu item

```tsx
// src/layouts/Sidebar.tsx — thêm menu item theo pattern
const menuItems = [
  {
    label: t('nav.tours'),
    href: '/tours',
    icon: MapIcon,          // lucide-react
    active: pathname.startsWith('/tours'),
  },
  // ...
];
```

### i18n keys pattern

```json
// src/locales/vi/tour.json
{
  "pageTitle": "Quản lý Tour",
  "pageDesc": "Danh sách tất cả tour du lịch",
  "addNew": "Thêm tour mới",
  "nav": {
    "list": "Danh sách",
    "create": "Thêm mới",
    "edit": "Chỉnh sửa"
  }
}

// src/locales/en/tour.json — phải sync đồng thời
{
  "pageTitle": "Tour Management",
  "pageDesc": "List of all tours",
  "addNew": "Add New Tour",
  "nav": {
    "list": "List",
    "create": "Create",
    "edit": "Edit"
  }
}
```

## Output Document

Tạo file:

- `.agent/artifacts/routing/YYYY-MM-DD__<feature-slug>__route-plan.md`

Template:

- `template_route_plan.md`

## Strict Rules

- Route path phải lowercase, kebab-case: `/tours`, `/tours/create`, `/tours/:id/edit`
- Không fetch data ở bước page skeleton
- Cập nhật cả `vi` và `en` locale khi thêm text mới
- Nếu route bị guard, phải ghi rõ lý do và role
- Không tạo menu/link visible tới page chưa tồn tại
- Mọi page-level component phải lazy-load với `React.lazy`

## Red Flags

Nếu thấy những dấu hiệu sau, phải dừng và flag:

- Route path dùng camelCase hoặc PascalCase (`/tourCreate`) → không nhất quán
- Page component không lazy-load → tăng initial bundle
- Guard đặt trong component thay vì route level → dễ bị bypass
- i18n chỉ thêm vào `vi` mà quên `en` → broken UI khi switch language
- Menu item link tới route chưa đăng ký → 404

## Common Rationalizations

| Lý do hay gặp | Thực tế |
|---|---|
| "Route đơn giản, không cần lazy-load" | Mỗi page thêm vào initial bundle — lazy-load là default cho admin |
| "Guard trong component cho tiện" | Route-level guard rõ ràng hơn, không bị bỏ sót khi thêm route mới |
| "i18n thêm sau" | Khi thêm sau, dễ bỏ sót key — thêm ngay khi tạo route |

## Documentation Expectations

Route plan tốt phải có:

- target routes (path, guard, layout)
- page structure (files cần tạo)
- navigation/breadcrumb impact
- locale update impact (keys cần thêm)
- files expected to change

## Verification

- Đối chiếu `checklist.md`
- Route plan phải chỉ ra đủ file liên quan và i18n keys cần thêm
- Người đọc phải biết route này sẽ được cắm vào app như thế nào
