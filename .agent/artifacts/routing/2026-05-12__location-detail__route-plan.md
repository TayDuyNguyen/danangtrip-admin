# Route Plan: location-detail

## 1. Route Scope

- Target Path: `/admin/locations/detail/:id`
- Route Name: `LOCATIONS_DETAIL`
- Guard: `PrivateRoute`
- Layout: `MainLayout`
- Entry: `src/pages/Locations/LocationDetail/index.tsx`

---

## 2. Route Registration Reality

### `src/routes/routes.ts`
```ts
export const ROUTES = {
  LOCATIONS_LIST: '/admin/locations',
  LOCATIONS_EDIT: '/admin/locations/edit/:id',
  LOCATIONS_DETAIL: '/admin/locations/detail/:id',
} as const;
```

### `src/routes/index.tsx`
- `LocationDetail` is lazy loaded.
- The route is registered under the protected admin route tree.

---

## 3. Navigation Contract

| From | Trigger | Target |
|---|---|---|
| Locations list | View action | `ROUTES.LOCATIONS_DETAIL.replace(':id', id)` |
| Detail header | Edit action | `ROUTES.LOCATIONS_EDIT.replace(':id', id)` |
| Detail header / error state | Back action | `ROUTES.LOCATIONS_LIST` |
| Delete success | Mutation success callback | `ROUTES.LOCATIONS_LIST` |

---

## 4. Page Structure

| File | Responsibility |
|---|---|
| `components/DetailHeader.tsx` | Top actions and page identity |
| `components/DetailHero.tsx` | Visual summary and media |
| `components/DetailTabs.tsx` | Local tab state handoff |
| `components/LocationInfoTab.tsx` | General information tab |
| `components/LocationReviewsTab.tsx` | Reviews tab |
| `components/LocationMapTab.tsx` | Map tab |
| `components/DetailSidebar.tsx` | Management and stats |

---

## 5. Notes

- This route is intentionally separate from edit and should not reuse the edit path.
- The route depends on a dynamic `:id` URL segment and expects the page to handle missing/invalid entities through retry + back UI.

---
Created at: 2026-05-12  
Updated at: 2026-05-12  
Source: current route implementation
