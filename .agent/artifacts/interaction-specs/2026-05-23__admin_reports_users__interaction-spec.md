# Interaction Spec: Admin Users Report (`admin_reports_users`)

> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> Source hooks: `src/hooks/useReportQueries.ts`

---

## 1) Main User Actions
| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| **Lọc Năm (Apply Filter)** | Click "Áp dụng" after changing Year dropdown | `useUsersReportQuery` | Data updates in AreaChart and table. URL updates to `?year=YYYY` | Sonner toast if year is invalid: "Năm lọc không hợp lệ" |
| **Xuất Excel (Export Excel)** | Click "Xuất Excel" button in header | `exportUsersMutation` | Downloads `users_YYYYMMDD_HHMMSS.xlsx`. Sonner success toast: "Xuất dữ liệu thành công!" | Sonner error toast: "Có lỗi xảy ra khi xuất báo cáo." |
| **Kích hoạt Mock Mode** | Click "Dữ liệu mẫu" (Sparkles) button | Local component state | Sonner success toast: "Đã chuyển sang chế độ dữ liệu mẫu." / "Đã chuyển sang chế độ dữ liệu thực." | N/A |

---

## 1.1) Action Priority
| Action | Priority | Why |
|---|---|---|
| **Lọc Năm (Apply Filter)** | High | Core analytics utility for tracking user signups in specific calendar periods |
| **Xuất Excel (Export Excel)** | High | Standard business operations requirement for local reporting |
| **Kích hoạt Mock Mode** | Medium | Critical visual fallback if backend is down or not fully aligned |

---

## 2) Forms
*No complex forms exist on this screen. Validation is performed directly on the dropdown filter bar input boundaries.*

---

## 3) Filters / Search / Pagination
| Control | State Source | Sync URL | Debounce | Notes |
|---|---|---|---|---|
| **Bộ chọn Năm (Year Selector)** | Component State / Search Params | Yes (`?year=YYYY`) | None (Direct apply trigger) | Controls visualization datasets |
| **Bộ chọn Role (Role Selector)** | Component State / Search Params | Yes (`?role=role`) | None (Direct apply trigger) | Controls export scope |
| **Bộ chọn Status (Status Selector)** | Component State / Search Params | Yes (`?status=status`) | None (Direct apply trigger) | Controls export scope |

---

## 3.1) Default Values / Reset Logic
| Control | Default Value | Reset Behavior | Notes |
|---|---|---|---|
| **Bộ chọn Năm** | Current Year (e.g. `2026`) | Resets to current calendar year | Triggers refetch |
| **Bộ chọn Role** | `'all'` | Resets to `'all'` | Synced with URL |
| **Bộ chọn Status** | `'all'` | Resets to `'all'` | Synced with URL |

---

## 4) Confirm / Destructive Actions
*No destructive actions (e.g. delete, bulk toggle) exist on this reporting dashboard screen.*

---

## 4.1) Loading / Pending Behavior
| Action | Pending UI | Disabled Elements | Notes |
|---|---|---|---|
| **Tải báo cáo** | PULSING skeletons on KPI cards, chart box, and table grid | Year, Role, Status dropdowns, Apply & Reset buttons, and Export button | Direct loading state sync |
| **Xuất báo cáo Excel** | Spinner inside "Xuất Excel" button | Export button disabled | Prevent multiple parallel download streams |

---

