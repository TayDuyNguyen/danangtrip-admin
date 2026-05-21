# Screen Analysis: Danh mục Địa điểm

- **Date**: 2026-05-13
- **Feature Slug**: `location-categories`
- **Module**: Locations
- **Status**: Updated After Implementation

---

## 1. Summary and Scope

| Attribute | Details |
|---|---|
| **Screen Name** | Danh mục Địa điểm |
| **Route** | `/admin/locations/categories` |
| **Actor** | Admin |
| **Business Goal** | Quản lý loại hình địa điểm, trạng thái hiển thị, thứ tự hiển thị, icon, và màu nền icon |
| **Parent Module** | Locations |

---

## 2. Current Screen Architecture

| Component | Layer | Path | Status | Purpose |
|---|---|---|---|---|
| `CategoryHeader` | Organism | `src/pages/Locations/LocationCategories/components/CategoryHeader.tsx` | Live | Header + breadcrumb + CTA |
| `CategoryGrid` | Organism | `src/pages/Locations/LocationCategories/components/CategoryGrid.tsx` | Live | Grid/list orchestration |
| `CategoryCard` | Organism | `src/pages/Locations/LocationCategories/components/CategoryCard.tsx` | Live | One category visual unit |
| `CategoryFormModal` | Organism | `src/pages/Locations/LocationCategories/components/CategoryFormModal.tsx` | Live | Add/Edit drawer |
| `CategoryDeleteDialog` | Organism | `src/pages/Locations/LocationCategories/components/CategoryDeleteDialog.tsx` | Live | Delete confirm |

Removed from the live design:

- `CategoryTable`

---

## 3. Data Behavior

### Main Fields in Use

| Field | Purpose |
|---|---|
| `name` | Card title / form field |
| `slug` | Secondary identifier |
| `icon` | Icon preview + card visual |
| `icon_background` | Icon chip background |
| `description` | Edit form content |
| `image` | Optional image URL |
| `sort_order` | Display order and reorder persistence |
| `status` | Filter + toggle |
| `locations_count` | Card metric |

### API Endpoints in Use

- `GET /admin/categories`
- `GET /admin/categories/{id}`
- `POST /admin/categories`
- `PUT /admin/categories/{id}`
- `DELETE /admin/categories/{id}`
- `PATCH /admin/categories/{id}/status`
- `PATCH /admin/categories/reorder`

---

## 4. Key Operational Rules

1. Screen requests `per_page = 100` to load the full category set.
2. Reorder is disabled while search or status filter is active.
3. `icon_background` must exist in DB schema for create/update to succeed.
4. Mutation failures are surfaced to the user via toast from backend messages.

---

## 5. Known Risks

- Live browser verification is still recommended after deploy/refresh because the screen now depends on the full 100-item payload for reorder accuracy.
- PHP environment still emits `imagick` startup warning, but it does not block this screen.
