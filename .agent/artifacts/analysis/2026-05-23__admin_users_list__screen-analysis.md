# Screen Analysis: Danh sách Người dùng

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Mockup/SRS: `D:\DATN\DATN_Document\docs\page\admin_users_list.md`

---

## 1) Summary
- **Mục đích màn hình:** Quản lý tài khoản người dùng trong hệ thống (tìm kiếm, lọc, phân quyền, khóa/mở khóa tài khoản, xóa tài khoản, và xuất Excel báo cáo). Đây là màn hình thuộc nhóm quản trị hệ thống cốt lõi (User CRUD cluster).
- **Người dùng chính:** Admin (toàn quyền quản lý tài khoản và phân quyền Admin/Staff), Staff (chỉ xem danh sách và có thể thay đổi trạng thái hoặc xóa tài khoản thường theo cấu hình nghiệp vụ).
- **Thuộc feature/module:** Quản lý Người dùng (`Users Management`).
- **Source inputs:**
  - Quy cách nghiệp vụ: [admin_users_list.md](file:///D:/DATN/DATN_Document/docs/page/admin_users_list.md)
  - Hệ thống API của dự án: [api_list.md](file:///D:/DATN/DATN_Document/docs/api/api_list.md)
  - Quy chuẩn thiết kế: [DESIGN.md](file:///d:/DATN/danangtrip-admin/DESIGN.md)
  - Cấu trúc định tuyến: [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx) và [routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts)

---

## 2) Component Breakdown

### [REUSE] — Components đã có
Chúng tôi tái sử dụng các component dùng chung (common) và nguyên tử (ui) có sẵn trong dự án để đảm bảo sự thống nhất tuyệt đối về thiết kế và tiết kiệm tài nguyên:

| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `MainLayout` | `src/layouts/MainLayout.tsx` | Không | Layout bao ngoài trang chứa sidebar và header. |
| `StatCard` | `src/components/common/StatCard.tsx` | Không | Component thẻ thống kê hiển thị thông số. |
| `EmptyState` | `src/components/common/EmptyState.tsx` | Không | Component hiển thị khi danh sách trống. |
| `ErrorWidget` | `src/components/common/ErrorWidget.tsx` | Không | Component hiển thị khi có lỗi truy vấn dữ liệu. |
| `Pagination` | `src/components/common/Pagination.tsx` | Không | Điều hướng phân trang. |
| `TextInput` | `src/components/ui/TextInput.tsx` | Không | Ô nhập dữ liệu tìm kiếm. |
| `CustomSelect` | `src/components/ui/CustomSelect.tsx` | Không | Dropdown chọn role và status trong FilterBar. |
| `Badge` | `src/components/ui/Badge.tsx` | Không | Nhãn hiển thị trạng thái và vai trò. |

### [NEW] — Components cần tạo mới
Các component đặc thù của chức năng quản trị người dùng sẽ được tạo mới bên trong thư mục quản lý trang: `src/pages/Users/UserList/components/`

| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| `UserStatsRow` | Hiển thị 4 thẻ thống kê về số lượng người dùng. | Molecule | `UserStatsRowProps { total: number; active: number; banned: number; staffAndAdmin: number; isLoading?: boolean; }` |
| `UserFilterBar` | Thanh công cụ chứa ô tìm kiếm (debounce) và bộ lọc dropdown cho vai trò, trạng thái và nút đặt lại. | Organism | `UserFilterBarProps { filters: UserListFilters; onFilterChange: (newFilters: UserListFilters) => void; onReset: () => void; }` |
| `UserTable` | Bảng hiển thị danh sách người dùng, tích hợp checkbox, đổi quyền, toggle trạng thái, và các nút hành động. | Organism | `UserTableProps { data: UserItem[]; isLoading: boolean; selectedIds: number[]; onSelectRow: (id: number) => void; onSelectAll: (checked: boolean) => void; onRoleChange: (id: number, newRole: string) => void; onStatusToggle: (id: number, currentStatus: string) => void; onDelete: (id: number) => void; currentUserId?: number; sorting: { sortBy: string; sortOrder: 'asc' \| 'desc' }; onSort: (field: string) => void; }` |
| `DeleteUserDialog` | Modal cảnh báo xác nhận xóa tài khoản vĩnh viễn kèm theo các cảnh báo rủi ro về đơn hàng/đánh giá. | Organism | `DeleteUserDialogProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; userName: string; isMutating?: boolean; }` |
| `UpdateRoleDialog` | Modal xác nhận khi thay đổi quyền của người dùng thường lên Admin để tránh sai sót. | Organism | `UpdateRoleDialogProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; userName: string; isMutating?: boolean; }` |

### [MOD] — Components cần chỉnh sửa
Các tệp cấu trúc hệ thống cần cập nhật để đăng ký màn hình mới:

| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| `ROUTES` | `src/routes/routes.ts` | Thêm hằng số `USERS_LIST: '/admin/users'`. | Toàn bộ ứng dụng có thể tham chiếu route đồng nhất. |
| `AppRoute` | `src/routes/index.tsx` | Lazy load `UserList` và đăng ký route khớp với `ROUTES.USERS_LIST` dưới quyền `PrivateRoute`. | Cho phép truy cập `/admin/users` trên thanh địa chỉ. |
| `Sidebar` | `src/components/common/Sidebar.tsx` | Thay đường dẫn cứng `/admin/users` tại dòng 59 bằng hằng số `ROUTES.USERS_LIST` để đồng bộ. | Đảm bảo tính liên kết khi đổi cấu hình route sau này. |

---

## 3) Responsive Behavior
Giao diện tuân thủ quy chuẩn thiết kế grid và Material-glass trong `DESIGN.md` để tự động thích ứng với các kích cỡ màn hình khác nhau:

| Breakpoint | Layout | Note |
|------------|--------|------|
| **Desktop** (≥1024px) | - Stats Row: `grid-cols-4` (4 cột đầy đủ).<br>- Filter Bar: `flex-row` (các bộ lọc nằm ngang thẳng hàng).<br>- Table: Hiển thị đầy đủ tất cả các cột. | Trải nghiệm quản trị đầy đủ và mật độ thông tin tối ưu nhất. |
| **Tablet** (768px-1023px) | - Stats Row: `grid-cols-2` (chia thành 2 dòng, mỗi dòng 2 cột).<br>- Filter Bar: Tự động xuống dòng (`flex-wrap`) các select box.<br>- Table: Ẩn cột "Ngày tham gia" và "Đánh giá" để tập trung vào thông tin cốt lõi. | Giao diện tự động co dãn, thanh cuộn bảng chỉ hiển thị khi cần thiết. |
| **Mobile** (<768px) | - Stats Row: `grid-cols-1` (dọc đứng chồng lên nhau).<br>- Filter Bar: `flex-col` (mỗi bộ lọc chiếm trọn 1 dòng rộng 100%).<br>- Table: Sử dụng khối cuộn ngang hoặc ẩn bớt các cột "Đơn hàng", "Đánh giá", "Ngày tham gia". Cột người dùng chỉ hiển thị tên viết tắt và avatar gọn. | Menu dọc tự động thu nhỏ (Sidebar collapsed), tối ưu khoảng trống cho nội dung bảng. |

---

## 4) UI States

| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| **User Stats Row** | Hiển thị `Skeleton` nhấp nháy cho từng ô thống kê. | Hiển thị giá trị mặc định là `0`. | Hiển thị dấu gạch ngang `-` hoặc ẩn nhẹ. | N/A | N/A | N/A |
| **User Filter Bar** | Các select input bị disable tạm thời. | Vẫn hiển thị bình thường. | Toast thông báo lỗi bộ lọc. | N/A | N/A | Hover viền input đổi sang xanh teal `#14B8A6`. |
| **User Table** | Render `Skeleton` cho 5 dòng bảng để tạo cảm giác tải mượt. | Hiển thị `EmptyState` kèm icon `PersonOff` và nút "Thêm người dùng". | Hiển thị `ErrorWidget` kèm nút "Tải lại trang" (`retry`). | Hiển thị danh sách dữ liệu thực tế. | Checkbox bị khóa nếu đang gửi yêu cầu đột biến (mutation). | Hover dòng: `bg-slate-50/50`. Chọn checkbox: `bg-[#14B8A6]/5`. |
| **Inline Actions** | Nút thao tác hiển thị spinner nhỏ, giảm độ mờ (opacity). | N/A | Hiển thị Toast thông báo lỗi đặc thù (ví dụ: Không thể tự khóa tài khoản). | Hiển thị Toast thành công dạng xanh lá và invalidate cache để load lại. | Vô hiệu hóa nút thao tác đối với chính tài khoản Admin đang đăng nhập. | Đổi màu icon hành động tương ứng (`#14B8A6` cho Xem, `#F59E0B` cho Sửa, `#EF4444` cho Khóa/Xóa). |
| **Dialogs (Xóa/Quyền)** | Nút hành động chính chuyển sang trạng thái loading (spinner), nút hủy bị vô hiệu hóa. | N/A | Toast lỗi từ backend và giữ nguyên Modal để kiểm tra lại dữ liệu. | Toast thành công, đóng Modal và invalidate danh sách. | N/A | N/A |

---

## 5) Data Fields

| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `id` | `number` | ✓ | Số nguyên dương | `12` | `GET /admin/users` |
| `full_name` | `string` | ✓ | Tối đa 200 ký tự | `"Nguyễn Văn An"` | `GET /admin/users` |
| `email` | `string` | ✓ | Email hợp lệ | `"an.nguyen@example.com"` | `GET /admin/users` |
| `username` | `string` | ✓ | Ký tự chữ, số và dấu gạch dưới | `"nguyenvanan"` | `GET /admin/users` |
| `avatar` | `string \| null` | ✗ | Đường dẫn URL ảnh hợp lệ | `"https://res.cloudinary.com/avatar.jpg"` | `GET /admin/users` |
| `role` | `'admin' \| 'staff' \| 'user'` | ✓ | Chỉ chấp nhận các giá trị định trước | `"user"` | `GET /admin/users` |
| `status` | `'active' \| 'banned'` | ✓ | Chỉ chấp nhận các giá trị định trước | `"active"` | `GET /admin/users` |
| `orders_count` | `number` | ✗ | Số nguyên không âm | `12` | `GET /admin/users` |
| `reviews_count` | `number` | ✗ | Số nguyên không âm | `5` | `GET /admin/users` |
| `created_at` | `string` | ✓ | Định dạng ngày ISO | `"2026-05-23T02:00:00Z"` | `GET /admin/users` |

---

## 6) API Endpoints

| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| **GET** | `/admin/users` | ✓ (Bearer Token) | Params: `q`, `role`, `status`, `page`, `per_page`, `sort_by`, `sort_order` | `ApiResponse<AdminRawUserListResponse>` | **✓ Cần bổ sung** |
| **PATCH**| `/admin/users/{id}/role` | ✓ (Bearer Token) | Payload: `{ role: 'admin' \| 'staff' \| 'user' }` | `ApiResponse<AdminRawUserItem>` | **✓ Cần bổ sung** |
| **PATCH**| `/admin/users/{id}/status` | ✓ (Bearer Token) | Payload: `{ status: 'active' \| 'banned' }` | `ApiResponse<AdminRawUserItem>` | **✓ Cần bổ sung** |
| **DELETE**| `/admin/users/{id}` | ✓ (Bearer Token) | Không có payload | `ApiResponse<null>` | **✓ Cần bổ sung** |
| **GET** | `/admin/users/export` | ✓ (Bearer Token) | Params: `q`, `role`, `status` | File nhị phân Excel (`Blob`) | Không (đã có `EXPORT.USERS`) |

---

## 7) Mapper Requirements

### Chuyển đổi dữ liệu từ API thô sang ViewModel cho UI:
- **Raw Input:** `RawUserItem`
- **Output VM:** `UserItem`

| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| `id` | `number` | `id` | Giữ nguyên. |
| `full_name` | `string` | `fullName` | Giữ nguyên. |
| `email` | `string` | `email` | Giữ nguyên. |
| `username` | `string` | `username` | Chuẩn hóa thêm ký tự `@` phía trước nếu chưa có để hiển thị gọn. |
| `avatar` | `string \| null` | `avatar` | Sử dụng avatar mặc định dựa trên chữ cái đầu của `full_name` nếu trả về rỗng. |
| `role` | `string` | `role` | Cast an toàn sang `'admin' \| 'staff' \| 'user'`. |
| `status` | `string` | `status` | Cast an toàn sang `'active' \| 'banned'`. |
| `orders_count` | `number \| string` | `ordersCount` | Dùng helper `toNumberSafe` chuyển sang số, mặc định `0`. |
| `reviews_count` | `number \| string` | `reviewsCount` | Dùng helper `toNumberSafe` chuyển sang số, mặc định `0`. |
| `created_at` | `string` | `joinedDate` | Format từ ISO String thành chuỗi hiển thị gọn (ví dụ: `DD/MM/YYYY`) thông qua hàm tiện ích. |

---

## 8) Business Rules
- **BR-01 (Bảo vệ cá nhân - Self-Protection):** Hệ thống cấm tuyệt đối Admin hoặc Staff tự thực hiện các hành động: Khóa trạng thái (`PATCH /admin/users/{id}/status`), Xóa tài khoản (`DELETE /admin/users/{id}`), hoặc tự thay đổi vai trò của mình (`PATCH /admin/users/{id}/role`). Nút tương ứng trên giao diện của chính mình phải bị ẩn hoặc bị disable.
- **BR-02 (Ràng buộc khi nâng cấp quyền Admin):** Khi thay đổi vai trò của bất kỳ người dùng nào lên `admin`, hệ thống bắt buộc phải hiển thị Modal cảnh báo xác thực để khẳng định ý chí của người vận hành, nhằm giảm thiểu tối đa nguy cơ lộ quyền quản trị.
- **BR-03 (Lọc và Phân Trang URL):** Bộ lọc danh sách và tìm kiếm phải đồng bộ trực tiếp lên URL để người dùng có thể chia sẻ đường dẫn hoặc tải lại trang mà không mất bộ lọc hiện tại. Ô tìm kiếm văn bản có hiệu ứng debounce 300ms.
- **BR-04 (Hành động hàng loạt - Bulk Actions):** Khi tick chọn nhiều checkbox, Admin có thể cập nhật trạng thái hàng loạt (Khóa / Mở khóa) hoặc Xóa hàng loạt. Backend sẽ xử lý lặp song song hoặc tuần tự đối với các id được chọn.

---

## 9) Actors & Permissions

| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| **Admin** | - Xem toàn bộ danh sách.<br>- Tìm kiếm, lọc và xuất dữ liệu Excel.<br>- Thay đổi vai trò người dùng (User ↔ Staff ↔ Admin).<br>- Khóa / mở khóa tài khoản người dùng.<br>- Xóa vĩnh viễn tài khoản người dùng. | - Tự thay đổi thông tin/trạng thái và quyền của chính mình trên giao diện danh sách này. | Quyền lực cao nhất trong hệ thống quản trị. |
| **Staff** | - Xem danh sách người dùng.<br>- Tìm kiếm, lọc và xuất dữ liệu Excel.<br>- Khóa / mở khóa tài khoản người dùng có quyền thấp hơn (`user`). | - Thay đổi vai trò (Role) của bất kỳ ai.<br>- Xóa tài khoản người dùng (tùy thuộc vào chính sách phân quyền chi tiết của hệ thống). | Vai trò trợ thủ vận hành hàng ngày. |

---

## 10) Edge Cases
- **EC-01 (Mất mạng khi đang thực hiện Bulk Actions):** Admin tick chọn 10 người dùng và ấn "Khóa tài khoản", nhưng kết nối mạng bị gián đoạn giữa chừng.
  - *Giải pháp xử lý:* Sử dụng cơ chế khóa nút bấm (loading state), bắt lỗi kết nối và đưa ra Toast thông báo rõ ràng: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau!". Tiến hành cập nhật trạng thái optimistic hoặc rollback giao diện để dữ liệu không bị lệch.
- **EC-02 (Tài khoản đang đăng nhập bị Admin khác xóa/khóa từ xa):** Phiên đăng nhập hiện tại vẫn chạy nhưng tài khoản đã bị khóa trên cơ sở dữ liệu.
  - *Giải pháp xử lý:* API client (`axiosClient`) có sẵn interceptor bắt lỗi `401 Unauthorized` hoặc `403 Forbidden`. Hệ thống sẽ lập tức bắn Toast cảnh báo và đẩy người dùng ra màn hình `/login`.
- **EC-03 (Tìm kiếm ký tự đặc biệt):** Người dùng nhập các ký tự đặc biệt (`%`, `&`, `?`, `sql injection`) vào ô tìm kiếm.
  - *Giải pháp xử lý:* Mã hóa URL an toàn trước khi truyền làm query params bằng `encodeURIComponent`.

---

## 11) Assumptions & Open Questions

### Assumptions
- **[ASSUMPTION] A-01 (Role 'staff'):** Giả định backend chưa cho phép API `PATCH /role` gán giá trị `staff` hoàn chỉnh hoặc chưa mở cấu trúc dữ liệu cho Staff. Giao diện vẫn render nút chọn Staff nhưng sẽ bổ sung flag cấu hình để dễ dàng bật/tắt nếu backend chưa đồng bộ.
- **[ASSUMPTION] A-02 (Xóa người dùng):** Giả định hành động xóa sẽ thực hiện qua API `DELETE /admin/users/{id}` và sẽ báo lỗi nếu người dùng đó đang có các đơn đặt tour đang hoạt động. Chúng tôi sẽ xử lý hiển thị lỗi từ API trả về thông qua Toast chuyên biệt.

### Open Questions
- **Q-01:** Phía backend đã cài đặt API thống kê số lượng người dùng chưa? Hay chúng ta sẽ hiển thị số liệu Stats Row dựa trên phân tích tổng quan của danh sách trả về kèm metadata?
  - *Đề xuất:* Để tối ưu hiệu năng và không phụ thuộc, Stats Row sẽ hiển thị số liệu từ API Dashboard Stats có sẵn nếu hỗ trợ hoặc hiển thị số liệu giả lập an toàn dựa trên meta của trang đầu tiên.

---

## 12) Implementation Checklist
- [x] **01-screen-analysis (Tài liệu này)**
- [ ] **02-project-setup** (Kiểm tra môi trường dự án)
- [ ] **03-types-api-contract** (Khai báo API và Types cho Users)
- [ ] **04-layout-routing** (Đăng ký router `/admin/users` và cài đặt i18n)
- [ ] **05-ui-components** (Xây dựng UI components con)
- [ ] **06-data-integration** (Tích hợp luồng dữ liệu qua React Query)
- [ ] **07-interactions** (Cài đặt tương tác, URL sync, Dialogs, Toasts)
- [ ] **08-auth-permissions** (Bảo vệ route và kiểm tra an toàn phân quyền)
- [ ] **09-testing** (Chạy prepush check để xác minh chất lượng)
- [ ] **10-optimization-deploy** (Tạo báo cáo review và sẵn sàng triển khai)

---

## 13) Files / Areas Likely To Change
- **Cấu hình định tuyến:**
  - `src/routes/routes.ts` (Thêm hằng số `ROUTES.USERS_LIST`)
  - `src/routes/index.tsx` (Thêm route con và lazy import)
  - `src/components/common/Sidebar.tsx` (Liên kết Sidebar)
- **API & Mappers:**
  - `src/constants/endpoints.ts` (Cập nhật danh sách API)
  - `src/api/userApi.ts` (NEW - Tệp gọi API người dùng)
  - `src/dataHelper/user.dataHelper.ts` (NEW - Kiểu dữ liệu thô và VM)
  - `src/dataHelper/user.mapper.ts` (NEW - Hàm map dữ liệu)
- **Hooks:**
  - `src/hooks/useUserQueries.ts` (NEW - Hooks React Query)
- **Pages & Components:**
  - `src/pages/Users/UserList/index.tsx` (NEW - Trang danh sách chính)
  - `src/pages/Users/UserList/components/UserStatsRow.tsx` (NEW - Hàng thống kê)
  - `src/pages/Users/UserList/components/UserFilterBar.tsx` (NEW - Thanh lọc)
  - `src/pages/Users/UserList/components/UserTable.tsx` (NEW - Bảng danh sách)
  - `src/pages/Users/UserList/components/DeleteUserDialog.tsx` (NEW - Dialog xóa)
  - `src/pages/Users/UserList/components/UpdateRoleDialog.tsx` (NEW - Dialog đổi quyền)
- **i18n Localization:**
  - `public/lang/vi/user.json` (NEW - Dịch tiếng Việt)
  - `public/lang/en/user.json` (NEW - Dịch tiếng Anh)
