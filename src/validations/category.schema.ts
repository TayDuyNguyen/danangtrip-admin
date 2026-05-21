import * as yup from 'yup';
import type { TFunction } from 'i18next';

/**
 * Schema for category form validation
 */
export const categorySchema = (t: TFunction) =>
    yup.object({
        name: yup
            .string()
            .required(t('validation.required', { field: t('categories.form.name') }))
            .max(50, t('validation.max_length', { max: 50 })),
        slug: yup
            .string()
            .required(t('validation.required', { field: t('categories.form.slug') }))
            .lowercase(t('validation.lowercase'))
            .matches(/^[a-z0-9-]+$/, t('validation.slug_invalid'))
            .max(60, t('validation.max_length', { max: 60 })),
        description: yup
            .string()
            .nullable()
            .max(1000, t('validation.max_length', { max: 1000 })),
        status: yup
            .string()
            .oneOf(['active', 'inactive'])
            .required(t('validation.required', { field: t('categories.form.status') })),
        sort_order: yup
            .number()
            .typeError(t('validation.number', { field: t('categories.form.order') }))
            .min(0, t('validation.positive', { field: t('categories.form.order') }))
            .default(0),
        image: yup.string().nullable().max(255, t('validation.max_length', { max: 255 })),
        icon: yup.string().nullable().max(50, t('validation.max_length', { max: 50 })).default('Map'),
        icon_background: yup
            .string()
            .nullable()
            .matches(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, t('validation.color_invalid'))
            .default('#E0F2FE'),
    });

/**
 * Type inferred from category schema
 */
export type CategoryFormValues = yup.InferType<ReturnType<typeof categorySchema>>;
