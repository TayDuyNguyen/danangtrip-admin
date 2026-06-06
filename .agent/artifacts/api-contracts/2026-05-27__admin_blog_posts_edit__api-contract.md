# API Contract: Chỉnh sửa Bài viết Blog (BlogPostEdit)

> Feature slug: `admin_blog_posts_edit`
> Date: 2026-05-27
> Backend base: `/api/v1`

---

## 1) Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/admin/blog-posts/:id` | jwt.auth + role:admin | Chi tiết bài viết blog |
| `PUT` | `/admin/blog-posts/:id` | jwt.auth + role:admin | Cập nhật thông tin bài viết blog |
| `PATCH`| `/admin/blog-posts/:id/status` | jwt.auth + role:admin | Cập nhật nhanh trạng thái bài viết |
| `DELETE`| `/admin/blog-posts/:id` | jwt.auth + role:admin | Xóa bài viết |
| `GET` | `/admin/blog-categories` | jwt.auth + role:admin | Lấy danh sách danh mục blog phục vụ lọc/chọn |
| `POST` | `/upload/image` | jwt.auth | Tải ảnh đại diện/ảnh inline editor |

---

## 1.1) Source References
- `api_list.md` section: CMS Blog Posts Management
- `src/constants/endpoints.ts` entries:
  - `API_ENDPOINTS.BLOG.LIST`
  - `API_ENDPOINTS.BLOG.CREATE`
  - `API_ENDPOINTS.BLOG.CATEGORIES`
  - `API_ENDPOINTS.BLOG.CREATE_CATEGORY`
  - `API_ENDPOINTS.BLOG.PATCH_STATUS(id)`
  - `API_ENDPOINTS.BLOG.DELETE(id)`
- Analysis file: `2026-05-27__admin_blog_posts_edit__screen-analysis.md`

## 2) Request Schemas

### Update Input
```ts
export interface UpdateBlogPostPayload {
    title?: string;
    content?: string;
    excerpt?: string | null;
    featured_image?: string | null;
    category_ids?: number[];
    status?: 'draft' | 'published' | 'archived';
    published_at?: string | null;
}
```

---

## 3) Response Shapes

### Detail Response
```json
{
  "code": 200,
  "message": "Retrieve blog post details successfully",
  "data": {
    "id": 12,
    "title": "Khám phá Bà Nà Hills trong ngày",
    "slug": "kham-pha-ba-na-hills-trong-ngay",
    "excerpt": "Bài viết chia sẻ kinh nghiệm du lịch Bà Nà Hills tự túc chi tiết từ đi lại, ăn uống tới vui chơi.",
    "content": "# Khám phá Bà Nà Hills...",
    "featured_image": "https://res.cloudinary.com/...",
    "author_id": 1,
    "view_count": 2400,
    "status": "published",
    "published_at": "2026-05-15 09:30:00",
    "created_at": "2026-05-15 09:30:00",
    "updated_at": "2026-05-27 14:22:00",
    "author": {
      "id": 1,
      "full_name": "Admin Duy Tây",
      "avatar": "https://res.cloudinary.com/..."
    },
    "categories": [
      {
        "id": 2,
        "name": "Kinh nghiệm du lịch",
        "slug": "kinh-nghiem-du-lich",
        "description": null,
        "image": null,
        "status": "active"
      }
    ]
  }
}
```

---

## 4) TypeScript Interfaces

### Raw (API shape - đã có trong `src/types/blog.ts`)
```ts
export interface RawBlogPostAuthor {
    id: number;
    full_name: string;
    avatar: string | null;
}

export interface RawBlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface RawBlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    featured_image: string | null;
    author_id: number;
    view_count: number;
    status: 'draft' | 'published' | 'archived';
    published_at: string | null;
    created_at: string;
    updated_at: string;
    author?: RawBlogPostAuthor | null;
    categories?: RawBlogCategory[];
}
```

### ViewModel (UI shape - đã có trong `src/types/blog.ts`)
```ts
export interface BlogPostAuthorViewModel {
    id: number;
    fullName: string;
    avatar: string | null;
}

export interface BlogCategoryViewModel {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: 'active' | 'inactive';
}

export interface BlogPostViewModel {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string | null;
    authorId: number;
    viewCount: number;
    status: 'draft' | 'published' | 'archived';
    publishedAt: Date | null;
    createdAt: Date;
    author: BlogPostAuthorViewModel | null;
    categories: BlogCategoryViewModel[];
}
```

---

## 5) Yup Schema (Tái sử dụng & Mở rộng trong `src/validations/blog.schema.ts`)
Chúng ta sẽ tái sử dụng lại `createBlogPostSchema` có sẵn vì cấu trúc dữ liệu gửi lên cho Edit và Create là tương đồng. Chúng ta sẽ đặt alias hoặc sử dụng trực tiếp:
```ts
export const updateBlogPostSchema = createBlogPostSchema;
export type UpdateBlogPostInput = CreateBlogPostInput;
```

---

## 6) Error Codes
| Code | Meaning | UI handling |
|------|---------|-------------|
| 422 | Validation error | Hiển thị thông điệp lỗi dưới từng input (Tiêu đề, danh mục, nội dung). |
| 404 | Not found | Hiển thị trang lỗi 404 tùy chỉnh với nút quay về trang danh sách. |
| 403 | Forbidden | Hiển thị thông báo Toast cảnh báo không có quyền thực hiện hành động. |
| 401 | Unauthorized | Chuyển hướng người dùng về trang đăng nhập (`/login`). |
| 500 | Server error | Hiển thị Toast lỗi hệ thống chung. |

---

## 7) Files Expected To Change
- `src/constants/endpoints.ts` (Thêm endpoints detail/update)
- `src/types/blog.ts` (Thêm UpdateBlogPostPayload)
- `src/api/blogApi.ts` (Thêm methods `getDetail` và `update`)
- `src/hooks/useBlogQueries.ts` (Thêm `useAdminBlogPostQuery` và `useUpdateBlogPostMutation`)
