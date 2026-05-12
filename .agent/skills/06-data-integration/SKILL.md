---
name: 06-data-integration
description: Plan and implement data wiring through TanStack Query, mappers, and UI state handling. Use when real API data must be connected to the screen.
---

# Skill: 06-data-integration

## Overview

## When to Use

- When connecting real admin APIs to pages and components.
- When query, mutation, mapper, and UI state ownership must be planned explicitly.
- When existing data flow is likely to drift without a written integration plan.

Skill này mô tả và thực hiện cách nối API thật vào UI theo flow:

```
API module → mapper → hook (TanStack Query) → UI component
```

Đây là bước biến UI tĩnh thành màn hình dùng dữ liệu thật, và đồng thời đảm bảo loading/error/empty states không bị bỏ sót.

## Required Input

- `persona.md`
- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `.agent/memory/HANDOFF.md`
- `src/providers/index.tsx`
- `src/api/<feature>Api.ts`
- `src/dataHelper/<feature>.mapper.ts`
- `src/hooks/useTourQueries.ts`
- `src/hooks/useDashboardQueries.ts`
- `src/hooks/useLocationQueries.ts`

## Recommended Questions To Answer

1. Query nào là list, query nào là detail, query nào là lookup?
2. Query nào có thể chạy song song?
3. Mutation nào cần invalidate query nào?
4. Data nào cần map trước khi vào UI?
5. UI section nào sẽ render loading/empty/error như thế nào?

## Process

### 1) Data Source Breakdown

Liệt kê rõ:

- endpoint/service nào được dùng
- purpose của từng query
- dependency giữa các query nếu có

### 2) Query Strategy

Phải mô tả:

- query key (hierarchical)
- trigger condition
- staleTime
- enabled condition nếu có

### 3) Mutation Strategy

Phải chỉ ra:

- action nào là create/update/delete/toggle/export
- invalidate query nào sau success
- success/error feedback nào nên có

### 4) UI State Handling

Không chỉ ghi "loading/error/empty".
Phải chỉ ra:

- section nào loading ra sao (skeleton hay spinner)
- empty state hiển thị ở đâu
- error xử lý bằng toast, inline state, hay cả hai

### 5) Handoff To Implementation

Data integration plan nên để người triển khai biết:

- hook files nào cần tạo/sửa
- component nào cần nhận data props
- skeleton nào cần tạo

## Pattern Chuẩn Của Repo

### Query key convention — hierarchical

```ts
// src/hooks/useTourQueries.ts
// Bám pattern này — không dùng string đơn giản

const tourKeys = {
  all: ['tours'] as const,
  lists: () => [...tourKeys.all, 'list'] as const,
  list: (params: TourListParams) => [...tourKeys.lists(), params] as const,
  details: () => [...tourKeys.all, 'detail'] as const,
  detail: (id: number) => [...tourKeys.details(), id] as const,
};
```

### useQuery pattern

```ts
export const useTourList = (params: TourListParams) => {
  return useQuery({
    queryKey: tourKeys.list(params),
    queryFn: async () => {
      const res = await tourApi.getList(params);
      // Map raw → ViewModel trước khi trả về
      return {
        ...res.data.data,
        data: res.data.data.data.map(mapTour),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

export const useTourDetail = (id: number) => {
  return useQuery({
    queryKey: tourKeys.detail(id),
    queryFn: async () => {
      const res = await tourApi.getDetail(id);
      return mapTour(res.data.data);
    },
    enabled: !!id, // Chỉ chạy khi có id
  });
};
```

### useMutation pattern — với invalidation

```ts
export const useCreateTour = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateTourInput) => tourApi.create(data),
    onSuccess: () => {
      // Invalidate list — không invalidate detail vì chưa có id
      queryClient.invalidateQueries({ queryKey: tourKeys.lists() });
      toast.success(t('tour.createSuccess'));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteTour = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: number) => tourApi.delete(id),
    onSuccess: (_, id) => {
      // Invalidate list và remove detail cache
      queryClient.invalidateQueries({ queryKey: tourKeys.lists() });
      queryClient.removeQueries({ queryKey: tourKeys.detail(id) });
      toast.success(t('tour.deleteSuccess'));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
```

