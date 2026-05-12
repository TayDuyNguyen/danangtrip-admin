# API Contract & Typing: Chỉnh sửa Địa điểm (Edit Location)

- **Feature Slug**: `edit-location`
- **Date**: 2026-05-11
- **Analysis Reference**: `.agent/artifacts/analysis/2026-05-11__edit-location__screen-analysis.md`
- **Backend Sync**: ✅ Confirmed (Added `GET /admin/locations/{id}`)
- **Status**: **LOCKED & VERIFIED**

---

## 1. Source Reconciliation

| Resource | Status | Note |
|---|---|---|
| `api_list.md` | ✅ Match | Khớp với các endpoint quản trị địa điểm. |
| `endpoints.ts` | ✅ Match | Sử dụng `API_ENDPOINTS.LOCATIONS.DETAIL(id)`, `UPDATE(id)`, v.v. |
| `src/types/location.ts` | ✅ Match | Đã có `RawLocation` và `CreateLocationInput`. |
| `danangtrip-api` | ✅ Verified | Đã bổ sung method `show` và repository `findWithDetails`. |

---

## 2. Type Design

### Raw Type (Backend Shape)
Sử dụng `RawLocation` từ `src/types/location.ts`.
```ts
export interface RawLocation {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    subcategory_id?: number;
    district: string;
    address: string;
    description: string;
    short_description?: string;
    price_level?: number | string;
    price_min?: number | string;
    price_max?: number | string;
    phone?: string;
    email?: string;
    website?: string;
    opening_hours?: string;
    latitude?: number | string;
    longitude?: number | string;
    thumbnail: string | null;
    images: string[] | null;
    status: 'active' | 'inactive';
    is_featured: boolean;
    tags?: Array<{ id: number; name: string }>; // Trả về trong Detail
    amenities?: Array<{ id: number; name: string; icon?: string }>; // Trả về trong Detail
}
```

### View Model (UI-consumable)
Sử dụng `LocationViewModel` từ `src/dataHelper/location.dataHelper.ts`.
- `priceLevelKey`: Chuyển đổi từ `price_level` (1-4) sang key i18n (`free`, `low`, `medium`, `high`).
- `latitude`/`longitude`: Luôn là `number`.
- `viewCountStr`/`favoriteCountStr`: Định dạng rút gọn (ví dụ: `1.5K`).

---

## 3. Validation Contract (`location.schema.ts`)

Sử dụng `updateLocationSchema` (mở rộng từ `createLocationSchema`).

| Field | Rule | Note |
|---|---|---|
| `name` | `required`, `min(3)` | Bắt buộc |
| `slug` | `required` | Tự động tạo nếu để trống, có cảnh báo SEO khi thay đổi. |
| `category_id` | `required` | Chọn từ danh mục. |
| `price_max` | `min(price_min)` | Ràng buộc logic giá. |
| `tags`/`amenities` | `array(number)` | Danh sách IDs để đồng bộ. |

---

## 4. API Module Contract (`locationApi.ts`)

Các method cần bổ sung/cập nhật:

```ts
export const locationApi = {
    // Lấy chi tiết địa điểm cho Admin
    getDetail: (id: number): Promise<ApiResponse<RawLocation>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.DETAIL(id)),

    // Cập nhật địa điểm
    update: (id: number, data: UpdateLocationInput): Promise<ApiResponse<RawLocation>> =>
        axiosClient.put(API_ENDPOINTS.LOCATIONS.UPDATE(id), data),

    // Auto-save Tags
    attachTags: (id: number, tagIds: number[]) =>
        axiosClient.post(API_ENDPOINTS.LOCATIONS.TAGS(id), { tag_ids: tagIds }),

    detachTag: (id: number, tagId: number) =>
        axiosClient.delete(API_ENDPOINTS.LOCATIONS.DETACH_TAG(id, tagId)),

    // Auto-save Amenities
    attachAmenities: (id: number, amenityIds: number[]) =>
        axiosClient.post(API_ENDPOINTS.LOCATIONS.AMENITIES(id), { amenity_ids: amenityIds }),

    detachAmenity: (id: number, amenityId: number) =>
        axiosClient.delete(API_ENDPOINTS.LOCATIONS.DETACH_AMENITY(id, amenityId)),
};
```

---

## 5. Mapper Contract (`location.mapper.ts`)

- `mapLocationToViewModel`: Cần đảm bảo handle việc map `tags` và `amenities` từ mảng object (backend) sang mảng ID (frontend form) nếu cần, hoặc giữ nguyên object cho UI hiển thị.
- `toNumberSafe`: Sử dụng cho các trường tọa độ và giá cả.

---

## 6. Files Expected To Change

- **[MODIFY]** `src/api/locationApi.ts`: Thêm các method detail và auto-save.
- **[MODIFY]** `src/validations/location.schema.ts`: Export `UpdateLocationInput` và schema liên quan.
- **[NEW]** `src/hooks/useLocationQueries.ts`: Triển khai các hook React Query:
    - `useLocationDetail(id)`
    - `useUpdateLocation()`
    - `useLocationAutoSave(id)` (cho Tags/Amenities)

---

## 7. Verification Plan

1. **Type Check**: Chạy `npm run typecheck`.
2. **API Testing**: Kiểm tra network tab khi thực hiện chỉnh sửa để xác nhận các request `PUT`, `POST` (tags), `DELETE` (amenities) được gọi đúng lúc.
3. **Consistency**: Đảm bảo màn hình chỉnh sửa hiển thị đúng dữ liệu đã lưu sau khi refresh.
