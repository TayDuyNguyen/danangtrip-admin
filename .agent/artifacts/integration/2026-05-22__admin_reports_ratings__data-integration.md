# Data Integration: Báo cáo Đánh giá (Ratings Report)

- Feature Slug: `admin_reports_ratings`
- Target Route: `/admin/reports/ratings`
- Main API Module: [reportApi.ts](file:///d:/DATN/danangtrip-admin/src/api/reportApi.ts)
- Query Hook Module: [useReportQueries.ts](file:///d:/DATN/danangtrip-admin/src/hooks/useReportQueries.ts)
- Last Updated: 2026-05-22

---

## 1. API Client Surface

The frontend communicates with the Laravel backend via standard Axios configurations wrapping authentication headers:

1. **Fetch Report Aggregate & List**:
   - Method: `GET`
   - Route: `/admin/reports/ratings`
   - Parameters: `from` (string), `to` (string), `status` ('all'|'pending'|'approved'|'rejected'), `type` ('all'|'location'|'tour'), `page` (number), `per_page` (number).
   - Backend controller response contains total counts, trend lines, star/type splits, and a paginated list of individual reviews.

2. **Excel Spreadsheets Export**:
   - Method: `GET`
   - Route: `/admin/ratings/export`
   - ResponseType: `'blob'`
   - Leverages unified spreadsheet downloader with custom stream mapping.

3. **Ratings Moderation Commands**:
   - Approve: `PATCH /admin/ratings/{id}/approve`
   - Reject: `PATCH /admin/ratings/{id}/reject`
   - Delete: `DELETE /admin/ratings/{id}`

---

## 2. Server State Management (TanStack Query)

State is fetched, cached, and synchronized using `@tanstack/react-query` v5:

- **Query Key**: `['reports', 'ratings', filters]`
- **Cache Refreshing (`staleTime`)**: Set to 30 seconds (`1000 * 30`) to balance fresh status transitions with backend payload efficiency.
- **Auto Invalidation**: On successful moderation mutations (approve, reject, delete), the query invalidates `['reports']` keys globally. It also invalidates `['dashboard']` to instantly sync navigation badges and dashboard summaries.

---

## 3. Data Transformations (Mappers)

Mappers are isolated in `report.mapper.ts` to guarantee type safety and gracefully handle edge cases (e.g. database schema changes, null comments, empty image arrays):

- **Safe Conversion**: Utilizes `toNumberSafe` to sanitize floating point average ratings.
- **Null Guards**: Translates empty comments to `""`, missing avatars to default fallbacks, and handles morph types (`Location` / `Tour` entities) mapping them into explicit string literals.
- **Internationalization Labels**: Injects dynamic locale translation keys (`ratings.status.*`, `ratings.type.*`) during the mapping phase so components do not need hardcoded status translation mappings.
