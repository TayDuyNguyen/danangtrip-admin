# Data Integration Plan: Chỉnh sửa Địa điểm (Edit Location)

Kế hoạch này chi tiết cách kết nối API backend vào giao diện frontend thông qua TanStack Query, Mappers và Muted State handling.

---

## 1. Data Sources & Queries

### New Queries

| Hook | Key | Purpose | Dependency |
|---|---|---|---|
| `useLocationDetail(id)` | `['locations', 'detail', id]` | Lấy thông tin chi tiết địa điểm để pre-fill form. | Yêu cầu `id`. |

### Reused Queries
- `useLocationCategoriesQuery()`: Lấy danh sách danh mục để chọn.
- `useLocationTagsQuery()`: Lấy danh sách tags (cho sidebar/selector).
- `useLocationAmenitiesQuery()`: Lấy danh sách tiện ích.
- `useLocationFilterDistrictsQuery()`: Lấy danh sách Quận/Huyện.

---

## 2. Mutations & Cache Strategy

### New Mutations

| Action | Hook | Invalidation Strategy | Feedback |
|---|---|---|---|
| **Update Location** | `useUpdateLocationMutation()` | Invalidate `['locations', 'list']`, `['locations', 'detail', id]`. | Toast Success/Error. |
| **Manage Tags** | `useSyncLocationTagsMutation()` | Invalidate `['locations', 'detail', id]`. | Quiet (Auto-save) hoặc Toast. |
| **Manage Amenities** | `useSyncLocationAmenitiesMutation()` | Invalidate `['locations', 'detail', id]`. | Quiet (Auto-save) hoặc Toast. |

> [!IMPORTANT]
> Việc invalidate `['locations', 'list']` đảm bảo khi quay lại trang danh sách, dữ liệu mới nhất sẽ được hiển thị mà không cần F5.

---

## 3. Data Mapping Logic

### API → ViewModel
Reuse `mapLocationToViewModel` trong `location.mapper.ts`. Cần đảm bảo mapper này xử lý tốt các trường lồng nhau như `category`, `tags`, `amenities`.

### Form → API Payload
Tạo helper để chuyển đổi dữ liệu từ `react-hook-form` sang định dạng API yêu cầu (snake_case, lọc bỏ các trường không cần thiết như `stats`).

---

## 4. UI State Handling

### Page Level
- **Loading**: Sử dụng `LocationFormSkeleton` trong khi chờ `useLocationDetail` trả về dữ liệu.
- **Error**: Hiển thị `ErrorWidget` nếu không load được data (VD: ID không tồn tại).

### Action Level
- **Submitting**: Disable nút "Cập nhật" và hiển thị spinner/loading text.
- **Auto-save**: Hiển thị indicator nhỏ "Đang lưu..." ở góc card Tags/Amenities.

---

## 5. Files Expected To Change

1. **[MODIFY]** `src/api/locationApi.ts`: Thêm method `getDetail`, `update`.
2. **[MODIFY]** `src/hooks/useLocationQueries.ts`: Thêm hook `useLocationDetail`, `useUpdateLocation`.
3. **[NEW]** `src/components/loading/LocationFormSkeleton.tsx`: Skeleton cho form.
4. **[MODIFY]** `src/dataHelper/location.mapper.ts`: Bổ sung mapper cho update payload nếu cần.

---

## 6. Verification Plan

1. **Data Load**: Truy cập trang edit, kiểm tra Network tab xem query `detail` có chạy đúng ID không.
2. **Pre-fill**: Đảm bảo tất cả các field (tên, slug, ảnh, tags) đều hiển thị đúng giá trị từ API.
3. **Cache Sync**: Sau khi update, quay lại danh sách kiểm tra xem dữ liệu có được cập nhật tự động không.
