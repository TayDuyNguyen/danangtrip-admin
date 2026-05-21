# Feature Review: Admin Tour Schedule Edit

- **Date**: 2026-05-20
- **Feature Slug**: `admin-tour-schedule-edit`
- **Handoff Verdict**: `Ready for push after approval`

---

## 🎯 1. Objective
Provide an operational UI screen within the React + Vite admin dashboard allowing managers to edit existing tour schedule metadata, update booking deadlines, and manage capacity slots safely.

---

## 📋 2. Scope Delivered
- **Giao diện chỉnh sửa lịch trình (TourScheduleEdit)**: Thiết kế form trực quan hỗ trợ cập nhật `total_slots`, `departure_code`, `departure_place` và `booking_deadline`.
- **Ràng buộc kiểm tra phía máy khách**: Tích hợp kiểm tra Yup đảm bảo số lượng ghế tối đa (`totalSlots`) không bao giờ nhỏ hơn số lượng ghế đã được đặt (`bookedSlots`).
- **Cảnh báo lịch trình trong quá khứ**: Banner cảnh báo động hiển thị trên đầu form nếu lịch trình được chọn bắt đầu trước thời điểm hiện tại.
- **Bảo vệ dữ liệu chưa lưu (UnsavedChangesGuard)**: Chặn điều hướng bất ngờ và hiển thị hộp thoại cảnh báo khi người dùng nhấn thoát trang khi form đang bị thay đổi (`dirty`).

---

## 🔍 3. Artifact Trace
Toàn bộ quy trình thiết kế và kiểm thử của tính năng đã đi qua các bước kiểm soát nghiêm ngặt:
- **`analysis`**: [2026-05-20__admin-tour-schedule-edit__screen-analysis.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/analysis/2026-05-20__admin-tour-schedule-edit__screen-analysis.md)
- **`api-contracts`**: [2026-05-20__admin-tour-schedule-edit__api-contract.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/api-contracts/2026-05-20__admin-tour-schedule-edit__api-contract.md)
- **`routing`**: [2026-05-20__admin-tour-schedule-edit__route-plan.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/routing/2026-05-20__admin-tour-schedule-edit__route-plan.md)
- **`ui-specs`**: [2026-05-20__admin-tour-schedule-edit__ui-spec.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/ui-specs/2026-05-20__admin-tour-schedule-edit__ui-spec.md)
- **`integration`**: [2026-05-20__admin-tour-schedule-edit__data-integration.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/integration/2026-05-20__admin-tour-schedule-edit__data-integration.md)
- **`interaction-specs`**: [2026-05-20__admin-tour-schedule-edit__interaction-spec.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/interaction-specs/2026-05-20__admin-tour-schedule-edit__interaction-spec.md)
- **`auth`**: [2026-05-20__admin-tour-schedule-edit__auth-permissions-review.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/auth/2026-05-20__admin-tour-schedule-edit__auth-permissions-review.md)
- **`test-cases`**: [2026-05-20__admin-tour-schedule-edit__test-report.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/test-cases/2026-05-20__admin-tour-schedule-edit__test-report.md)

---

## 🛠️ 4. Technical Decisions
- **Custom Backend Validation Closure**: Tinh chỉnh logic xác thực trong `UpdateTourScheduleRequest.php` ở máy chủ Laravel để cho phép cập nhật lịch trình trong quá khứ mà không bị chặn bởi điều kiện ngày đi lớn hơn hiện tại (vẫn đảm bảo ngày đi bé hơn ngày về).
- **HeadlessUI Transitions**: Hộp thoại cảnh báo rời trang (`UnsavedChangesGuard`) sử dụng `@headlessui/react` mang lại hiệu ứng mượt mà và tương thích tốt với chuẩn truy cập bàn phím.

---

## 📊 5. Validation Summary
- **i18n**: Ngôn ngữ được đồng bộ hóa hoàn toàn trên bản tiếng Anh (EN) và tiếng Việt (VI). Nhãn hiển thị modal cảnh báo đã bổ sung khóa dịch dịch chuẩn.
- **E2E Automation**: Test script Playwright chạy thành công toàn bộ luồng tương tác và chuyển hướng.

---

## ⚠️ 6. Risks & Follow-ups
- **Residual Risks**: Giới hạn kích thước gói Lucide Icons cảnh báo vượt 500kB. Không ảnh hưởng đến người dùng quản trị và sẽ tối ưu hóa tree-shaking trong các đợt phát hành bảo trì sau này.

---

## 🏁 7. Handoff Decision

**Verdict**: `Ready for push after approval`
