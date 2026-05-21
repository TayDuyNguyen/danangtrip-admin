# UI Specification - Admin Dashboard

Detailed UI specification for the **Admin Dashboard** (`admin-dashboard`) in the `danangtrip-admin` repository. This document defines the visual layout, typographic scales, interactive states, design system tokens, and error-handling resilience mechanisms matching the aesthetic standards of `DESIGN.md`.

- **Feature Slug:** `admin-dashboard`
- **Primary Route:** `/dashboard` (Behind the authenticated admin/staff layout)
- **Role Permissions:** `🛡️ Admin / Staff` (Protected by `PrivateRoute`)
- **Date Audited:** 2026-05-21
- **Sources Used:**
  - [admin_dashboard.md](file:///D:/DATN/DATN_Document/docs/page/admin_dashboard.md)
  - [STACK_SKILLS_INDEX.md](file:///D:/DATN/danangtrip-admin/.agent/skills/STACK_SKILLS_INDEX.md)
  - [DESIGN.md](file:///D:/DATN/danangtrip-admin/DESIGN.md)
  - [StatsCards.tsx](file:///D:/DATN/danangtrip-admin/src/pages/Dashboard/components/StatsCards.tsx)
  - [DashboardCharts.tsx](file:///D:/DATN/danangtrip-admin/src/pages/Dashboard/components/DashboardCharts.tsx)
  - [TopToursTable.tsx](file:///D:/DATN/danangtrip-admin/src/pages/Dashboard/components/TopToursTable.tsx)
  - [RecentOrdersTable.tsx](file:///D:/DATN/danangtrip-admin/src/pages/Dashboard/components/RecentOrdersTable.tsx)

---

## 1. Information Hierarchy & Layout Architecture

The page layout follows a modern **Grid & Dashboard Widget System** with strict above-the-fold prioritization of key metrics, mid-tier analytical visualization, and below-the-fold granular tabular records.

```
┌────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB & HEADER:                                                  │
│  "Welcome back, [Admin Name] 👋"                                       │
│  [Export Excel Report (Teal Button)]   [Global Refresh (Slate Button)] │
├────────────────────────────────────────────────────────────────────────┤
│  ROW 1: Stats Summary Cards (Responsive Grid: 1 col -> 3 col -> 6 col) │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ...                │
│  │ Total Rev    │ │ Total Orders │ │ Total Users  │                    │
│  └──────────────┘ └──────────────┘ └──────────────┘                    │
├────────────────────────────────────────────────────────────────────────┤
│  ROW 2: Analytical Charts Section (Responsive Grid: 1 col -> 2 col)    │
│  ┌──────────────────────────────┐ ┌──────────────────────────────┐     │
│  │ Line: Daily Revenue Trend    │ │ Bar: Booking Status Counts   │     │
│  └──────────────────────────────┘ └──────────────────────────────┘     │
├────────────────────────────────────────────────────────────────────────┤
│  ROW 3: Secondary Analytical Charts (Responsive Grid: 1 col -> 2 col)  │
│  ┌──────────────────────────────┐ ┌──────────────────────────────┐     │
│  │ Area: User Growth Trend      │ │ Bar: Booking Volume Trend    │     │
│  └──────────────────────────────┘ └──────────────────────────────┘     │
├────────────────────────────────────────────────────────────────────────┤
│  ROW 4: Detailed Tabular Records (Stacked, Full Width)                 │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │ Top 5 Selling Tours Table (Rank, Thumbnail, Title, Revenue)        ││
│  └────────────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │ Recent Bookings Table (ID, Client, Tour, Value, Status, Page Controls││
│  └────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design System & Aesthetics Tokens

Following the aesthetic parameters specified in `DESIGN.md` (modeled after NovaEstate), the interface is engineered to evoke a highly premium, clean, and modern workspace.

*   **Color Palette (Teal Accent Focus):**
    *   **Primary Active Elements / Highlights:** `#14B8A6` (Teal)
    *   **Dark Accents & Primary Typography:** `#0F172A` (Slate 900)
    *   **Background Soft Tones:** `#dff7f4` (Light Teal), `#f4fce3` (Lime Soft), `#F8FAFC` (Slate 50)
    *   **Secondary Text:** `#64748B` (Slate 500)
*   **Typography:**
    *   Uses **Outfit / Inter** Google Fonts instead of default browser sans-serifs.
    *   Headers leverage `font-black` (900 weight) with tight letter tracking (`tracking-tighter`).
    *   Metric indicators use strict uppercase tracking spacing (`text-[10px] uppercase tracking-widest font-black`).
*   **Glassmorphic Border Treatment:**
    *   Widget borders use a delicate light border `border-slate-200/60` or `border-slate-100`.
    *   Card backgrounds employ pure white solid layers transitioning gracefully with hover shadows.
*   **Micro-Animations & Transitions:**
    *   Entrance: `animate-in fade-in duration-700 slide-in-from-bottom-4` applied to the primary container.
    *   Hover Lift: Metrics cards lift up cleanly (`hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`).
    *   Interactive Shrink: Buttons shrink slightly on click (`active:scale-95 duration-100`).
    *   Charts: Recharts lines, areas, and bars load using ease-out transitions (`animationDuration={800} animationEasing="ease-out"`).

---

## 3. Detailed Component Breakdown

### 3.1 Header & Control Bar
*   **Title & Greeting:**
    *   Greets the user by their dynamic full name: `Welcome back, {{name}} 👋` (retrieved from `useAuth` store).
    *   Displays current operational date context: `Wishing you a productive day. Here is your overview today.` (Vietnamese: `Chúc một ngày làm việc hiệu quả. Đây là tổng quan hôm nay của bạn.`).
*   **Action Triggers:**
    *   **Xuất báo cáo (Export Excel):** Dynamic Teal primary button (`bg-[#14b8a6] hover:bg-[#0f766e] text-white shadow-xl shadow-[#14b8a6]/20`). Displays a bounce-loading state when mutating (`useBookingsExportMutation`).
    *   **Làm mới (Global Refresh):** Deep Slate dark button (`bg-slate-900 hover:bg-black text-white shadow-slate-900/20`). Spins on active invalidation.

### 3.2 Stats Cards (`StatsCards.tsx`)
A grid of 6 aggregated cards summarizing transaction flow and active accounts:

| Metric | Subtitle / Label | Accent Scheme | Resilient Fallback / Note |
|---|---|---|---|
| **Total Revenue** | vs last period | `Teal bg-[#dff7f4] text-[#0f766e]` | Renders trend arrow up/down based on relative percentage. |
| **Total Orders** | From status counts | `Teal Soft bg-[#f4fce3] text-[#0f766e]` | Summarizes status values if bulk stats is loading. |
| **Total Users** | vs last period | `Slate bg-slate-50 text-slate-700` | Displays percentage delta with up/down arrows. |
| **Tours Sold** | vs last period | `Teal Soft bg-[#f4fce3] text-[#0f766e]` | Displays sales volume across active schedules. |
| **Pending Orders** | waiting processing | `Slate bg-slate-50 text-slate-700` | Pulls directly from status count endpoint. |
| **New Contacts** | unread messages | `Teal bg-[#dff7f4] text-[#0f766e]` | Static or fallback query driven unread mail count. |

### 3.3 Dashboard Charts Row (`DashboardCharts.tsx`)
An organism rendering 4 core analytical charts inside isolated glassmorphic card containers (`h-[400px]`):

1.  **Revenue Trend Chart (Line Chart):**
    *   Displays dynamic financial trajectories over day, week, month, or year.
    *   Leverages a custom linear gradient (`lineGrad` transitioning from `#14b8a6` to `#0f766e`) for a premium visual flow.
    *   Y-axis auto-formats currency values (e.g., `1 Tr.` or `100 K` VNĐ).
2.  **Booking Volume Trend Chart (Bar Chart):**
    *   Tracks booking volumes over 7, 30, or 90 days.
    *   Bars are colored in standard Teal `#14b8a6` with sleek top-rounded corners (`radius={[6, 6, 0, 0]}`).
    *   Dynamic bar sizes to prevent overlapping lines at higher time frames.
3.  **User Growth Chart (Area Chart):**
    *   Area fill utilizes a soft opacity gradient (`areaGrad` with `stopOpacity={0.25}` matching primary Teal).
    *   Visualizes new customer registrations grouped across the current year.
4.  **Order Status Allocation (Vertical Bar Chart):**
    *   Represents booking volumes grouped across statuses: *Completed* (Teal), *Confirmed* (Dark Slate), *Pending* (Light Slate), and *Cancelled* (Red).
    *   Interactive tooltips highlight actual count indexes.

### 3.4 Top Tours Index (`TopToursTable.tsx`)
*   Shows the top 5 revenue generators.
*   **Visual Rankings:** Highlights top ranks with aesthetic gradients:
    *   Rank 1: Teal background (`bg-[#dff7f4] text-[#14b8a6]`).
    *   Rank 2: Clean slate (`bg-slate-100 text-slate-600`).
    *   Rank 3: Ice blue (`bg-blue-100 text-[#0f766e]`).
*   **Thumbnails:** High-fidelity round-cornered image boxes (`w-12 h-9 rounded-xl`). On hover, images zoom in softly (`group-hover:scale-110 duration-500`) to increase interaction quality.

### 3.5 Recent Orders Table (`RecentOrdersTable.tsx`)
*   Renders paginated table logs with a minimum width layout (`min-w-[980px]`) supporting smooth native horizontal scroll on smaller viewports.
*   **Status Pills:** Gated with premium borders matching statuses:
    *   *Confirmed:* `bg-[#dff7f4] text-[#0f766e] border-[#ccfbf1]` + Check icon.
    *   *Pending:* `bg-[#f4fce3] text-[#0f766e] border-[#d9f99d]` + Clock icon.
    *   *Cancelled:* `bg-red-50 text-red-500 border-red-100` + X icon.
*   **Interactive Row Actions:** Triggers a smooth translation on the right-chevron cursor hover (`group-hover:translate-x-0.5 transition-all`).

---

## 4. UI States & Robust Error Recovery

To guarantee bulletproof client stability, every visual block is fully decoupled with granular state handlers:

| Component | Loading State | Empty State | Error State (Isolated Failure) | Success State |
|---|---|---|---|---|
| **Stats Grid** | 6 isolated pulse `Skeleton` cards (icon, text, trend blocks). | N/A (defaults to numerical `0`). | Renders isolated alert warning (`AlertCircle` icon + red warning tag). Page stays interactive. | Fades values in; translates numbers smoothly. |
| **Analytical Charts** | Card-sized grid skeletons mock coordinates and axes. | Renders centered `EmptyState` component with illustration. | Renders clean inline `ErrorWidget` with retry button. | Lines and columns render ease-out entry animations. |
| **Top Tours Table** | 5 tabular rows of custom rectangular skeletons. | Renders detailed list-empty state block. | Inline error panel with reload trigger inside the card block. | Lists ranks with hover transformations. |
| **Recent Bookings Table** | 8 rows of tabular pulse blocks with animated line pulses. | Displays standard custom `EmptyState` with booking vector. | Tabular warning widget containing a centralized refetch control. | Renders transaction logs with zebra striping and pagination active. |

---

## 5. Responsive Grid Layout Strategy

The dashboard adaptively snaps layouts across three primary device viewports:

*   **Mobile Viewport (< 768px):**
    *   Header title and button actions stack vertically (`flex-col gap-5`) with full-width action buttons.
    *   `StatsCards` collapse to a single-column block to avoid typographic squeezing.
    *   Charts scale to fit viewports, stacking in a strict vertical list.
    *   Tables mount inside an `overflow-x-auto` wrapper with horizontal touch physics active.
*   **Tablet Viewport (768px - 1024px):**
    *   `StatsCards` rearrange into a dual-column `grid-cols-2` structure.
    *   Tabular components preserve structural shapes with mild horizontal overflow enabled.
*   **Desktop Viewport (> 1024px):**
    *   Full-scale `grid-cols-3 xl:grid-cols-6` grid for metric metrics.
    *   Dual-column analytical grids (`grid-cols-1 xl:grid-cols-2`) for visual graphs.
    *   Smooth entry fades execute across all units.

---

## 6. Verification & Build Integrity

All UI files have been inspected at the source level. Structural prop configurations and styles are 100% compliant with React 19 standards:
*   [x] `StatsCards.tsx` -> Integrates `StatsCardsProps` properly; memoized to prevent redundant virtual DOM comparisons.
*   [x] `DashboardCharts.tsx` -> Configures responsive chart cells; sets `isAnimationActive` to true; whitelists custom labels.
*   [x] `TopToursTable.tsx` -> Graces missing rating variables cleanly without showing broken code.
*   [x] `RecentOrdersTable.tsx` -> Maps exact Tailwind v4 border classes to maintain status styles.
