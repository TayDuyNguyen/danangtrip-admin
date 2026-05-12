# Route & Layout Plan: Chỉnh sửa Địa điểm (Edit Location)

Kế hoạch này xác định cách thức đăng ký route, cấu hình layout và chuẩn bị page skeleton cho tính năng chỉnh sửa địa điểm.

---

## 1. Route Registration Plan

| Property | Value | Note |
|---|---|---|
| **Route Path** | `/admin/locations/edit/:id` | Đồng bộ với `ROUTES.LOCATIONS_EDIT` trong `routes.ts`. |
| **Page Component** | `LocationEdit` | Lazy loaded từ `@/pages/Locations/LocationEdit`. |
| **Layout** | `MainLayout` | Kế thừa layout chung của admin (Sidebar + Header). |
| **Guard** | `PrivateRoute` | Yêu cầu quyền Admin (đã được bọc ở cấp cha). |

### File Changes:
- **[MODIFY]** `src/routes/index.tsx`: 
    - Import `LocationEdit` bằng `React.lazy`.
    - Thêm route vào mảng children của `MainLayout`.

```tsx
const LocationEdit = React.lazy(() => import('@/pages/Locations/LocationEdit'));

// ... inside router
{ path: ROUTES.LOCATIONS_EDIT, element: withSuspense(LocationEdit) },
```

---

## 2. Navigation & Breadcrumbs

### Breadcrumb Mapping:
Khi ở trang chỉnh sửa, breadcrumb sẽ hiển thị:
1. `Dashboard` (/)
2. `Địa điểm` (/admin/locations)
3. `Chỉnh sửa` (current)

### Sidebar State:
- Menu **Địa điểm** (`/admin/locations`) sẽ được active và expand.
- Điều này đã được handle tự động trong `Sidebar.tsx` nhờ logic `location.pathname.startsWith('/admin/locations')`.

---

## 3. Page Structure (Skeleton)

Tạo thư mục và file mới: `src/pages/Locations/LocationEdit/index.tsx`.

### Section chính:
- **Header Section**: Chứa tiêu đề "Chỉnh sửa địa điểm" và nút quay lại.
- **Form Section**: Reuse hoặc kế thừa logic từ màn hình Create nhưng với mode `edit`.
- **Action Sidebar**: Chứa các card quản lý Tags, Amenities và Trạng thái (Auto-save logic).

---

## 4. i18n Planning

Cần bổ sung các key sau vào `public/lang/vi/location.json` và `en/location.json`:

| Key | Vietnamese | English |
|---|---|---|
| `edit_title` | "Chỉnh sửa Địa điểm" | "Edit Location" |
| `edit_subtitle` | "Cập nhật thông tin cho địa điểm {{name}}" | "Update information for {{name}}" |
| `form.actions.update_location` | "Cập nhật địa điểm" | "Update Location" |
| `form.actions.updating` | "Đang cập nhật..." | "Updating..." |

---

## 5. Files Expected To Change

1. **[MODIFY]** `src/routes/index.tsx`: Đăng ký route.
2. **[NEW]** `src/pages/Locations/LocationEdit/index.tsx`: Component trang.
3. **[MODIFY]** `public/lang/vi/location.json`: Thêm ngôn ngữ.
4. **[MODIFY]** `public/lang/en/location.json`: Thêm ngôn ngữ.

---

## 6. Verification Plan

1. **Route Access**: Truy cập `/admin/locations/edit/123` xem có render đúng skeleton không.
2. **Layout Integrity**: Đảm bảo Sidebar vẫn hiển thị và menu Location được đánh dấu active.
3. **i18n Check**: Chuyển đổi ngôn ngữ để xác nhận tiêu đề thay đổi tương ứng.
