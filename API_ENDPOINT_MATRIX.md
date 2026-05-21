# DanangTrip Admin ↔ API Endpoint Matrix

Updated: 2026-04-29

## Scope
- Admin client checked: `src/api/*.ts` + `src/constants/endpoints.ts`
- Backend checked: `danangtrip-api` route list (`php artisan route:list`)

## Status Legend
- `OK`: Client endpoint/method matches backend route
- `NOTE`: Works, but has caveat
- `UNUSED`: Backend route exists but current admin API layer does not call it

## Auth
| Client | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `/auth/login` | POST | `api/v1/auth/login` | OK |  |
| `/auth/register` | POST | `api/v1/auth/register` | OK |  |
| `/auth/logout` | POST | `api/v1/auth/logout` | OK |  |
| `/auth/refresh` | POST | `api/v1/auth/refresh` | OK |  |

## Dashboard
| Client | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `/admin/dashboard/stats` | GET | `api/v1/admin/dashboard/stats` | OK |  |
| `/admin/bookings/status-counts` | GET | `api/v1/admin/bookings/status-counts` | OK |  |
| `/admin/dashboard/revenue` | GET | `api/v1/admin/dashboard/revenue` | OK |  |
| `/admin/dashboard/booking-trend` | GET | `api/v1/admin/dashboard/booking-trend` | OK |  |
| `/admin/dashboard/user-growth` | GET | `api/v1/admin/dashboard/user-growth` | NOTE | Client passes params; backend currently ignores params |
| `/admin/dashboard/top-tours` | GET | `api/v1/admin/dashboard/top-tours` | OK |  |
| `/admin/bookings` | GET | `api/v1/admin/bookings` | OK |  |
| `/admin/bookings/export` | GET | `api/v1/admin/bookings/export` | OK | blob export |

Fallback calls:
- `/admin/ratings` (GET) → OK
- `/admin/contacts` (GET) → OK

## Tours
| Client | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `/admin/tours` | GET | `api/v1/admin/tours` | OK |  |
| `/admin/tours/{id}` | GET | `api/v1/admin/tours/{id}` | OK |  |
| `/admin/tours` | POST | `api/v1/admin/tours` | OK |  |
| `/admin/tours/{id}` | PUT | `api/v1/admin/tours/{id}` | OK |  |
| `/admin/tours/{id}` | DELETE | `api/v1/admin/tours/{id}` | OK |  |
| `/admin/tours/{id}/status` | PATCH | `api/v1/admin/tours/{id}/status` | OK |  |
| `/admin/tours/{id}/featured` | PATCH | `api/v1/admin/tours/{id}/featured` | OK |  |
| `/admin/tours/{id}/hot` | PATCH | `api/v1/admin/tours/{id}/hot` | OK |  |
| `/admin/tours/export` | GET | `api/v1/admin/tours/export` | OK | blob export |
| `/tour-categories` | GET | `api/v1/tour-categories` | OK | public categories |

## Tour Categories (Admin)
| Client | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `/admin/tour-categories` | GET | `api/v1/admin/tour-categories` | OK |  |
| `/admin/tour-categories` | POST | `api/v1/admin/tour-categories` | OK |  |
| `/admin/tour-categories/{id}` | PUT | `api/v1/admin/tour-categories/{id}` | OK |  |
| `/admin/tour-categories/{id}/status` | PATCH | `api/v1/admin/tour-categories/{id}/status` | OK |  |
| `/admin/tour-categories/{id}` | DELETE | `api/v1/admin/tour-categories/{id}` | OK |  |
| `/admin/tour-categories/reorder` | PATCH | `api/v1/admin/tour-categories/reorder` | OK |  |

Note:
- In `tourCategoryApi.ts`, 2 calls are hardcoded string paths instead of constants; still correct route.

## Tour Schedules
| Client | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `/admin/tour-schedules` | GET | `api/v1/admin/tour-schedules` | OK |  |
| `/admin/tour-schedules/status-counts` | GET | `api/v1/admin/tour-schedules/status-counts` | OK |  |
| `/admin/tour-schedules/{id}` | GET | `api/v1/admin/tour-schedules/{id}` | OK |  |
| `/admin/tours/{tourId}/schedules` | POST | `api/v1/admin/tours/{id}/schedules` | OK |  |
| `/admin/tour-schedules/{id}` | PUT | `api/v1/admin/tour-schedules/{id}` | OK |  |
| `/admin/tour-schedules/{id}` | DELETE | `api/v1/admin/tour-schedules/{id}` | OK |  |
| `/admin/tour-schedules/{id}/status` | PATCH | `api/v1/admin/tour-schedules/{id}/status` | OK |  |

## Upload
| Client | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `/upload/image` | POST | `api/v1/upload/image` | OK | auth route |
| `/upload/images` | POST | `api/v1/upload/images` | OK | auth route |
| `/upload/image` | DELETE | `api/v1/upload/image` | OK | auth route |

## Export Endpoints Used
| Client | Method | Backend Route | Status |
|---|---|---|---|
| `/admin/bookings/export` | GET | `api/v1/admin/bookings/export` | OK |
| `/admin/tours/export` | GET | `api/v1/admin/tours/export` | OK |
| `/admin/payments/export` | GET | `api/v1/admin/payments/export` | OK |

## Important Backend Routes Currently Unused by Admin API Layer
- Users: `/admin/users*`
- Payments management: `/admin/payments`, `/admin/payments/{id}`, `/admin/payments/{id}/refund`
- Locations management: `/admin/locations*`
- Tags/Amenities/Categories/Subcategories CRUD
- Contacts reply/delete/export (except fallback list)
- Notifications management
- Blog admin management
- Reports: `/admin/reports/*`

## Quick Conclusion
- Current implemented admin API layer is **mostly aligned** with backend routes.
- No critical path/method mismatches found in active modules (`auth`, `dashboard`, `tours`, `tour-categories`, `schedules`, `upload`).
