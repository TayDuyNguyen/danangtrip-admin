# Data Integration Plan: location-categories

- **Date**: 2026-05-13
- **Feature Slug**: `location-categories`
- **Hook Layer**: `useCategoryQueries.ts`

---

## 1. Service Layer

| Service Method | Purpose | Trigger |
|---|---|---|
| `categoryApi.getList` | Lấy danh sách category + stats | Page load, search, filter |
| `categoryApi.getDetail` | Lấy chi tiết category | Detail/edit refresh when needed |
| `categoryApi.create` | Tạo category | Submit add form |
| `categoryApi.update` | Cập nhật category | Submit edit form |
| `categoryApi.delete` | Xóa category | Confirm delete |
| `categoryApi.patchStatus` | Bật/tắt trạng thái | Status chip click |
| `categoryApi.reorder` | Lưu thứ tự mới | Save reorder bar |

---

## 2. Query Strategy

### Query Keys

```ts
const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};
```

### List Query Notes

- Screen passes:
  - `search`
  - `status`
  - `per_page: 100`
  - `with_stats: true`
- API response is normalized into:
  - `items`
  - `stats`
  - `meta`

---

## 3. Mutation Strategy

| Mutation | Action | Invalidation | Feedback |
|---|---|---|---|
| `createMutation` | `POST /admin/categories` | `categoryKeys.lists()` | Success toast or backend error toast |
| `updateMutation` | `PUT /admin/categories/{id}` | `categoryKeys.lists()`, `categoryKeys.detail(id)` | Success toast or backend error toast |
| `deleteMutation` | `DELETE /admin/categories/{id}` | `categoryKeys.lists()` | Success toast or backend error toast |
| `statusMutation` | `PATCH /admin/categories/{id}/status` | `categoryKeys.lists()` | Success toast or backend error toast |
| `reorderMutation` | `PATCH /admin/categories/reorder` | `categoryKeys.lists()` | Success toast or backend error toast |

---

## 4. UI State Handling

### Page
- Initial loading: `LoadingReact`
- Fatal load error: centered retry panel
- Empty result: card-style empty state

### Form
- Save button disabled while pending
- `react-hook-form` + `yup` field validation
- Backend save failures surfaced through toast

### Reorder
- Uses full loaded dataset
- Save button writes `[{ id, sort_order }]`
- Mode closes on success

---

## 5. Integration Notes

1. Backend default pagination is `15`, so the screen must explicitly request `100`.
2. Reorder correctness depends on loading the full intended list.
3. `icon_background` is a required schema dependency between frontend form and backend DB.
