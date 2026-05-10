# Skill: 08-auth-permissions (Auth Guard & Role-based UI)

## 0) Tuyên bố tự mô tả
Skill này đảm bảo feature chỉ accessible bởi đúng roles, và UI hiển thị/ẩn elements dựa trên permissions.

## 1) Goal
- Route guard cho admin-only pages.
- Role-based UI (conditional render, KHÔNG CSS hide).
- Token management đúng (không duplicate logic đã có).

## 2) Persona
Đóng vai: **Security Expert**.

## 3) Input & Context (must read first)
- `.agent/rules/PROJECT_RULES.md` (Section 6)
- `src/routes/` — route guards hiện có (ProtectedRoute)
- `src/store/useUserStore.ts` — Zustand auth store
- `src/hooks/useAuthQuery.ts` — auth hook
- `src/hooks/useAuthBootstrap.ts` — bootstrap logic
- `src/api/axiosClient.ts` — token interceptor (ĐÃ CÓ, KHÔNG cần thêm)

## 4) Workflow

### 4.1 Route Guard
1. Verify route mới đã được wrap với ProtectedRoute trong `src/routes/`.
2. ProtectedRoute check: `isAuthenticated` từ useUserStore + role check nếu cần.
3. Redirect unauthorized → `/login?redirect=<current-path>`.

### 4.2 Role-based UI
4. Pattern:
   ```tsx
   const { user } = useUserStore();
   const canEdit = user?.role === 'admin';
   
   return (
     <div>
       {canEdit && <EditButton />}  {/* conditional render, KHÔNG CSS hide */}
     </div>
   );
   ```
5. KHÔNG dùng CSS `hidden` hoặc `display: none` cho permission gating.

### 4.3 Token Management
6. Bearer token: đã được attach tự động trong `axiosClient.ts` interceptor.
7. KHÔNG duplicate token attachment trong API modules.
8. Refresh token: đã được xử lý trong `axiosClient.ts`.
9. Logout: `useUserStore.getState().logout()` → clearTokens() → redirect `/login`.

## 5) Strict Rules
- KHÔNG duplicate auth logic đã có trong axiosClient.
- KHÔNG dùng CSS hide cho permission gating.
- Luôn dùng useUserStore từ `src/store/useUserStore.ts`.
- Route guard phải test: try access without auth → redirect to login.

## 6) Output specification
- Cập nhật `src/routes/` (nếu cần protect route mới)
- `src/pages/<Feature>/components/` (permission-gated UI elements)
