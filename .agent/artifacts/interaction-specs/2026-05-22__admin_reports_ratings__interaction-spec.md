# Interaction Specification: Báo cáo Đánh giá (Ratings Report)

- Feature Slug: `admin_reports_ratings`
- Target Route: `/admin/reports/ratings`
- Interaction Controllers: [ReportFilterBar.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Reports/RatingsReport/components/ReportFilterBar.tsx), [RatingsReportTable.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Reports/RatingsReport/components/RatingsReportTable.tsx)
- Last Updated: 2026-05-22

---

## 1. Filter Interactions

1. **Local State Sync**:
   - Inputs for dates, status, and service type update a local state buffer immediately as the user edits them. This prevents triggering parallel React Query refetches mid-selection.
   - Triggers: date changes (`onChange`), select dropdown selections.

2. **Validation on Apply**:
   - The user must click the **"Áp dụng"** button to submit the filters.
   - Validation Rule: If `from` is after `to`, the submission is blocked and an error toast is fired: `"Ngày bắt đầu không thể lớn hơn ngày kết thúc."` via `sonner`.
   - On valid submit, active filters state is committed, query is triggered, and pagination `page` is reset back to `1`.

3. **Resetting to Defaults**:
   - Clicking **"Mặc định"** immediately restores filters to:
     - `from`: first day of current month (e.g. `2026-05-01`).
     - `to`: today's date (e.g. `2026-05-22`).
     - `status`: `'all'`.
     - `type`: `'all'`.
   - Triggers a reset query and fires a toast feedback: `"Đã lập lại bộ lọc về mặc định."`.

4. **Quick Range Pills**:
   - Dynamic buttons compute standard offsets from the current system calendar:
     - **7 ngày**: `today - 7 days` to `today`.
     - **30 ngày**: `today - 30 days` to `today`.
     - **3 tháng**: `today - 3 months` to `today`.
     - **Năm nay**: January 1st of current year to `today`.
   - Automatically populates the input fields in the Filter Bar.

---

## 2. Moderation Action Triggers

Located inline within each row inside the ratings table:

1. **Approve Rating**:
   - Trigger: Green thumbs-up button click.
   - Action: Fires `approveMutation` patching backend state to `approved`.
   - Feedback: Displays toast `"Đã phê duyệt đánh giá thành công."`.

2. **Reject Rating**:
   - Trigger: Amber block/slash button click.
   - Action: Fires `rejectMutation` patching backend state to `rejected`.
   - Feedback: Displays toast `"Đã từ chối đánh giá thành công."`.

3. **Delete Rating**:
   - Trigger: Red trash bin button click.
   - Action: Displays a native confirmation modal (`window.confirm`) to prevent accidental data loss. On confirmation, fires `deleteMutation`.
   - Feedback: Displays toast `"Đã xóa đánh giá vĩnh viễn."`.

4. **Row Interactive State**:
   - The whole table enters an `isModerating` disabled state during active mutations to block double clicks or race conditions.

---

## 3. Spreadsheet Export Flow

- Trigger: **"Xuất Excel"** button click.
- State: Disabled when query loading, exporting, or if the report table has zero items.
- Operation: Executes `exportMutation` using `toast.promise` wrapper.
- Feedback states:
  - Loading: `"Đang chuẩn bị và xuất file Excel..."`
  - Success: `"Xuất báo cáo Excel thành công!"`
  - Error: `"Xuất file Excel thất bại. Vui lòng thử lại."`
