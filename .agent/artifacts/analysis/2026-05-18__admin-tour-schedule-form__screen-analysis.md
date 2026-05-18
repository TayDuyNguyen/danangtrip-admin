# Screen Analysis: Tạo / Sửa lịch khởi hành

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Mockup/SRS: [admin_tour_schedules_create.md](file:///D:/DATN/DATN_Tài%20liệu/docs/page/admin_tour_schedules_create.md) & [admin_tour_schedules_edit.md](file:///D:/DATN/DATN_Tài%20liệu/docs/page/admin_tour_schedules_edit.md)

---

## 1) Summary
- **Mục đích**: Cung cấp giao diện trực quan và an toàn nghiệp vụ để quản trị viên/nhân viên tạo mới hoặc cập nhật các lịch trình khởi hành (`Schedules`) của một Tour du lịch cụ thể. Cho phép cấu hình số chỗ (`capacity`), trạng thái hoạt động, và giá bán riêng ghi đè lên giá mặc định của tour gốc (`price override`).
- **Người dùng chính**: `admin` / `staff` (Quản trị viên / Nhân viên vận hành).
- **Thuộc module**: Quản lý Tour / Lịch khởi hành (`Tours` / `Schedules`).
- **Source inputs đã dùng**:
  - Đặc tả màn hình thêm mới: [admin_tour_schedules_create.md](file:///D:/DATN/DATN_Tài%20liệu/docs/page/admin_tour_schedules_create.md)
  - Đặc tả màn hình chỉnh sửa: [admin_tour_schedules_edit.md](file:///D:/DATN/DATN_Tài%20liệu/docs/page/admin_tour_schedules_edit.md)
  - Danh sách API & Endpoint: [api_list.md](file:///D:/DATN/DATN_Tài%20liệu/docs/api/api_list.md) & [endpoints.ts](file:///d:/DATN/danangtrip-admin/src/constants/endpoints.ts)
  - Hướng dẫn thiết kế chung: [DESIGN.md](file:///d:/DATN/danangtrip-admin/DESIGN.md)

---

## 2) Design Token Audit & Alignment

Một bước cực kỳ quan trọng là đối chiếu các yêu cầu thiết kế trong tài liệu mockup/SRS (vốn được soạn thảo theo phong cách nguyên bản) với Hệ thống thiết kế chuẩn **NovaEstate Dashboard** quy định tại [DESIGN.md](file:///d:/DATN/danangtrip-admin/DESIGN.md):

| Design Element | Mockup / SRS Spec | DESIGN.md Token | Tình trạng áp dụng trong Code |
|:---|:---|:---|:---|
| **Accent / Primary Color** | `#0066CC` (Xanh dương đậm), `#EFF6FF` (Nền phụ xanh), `#B3D9FF` (Viền xanh) | `#14B8A6` (Teal chủ đạo), `#DBEAFE` (Secondary hỗ trợ), `#F8FAFC` (Nền surface) | **Đã đồng bộ**: Mã nguồn hiện tại đã chuyển toàn bộ tông màu chính sang màu Teal thương hiệu `#14b8a6`. |
| **Typography** | `Inter` Font Family | `System Font` (San-serif mặc định hệ điều hành tối ưu hóa render) | **Đã đồng bộ**: Sử dụng phông chữ hệ thống để tăng tốc độ tải trang và tính nhất quán. |
| **Corner Radius** | `radius-10` cho button/badge, `radius-16` cho card | `6px` (badge/badge nhỏ), `16px` (button/input/card phụ), `24px` (card chính), `32px`, `9999px` (nút tròn) | **Đã đồng bộ**: Sử dụng các Tailwind class chuẩn như `rounded-xl` (12px) cho input và `rounded-2xl` (16px) hoặc `rounded-3xl` (24px) cho form panel theo đúng tinh thần NovaEstate. |
| **Surface Style** | Nền trắng phẳng (`bg white border #E2E8F0`) | `Glassmorphism` (Kính mờ, có hiệu ứng backdrop-blur và viền mờ ảo) | **Đã đồng bộ**: Các form panel được bao bọc bởi lớp phủ `bg-white/70 backdrop-blur-md border-slate-200/80` tạo chiều sâu cao cấp. |
| **Iconography** | Google Material Icons (dạng text font) | `Remix Icon` hoặc `Lucide React` (Linear icon) | **Đã đồng bộ**: Các component sử dụng `Remix Icon` (tiền tố `ri-`) và `Lucide React` gọn nhẹ cho hiệu năng tối đa. |

---

## 3) Component Breakdown

Cấu trúc component của các màn hình Tạo và Sửa lịch được chia thành ba nhóm cốt lõi:

### [REUSE] — Components đã có
Các component đã được xây dựng hoàn thiện và có thể sử dụng lại trực tiếp:

| Component | Path | Cần chỉnh sửa? | Note |
|:---|:---|:---|:---|
| `TextInput` | [TextInput.tsx](file:///d:/DATN/danangtrip-admin/src/components/ui/TextInput.tsx) | Không | Component nhập liệu văn bản/ngày/số chuẩn, hỗ trợ biểu tượng bên trái. |
| `CurrencyInput` | [CurrencyInput.tsx](file:///d:/DATN/danangtrip-admin/src/components/ui/CurrencyInput.tsx) | Không | Component nhập số tiền chuyên dụng, tự động định dạng dấu phân cách nghìn. |
| `CustomSelect` | [CustomSelect.tsx](file:///d:/DATN/danangtrip-admin/src/components/ui/CustomSelect.tsx) | Không | Component hộp chọn dropdown tùy chỉnh, hiển thị kèm chấm màu trạng thái. |
| `Button` | [Button.tsx](file:///d:/DATN/danangtrip-admin/src/components/ui/Button.tsx) | Không | Nút tương tác hỗ trợ trạng thái `loading` và `disabled` tích hợp sẵn. |
| `ScheduleForm` | [ScheduleForm.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx) | Không | Biểu mẫu nhập liệu chứa Ngày đi, Ngày về, Số người, Giá đè. Được chia sẻ chung giữa Create và Edit. |
| `SchedulePreviewBox` | [SchedulePreviewBox.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/SchedulePreviewBox.tsx) | Không | Hộp hiển thị thời gian thực các thông tin vừa nhập trên form để kiểm tra trực quan. |

### [NEW] — Components cần tạo mới
Các component mới cần được bổ sung để đáp ứng các nghiệp vụ riêng biệt của màn chỉnh sửa:

| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|:---|:---|:---|:---|
| `ScheduleStatsBlock` | Khối thống kê đặt chỗ thực tế, hiển thị số chỗ đã đặt, còn trống, thanh phần trăm tỉ lệ lấp đầy trực quan và cảnh báo giới hạn thay đổi ghế. | Organism | `bookedSlots: number; totalSlots: number;` |
| `ScheduleInfoBlock` | Khối thông tin bổ sung hiển thị ngày tạo, ngày cập nhật cuối cùng, và liên kết ngược về trang sửa Tour tương ứng. | Molecule | `createdAt: string; updatedAt: string; tourId: string \| number; tourName: string;` |
| `ConfirmDeleteDialog` | Hộp thoại modal xác nhận trước khi xóa lịch khởi hành, hiển thị cảnh báo nghiệp vụ nguy hiểm nếu lịch đã có khách đặt chỗ. | Organism | `isOpen: boolean; onClose: () => void; onConfirm: () => void; bookedSlots: number; dateStr: string; tourName: string; isLoading: boolean;` |
| `UnsavedChangesGuard` | Bộ lắng nghe trạng thái bẩn (`dirtyState`) của biểu mẫu để chặn điều hướng ngoài ý muốn và hiển thị hộp thoại cảnh báo rời trang. | Molecule | `isDirty: boolean;` |

### [MOD] — Components cần chỉnh sửa
Các component cần được cập nhật thuộc tính để tăng tính tái sử dụng hoặc sửa lỗi giao diện:

| Component | Path | Thay đổi gì | Impact |
|:---|:---|:---|:---|
| `TourInfoBox` | [TourInfoBox.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/TourInfoBox.tsx) | Bổ sung thuộc tính `mode?: 'tour' \| 'schedule'` và dữ liệu lịch trình (`scheduleDate`, `scheduleStatus`). | Cho phép chuyển đổi linh hoạt: Khi ở màn **Tạo mới**, hiển thị hộp thông tin Tour (màu xanh ngọc). Khi ở màn **Chỉnh sửa**, hiển thị hộp thông tin Lịch khởi hành (màu vàng hổ phách) kèm trạng thái hiện tại đúng đặc tả. |
| `TourScheduleEdit` | [index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleEdit/index.tsx) | Tích hợp các khối mới (`ScheduleStatsBlock`, `ScheduleInfoBlock`, `ConfirmDeleteDialog`, nút Xóa ở footer). | Bổ sung đầy đủ các tính năng nghiệp vụ nâng cấp còn thiếu so với đặc tả ban đầu. |
| `ScheduleForm` | [ScheduleForm.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx) | Bổ sung cảnh báo ngay dưới trường chọn `startDate` nếu lịch được chỉnh sửa là một lịch trình đã diễn ra trong quá khứ. | Giúp nhân viên nhận thức rõ rủi ro khi thay đổi thông tin lịch đã khởi hành. |

---

## 4) Responsive Behavior

Để đảm bảo hiệu quả làm việc cao nhất trên mọi thiết bị di động của nhân viên điều hành, giao diện được thiết kế tương thích hoàn hảo:

| Breakpoint | Layout | Cấu hình & Hành vi chi tiết |
|:---|:---|:---|
| **Desktop** (≥1024px) | 2 Cột (Tỉ lệ 7:5) | Cột bên trái hiển thị biểu mẫu điền thông tin (Form Card). Cột bên phải cố định (`sticky`) hộp xem trước thời gian thực (Preview Box), Khối thống kê đặt chỗ (Stats) và Khối thông tin (Info) giúp nhân viên không cần cuộn trang vẫn quan sát được dữ liệu tổng quan. |
| **Tablet** (768px - 1023px) | 1 Cột dọc | Khối Preview và các khối phụ trợ được xếp ngay phía dưới Form Card chính. Thư mục Header sắp xếp gọn gàng theo dạng flex-wrap. |
| **Mobile** (<768px) | 1 Cột dọc + Bottom Bar | - Padding trang giảm từ `p-10` xuống `p-4` để tiết kiệm không gian hiển thị.<br>- Ẩn toàn bộ nút bấm ở Header.<br>- **Bottom Action Bar**: Cố định phía dưới màn hình (`fixed bottom-0`) chứa nút [Hủy] và nút chính [Thêm] / [Lưu] giúp dễ dàng thao tác bằng một ngón tay. |

---

## 5) UI States Handling

Các trạng thái hiển thị của các khối thành phần được quy định rõ ràng nhằm tránh tình trạng giao diện "đơ" hoặc thiếu phản hồi:

| Component/Section | Loading | Empty / Initial | Error | Success | Disabled | Hover / Focus |
|:---|:---|:---|:---|:---|:---|:---|
| **Form Card** | Hiển thị hiệu ứng `Skeleton` mờ nhấp nháy cho từng dòng nhập liệu. | Các ô input Ngày đi/về trống; Ô số lượng đặt mặc định là 20. | Ghi đè viền đỏ `#EF4444`, nền hồng nhạt, kèm dòng thông báo lỗi ngay dưới chân ô nhập liệu. | N/A | Khóa tương tác khi mutation `isPending`. | Viền chuyển sang màu Teal thương hiệu `#14b8a6`. |
| **Tour/Schedule Info Box** | Hiển thị skeleton tròn cho ảnh và vệt chữ dài cho tiêu đề. | N/A | Ẩn hộp thông tin hoặc hiển thị nhãn báo lỗi không tìm thấy tour. | N/A | N/A | Hiệu ứng phóng to nhẹ ảnh thumbnail (`scale-110`), viền sáng xanh. |
| **Stats Block & Progress Bar** | Ẩn hoặc hiển thị skeleton dạng hộp. | Hiển thị tỉ lệ `0%` màu xanh biển nhạt. | N/A | N/A | N/A | N/A |
| **Action Buttons** | Quay vòng spinner nhỏ, thay đổi nhãn thành `"Đang thêm..."` hoặc `"Đang lưu..."`. | N/A | N/A | Kích hoạt hiệu ứng Toast thông báo góc màn hình. | Trạng thái mờ đi (`opacity-50`), con trỏ chuột chuyển thành `cursor-not-allowed`. | - Nút chính: Phóng to nhẹ, bóng đổ rõ hơn.<br>- Nút Hủy/Xóa: Viền và chữ chuyển màu đỏ đậm. |

---

## 6) Data Fields Specification

Các trường dữ liệu cần xử lý trên biểu mẫu:

| Field | Type | Required | Validation Rules (Yup & Backend) | UI Control | Source Endpoint |
|:---|:---|:---|:---|:---|:---|
| `startDate` | `string` (YYYY-MM-DD) | ✅ | **Thêm**: Bắt buộc, phải từ hôm nay trở đi (`>= today`).<br>**Sửa**: Không kiểm tra ngày tương lai để cho phép lưu lịch cũ, hiển thị cảnh báo nếu đã khởi hành. | `TextInput[type="date"]` | `RawSchedule.start_date` |
| `endDate` | `string` (YYYY-MM-DD) | ✅ | Bắt buộc, bắt buộc phải lớn hơn hoặc bằng `startDate` (`>= startDate`). | `TextInput[type="date"]` | `RawSchedule.end_date` |
| `totalSlots` | `number` | ✅ | Bắt buộc, giá trị tối thiểu là 1 (`>= 1`).<br>**Sửa**: Tuyệt đối không được nhỏ hơn số chỗ thực tế đã đặt (`>= bookedSlots`). | `TextInput[type="number"]` | `RawSchedule.max_people` |
| `status` | `string` | ✅ | Chỉ chấp nhận giá trị `'AVAILABLE'` hoặc `'CANCELLED'`. Mặc định: `'AVAILABLE'`. | `CustomSelect` | `RawSchedule.status` |
| `priceAdult` | `number \| null` | ✗ | Tùy chọn, nếu nhập phải lớn hơn hoặc bằng 0 (`>= 0`). Để trống tương đương sử dụng giá gốc mặc định của tour. | `CurrencyInput` | `RawSchedule.price_adult` |
| `priceChild` | `number \| null` | ✗ | Tùy chọn, phải lớn hơn hoặc bằng 0 (`>= 0`). | `CurrencyInput` | `RawSchedule.price_child` |
| `priceInfant` | `number \| null` | ✗ | Tùy chọn, phải lớn hơn hoặc bằng 0 (`>= 0`). | `CurrencyInput` | `RawSchedule.price_infant` |

---

## 7) API Endpoints Mapping

Bản đồ kết nối các API phục vụ hai màn hình này từ [endpoints.ts](file:///d:/DATN/danangtrip-admin/src/constants/endpoints.ts):

| Action Nghiệp vụ | Method | API Endpoint | Auth | Request Body / Params | Response Data | Cần thêm mới? |
|:---|:---|:---|:---|:---|:---|:---|
| **Lấy chi tiết Lịch** | `GET` | `API_ENDPOINTS.SCHEDULES` + `/{id}` | 🛡️ Có | Params: `{id}` | `{ data: RawSchedule }` | Không (Đã có sẵn) |
| **Lấy chi tiết Tour** | `GET` | `API_ENDPOINTS.TOURS` + `/{id}` | 🛡️ Có | Params: `{id}` | `{ data: RawTour }` | Không (Đã có sẵn) |
| **Tạo mới Lịch** | `POST` | `API_ENDPOINTS.SCHEDULES` | 🛡️ Có | Body: `RawSchedule` (đã map qua mapper) | `{ success: true, data: RawSchedule }` | Không (Đã có sẵn) |
| **Cập nhật Lịch** | `PUT` | `API_ENDPOINTS.SCHEDULES` + `/{id}` | 🛡️ Có | Params: `{id}`, Body: `RawSchedule` | `{ success: true, data: RawSchedule }` | Không (Đã có sẵn) |
| **Xóa Lịch khởi hành** | `DELETE` | `API_ENDPOINTS.SCHEDULES` + `/{id}` | 🛡️ Có | Params: `{id}` | `{ success: true }` | Không (Đã có sẵn) |

---

## 8) Mapper Requirements

Quá trình chuyển dịch cấu trúc dữ liệu giữa Laravel API (Snake_case) và React Client (CamelCase) được đảm bảo hoàn hảo bởi lớp mapper có sẵn tại [schedule.mapper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/schedule.mapper.ts):

| API Field (Snake_case) | Type | UI ViewModel Field (CamelCase) | Logic chuyển đổi đặc biệt |
|:---|:---|:---|:---|
| `id` | `number \| string` | `id` | Giữ nguyên định danh. |
| `tour_id` | `number \| string` | `tourId` | Liên kết sang Tour gốc. |
| `start_date` | `string` | `startDate` | Chuẩn hóa dạng YYYY-MM-DD qua hàm `toYmd()`. |
| `end_date` | `string` | `endDate` | Chuẩn hóa dạng YYYY-MM-DD. |
| `max_people` | `number` | `totalSlots` | Chuyển đổi an sau qua `toNumberSafe()`. |
| `booked_people` | `number` | `bookedSlots` | Mặc định là 0 nếu trống. |
| `price_adult` | `number \| null` | `priceAdult` | Chuyển sang `null` nếu rỗng để kích hoạt chế độ "Dùng giá mặc định của tour". |
| `price_child` | `number \| null` | `priceChild` | Chuyển sang `null` nếu rỗng. |
| `price_infant` | `number \| null` | `priceInfant` | Chuyển sang `null` nếu rỗng. |
| `status` | `string` | `status` | Chuẩn hóa chữ HOA: `AVAILABLE` hoặc `CANCELLED`. |
| `booking_availability`| `string` | `bookingAvailability` | Tự động chuyển dịch sang trạng thái `SOLD_OUT` nếu trạng thái là đầy chỗ (`full`) hoặc API trả về `sold_out`. |

---

## 9) Business Rules (BR)

Hệ thống bắt buộc phải thực thi nghiêm ngặt các quy tắc nghiệp vụ sau để tránh sai sót dữ liệu:

- **`BR-01` [Date Validation]**: Ngày kết thúc của lịch trình (`endDate`) bắt buộc phải sau hoặc trùng với ngày khởi hành (`startDate`). Đối với giao diện tạo mới, `startDate` phải từ hôm nay trở đi (`>= ngày hiện tại`).
- **`BR-02` [Price Override Fallback]**: Nếu các ô nhập giá riêng (`priceAdult`, `priceChild`, `priceInfant`) được để trống, hệ thống sẽ tự động hiển thị nhãn và áp dụng giá trị mặc định của Tour gốc. Giá riêng chỉ được ghi nhận khi có giá trị `>= 0`.
- **`BR-03` [Booked Constraint (Edit)]**: Khi chỉnh sửa lịch khởi hành đã tồn tại, số lượng ghế tối đa (`totalSlots`) tuyệt đối không được phép thiết lập nhỏ hơn số lượng ghế thực tế đã có khách đặt trước (`bookedSlots`).
- **`BR-04` [Past Event Safeguard]**: Hệ thống phải ngăn chặn việc tạo lịch khởi hành mới trong quá khứ. Đối với lịch cũ đang sửa, hiển thị cảnh báo vận hành đặc biệt để tránh nhân viên thay đổi nhầm thông tin của các đoàn khách đã đi.
- **`BR-05` [Delete Constraint]**: Không cho phép xóa lịch khởi hành nếu số lượng ghế đã đặt (`bookedSlots`) lớn hơn 0. Nhân viên phải tiến hành hủy hoặc dời lịch tất cả đơn đặt của khách hàng trước khi thực hiện xóa lịch.

---

## 10) Actors & Permissions

Bảng phân quyền thao tác chi tiết:

| Actor/Role | Thao tác được phép | Thao tác bị cấm | Ghi chú |
|:---|:---|:---|:---|
| **Admin** (Quản trị viên) | Toàn quyền tạo, sửa, xóa bất kỳ lịch trình nào. | N/A | Có quyền xóa bất kể ngày khởi hành nếu `bookedSlots === 0`. |
| **Staff** (Nhân viên) | Tạo mới lịch trình, cập nhật các lịch trình chưa khởi hành. | Không thể xóa hoặc sửa lịch trình nếu lịch đó đã kết thúc trong quá khứ (ngày kết thúc < hôm nay) trừ khi có sự phê duyệt của Admin. | Bị hạn chế quyền đối với dữ liệu lịch sử để đảm bảo tính toàn vẹn của báo cáo tài chính. |

---

## 11) Edge Cases (EC) & Mitigation

Các kịch bản biên bất thường và giải pháp khắc phục:

- **`EC-01` [Thay đổi đồng thời - Concurrent Edit]**: Hai nhân viên cùng mở màn hình chỉnh sửa một lịch khởi hành. Nhân viên A giảm số ghế xuống 15, Nhân viên B cùng lúc duyệt thêm đơn đặt lên 18.
  - *Giải pháp*: API PUT của Laravel sẽ trả về lỗi validate nếu `max_people < booked_people` thực tế ở DB. React UI hiển thị toast thông báo lỗi nghiệp vụ chi tiết và tự động tải lại dữ liệu mới nhất.
- **`EC-02` [Lịch diễn ra dài ngày]**: Một lịch khởi hành kéo dài xuyên tháng (ví dụ: tour xuyên Việt).
  - *Giải pháp*: Form hỗ trợ chọn date picker đầy đủ, không giới hạn khoảng cách ngày giữa `startDate` và `endDate` miễn là thỏa mãn `BR-01`.
- **`EC-03` [Giá bằng 0]**: Nhân viên muốn tổ chức tour miễn phí hoặc có khuyến mại 0đ cho em bé.
  - *Giải pháp*: Biểu mẫu chấp nhận giá trị `0` là giá trị ghi đè hợp lệ (badge "GIÁ RIÊNG" hiển thị 0đ), phân biệt rõ với trạng thái trống (`null` - thừa kế giá gốc).

---

## 12) Assumptions & Open Questions

### Assumptions (Giả định)
- **`A-01`**: Toàn bộ tour được quản lý trên hệ thống đều có giá mặc định của người lớn (`price_adult` luôn khác null). Giá trẻ em và em bé của tour gốc có thể bằng null, khi đó lịch khởi hành cũng sẽ tự động kế thừa giá trị null tương ứng.
- **`A-02`**: Quyền hạn `Admin` và `Staff` được phân biệt ở tầng API Gateway của Laravel. React Client chỉ cần thực hiện kiểm tra vai trò người dùng trong Token để ẩn/hiển thị các nút thao tác tương ứng (ví dụ nút Xóa).

### Open Questions (Câu hỏi mở)
- **`Q-01`**: Khi xóa lịch khởi hành thành công, hệ thống nên điều hướng nhân viên về danh sách lịch trình chung của tất cả các tour (`/admin/tour-schedules`) hay trang danh sách lịch riêng của Tour đó (`/admin/tours/schedules?tour_id=X`)?
  - *Câu trả lời tối ưu*: Chuyển hướng về trang danh sách lịch riêng của Tour vừa xóa nếu thực hiện từ luồng Tour Edit, hoặc trang danh sách chung nếu thực hiện từ luồng quản lý Schedule chung, giúp nhân viên không bị mất dấu ngữ cảnh làm việc.

---

## 13) Implementation Checklist

Để hiện thực hóa hoàn hảo màn hình này ở các bước tiếp theo, đội ngũ phát triển cần tuân thủ danh mục công việc:

- [x] **Types & API Contract (`03-types-api-contract`)**: Xác thực kiểu dữ liệu `Schedule` và lớp kết nối `scheduleApi.ts` đã đầy đủ 100%.
- [x] **Validation Schema**: Hoàn thành schema xác thực Yup nâng cao tại `schedule.schema.ts` với đầy đủ các kiểm tra ngày tương lai, so sánh ngày đi/về.
- [ ] **Component Enhancement (`05-ui-components` & `06-data-integration`)**:
  - [ ] Nâng cấp `TourInfoBox.tsx` để hỗ trợ hiển thị thông tin lịch màu vàng hổ phách chuẩn.
  - [ ] Phát triển mới component khối thống kê `ScheduleStatsBlock` kèm thanh tiến trình và cảnh báo giới hạn ghế.
  - [ ] Phát triển mới component khối thông tin `ScheduleInfoBlock`.
  - [ ] Tích hợp hộp thoại modal xác nhận xóa an toàn `ConfirmDeleteDialog`.
  - [ ] Triển khai Unsaved Changes Guard bằng `useBeforeUnload` của React Router để bảo vệ dữ liệu nhập của người dùng.
- [ ] **Interactions & Integration (`07-interactions`)**:
  - [ ] Liên kết các hàm mutate xóa (`useDeleteSchedule`) và cập nhật (`useUpdateSchedule`) vào giao diện `TourScheduleEdit`.
  - [ ] Tích hợp cảnh báo ngày quá khứ trực tiếp trên trường Ngày đi của biểu mẫu.
- [ ] **Testing & Verification**:
  - [ ] Thực hiện Typecheck dự án để đảm bảo không lỗi kiểu dữ liệu TypeScript.
  - [ ] Thực hiện chạy thử nghiệm giao diện thực tế (Smoke Test) trên môi trường trình duyệt.

---

## 14) Files / Areas Likely To Change

Các tệp tin chính sẽ được sửa đổi hoặc tạo mới trong quá trình triển khai:
- [TourInfoBox.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/TourInfoBox.tsx) (Nâng cấp đa chế độ)
- [TourScheduleEdit index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleEdit/index.tsx) (Tích hợp nghiệp vụ mới)
- [ScheduleForm.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx) (Bổ sung warning lịch quá khứ)
- [Schedules translation JSON (VI)](file:///d:/DATN/danangtrip-admin/public/lang/vi/schedules.json) (Thêm các từ khóa dịch mới cho stats, alert, confirm delete)
- [Schedules translation JSON (EN)](file:///d:/DATN/danangtrip-admin/public/lang/en/schedules.json) (Đồng bộ ngôn ngữ tiếng Anh)
- *Tạo mới*: `src/pages/Tours/TourScheduleEdit/components/ScheduleStatsBlock.tsx` (Khối thống kê)
- *Tạo mới*: `src/pages/Tours/TourScheduleEdit/components/ScheduleInfoBlock.tsx` (Khối thông tin)
- *Tạo mới*: `src/pages/Tours/TourScheduleEdit/components/ConfirmDeleteDialog.tsx` (Modal xác nhận xóa)
