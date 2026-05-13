# UI Spec: location-categories

- **Date**: 2026-05-13
- **Feature Slug**: `location-categories`
- **Design Reference**: `Tours > Categories`
- **Design System**: Accent `#14B8A6`, rounded `32px/24px`, white cards, soft shadows.

---

## 1. Reuse / New / Mod Matrix

| Component | Layer | Path | Status | Reason |
|---|---|---|---|---|
| `CustomSelect` | Atom | `src/components/ui/CustomSelect.tsx` | ♻️ [REUSE] | Search/filter form controls |
| `Drawer` | Organism | `src/components/ui/Drawer.tsx` | ♻️ [REUSE] | Add/Edit drawer shell |
| `LoadingReact` | Organism | `src/components/loading/index.tsx` | ♻️ [REUSE] | Initial loading state |
| `CategoryHeader` | Organism | `src/pages/Locations/LocationCategories/components/CategoryHeader.tsx` | ✨ [NEW] | Screen header + breadcrumb + primary CTA |
| `CategoryGrid` | Organism | `src/pages/Locations/LocationCategories/components/CategoryGrid.tsx` | ✨ [NEW] | Grid/list wrapper for cards and reorder mode |
| `CategoryCard` | Organism | `src/pages/Locations/LocationCategories/components/CategoryCard.tsx` | ✨ [NEW] | Visual card for one location category |
| `CategoryFormModal` | Organism | `src/pages/Locations/LocationCategories/components/CategoryFormModal.tsx` | ✨ [UPDATED] | Drawer form with icon browser and color picker |
| `CategoryDeleteDialog` | Organism | `src/pages/Locations/LocationCategories/components/CategoryDeleteDialog.tsx` | ♻️ [REUSE] | Delete confirmation |

---

## 2. Screen Composition

### A. Header
- Breadcrumb: `Dashboard > Locations > Danh mục Địa điểm`
- Title + subtitle
- Primary CTA: `Thêm danh mục`

### B. Stats Row
- `Tổng danh mục`
- `Đang hoạt động`
- `Tạm dừng`

### C. Filter Bar
- Search input with debounce
- Status dropdown: `all / active / inactive`
- Reorder toggle button
- Summary badge showing total loaded results

### D. CategoryGrid
- Default mode: responsive card grid
- Reorder mode: vertical drag/drop list using `framer-motion`
- Empty state: centered panel with icon + subtitle

### E. Floating Reorder Bar
- Appears only during reorder mode
- Includes cancel + save actions

### F. Form Drawer
- `name`
- `slug`
- `icon`
- `icon_background`
- `description`
- `status`
- `image`
- `sort_order` shown as read-only display position

---

## 3. UI States Contract

| State | Handling |
|---|---|
| **Initial Loading** | `LoadingReact` |
| **Load Error** | Centered error panel with retry action |
| **Empty** | Card-style empty state |
| **Submitting** | Save button disabled with inline spinner |
| **Mutation Error** | Toast with backend message |
| **Reorder Active** | Floating action bar at bottom center |

---

## 4. Visual Standards & Interactions

- **Card Radius**: `rounded-[32px]`
- **Primary Accent**: `#14B8A6`
- **Icon Preview**: uses selected `icon_background`
- **Progress Rail**: visual count indicator based on `locationsCount`
- **Reorder Restriction**: reorder button disabled while search/filter is active
- **Responsive**:
  - Desktop: `1 / 2 / 3` card columns
  - Reorder: always vertical stack

---

## 5. Files in Scope

- `src/pages/Locations/LocationCategories/index.tsx`
- `src/pages/Locations/LocationCategories/components/CategoryHeader.tsx`
- `src/pages/Locations/LocationCategories/components/CategoryGrid.tsx`
- `src/pages/Locations/LocationCategories/components/CategoryCard.tsx`
- `src/pages/Locations/LocationCategories/components/CategoryFormModal.tsx`
- `src/pages/Locations/LocationCategories/components/CategoryDeleteDialog.tsx`
