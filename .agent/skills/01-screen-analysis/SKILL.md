---
name: 01-screen-analysis
description: Analyze an admin screen from mockup, SRS, or business notes and produce a detailed implementation-ready analysis document. Use when a new screen, major screen change, or unclear UI requirement appears.
---

# Skill: 01-screen-analysis

## Overview

Skill này là bước mở đầu của pipeline.
Nó dùng để biến yêu cầu thô như mockup, SRS, note nghiệp vụ, hoặc mô tả từ USER thành **screen analysis document đủ chi tiết để các bước sau không phải tự đoán**.

Mục tiêu của output không phải là "ghi chú ngắn", mà là tài liệu đủ để:

- `03-types-api-contract` xác định đúng field và API
- `04-layout-routing` biết route/layout nào cần thay đổi
- `05-ui-components` biết component nào cần reuse hoặc tạo mới
- `06-data-integration` biết states và flow data
- `07-interactions` biết action nào là trọng tâm

## Required Input

- `persona.md`
- PRD/SRS/mockup do người dùng cung cấp
- Figma link hoặc Stitch link nếu có
- `DESIGN.md` (d:/DATN/danangtrip-admin/DESIGN.md)
- `DATN/DATN_Tài liệu/docs/api/api_list.md`
- `src/constants/endpoints.ts`
- `.agent/rules/PROJECT_RULES.md`
- `src/routes/`
- `src/pages/Tours/`

## Recommended Questions To Answer

Trước khi hoàn thành analysis, skill nên tự trả lời rõ:

1. Màn này phục vụ tác vụ gì?
2. Ai là actor chính?
3. Có phải màn mới hoàn toàn hay là biến thể của màn cũ?
4. Data nào là bắt buộc, data nào là phụ?
5. Tình huống lỗi/empty/loading nào dễ bị bỏ sót?
6. Có action nào nhạy cảm về quyền hạn không?
7. Có assumption nào cần ghi lại trước khi code không?

## Process

### 1) Summary And Scope

Xác định:

- tên màn hình
- feature slug
- mục tiêu nghiệp vụ
- actor chính
- module/nhóm chức năng liên quan

### 2) Design And Token Audit

Không chỉ nhìn layout.
Phải đối chiếu với `DESIGN.md` và Figma/Stitch nếu có:

- màu sắc (primary, secondary, neutral, surface)
- typography (font family, size, weight)
- spacing và border radius
- elevation / shadow
- motion / transition nếu có

Nếu mockup lệch khỏi token chuẩn trong `DESIGN.md`, phải flag rõ.

### 3) Component Breakdown

Phải chia rõ:

- `[REUSE]`: component đang có thể dùng lại
- `[NEW]`: component phải tạo mới
- `[MOD]`: component cần chỉnh sửa

Khi liệt kê component, nên nói thêm:

- vì sao reuse được
- nếu mod thì impact nằm ở đâu
- component đó thuộc atom / molecule / organism / section nào

### 3) Responsive And UI States

Không chỉ ghi "responsive".
Phải nói cụ thể:

- desktop layout
- tablet layout
- mobile layout
- behavior thay đổi ở từng breakpoint

Mỗi section quan trọng nên có:

- loading
- empty
- error
- success
- disabled
- hover/focus nếu có action

### 4) Data And API Analysis

Phải map:

- field name
- type
- required/optional
- validation expectation
- source API hoặc endpoint liên quan

Nếu API chưa chắc chắn, phải ghi:

- `[ASSUMPTION]`
- hoặc `Open Question`

### 5) Business Rules And Edge Cases

Business rules nên được đánh số `BR-01`, `BR-02`, ...
Edge cases nên được đánh số `EC-01`, `EC-02`, ...

Ưu tiên bắt các case như:

- empty dataset
- timeout
- validation lỗi
- duplicate value
- concurrent edit
- permission mismatch

### 6) Handoff To Next Steps

Cuối tài liệu phải để người bước sau nhìn vào biết:

- code areas likely to change
- hooks/services likely to exist
- actions likely to be implemented
- auth requirement có hay không

## Output Example — Component Breakdown

