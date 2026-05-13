# API Contract: location-categories

- **Date**: 2026-05-13
- **Feature Slug**: `location-categories`
- **Module**: Locations
- **Status**: Updated To Match Live Implementation

---

## 1. Source Reconciliation

| Source | Info | Status |
|---|---|---|
| Frontend API module | `src/api/categoryApi.ts` | ✅ Match |
| Frontend screen | `src/pages/Locations/LocationCategories/index.tsx` | ✅ Match |
| Backend routes | `routes/api.php` | ✅ Match |
| Backend requests/service/repository | Admin category stack | ✅ Match |

---

## 2. Data Models

### RawCategory

```ts
export interface RawCategory {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    icon_background?: string | null;
    description: string | null;
    image: string | null;
    sort_order: number | null;
    locations_count?: number | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    subcategories?: RawSubcategory[];
}
```

### Category ViewModel

```ts
export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    iconBackground: string;
    description: string | null;
    image: string | null;
    sortOrder: number;
    locationsCount: number;
    status: 'active' | 'inactive';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    subcategories: Subcategory[];
}
```

---

## 3. List Response Shape

### Supported Admin Response

When `with_stats=true`, frontend expects:

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "categories": {
      "current_page": 1,
      "data": [],
      "per_page": 100,
      "total": 100
    },
    "stats": {
      "total_categories": 100,
      "active_categories": 80,
      "inactive_categories": 20,
      "total_locations": 450
    }
  }
}
```

Frontend normalizes this into:

```ts
{
  items: Category[];
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
```

---

## 4. API Module Plan

| Method | Endpoint | Params/Payload | Notes |
|---|---|---|---|
| `getList` | `GET /admin/categories` | `search`, `status`, `per_page`, `with_stats` | Screen now requests `per_page: 100` |
| `getDetail` | `GET /admin/categories/{id}` | — | Returns one category |
| `create` | `POST /admin/categories` | `CategoryInput` | Supports `icon_background` |
| `update` | `PUT /admin/categories/{id}` | `CategoryInput` | Supports `icon_background` |
| `delete` | `DELETE /admin/categories/{id}` | — | Hard delete |
| `patchStatus` | `PATCH /admin/categories/{id}/status` | `{ status }` | Returns updated category |
| `reorder` | `PATCH /admin/categories/reorder` | `{ items: [{ id, sort_order }] }` | Bulk reorder |

---

## 5. Validation Contract

| Field | Rules |
|---|---|
| `name` | required, max(255) |
| `slug` | required, lowercase, `^[a-z0-9-]+$` |
| `status` | required, `active/inactive` |
| `sort_order` | number, min(0) |
| `icon` | nullable string |
| `icon_background` | nullable string, default `#E0F2FE` |
| `image` | nullable string |

---

## 6. Important Notes

1. Backend default pagination is `15`, but this screen explicitly requests `100`.
2. `icon_background` requires DB migration `2026_05_13_000001_add_icon_background_to_categories_table`.
3. Reorder should be treated as valid only when the full intended dataset is loaded.
