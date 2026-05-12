---
name: 08-auth-permissions
description: Review route guards, permission checks, and role-based UI behavior. Use when a feature changes access control or exposes sensitive actions.
---

# Skill: 08-auth-permissions

## Overview

## When to Use

- When a feature changes guards, roles, sensitive actions, or permission-gated UI.
- When route protection or auth redirect behavior may be affected.
- When access control needs to be reviewed before handoff.

Skill này dùng để rà soát quyền truy cập, route guard, và role-based UI trước khi bàn giao feature có action nhạy cảm.
Mục tiêu không chỉ là "route có bị chặn hay không", mà còn phải làm rõ:

- ai được xem màn này
- ai được thực hiện từng action
- UI nào phải ẩn hoàn toàn
- logic redirect khi chưa đăng nhập hoặc sai role
- chỗ nào đang duplicate auth logic hoặc có nguy cơ drift với kiến trúc hiện tại

## Required Input

- `persona.md`
- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `.agent/memory/HANDOFF.md`
- `src/routes/`
- `src/store/useUserStore.ts`
- `src/hooks/useAuthQuery.ts`
- `src/hooks/useAuthBootstrap.ts`
- `src/api/axiosClient.ts`
- Analysis file từ `01-screen-analysis`
- Route plan từ `04-layout-routing` nếu feature có route mới
- Interaction spec từ `07-interactions` nếu feature có create/update/delete/export

## Recommended Questions To Answer

Trước khi kết luận auth/permission của feature, skill nên tự trả lời rõ:

1. Feature này là `public`, `authenticated-only`, hay `role-based`?
2. Nếu user chưa login mà đi vào route này thì điều gì xảy ra?
3. Nếu user đã login nhưng sai role thì điều gì xảy ra?
4. Có action nào đang chỉ "disable button" nhưng thực chất phải ẩn hoàn toàn không?
5. Có chỗ nào đang duplicate token attach / logout / permission logic không?

## Process

### 1) Route Guard Review

- Liệt kê tất cả route chịu ảnh hưởng
- Ghi rõ route nào đang:
  - đã được protect đúng
  - chưa protect nhưng cần protect
  - đang protect quá chặt hoặc quá lỏng
- Nếu route là nested route, phải ghi rõ guard đặt ở route-level hay layout-level

### 2) Permission Matrix Review

Không chỉ dừng ở `admin` và `staff`.
Nếu feature có action đặc biệt như `publish`, `approve`, `restore`, `export`, `bulk-delete`, phải ghi riêng từng action vào matrix.

### 3) UI Gating Review

Với từng UI quan trọng, cần xác định:

- có render hay không
- render ở role nào
- nếu không có quyền thì ẩn hoàn toàn hay disable + tooltip
- quyết định đó có phù hợp với security expectation không

### 4) Auth Flow Integrity Review

Kiểm tra các điểm sau:

- interceptor có tự gắn Bearer token đúng không
- logout có clear state + clear storage đúng không
- bootstrap có hydrate user/token đúng không
- route redirect có tạo vòng lặp không
- user refresh page ở protected route thì behavior có ổn không

### 5) Risk Review

Ghi rõ những rủi ro như:

- chỉ chặn ở UI nhưng không chặn ở route
- role matrix đang suy đoán từ UI chứ chưa có doc backend xác nhận
- cùng một permission nhưng được check theo nhiều kiểu khác nhau ở nhiều component

## Pattern Chuẩn Của Repo

### ProtectedRoute pattern — react-router-dom v7

```tsx
// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useUserStore();
  const location = useLocation();

  // Đang bootstrap (check token) — không redirect ngay
  if (isBootstrapping) return <PageSkeleton />;

  // Chưa login → redirect về login với return URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <Outlet />;
}
```

### useUserStore pattern — source of truth

```ts
// src/store/useUserStore.ts
interface UserState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setUser: (user: AdminUser) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  setUser: (user) => set({ user, isAuthenticated: true, isBootstrapping: false }),
  logout: () => {
    // Clear store
    set({ user: null, isAuthenticated: false });
    // Clear storage
    localStorage.removeItem('auth-token');
    // Redirect
    window.location.href = '/login';
  },
}));
```

### useAuthBootstrap — hydrate on app start

