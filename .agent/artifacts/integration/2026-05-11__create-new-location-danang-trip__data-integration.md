# Data Integration Plan: Tạo Địa điểm mới
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-11
> API module: `src/api/locationApi.ts`

---

## 1) Data Sources
| Purpose | Endpoint | Hook | Notes |
|---|---|---|---|
| Lấy danh mục | `GET /categories` | `useLocationCategoriesQuery` | Dùng chung với list filter hoặc tạo mới |
| Lấy danh sách Tags | `GET /tags?type=location` | `useLocationTagsQuery` | [NEW] |
| Lấy danh sách tiện ích | `GET /amenities` | `useLocationAmenitiesQuery` | [NEW] |
| Lấy danh sách quận huyện | `GET /admin/locations/districts` | `useLocationFilterDistrictsQuery` | [REUSE] |
| Tạo địa điểm mới | `POST /admin/locations` | `useCreateLocationMutation` | [NEW] |
| Upload ảnh | `POST /upload/image` | `useUploadImageMutation` | Có thể reuse từ common upload hook nếu có |

---

## 2) Query Plan
| Query Key | Query Type | Trigger | staleTime | Mapper |
|---|---|---|---|---|
| `['locations', 'categories']` | Lookup | Component Mount | 30m | N/A (Simple list) |
| `['locations', 'tags']` | Lookup | Component Mount | 30m | N/A (Simple list) |
| `['locations', 'amenities']` | Lookup | Component Mount | 30m | N/A (Simple list) |
| `['locations', 'districts']` | Lookup | Component Mount | 30m | N/A (Simple list) |

---

## 3) Mutation Plan
| Action | API Method | Success Handling | Error Handling |
|---|---|---|---|
| `createLocation` | POST | Toast success + Redirect `/admin/locations` + Invalidate lists | Toast error + scrollToFirstError |
| `uploadImage` | POST | Cập nhật URL vào form field | Toast error |

---

## 4) UI State Handling
| UI Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Dropdown Danh mục | Skeleton (Select box) | N/A | Retry button | Render options |
| Tag Selector | Skeleton (Chips) | "Không có tag" | Hidden | Render chips |
| Map Picker | Spinner | Center Danang | Red border | Marker placed |
| Submit Button | Spinner icon + Disabled | N/A | Enabled | Redirecting... |

---

## 5) Files Expected To Change
- `src/hooks/useLocationQueries.ts`: Thêm hooks cho Categories, Tags, Amenities và Create Mutation.
- `src/api/locationApi.ts`: Thêm method `createLocation`, `getTags`, `getAmenities`.
- `src/pages/Locations/LocationCreate/index.tsx`: Sử dụng các hooks đã tạo.
