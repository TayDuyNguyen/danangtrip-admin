# UI Spec: Chỉnh sửa Bài viết Blog (BlogPostEdit)

> Feature slug: `admin_blog_posts_edit`
> Date: 2026-05-27
> Source analysis: `2026-05-27__admin_blog_posts_edit__screen-analysis.md`

---

## 1) Summary
- Mục tiêu: Triển khai giao diện chỉnh sửa bài viết Blog đồng bộ cấu trúc layout với màn hình tạo mới, đồng thời tích hợp thêm các thẻ thông tin nâng cao và quick actions.
- Người dùng: Quản trị viên (Admin) và Nhân viên (Staff).

## 1.1) UI Delivery Goal
- Trực quan hóa dữ liệu bài viết cũ một cách nhanh chóng khi tải trang.
- Thành phần above-the-fold: Sticky Page Header với breadcrumb, tiêu đề bài viết và các nút hành động (Hủy, Xem bài viết, Lưu thay đổi). Cột trái chứa Tiêu đề và Slug.

## 2) Component Matrix
### [REUSE]
| Component | Path | Why reuse | Notes |
|---|---|---|---|
| `BlogMarkdownEditor` | `src/pages/Blog/BlogPostCreate/components/BlogMarkdownEditor.tsx` | Biên soạn nội dung blog dạng Markdown | Giữ nguyên prop interfaces |
| `UnsavedChangesGuard` | `src/components/common/UnsavedChangesGuard.tsx` | Chặn chuyển hướng khi form thay đổi chưa lưu | Cấp `isDirty` prop |
| `SectionHeader` | `src/components/common/SectionHeader.tsx` | Hiển thị Header cho các phân mục trong form | Kế thừa style đồng nhất |

### [NEW]
| Component | Layer | Purpose | Expected Props |
|---|---|---|---|
| `BlogPostEdit` | Page (Organism) | Trang chính quản trị logic truy xuất API bài viết và điều phối các card tác vụ. | — |
| `BlogPostForm` | Organism | Chứa toàn bộ giao diện form điền sẵn dữ liệu cũ, xử lý submit cập nhật. | `isEdit: boolean; initialData: BlogPostViewModel; onSuccess?: () => void;` |
| `FeaturedImageUploader` | Molecule | Đăng tải và hiển thị ảnh đại diện bài viết với overlay "Ảnh hiện tại". | `value?: string \| null; onChange: (url: string \| null) => void;` |

### [MOD]
Không có component dùng chung nào cần sửa đổi.

## 3) UI States
| Component | Loading | Empty | Error | Success | Disabled |
|---|---|---|---|---|---|
| `BlogPostEdit` Page | Skeletons hiển thị cho form tiêu đề, editor, và sidebar card. | N/A | Báo lỗi: "Không tìm thấy bài viết" + nút quay lại. | Khởi tạo form dữ liệu | N/A |
| `BlogPostForm` | Button lưu bị vô hiệu hóa và hiển thị spinner. | N/A | Validation error text màu đỏ dưới mỗi field. | Hiện toast thành công | Vô hiệu hóa toàn bộ nút khi đang submit. |
| `FeaturedImageUploader`| Hiển thị Spinner khi đang tải ảnh lên Cloudinary. | N/A | Toast lỗi upload ảnh | Hiển thị preview ảnh | Vô hiệu hóa tương tác khi đang upload. |

## 3.1) Interaction Notes
| Component | Hover / Focus | Click / Expand | Notes |
|---|---|---|---|
| Slug input / alert | Focus: hiện đường viền xanh `#14B8A6`. | Khi sửa đổi: Hiện warning alert màu vàng cam ở chân input. | BR-01 |
| Quick Actions | Hover: Border và text đổi sang màu xanh `#0066CC` hoặc đỏ nhạt `#FEE2E2` (đối với nút Xóa). | Click: Mở Tab mới (Xem bài viết), Xác nhận nhân bản (Duplicate), Xác nhận xóa (Delete). | Admin có quyền xóa, Staff bị disable hoặc ẩn nút xóa. |
| Featured Image Overlay | N/A | Nút "Thay đổi" mở File Picker, "Xóa" gỡ bỏ ảnh. | Overlay luôn hiển thị cố định ở chân ảnh. |

## 4) Responsive Notes
| Breakpoint | Behavior | Notes |
|---|---|---|
| Mobile | Layout chuyển thành 1 cột. Các nút chính (Cập nhật, Hủy) được hiển thị cố định ở đáy màn hình dưới dạng Floating Mobile Bar để cải thiện trải nghiệm trên điện thoại di động. | Tận dụng tối đa không gian dọc |
| Tablet | Layout 1 cột. Sidebar xếp chồng xuống cuối trang. | Phản hồi tự động |
| Desktop | Layout 2 cột: Cột nội dung (65%) + Sidebar (320px). Header cố định ở vị trí trên cùng. | Bố cục chuẩn admin panel |

## 5) Files Expected To Change
- `src/pages/Blog/BlogPostEdit/index.tsx` [NEW]
- `src/pages/Blog/BlogPostEdit/components/BlogPostForm.tsx` [NEW]
- `src/pages/Blog/BlogPostEdit/components/FeaturedImageUploader.tsx` [NEW]

## 6) Build Order
1. Atoms: Cấu trúc khoá ngôn ngữ (i18n) cho Edit page.
2. Molecules: Xây dựng `FeaturedImageUploader` có phần overlay chân ảnh.
3. Organisms: Hoàn thiện `BlogPostForm` cho chỉnh sửa.
4. Page assembly: Tạo page container `BlogPostEdit` kết nối dữ liệu và liên kết routing.
