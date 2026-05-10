# Skill: 03-types-api-contract (Định nghĩa Types, Yup Schemas, API Module, Mapper)

## 0) Tuyên bố tự mô tả
Skill này chuyển SRS/analysis thành TypeScript interfaces, Yup schemas, API modules, và data mappers — đúng theo kiến trúc hiện có của admin repo.

## 1) Goal
Chuyển SRS/analysis thành:
- **TypeScript interfaces** (Raw + ViewModel)
- **Yup validation schemas** (function-based, i18n-compatible)
- **API service module** (async, typed, thin transport layer)
- **Data mapper** (Raw → ViewModel sanitization)
- **API contract document**

## 2) Persona (mandatory)
Đóng vai: **System Architect**. Đọc `persona.md` trước khi làm.

## 3) Input & Context (must read first)
- `persona.md`
- `.agent/rules/PROJECT_RULES.md` (Sections 12, 14, 15)
- Screen analysis: `.agent/artifacts/analysis/YYYY-MM-DD__<slug>__screen-analysis.md`
- `d:/DATN/DATN_Tài liệu/docs/api/api_list.md` — **NGUỒN CHÂN LÝ API** (xác nhận method, path, params name, auth level TRƯỚC khi tạo type)
- `src/constants/endpoints.ts` — endpoints đã đăng ký trong frontend
- `src/types/api.ts` — ApiResponse<T>, PaginatedResponse<T> (REUSE)
- `src/types/` — entities hiện có (REUSE trước khi tạo mới)
- `src/api/tourApi.ts` — API module pattern mẫu
- `src/dataHelper/tour.mapper.ts` — mapper pattern mẫu
- `src/dataHelper/tour.dataHelper.ts` — dataHelper pattern mẫu
- `src/validations/tour.schema.ts` — Yup schema pattern mẫu

## 4) Workflow

### 4.1 TypeScript Types
1. Đọc data fields từ analysis → tạo interfaces.
2. **Raw interface**: match chính xác backend response shape.
3. **ViewModel interface**: clean shape để UI consume.
4. Placement: `src/types/<feature>.ts`.
5. Conventions:
   - `import type` cho type-only imports.
   - Không dùng `any` — dùng `unknown` + type guard.
   - Suffix `.ts` (không phải `.types.ts` — theo convention admin repo).

### 4.2 Yup Validation Schemas
6. Schema là function nhận `t: TFunction`:
   ```ts
   export const featureSchema = (t: TFunction) => yup.object({
     name: yup.string().required(t('validation.name_required')),
   });
   ```
7. Placement: `src/validations/<feature>.schema.ts`.
8. Export cả schema function và inferred type:
   ```ts
   export type FeatureFormValues = yup.InferType<ReturnType<typeof featureSchema>>;
   ```

### 4.3 API Module
9. File: `src/api/<feature>Api.ts`.
10. Pattern mẫu:
    ```ts
    export const featureApi = {
      getList: (params: ListParams) => axiosClient.get<ApiResponse<Feature[]>>(ENDPOINT, { params }),
      getById: (id: number) => axiosClient.get<ApiResponse<Feature>>(ENDPOINT(id)),
      create: (data: CreateInput) => axiosClient.post<ApiResponse<Feature>>(ENDPOINT, data),
      update: (id: number, data: UpdateInput) => axiosClient.put<ApiResponse<Feature>>(ENDPOINT(id), data),
      delete: (id: number) => axiosClient.delete<ApiResponse<void>>(ENDPOINT(id)),
    };
    ```
11. Dùng endpoints từ `src/constants/endpoints.ts` — KHÔNG hardcode string paths.
12. Import axiosClient từ `src/api/axiosClient.ts`.
13. KHÔNG chứa business logic — chỉ transport.

### 4.4 Data Mapper
14. File: `src/dataHelper/<feature>.mapper.ts`.
15. Pattern:
    ```ts
    export function mapRawFeatureToViewModel(raw: RawFeature): Feature {
      return {
        id: toNumberSafe(raw.id),
        name: raw.name ?? '',
        // ...
      };
    }
    ```
16. Dùng safe converters: `toNumberSafe`, `toArraySafe`, `toDateLabelSafe`.
17. Nếu cần helpers phức tạp → `src/dataHelper/<feature>.dataHelper.ts`.

### 4.5 API Contract Document
18. Tạo contract doc theo template.

## 5) Strict Rules
- **Types phải match backend response** — ĐốI CHIẾU `api_list.md` trước khi tạo field, không tự bịa.
- **API path/method phải đúng chính xác** — copy từ `api_list.md`, không suy diễn.
- API module KHÔNG chứa business logic — chỉ transport.
- Yup schemas PHẢI là function nhận `t: TFunction`.
- Luôn dùng safe converters trong mapper.
- KHÔNG import chéo giữa các feature API modules.

## 6) Output specification
- `src/types/<feature>.ts`
- `src/api/<feature>Api.ts`
- `src/dataHelper/<feature>.mapper.ts`
- `src/dataHelper/<feature>.dataHelper.ts` (nếu cần)
- `src/validations/<feature>.schema.ts`
- `.agent/artifacts/api-contracts/YYYY-MM-DD__<feature-slug>__api-contract.md`

Template: `template_api_contract.md`

## 7) Control
Đối chiếu `checklist.md` và report Pass/Fail.
