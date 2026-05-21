# UI Spec: Tạo / Sửa lịch khởi hành

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Source analysis: [2026-05-18__admin-tour-schedule-form__screen-analysis.md](file:///d:/DATN/danangtrip-admin/.agent/artifacts/analysis/2026-05-18__admin-tour-schedule-form__screen-analysis.md)

---

## 1) Summary
- **Mục tiêu UI**: Thiết lập hệ thống form nhập liệu và trình hiển thị trực quan thông minh (Live Preview) cho nghiệp vụ Tạo mới / Chỉnh sửa lịch khởi hành. Đảm bảo giao diện hiện đại, bóng bẩy (glassmorphism/dashboard-like) đồng thời thực thi chặt chẽ các luật ràng buộc nghiệp vụ.
- **Người dùng chính**: Quản trị viên (Admin) hoặc Nhân viên vận hành (Staff) thực hiện quản lý tour du lịch.

---

## 1.1) UI Delivery Goal
- **Thông tin ưu tiên hàng đầu**: Phân vùng ngày khởi hành & kết thúc (`startDate`/`endDate`), kiểm soát số lượng ghế mở bán (`totalSlots`), và tùy chỉnh giá riêng ghi đè (`override prices`).
- **Thành phần Above-the-fold (Luôn hiển thị đầu tiên)**: Page Header chứa Breadcrumb động, Tiêu đề hành động, Hộp thông tin tour gốc (`TourInfoBox`), và Nút hành động Lưu/Hủy.

---

## 2) Component Matrix

Hệ thống component được phân rã khoa học giúp tăng khả năng tái sử dụng và kiểm soát trạng thái:

### [REUSE]

| Component | Path | Why reuse | Notes |
|:---|:---|:---|:---|
| **Button** | `src/components/ui/Button.tsx` | Atom cơ bản hiển thị nút bấm kèm hiệu ứng hover, shadow và trạng thái loading spinner. | Tái sử dụng nút lưu/hủy tại Header và Footer của màn hình. |
| **TextInput** | `src/components/ui/TextInput.tsx` | Atom input text tiêu chuẩn hỗ trợ validation error state và left icon. | Dùng làm input cho các trường Ngày khởi hành, Ngày kết thúc và Số người tối đa. |
| **CurrencyInput** | `src/components/ui/CurrencyInput.tsx` | Atom nhập liệu số tiền tệ, tự động format định dạng phân tách phần nghìn. | Dùng làm input cho 3 trường giá người lớn, trẻ em và em bé. |
| **CustomSelect** | `src/components/ui/CustomSelect.tsx` | Atom dropdown custom hỗ trợ icon và option custom phức tạp. | Dùng để chọn trạng thái lịch khởi hành (AVAILABLE / CANCELLED). |
| **LoadingReact** | `src/components/common/Loading.tsx` | Component loading spinner toàn trang hoặc cục bộ. | Dùng hiển thị khi đang tải chi tiết Lịch trình cũ ở màn Edit. |

### [NEW]

| Component | Layer | Purpose | Expected Props |
|:---|:---|:---|:---|
| **TourInfoBox** | Molecule (Local) | Hiển thị hộp tóm tắt thông tin tour đang thao tác dưới dạng badge nổi, giúp vận hành viên luôn biết mình đang thêm lịch cho tour nào. | `tour?: TourViewModel`, `isLoading: boolean` |
| **ScheduleForm** | Organism (Local) | Form tổ hợp trung tâm chứa các trường nhập liệu cốt lõi và các phần phân vùng thông tin (Ngày, Chỗ, Giá riêng). | Không có props (sử dụng `useFormContext` để binding dữ liệu). |
| **SchedulePreviewBox** | Organism (Local) | Hộp mô phỏng hóa dữ liệu live cập nhật thời gian thực khi nhân viên thay đổi thông tin trên Form giúp giảm thiểu lỗi nhập liệu sai sót. | `control: Control<ScheduleFormValues>` |
| **PastEventWarning** | Molecule (Local) | Alert cảnh báo màu cam (Amber Warning) hiển thị nổi bật ở phía trên cùng của form khi người dùng chỉnh sửa một lịch trình trong quá khứ (`startDate < today`). | `show: boolean` |
| **UnsavedChangesGuard** | Molecule (Common) | Dialog cảnh báo khi nhân viên click nút "Hủy" hoặc nhấn Back lúc form đã có thay đổi dữ liệu để tránh mất dữ liệu vô ý. | `isDirty: boolean` |

### [MOD]

| Component | Path | Required change | Impact |
|:---|:---|:---|:---|
| **TourScheduleEdit** | `src/pages/Tours/TourScheduleEdit/index.tsx` | Cần cấu hình Yup Schema động: truyền tham số `isEdit: true` và `bookedSlots: schedule.bookedSlots` vào hàm `getScheduleSchema`. | Loại bỏ hoàn toàn lỗi chặn lưu form khi sửa các lịch cũ quá khứ (`BR-04`), đồng thời ngăn chặn việc giảm capacity nhỏ hơn số khách đã đặt thực tế (`BR-03`). |

---

## 3) UI States

Quản lý trạng thái trực quan cho từng thành phần giao diện chính:

| Component | Loading | Empty | Error | Success | Disabled |
|:---|:---|:---|:---|:---|:---|
| **TourInfoBox** | Hiển thị 2 dòng Skeleton xám mờ chuyển động mượt mà (`animate-pulse`). | Ẩn hoàn toàn không hiển thị. | Hiển thị fallback tên Tour trống hoặc toast lỗi. | Giao diện bo tròn, shadow nhẹ, thumbnail hiển thị chuẩn chỉ. | N/A |
| **ScheduleForm** | N/A | N/A | Trường có lỗi sẽ có viền đỏ `#EF4444`, nền hồng nhạt, hiển thị dòng text báo lỗi nhỏ phía dưới kèm icon `ri-error-warning-line`. | Trường hợp lệ có viền xám nhẹ truyền thống. | Khi form đang submit, toàn bộ input và select bị khóa cứng (`disabled`). |
| **SchedulePreviewBox** | N/A | N/A | N/A | Hiển thị dữ liệu trực tiếp: Ngày đi/về dạng `dd/mm/yyyy`, Giá định dạng `xxx.xxx ₫`, Trạng thái badge có chấm động màu xanh teal/đỏ/xám. | N/A |
| **Button Thêm / Lưu** | N/A | N/A | N/A | Thực hiện chuyển trang mượt mà. | Khi đang API Pending: vô hiệu hóa click, icon nút chuyển thành spinner quay tròn, text chuyển thành "Đang lưu...". |

---

## 3.1) Interaction Notes

Tương tác vi mô (Micro-interactions) nâng tầm cảm giác cao cấp:

| Component | Hover / Focus | Click / Action | Notes |
|:---|:---|:---|:---|
| **Form Inputs** | Hover: viền xám đậm lên.<br>Focus: viền đổi sang xanh Teal thương hiệu `#14b8a6`, đổ bóng glow nhẹ xung quanh. | Click: cursor nhảy vào vị trí nhập liệu sẵn sàng. | Trải nghiệm nhập liệu mượt mà, phản hồi lập tức. |
| **CustomSelect** | Hover: đổi màu nền sang xám cực nhạt.<br>Focus: viền đổi xanh Teal, bảng dropdown mở bung mượt mà xuống dưới. | Chọn Option: dropdown đóng lại, badge trạng thái đổi màu chấm dot ngay lập tức. | Dùng các dot màu: Xanh Teal (Còn chỗ), Xám (Đã hủy). |
| **Live Preview Cards** | Hover: Đổ bóng shadow từ `shadow-sm` thành `shadow-md` nổi nhẹ lên 2px, viền card bo xanh Teal mỏng `#14b8a6/20`. | Click: N/A (chỉ hiển thị thông tin). | Tạo cảm giác sống động và phản hồi sinh động khi rê chuột. |
| **Nút Lưu (Teal/Amber)** | Hover: Màu đậm lên một tông (Teal -> `#0d9488`, Amber -> `#D97706`), shadow rộng ra. | Click: Co nhẹ lại 5% (scale-95) tạo phản hồi vật lý. | Cảm giác ấn nút rất sướng tay và thật chân. |

---

## 4) Responsive Notes

Cấu hình Grid thích ứng đa nền tảng tối ưu hóa diện tích hiển thị:

| Breakpoint | Behavior | Notes |
|:---|:---|:---|
| **Mobile** (< 768px) | - Grid chuyển hoàn toàn thành **1 cột dọc** duy nhất.<br>- Form Card hiển thị trước, Preview Box bị đẩy xuống dưới.<br>- Header Action chuyển thành một thanh Toolbar dính chặt ở đáy màn hình (`fixed bottom-0 left-0 right-0`) để ngón tay cái thao tác bấm [Hủy] / [Lưu] dễ dàng. | Tránh CLS và giữ ngón tay bấm tiện lợi. |
| **Tablet** (768px - 1024px) | - Giao diện 1 cột chính, Form và Preview xếp dọc.<br>- Nút bấm chuyển lên Header phía trên bên phải. | Giữ bố cục thoáng mắt. |
| **Desktop** (>= 1024px) | - Grid chia thành **12 cột** (`grid-cols-12`): Form chiếm **7 cột**, Preview Box chiếm **5 cột** bên phải.<br>- Preview Box sử dụng class `sticky top-24` để luôn ghim cố định bên phải màn hình khi vận hành viên cuộn dọc Form bên trái xuống dưới. | Giải pháp bố cục hoàn hảo trên màn hình rộng. |

---

## 5) Files Expected To Change

- `src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx` (Chỉnh sửa hiển thị cảnh báo quá khứ)
- `src/pages/Tours/TourScheduleEdit/index.tsx` (Tích hợp tham số validator động `isEdit: true`, hiển thị cảnh báo `PastEventWarning`)
- `src/validations/schedule.schema.ts` (Nâng cấp schema nhận tham số `isEdit`, `bookedSlots`)

---

## 6) Build Order

Quy trình phát triển code giao diện chuẩn từng bước:

1. **Step 1 [Atoms & Schemas]**:
   * Cập nhật Yup Schema nhận tham số động tại `src/validations/schedule.schema.ts` để làm nền móng logic cho toàn bộ UI.
2. **Step 2 [Feature Components Modification]**:
   * Chỉnh sửa component local `ScheduleForm.tsx` để bổ sung cảnh báo hoặc căn chỉnh visual nếu cần.
3. **Step 3 [Page Integration - Edit Màn hình]**:
   * Tích hợp Schema động mới vào `TourScheduleEdit/index.tsx`.
   * Thêm Alert cảnh báo Ngày quá khứ (`PastEventWarning`) nổi trên Form Card ở màn Edit.
4. **Step 4 [Verification & Test]**:
   * Khởi chạy kiểm tra cú pháp và build thử nghiệm tĩnh để đảm bảo visual và logic compile không bị lỗi.
