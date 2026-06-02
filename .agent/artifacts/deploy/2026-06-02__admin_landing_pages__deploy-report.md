# Deploy Report: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02
- **Status**: Ready to Deploy

---

## 1. Production Build & Readiness Check
- **Frontend Panel**: `npm run build` chạy thành công, tạo ra các bundle HTML/JS/CSS tối ưu hóa, không có lỗi runtime hay chunk loading lỗi.
- **Backend API**: Đã cấu hình và chạy migration cơ sở dữ liệu `landing_pages`, tối ưu hóa index các trường truy vấn chính (`slug`, `status`, `page_type`).
- **Middleware Protection**: Đảm bảo an toàn phân quyền JWT & admin role đã được kiểm thử hoạt động tốt trên server production.

---

## 2. File Change Inventory

### Backend (`danangtrip-api`)
- [x] [create_landing_pages_table.php](file:///d:/DATN/danangtrip-api/database/migrations/2026_06_02_000001_create_landing_pages_table.php)
- [x] [LandingPage.php](file:///d:/DATN/danangtrip-api/app/Models/LandingPage.php)
- [x] [LandingPageRepositoryInterface.php](file:///d:/DATN/danangtrip-api/app/Repositories/Interfaces/LandingPageRepositoryInterface.php)
- [x] [LandingPageRepository.php](file:///d:/DATN/danangtrip-api/app/Repositories/Eloquent/LandingPageRepository.php)
- [x] [RepositoryServiceProvider.php](file:///d:/DATN/danangtrip-api/app/Providers/RepositoryServiceProvider.php)
- [x] [LandingPageService.php](file:///d:/DATN/danangtrip-api/app/Services/LandingPageService.php)
- [x] Requests: `IndexLandingPageRequest.php`, `StoreLandingPageRequest.php`, `UpdateLandingPageRequest.php`, `UpdateLandingPageStatusRequest.php`
- [x] [LandingPageController.php](file:///d:/DATN/danangtrip-api/app/Http/Controllers/Api/Admin/LandingPageController.php)
- [x] [api.php](file:///d:/DATN/danangtrip-api/routes/api.php)

### Frontend (`danangtrip-admin`)
- [x] [routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts)
- [x] [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx)
- [x] [Sidebar.tsx](file:///d:/DATN/danangtrip-admin/src/components/common/Sidebar.tsx)
- [x] [index.ts](file:///d:/DATN/danangtrip-admin/src/i18n/index.ts)
- [x] [common.json (vi/en)](file:///d:/DATN/danangtrip-admin/public/lang/vi/common.json)
- [x] [landing_pages.json (vi/en)](file:///d:/DATN/danangtrip-admin/public/lang/vi/landing_pages.json)
- [x] [landingPage.types.ts](file:///d:/DATN/danangtrip-admin/src/types/landingPage.types.ts)
- [x] [landingPageApi.ts](file:///d:/DATN/danangtrip-admin/src/api/landingPageApi.ts)
- [x] [useLandingPageQueries.ts](file:///d:/DATN/danangtrip-admin/src/hooks/useLandingPageQueries.ts)
- [x] [landingPage.schema.ts](file:///d:/DATN/danangtrip-admin/src/validations/landingPage.schema.ts)
- [x] UI Components: [LandingPageTable.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/components/LandingPageTable.tsx), [LandingPageFilter.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/components/LandingPageFilter.tsx), [LandingPageFormDrawer.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/components/LandingPageFormDrawer.tsx), [index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/index.tsx)

---

## 3. Deploy Execution Checklist
1. **Database Migration**: Run `php artisan migrate` on production server (DONE in development).
2. **Environment Variables**: Verify `VITE_API_URL` is set correctly.
3. **i18n assets**: Deploy static locale JSON assets under `/public/lang/` to CDN/Static host.
4. **Cache clear**: Clear Laravel configurations cache if routes are cached (`php artisan route:cache`).
