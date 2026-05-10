# Checklist: 04-layout-routing

- [ ] Page skeleton tạo đúng `src/pages/<Feature>/index.tsx`.
- [ ] Route đăng ký đúng trong `src/routes/`.
- [ ] Route wrap ProtectedRoute nếu admin-only.
- [ ] React.lazy + Suspense cho page-level code splitting.
- [ ] Route path: lowercase, kebab-case.
- [ ] Không có data fetching trong page skeleton.
- [ ] i18n keys thêm cho menu/breadcrumb/page title.
- [ ] Cập nhật cả vi và en locale files cùng lúc.
- [ ] Sidebar/menu item thêm đúng route path và icon (lucide-react).
