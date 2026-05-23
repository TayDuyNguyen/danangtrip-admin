# API Contract: Admin Users Report (`admin_reports_users`)

> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> Backend base: `/api/v1`

---

## 1) Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/reports/users` | jwt.auth + role:admin | Fetch new-user growth counts grouped by month for a given year |
| GET | `/api/v1/admin/users/export` | jwt.auth + role:admin | Export standard Excel spreadsheet containing user listings filtered by role/status |

---

## 1.1) Source References
- `api_list.md` section: `42` under `/admin/reports/users` and `/admin/users/export`
- `src/constants/endpoints.ts` entries:
  - `REPORTS.USERS: '/admin/reports/users'`
  - `EXPORT.USERS: '/admin/users/export'`
- Analysis file: `D:\DATN\danangtrip-admin\.agent\artifacts\analysis\2026-05-23__admin_reports_users__screen-analysis.md`

---

## 2) Request Schemas

### Users Report Params (GET `/admin/reports/users`)
```ts
interface UsersReportFilters {
  year?: number; // integer (2000 to 2027)
}
```

### Users Export Params (GET `/admin/users/export`)
```ts
interface UsersExportFilters {
  role?: 'all' | 'admin' | 'user';     // optional filter matching backend
  status?: 'all' | 'active' | 'banned'; // optional filter matching backend
}
```

---

## 3) Response Shapes

### Reports List Response (GET `/admin/reports/users?year=2026`)
```json
{
  "code": 200,
  "message": "Retrieve user reports successfully",
  "data": {
    "year": 2026,
    "stats": [
      {
        "month": 1,
        "count": 14
      },
      {
        "month": 2,
        "count": 25
      }
    ]
  }
}
```

### Export spreadsheet response (GET `/admin/users/export`)
- Returns a standard binary stream of Microsoft Excel content with Content-Type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

## 4) TypeScript Interfaces (Locked)

### Raw (API shape inside `src/dataHelper/report.dataHelper.ts`)
```ts
export interface RawUsersReportMonthStat {
    month: number;
    count: number;
}

export interface RawUsersReport {
    year: number;
    stats: RawUsersReportMonthStat[];
}
```

### ViewModel (UI shape inside `src/dataHelper/report.dataHelper.ts`)
```ts
export interface UsersReportMonthViewModel {
    month: number;          // 1-12 range
    labelKey: string;       // Translation key: "users_report.month.1" etc.
    count: number;          // Signup count
    cumulativeCount: number;// Running cumulative total
}

export interface UsersReportViewModel {
    year: number;
    stats: UsersReportMonthViewModel[];
    totalNewUsers: number;
}
```

---

## 5) Mapper Contract
The `mapUsersReport(raw: RawUsersReport)` function maps month indices to i18n locale keys and aggregates the running cumulative total of users over the 12 months. Any month that has `0` users and was skipped by Laravel database extraction is safely backfilled with a count of `0`.

---

## 6) Error Codes
| Code | Meaning | UI handling |
|------|---------|-------------|
| 422 | Validation Error | Form/Filter error mapping |
| 403 | Forbidden | Standard route redirection to error page |
| 401 | Unauthorized | Triggers axios client refresh cookie or redirects to login |
| 500 | Server error | Displays Sonner connection error toast |

---

## 7) Files Modified / Added
- **Modified:** `src/constants/endpoints.ts` (API paths added)
- **Modified:** `src/dataHelper/report.dataHelper.ts` (TypeScript types defined)
- **Modified:** `src/dataHelper/report.mapper.ts` (12-month backfilling mapper implemented)
- **Modified:** `src/api/reportApi.ts` (axios client methods added)
- **Modified:** `src/hooks/useReportQueries.ts` (React Query query and mutation hooks wired)
