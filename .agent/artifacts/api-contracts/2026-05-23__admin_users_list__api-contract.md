# API Contract & Types: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `types & api contracts`

---

## 1) Endpoint Mapping

Chúng tôi đối chiếu thực tế các endpoint của máy chủ hỗ trợ nghiệp vụ quản trị người dùng:

| Hành động | Method | Path | Auth | Trạng thái endpoints.ts |
|-----------|--------|------|------|-------------------------|
| **Tải danh sách** | GET | `/admin/users` | Có (Bearer) | **Cần thêm** (`USERS.LIST`) |
| **Cập nhật vai trò** | PATCH | `/admin/users/{id}/role` | Có (Bearer) | **Cần thêm** (`USERS.UPDATE_ROLE`) |
| **Cập nhật trạng thái**| PATCH | `/admin/users/{id}/status` | Có (Bearer) | **Cần thêm** (`USERS.UPDATE_STATUS`) |
| **Xóa người dùng** | DELETE | `/admin/users/{id}` | Có (Bearer) | **Cần thêm** (`USERS.DELETE`) |
| **Xuất báo cáo Excel**| GET | `/admin/users/export` | Có (Bearer) | Đã có (`EXPORT.USERS`) |

---

## 2) TypeScript Types & Interfaces

### 2.1) Raw Types (Dữ liệu gốc từ API)
Các kiểu dữ liệu phản ánh chính xác cấu trúc cơ sở dữ liệu và API backend trả về:

```typescript
export type RawUserRole = 'admin' | 'staff' | 'user';
export type RawUserStatus = 'active' | 'banned';

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
    created_at: string;
    updated_at: string;
}

export interface RawUserListResponse {
    data: RawUserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
```

### 2.2) ViewModel Types (Dữ liệu dùng cho Giao diện UI)
Các kiểu dữ liệu đã được làm sạch, đồng nhất kiểu camelCase và an toàn cho component:

```typescript
export type UserRole = 'admin' | 'staff' | 'user';
export type UserStatus = 'active' | 'banned';

export interface UserItem {
    id: number;
    fullName: string;
    email: string;
    username: string; // Đã thêm tiền tố @
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    ordersCount: number;
    reviewsCount: number;
    joinedDate: string; // Định dạng DD/MM/YYYY
    createdAt: string;
}

export interface UserListResponse {
    data: UserItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface UserListFilters {
    q?: string;
    role?: string;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}
```

---

## 3) Mapper Specifications

Hàm chuyển đổi dữ liệu sử dụng các helper an toàn (`toNumberSafe`, `toArraySafe`) từ mapper dashboard để tránh crash runtime:

```typescript
import { toNumberSafe, toArraySafe } from "./dashboard.mapper";
import type { RawUserItem, RawUserListResponse, UserItem, UserListResponse } from "./user.dataHelper";

export const mapUserItem = (raw: RawUserItem): UserItem => {
    return {
        id: raw.id,
        fullName: raw.full_name || "N/A",
        email: raw.email || "N/A",
        username: raw.username ? (raw.username.startsWith("@") ? raw.username : `@${raw.username}`) : "@user",
        avatar: raw.avatar || undefined,
        role: raw.role || "user",
        status: raw.status || "active",
        ordersCount: toNumberSafe(raw.orders_count, 0),
        reviewsCount: toNumberSafe(raw.reviews_count, 0),
        joinedDate: raw.created_at ? new Date(raw.created_at).toLocaleDateString("vi-VN") : "N/A",
        createdAt: raw.created_at,
    };
};

export const mapUserList = (raw: RawUserListResponse | unknown): UserListResponse => {
    const rawCast = raw as RawUserListResponse;
    const items = toArraySafe<RawUserItem>(rawCast?.data || raw);

    return {
        data: items.map(mapUserItem),
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 10),
            total: toNumberSafe(rawCast?.total, items.length),
        },
    };
};
```

---

## 4) Validation Schemas

Màn hình Danh sách Người dùng có form lọc hoặc form đổi nhanh trạng thái, không chứa form tạo/sửa người dùng phức tạp (nhập liệu tạo mới thuộc scope màn hình `admin_users_create` riêng).
Các schema kiểm tra hợp lệ được thiết kế dưới dạng hàm nhận `t` dịch thuật để hỗ trợ đa ngôn ngữ:

```typescript
import * as yup from 'yup';
import { type TFunction } from 'i18next';

export const updateRoleSchema = (t: TFunction) => yup.object({
    role: yup.string().oneOf(['admin', 'staff', 'user'], t('validation.invalid_role')).required(t('validation.required')),
});

export const updateStatusSchema = (t: TFunction) => yup.object({
    status: yup.string().oneOf(['active', 'banned'], t('validation.invalid_status')).required(t('validation.required')),
});
```

---

## 5) API Module & Query Hooks Specifications

### 5.1) userApi.ts
Tích hợp trực tiếp với `axiosClient`:
- `getList(params)`: `GET /admin/users`
- `updateRole(id, role)`: `PATCH /admin/users/{id}/role`
- `updateStatus(id, status)`: `PATCH /admin/users/{id}/status`
- `delete(id)`: `DELETE /admin/users/{id}`
- `export(params)`: `GET /admin/users/export` (trả về kiểu `Blob` nhị phân)

### 5.2) useUserQueries.ts
Quản lý cache TanStack Query:
- `userKeys`: 
  - `all`: `['users']`
  - `lists`: `['users', 'list']`
  - `list`: `(filters, page, limit) => ['users', 'list', { filters, page, limit }]`
- `useAdminUsersQuery(filters, page, limit)`: Gọi API `getList` và map dữ liệu thông qua `mapUserList`. `staleTime` đặt là 30 giây.
- `useUserMutations()`:
  - `updateRoleMutation`: `PATCH /role`, invalidate `userKeys.all` khi thành công.
  - `updateStatusMutation`: `PATCH /status`, invalidate `userKeys.all` và `['dashboard']` (nếu việc khóa ảnh hưởng số liệu hoạt động).
  - `deleteMutation`: `DELETE /users/{id}`, invalidate `userKeys.all`.
  - `exportMutation`: Gọi API export nhị phân, xử lý thông qua helper `prepareSpreadsheetDownload` và tải xuống qua `downloadBlobFile`.

---

## 6) Handoff to Code Implementation

### Các tệp tin cần bổ sung / tạo mới:
1. `src/dataHelper/user.dataHelper.ts` [NEW]
2. `src/dataHelper/user.mapper.ts` [NEW]
3. `src/api/userApi.ts` [NEW]
4. `src/hooks/useUserQueries.ts` [NEW]

### Các tệp tin cần cập nhật sửa đổi:
1. `src/constants/endpoints.ts` [MODIFY] (Đăng ký endpoints mới)
