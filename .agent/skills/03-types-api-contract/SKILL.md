---
name: 03-types-api-contract
description: Convert screen analysis into detailed types, schema, API, mapper, and contract documentation. Use when a feature introduces or changes data contracts.
---

# Skill: 03-types-api-contract

## Overview

## When to Use

- When admin features add or change data contracts, forms, filters, payloads, or response shapes.
- When API, mapper, validation, and UI types need one explicit contract.
- When analysis is done but data language is still not locked down.

Skill này chuyển screen analysis thành:

- Raw types (bám backend shape)
- ViewModel types (UI-consumable shape)
- Yup validation schema
- API module plan
- Mapper plan
- API contract document

Mục tiêu không chỉ là "liệt kê field", mà là **khóa toàn bộ contract data** để UI, hook, validation, và service cùng bám một ngôn ngữ thống nhất.
Không có bước này, các bước sau sẽ tự suy diễn type và dẫn đến drift.

## Required Input

- `persona.md`
- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `.agent/memory/HANDOFF.md`
- Analysis file từ `01-screen-analysis`
- `/DATN/DATN_Tài liệu/docs/api/api_list.md`
- `src/constants/endpoints.ts`
- `src/types/api.ts`
- `src/types/`
- `src/api/tourApi.ts`
- `src/dataHelper/tour.mapper.ts`
- `src/dataHelper/tour.dataHelper.ts`
- `src/validations/tour.schema.ts`

## Recommended Questions To Answer

1. Field nào là raw backend shape, field nào là UI-consumable shape?
2. Có field nào cần sanitize / map / rename không?
3. Endpoint nào đã tồn tại, endpoint nào cần xác nhận thêm?
4. Schema validation nên ở mức nào?
5. File nào sẽ phải tạo mới, file nào nên reuse pattern cũ?

## Process

### 1) Source Reconciliation

Đối chiếu giữa:

- analysis file
- `api_list.md`
- `src/constants/endpoints.ts`

Nếu ba nguồn không khớp, phải flag rõ.

### 2) Type Design

Thiết kế rõ:

- `Raw<Entity>` — bám backend docs, snake_case, boolean dạng số nếu backend trả vậy
- `ViewModel` — camelCase, boolean thật, Date object thay vì string
- params / payload types
- form values types nếu cần

Mỗi type nên có lý do tồn tại:

- backend fidelity
- UI cleanliness
- validation compatibility

### 3) Validation Contract

Mô tả:

- schema nào cần có
- key validation nào là bắt buộc
- message pattern phải dùng `t()`
- inferred types nào nên export

### 4) API Module Contract

Phải mô tả:

- service/API methods cần có
- method/path/auth
- input/output chính
- errors cần lưu ý

### 5) Mapper Contract

Nếu backend shape không sạch, phải chỉ rõ:

- field nào cần map
- field nào cần sanitize
- safe helper nào nên dùng

### 6) Handoff To Implementation

Tài liệu cuối phải giúp người bước sau biết:

- file nào cần tạo
- file nào cần sửa
- contract nào đã chắc
- contract nào còn assumption

## Pattern Chuẩn Của Repo

### Raw type — bám backend

```ts
// src/types/tour.ts
interface RawTour {
  id: number;
  tour_name: string;        // snake_case từ backend
  is_active: 0 | 1;        // boolean dạng số
  created_at: string;       // ISO string
  updated_at: string;
  category_id: number;
  price: number | null;
}
```

### ViewModel — UI-consumable

```ts
interface Tour {
  id: number;
  name: string;             // camelCase
  isActive: boolean;        // boolean thật
  createdAt: Date;          // Date object
  updatedAt: Date;
  categoryId: number;
  price: number | null;
}
```

### Mapper pattern — bám `tour.mapper.ts`

```ts
// src/dataHelper/tour.mapper.ts
import { safeDate } from '@/utils/safe';

export const mapTour = (raw: RawTour): Tour => ({
  id: raw.id,
  name: raw.tour_name,
  isActive: raw.is_active === 1,
  createdAt: safeDate(raw.created_at),
  updatedAt: safeDate(raw.updated_at),
  categoryId: raw.category_id,
  price: raw.price ?? null,
});
```

### Yup schema pattern — bám `tour.schema.ts`

