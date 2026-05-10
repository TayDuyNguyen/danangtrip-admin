# Skill: 06-data-integration (Tích hợp Data — TanStack Query)

## 0) Tuyên bố tự mô tả
Skill này gắn API vào UI thông qua TanStack Query hooks, tuân thủ data flow: API module → mapper → hook → UI component.

## 1) Goal
- Tạo React Query hooks cho feature.
- Wire data vào UI components đã build.
- Implement đầy đủ states: loading (skeleton), error (toast), empty (EmptyState), success.

## 2) Persona
Đóng vai: **Senior Software Engineer**.

## 3) Input & Context (must read first)
- `.agent/rules/PROJECT_RULES.md` (Sections 4, 14)
- `src/providers/index.tsx` — QueryClient setup
- `src/api/<feature>Api.ts` — API functions
- `src/dataHelper/<feature>.mapper.ts` — mapper
- `src/hooks/useTourQueries.ts` — hook pattern mẫu (READ + MUTATION)
- `src/hooks/useDashboardQueries.ts` — parallel queries pattern mẫu
- `src/hooks/useLocationQueries.ts` — pattern mẫu thứ 3

## 4) Workflow

### 4.1 Read Hooks
1. useQuery cho list data:
   ```ts
   export function use<Feature>List(params: ListParams) {
     return useQuery({
       queryKey: ['<feature>', 'list', params],
       queryFn: async () => {
         const res = await featureApi.getList(params);
         return { ...res.data, data: res.data.data.map(mapRawFeatureToViewModel) };
       },
       staleTime: 5 * 60 * 1000,
     });
   }
   ```
2. useQuery cho detail:
   ```ts
   export function use<Feature>Detail(id: number) {
     return useQuery({
       queryKey: ['<feature>', 'detail', id],
       queryFn: async () => {
         const res = await featureApi.getById(id);
         return mapRawFeatureToViewModel(res.data.data);
       },
       enabled: !!id,
       staleTime: 5 * 60 * 1000,
     });
   }
   ```
3. **Parallel queries** cho independent data (KHÔNG chain enabled).

### 4.2 Mutation Hooks
4. useMutation cho create/update/delete:
   ```ts
   export function use<Feature>Mutations() {
     const queryClient = useQueryClient();
     const { t } = useTranslation();
     
     const create = useMutation({
       mutationFn: (data: CreateInput) => featureApi.create(data),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['<feature>'] });
         toast.success(t('<feature>.create_success'));
       },
     });
     
     return { create };
   }
   ```

### 4.3 Wire UI
5. Wire hooks vào page/organism components.
6. Pass data/loading/error qua props xuống child components.
7. KHÔNG call hooks sâu trong component tree — call ở page level.

### 4.4 States
8. Loading → truyền `isLoading` vào component → render Skeleton.
9. Error → `toast.error(error.message)` từ sonner.
10. Empty → truyền `isEmpty` hoặc check `data.length === 0` → render EmptyState.
11. Success → render data thật.

## 5) Strict Rules
- Data flow bắt buộc: `API module → mapper → hook → UI`
- KHÔNG gọi API trực tiếp trong component.
- KHÔNG hardcode mock data.
- Parallel queries cho independent data (xem PROJECT_RULES §14).
- staleTime: 5–30 phút cho non-volatile data.
- Query keys: hierarchical `['<feature>', 'list', params]`.
- Loading: Skeleton screens (KHÔNG full-page spinner — tránh CLS).

## 6) Output specification
- `src/hooks/use<Feature>Queries.ts`
- `src/pages/<Feature>/components/` (wired with real data)
- `src/pages/<Feature>/components/<Component>Skeleton.tsx` (skeleton variants)
