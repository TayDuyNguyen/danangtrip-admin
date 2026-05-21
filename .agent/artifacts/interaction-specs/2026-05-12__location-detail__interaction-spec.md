# Interaction Spec: location-detail

## 1. Main User Actions

| Action | Trigger | Result |
|---|---|---|
| Open detail | View action from location list | Navigate to `/admin/locations/detail/:id` |
| Edit location | Header action | Navigate to edit page |
| Delete location | Header or sidebar danger zone | Open confirm modal, delete on confirm, then go back to list |
| Switch tab | Tab click | Swap local view between `info`, `reviews`, and `map` |
| Toggle featured | Sidebar control | Mutation + toast + fresh detail state |
| Change status | Sidebar action | Mutation + toast + fresh detail state |
| Browse gallery | Thumbnail click | Update selected hero image |
| Open directions | Map CTA | Open Google Maps directions in new tab |

---

## 2. Destructive Flow

### Delete Location
1. User activates delete from the detail page.
2. `DeleteLocationModal` opens with translated warning copy.
3. Confirm calls `useDeleteLocationMutation()`.
4. On success:
   - show success toast
   - invalidate related queries
   - navigate to `ROUTES.LOCATIONS_LIST`

---

## 3. Non-Destructive Management Flow

### Status Change
1. User chooses the next status in the sidebar.
2. Page calls `useBulkLocationActionsMutation()` with the current id.
3. Success toast appears.
4. Current detail query is invalidated so the sidebar and hero stay in sync.

### Featured Toggle
1. User toggles featured state in the sidebar.
2. Page calls `useUpdateLocationFeaturedMutation()`.
3. Success toast appears.
4. Current detail query is invalidated so the UI reflects the persisted state.

---

## 4. Local UI State

| State | Owner | Values |
|---|---|---|
| `activeTab` | `LocationDetail/index.tsx` | `info`, `reviews`, `map` |
| selected hero image | `DetailHero` | derived from gallery selection |

---

## 5. Feedback and Copy Requirements

- Error state must use translated `messages.load_error`.
- Empty comment fallback must use translated `detail.reviews.no_comment`.
- Sidebar info tip must use translated `detail.management.status_tip`.
- No interaction on this page should depend on hardcoded English/Vietnamese UI strings.

---
Created at: 2026-05-12  
Updated at: 2026-05-12  
Source: implemented interaction behavior
