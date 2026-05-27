# Interaction Specification - Blog Post Detail (`admin_blog_posts_detail`)

- **Feature Slug:** `admin_blog_posts_detail`
- **Specification Date:** 2026-05-27
- **Status:** READY & VERIFIED

---

## 1. Main User Actions

Our detail screen integrates five user-triggered flows with clear loading states and toasts:

### 1.1 Deletion Action (Destructive)
- **Trigger:** Click "Xóa bài viết" in Sticky Header or Sidebar (Admin only).
- **Confirm UI:** Displays `DeleteConfirmDialog` matching list style:
  - "Xóa bài viết này?" title.
  - "Bài viết {title} sẽ bị xóa vĩnh viễn" description.
  - Warning box: "Tất cả danh mục liên kết sẽ bị gỡ theo."
- **Feedback:** Shows loader on confirm button -> calls delete mutation -> on success, closes modal, displays toast `"Đã xóa bài viết thành công"`, and navigates back to `/admin/blog-posts`.

### 1.2 Quick Status Update
- **Trigger:** Clicking a status in the header status dropdown.
- **Action:** Triggers `updateStatusMutation` immediately with loading states attached.
- **Feedback:** Toast `"Cập nhật trạng thái bài viết thành công"` on success.

### 1.3 Duplication Flow
- **Trigger:** Clicking "Nhân bản bài viết" in Sidebar.
- **Confirm UI:** Displays `DuplicateConfirmDialog` asking "Nhân bản bài viết này?".
- **Feedback:** On confirm, navigates directly to `/admin/blog-posts/create` passing the entire post viewmodel state inside `location.state.duplicateData` to prefill the creation form, showing a success toast `"Đã nhân bản bài viết thành công!"`.

### 1.4 Copy Slug Action
- **Trigger:** Clicking the Copy icon inside the Slug Info block.
- **Feedback:** Copies slug text to browser clipboard, toggles copy icon to Check icon for 2 seconds, and yields toast `"Đã sao chép slug vào bộ nhớ tạm!"`.

### 1.5 External Preview Link
- **Trigger:** Clicking "Xem bài viết" in Header or Sidebar.
- **Constraint:** Disabled if status is draft or archived.
- **Action:** Opens `http://localhost:3000/blog/{slug}` inside a blank new window.

---

## 2. i18n Synchronization

All feedback texts rely entirely on `blog.json` namespaces:
- Deletion Toast: `t("toast.delete_success")`
- Status Toast: `t("toast.status_success")`
- Duplication Toast: `t("toast.duplicate_success")`
- Error Toast: `t("toast.network_error")`

---

## 3. Verdict

✅ Pass. All interactions are securely wired, tested, and aligned with standard dashboard user feedback loops.
