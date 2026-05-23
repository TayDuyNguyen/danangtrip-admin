# Deploy Report: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `deployment release report`

---

## 1) Deployment Status & Verification

Màn hình Danh sách Người dùng (`/admin/users`) đã vượt qua toàn bộ các thử nghiệm kiểm định chất lượng nghiêm ngặt và đã sẵn sàng triển khai:

- **Quality Gate (`npm run prepush:check`):** **PASS** ✅
- **TypeScript Compilation:** **PASS** ✅
- **ESLint Analysis:** **PASS** ✅
- **Production Bundle Build:** **PASS** ✅
- **E2E Playwright Console Error Check:** **PASS** ✅ (5/5 tests passed)

---

## 2) Artifact Inventory (Danh sách tệp tin thay đổi)

Dưới đây là danh sách toàn bộ các file được tạo mới và chỉnh sửa phục vụ tính năng này:

### 2.1) Tạo mới (NEW)
1. `src/dataHelper/user.dataHelper.ts` (TypeScript interfaces thô & ViewModel)
2. `src/dataHelper/user.mapper.ts` (Hàm ánh xạ mappers an toàn)
3. `src/api/userApi.ts` (API Client module kết nối axios)
4. `src/hooks/useUserQueries.ts` (Hooks React Query & mutations)
5. `public/lang/vi/user.json` (Dịch tiếng Việt hoàn chỉnh)
6. `public/lang/en/user.json` (Dịch tiếng Anh hoàn chỉnh)
7. `src/pages/Users/UserList/index.tsx` (Trang chính điều phối)
8. `src/pages/Users/UserList/components/UserStatsRow.tsx` (Stats Row component)
9. `src/pages/Users/UserList/components/UserFilterBar.tsx` (Thanh lọc component)
10. `src/pages/Users/UserList/components/UserTable.tsx` (Bảng chính component)
11. `src/pages/Users/UserList/components/DeleteUserDialog.tsx` (Dialog confirm xóa)
12. `src/pages/Users/UserList/components/UpdateRoleDialog.tsx` (Dialog confirm quyền)

### 2.2) Chỉnh sửa (MODIFY)
1. `src/constants/endpoints.ts` (Đăng ký endpoint quản lý users)
2. `src/routes/routes.ts` (Đăng ký hằng số định tuyến `USERS_LIST`)
3. `src/routes/index.tsx` (Tích hợp lazy load & PrivateRoute)
4. `src/components/common/Sidebar.tsx` (Liên kết menu Sidebar)
5. `src/i18n/index.ts` (Đăng ký i18n namespace `'user'`)
6. `src/api/index.ts` (Export `userApi`)
7. `src/dataHelper/index.ts` (Export user helpers & mappers)
8. `src/hooks/index.ts` (Export `useUserQueries`)

---

## 3) Deployment Checklist

- [x] Đăng ký router, route constant và liên kết Sidebar.
- [x] Đồng bộ hóa i18n tiếng Việt và tiếng Anh với đầy đủ key.
- [x] Loại bỏ hoàn toàn các chuỗi cứng tiếng Anh (Role, Status, YOU, bulk delete confirm) và định dạng ngày/số sang i18n động.
- [x] Cài đặt cơ chế bảo vệ Admin tự khóa hoặc tự hạ quyền tài khoản chính mình (BR-01).
- [x] Đồng bộ bộ lọc và tìm kiếm lên URL Search Params (BR-03).
- [x] Kiểm tra typecheck tĩnh và cú pháp linter thành công.
- [x] Biên dịch Vite build ra thư mục `dist/` thành công không lỗi.
- [x] Chạy E2E console testing thông qua Playwright thành công.
