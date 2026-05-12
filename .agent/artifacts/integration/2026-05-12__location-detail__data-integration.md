# Data Integration Plan: location-detail

## 1. Data Sources

| Concern | Current Hook / Source | Notes |
|---|---|---|
| Location detail | `useLocationDetailQuery(id)` | Maps API payload into `LocationViewModel` |
| Delete location | `useDeleteLocationMutation()` | Invalidates lists, stats, district, and detail |
| Toggle featured | `useUpdateLocationFeaturedMutation()` | Invalidates lists, stats, and `detail(id)` |
| Change status | `useBulkLocationActionsMutation()` | Uses single-id payload for this page and invalidates each `detail(id)` |

---

## 2. ViewModel Contract

The detail page relies on the following mapped fields:

- Identity: `id`, `name`
- Visibility: `status`, `isFeatured`
- Media: `images`
- Location/contact: `district`, `address`, `phone`, `email`, `website`
- Content: `description`, `openingHours`
- Pricing: `priceMin`, `priceMax`, `priceLevelKey`
- Map: `latitude`, `longitude`
- Amenities: `amenities`
- Metrics: `viewCount`, `favoriteCount`, `ratingAverage`, `reviewCount`
- Reviews: `reviewStats`, `recentReviews`

### Mapper Notes
- `latitude` and `longitude` remain `undefined` when the backend does not provide them.
- `amenities` is mapped from the API array into a string array for direct rendering.

---

## 3. Query Invalidation Requirements

| Action | Must Refresh |
|---|---|
| Delete | list queries, stats queries, district queries, detail query |
| Toggle featured | list queries, stats queries, detail query |
| Change status | list queries, stats queries, district queries, detail query |

The detail page must not rely on manual refresh after a sidebar action.

---

## 4. UI Data Rules

- Description is rendered as plain text, not `dangerouslySetInnerHTML`.
- Price block uses translated fallback text when both `priceMin` and `priceMax` are missing.
- Map only renders an iframe when coordinates exist.
- Reviews and amenities must come from mapped API data, not placeholder arrays.

---

## 5. Related Files

| File | Responsibility |
|---|---|
| `src/hooks/useLocationQueries.ts` | detail query + mutation invalidation |
| `src/dataHelper/location.dataHelper.ts` | view model shape |
| `src/dataHelper/location.mapper.ts` | API-to-view-model mapping |
| `src/pages/Locations/LocationDetail/*` | feature rendering |

---
Created at: 2026-05-12  
Updated at: 2026-05-12  
Source: post-fix integration reality