```ts
// src/validations/tour.schema.ts
import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const tourSchema = (t: TFunction) =>
  yup.object({
    name: yup
      .string()
      .required(t('validation.required', { field: t('tour.name') }))
      .max(200, t('validation.maxLength', { max: 200 })),
    categoryId: yup
      .number()
      .required(t('validation.required', { field: t('tour.category') })),
    price: yup.number().nullable().min(0, t('validation.minValue', { min: 0 })),
  });

export type TourFormValues = yup.InferType<ReturnType<typeof tourSchema>>;
```

### API module pattern — bám `tourApi.ts`

```ts
// src/api/tourApi.ts
import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/constants/endpoints';
import type { RawTour, ListParams, ApiListResponse, ApiDetailResponse } from '@/types/api';

export const tourApi = {
  getList: (params: ListParams) =>
    axiosClient.get<ApiListResponse<RawTour>>(ENDPOINTS.TOURS.LIST, { params }),

  getDetail: (id: number) =>
    axiosClient.get<ApiDetailResponse<RawTour>>(ENDPOINTS.TOURS.DETAIL(id)),

  create: (data: CreateTourInput) =>
    axiosClient.post<ApiDetailResponse<RawTour>>(ENDPOINTS.TOURS.CREATE, data),

  update: (id: number, data: UpdateTourInput) =>
    axiosClient.put<ApiDetailResponse<RawTour>>(ENDPOINTS.TOURS.UPDATE(id), data),

  delete: (id: number) =>
    axiosClient.delete(ENDPOINTS.TOURS.DELETE(id)),
};
```

## Output Document

Tạo file:

- `.agent/artifacts/api-contracts/YYYY-MM-DD__<feature-slug>__api-contract.md`

Template:

- `template_api_contract.md`

## Strict Rules

- Không tự suy diễn path, method, hoặc field names — phải đối chiếu `api_list.md` và `endpoints.ts`
- Raw types phải bám backend docs, không tự đặt tên
- ViewModel phải tách khỏi raw shape nếu backend không sạch
- Schema phải theo pattern `schema(t: TFunction)` — không hardcode string message
- Không dùng `any`
- Không được nhảy thẳng sang code mà bỏ qua contract doc
- Mapper phải handle null/undefined safely — không để runtime crash

## Rationalizations

| Lý do hay gặp | Thực tế |
|---|---|
| "Backend trả snake_case thì để vậy cho tiện" | UI sẽ dùng `tour.tour_name` thay vì `tour.name` — không nhất quán với codebase |
| "Schema đơn giản, không cần `t()`" | Khi đổi ngôn ngữ hoặc copy message, sẽ phải sửa lại toàn bộ |
| "Mapper nhỏ, viết inline trong hook cho nhanh" | Mapper inline không test được, không reuse được |
| "Chưa có API docs, tự đoán field trước" | Phải ghi `[ASSUMPTION]` và flag — không được code trên assumption im lặng |


## Red Flags

Nếu thấy những dấu hiệu sau, phải dừng và flag:

- ViewModel có field snake_case → chưa map đúng
- Schema dùng hardcoded string `'Trường này bắt buộc'` thay vì `t()` → sẽ không i18n được
- API module gọi `axios` trực tiếp thay vì `axiosClient` → bỏ qua interceptor
- Mapper không handle `null` / `undefined` → runtime crash khi backend trả thiếu field
- Type dùng `any` → mất type safety toàn bộ downstream
- Endpoint path hardcode trong API module thay vì dùng `ENDPOINTS` constant

## Documentation Expectations

Contract doc tốt phải có:

- source references (api_list.md section, endpoints.ts entries)
- endpoint list với method/path/auth
- request/response model đầy đủ
- raw vs view model mapping rõ ràng
- schema notes với validation rules
- error handling notes (422, 404, 403, 401, 500)
- files expected to change (types, api, mapper, schema)

## Verification

- Đối chiếu `checklist.md`
- Contract doc phải chỉ ra rõ endpoint, request/response, type mapping, schema, và file dự kiến thay đổi
- Người đọc phải biết bước code tiếp theo cần tạo chính xác file nào
- Không có field nào trong ViewModel mà không có nguồn gốc từ Raw type hoặc computed logic rõ ràng
