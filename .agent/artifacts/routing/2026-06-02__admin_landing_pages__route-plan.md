# Route Plan: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02
- **Main Route**: `/admin/landing-pages`

---

## 1. Route Constant Definition

Đã thêm hằng số `LANDING_PAGES` trong tệp [routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts):
```typescript
export const ROUTES = {
    ...
    SETTINGS: '/admin/settings',
    PROMOTIONS: '/admin/promotions',
    LANDING_PAGES: '/admin/landing-pages',
} as const;
```

---

## 2. Router Wiring & Lazy Loading

Tuyến đường `/admin/landing-pages` được đăng ký là một route bảo vệ bên trong `PrivateRoute` ở tệp [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx).
- Component được load lazy bằng `React.lazy()` để giảm dung lượng file bundle ban đầu.
- Được bao bọc trong component `withSuspense` để hiển thị `PageLoader` spinner khi đang tải component.

```typescript
const LandingPages = React.lazy(() => import('@/pages/LandingPages'));

...
{ path: ROUTES.LANDING_PAGES, element: withSuspense(LandingPages) },
```

---

## 3. Navigation Sidebar Link

Đã tích hợp vào component [Sidebar.tsx](file:///d:/DATN/danangtrip-admin/src/components/common/Sidebar.tsx) nằm dưới menu Khuyến mãi:
- Sử dụng icon `Globe` từ thư viện `lucide-react`.
- Tự động thay đổi trạng thái css active dựa trên `location.pathname` trùng khớp với `ROUTES.LANDING_PAGES`.

```typescript
{ icon: Globe, label: 'sidebar.landing_pages', path: ROUTES.LANDING_PAGES }
```

---

## 4. i18n Namespace & Locales

- Đã đăng ký namespace `landing_pages` trong tệp [index.ts](file:///d:/DATN/danangtrip-admin/src/i18n/index.ts).
- Các tệp bản dịch đã được tạo mới hoàn thiện:
  - Tiếng Việt: [landing_pages.json](file:///d:/DATN/danangtrip-admin/public/lang/vi/landing_pages.json)
  - Tiếng Anh: [landing_pages.json](file:///d:/DATN/danangtrip-admin/public/lang/en/landing_pages.json)
- Các khóa sidebar được dịch trong [common.json (vi)](file:///d:/DATN/danangtrip-admin/public/lang/vi/common.json) và [common.json (en)](file:///d:/DATN/danangtrip-admin/public/lang/en/common.json):
  - Vi: `"sidebar.landing_pages": "Quản lý Landing Pages"`
  - En: `"sidebar.landing_pages": "Landing Pages"`
