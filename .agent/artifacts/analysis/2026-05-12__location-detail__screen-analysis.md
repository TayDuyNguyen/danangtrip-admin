# Screen Analysis: location-detail

## 1. Summary and Scope

| Attribute | Value |
|---|---|
| Screen Name | `LocationDetail` |
| Feature Slug | `location-detail` |
| Module | Locations |
| Primary Actor | Admin / Staff |
| Objective | Provide a read-focused admin detail page for one location with quick management actions and review/map visibility. |
| Route | `/admin/locations/detail/:id` |
| Screen Type | Detail dashboard with edit/delete/status controls |

---

## 2. Current Implementation Shape

### Actual Entry Files
| File | Role |
|---|---|
| `src/pages/Locations/LocationDetail/index.tsx` | Page composition and loading/error handling |
| `src/pages/Locations/LocationDetail/components/DetailHeader.tsx` | Breadcrumbs, title, edit/delete actions |
| `src/pages/Locations/LocationDetail/components/DetailHero.tsx` | Gallery hero and top-level summary |
| `src/pages/Locations/LocationDetail/components/DetailTabs.tsx` | Local tab switcher (`info`, `reviews`, `map`) |
| `src/pages/Locations/LocationDetail/components/LocationInfoTab.tsx` | Description, contact info, price range, amenities |
| `src/pages/Locations/LocationDetail/components/LocationReviewsTab.tsx` | Review distribution and review list |
| `src/pages/Locations/LocationDetail/components/LocationMapTab.tsx` | Coordinates and embedded Google Maps view |
| `src/pages/Locations/LocationDetail/components/DetailSidebar.tsx` | Stats, featured toggle, status action, danger zone |
| `src/components/loading/LocationDetailSkeleton.tsx` | Full-page loading state |

### Layout Reality
- Desktop: `lg:grid-cols-12` with `8 / 4` split.
- Mobile/tablet: stacked content and sidebar.
- Detail content is tabbed, not multi-section on one long page.

---

## 3. Data and State Reality

| Concern | Current Source |
|---|---|
| Main entity | `useLocationDetailQuery(id)` |
| Delete action | `useDeleteLocationMutation()` |
| Featured toggle | `useUpdateLocationFeaturedMutation()` |
| Status change | `useBulkLocationActionsMutation()` with single-id payload |
| Route param | `useParams<{ id: string }>()` |
| Query invalidation | list, stats, district, and `locationKeys.detail(id)` after mutations |

### ViewModel Fields Used
- `id`, `name`, `status`, `isFeatured`
- `district`, `address`, `phone`, `email`, `website`
- `description`, `openingHours`
- `priceMin`, `priceMax`, `priceLevelKey`
- `images`
- `latitude`, `longitude`
- `amenities`
- `viewCount`, `favoriteCount`, `ratingAverage`, `reviewCount`
- `reviewStats`, `recentReviews`

---

## 4. UI States

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Page | `LocationDetailSkeleton` | N/A | `ErrorWidget` with retry + back action | Full detail page |
| Gallery | Hero skeleton | `detail.hero.no_images` text card | Fallback same as empty | Main image + thumbnails |
| Description | Page skeleton | `detail.info.no_description` | N/A | Plain text description |
| Amenities | Page skeleton | `detail.info.no_amenities` | N/A | Badge list from API |
| Map | Page skeleton | `detail.map.no_coordinates` | N/A | Google Maps iframe |
| Reviews | Page skeleton | `detail.reviews.empty` | N/A | Distribution + review items |

---

## 5. Business Rules and Edge Cases

### Business Rules
- Only authenticated admin/staff users can access the page through `PrivateRoute`.
- Edit navigates to `ROUTES.LOCATIONS_EDIT`.
- Delete confirms through `DeleteLocationModal` and returns to `ROUTES.LOCATIONS_LIST` on success.
- Featured and status changes apply immediately and must refresh the current detail screen.

### Edge Cases
- Missing coordinates: show coordinates card without CTA and show empty map state.
- Missing gallery: preserve hero layout with translated empty state.
- Missing description or amenities: show translated placeholders, not hardcoded sample data.
- Missing detail entity or request failure: keep user on page with retry/back controls.

---

## 6. Follow-on Expectations

- Route documentation must always reference `/admin/locations/detail/:id`.
- Artifacts must use actual component names prefixed with `Detail*` where applicable.
- Future changes should preserve the current query invalidation contract for detail mutations.

---
Created at: 2026-05-12  
Updated at: 2026-05-12  
Source: repo reality after implementation review
