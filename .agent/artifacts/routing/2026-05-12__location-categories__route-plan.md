# Route Plan: location-categories

- **Date**: 2026-05-12
- **Feature Slug**: `location-categories`
- **Module**: Locations
- **Status**: Ready for Implementation

---

## 1. Target Routes

Đăng ký route mới trong hệ thống `react-router-dom`.

| Path | Component | Guard | Layout |
|---|---|---|---|
| `/admin/locations/categories` | `LocationCategories` | `PrivateRoute` (Admin) | `MainLayout` |

---

## 2. Page Skeleton Plan

Tạo file skeleton tại `src/pages/Locations/LocationCategories/index.tsx`.

### Cấu trúc dự kiến:
- **Header Section**: Tiêu đề trang và nút "Thêm danh mục".
- **Stat Cards**: (Optional) Tổng số danh mục, danh mục đang hoạt động.
- **Table Section**: Danh sách danh mục với các cột: ID, Tên, Slug, Trạng thái, Thao tác.
- **Modal Section**: Placeholder cho `CategoryFormModal`.

```tsx
// src/pages/Locations/LocationCategories/index.tsx
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/common/Breadcrumb';
import { ROUTES } from '@/routes/routes';

export default function LocationCategories() {
    const { t } = useTranslation(['location', 'common']);

    return (
        <div className="space-y-6">
            <Breadcrumb 
                items={[
                    { label: t('sidebar.dashboard', { ns: 'common' }), href: ROUTES.DASHBOARD },
                    { label: t('sidebar.locations', { ns: 'common' }), href: ROUTES.LOCATIONS_LIST },
                    { label: t('sidebar.location_categories', { ns: 'common' }), current: true },
                ]} 
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">{t('categories.title')}</h1>
                    <p className="text-slate-500 text-sm font-medium">{t('categories.subtitle')}</p>
                </div>
                <button className="btn-primary">
                    {t('categories.add_new')}
                </button>
            </div>

            {/* Skeleton Table */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
                <div className="h-64 bg-slate-50 rounded-2xl" />
            </div>
        </div>
    );
}
```

---

## 3. Navigation & i18n Impact

### Sidebar
- Đã có sẵn entry trong `src/components/common/Sidebar.tsx` trỏ tới `ROUTES.LOCATIONS_CATEGORIES`.

### Locale Updates (`location.json`)
Cần bổ sung các key sau:

```json
{
    "categories": {
        "title": "Danh mục Địa điểm",
        "subtitle": "Quản lý các loại hình địa điểm du lịch trên hệ thống",
        "add_new": "Thêm danh mục",
        "edit": "Sửa danh mục",
        "table": {
            "name": "Tên danh mục",
            "slug": "Đường dẫn",
            "status": "Trạng thái",
            "actions": "Thao tác"
        }
    }
}
```

---

## 4. Files to Change

1.  **`src/routes/index.tsx`**: Đăng ký lazy load và route entry.
2.  **`src/pages/Locations/LocationCategories/index.tsx`**: (Tạo mới) Skeleton page.
3.  **`public/lang/vi/location.json`**: Cập nhật bản dịch tiếng Việt.
4.  **`public/lang/en/location.json`**: Cập nhật bản dịch tiếng Anh.

---

## 5. Verification Steps

1.  Kiểm tra `npm run dev` không có lỗi compile.
2.  Truy cập `/admin/locations/categories`.
3.  Xác nhận `MainLayout` hiển thị đúng và Sidebar highlight mục "Danh mục".
4.  Xác nhận Breadcrumb hiển thị đúng cấu trúc.
