# UI Spec: location-detail

## 1. Reuse Matrix

| Component | Path | Usage |
|---|---|---|
| `ErrorWidget` | `src/components/common/ErrorWidget.tsx` | Error fallback with retry and back action |
| `DeleteLocationModal` | `src/pages/Locations/components/DeleteLocationModal.tsx` | Destructive confirmation |
| `LocationDetailSkeleton` | `src/components/loading/LocationDetailSkeleton.tsx` | Layout-preserving loading state |
| `Switch` / form controls in sidebar | existing shared UI primitives | Featured toggle and status control |

---

## 2. Actual Component Decomposition

### `DetailHeader`
- Breadcrumb/back affordance
- Title and quick actions
- Edit and delete actions tied to route + modal flow

### `DetailHero`
- Main image area
- Thumbnail strip when gallery exists
- Summary metadata without hardcoded city text
- Empty gallery state through translation key

### `DetailTabs`
- Local tab switch for:
  - `info`
  - `reviews`
  - `map`

### `LocationInfoTab`
- Description
- Contact information cards
- Price block
- Amenities badges sourced from API

### `LocationReviewsTab`
- Review distribution
- Count and status summary
- Review list with translated empty-comment fallback

### `LocationMapTab`
- Coordinates summary card
- Directions CTA when coordinates exist
- Embedded Google Maps iframe
- Empty map state when coordinates are missing

### `DetailSidebar`
- View / favorite / rating stats
- Featured toggle
- Status action
- Danger zone with delete confirmation

---

## 3. UI States and Interactions

| State | Handling |
|---|---|
| Loading | `LocationDetailSkeleton` |
| Error | `ErrorWidget` with retry + back |
| No images | translated empty hero state |
| No description | translated placeholder text |
| No amenities | translated placeholder text |
| No coordinates | translated map placeholder |
| No written review comment | translated review fallback text |

---

## 4. Responsive Notes

- Desktop: two-column 8/4 grid.
- Tablet/mobile: sidebar stacks below main content.
- Tabs remain the main content switch on all breakpoints.
- Map keeps a fixed aspect ratio to avoid layout jump.

---

## 5. Styling Direction

- Keep the existing admin visual language: rounded cards, soft borders, teal/indigo emphasis.
- Avoid placeholder stock images or invented sample amenities.
- Prefer translated copy everywhere in feature-local UI.

---
Created at: 2026-05-12  
Updated at: 2026-05-12  
Source: implemented component structure
