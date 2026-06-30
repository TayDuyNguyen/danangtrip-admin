import * as yup from 'yup';
import type { TFunction } from 'i18next';

/**
 * Schema for blog category form validation
 */
export const blogCategorySchema = (t: TFunction) =>
    yup.object({
        name: yup
            .string()
            .required(t('blog:category.validation.name_required'))
            .max(50, t('blog:category.validation.name_max')),
        slug: yup
            .string()
            .lowercase()
            .matches(/^[a-z0-9-]+$/, {
                message: t('blog:category.validation.slug_invalid'),
                excludeEmptyString: true,
            })
            .max(60, t('blog:category.validation.slug_max'))
            .optional(),
        description: yup
            .string()
            .nullable()
            .max(1000, t('blog:category.validation.description_max'))
            .optional(),
    });

/**
 * Type inferred from blog category schema
 */
export type BlogCategoryFormValues = yup.InferType<ReturnType<typeof blogCategorySchema>>;
