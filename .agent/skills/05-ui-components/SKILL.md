# Skill: 05-ui-components (Xây dựng UI Components — Atomic Design)

## 0) Tuyên bố tự mô tả
Skill này build UI components theo Atomic Design, match mockup, tuân thủ Tailwind CSS v4 và design system của admin panel.

## 1) Goal
Build UI components **từ trong ra ngoài** theo Atomic Design:
1. **Atoms**: Button, Input, Badge, Skeleton, StatusBadge...
2. **Molecules**: SearchBar, FormField, FilterRow, TableRow...
3. **Organisms**: DataTable, FilterPanel, ModalForm, StatsCard...
4. **Template**: Compose organisms thành page sections

Output: **UI match mockup, responsive, tuân thủ design tokens.**

## 2) Persona (mandatory)
Đóng vai: **UI/UX Designer + Senior Software Engineer**. Đọc `persona.md` trước khi làm.

## 3) Input & Context (must read first)
- `persona.md`
- `.agent/rules/PROJECT_RULES.md` (Sections 7, 12, 17)
- Screen analysis: `.agent/artifacts/analysis/YYYY-MM-DD__<slug>__screen-analysis.md`
- `src/components/ui/` — atoms hiện có (REUSE)
- `src/components/common/` — shared molecules (REUSE)
- `src/components/loading/` — loading/skeleton components
- `src/components/pagination/` — pagination
- `src/pages/Tours/` — feature component pattern mẫu

## 4) Workflow

### 4.1 Reuse Audit
1. Scan `src/components/ui/` → list reusable atoms.
2. Scan `src/components/common/` → list reusable molecules.
3. Scan `src/pages/Tours/components/` → check similar organisms.
4. Chỉ tạo mới khi KHÔNG có component phù hợp.

### 4.2 Build Atoms (nếu cần tạo mới)
5. Atoms = smallest building blocks:
   - Button variants, Input types, Badge/StatusBadge, Skeleton, Avatar
6. Placement: `src/components/ui/<ComponentName>.tsx`
7. Props interface rõ ràng, typed, no `any`.
8. Export named export (KHÔNG default export cho atoms).

### 4.3 Build Molecules
9. Molecules = atoms kết hợp:
   - SearchBar = Input + Button + Icon
   - FormField = Label + Input + ErrorMessage
   - FilterRow = Select + DatePicker + Reset
10. Placement: `src/components/common/<Shared>.tsx` (nếu dùng >= 2 features)
    hoặc `src/pages/<Feature>/components/<Molecule>.tsx` (nếu feature-specific).

### 4.4 Build Organisms
11. Organisms = molecules + phức tạp hơn:
    - DataTable = Header + Rows + Pagination + Sort + Actions
    - FilterPanel = SearchBar + Filters + Apply/Reset
    - ModalForm = Dialog + Form + Submit/Cancel
    - StatsCard = Icon + Value + Label + Trend
12. Placement: `src/pages/<Feature>/components/<Organism>.tsx`

### 4.5 Compose Template
13. Compose organisms thành page sections trong `src/pages/<Feature>/index.tsx`.

### 4.6 States via Props
14. Implement states qua props:
    - `isLoading` → render Skeleton (KHÔNG spinner)
    - `isEmpty` → render EmptyState / "No data available" message
    - `error` → render error message hoặc empty state với retry
    - Hover/Focus: Tailwind transition classes

## 5) Strict Rules
- **Reuse first**: KHÔNG tạo component mới nếu đã có tương đương.
- **Typed props**: mỗi component PHẢI có interface/type Props.
- **No data fetching**: components chỉ nhận data qua props.
- **Icons**: lucide-react (CHÍNH), react-icons (PHỤ) — KHÔNG dùng icon set khác.
- **Loading = Skeleton**: KHÔNG dùng full-page spinner thay cho skeleton.
- **No `any`**: dùng `unknown` + narrowing nếu cần.
- **i18n**: text props nhận string đã translated (không gọi `t()` trong atom).

## 6) Output specification
- `src/components/ui/<NewAtom>.tsx` (shared atoms nếu cần)
- `src/components/common/<Shared>.tsx` (shared molecules nếu dùng >= 2 features)
- `src/pages/<Feature>/components/<Component>.tsx` (feature components)

## 7) Control
Đối chiếu `checklist.md` và report Pass/Fail.
