# Route Plan: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-14
- **Reference:** `.agent/artifacts/analysis/2026-05-14__tour-detail__screen-analysis.md`

## 1. Route Registration Plan

### Constants Update
File: `src/routes/routes.ts`
```ts
export const ROUTES = {
    // ... existing routes
    TOURS_DETAIL: '/admin/tours/:id',
} as const;
```

### Router Integration
File: `src/routes/index.tsx`
- **Lazy Load:** `const TourDetail = React.lazy(() => import('@/pages/Tours/TourDetail'));`
- **Route Definition:**
```tsx
{ path: ROUTES.TOURS_DETAIL, element: withSuspense(TourDetail) },
```
- **Guard:** Wrapped within `PrivateRoute` and `MainLayout` (inheritance from existing `/admin/tours` hierarchy).

## 2. Page Skeleton Design

File: `src/pages/Tours/TourDetail/index.tsx`
```tsx
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/common/PageHeader';

export default function TourDetailPage() {
    const { id } = useParams();
    const { t } = useTranslation('tour');

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('detail.title_placeholder')}
                breadcrumbs={[
                    { label: t('title.breadcrumb_parent'), path: '/admin/tours' },
                    { label: t('title.breadcrumb_list'), path: '/admin/tours' },
                    { label: t('title.breadcrumb_detail'), active: true },
                ]}
            />
            
            <div className="flex gap-6">
                {/* Main Column */}
                <div className="flex-1 space-y-6">
                    <div className="h-[320px] bg-slate-100 rounded-2xl animate-pulse" /> {/* Hero Skeleton */}
                    <div className="h-[200px] bg-slate-50 rounded-2xl border border-dashed border-slate-200" /> {/* Description Skeleton */}
                </div>
                
                {/* Sidebar Column */}
                <div className="w-[320px] space-y-4">
                    <div className="h-[400px] bg-slate-50 rounded-2xl border border-slate-100" /> {/* Sidebar Skeleton */}
                </div>
            </div>
        </div>
    );
}
```

## 3. Navigation and i18n Impact

### Sidebar Impact
- No new menu item (as per user context).
- Sidebar correctly highlights the "Quản lý Tour" section because the path starts with `/admin/tours`.

### i18n Key Additions
Namespace: `tour`
File: `public/lang/vi/tour.json`
```json
{
  "title": {
    "breadcrumb_detail": "Chi tiết tour"
  },
  "detail": {
    "title_placeholder": "Đang tải tour...",
    "sections": {
      "hero": "Ảnh & Thông tin nhanh",
      "description": "Mô tả",
      "pricing": "Bảng giá",
      "itinerary": "Lịch trình",
      "services": "Dịch vụ",
      "schedules": "Lịch khởi hành",
      "reviews": "Đánh giá"
    }
  }
}
```

## 4. Files Expected to Change

| File Path | Action | Reason |
|---|---|---|
| `src/routes/routes.ts` | Edit | Register `TOURS_DETAIL` constant. |
| `src/routes/index.tsx` | Edit | Register route with `React.lazy`. |
| `src/pages/Tours/TourDetail/index.tsx` | New | Create page skeleton. |
| `public/lang/vi/tour.json` | Edit | Add translation keys. |
| `public/lang/en/tour.json` | Edit | Add translation keys (sync). |

## 5. Handoff to UI Implementation
- The page skeleton is ready to be populated with real UI components defined in `05-ui-components`.
- Layout 2-column (70/30) is established in the skeleton.
- Path `/admin/tours/:id` is registered and protected.
