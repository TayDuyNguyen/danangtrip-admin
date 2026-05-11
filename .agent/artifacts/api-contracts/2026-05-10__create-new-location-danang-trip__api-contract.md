# API Contract: Tạo Địa điểm mới
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-10
> Backend base: `/api/v1`

---

## 1) Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | 🔐 | Lấy danh sách danh mục để chọn khi tạo |
| GET | `/tags?type=location` | 🔐 | Lấy danh sách tags cho địa điểm |
| GET | `/amenities` | 🔐 | Lấy danh sách tiện ích |
| POST | `/admin/locations` | 🛡️ | Tạo địa điểm mới |
| POST | `/upload/image` | 🔐 | Upload ảnh đại diện/thư viện |

---

## 1.1) Source References
- `api_list.md`: Section `LOCATIONS (Địa điểm)` -> `POST /admin/locations` (Line 73).
- `endpoints.ts`: Cần bổ sung `LOCATIONS` group.
- Analysis file: `2026-05-10__create-new-location-danang-trip__screen-analysis.md`.

## 2) Request Schemas

### Create Location Input (Payload)
```ts
export interface CreateLocationInput {
  name: string;
  slug: string;
  category_id: number;
  subcategory_id?: number;
  description: string;
  short_description: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: string;
  price_min?: number;
  price_max?: number;
  price_level?: number; // 1-4
  thumbnail: string;
  images?: string[];
  video_url?: string;
  status: 'active' | 'inactive';
  is_featured: boolean;
}
```

---

## 3) Response Shapes

### Create Success Response
```json
{
  "code": 201,
  "message": "Location created successfully",
  "data": {
    "id": 123,
    "name": "Bà Nà Hills",
    "slug": "ba-na-hills",
    // ... all fields from CreateLocationInput
    "created_at": "2026-05-10T16:00:00Z",
    "updated_at": "2026-05-10T16:00:00Z"
  }
}
```

---

## 4) TypeScript Interfaces

### Raw (API shape) — Update `src/types/location.ts`
```ts
export interface RawLocation {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    subcategory_id?: number; // [NEW]
    district_id?: number | string;
    address: string;
    description: string;
    short_description?: string; // [NEW]
    latitude?: number | string; // [NEW]
    longitude?: number | string; // [NEW]
    phone?: string; // [NEW]
    email?: string; // [NEW]
    website?: string; // [NEW]
    opening_hours?: string; // [NEW]
    price_min?: number | string; // [NEW]
    price_max?: number | string; // [NEW]
    price_level?: number | string;
    thumbnail: string | null;
    images: string[] | null;
    video_url?: string; // [NEW]
    status: 'active' | 'inactive';
    is_featured: boolean;
    view_count: number;
    favorite_count: number;
    avg_rating?: number;
    rating?: number;
    review_count: number;
    created_at: string;
    updated_at: string;
    district?: string;
    category?: {
        id: number;
        name: string;
    };
}
```

### ViewModel (UI shape) — Update `src/dataHelper/location.dataHelper.ts`
```ts
export interface LocationViewModel {
    id: number;
    name: string;
    slug: string;
    thumbnail: string | null;
    address: string;
    district: string;
    category: string;
    priceLevelKey: string;
    rating: number;
    reviewCount: number;
    status: 'active' | 'inactive';
    isFeatured: boolean;
    viewCountStr: string;
    favoriteCountStr: string;
    // Extra fields for Detail/Edit if needed
    lat?: number;
    lng?: number;
    description?: string;
}
```

---

## 5) Yup Schema — `src/validations/location.schema.ts`
```ts
import * as yup from 'yup';
import { TFunction } from 'i18next';

export const locationSchema = (t: TFunction) => yup.object({
  name: yup.string().required(t('validation:required')).min(5, t('validation:min_length', { count: 5 })),
  slug: yup.string().required(t('validation:required')).matches(/^[a-z0-9-]+$/, t('validation:invalid_slug')),
  category_id: yup.number().required(t('validation:required')),
  description: yup.string().required(t('validation:required')).min(50, t('validation:min_length', { count: 50 })),
  short_description: yup.string().required(t('validation:required')).max(200, t('validation:max_length', { count: 200 })),
  address: yup.string().required(t('validation:required')),
  district: yup.string().required(t('validation:required')),
  latitude: yup.number().required(t('validation:required')).min(-90).max(90),
  longitude: yup.number().required(t('validation:required')).min(-180).max(180),
  phone: yup.string().nullable().matches(/^\d{10,11}$/, { message: t('validation:invalid_phone'), excludeEmptyString: true }),
  email: yup.string().nullable().email(t('validation:invalid_email')),
  website: yup.string().nullable().url(t('validation:invalid_url')),
  price_min: yup.number().nullable().min(0, t('validation:min_value', { count: 0 })),
  price_max: yup.number().nullable().min(yup.ref('price_min'), t('validation:price_max_min')),
  thumbnail: yup.string().required(t('validation:required')),
  status: yup.string().oneOf(['active', 'inactive']).required(),
  is_featured: yup.boolean().default(false),
});

export type LocationFormValues = yup.InferType<ReturnType<typeof locationSchema>>;
```

---

## 6) Error Codes
| Code | Meaning | UI handling |
|------|---------|-------------|
| 422 | Validation error | Hiển thị lỗi dưới từng field (name, slug, etc.) |
| 409 | Conflict (Slug exists) | Báo lỗi tại field Slug: "Slug đã tồn tại" |
| 401 | Unauthorized | Tự động redirect về trang Login (via axiosClient) |

---

## 7) Files Expected To Change
- `src/constants/endpoints.ts`: Thêm `API_ENDPOINTS.LOCATIONS`.
- `src/types/location.ts`: Cập nhật `RawLocation`.
- `src/api/locationApi.ts`: Refactor dùng `API_ENDPOINTS` và thêm `createLocation`.
- `src/dataHelper/location.mapper.ts`: Cập nhật mapping cho các trường mới.
- `src/dataHelper/location.dataHelper.ts`: Cập nhật `LocationViewModel`.
- `src/validations/location.schema.ts`: [NEW] Tạo schema validation.
