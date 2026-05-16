# Thống kê Màn hình — danangtrip-admin

> Cập nhật: 2026-05-14
> Tổng: 43 màn (16 done + 27 chưa triển khai)
> Thứ tự: từ trên xuống = thứ tự triển khai khuyến nghị

---

## Chú thích trạng thái

- ✅ DONE — Đã triển khai hoàn chỉnh
- 🔧 PARTIAL — Đã có nhưng thiếu tính năng
- ⬜ TODO — Chưa triển khai
- 📋 PLANNED — Feature planned, chưa có API backend

---

| # | Màn hình | Tài liệu | Trạng thái | Note |
|---|----------|----------|------------|------|
| | **MODULE: Auth** | | | |
| 1 | Login | — | ✅ DONE | `pages/Login` |
| | **MODULE: Dashboard** | | | |
| 2 | Dashboard Tổng quan | `docs/page/admin_dashboard.md` · `screen/3_Admin/01-Dashboard_Tong_Quan` | ✅ DONE | StatsCards, Charts, TopTours, RecentOrders |
| | **MODULE: Tours** | | | |
| 3 | Danh sách Tour | `docs/page/admin_tours_list.md` · `screen/3_Admin/09.1-Danh_Sach_Tour` | ✅ DONE | Full filter, pagination, API hooks |
| 4 | Tạo Tour | `docs/page/admin_tours_create.md` · `screen/3_Admin/09.2-Tao_Tour` | ✅ DONE | 692 dòng, SidebarCards, full form |
| 5 | Chỉnh sửa Tour | `docs/page/admin_tours_edit.md` · `screen/3_Admin/09.3-Chinh_Sua_Tour` | ✅ DONE | Reuse TourCreate layout |
| 6 | **Chi tiết Tour** | `docs/page/admin_tours_detail.md` · `screen/3_Admin/09.4-Chi_Tiet_Tour` | ⬜ TODO | **MÀN TIẾP THEO** — đóng module Tours 7/8 → 8/8 |
| 7 | Danh mục Tour | `docs/page/admin_tour_categories.md` · `screen/3_Admin/09.5-Danh_Muc_Tour` | ✅ DONE | Inline form, tourCategoryApi |
| 8 | Lịch khởi hành | `docs/page/admin_tour_schedules_list.md` · `screen/3_Admin/09.6-Lich_Khoi_Hanh` | ✅ DONE | scheduleApi + useScheduleQueries |
| 9 | Thêm lịch khởi hành | `docs/page/admin_tour_schedules_create.md` · `screen/3_Admin/09.7-Them_Lich_Khoi_Hanh` | ✅ DONE | |
| 10 | Chỉnh sửa lịch KH | `docs/page/admin_tour_schedules_edit.md` · `screen/3_Admin/09.8-Chinh_Sua_Lich_Khoi_Hanh` | ✅ DONE | |
| | **MODULE: Locations** | | | |
| 11 | Danh sách Địa điểm | `docs/page/admin_locations_list.md` · `screen/3_Admin/03.1-Quan_Ly_Dia_Diem` | ✅ DONE | locationApi + useLocationQueries |
| 12 | Tạo Địa điểm | `docs/page/admin_locations_create.md` · `screen/3_Admin/03.2-Tao_Dia_Diem_Moi` | ✅ DONE | Full pipeline artifacts (2026-05-11) |
| 13 | Chỉnh sửa Địa điểm | `docs/page/admin_locations_edit.md` · `screen/3_Admin/03.3-Chinh_Sua_Dia_Diem` | ✅ DONE | Full pipeline artifacts (2026-05-11) |
| 14 | Chi tiết Địa điểm | `docs/page/admin_locations_detail.md` · `screen/3_Admin/03.4-Chi_Tiet_Dia_Diem` | ✅ DONE | Full pipeline artifacts (2026-05-12) |
| | **MODULE: Categories** | | | |
| 15 | Danh mục Địa điểm | `docs/page/admin_location_categories.md` · *(thiếu prototype)* | ✅ DONE | categoryApi + useCategoryQueries (2026-05-12) |
| 16 | **Danh mục con** | `docs/page/admin_subcategories.md` · `screen/3_Admin/05.1-Danh_Muc_Con` | ⬜ TODO | Tab 2 cùng trang categories |
| | **MODULE: Users** | | | |
| 17 | **DS Người dùng** | `docs/page/admin_users_list.md` · `screen/3_Admin/04.1-Quan_Ly_Nguoi_Dung` | ⬜ TODO | Cần tạo userApi + useUserQueries |
| 18 | **Tạo Người dùng** | `docs/page/admin_users_create.md` · `screen/3_Admin/04.3-Tao_Nguoi_Dung` | ⬜ TODO | |
| 19 | **Chỉnh sửa Người dùng** | `docs/page/admin_users_edit.md` · `screen/3_Admin/04.2-Chinh_Sua_Nguoi_Dung` | ⬜ TODO | |
| 20 | **Chi tiết Người dùng** | `docs/page/admin_users_detail.md` · `screen/3_Admin/04.4-Chi_Tiet_Nguoi_Dung` | ⬜ TODO | |
| | **MODULE: Bookings** | | | |
| 21 | **DS Đơn hàng** | `docs/page/admin_bookings_list.md` · `screen/3_Admin/10.1-Danh_Sach_Don_Hang` | ⬜ TODO | Phụ thuộc Users module |
| 22 | **Chi tiết Đơn hàng** | `docs/page/admin_bookings_detail.md` · `screen/3_Admin/10.2-Chi_Tiet_Don_Hang` | ⬜ TODO | |
| | **MODULE: Payments** | | | |
| 23 | DS Giao dịch | `docs/page/admin_payments_list.md` · `screen/3_Admin/06.1-Danh_Sach_Giao_Dich` | ⬜ TODO | |
| 24 | Chi tiết Giao dịch | `docs/page/admin_payments_detail.md` · `screen/3_Admin/06.2-Chi_Tiet_Giao_Dich` | ⬜ TODO | |
| | **MODULE: Ratings** | | | |
| 25 | DS Đánh giá | `docs/page/admin_ratings_list.md` · `screen/3_Admin/07.3-Danh_Sach_Danh_Gia` | ⬜ TODO | |
| | **MODULE: Tags & Amenities** | | | |
| 26 | Tags & Tiện ích | `docs/page/admin_tags_amenities.md` · `screen/3_Admin/08.1-Tags_Tien_Ich` | ⬜ TODO | |
| | **MODULE: Blog** | | | |
| 27 | DS Bài viết | `docs/page/admin_blog_posts_list.md` · `screen/3_Admin/02.1-Danh_Sach_Bai_Viet` | ⬜ TODO | |
| 28 | Tạo Bài viết | `docs/page/admin_blog_posts_create.md` · `screen/3_Admin/11.2-Tao_Bai_Viet` | ⬜ TODO | |
| 29 | Chỉnh sửa Bài viết | `docs/page/admin_blog_posts_edit.md` · `screen/3_Admin/11.1-Chinh_Sua_Bai_Viet` | ⬜ TODO | |
| 30 | Duyệt Bài viết | *(cần tạo doc)* · `screen/3_Admin/02.2-Duyet_Bai_Viet` | ⬜ TODO | Moderator view |
| 31 | Danh mục Blog | `docs/page/admin_blog_categories.md` · `screen/3_Admin/11.3-Danh_Muc_Blog` | ⬜ TODO | |
| | **MODULE: Notifications** | | | |
| 32 | DS Thông báo | `docs/page/admin_notifications_list.md` · `screen/3_Admin/12.1-Danh_Sach_Thong_Bao` | ⬜ TODO | |
| 33 | Gửi Thông báo | `docs/page/admin_notifications_send.md` · `screen/3_Admin/12.2-Gui_Thong_Bao` | ⬜ TODO | |
| | **MODULE: Contacts** | | | |
| 34 | Liên hệ (Master-Detail) | `docs/page/admin_contacts.md` · `screen/3_Admin/13.1-Contact_Admin` | ⬜ TODO | Inbox-style layout |
| | **MODULE: Reports** | | | |
| 35 | Báo cáo Đơn hàng | `docs/page/admin_reports_bookings.md` · `screen/3_Admin/07.1-Bao_Cao_Don_Hang` | ⬜ TODO | |
| 36 | Báo cáo Doanh thu | `docs/page/admin_reports_revenue.md` · `screen/3_Admin/07.2-Bao_Cao_Doanh_Thu` | ⬜ TODO | |
| 37 | Báo cáo Đánh giá | `docs/page/admin_reports_ratings.md` · *(thiếu prototype)* | ⬜ TODO | |
| 38 | Báo cáo Địa điểm | `docs/page/admin_reports_locations.md` · *(thiếu prototype)* | ⬜ TODO | |
| 39 | Báo cáo Người dùng | `docs/page/admin_reports_users.md` · *(thiếu prototype)* | ⬜ TODO | |
| | **MODULE: Planned Features** | | | |
| 40 | Quản lý Khuyến mãi | `docs/page/admin_promotions.md` · *(thiếu prototype)* | 📋 PLANNED | Chưa có API backend |
| 41 | Landing Pages | `docs/page/admin_landing_pages.md` · *(thiếu prototype)* | 📋 PLANNED | Chưa có API backend |
| 42 | Cấu hình Website | `docs/page/admin_site_settings.md` · *(thiếu prototype)* | 📋 PLANNED | Chưa có API backend |
| | **System Pages** | | | |
| 43 | Page Not Found (404) | — | ✅ DONE | `pages/PageNotFound` |
| 44 | Error Page | — | ✅ DONE | `pages/ErrorPage` |

---

## Lộ trình triển khai

```
Sprint hiện tại:
  → #6  Tour Detail         (đóng module Tours)
  → #16 Subcategories       (đóng module Categories)

Sprint tiếp:
  → #17-20 Users CRUD       (mở module mới)
  → #21-22 Bookings         (luồng nghiệp vụ chính)

Sprint sau:
  → #23-24 Payments
  → #25 Ratings
  → #26 Tags
  → #27-31 Blog
  → #32-33 Notifications
  → #34 Contacts
  → #35-39 Reports
```
