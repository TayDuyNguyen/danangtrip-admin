# UI Specification: Báo cáo Đánh giá (Ratings Report)

- Feature Slug: `admin_reports_ratings`
- Target Route: `/admin/reports/ratings`
- Main Page Path: [index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Reports/RatingsReport/index.tsx)
- Last Updated: 2026-05-22

---

## 1. Overview Screen Structure

The screen is built as an interactive, fully responsive, glassmorphic dashboard panel aligned with the system's teal theme (based on `DESIGN.md` guidelines).

The layout contains five major segments:
1. **Header Block**: Title, Subtitle, Breadcrumbs, and "Xuất Excel" action.
2. **Filter Bar**: Date filters, status selector, and service type selector, plus quick-range buttons.
3. **Overview Stats Row**: Four summary metric cards showing total, pending, approved ratings, and average score.
4. **Interactive Data Charts Grid**: Visual distribution graphs using React Recharts.
5. **Detailed Review Moderation Table**: Paginated listings of raw reviews with metadata and action triggers.

---

## 2. Components Detail

### 2.1 Page Shell (`index.tsx`)
- Container padding is set to `p-6 md:p-8 max-w-7xl mx-auto space-y-6`.
- Features smooth entry transitions with Tailwind's `animate-in fade-in duration-300`.
- Implements state management for filters (URL synchronization) and coordinates Recharts/Axios loaders.

### 2.2 Report Filter Bar (`ReportFilterBar.tsx`)
- Date picker constraints: ensures start date `from` cannot exceed end date `to`.
- Select dropdown fields for `status` (`all`, `pending`, `approved`, `rejected`) and `type` (`all`, `location`, `tour`).
- Quick-range pills: 7 days, 30 days, 3 months, and this year. Recomputes absolute start/end values based on current calendar date.

### 2.3 Overview Stats Cards (`RatingStatsCards.tsx`)
- Displays four cards, each with left accent border indicators:
  - **Tổng đánh giá**: Teal (`#14b8a6`) with `MessageSquare` icon.
  - **Chờ duyệt**: Amber (`#F59E0B`) with `Clock` icon.
  - **Đã duyệt**: Emerald (`#10B981`) with `CheckCircle2` icon.
  - **Điểm trung bình**: Yellow (`#F59E0B`) with solid `Star` icon.
- Features dynamic trend indicators: positive percentages (`+X.X%`) appear in emerald green badges, negative percentages (`-X.X%`) in rose red, and flat rates in slate gray.
- Integrates glassmorphism hover animations (`hover:shadow-md hover:scale-[1.01] transition-all`).

### 2.4 Data Visualization Panels (`RatingsReportCharts.tsx`)
- Placed inside a 2-column grid layout for desktop, single column for tablet/mobile.
- **Xu hướng đánh giá**: `AreaChart` showing total and approved rating count over time. Leverages subtle gradient fills underneath active lines.
- **Phân bố số sao**: Compact, custom horizontal list displaying frequency and percentages for 1★ to 5★ ratings, using appropriate theme colors (e.g. green for 5★, red for 1★).
- **Trạng thái duyệt**: `PieChart` (Donut segment) featuring absolute review numbers inside the center ring, and custom color cells matching approval colors.
- **Theo loại hình dịch vụ**: `BarChart` comparing Locations versus Tours side-by-side (left axis: rating count, right axis: star score).

### 2.5 Detailed Moderation Table (`RatingsReportTable.tsx`)
- Visual structure:
  - Header column cells with uppercase tracking text.
  - Column 1: Reviewer avatar + full name.
  - Column 2: Service Target details (Type badge: Location/Tour + target name clickable).
  - Column 3: Star rating score (yellow stars).
  - Column 4: Comment snippet with tooltips or expansion.
  - Column 5: Creation date + time.
  - Column 6: Status badge (green `approved`, orange `pending`, red `rejected`).
  - Column 7: Moderation Action triggers (Approve icon, Reject icon, Delete icon).

---

## 3. Responsive Adaptations

- **Desktop (>= 1024px)**: Full side-by-side grid panels, horizontal filter bar, and 7-column table layout.
- **Tablet (768px - 1023px)**: Filters group into a 2x2 grid. Metric cards stack into 2 columns. Table adopts horizontal scrolling container.
- **Mobile (< 768px)**: Visual panels stack completely vertically. Stats row takes a 1x1 or 2x2 stack. Filter elements stack linearly. Custom mobile cards replace table rows where necessary, or use minimal scroll view.
