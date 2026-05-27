# Auth & Permissions Review: Chỉnh sửa Bài viết Blog (admin_blog_posts_edit)

> Feature slug: `admin_blog_posts_edit`
> Date: 2026-05-27
> Route scope: `/admin/blog-posts/:id/edit`, `/admin/blog-posts/edit/:id`

---

## 1) Protected Routes
| Route | Guard | Required Role | Redirect Behavior | Notes |
|---|---|---|---|---|
| `/admin/blog-posts/:id/edit` | `<PrivateRoute />` | `admin` | Chuyển hướng về `/login` nếu chưa xác thực | Quản lý bằng `react-router-dom` v7 PrivateRoute guard |
| `/admin/blog-posts/edit/:id` | `<PrivateRoute />` | `admin` | Chuyển hướng về `/login` nếu chưa xác thực | Route alias để tương thích các link cũ |

## 2) Role Matrix
| Role | View | Create | Update | Delete | Export | Notes |
|---|---|---|---|---|---|---|
| admin | ✓ | ✓ | ✓ | ✓ | N/A | Có đầy đủ các quyền thao tác trên bài viết |
| staff (user)* | ✗ | ✗ | ✗ | ✗ | N/A | *Mặc dù hệ thống phân loại role là `'admin' \| 'user'`, nhưng chỉ có tài khoản có role `'admin'` mới được truy cập `/admin/*` portal. Do đó, người dùng thường (`'user'`) bị chặn hoàn toàn ở route level. |

## 2.1) Action Matrix
| Action | Allowed Role(s) | UI Behavior | Backend Expectation | Notes |
|---|---|---|---|---|
| Truy cập trang chỉnh sửa | `admin` | Hiển thị form chỉnh sửa bài viết | Yêu cầu Bearer Token hợp lệ của Admin | Bị chặn ở client-side bởi `PrivateRoute` |
| Cập nhật bài viết | `admin` | Cho phép nhấn lưu và gọi mutation update | API `PUT /admin/blog-posts/{id}` trả về 200 OK | Gửi request qua `axiosClient` đính kèm token |
| Nhân bản bài viết | `admin` | Cho phép nhân bản và redirect sang trang tạo mới | Không gọi API trực tiếp ở trang edit, truyền dữ liệu qua React Router state | Chuyển hướng đến `/admin/blog-posts/create` |
| Xóa bài viết | `admin` | Nút "Xóa bài viết" hiển thị bình thường | API `DELETE /admin/blog-posts/{id}` hoạt động bình thường | Cần xác nhận qua modal trước khi thực thi |
| Xóa bài viết (Staff/User) | Không được phép | Nút bị disabled và hiển thị tooltip cảnh báo quyền hạn | API trả về lỗi 403 Forbidden | Hiện tại chỉ kiểm tra `isAdmin` trên giao diện, nhưng thực tế `PrivateRoute` đã chặn role `user` từ ngoài |

## 3) Guarded UI Actions
| UI Element | Visible To | Why |
|---|---|---|
| Nút "Xóa bài viết" (Active) | `admin` | Chỉ Admin mới có quyền xóa tài nguyên hệ thống |
| Nút "Xóa bài viết" (Disabled + Tooltip) | `user` (Staff) | Để hiển thị rõ ràng rằng họ không có quyền hạn này (nếu bằng cách nào đó họ vào được trang) |

## 3.1) Hidden vs Disabled Decisions
| UI Element | Hidden or Disabled | Reason | Risk |
|---|---|---|---|
| Nút "Xóa bài viết" | Disabled + Tooltip | Cung cấp thông tin rõ ràng cho staff biết quyền hạn của họ thay vì ẩn hoàn toàn, giúp họ hiểu luồng hoạt động | Rủi ro bị thay đổi thuộc tính `disabled` trong DOM để click, tuy nhiên API backend cũng chặn bằng JWT check |

## 4) Token / Redirect Flow Review
| Area | Current Behavior | Expected Behavior | Status | Notes |
|---|---|---|---|---|
| Token attach | Tự động đính kèm qua Axios Interceptor | Tự động đính kèm `Authorization: Bearer <token>` | ✓ Passed | Triển khai trong `src/api/axiosClient.ts` |
| Logout | Xóa tokens và clear Zustand auth store | Redirect về `/login` và reset trạng thái auth | ✓ Passed | Triển khai trong `src/store/useUserStore.ts` |
| Unauthorized redirect | Tự động chuyển hướng về `/login` | Chuyển hướng về `/login` nếu chưa đăng nhập | ✓ Passed | Quản lý bởi `<PrivateRoute />` |
| Wrong role redirect | Tự động chuyển hướng về `/login` | Chuyển hướng về `/login` nếu role không phải `'admin'` | ✓ Passed | Quản lý bởi `<PrivateRoute />` sử dụng `hasRole(user, 'admin')` |

## 5) Risks / Assumptions
- [ASSUMPTION] A-01: Backend API thực hiện xác thực và phân quyền tương tự frontend: route `PUT /admin/blog-posts/{id}` và `DELETE /admin/blog-posts/{id}` bắt buộc có token admin.
- R-01: Nếu trong tương lai phát triển portal dành riêng cho Staff (user) có quyền viết blog nhưng không có quyền admin, cấu trúc route `<PrivateRoute />` bắt buộc phải thay đổi để cho phép cả role `user` truy cập một số trang cụ thể.

## 6) Files / Areas Affected
- `src/routes/index.tsx` (Route registration & `PrivateRoute` check)
- `src/pages/Blog/BlogPostEdit/index.tsx` (Phân quyền nút xóa dựa trên `isAdmin`)
- `src/store/useUserStore.ts` (State quản lý user & authReady)
