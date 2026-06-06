# API Contract: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Date Locked:** `2026-05-28`

## 1. Endpoints

Các API quản lý danh mục Blog trong `endpoints.ts`:
- **Lấy danh sách:** `GET /admin/blog-categories` -> Map to `API_ENDPOINTS.BLOG.CATEGORIES`
- **Tạo mới:** `POST /admin/blog-categories` -> Map to `API_ENDPOINTS.BLOG.CREATE_CATEGORY`
- **Cập nhật:** `PUT /admin/blog-categories/{id}` -> Map to `API_ENDPOINTS.BLOG.UPDATE_CATEGORY(id)`
- **Xóa:** `DELETE /admin/blog-categories/{id}` -> Map to `API_ENDPOINTS.BLOG.DELETE_CATEGORY(id)`

## 2. Models & Data Types

### Raw API Model (`RawBlogCategory`)
```typescript
export interface RawBlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    posts_count?: number; // Số lượng bài viết của danh mục
}
```

### UI View Model (`BlogCategoryViewModel`)
```typescript
export interface BlogCategoryViewModel {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: 'active' | 'inactive';
    postCount?: number; // Ánh xạ từ posts_count
}
```

## 3. Data Flow / React Query Hooks

- **Query Hook:** `useBlogCategoriesQuery()`
  - Key: `['blogs', 'categories']`
  - Mapper: `mapBlogCategory`
- **Mutations:**
  - `useCreateBlogCategoryMutation()`: Gửi `CreateBlogCategoryPayload`, invalidate cache danh mục.
  - `useUpdateBlogCategoryMutation()`: Gửi `id` và `CreateBlogCategoryPayload`, invalidate cache danh mục.
  - `useDeleteBlogCategoryMutation()`: Gửi `id` để xóa danh mục, invalidate cache danh mục.