Đây là ví dụ về component breakdown đúng chuẩn:

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `DataTable` | [REUSE] | Organism | `src/components/common/DataTable.tsx` | Dùng lại generic table, truyền columns config |
| `StatusBadge` | [REUSE] | Atom | `src/components/ui/StatusBadge.tsx` | Đã có, chỉ cần thêm variant `tour` |
| `TourFilterBar` | [NEW] | Molecule | `src/pages/Tours/components/TourFilterBar.tsx` | Chưa có filter theo category + status |
| `TourFormModal` | [NEW] | Organism | `src/pages/Tours/components/TourFormModal.tsx` | Form create/edit trong modal |
| `Pagination` | [REUSE] | Molecule | `src/components/pagination/Pagination.tsx` | Dùng lại, không cần sửa |

**Không được viết:**
```
- DataTable: reuse
- Filter: new
- Modal: new
```

## Output Example — UI States

Đây là ví dụ về UI states đúng chuẩn:

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Tour table | `TourTableSkeleton` (10 rows) | "Chưa có tour nào" + nút Thêm mới | Inline error + retry | N/A |
| Filter bar | Skeleton pills | Ẩn filter | Toast error | N/A |
| Form modal | Submit button disabled + spinner | N/A | Field-level errors + toast | Toast + close modal |
| Delete confirm | N/A | N/A | Toast error | Toast + remove row |

**Không được viết:**
```
- Loading state: có
- Empty state: có
- Error state: có
```

## Output Example — Data/API Mapping

| Field | Type | Required | Validation | Source Endpoint |
|---|---|---|---|---|
| `id` | `number` | ✓ | — | `GET /admin/tours` |
| `tour_name` | `string` | ✓ | max 200 chars | `GET /admin/tours` |
| `is_active` | `0 \| 1` | ✓ | — | `GET /admin/tours` |
| `category_id` | `number` | ✓ | must exist | `GET /admin/tours` |
| `price` | `number \| null` | ✗ | min 0 | `GET /admin/tours` |
| `created_at` | `string` (ISO) | ✓ | — | `GET /admin/tours` |

## Output Document

Tạo file:

- `.agent/artifacts/analysis/YYYY-MM-DD__<feature-slug>__screen-analysis.md`

Template:

- `template_screen_analysis.md`

## Strict Rules

- Không viết code ở bước này
- Không bịa business rules hoặc endpoint
- Mọi điểm chưa chắc phải đánh dấu `[ASSUMPTION]`
- Endpoint nên đối chiếu với cả `api_list.md` và `src/constants/endpoints.ts`
- Nếu không thấy component cũ để reuse, phải ghi rõ "chưa tìm thấy" thay vì giả định có

## Red Flags

Nếu thấy những dấu hiệu sau trong analysis, phải bổ sung:

- Component breakdown chỉ có tên, không có path/layer/reason → bước 05 không dùng được
- UI states chỉ ghi "có" → bước 05 không biết render gì
- Data mapping không có source endpoint → bước 03 phải tự đoán
- Không có business rules section → bước 07 sẽ miss edge cases
- Không có `[ASSUMPTION]` dù có nhiều điểm chưa chắc → silent assumption

## Common Rationalizations

| Lý do hay gặp | Thực tế |
|---|---|
| "Màn admin đơn giản, không cần analysis chi tiết" | Bước sau sẽ tự đoán và drift — tốn thêm thời gian fix |
| "Chưa có mockup, phân tích sau" | Phân tích từ SRS/notes trước, ghi `[ASSUMPTION]` cho phần chưa có mockup |
| "Component breakdown rõ rồi, không cần bảng" | Bảng giúp bước 05 đọc nhanh — prose dài khó scan |
| "API chưa có docs, bỏ qua phần data mapping" | Phải ghi `Open Question` — không được bỏ qua im lặng |

## Documentation Expectations

Analysis tốt phải có:

- summary rõ (screen type, actor, module)
- component breakdown rõ (bảng với path, layer, reason)
- UI states rõ (per section, không phải chung chung)
- data/API mapping rõ (field, type, source endpoint)
- business rules rõ (BR-xx)
- edge cases rõ (EC-xx)
- assumptions/open questions rõ
- files likely to change

Không nên viết analysis kiểu:

- chỉ 3-4 bullet ngắn
- không có endpoint
- không có state handling
- không có risk/open question

## Verification

- Đối chiếu `checklist.md`
- Tài liệu phải đủ để `03-types-api-contract`, `04-layout-routing`, và `05-ui-components` dùng tiếp
- Người đọc phải hiểu được màn hình này mà không cần mở mockup lại ngay lập tức
