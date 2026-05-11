# Checklist: 06-data-integration

## Query Setup
- [ ] Hook file: `src/hooks/use<Feature>Queries.ts` tạo xong
- [ ] Query keys hierarchical: `['feature', 'list', params]` hoặc `['feature', 'detail', id]`
- [ ] `staleTime` set hợp lý (5 phút cho list, 10 phút cho detail)
- [ ] `enabled` condition đúng cho dependent queries
- [ ] Parallel queries cho independent data (không chain enabled vô lý)

## Mapper
- [ ] Mapper được gọi trong hook — KHÔNG raw data vào UI
- [ ] Mapper cover tất cả fields từ Raw → ViewModel
- [ ] Mapper handle null/undefined safely (không crash khi backend thiếu field)

## Mutation
- [ ] Mutation `onSuccess` → `invalidateQueries` đúng query key (không invalidate all)
- [ ] Mutation `onSuccess` → `toast.success` (qua `t()`)
- [ ] Mutation `onError` → `toast.error` (normalized qua `getErrorMessage`)
- [ ] Delete mutation → `removeQueries` cho detail cache sau khi xóa

## UI State Handling
- [ ] Loading state: Skeleton component (KHÔNG spinner cho table/list)
- [ ] Empty state: EmptyState component hoặc message rõ ràng
- [ ] Error state: toast.error hoặc inline error với retry
- [ ] Không có section nào render blank khi loading/empty/error

## Code Quality
- [ ] KHÔNG gọi API trực tiếp trong component — phải qua hook
- [ ] KHÔNG hardcode mock data
- [ ] Data flow đúng: API module → mapper → hook → UI component
- [ ] `npm run typecheck` pass
- [ ] `npm run lint` pass

## Output
- [ ] Data integration doc tạo đúng path: `.agent/artifacts/integration/YYYY-MM-DD__<slug>__data-integration.md`
- [ ] Doc có data sources, query plan, mutation plan, UI state handling
