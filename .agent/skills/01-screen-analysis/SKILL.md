# Skill: 01-screen-analysis (Phân tích màn hình Admin)

## 0) Tuyên bố tự mô tả
Skill này **tự chứa toàn bộ quy tắc và checklist**. Khi kích hoạt, đọc toàn bộ file trong folder này trước khi làm.

## 1) Goal
Phân tích 1 màn hình từ mockup/SRS và output ra **checklist triển khai** bao gồm:
- UI elements cần build
- API calls cần gọi (từ `src/constants/endpoints.ts`)
- Business rules cần tuân thủ
- States cần xử lý

**KHÔNG viết code ở bước này.**

## 2) Persona (mandatory)
Đóng vai: **Business Analyst (BA)**. Đọc `persona.md` trước khi làm.

## 3) Input & Context (must read first)
- `persona.md`
- PRD/SRS/mockup do người dùng cung cấp
- `d:/DATN/DATN_Tài liệu/docs/api/api_list.md` — **NGUỒN CHÂN LÝ API** (184 endpoints, params, DB tables, auth level, test scripts)
- `src/constants/endpoints.ts` — endpoints đã đăng ký trong frontend
- `.agent/rules/PROJECT_RULES.md` — repo conventions
- `src/routes/` — routes hiện có
- `src/pages/Tours/` — pattern mẫu (hiểu cấu trúc feature hiện có)

## 4) Workflow

### 4.1 Phân tích Design (từ mockup/SRS)
1. **Component breakdown**:
   - `[REUSE]`: components đã có trong `src/components/ui/`, `src/components/common/`, `src/pages/*/components/`
   - `[NEW]`: components cần tạo mới
   - `[MOD]`: components cần chỉnh sửa
2. **Responsive behavior**: desktop-first (admin panel), tablet, mobile nếu cần.
3. **UI States**: loading (skeleton), empty, error, success, disabled, hover/focus.

### 4.2 Phân tích Data
4. **Data fields**: field name, type, required/optional, validation rules.
5. **API endpoints**: map với `src/constants/endpoints.ts`, xác định endpoints nào cần thêm.
6. **Mapper requirements**: Raw API shape → ViewModel shape.

### 4.3 Phân tích Business
7. **Business rules**: liệt kê BR-xx cho màn này.
8. **Actors & permissions**: admin / staff / guest — ai được làm gì.
9. **Edge cases**: timeout, partial data, concurrent edit, large dataset, export limits.

### 4.4 Output Checklist
10. Tổng hợp thành checklist triển khai có structure rõ ràng.

## 5) Strict Rules
- **Không bịa business rule**: thứ không chắc → ghi `[ASSUMPTION]` + "cần xác nhận".
- **Không viết code**: output chỉ là tài liệu phân tích.
- **Không skip UI states**: mỗi component phải liệt kê đủ states.
- **Xác nhận endpoint qua api_list.md**: không tự suy diễn path/method — đối chiếu với `DATN_Tài liệu/docs/api/api_list.md` trước khi ghi vào analysis.

## 6) Output specification
Tạo file tại:
- `.agent/artifacts/analysis/YYYY-MM-DD__<feature-slug>__screen-analysis.md`

Dùng template: `template_screen_analysis.md`

## 7) Control
Đối chiếu `checklist.md` và báo cáo Pass/Fail từng mục.
