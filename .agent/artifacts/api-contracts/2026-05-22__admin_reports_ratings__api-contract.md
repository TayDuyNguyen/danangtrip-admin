# API Contract: Báo cáo Đánh giá (Ratings Report)

> Feature slug: `admin_reports_ratings`
> Date: 2026-05-22

---

## 1. Endpoints Declaration
The following Laravel endpoints are integrated inside the frontend `danangtrip-admin` workspace:

### 1.1 Load Ratings Report
- **URL**: `/admin/reports/ratings`
- **Method**: `GET`
- **Query Parameters**:
  - `from` (string, ISO Date `YYYY-MM-DD`): Start boundary
  - `to` (string, ISO Date `YYYY-MM-DD`): End boundary
  - `status` (string: `all` | `pending` | `approved` | `rejected`): Filter by moderation status
  - `type` (string: `all` | `location` | `tour`): Filter by target subject
  - `page` (number): Pagination index
  - `per_page` (number): Pagination page size
- **Success Response** (`200 OK`):
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "summary": {
        "total_count": 1024,
        "pending_count": 18,
        "approved_count": 986,
        "rejected_count": 20,
        "average_score": 4.7,
        "trends": {
          "total": 8.3,
          "approved": -1.2,
          "pending": 5.0,
          "average": 0.5
        },
        "star_distribution": {
          "1": 5,
          "2": 15,
          "3": 80,
          "4": 412,
          "5": 512
        },
        "status_distribution": {
          "approved": 986,
          "pending": 18,
          "rejected": 20
        },
        "type_distribution": {
          "location": { "count": 624, "average": 4.8 },
          "tour": { "count": 400, "average": 4.6 }
        },
        "trend_chart": [
          { "date": "2026-05-15", "total": 12, "approved": 10 },
          { "date": "2026-05-16", "total": 15, "approved": 14 }
        ]
      },
      "ratings_list": {
        "data": [
          {
            "id": 1,
            "score": 5,
            "comment": "Rất tuyệt vời!",
            "images": ["https://res.cloudinary.com/..."],
            "status": "approved",
            "reviewable_type": "App\\Models\\Tour",
            "reviewable_id": 12,
            "reviewable_name": "Tour Bà Nà Hills 1 Ngày",
            "user": {
              "id": 9,
              "full_name": "Nguyễn Duy Tây",
              "avatar": "https://avatar.url/..."
            },
            "created_at": "2026-05-22T00:49:41.000000Z"
          }
        ],
        "current_page": 1,
        "last_page": 103,
        "per_page": 10,
        "total": 1024
      }
    }
  }
  ```

### 1.2 Export Excel Spreadsheet
- **URL**: `/admin/ratings/export`
- **Method**: `GET`
- **Query Parameters**: Standard filters (`status`, `date_from`, `date_to`, `type`)
- **Success Response**: Binary Stream (`Blob` of Microsoft Excel Spreadsheet type)

### 1.3 Quick Moderation Actions
- **Approve**: `PATCH /admin/ratings/{id}/approve` -> Returns success code `200`
- **Reject**: `PATCH /admin/ratings/{id}/reject` -> Returns success code `200`
- **Delete**: `DELETE /admin/ratings/{id}` -> Returns success code `200`

---

## 2. TanStack Query Integration Schema
We declared the following configurations inside the hooks layer:
- **Query Keys**: `['reports', 'ratings', filters]`
- **Invalidation Strategy**: Success of quick-moderation mutations (Approve/Reject/Delete) automatically invalidates `['reports']` and `['dashboard']` queries, forcing instant reactive UI updates and maintaining consistency.