### UI state handling — cụ thể, không chung chung

```tsx
// Không chỉ ghi "loading state: có"
// Phải chỉ rõ component nào render gì

function TourListPage() {
  const [params, setParams] = useState<TourListParams>({ page: 1, per_page: 15 });
  const { data, isLoading, isError, refetch } = useTourList(params);

  // Loading: skeleton table, không phải full-page spinner
  if (isLoading) return <TourTableSkeleton rows={15} />;

  // Error: inline error với retry button
  if (isError) return <ErrorState message={t('tour.loadError')} onRetry={refetch} />;

  // Empty: empty state với CTA
  if (!data?.data.length) return <EmptyState message={t('tour.empty')} />;

  return <TourTable data={data.data} pagination={data} onPageChange={...} />;
}
```

### Parallel queries — khi cần nhiều data độc lập

```ts
// Chạy song song khi không có dependency
const { data: tours } = useTourList(params);
const { data: categories } = useCategoryList(); // Không phụ thuộc tours

// Chạy tuần tự khi có dependency
const { data: tour } = useTourDetail(tourId);
const { data: reviews } = useTourReviews(tourId, {
  enabled: !!tour, // Chỉ chạy sau khi có tour
});
```

## Output Document

Tạo file:

- `.agent/artifacts/integration/YYYY-MM-DD__<feature-slug>__data-integration.md`

Template:

- `template_data_integration.md`

## Strict Rules

- Không gọi API trực tiếp trong component — phải qua hook
- Không hardcode mock data trong production flow
- Query keys phải hierarchical theo pattern `tourKeys` / `locationKeys`
- Query độc lập thì chạy song song — không chain vô lý
- Error handling không được trùng lặp giữa interceptor và component (interceptor xử lý 401/403, component xử lý business error)
- UI không được consume raw shape nếu mapper là bắt buộc
- Loading phải dùng skeleton, không phải full-page spinner cho table/list

## Rationalizations

| Lý do hay gặp | Thực tế |
|---|---|
| "Query đơn giản, gọi thẳng trong component cho nhanh" | Không có caching, không có loading state chuẩn, không reuse được |
| "Invalidate all queries cho chắc" | `invalidateQueries()` không có key sẽ refetch toàn bộ app — tốn bandwidth |
| "Mapper nhỏ, map inline trong queryFn" | Khi cần test mapper hoặc reuse ở chỗ khác, sẽ phải extract lại |
| "Loading state chỉ cần spinner là đủ" | Skeleton giữ layout ổn định, tránh CLS — spinner gây layout shift |


## Red Flags

Nếu thấy những dấu hiệu sau, phải dừng và flag:

- Query key là string đơn giản `'tours'` thay vì array hierarchical → invalidation không chính xác
- Mutation không invalidate sau success → UI hiển thị data cũ
- Component gọi `tourApi.getList()` trực tiếp thay vì qua hook → không có caching
- Raw API data render thẳng vào UI mà không qua mapper → UI nhận snake_case fields
- `isLoading` nhưng không có skeleton → layout shift khi data load
- Error chỉ `console.error` mà không có UI feedback → user không biết có lỗi

## Documentation Expectations

Data integration doc tốt phải có:

- data sources (endpoint, purpose, dependency)
- query plan (key, trigger, staleTime, enabled)
- mutation plan (action, invalidate, feedback)
- UI state handling (loading/empty/error per section)
- files expected to change (hooks, components, skeletons)

## Verification

- Đối chiếu `checklist.md`
- Tài liệu phải chỉ ra đủ query/mutation, mapper dependency, và UI state handling
- Người đọc phải biết data chảy từ đâu đến đâu
- Mọi mutation phải có invalidation strategy rõ ràng
