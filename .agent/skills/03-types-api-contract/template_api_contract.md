# API Contract: <Feature Name>

> Feature slug: `<feature-slug>`
> Date: YYYY-MM-DD
> Backend base: `/api/v1`

---

## 1) Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/<feature>` | jwt.auth + role:admin | List with pagination/filters |
| GET | `/admin/<feature>/:id` | jwt.auth + role:admin | Get detail |
| POST | `/admin/<feature>` | jwt.auth + role:admin | Create |
| PUT | `/admin/<feature>/:id` | jwt.auth + role:admin | Update |
| DELETE | `/admin/<feature>/:id` | jwt.auth + role:admin | Delete |

---

## 2) Request Schemas

### List Params
```ts
interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  // feature-specific filters
}
```

### Create Input
```ts
interface Create<Feature>Input {
  // fields
}
```

### Update Input
```ts
interface Update<Feature>Input {
  // fields (partial)
}
```

---

## 3) Response Shapes

### List Response
```json
{
  "code": 200,
  "message": "...",
  "data": {
    "data": [...],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 72
  }
}
```

### Detail Response
```json
{
  "code": 200,
  "message": "...",
  "data": { /* entity object */ }
}
```

---

## 4) TypeScript Interfaces

### Raw (API shape)
```ts
interface Raw<Feature> {
  id: number;
  // raw fields from API
  created_at: string;
  updated_at: string;
}
```

### ViewModel (UI shape)
```ts
interface <Feature> {
  id: number;
  // sanitized fields for UI
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 5) Yup Schema
```ts
export const <feature>Schema = (t: TFunction) => yup.object({
  // fields with t() messages
});
export type <Feature>FormValues = yup.InferType<ReturnType<typeof <feature>Schema>>;
```

---

## 6) Error Codes
| Code | Meaning | UI handling |
|------|---------|-------------|
| 422 | Validation error | Map to form fields |
| 404 | Not found | Redirect or empty state |
| 403 | Forbidden | Show permission error |
| 401 | Unauthorized | Redirect to login |
| 500 | Server error | Global toast |