## 5) i18n Keys To Add
### Vietnamese translation namespace (`public/lang/vi/users_report.json`)
```json
{
  "title": "Báo cáo Người dùng",
  "subtitle": "Theo dõi tăng trưởng đăng ký người dùng mới, phân bổ trạng thái và xuất báo cáo dữ liệu chuyên nghiệp",
  "breadcrumb": {
    "home": "Trang chủ",
    "reports": "Báo cáo & Thống kê",
    "current": "Báo cáo Người dùng"
  },
  "filter": {
    "year_label": "Năm Báo Cáo",
    "year_value": "Năm {{year}}",
    "role_label": "Vai Trò (Xuất)",
    "role_all": "Tất cả vai trò",
    "role_admin": "Quản trị viên",
    "role_user": "Người dùng",
    "status_label": "Trạng Thái (Xuất)",
    "status_all": "Tất cả trạng thái",
    "status_active": "Hoạt động",
    "status_banned": "Bị khóa",
    "tip_text": "* Lưu ý: Bộ lọc Năm kiểm soát biểu đồ. Vai Trò/Trạng Thái chỉ áp dụng khi Xuất Excel.",
    "btn_reset": "Đặt lại",
    "btn_apply": "Áp dụng",
    "toast_reset": "Đã đặt các bộ lọc về mặc định.",
    "validation": {
      "year_invalid": "Năm lọc không hợp lệ (chỉ nhận số từ 2000 đến 2027)."
    }
  },
  "stats": {
    "new_users": "Người dùng mới",
    "active_year": "Năm chọn",
    "total_users": "Tổng số người dùng",
    "active_rate": "Tỉ lệ hoạt động",
    "status_na": "Nguồn khác",
    "na_label": "Xem Dashboard",
    "gap_tooltip": "Chỉ số này được thống kê tổng quan ở Bảng Điều Khiển chính."
  },
  "charts": {
    "growth_title": "Tăng trưởng người dùng mới",
    "growth_subtitle": "Thống kê số lượng tài khoản đăng ký mới theo từng tháng",
    "no_data": "Không có dữ liệu tăng trưởng mới trong năm này",
    "users_label": "Người dùng mới đăng ký",
    "legend_users": "Số lượng đăng ký mới"
  },
  "table": {
    "title": "Chi tiết tăng trưởng",
    "subtitle": "Bảng tổng hợp chi tiết số đăng ký mới và tổng lũy kế tích lũy theo tháng",
    "total_rows": "Tổng số {{count}} tháng",
    "header_month": "Tháng",
    "header_new_users": "Đăng ký mới",
    "header_cumulative": "Tổng lũy kế trong năm",
    "no_data_title": "Bảng số liệu trống",
    "no_data_desc": "Không có thống kê chi tiết người dùng mới trong năm được chọn."
  },
  "export": {
    "btn_label": "Xuất Excel",
    "toast_loading": "Đang chuẩn bị file xuất báo cáo người dùng...",
    "toast_success": "Đã xuất báo cáo danh sách người dùng thành công!",
    "toast_error": "Lỗi khi xuất danh sách người dùng.",
    "toast_mock_loading": "Đang giả lập xuất báo cáo người dùng mẫu...",
    "toast_mock_success": "Đã tải xuống tệp dữ liệu mẫu thành công!"
  },
  "mock": {
    "mock_on": "Dữ liệu mẫu: Bật",
    "mock_off": "Dữ liệu mẫu: Tắt",
    "toggle_title": "Bật/Tắt chế độ dữ liệu mẫu",
    "toast_to_mock": "API báo cáo người dùng chưa sẵn sàng trên backend. Đã kích hoạt chế độ dữ liệu giả lập.",
    "toast_switched_mock": "Đã chuyển sang chế độ dữ liệu mẫu.",
    "toast_switched_real": "Đã chuyển sang chế độ dữ liệu thực từ API."
  },
  "error": {
    "load_failed": "Không thể tải báo cáo người dùng",
    "connection": "Lỗi kết nối API backend hoặc hệ thống chưa khởi chạy.",
    "retry_btn": "Thử lại",
    "use_mock_btn": "Dùng dữ liệu mẫu"
  },
  "month_short": {
    "1": "T1", "2": "T2", "3": "T3", "4": "T4", "5": "T5", "6": "T6",
    "7": "T7", "8": "T8", "9": "T9", "10": "T10", "11": "T11", "12": "T12"
  },
  "month_long": {
    "1": "Tháng 1", "2": "Tháng 2", "3": "Tháng 3", "4": "Tháng 4", "5": "Tháng 5", "6": "Tháng 6",
    "7": "Tháng 7", "8": "Tháng 8", "9": "Tháng 9", "10": "Tháng 10", "11": "Tháng 11", "12": "Tháng 12"
  },
  "month_long_label": {
    "1": "Tháng Một", "2": "Tháng Hai", "3": "Tháng Ba", "4": "Tháng Tư", "5": "Tháng Năm", "6": "Tháng Sáu",
    "7": "Tháng Bảy", "8": "Tháng Tám", "9": "Tháng Chín", "10": "Tháng Mười", "11": "Tháng Mười Một", "12": "Tháng Mười Hai"
  }
}
```

---

## 6) Risks / Open Questions
- **R-01 (URL Sync Loop):** Re-applying search parameter queries in a component render cycle can trigger infinite layout sync loops if not checked.
  - *Mitigation:* The `useEffect` parameter watcher strictly tracks dependencies via the `activeFilters` object values, preventing redundant trigger cascades.
