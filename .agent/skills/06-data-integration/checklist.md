# Checklist: 06-data-integration

- [ ] Hook file: `src/hooks/use<Feature>Queries.ts` tạo xong.
- [ ] useQuery: queryKey hierarchical `['<feature>', 'list', params]`.
- [ ] useQuery: staleTime = 5 phút (hoặc hợp lý với loại data).
- [ ] Mapper được gọi trong hook (KHÔNG raw data vào UI).
- [ ] Parallel queries cho independent data (không chain enabled vô lý).
- [ ] useMutation: onSuccess → invalidateQueries + toast.success.
- [ ] Loading state → Skeleton (KHÔNG spinner).
- [ ] Error state → toast.error (từ sonner).
- [ ] Empty state → EmptyState component hoặc "No data available".
- [ ] Data flow: API module → mapper → hook → UI component.
- [ ] KHÔNG gọi API trực tiếp trong component.
- [ ] KHÔNG hardcode mock data.
