---
name: 05-ui-components
description: Design and build reusable UI components from screen analysis. Use when the feature needs a component map, UI spec, and component-level implementation guidance.
---

# Skill: 05-ui-components

## Overview

## When to Use

- When building or refactoring user-facing admin UI components.
- When a screen needs a clear reuse/new/modify component plan.
- When design consistency must be checked before implementation.

Skill này chuyển screen analysis thành component map chi tiết, ưu tiên reuse, và tạo UI spec đủ rõ để build hoặc review lại sau này.
Đây là bước mô tả UI ở mức có thể giao cho dev khác triển khai mà không phải hỏi lại quá nhiều.

## Required Input

- `persona.md`
- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `.agent/memory/HANDOFF.md`
- Analysis file từ `01-screen-analysis`
- `src/components/ui/`
- `src/components/common/`
- `src/components/loading/`
- `src/components/pagination/`
- `src/pages/Tours/`

## Recommended Questions To Answer

1. Component nào đã có thể reuse?
2. Component nào thực sự cần tạo mới?
3. Component nào shared, component nào chỉ feature-specific?
4. State nào phải đi qua props?
5. UI này có điểm nào dễ lệch visual system hiện tại không?

## Process

### 1) Reuse Audit

Rà:

- atoms hiện có
- shared molecules hiện có
- organisms hoặc patterns gần giống

Không chỉ ghi "reuse".
Phải chỉ rõ path và lý do reuse.

### 2) Component Decomposition

Phải chia theo:

- atom
- molecule
- organism
- page section

Mỗi component nên ghi:

- purpose
- expected props
- loading/error/empty handling nếu có

### 3) State Contract

UI spec nên chỉ rõ:

- `isLoading` → skeleton hay spinner
- `isEmpty` → empty state component
- `error` → inline error hay toast
- disabled state
- interaction state nếu có

### 4) Placement Strategy

Mô tả rõ:

- file nào thuộc `src/components/ui`
- file nào thuộc `src/components/common`
- file nào thuộc `src/pages/<Feature>/components`

### 5) Handoff To Implementation

Cuối cùng phải để bước code hiểu được:

- thứ tự build component
- component dependency
- file expected to change

## Pattern Chuẩn Của Repo

### Component placement decision

```
src/components/ui/          → Primitive atoms: Button, Input, Badge, Select
                              Không có business logic, không fetch data
src/components/common/      → Shared molecules: DataTable, FilterBar, ConfirmDialog
                              Dùng ở nhiều feature
src/components/loading/     → Skeleton components: TableSkeleton, CardSkeleton
src/components/pagination/  → Pagination component
src/pages/<Feature>/components/ → Feature-local: TourFormModal, TourStatusBadge
                              Chỉ dùng trong feature đó
```

### Loading state — skeleton, không spinner cho table/list

```tsx
// GOOD: Skeleton giữ layout ổn định
// src/components/loading/TourTableSkeleton.tsx
function TourTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Đang tải...">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border rounded">
          <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}

// BAD: Spinner gây layout shift
if (isLoading) return <div className="flex justify-center"><Spinner /></div>;
```

### Empty state — có message và CTA

```tsx
// GOOD: Empty state có context và action
function TourEmptyState({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-16" role="status">
      <InboxIcon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-base font-medium">{t('tour.empty.title')}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{t('tour.empty.desc')}</p>
      {onAdd && (
        <button className="mt-4 btn-primary" onClick={onAdd}>
          {t('tour.addFirst')}
        </button>
      )}
    </div>
  );
}
```

### Props typing — explicit, không dùng any

```tsx
// GOOD: Props typed rõ ràng
interface TourTableProps {
  data: Tour[];
  pagination: PaginationMeta;
  onEdit: (tour: Tour) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function TourTable({ data, pagination, onEdit, onDelete, isLoading }: TourTableProps) {
  if (isLoading) return <TourTableSkeleton />;
  if (!data.length) return <TourEmptyState />;
  // ...
}

// BAD: Props không typed
function TourTable(props: any) { ... }
```

### i18n — mọi text user-facing qua react-i18next

```tsx
// GOOD: Dùng useTranslation
import { useTranslation } from 'react-i18next';

function TourStatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={isActive ? 'badge-success' : 'badge-muted'}>
      {isActive ? t('common.active') : t('common.inactive')}
    </span>
  );
}

// BAD: Hardcode text
<span>{isActive ? 'Hoạt động' : 'Tạm dừng'}</span>
```

### DataTable pattern — reuse generic table

```tsx
// src/components/common/DataTable.tsx đã có — reuse với columns config
const columns: ColumnDef<Tour>[] = [
  {
    accessorKey: 'name',
    header: t('tour.name'),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'isActive',
    header: t('tour.status'),
    cell: ({ row }) => <TourStatusBadge isActive={row.original.isActive} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionMenu
        onEdit={() => onEdit(row.original)}
        onDelete={() => onDelete(row.original.id)}
      />
    ),
  },
];

return <DataTable columns={columns} data={tours} />;
```

## Output Document

Tạo file:

- `.agent/artifacts/ui-specs/YYYY-MM-DD__<feature-slug>__ui-spec.md`

Template:

- `template_ui_spec.md`

## Strict Rules

- Reuse first, create later
- Không nhét data fetching vào UI component
- Props phải typed rõ ràng
- Loading phải ưu tiên skeleton thay vì full-page spinner
- Text user-facing phải đi qua i18n layer (`react-i18next`)
- Không tạo shared component nếu mới chỉ có một nơi dùng mà chưa có lý do mạnh

## Rationalizations

| Lý do hay gặp | Thực tế |
|---|---|
| "Component nhỏ, fetch data trong đó cho tiện" | Khi cần test hoặc reuse, sẽ phải refactor |
| "Text tiếng Việt hardcode cho nhanh, i18n sau" | "Sau" thường không bao giờ đến |
| "Spinner đơn giản hơn skeleton" | Skeleton giữ layout ổn định, tránh CLS |
| "Tạo DataTable riêng cho feature này" | `src/components/common/DataTable.tsx` đã có — reuse |


## Red Flags

Nếu thấy những dấu hiệu sau, phải dừng và flag:

- Component fetch data trực tiếp trong body → vi phạm separation of concerns
- Hardcoded text tiếng Việt trong JSX → không i18n được
- Spinner thay vì skeleton cho table/list loading → layout shift
- Props dùng `any` → mất type safety
- Tạo component mới khi `DataTable`, `Pagination`, `ConfirmDialog` đã có → duplicate

## Documentation Expectations

UI spec tốt phải có:

- reuse/new/mod matrix (bảng với path, layer, reason)
- layer breakdown (atom/molecule/organism)
- UI states (loading/empty/error per component)
- responsive notes
- placement strategy (shared vs feature-local)
- files expected to change

## Verification

- Đối chiếu `checklist.md`
- UI spec phải chỉ ra rõ `[REUSE]`, `[NEW]`, `[MOD]` và states chính
- Người đọc phải hình dung được structure UI mà chưa cần xem code
