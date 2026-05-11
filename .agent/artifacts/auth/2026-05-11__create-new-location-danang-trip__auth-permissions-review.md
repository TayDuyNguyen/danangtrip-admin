# Auth & Permissions Review: Tạo Địa điểm mới
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-11
> Route scope: `/admin/locations`, `/admin/locations/create`

---

## 1) Protected Routes
| Route | Guard | Required Role | Redirect Behavior | Notes |
|---|---|---|---|---|
| `/admin/locations` | `PrivateRoute` | `admin` | Redirect to `/login` | Trang danh sách chính, yêu cầu quyền quản trị. |
| `/admin/locations/create` | `PrivateRoute` | `admin` | Redirect to `/login` | Trang tạo mới, kế thừa guard từ group. |

## 2) Role Matrix
| Role | View | Create | Update | Delete | Export | Notes |
|---|---|---|---|---|---|---|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | Có toàn quyền quản lý địa điểm. |
| staff | ❌ | ❌ | ❌ | ❌ | ❌ | [ASSUMPTION] Hiện tại role này chưa được định nghĩa trong Dashboard. |
| user | ❌ | ❌ | ❌ | ❌ | ❌ | Role người dùng cuối, bị chặn truy cập admin routes. |

## 3) Guarded UI Actions
| UI Element | Visible To | Why |
|---|---|---|
| Nút "Add Location" | `admin` | Chỉ admin mới được phép thêm dữ liệu vào hệ thống. |
| Nút "Export Excel" | `admin` | Dữ liệu xuất khẩu là nhạy cảm, chỉ dành cho quản trị viên. |
| Nút "Delete" (Single/Bulk) | `admin` | Hành động xóa dữ liệu là nhạy cảm, cần quyền cao nhất. |

## 4) Risks / Assumptions
- [ASSUMPTION] A-01: Hệ thống hiện tại chỉ hỗ trợ role `admin` truy cập Dashboard. Mọi kiểm tra quyền hạn đang được thực hiện tập trung tại `PrivateRoute`.
- [ASSUMPTION] A-02: Backend (API) thực hiện kiểm tra Token và Role (403 Forbidden) cho các endpoint nhạy cảm như POST/PUT/DELETE.
- R-01: Nếu phát sinh role `viewer` (chỉ xem), cần cập nhật `LocationList` để ẩn các nút "Add", "Edit", "Delete", "Export" bằng hook `hasRole`.
- R-02: Logic `PrivateRoute` hiện tại đang redirect về `/login` nếu không có role `admin`. Nếu user đã login nhưng không đủ role, nên redirect về trang `403 Unauthorized` thay vì login.
