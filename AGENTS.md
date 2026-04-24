# 🧠 Full-Cycle Feature Development Prompts

Quy trình 6 bước từ Figma → API audit → Code hoàn chỉnh.  
Áp dụng cho **mọi dự án Frontend**, không phụ thuộc stack hay framework.

> **Cách dùng:** Thay `[PLACEHOLDER]` bằng giá trị thực tế của dự án bạn đang làm.

---

## Bước 0 – Kích hoạt vai trò

> Dùng **1 lần** đầu phiên làm việc.

**Prompt:**
> "Đóng vai **Senior Frontend Architect** cho dự án tại `[PROJECT_DIR]`.
>
> Nguyên tắc:
> - Đọc `package.json` + `[PROJECT_RULES]` (nếu có) để xác định stack trước khi viết code.
> - Kiến trúc dữ liệu: **Raw API → Mapper → ViewModel → UI**.
> - Không hardcode mock data. Server state phải đi qua data-fetching library.
> - Cuối mỗi câu trả lời: `✅ Đã làm | 🔄 Đang làm | ⏭️ Tiếp theo`."

---

## Bước 1 – Phân tích Figma

**Prompt:**
> "Phân tích màn hình Figma: `[FIGMA_LINK]`
>
> Trình bày 3 bảng:
> 1. **Design Tokens** — màu, spacing, radius, shadow, typography.
> 2. **Component Breakdown** — phân loại Atom / Molecule / Organism.
> 3. **Data Fields** — tên trường, kiểu dữ liệu, bắt buộc hay không.
>
> Chưa viết code."

---

## Bước 2 – Đối chiếu tài liệu & kiểm tra API

> Gộp: đọc tài liệu + audit API backend + tổng hợp Gap Analysis.

**Prompt:**
> "Đọc tài liệu màn hình tại `[DOCS_DIR]/TÊN_FILE.md`, sau đó đọc Controller tại `[API_DIR]/TÊN_CONTROLLER.*`.
>
> Thực hiện:
> 1. Xác nhận endpoints cần dùng (method, URL, params).
> 2. Kiểm tra: endpoint tồn tại? response đủ trường? có pagination? có validation? có error handling? có auth middleware?
> 3. Tổng hợp **Gap Analysis**:
>
> | Bảng | Nội dung |
> |---|---|
> | API thiếu | Trường UI cần nhưng API chưa trả về → đề xuất giải pháp |
> | Figma thiếu | Trường tài liệu có nhưng Figma chưa thể hiện |
> | Quyết định FE | Vấn đề + giải pháp + lý do |
>
> Hỏi tôi xác nhận trước khi tiếp."

---

## Bước 3 – Scaffolding

> Chỉ lên **kế hoạch file**, chưa viết code.

**Prompt:**
> "Đã xác nhận Gap Analysis. Hãy:
> 1. Đọc cấu trúc `[PROJECT_DIR]/src/` để hiểu convention.
> 2. Liệt kê từng file `[NEW]` hoặc `[MOD]` + mục đích 1 dòng.
> 3. Hỏi tôi: 'Bắt đầu từ file nào?'"

---

## Bước 4 – Triển khai code

> Viết theo thứ tự lớp: Type → Mapper → API → Hook → Validation → UI.

**Prompt:**
> "Triển khai theo thứ tự:
> 1. **Types**: `interface Raw___` (khớp API) + `interface ___` (ViewModel).
> 2. **Mapper**: `mapFromRaw()` (sanitize) + `mapToRaw()` (payload).
> 3. **API service**: Gọi HTTP client, import mapper.
> 4. **Data hooks**: Query + Mutation, không dùng `useEffect` để fetch.
> 5. **Validation**: Schema function nhận `t()` nếu có i18n. Bổ sung key ngôn ngữ.
> 6. **UI**: Kiểm tra component dùng chung trước → Organism → Page.
>
> Yêu cầu UI:
> - String user-facing → dùng `t()` nếu có i18n.
> - Loading → Skeleton. Error → message từ API. Empty → icon + text."

---

## Bước 5 – Kiểm tra chất lượng

**Prompt:**
> "Rà soát code màn hình `[TÊN]` theo checklist:
>
> | Tiêu chí | ✅/❌ |
> |---|---|
> | Không `useEffect` fetch data | |
> | Không mock/hardcode | |
> | Mapper sanitize đúng | |
> | String dùng `t()` | |
> | File ngôn ngữ vi + en đồng bộ | |
> | Loading / Error / Empty đủ 3 case | |
> | Tên file đúng convention | |
> | Không có `any` | |
>
> Chạy build/lint, fix nếu lỗi."

---

## 💡 Shortcut

Khi đã quen, gộp Bước 1–3 bằng 1 prompt:

> "Phân tích Figma `[LINK]`, đối chiếu `[DOC]`, audit API `[CONTROLLER]`, trình bày Gap Analysis rồi đề xuất Scaffolding."