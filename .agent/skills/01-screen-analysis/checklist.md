# Checklist: 01-screen-analysis

## Input
- [ ] Đã đọc PRD/SRS/mockup liên quan đến màn hình này
- [ ] Đã mở Figma/Stitch link nếu có
- [ ] Đã đọc `DESIGN.md` — biết token màu, typography, spacing chuẩn
- [ ] Đã đối chiếu endpoint với `src/constants/endpoints.ts` và `api_list.md`

## Design Token Audit
- [ ] Màu sắc trong mockup đối chiếu với `DESIGN.md` — conflict (nếu có) đã flag
- [ ] Typography đối chiếu với `DESIGN.md`
- [ ] Spacing/radius đối chiếu với `DESIGN.md`

## Component Breakdown
- [ ] Có bảng `[REUSE]` / `[NEW]` / `[MOD]` — không chỉ bullet list
- [ ] Mỗi component có: path (nếu reuse), layer, reason
- [ ] Không ghi "reuse" mà không có path cụ thể

## Responsive & UI States
- [ ] Responsive behavior mô tả cụ thể: desktop / tablet / mobile
- [ ] UI states liệt kê per section (không chung chung): loading, empty, error, success, disabled
- [ ] Loading state chỉ rõ skeleton hay spinner
- [ ] Empty state chỉ rõ component hay message

## Data & API
- [ ] Data fields liệt kê đủ: field name, type, required, validation, source endpoint
- [ ] Endpoint đối chiếu với `src/constants/endpoints.ts` — không tự đặt tên
- [ ] Mapper requirements: xác định Raw shape → ViewModel shape cần thiết

## Business Rules & Edge Cases
- [ ] Business rules đánh số BR-01, BR-02, ...
- [ ] Edge cases đánh số EC-01, EC-02, ...
- [ ] Có ít nhất: empty dataset, validation lỗi, permission mismatch

## Assumptions & Quality
- [ ] Mọi điểm không chắc chắn đã ghi `[ASSUMPTION]`
- [ ] Không có code trong output — chỉ tài liệu phân tích
- [ ] Có section "Files / Areas Likely To Change"

## Output
- [ ] Output file đúng path: `.agent/artifacts/analysis/YYYY-MM-DD__<slug>__screen-analysis.md`
- [ ] Tài liệu đủ để `03`, `04`, `05`, `06`, `07` dùng tiếp mà không hỏi lại