```ts
// src/hooks/useAuthBootstrap.ts
export function useAuthBootstrap() {
  const { setUser, logout } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      useUserStore.setState({ isBootstrapping: false });
      return;
    }

    // Verify token với backend
    authApi.getMe()
      .then(res => setUser(res.data.data))
      .catch(() => logout())
      .finally(() => useUserStore.setState({ isBootstrapping: false }));
  }, []);
}
```

### axiosClient interceptor — token attach tự động

```ts
// src/api/axiosClient.ts
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn → logout
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

### UI gating — conditional render, không CSS hide

```tsx
// GOOD: Conditional render — user không thể inspect DOM
const { user } = useUserStore();

{user?.role === 'admin' && (
  <button onClick={handleDelete}>Xóa</button>
)}

// GOOD: Ẩn hoàn toàn nếu không có quyền
{canExport && (
  <ExportButton onClick={handleExport} />
)}

// BAD: CSS hide — user vẫn thấy trong DOM
<button style={{ display: isAdmin ? 'block' : 'none' }}>
  Xóa
</button>

// BAD: Chỉ disable nhưng không ẩn khi cần ẩn hoàn toàn
<button disabled={!isAdmin}>Xóa</button>
```

### Permission matrix example

```
| Action        | admin | staff | guest |
|---------------|-------|-------|-------|
| View list     | ✓     | ✓     | ✗     |
| Create        | ✓     | ✓     | ✗     |
| Edit          | ✓     | ✓     | ✗     |
| Delete        | ✓     | ✗     | ✗     |
| Export        | ✓     | ✗     | ✗     |
| Bulk delete   | ✓     | ✗     | ✗     |
| Publish       | ✓     | ✗     | ✗     |
```

## Output Document

Tạo file:

- `.agent/artifacts/auth/YYYY-MM-DD__<feature-slug>__auth-permissions-review.md`

Template:

- `template_auth_review.md`

## Strict Rules

- Không duplicate auth logic ở API layer — interceptor đã xử lý token attach
- Không dùng CSS hide thay cho permission gating
- Guard route phải chỉ rõ redirect behavior
- Nếu không chắc role matrix, phải ghi `[ASSUMPTION]`
- Nếu chưa xác minh được backend auth level, phải ghi rõ "frontend-only assumption"
- Không kết luận "an toàn" nếu mới chỉ kiểm tra bề mặt UI

## Rationalizations

| Lý do hay gặp | Thực tế |
|---|---|
| "Feature này admin-only, không cần review" | Vẫn cần ghi N/A rõ ràng — không bỏ qua im lặng |
| "Chỉ cần check `isAuthenticated` là đủ" | Nếu có role-based action, cần check cả `user.role` |
| "CSS hide nhanh hơn conditional render" | User có thể inspect DOM và thấy hidden elements |
| "Interceptor đã xử lý 401, không cần check trong component" | Đúng — nhưng phải verify interceptor đang hoạt động đúng |
| "Staff không cần xóa, disable button là đủ" | Nếu action nhạy cảm, phải ẩn hoàn toàn — không chỉ disable |


## Red Flags

Nếu thấy những dấu hiệu sau, phải dừng và flag:

- Component tự gắn `Authorization` header thay vì để interceptor làm → duplicate logic
- `display: none` dùng để ẩn button theo permission → user thấy trong DOM
- Guard đặt trong component thay vì route level → dễ bị bypass khi thêm route mới
- Logout chỉ clear localStorage nhưng không clear Zustand store → stale auth state
- `useAuthBootstrap` không được gọi ở root → user bị logout khi refresh page
- Route redirect về `/login` nhưng `/login` cũng bị protect → infinite redirect loop

## Documentation Expectations

Auth review tốt phải có ít nhất:

- danh sách route chịu ảnh hưởng
- permission matrix chi tiết (per action, không chỉ per role)
- danh sách UI actions bị gate (hidden vs disabled)
- redirect behavior (unauthorized, wrong role, token expired)
- assumptions / risks / unresolved questions
- các file đang hoặc sẽ bị ảnh hưởng

## Verification

- Đối chiếu `checklist.md`
- Auth review phải có role matrix và guarded actions rõ ràng
- Auth review phải chỉ ra được ít nhất 1 trong 3 trạng thái cho mỗi action quan trọng:
  - `allowed`
  - `forbidden`
  - `needs confirmation`
