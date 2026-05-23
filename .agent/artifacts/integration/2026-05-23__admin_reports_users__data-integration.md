# Data Integration Plan: Admin Users Report (`admin_reports_users`)

> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> API module: `src/api/reportApi.ts`

---

## 1) Data Sources
| Purpose | Endpoint | Hook | Notes |
|---|---|---|---|
| Fetch monthly growth signup stats | `GET /admin/reports/users?year=YYYY` | `useUsersReportQuery` | Primary query controlling chart/table visuals |
| Download spreadsheet of user listings | `GET /admin/users/export?role=role&status=status` | `exportUsersMutation` | Mutation trigger for Excel/CSV downlinks |

---

## 1.1) Data Ownership Notes
- **Source of Truth:** React Query cache under `reportKeys.usersReport({ year })` key is the single source of truth for the visualization statistics. We do *not* copy these query results into any local component state or Zustand cache.
- **Client Drafts:** Local filter states in the page component (`localFilters` containing `year`, `role`, and `status`) hold user filter choices temporarily until the user clicks "Apply", which synchronizes them with URL search params and re-triggers the queries.

---

## 2) Query Plan
| Query Key | Query Type | Trigger | staleTime | Mapper |
|---|---|---|---|---|
| `['reports', 'users', { year }]` | List / Stats | Year filter changes / active page load | 30 seconds | `mapUsersReport` |

---

## 2.1) Parallel / Dependent Query Notes
- **Independent Query:** The `useUsersReportQuery` query runs independently and does not depend on any parent query waterfall.

---

## 3) Mutation Plan
| Action | API Method | Success Handling | Error Handling |
|---|---|---|---|
| **Export Excel spreadsheet** | `reportApi.exportUsersReport` | Triggers browser download. Sonner success toast: "Xuất báo cáo thành công!" | Sonner error toast: "Có lỗi xảy ra khi xuất báo cáo." |

---

## 4) UI State Handling
| UI Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| **KPI metrics** | Rendering 3 card Skeleton items | Displays `0` for signup counts | Displays `-` | Displays formatted integer metrics |
| **Growth AreaChart** | Render 400px high gray box Skeleton | Displays `t('charts.no_data')` label | Standard connection error inline state | AreaChart teal stroke, Area gradient fill |
| **Monthly growth table** | Render 5 gray line Skeleton rows | Displays `EmptyState` component | Standard inline `ErrorWidget` retry link | Populates 12 months with cumulative calculations |

---

## 4.1) Error Strategy
| Error Type | UI Handling | Toast | Retry |
|---|---|---|---|
| **401 Unauthorized** | Silently refreshed via `axiosClient` interceptor / redirects to login | Standard redirect | Yes (resubmits active query) |
| **403 Forbidden** | Standard route restriction to 403 page | standard | No |
| **500 Server Error** | Renders inline `ErrorWidget` alert box with refresh link | standard | Yes (Clicking "Thử lại" invokes React Query `refetch`) |

---

## 5) Files Modified
- **Modified:** `src/api/reportApi.ts` (API methods)
- **Modified:** `src/hooks/useReportQueries.ts` (Query/Mutation hooks)
- **Modified:** `src/pages/Reports/UsersReport/index.tsx` (Page wiring)

---

## 6) Risks / Open Questions
- **R-01 (Backend timeout during export):** If the database has millions of users, Laravel's spreadsheet generation might timeout. 
  - *Mitigation:* The export action is wrapped under a standard `toast.promise` with a clear loading spinner, keeping the administrator well-informed.
