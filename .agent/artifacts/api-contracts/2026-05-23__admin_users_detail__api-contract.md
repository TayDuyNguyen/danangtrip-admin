# API Contract: Chi tiết Người dùng (`admin_users_detail`)

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Source endpoint: `D:\DATN\danangtrip-api\routes\api.php`

---

## 1) Overview
This document specifies the exact API contracts, TypeScript models, raw data payloads, and query hooks registered for the administrative User Detail feature in the DanangTrip project.

---

## 2) Endpoint Directory

### 2.1 Load User Details (`GET /admin/users/{id}`)
- **Controller**: `App\Http\Controllers\Api\Admin\UserController@show`
- **Request Type**: URL param `id` (integer)
- **Response Shape**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 12,
    "full_name": "Nguyễn Văn An",
    "username": "nguyenvanan",
    "email": "nguyenvanan@gmail.com",
    "avatar": "https://.../avatar.jpg",
    "phone": "0905123456",
    "birthdate": "1995-01-15",
    "gender": "male",
    "city": "Đà Nẵng",
    "role": "user",
    "status": "active",
    "email_verified_at": "2026-03-15T09:30:00.000000Z",
    "ratings_count": 5,
    "bookings_count": 12,
    "favorites_count": 8,
    "total_spend": 2450000.00,
    "created_at": "2026-03-15T09:30:00.000000Z",
    "updated_at": "2026-04-01T14:22:00.000000Z",
    "last_login_at": "2026-04-01T14:22:00.000000Z"
  }
}
```

### 2.2 Load User Bookings History (`GET /admin/users/{id}/bookings`)
- **Controller**: `App\Http\Controllers\Api\Admin\UserController@bookings`
- **Request Parameters**:
  - `page` (optional integer)
  - `per_page` (optional integer)
- **Response Shape**: Standard paginated length aware response containing the user's booking entries with eager-loaded `tourSchedule.tour`.

### 2.3 Load User Ratings History (`GET /admin/users/{id}/ratings`)
- **Controller**: `App\Http\Controllers\Api\Admin\UserController@ratings`
- **Request Parameters**:
  - `page` (optional integer)
  - `per_page` (optional integer)
- **Response Shape**: Standard paginated length aware response containing review entries with eager-loaded `tour` or `location`.

---

## 3) Frontend Types Configuration

### Raw Types (`user.dataHelper.ts`)
```typescript
export interface RawUserItem {
    id: number;
    full_name: string;
    email: string;
    username: string;
    avatar: string | null;
    role: RawUserRole;
    status: RawUserStatus;
    orders_count?: number | string;
    reviews_count?: number | string;
    phone: string | null;
    birthdate: string | null;
    gender: string | null;
    city: string | null;
    last_login_at: string | null;
    email_verified_at: string | null;
    bookings_count?: number | string;
    favorites_count?: number | string;
    total_spend?: number | string;
    created_at: string;
    updated_at: string;
}
```

### View Models (`user.dataHelper.ts`)
```typescript
export interface UserItem {
    id: number;
    fullName: string;
    email: string;
    username: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    ordersCount: number;
    reviewsCount: number;
    joinedDate: string;
    createdAt: string;
    updatedAt: string;
    phone?: string;
    birthdate?: string;
    gender?: string;
    city?: string;
    lastLoginAt?: string;
    isEmailVerified: boolean;
    bookingsCount: number;
    favoritesCount: number;
    totalSpend: number;
}
```

---

## 4) React Query Integration (`useUserQueries.ts`)
- **Detail Query Hook**: `useAdminUserDetailQuery(id)` -> Key: `["users", "detail", id]`
- **Bookings Query Hook**: `useUserBookingsQuery(id, page, limit)` -> Key: `["users", "bookings", id, { page, limit }]`
- **Ratings Query Hook**: `useUserRatingsQuery(id, page, limit)` -> Key: `["users", "ratings", id, { page, limit }]`

---

## 5) Cache Invalidation Strategy
Upon successful execution of status toggle (`updateStatusMutation`), role change (`updateRoleMutation`), or deletion (`deleteMutation`), the frontend invalidates `["users"]` cache, which automatically triggers a silent refresh of the User List and User Detail pages seamlessly.
