# Checklist: 01-screen-analysis

- [ ] Đã đọc PRD/SRS/mockup liên quan đến màn hình này.
- [ ] Component breakdown rõ ràng: `[REUSE]`, `[NEW]`, `[MOD]` với lý do.
- [ ] Responsive behavior đã mô tả: desktop / tablet / mobile.
- [ ] UI States liệt kê đủ: loading, empty, error, success, disabled, hover/focus.
- [ ] Data fields liệt kê đủ: field name, type, required, validation, example.
- [ ] API endpoints xác định: đã đối chiếu với `src/constants/endpoints.ts`.
- [ ] Mapper requirements: xác định Raw shape → ViewModel shape cần thiết.
- [ ] Business rules liệt kê: BR-xx với điều kiện rõ ràng.
- [ ] Actors & permissions xác định: admin / staff / guest.
- [ ] Edge cases liệt kê (timeout, empty data, large dataset, concurrent, export).
- [ ] Output file đúng path: `.agent/artifacts/analysis/YYYY-MM-DD__<slug>__screen-analysis.md`.
- [ ] Không có code trong output — chỉ tài liệu phân tích.
- [ ] Mọi điểm không chắc chắn đã ghi `[ASSUMPTION]`.
