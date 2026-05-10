# Skill: 07-interactions (CRUD, Filter, Search, Pagination, Export)

## 0) Tuyên bố tự mô tả
Skill này implement tất cả user interactions: form CRUD, filter, search, pagination, export — dùng react-hook-form + yup, sonner toast, i18n.

## 1) Goal
- Form CRUD với validation (react-hook-form + yup + i18n errors).
- Search/Filter với debounce.
- Pagination sync với URL.
- Export với loading state.
- Mọi action có feedback: toast.success / toast.error.

## 2) Persona
Đóng vai: **Senior Software Engineer**.

## 3) Input & Context (must read first)
- `.agent/rules/PROJECT_RULES.md` (Sections 4, 5, 7, 16)
- `src/validations/<feature>.schema.ts` — Yup schemas
- `src/hooks/use<Feature>Queries.ts` — hooks đã có
- `src/pages/Tours/` — interaction pattern mẫu (Create/Edit modal, filter, delete confirm)
- `src/pages/Locations/` — pattern mẫu thứ 2

## 4) Workflow

### 4.1 Form CRUD
1. Form dùng react-hook-form + yupResolver:
   ```ts
   const { register, handleSubmit, formState: { errors } } = useForm({
     resolver: yupResolver(featureSchema(t)),
   });
   ```
2. Error messages từ i18n (schema đã nhận `t`).
3. Submit → useMutation → onSuccess: toast.success + close modal + invalidate.
4. Cancel → reset form + close modal.

### 4.2 Delete Confirm
5. Confirm dialog: conditional render (KHÔNG dùng `window.confirm`).
6. Pattern: `isDeleteConfirmOpen` state + Dialog component.
7. onConfirm → useMutation delete → onSuccess: toast.success + invalidate.

### 4.3 Search & Filter
8. Search: controlled input + debounce 300ms trước khi update query params.
9. Filter selects: controlled state, apply khi user nhấn Apply hoặc onChange.
10. Sync filter state với URL search params.
11. Reset All: clear tất cả filters + reset URL params.

### 4.4 Pagination
12. Sync page với URL search params.
13. Component: `src/components/pagination/` (đã có — REUSE).
14. onPageChange → update URL param → hook refetch tự động.

### 4.5 Export
15. Export button → API call → blob download.
16. Button: disabled + spinner khi loading.
17. onSuccess: tự động trigger browser download.
18. onError: toast.error.

### 4.6 Status Toggle / Quick Actions
19. Inline toggle (status, featured, hot): useMutation PATCH → invalidate → toast.
20. Optimistic update nếu UX cần (check với PROJECT_RULES).

## 5) Strict Rules
- Form validation: react-hook-form + yup (KHÔNG validate thủ công).
- Yup schema nhận `t: TFunction` — messages phải qua i18n.
- Mọi action: success toast + error toast.
- Loading state: button disabled + spinner khi mutation pending.
- KHÔNG dùng `window.confirm` cho delete confirm.
- Pagination: sync với URL params (KHÔNG chỉ local state).
- Debounce search: 300ms (KHÔNG gọi API mỗi keystroke).
- i18n: cập nhật vi và en cùng lúc.

## 6) Output specification
- `src/pages/<Feature>/components/` (form, filter, delete confirm, export button)
- Cập nhật `src/hooks/use<Feature>Queries.ts` (mutation hooks)
- Cập nhật i18n locale files (vi + en)
