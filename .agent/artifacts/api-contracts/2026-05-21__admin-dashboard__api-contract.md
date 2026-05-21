# API Contract: Admin Dashboard

> Feature slug: `admin-dashboard`
> Date: 2026-05-21
> Backend base: `/api/v1` (admin routes protected by auth/role middleware)

---

## 1) Endpoints

The dashboard is built on a decoupled, parallel architecture calling 8 endpoints (plus fallbacks) to prevent blocking waterfalls and maximize interface load speed.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/dashboard/stats` | jwt.auth + role:admin | Core counters (revenue, bookings, users, tours sold) |
| GET | `/admin/bookings/status-counts` | jwt.auth + role:admin | Status aggregates for order status charts |
| GET | `/admin/dashboard/revenue` | jwt.auth + role:admin | Historical revenue filtered by period |
| GET | `/admin/dashboard/booking-trend` | jwt.auth + role:admin | Volume trends over 7, 30, or 90 days |
| GET | `/admin/dashboard/user-growth` | jwt.auth + role:admin | User registration metrics grouped by month |
| GET | `/admin/dashboard/top-tours` | jwt.auth + role:admin | Top 5 best selling tours based on sales volume |
| GET | `/admin/bookings` | jwt.auth + role:admin | Recent orders list with sorting and filtering |
| GET | `/admin/bookings/export` | jwt.auth + role:admin | Generates and downloads spreadsheet of booking logs |
| GET | `/admin/ratings` (Fallback) | jwt.auth + role:admin | Fallback counting tool for pending ratings |
| GET | `/admin/contacts` (Fallback) | jwt.auth + role:admin | Fallback counting tool for new unread contacts |

---

## 1.1) Source References
- `api_list.md` section: Dashboard API section
- `src/constants/endpoints.ts` entries: `API_ENDPOINTS.DASHBOARD.*`, `API_ENDPOINTS.RATINGS.LIST`, `API_ENDPOINTS.CONTACTS.LIST`, `API_ENDPOINTS.EXPORT.BOOKINGS`
- Analysis file: `.agent/artifacts/analysis/2026-05-21__admin-dashboard__screen-analysis.md`

---

## 2) Request Schemas

### Revenue Params
```ts
interface RevenueParams {
  period: 'day' | 'week' | 'month' | 'year';
  from: string; // ISO date format YYYY-MM-DD
  to: string;   // ISO date format YYYY-MM-DD
}
```

### Booking Trend Params
```ts
interface BookingTrendParams {
  days: 7 | 30 | 90;
}
```

### User Growth Params
```ts
interface UserGrowthParams {
  year: number;
}
```

### Top Tours Params
```ts
interface TopToursParams {
  limit: number;
  from?: string; // ISO date format YYYY-MM-DD
  to?: string;   // ISO date format YYYY-MM-DD
}
```

### Bookings Params
```ts
interface BookingsParams {
  page: number;
  per_page: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  booking_status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
```

### Bookings Export Params
```ts
interface BookingsExportParams {
  from_date: string;
  to_date: string;
}
```

---

## 3) Response Shapes

### Dashboard Stats Response (`GET /admin/dashboard/stats`)
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "total_revenue": 150000000,
    "total_bookings": 240,
    "total_users": 1850,
    "total_tours": 12,
    "booking_status": {
      "completed": 120,
      "confirmed": 60,
      "pending": 40,
      "cancelled": 20
    },
    "revenue_trend": 12.5,
    "booking_trend": 4.8,
    "user_trend": 8.3,
    "pending_ratings": 15,
    "new_contacts": 4
  }
}
```

### Top Tours Response (`GET /admin/dashboard/top-tours`)
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Tour Đà Nẵng - Hội An - Bà Nà Hills 3N2Đ",
      "booking_count": 85,
      "total_revenue": 85000000
    }
  ]
}
```

---

## 4) TypeScript Interfaces

### Raw (API shape)

```ts
export interface RawDashboardStats {
    total_revenue?: number;
    total_bookings?: number;
    total_users?: number;
    total_tours?: number;
    booking_status?: {
        completed?: number;
        confirmed?: number;
        pending?: number;
        cancelled?: number;
    };
    revenue_trend?: number;
    booking_trend?: number;
    user_trend?: number;
    pending_ratings?: number;
    new_contacts?: number;
}

export interface RawTopTour {
    id: string | number;
    name: string;
    booking_count: number;
    total_revenue: string | number;
}
```

### ViewModel (UI shape)

```ts
export interface DashboardStats {
    total_revenue: number;
    total_revenue_trend: number | null;
    total_bookings: number;
    total_bookings_trend: number | null;
    total_users: number;
    total_users_trend: number | null;
    total_tours_sold: number;
    total_tours_sold_trend: number | null;
    pending_ratings?: number;
    new_contacts?: number;
    booking_status: {
        completed_count: number;
        confirmed_count: number;
        pending_count: number;
        cancelled_count: number;
    };
}

export interface TopTour {
    id: string;
    rank?: number;
    title: string;
    sales_count: number;
    revenue: number;
    status?: 'active' | 'inactive' | 'full';
}
```

---

## 5) Yup Schema

The Dashboard screen relies entirely on reactive URL/hook parameters for period selections rather than validated user forms. Thus, no standard client-side validation schema (`dashboard.schema.ts`) is registered or required in `src/validations/`.

---

## 6) Error Codes

All HTTP interactions utilize the unified `axiosClient` interceptors with sonner toasts for error alerts.

| Code | Meaning | UI handling |
|------|---------|-------------|
| 401 | Unauthorized | Triggers token refresh flow or redirects user to `/login` |
| 403 | Forbidden | Displays visual access denied warning inside the main body block |
| 404 | Not Found | Widget displays isolated empty illustration block rather than crashing the page |
| 422 | Unprocessable | Intercepted and reported via localized warning toasts |
| 500 | Server Error | Triggers contextual widget-level ErrorWidget block with a dedicated retry button |

---

## 7) Files Expected To Change

No structural code edits are needed for the types and service layer since the current implementations in `src/dataHelper/dashboard.dataHelper.ts`, `src/dataHelper/dashboard.mapper.ts`, `src/api/dashboardApi.ts`, and `src/hooks/useDashboardQueries.ts` are 100% compliant with the required types, mapping patterns, and resilient fallback count calculations.
