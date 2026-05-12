# API Contract: location-detail

## 1. Source References
*   **API Docs**: `api_list.md` (Section: LOCATIONS, RATINGS)
*   **Endpoints**: `src/constants/endpoints.ts` (Section: LOCATIONS)
*   **Existing Types**: `src/types/location.ts`

---

## 2. Endpoint List

| Action | Method | Path | Auth |
|---|---|---|---|
| Get Location Detail | GET | `/admin/locations/{id}` | 🛡️ Admin |
| Get Rating Stats | GET | `/locations/{id}/rating-stats` | 🌐 Public |
| Get Ratings List | GET | `/locations/{id}/ratings` | 🌐 Public |
| Update Status | PATCH | `/admin/locations/{id}/status` | 🛡️ Admin |
| Toggle Featured | PATCH | `/admin/locations/{id}/featured` | 🛡️ Admin |
| Delete Location | DELETE | `/admin/locations/{id}` | 🛡️ Admin |

---

## 3. Data Models

### Raw Models (Backend Fidelity)

```ts
// src/types/location.ts (Already exists, but adding related types)

export interface RawRating {
    id: number;
    score: number;
    comment: string | null;
    images: string[] | null;
    status: 'pending' | 'approved' | 'rejected';
    user: {
        id: number;
        full_name: string;
        avatar: string | null;
    };
    created_at: string;
}

export type RawRatingStats = Record<string | number, number>;
```

### ViewModel (UI-Consumable)

```ts
// src/dataHelper/location.dataHelper.ts (Expected to extend)

export interface RatingViewModel {
    id: number;
    score: number;
    comment: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected';
    userName: string;
    userAvatar: string | null;
    date: Date;
}

export interface RatingStatsViewModel {
    score: number;
    count: number;
    percentage: number;
}
```

---

## 4. Mapper Contract

| Field | Source | Logic |
|---|---|---|
| `Rating.comment` | `raw.comment` | Fallback to empty string if null. |
| `Rating.images` | `raw.images` | Fallback to empty array if null. |
| `Rating.date` | `raw.created_at` | Use `safeDate()` helper. |
| `RatingStats` | `RawRatingStats` | Map object `{5: 12, ...}` to array of objects with calculated percentage. |

---

## 5. API Module Contract

```ts
// src/api/locationApi.ts (Planned additions)

export const locationApi = {
    // ... existing ...
    getRatingStats: (id: string | number) => 
        axiosClient.get<ApiResponse<RawRatingStats>>(`/locations/${id}/rating-stats`),
    
    getRatings: (id: string | number, params?: PaginationParams) => 
        axiosClient.get<ApiResponse<Paginator<RawRating>>>(`/locations/${id}/ratings`, { params }),
};
```

---

## 6. Files Expected to Change

| File | Change Type | Reason |
|---|---|---|
| `src/types/location.ts` | [MOD] | Add `RawRating` and `RawRatingStats` interfaces. |
| `src/dataHelper/location.dataHelper.ts` | [MOD] | Add `RatingViewModel` and `RatingStatsViewModel`. |
| `src/dataHelper/location.mapper.ts` | [MOD] | Add `mapRating` and `mapRatingStats` functions. |
| `src/api/locationApi.ts` | [MOD] | Add rating-related fetch methods. |
| `src/constants/endpoints.ts` | [MOD] | Add `RATINGS` and `RATING_STATS` to `LOCATIONS` object. |

---

## 7. Assumptions & Open Questions
*   **[ASSUMPTION]**: `GET /admin/locations/{id}` returns the same shape as the public `GET /locations/{slug}`. 
*   **[ASSUMPTION]**: `rating-stats` returns a flat object with scores as keys.
*   **Open Question**: Should we also include `GET /locations/{id}/images` explicitly if it's already part of the `RawLocation` detail? (API docs suggest it exists separately for performance).

---
*Created at: 2026-05-12*
*Source: 03-types-api-contract skill*
