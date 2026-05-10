# Skill: 04-layout-routing (Xây dựng Layout & Route)

## 0) Tuyên bố tự mô tả
Skill này tạo route, page skeleton, và đăng ký layout cho feature mới trong admin — dùng react-router-dom v7.

## 1) Goal
- Tạo page component skeleton (không data, không logic).
- Đăng ký route trong router config.
- Đảm bảo route guard đúng (admin-only).
- Thêm i18n keys cho menu/breadcrumb.

## 2) Persona
Đóng vai: **Senior Software Engineer**.

## 3) Input & Context (must read first)
- `.agent/rules/PROJECT_RULES.md` (Sections 3, 4)
- `src/routes/` — router setup hiện có + ProtectedRoute
- `src/layouts/` — AdminLayout, AuthLayout
- `src/pages/Tours/index.tsx` — page structure pattern mẫu
- `src/pages/Locations/` — pattern mẫu thứ 2

## 4) Workflow

### 4.1 Page Skeleton
1. Tạo `src/pages/<Feature>/index.tsx` với:
   - Import AdminLayout (nếu chưa wrap ở router level)
   - Breadcrumb component
   - Page title (i18n)
   - Placeholder sections (TODO comments cho từng organism)
2. KHÔNG fetch data ở bước này — chỉ structure.

### 4.2 Route Registration
3. Thêm route vào router config trong `src/routes/`:
   - Wrap với ProtectedRoute nếu admin-only
   - Dùng lazy import cho code splitting
4. Path convention: `/admin/<feature>` (lowercase, kebab-case).

### 4.3 i18n Keys
5. Thêm i18n keys cho:
   - Menu item label
   - Page title / breadcrumb
   - Thêm vào cả vi và en locale files cùng lúc.

### 4.4 Navigation
6. Nếu có sidebar/menu → thêm menu item với đúng route path và icon (lucide-react).

## 5) Strict Rules
- Dùng `React.lazy` + `Suspense` cho page-level code splitting.
- Route path lowercase, kebab-case.
- KHÔNG viết data fetching trong page skeleton.
- i18n: cập nhật cả vi và en cùng lúc.

## 6) Output specification
- `src/pages/<Feature>/index.tsx`
- Cập nhật `src/routes/` (route registration)
- Cập nhật i18n locale files (vi + en)
- Cập nhật sidebar/menu nếu cần
