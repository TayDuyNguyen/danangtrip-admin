---
name: 07-interactions
description: Define and implement CRUD, form validation, filters, pagination, export, and user feedback. Use when a feature has meaningful user actions beyond read-only rendering.
---

# Skill: 07-interactions

## Overview

## When to Use

- When admin screens contain CRUD flows, forms, filters, search, pagination, export, or confirm actions.
- When interaction behavior needs to be specified before implementation.
- When UX state and feedback need a repeatable pattern.

Skill này mô tả và triển khai các interaction chính của feature: form, mutation, filter, search, pagination, export, confirm flows.
Đây là bước biến data screen thành feature có thể thao tác thực sự.

## Required Input

- `persona.md`
- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `.agent/memory/HANDOFF.md`
- `src/validations/<feature>.schema.ts`
- `src/hooks/use<Feature>Queries.ts`
- `src/pages/Tours/`
- `src/pages/Locations/`

## Recommended Questions To Answer

1. Người dùng có những action chính nào?
2. Action nào là destructive?
3. Form nào cần validate?
4. Search/filter có sync URL không?
5. Có action nào cần toast hoặc optimistic update không?

## Process

### 1) Action Breakdown

Liệt kê toàn bộ actions:

- create
- update
- delete
- search
- filter
- pagination
- export
- quick actions nếu có

### 2) Form Flow Review

Phải chỉ ra:

- schema validation nào dùng
- submit flow
- reset/cancel flow
- field-level errors

### 3) URL-Synced State Review

Nếu có search/filter/pagination, phải mô tả:

- state local nào tồn tại
- state nào sync với URL
- debounce thế nào

### 4) Destructive Actions Review

Mọi action kiểu delete/bulk delete/toggle nhạy cảm nên ghi rõ:

- confirm UI
- success feedback
- error feedback
- invalidate strategy

### 5) Handoff To Implementation

Interaction spec phải để người code biết:

- component nào chứa form
- hook nào chứa mutation
- locale files nào cần thêm key

## Pattern Chuẩn Của Repo

### react-hook-form + yup pattern

```tsx
// src/pages/Tours/components/TourFormModal.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { tourSchema, type TourFormValues } from '@/validations/tour.schema';
import { useTranslation } from 'react-i18next';

function TourFormModal({ tour, onClose }: Props) {
  const { t } = useTranslation();
  const { mutate: createTour, isPending } = useCreateTour();
  const { mutate: updateTour } = useUpdateTour();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TourFormValues>({
    resolver: yupResolver(tourSchema(t)),
    defaultValues: tour
      ? { name: tour.name, categoryId: tour.categoryId, price: tour.price }
      : undefined,
  });

  const onSubmit = (data: TourFormValues) => {
    if (tour) {
      updateTour({ id: tour.id, data }, { onSuccess: onClose });
    } else {
      createTour(data, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... */}
      <button type="submit" disabled={isPending}>
        {isPending ? t('common.saving') : t('common.save')}
      </button>
    </form>
  );
}
```

### Confirm dialog pattern — không dùng window.confirm

```tsx
// src/pages/Tours/components/DeleteTourButton.tsx
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

function DeleteTourButton({ tourId, tourName }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteTour, isPending } = useDeleteTour();
  const { t } = useTranslation();

  return (
    <>
      <button onClick={() => setOpen(true)}>
        {t('common.delete')}
      </button>

      <ConfirmDialog
        open={open}
        title={t('tour.deleteConfirmTitle')}
        description={t('tour.deleteConfirmDesc', { name: tourName })}
        onConfirm={() => deleteTour(tourId, { onSuccess: () => setOpen(false) })}
        onCancel={() => setOpen(false)}
        loading={isPending}
        variant="destructive"
      />
    </>
  );
}
```

### URL-synced filter + pagination pattern

```tsx
// src/pages/Tours/TourListPage.tsx
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

function TourListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc từ URL
  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const categoryId = searchParams.get('categoryId') ?? undefined;

  // Debounce search input — không sync URL ngay lập tức
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync URL khi debounced value thay đổi
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      next.set('page', '1'); // Reset về trang 1 khi search
      return next;
    });
  }, [debouncedSearch]);

  const { data, isLoading } = useTourList({ search: debouncedSearch, page, categoryId });

  // ...
}
```

### Export pattern

```tsx
// Export không block UI — dùng mutation với loading state
const { mutate: exportTours, isPending: isExporting } = useMutation({
  mutationFn: (params: ExportParams) => tourApi.export(params),
  onSuccess: (response) => {
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `tours-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success(t('tour.exportSuccess'));
  },
  onError: () => toast.error(t('tour.exportError')),
});
```

## Output Document

Tạo file:

- `.agent/artifacts/interaction-specs/YYYY-MM-DD__<feature-slug>__interaction-spec.md`

Template:

- `template_interaction_spec.md`

## Strict Rules

- Validation dùng `react-hook-form + yup` — không dùng controlled state thủ công
- Toast success/error phải rõ ràng — dùng `sonner`
- Search phải debounce (400ms)
- Pagination phải sync URL params
- Không dùng `window.confirm` — dùng `ConfirmDialog` component
- i18n `vi/en` phải cập nhật đồng thời
- Không để destructive action chạy mà không có feedback

## Rationalizations

| Lý do hay gặp | Thực tế |
|---|---|
| "Form đơn giản, dùng useState cho nhanh" | Khi cần validation, reset, hoặc dirty check, sẽ phải refactor toàn bộ |
| "window.confirm đủ rồi" | Không nhất quán với design system, không customizable |
| "Search không cần debounce, API nhanh" | Mỗi keystroke = 1 request — tốn bandwidth và gây race condition |
| "Pagination không cần URL sync" | User mất vị trí khi back hoặc share link |


## Red Flags

Nếu thấy những dấu hiệu sau, phải dừng và flag:

- Form dùng `useState` cho từng field thay vì `react-hook-form` → không có validation tích hợp
- `window.confirm()` cho delete → không nhất quán với design system
- Search không debounce → API call mỗi keystroke
- Pagination không sync URL → user mất vị trí khi back/refresh
- Mutation success không invalidate query → UI hiển thị data cũ
- i18n key chỉ thêm vào `vi` mà quên `en` → broken UI khi switch language

## Documentation Expectations

Interaction spec tốt phải có:

- main user actions (list đầy đủ)
- forms (schema, submit flow, reset flow)
- filters/search/pagination (URL sync, debounce)
- confirm/destructive actions (confirm UI, feedback)
- i18n keys impact (keys cần thêm)

## Verification

- Đối chiếu `checklist.md`
- Interaction spec phải liệt kê rõ trigger, state, validation, feedback, và dependency
- Người đọc phải hiểu flow thao tác chính của feature
