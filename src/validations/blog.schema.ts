import * as yup from "yup";
import type { TFunction } from "i18next";

export const createBlogPostSchema = (t: TFunction) => yup.object({
    title: yup.string()
        .required(t("blog:form.validation.title_required", { defaultValue: "Tiêu đề bài viết không được để trống" }))
        .max(255, t("blog:form.validation.title_max", { defaultValue: "Tiêu đề không được vượt quá 255 ký tự" })),

    content: yup.string()
        .required(t("blog:form.validation.content_required", { defaultValue: "Nội dung bài viết không được để trống" })),

    excerpt: yup.string()
        .nullable()
        .optional()
        .max(500, t("blog:form.validation.excerpt_max", { defaultValue: "Tóm tắt không được vượt quá 500 ký tự" })),

    featured_image: yup.string()
        .nullable()
        .optional(),

    category_ids: yup.array()
        .of(yup.number().required())
        .min(1, t("blog:form.validation.categories_required", { defaultValue: "Vui lòng chọn ít nhất một danh mục" }))
        .required(t("blog:form.validation.categories_required", { defaultValue: "Vui lòng chọn ít nhất một danh mục" })),

    status: yup.string()
        .oneOf(['draft', 'published', 'archived'])
        .default('draft'),

    published_at: yup.string()
        .nullable()
        .optional(),
});

export type CreateBlogPostInput = yup.InferType<ReturnType<typeof createBlogPostSchema>>;
