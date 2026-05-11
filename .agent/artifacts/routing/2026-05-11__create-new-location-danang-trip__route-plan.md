# Route Plan: Tạo Địa điểm mới
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-11
> Layout target: `MainLayout`

---

## 1) Summary
- **Mục tiêu**: Thiết lập routing và khung trang (skeleton) cho màn hình tạo địa điểm mới.
- **Phạm vi**: Route mới `/admin/locations/create`.

## 2) Target Routes
| Route Path | Page Component | Guard | Layout | Notes |
|---|---|---|---|---|
| `/admin/locations/create` | `Locations/LocationCreate` | `PrivateRoute` | `MainLayout` | Dùng lazy loading |

---

## 3) Page Structure
| File | Purpose | Status |
|---|---|---|
| `src/pages/Locations/LocationCreate/index.tsx` | Entry point, quản lý form và data fetching ban đầu | [NEW] |
| `src/pages/Locations/LocationCreate/components/LocationForm.tsx` | Form UI tách biệt để dễ bảo trì | [NEW] |

---

## 4) Navigation / Breadcrumb
| Item | Locale Key | Path | Icon | Notes |
|---|---|---|---|---|
| Menu | N/A | N/A | N/A | Không thêm vào sidebar (tạo từ nút "Thêm" ở List page) |
| Breadcrumb | `location:breadcrumb.create` | `/admin/locations/create` | `MapPin` | Home > Địa điểm > Tạo mới |

---

## 5) Locale Updates
### `public/lang/vi/location.json`
```json
{
  "breadcrumb": {
    "list": "Danh sách",
    "create": "Tạo mới"
  },
  "create": {
    "title": "Tạo Địa điểm mới",
    "subtitle": "Điền đầy đủ thông tin để thêm địa điểm vào hệ thống",
    "submit": "Lưu địa điểm",
    "discard": "Hủy bỏ",
    "success": "Đã thêm địa điểm thành công"
  }
}
```

### `public/lang/en/location.json`
```json
{
  "breadcrumb": {
    "list": "List",
    "create": "Create"
  },
  "create": {
    "title": "Create New Location",
    "subtitle": "Fill in the details to add a new location to the system",
    "submit": "Save Location",
    "discard": "Discard",
    "success": "Location added successfully"
  }
}
```

---

## 6) Risks / Notes
- **R-01**: Cần đảm bảo `LocationList` page có nút chuyển hướng đúng tới `/admin/locations/create`.
- **R-02**: Lazy loading page cần bọc trong `Suspense` (đã có logic `withSuspense` trong `routes/index.tsx`).

## 7) Files Expected To Change
- `src/routes/index.tsx`: Đăng ký route và lazy import.
- `public/lang/vi/location.json`: Thêm text i18n.
- `public/lang/en/location.json`: Thêm text i18n.
- `src/pages/Locations/LocationCreate/index.tsx`: Tạo file skeleton.
